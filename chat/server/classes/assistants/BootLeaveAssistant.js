const Err = require("../libs/IError.js");
const Assistant = require("../assistants/Assistant.js");
const ClientError = require("../objects/ClientError.js");
const Request = require("../objects/ClientRequest.js");
const Message = require("../objects/Message.js");
const Response = require("../objects/ClientResponse.js");
const Envelope = require("../objects/CrossIslandEnvelope.js");
const Metadata = require("../objects/Metadata.js");
const Logger = require("../libs/Logger");
const Events = require("../../../common/Events").Events;
const Internal = require("../../../common/Events").Internal;

class BootLeaveAssistant extends Assistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                crossIslandMessenger = Err.required(),
                vaultManager = Err.required()){
        super(historyManager);
        this.crossIslandMessenger = crossIslandMessenger;
        this.vaultManager = vaultManager;
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
            throw new Error("Boot request was not verified");
        }
        const metadata = JSON.parse(await self.hm.getLastMetadata(request.headers.pkfpSource));
        const client =metadata.body.participants[request.headers.pkfpSource];
        if(client.rights < 3){
            throw new Error("User has not enough rights to boot");
        }

        await self.crossIslandMessenger.send(new Envelope(metadata.body.topicAuthority.residence, request, client.residence));
    }

    async bootParticipantIncoming(envelope, self){
        console.log("\nbooting participant incoming received \n");
        let request = envelope.payload;
        let ta = self.topicAuthorityManager.getTopicAuthority(request.headers.pkfpDest);
        await ta.processBootRequest(request);
    }

    async leaveTopicOnBoot(envelope, self){
        console.log("I has been booted... leaving topic");
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
        let pkfp = request.body.topicPkfp;
        await self.vaultManager.deleteTopic(request.body.vaultId,
                                            pkfp,
                                            request.body.vaultNonce,
                                            request.body.vaultSign)

        const publicKey = await self.hm.getOwnerPublicKey(pkfp);
        if(!Request.isRequestValid(request, publicKey)){
            throw new Error("Boot request was not verified");
        }

        await self.hm.deleteTopic(request.headers.pkfpSource);
        //let response = new Response("delete_topic_success", request);
        let response = Message.makeResponse(request, "island", Internal.TOPIC_DELETED);
        response.body.vaultNonce = request.body.vaultNonce;
        response.body.vaultSign = request.body.vaultSign;
        response.body.topicPkfp = request.body.pkfp;
        Logger.debug("Topic has been deleted successfully. Sending notification to client", {cat: "topic_delete"})
        let session = self.sessionManager.getSessionByConnectionId(connectionID);
        session.broadcast(response);
    }


    /***Error handlers****/
    async crossIslandErrorHandler(envelope, self, err){
	try{
	    if(envelope.return){
            Logger.warn("Error processing return envelope: " + err);
            return;
	    }
	    Logger.warn("Boot/leave error: " + err + " returning envelope...");
	    await self.crossIslandMessenger.returnEnvelope(envelope);
	}catch(err){
	    Logger.error("FATAL ERROR: " + err, {stack: err.stack});
	}	
    }


    async clientErrorHandler(request, connectionID, self, err){
        try{
            Logger.warn("Error handling client request: " + err.message, {stack: err.stack, cat: "topic_delete"});
            let error = new ClientError(request, self.getClientErrorType(request.header.command) , "Internal server error");
            self.connectionManager.sendResponse(connectionID, error);
        }catch(fatalError){
            Logger.error("FATAL ERROR while handling client request: " + fatalError + " " + fatalError.stack, {cat: "topic_delete"});
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
        }, this.crossIslandErrorHandler)
    }
    /*****************************************************
     * ~END UTILS
     *****************************************************/
}

module.exports = BootLeaveAssistant;
