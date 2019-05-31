const Envelope = require("../objects/CrossIslandEnvelope.js");
const ClientError = require("../objects/ClientError.js");
const Err = require("../libs/IError.js");
const Request = require("../objects/ClientRequest.js");
const Response = require("../objects/ClientResponse.js");
const OutgoingPendingJoinRequest = require("../objects/OutgoingPendingJoinRequest.js");
const Invite = require("../objects/Invite.js");
const Util = require("../libs/ChatUtility.js");


class TopicJoinAssistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                crossIslandMessenger = Err.required(),
                connector = Err.required()) {

        this.connector = connector;
        this.crossIslandMessenger = crossIslandMessenger;
        this.connectionManager = connectionManager;
        this.sessionManager = sessionManager;
        this.hm = historyManager;
        this.topicAuthorityManager = topicAuthorityManager;
        this.subscribeToClientRequests(requestEmitter);
        this.subscribeToCrossIslandsMessages(crossIslandMessenger);
        this.pedningOutgoingJoinRequests = {};
    }

    /*****************************************************
     * INCOMING REQUEST HANDLERS
     *****************************************************/
    async joinTopicIncoming(envelope, self){
        console.log("Join topic incoming called");
        const request = Request.parse(envelope.payload);
        const invite = Invite.parse(request.body.inviteString);
        const topicAuthority = self.topicAuthorityManager.getTopicAuthority(invite.getPkfp());
        let newTopicData = await topicAuthority.joinByInvite(request.body.inviteString, request.body.invitee, envelope.origin)
        const response = new Response("join_topic_success", request);
        response.setAttribute("metadata", newTopicData.metadata);
        response.setAttribute("inviterNickname",   newTopicData.inviterNickname);
        response.setAttribute("inviterPkfp",   newTopicData.inviterPkfp);
        response.setAttribute("topicName",   newTopicData.topicName);
        const responseEnvelope = new Envelope(envelope.origin, response, envelope.destination);
        responseEnvelope.setResponse();
        console.log("Sending metadata!");
        await self.crossIslandMessenger.send(responseEnvelope);
    }

    /*****************************************************
     * ~END INCOMING REQUEST HANDLERS
     *****************************************************/


    /*****************************************************
     * OUTGOING REQUEST HANDLERS
     *****************************************************/

    async joinTopicOutgoing(request, connectionID, self){
        self.verifyOutgoingRequest(request);
        const hsData = await self.createHiddenService();

        const pendingJoinRequest = new OutgoingPendingJoinRequest(request.headers.pkfpSource,
            request.body.invitee.publicKey,
            hsData.serviceID,
            hsData.privateKey,
            connectionID);
        self.registerOutgoingPendingJoinrequest(pendingJoinRequest);
        await self.sendOutgoingRequest(request, pendingJoinRequest.hsid);
    }


    async finalizeTopicJoin(envelope, self){
        //Verify, save metadata, return new topic data to the client
        console.log("finalizeTopicJoin called");
        let response = envelope.payload;
        const pendingRequest = self.getOutgoingPendingJoinRequest(response.headers.pkfpSource);
        const metadata = response.body.metadata;

        const hsPrivateKeyEncrypted = Util.encryptStandardMessage(pendingRequest.hsPrivateKey, pendingRequest.publicKey);

        self.hm.initTopic(response.headers.pkfpSource,
            pendingRequest.publicKey,
            hsPrivateKeyEncrypted);
        await self.hm.initHistory(response.headers.pkfpSource, metadata);

        await self.connectionManager.sendResponse(pendingRequest.connectionId, response)
        console.log("Response sent to client");
    }

    /*****************************************************
     * ~END OUTGOING REQUEST HANDLERS
     *****************************************************/

    /*****************************************************
     * HELPERS
     *****************************************************/

    getOutgoingPendingJoinRequest(pkfp){
        if(this.pedningOutgoingJoinRequests[pkfp]){
            return this.pedningOutgoingJoinRequests[pkfp];
        }else{
            throw "Topic join error: pending join request not found!";
        }

    }

    verifyIncomingRequest(request){
        return Request.isRequestValid(request);
    }

    async sendOutgoingRequest(request = Err.required(),
                        inviteeResidence = Err.required){
        const dest = request.body.destination;
        const envelope = new Envelope(dest, request, inviteeResidence);
        await this.crossIslandMessenger.send(envelope);
    }

    registerOutgoingPendingJoinrequest(pendingRequest){
        this.pedningOutgoingJoinRequests[pendingRequest.pkfp] = pendingRequest;
    }

    verifyOutgoingRequest(request){
        Request.isRequestValid(request, request.body.invitee.publicKey, {
            pkfpSource: true,
            pkfpDest: true,
            bodyContent: ["inviteCode", "destination", "invitee"]
        })
    }

    createHiddenService(){
        return this.connector.createHiddenService()
    }



    //Subscribes to relevant client requests
    subscribeToClientRequests(requestEmitter){
        this.subscribe(requestEmitter, {
            //Handlers
            join_topic: this.joinTopicOutgoing

        }, this.clientRequestErrorHandler)
    }

    //Subscribes to relevant cross-island requests
    subscribeToCrossIslandsMessages(ciMessenger){
        this.subscribe(ciMessenger, {
            join_topic: this.joinTopicIncoming,
            return_join_topic: this.processJoinTopicError,
            join_topic_success: this.finalizeTopicJoin
        }, this.crossIslandErrorHandler)
    }




    /***** Error handlers *****/

    async processJoinTopicError(envelope, self){
        //Verify, save metadata, return new topic data to the client
        console.log("Join topic failed. Return envelope received");
        let response = envelope.payload;
        //const pendingRequest = self.getOutgoingPendingJoinRequest(response.headers.pkfpSource);
        console.log("Response sent to client");

    }

    clientRequestErrorHandler(request, connectionID, self, err){
        console.trace(err);
        try{
            let error = new ClientError(request, self.getClientErrorType(request.headers.command) , "Internal server error")
            self.connectionManager.sendResponse(connectionID, error);
        }catch(fatalError){
            console.log("Some big shit happened: " + fatalError + "\nOriginal error: " + err);
            console.trace(err)
        }
    }

    getClientErrorType(command){
        const errorTypes = {
            join_topic: "join_topic_error"
        };
        if (!errorTypes.hasOwnProperty(command)){
            throw "invalid error type"
        }
        return errorTypes[command];
    }

    async crossIslandErrorHandler(envelope, self, err){
        try{
            console.trace("Topic join request error: " + err);
            await self.crossIslandMessenger.returnEnvelope(envelope, err);
        }catch (fatalErr){
            console.trace("FATAL ERROR: " + fatalErr);
        }

    }
    /***** END Error handlers *****/


    /**
     * Generic subscribe function
     * @param emitter
     * @param handlers
     * @param errorHandler
     */
    subscribe(emitter = Err.required(),
              handlers = Err.required(),
              errorHandler = Err.required()){
        let self = this;
        Object.keys(handlers).forEach((command)=>{
            emitter.on(command, async(...args)=>{
                args.push(self);
                await self.handleRequest(handlers, command, args, errorHandler);
            })
        })
    }

    /**
     * Generic request handler
     * @param handlers - map of request-specific routines
     * @param command
     * @param args - array of arguments
     * @param errorHandler - request specific error handler
     * @returns {Promise<void>}
     */
    async handleRequest(handlers, command, args, errorHandler){
        try{
            await handlers[command](...args)
        }catch(err){
            args.push(err);
            await errorHandler(...args);
        }
    }


    /*****************************************************
     * ~END HELPERS
     *****************************************************/


}


module.exports = TopicJoinAssistant;