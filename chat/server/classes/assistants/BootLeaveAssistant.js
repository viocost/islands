const Err = require("../libs/IError.js");
const Assistant = require("../assistants/Assistant.js");
const ClientError = require("../objects/ClientError.js");
const Request = require("../objects/ClientRequest.js");
const Response = require("../objects/ClientResponse.js");
const Envelope = require("../objects/CrossIslandEnvelope.js");
const Metadata = require("../objects/Metadata.js");
const Logger = require("../libs/Logger");

class BootLeaveAssistant extends Assistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                crossIslandMessenger = Err.required()){
        super(historyManager);
        this.crossIslandMessenger = crossIslandMessenger;
        this.connectionManager = connectionManager;
        this.sessionManager = sessionManager;
        this.topicAuthorityManager = topicAuthorityManager;
        this.subscribeToClientRequests(requestEmitter);
        this.subscribeToCrossIslandsMessages(crossIslandMessenger);
    }

    /*****************************************************
     * HANDLERS
     *****************************************************/
    async bootParticipantOutgoing(request, connectionID, self){
        console.log("\nBOOTING PARTICIPANT\n");
        const publicKey = await self.hm.getOwnerPublicKey(request.headers.pkfpSource);
        if(!Request.isRequestValid(request, publicKey)){
            throw "Boot request was not verified";
        }
        const metadata = JSON.parse(await self.hm.getLastMetadata(request.headers.pkfpSource));
        const client =metadata.body.participants[request.headers.pkfpSource];
        if(client.rights < 3){
            throw "User has not enough rights to boot"
        }

        await self.crossIslandMessenger.send(new Envelope(metadata.body.topicAuthority.residence, request, client.residence));
    }

    async bootParticipantIncoming(envelope, self){
        console.log("\nBOOTING PARTICIPANT INCOMING RECEIVED \n");
        let request = envelope.payload;
        let ta = self.topicAuthorityManager.getTopicAuthority(request.headers.pkfpDest);
        await ta.processBootRequest(request)
    }

    async leaveTopicOnBoot(envelope, self){
        console.log("I was booted... leaving topic");
        let message = envelope.payload;
        let lastMetadata = Metadata.parseMetadata(await self.hm.getLastMetadata(message.headers.pkfpDest));
        if(!Request.isRequestValid(message, lastMetadata.body.topicAuthority.publicKey)){
            console.log("FALSE BOOT REQUEST");
            return;
        }

        lastMetadata = lastMetadata.seal();
        await self.hm.appendMetadata(lastMetadata.toBlob(), message.headers.pkfpDest);

        self.sessionManager.broadcastServiceMessage(message.headers.pkfpDest, message);
    }

    /**
     * Deletes topic history
     * @param request
     * @param connectionID
     * @param self
     * @returns {Promise<void>}
     */
    async deleteTopic(request, connectionID, self){
        Logger.debug("Deleting topic")
        const publicKey = await self.hm.getOwnerPublicKey(request.headers.pkfpSource);
        if(!Request.isRequestValid(request, publicKey)){
            throw "Boot request was not verified";
        }

        await self.hm.deleteTopic(request.headers.pkfpSource);
        let response = new Response("delete_topic_success", request);
        self.connectionManager.sendResponse(connectionID, response);
    }



    /***Error handlers****/
    async clientErrorHandler(request, connectionID, self, err){
        console.trace(err);
        try{
            let error = new ClientError(request, self.getClientErrorType(request.headers.command) , "Internal server error")
            self.connectionManager.sendResponse(connectionID, error);
        }catch(fatalError){
            Logger.error("Some big shit happened: " + fatalError + "\nOriginal error: " + err);
            console.trace(err)
        }
    }


    getClientErrorType(command){
        return command+"_error";
    }

    /*****************************************************
     * ~END HANDLERS
     *****************************************************/
    /*****************************************************
     * UTILS
     *****************************************************/
    subscribeToClientRequests(requestEmitter){
        this.subscribe(requestEmitter, {
            boot_participant: this.bootParticipantOutgoing,
            delete_topic: this.deleteTopic

        }, this.clientErrorHandler)
    }


    subscribeToCrossIslandsMessages(crossIslandMessenger){
        this.subscribe(crossIslandMessenger, {
            boot_participant: this.bootParticipantIncoming,
            u_booted: this.leaveTopicOnBoot
        }, this.clientErrorHandler)
    }
    /*****************************************************
     * ~END UTILS
     *****************************************************/
}

module.exports = BootLeaveAssistant;