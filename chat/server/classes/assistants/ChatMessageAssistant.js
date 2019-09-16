const Err = require("../libs/IError.js");
const CuteSet = require("cute-set");
const Envelope = require("../objects/CrossIslandEnvelope.js");
const Message = require("../objects/ChatMessage.js");
const ClientError = require("../objects/ClientError.js");
const Logger = require("../libs/Logger.js");
const Coordinator = require("../assistants/AssistantCoordinator.js");


class ChatMessageAssistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                crossIslandMessenger = Err.required()) {
        let self = this;
        this.appendQueue = {};
        this.crossIslandMessenger = crossIslandMessenger;
        this.connectionManager = connectionManager;
        this.sessionManager = sessionManager;
        this.hm = historyManager;
        this.topicAuthorityManager = topicAuthorityManager;
        this.subscribeToClientRequests(requestEmitter);
        this.subscribeToCrossIslandsMessages(crossIslandMessenger);
        Coordinator.on("metadata_synced", async (pkfp)=>{
            await this.processAppendQueue(pkfp, self);
        })
    }




    subscribeToClientRequests(requestEmitter){
        this.subscribe(requestEmitter, {
            //HANDLERS
            // delete_invite: this.deleteInviteOutgoing,
            broadcast_message: this.broadcastMessage,
            send_message: this.sendPrivateMessage
        }, this.clientErrorHandler)
    }

    subscribeToCrossIslandsMessages(ciMessenger){
        this.subscribe(ciMessenger, {
            //HANDLERS
            broadcast_message: this.processIncomingMessage,
            send_message: this.processIncomingMessage
        }, this.crossIslandErrorHandler)
    }



    async broadcastMessage(message, connectionId, self){
        let pkfp = message.headers.pkfpSource;
        Logger.debug("Broadcasting chat message", {
            pkfp: pkfp,
            msg: message.body.message
        });
        if(!self.sessionManager.isSessionActive(pkfp)){
            Logger.warn("Attempt to send a message without logging in", {
                pkfp: pkfp
            });
            throw "Login required";
        }

	if (message.body.message.length > 65535){
	    Logger.warn("Attempt to send message of length more than 65535 bytes. Actual length is " + message.body.message.length);
	    throw "Message is too long";
	}
	
        const metadata = JSON.parse(await self.hm.getLastMetadata(pkfp));
        const myPublicKey = metadata.body.participants[pkfp].publicKey;
        const verified = Message.verifyMessage(myPublicKey, message);
        if(!verified){
            Logger.warn("Broadcasting message error: signature is not valid!", {
                pkfp: pkfp
            });
            throw "Broadcasting message error: signature is not valid!" ;
        }

        const recipients = metadata.body.participants;
        await self.hm.appendMessage(message.body.message, pkfp);
        const myResidence = recipients[pkfp].residence;
        let a = new CuteSet(Object.keys(recipients));
        const recipientsPkfps = a.difference([pkfp]).toArray();

        let msgBlob = JSON.stringify(message);
        for(let participantPkfp of recipientsPkfps){
            let onionDest = recipients[participantPkfp].residence;
            let nMessage = new Message(msgBlob);
            nMessage.headers.pkfpDest = participantPkfp;
            let envelope = new Envelope (onionDest,nMessage, myResidence);
            await self.crossIslandMessenger.send(envelope);
            Logger.debug("Sending chat message",{
                pkfpSource: pkfp,
                pkfpDest: participantPkfp,
                onionDest: onionDest
            })
        }
        Logger.verbose("Message sent",{
            pkfpSource: pkfp
        });
        message.headers.response = "send_success";
        self.sessionManager.broadcastUserResponse(pkfp, message)
    }


    async sendPrivateMessage(message, connectionId, self){
        const metadata = JSON.parse(await self.hm.getLastMetadata(message.headers.pkfpSource));
        const recipient = metadata.body.participants[message.headers.pkfpDest];
        const sender = metadata.body.participants[message.headers.pkfpSource];
        const myPublicKey = sender.publicKey;
        if(!self.sessionManager.isSessionActive(message.headers.pkfpSource)){
            Logger.warn("Attempt to send a message without logging in", {
                pkfp: message.headers.pkfpSource
            });
            throw "Login required";
        }

	if (message.body.message.length > 65535){
	    Logger.warn("Attempt to send message of length more than 65535 bytes. Actual length is " + message.body.message.length);
	    throw "Message is too long";
	}
	
        const verified = Message.verifyMessage(myPublicKey, message);
        if(!verified){
            throw "Sending private message error: signature is not valid!";
        }
        let msgString = JSON.stringify(message);
        Logger.debug("Send message request verified", {
            origMsg: msgString
        });

        await self.hm.appendMessage(message.body.message, message.headers.pkfpSource);
        let envelope = new Envelope(recipient.residence, new Message(msgString), sender.residence);
        await self.crossIslandMessenger.send(envelope);
        message.headers.response = "send_success";
        self.sessionManager.broadcastUserResponse(sender.pkfp, message);
    }



    async processIncomingMessage(envelope, self){
        const message = envelope.payload;
	if(message.body.message.length > 65535){
	    Logger.warn("Incoming message exeeds length limit. Origin: " + evnelope.origin +
		       " Length: " + message.body.message.length);
	    return;
	}
        const chatMessage = JSON.parse(message.body.message);
		
        Logger.verbose("Received incoming chat message", {
            origResidence: envelope.origin,
            messageID: chatMessage.header.id,
            destResidence: envelope.destination,
            private: message.headers.private,
            pkfpSource: message.headers.pkfpSource,
            pkfpDest: message.headers.pkfpDest,
        });

        let authorPkfp = message.headers.pkfpSource;
        let myPkfp = message.headers.pkfpDest;
        const metadata = JSON.parse(await self.hm.getLastMetadata(myPkfp));
        if(!metadata.body.participants[authorPkfp]){
            Logger.warn("Incoming message: Author's pkfp is not registered in this topic.", {
                origResidence: envelope.origin,
                destResidence: envelope.destination,
                messageID: chatMessage.header.id
            });
            return
        }

        let authorPublicKey = metadata.body.participants[authorPkfp].publicKey;
        if(!message.headers.private){
            delete message.headers.pkfpDest;
        }

        if(!Message.verifyMessage(authorPublicKey, message)){
            Logger.warn("Message signature is invalid.", {
                origResidence: envelope.origin,
                destResidence: envelope.destination,
                messageID: chatMessage.header.id,
                signature: chatMessage.signature,
                msg: JSON.stringify(message)
            });
            return
        }

        await self.incomingMessageProcessAfterVerification(envelope, metadata, myPkfp);

    }

    async incomingMessageProcessAfterVerification(envelope,
                                                  currentMetadata,
                                                  pkfp,
                                                  enqueue = true) {
        const message = envelope.payload;
        const chatMessage = JSON.parse(message.body.message);
        if (this._metadataIdMatchesCurrent(currentMetadata.body.id, chatMessage.header.metadataID)) {
            await this.appendBroadcastIncomingMessage(pkfp, message);
        } else {
            await this._incomingMessageFindMetadataAndProcess(pkfp, envelope, enqueue);
        }
    }

    async _incomingMessageFindMetadataAndProcess(pkfp, envelope, enqueueAndLaunchMetaSync) {
        const message = envelope.payload;
        const chatMessage = JSON.parse(message.body.message);
        let oldMetadata = await this.hm.getMetadata(pkfp, chatMessage.header.metadataID);
        if (!oldMetadata) {
            if (enqueueAndLaunchMetaSync) { //Enqueue may be false if metadata sync was previously initialized for this message
                Logger.debug("Metadata unknown. Enqueueing message.");
                this.enqueueIncomingMessage(pkfp, envelope);
                this.initMetadataSync(pkfp);
            }else{
                Logger.warn("Incoming message processing error: metadata id is invalid", {
                    chatMessage: JSON.stringify(chatMessage),
                    pkfp: pkfp
                })
            }
        } else {
            //Send response your meta is outdated!
            await this.appendBroadcastIncomingMessage(pkfp, message, JSON.parse(oldMetadata).body.participants[pkfp].key);
            Coordinator.notify("send_metadata_outdated_note", {
                origin: envelope.destination,
                destination: envelope.origin,
                pkfpDest: message.headers.pkfpSource,
                pkfpSource: pkfp
            });
        }
    }

    _metadataIdMatchesCurrent(currentMetaId, messageMetaId){
        return currentMetaId === messageMetaId
    }
    async appendBroadcastIncomingMessage(pkfp, message, key){
        await this.hm.appendMessage(message.body.message, pkfp);
        this.sessionManager.broadcastChatMessage(pkfp, {message:message, key: key})
    }


    enqueueIncomingMessage(pkfp, message){
        if(this.appendQueue.hasOwnProperty(pkfp)){
            this.appendQueue[pkfp].push(message);
        } else {
            this.appendQueue[pkfp] = [message];
        }
    }

    initMetadataSync(pkfp){
        Logger.debug("Sending signal to launch metadata sync",  {pkfp: pkfp});
        Coordinator.notify("sync_metadata", pkfp);
    }

    async processAppendQueue(pkfp, self){
        Logger.debug("Processing append queue", {pkfp: pkfp})
        if(self.appendQueue.hasOwnProperty(pkfp) && self.appendQueue[pkfp].length > 0){
            let envelope;
            let currentMetadata = JSON.parse(await self.hm.getLastMetadata(pkfp));
            let promises = [];
            while (envelope = self.appendQueue[pkfp].shift()){
                 promises.push(self.incomingMessageProcessAfterVerification(envelope, currentMetadata, pkfp, false));
            }
            await Promise.all(promises);
        }
        Logger.debug("Append queue processed", {pkfp: pkfp})
    }

    notifyMetadataOutdated(envelope){
        Logger.info("Received message encrypted with outdated key", {
            origin: envelope.origin,
            destination: envelope.destination,
            command: Envelope.getOriginalPayload(envelope).headers.pkfpSource
        });
        let responseEnvelope = new Envelope(envelope.origin, envelope.payload, envelope.destination);
        responseEnvelope.setResponse();

    }


    /***** Error handlers *****/
    getClientErrorType(command){
	return command + "_error";
    }
    
    async clientErrorHandler(request, connectionID, self, err){
        try{
	    let msg = `Error handling client request: ${request}, conid: ${connectionID
} self: ${self} err: ${err.message}`;
            Logger.warn(msg ,{
                errorMsg: err.message,
                context: err.stack,
            });
            let error = new ClientError(request, self.getClientErrorType(request.headers.command) , err.message || err || "Unknown error");
            self.connectionManager.sendResponse(connectionID, error);
        }catch(fatalError){
            Logger.error("FATAL: Could nod handle client error.", {
                fatalError: fatalError.message,
                context: fatalError.stack,
            });
        }
    }

    async crossIslandErrorHandler(envelope, self, err){
        try{
            Logger.warn("Error handling incoming request",{
                errorMsg: err,
                context: err.stack,
                origin: envelope.origin,
                destination: envelope.destination,
                command: Envelope.getOriginalPayload(envelope).headers.command
            });

            await self.crossIslandMessenger.returnEnvelope(envelope, err);
        }catch(fatalError){
            Logger.error("FATAL: Could nod handle the error.", {
                envelope: JSON.stringify(envelope),
                originalError: err.message,
                fatalError: fatalError.message,
                context: fatalError.stack,

            })
        }

    }

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

}


module.exports = ChatMessageAssistant;
