const Envelope = require("../objects/CrossIslandEnvelope.js");
const ClientError = require("../objects/ClientError.js");
const Err = require("../libs/IError.js");
const Request = require("../objects/ClientRequest.js");
const Response = require("../objects/ClientResponse.js");
const OutgoingPendingJoinRequest = require("../objects/OutgoingPendingJoinRequest.js");
const Invite = require("../objects/Invite.js");
const Util = require("../libs/ChatUtility.js");
const Logger = require("../libs/Logger.js");

class TopicJoinAssistant {
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
        this.pendingOutgoingJoinRequests = {};
    }

    /*****************************************************
     * INCOMING REQUEST HANDLERS
     *****************************************************/

    async joinTopicIncoming(envelope, self) {
        Logger.debug("Join topic incoming request receives", {cat: "topic_join"});
        const request = Request.parse(envelope.payload);
        const invite = Invite.parse(request.body.inviteString);
        const topicAuthority = self.topicAuthorityManager.getTopicAuthority(invite.getPkfp());
        let newTopicData = await topicAuthority.joinByInvite(request.body.inviteString, request.body.invitee, envelope.origin);
        Logger.debug("Join topic request processed by topic authority", {cat: "topic_join"});
        const response = new Response("join_topic_success", request);
        response.setAttribute("metadata", newTopicData.metadata);
        response.setAttribute("inviterNickname", newTopicData.inviterNickname);
        response.setAttribute("inviterPkfp", newTopicData.inviterPkfp);
        response.setAttribute("topicName", newTopicData.topicName);
        const responseEnvelope = new Envelope(envelope.origin, response, envelope.destination);
        responseEnvelope.setResponse();
        Logger.debug("Sending metadata to the invitee", {cat: "topic_join"});
        await self.crossIslandMessenger.send(responseEnvelope);
    }

    /*****************************************************
     * ~END INCOMING REQUEST HANDLERS
     *****************************************************/


    /*****************************************************
     * OUTGOING REQUEST HANDLERS
     *****************************************************/

    async joinTopicOutgoing(request, connectionID, self) {
        Logger.debug("Sending outgoing topic join request", {cat: "topic_join"});
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


    /**
     * Called when join_topic_success response from other island is received.
     * It means that new user is now registered in the topic, and existing members are notified
     * The function initializes the topic and notifies the client
     * @param {CrossIslandEnvelope} envelope
     * @param {this} self
     */
    async finalizeTopicJoin(envelope, self) {
        //Verify, save metadata, return new topic data to the client
        try {
            Logger.debug("Finalize topic join.", {cat: "topic_join"});
            let response = envelope.payload;
            const pendingRequest = self.getOutgoingPendingJoinRequest(response.headers.pkfpSource);
            const metadata = response.body.metadata;
            const hsPrivateKeyEncrypted = Util.encryptStandardMessage(pendingRequest.hsPrivateKey, pendingRequest.publicKey);
            Logger.debug("Initializing topic locally", {cat: "topic_join"});
            self.hm.initTopic(response.headers.pkfpSource,
                pendingRequest.publicKey,
                hsPrivateKeyEncrypted);
            await self.hm.initHistory(response.headers.pkfpSource, metadata);
            Logger.debug("Sending response to client", {cat: "topic_join"});
            await self.connectionManager.sendResponse(pendingRequest.connectionId, response);
        } catch (err) {
            Logger.warn("Error finalizing topic join request: " + err + " " + err.stack, {cat: "topic_join"});
            await self.processJoinTopicError(envelope.payload, self, err);
        }

    }

    /*****************************************************
     * ~END OUTGOING REQUEST HANDLERS
     *****************************************************/

    /*****************************************************
     * HELPERS
     *****************************************************/

    getOutgoingPendingJoinRequest(pkfp) {
        if (this.pendingOutgoingJoinRequests[pkfp]) {
            return this.pendingOutgoingJoinRequests[pkfp];
        } else {
            throw new Error("Topic join error: pending join request not found!");
        }

    }

    verifyIncomingRequest(request) {
        return Request.isRequestValid(request);
    }

    async sendOutgoingRequest(request = Err.required(),
                              inviteeResidence = Err.required) {
        const dest = request.body.destination;
        const envelope = new Envelope(dest, request, inviteeResidence);
        await this.crossIslandMessenger.send(envelope);
    }

    registerOutgoingPendingJoinrequest(pendingRequest) {
        this.pendingOutgoingJoinRequests[pendingRequest.pkfp] = pendingRequest;
    }

    verifyOutgoingRequest(request) {
        Request.isRequestValid(request, request.body.invitee.publicKey, {
            pkfpSource: true,
            pkfpDest: true,
            bodyContent: ["inviteCode", "destination", "invitee"]
        });
    }

    createHiddenService() {
        return this.connector.createHiddenService();
    }


    //Subscribes to relevant client requests
    subscribeToClientRequests(requestEmitter) {
        this.subscribe(requestEmitter, {
            //Handlers
            join_topic: this.joinTopicOutgoing
        }, this.clientRequestErrorHandler);
    }

    //Subscribes to relevant cross-island requests
    subscribeToCrossIslandsMessages(ciMessenger) {
        this.subscribe(ciMessenger, {
            join_topic: this.joinTopicIncoming,
            return_join_topic: this.processJoinTopicErrorOnReturn,
            join_topic_success: this.finalizeTopicJoin
        }, this.crossIslandErrorHandler);
    }


    /***** Error handlers *****/
    /**
     * This function is called when return envelope received
     * from other island.
     */
    async processJoinTopicErrorOnReturn(envelope, self) {
        Logger.warn("Join topic failed. Return envelope received. Error: " + envelope.error, {cat: "topic_join"});
        let request = envelope;

        while(request.payload){
            request = request.payload;
        }

        await self.processJoinTopicError(request, self, envelope.error);
    }

    async processJoinTopicError(message, self, error = undefined) {
        try {
            const pendingRequest = self.getOutgoingPendingJoinRequest(message.headers.pkfpSource);
            let clientError = new ClientError(message,
                self.getClientErrorType(message.headers.command),
                error ? error : "unknown error");
            if (pendingRequest) {
                self.connectionManager.sendResponse(pendingRequest.connectionId, clientError);
                delete self.pendingOutgoingJoinRequests[message.headers.pkfpSorce];
            }
        } catch (err) {
            Logger.error("FATAL ERROR while processing join topic error: " + err + " " + err.stack, {cat: "topic_join"});
        }
    }

    clientRequestErrorHandler(request, connectionID, self, err) {
        console.trace(err);
        try {
            let error = new ClientError(request, self.getClientErrorType(request.headers.command), "Internal server error");
            self.connectionManager.sendResponse(connectionID, error);
        } catch (fatalError) {
            Logger.error("Some big shit happened: " + fatalError + "\nOriginal error: " + err, {cat: "topic_join"});
            console.trace(err);
        }
    }


    getClientErrorType(command) {
        const errorTypes = {
            join_topic: "join_topic_error"
        };
        if (!errorTypes.hasOwnProperty(command)) {
            throw new Error("invalid error type");
        }
        return errorTypes[command];
    }

    async crossIslandErrorHandler(envelope, self, err) {
        try {
            if (envelope.return) {
                Logger.error("Error handling return envelope: " + err + " stack: " + err.stack, {cat: "topic_join"});
                return;
            }
            Logger.warn("Topic join error: " + err + " returning envelope...", {cat: "topic_join"});
            await self.crossIslandMessenger.returnEnvelope(envelope, err);
        } catch (fatalErr) {
            Logger.error("FATAL ERROR" + fatalErr + " " + fatalErr.stack, {cat: "topic_join"});
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
              errorHandler = Err.required()) {
        let self = this;
        Object.keys(handlers).forEach((command) => {
            emitter.on(command, async (...args) => {
                args.push(self);
                await self.handleRequest(handlers, command, args, errorHandler);
            });
        });
    }

    /**
     * Generic request handler
     * @param handlers - map of request-specific routines
     * @param command
     * @param args - array of arguments
     * @param errorHandler - request specific error handler
     * @returns {Promise<void>}
     */
    async handleRequest(handlers, command, args, errorHandler) {
        try {
            await handlers[command](...args)
        } catch (err) {
            args.push(err);
            await errorHandler(...args);
        }
    }


    /*****************************************************
     * ~END HELPERS
     *****************************************************/


}


module.exports = TopicJoinAssistant;
