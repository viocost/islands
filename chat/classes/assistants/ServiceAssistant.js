const CuteSet = require("cute-set");
const Err = require("../libs/IError.js");
const Envelope = require("../objects/CrossIslandEnvelope.js");
const ServiceRecord = require("../objects/ServiceRecord.js");
const Request = require("../objects/ClientRequest.js");
const Response = require("../objects/ClientResponse.js");
const Message = require("../objects/Message.js");
const ServiceMessage = require("../objects/ServiceMessage.js");
const Metadata = require("../objects/Metadata.js");
const Logger = require("../libs/Logger.js");
const Coordinator = require("../assistants/AssistantCoordinator.js");


class ServiceAssistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                crossIslandMessenger = Err.required(),
                connector = Err.required()){
        let self = this;
        this.syncInProgress = new CuteSet();
        this.connector = connector;
        this.ciMessenger = crossIslandMessenger;
        this.connectionManager = connectionManager;
        this.sessionManager = sessionManager;
        this.hm = historyManager;
        this.topicAuthorityManager = topicAuthorityManager;
        this.subscribeToClientRequests(requestEmitter);
        this.subscribeToCrossIslandsMessages(this.ciMessenger);
        Coordinator.on("sync_metadata", async (pkfp)=>{
            await  self.requestMetadataSync(pkfp, self)
        });
        Coordinator.on("send_metadata_outdated_note", async (data)=>{
            await self.sendMetadataOutdatedNote(data, self)
        })
    }


    /*****************************************************
     * HANDLERS
     *****************************************************/

    async metadataIssue(envelope, self){
        Logger.verbose("Metadata issue received");
        let message = envelope.payload;
        let prevMeta  = Metadata.parseMetadata(await  self.hm.getLastMetadata(message.headers.pkfpDest));
        let taPublicKey = prevMeta.body.topicAuthority.publicKey;

        console.log("\nMetadata issue incoming, event: " + message.headers.event+"\n");
        if(!Request.isRequestValid(message, taPublicKey)){
            Logger.warn("Metadata issue error: issue signature is invalid", {
                origin: envelope.origin,
                destination: envelope.destination,
                payload: JSON.stringify(Envelope.getOriginalPayload(envelope))
            });
            return;
        }

        let newMetadata = Metadata.parseMetadata(message.body.metadata);
        newMetadata.setSettings(prevMeta.body.settings);
        await self.hm.appendMetadata(newMetadata.toBlob(), message.headers.pkfpDest);
        console.log("Metadata appended");
        self.sessionManager.broadcastServiceMessage(message.headers.pkfpDest, message);
        await self.registerMetadataUpdate(message, message.headers.pkfpDest);

    }

    async requestMetadataSync(pkfp, self){
        if(this.syncInProgress.has(pkfp)){
            Logger.debug("Sync a;ready in progress. Returning...", {pkfp: pkfp});
            return
        } else {
            this.syncInProgress.add(pkfp);
        }
        Logger.debug("Received metadata sync signal. Launching...", {pkfp: pkfp});
        self = self ? self : this;
        let metadata = JSON.parse(await self.hm.getLastMetadata(pkfp));
        let participant = metadata.body.participants[pkfp];
        let topicAuthority = metadata.body.topicAuthority;
        let request = new Request();
        request.setHeader("command", "meta_sync");
        request.setHeader("pkfpSource", participant.pkfp);
        request.setHeader("pkfpDest", topicAuthority.pkfp);
        request.body.lastMetaID = metadata.body.id;
        let envelope = new Envelope(topicAuthority.residence, request, participant.residence);
        envelope.setReturnOnFail(true);
        self.ciMessenger.send(envelope);
        Logger.silly("Sync request sent...", {pkfp: pkfp});
    }

    async sendMetadataOutdatedNote(data, self){
            let message = new ServiceMessage(data.pkfpSource, data.pkfpDest, "metadata_outdated");
            let envelope = new Envelope(data.destination, message, data.origin);
            await self.ciMessenger.send(envelope)
    }


    async runGlobalResync(){
        Logger.verbose("Starting global resync");
        let self = this;
        let historyIDs = await self.hm.getAllhistoryIDs();
        const promises = [];
        historyIDs.forEach(id =>{
            promises.push(self.requestMetadataSync(id))
        });
        await Promise.all(promises);
        Logger.verbose("Global resync initiated.")
    }

    async processMetadataOutdatedNote(envelope, self){
        let serviceMessage = envelope.payload;
        Logger.debug("Processing metadata outdated note");
        await self.requestMetadataSync(serviceMessage.headers.pkfpDest);
    }

    async processIncomingResyncRequest(envelope, self){
        console.log("received incoming metadata resync request");
        let request = envelope.payload;
        const topicAuthority = self.topicAuthorityManager.getTopicAuthority(request.headers.pkfpDest);
        let response = await topicAuthority.metadataSyncRequest(request)
        let responseEnvelope = new Envelope(envelope.origin, response, envelope.destination);
        responseEnvelope.setResponse();
        await self.ciMessenger.send(responseEnvelope);
    }


    async processMetaSyncResponse(envelope, self){
        Logger.verbose("Received metadata sync response");
        let response = envelope.payload;
        let lastMeta = JSON.parse(await self.hm.getLastMetadata(response.headers.pkfpSource));
        let publicKey = lastMeta.body.topicAuthority.publicKey;

        if(!Message.verify(response, publicKey)){
            Logger.warn("Invalid metadata sync response", {origin: envelope.origin, destination: envelope.destination})
        }

        let metadataRecords = JSON.parse(response.body.metadata).reverse();
        for(let record of metadataRecords){
            if(record.indexOf(lastMeta.id) !== -1){
                Logger.verbose("Metadata already appended. Resync aborted");
                return ;
            }
        }
        for(let record of metadataRecords){
            let metaRecord = Metadata.parseMetadata(record);
            metaRecord.setSettings(lastMeta.body.settings);
            await self.hm.appendMetadata(metaRecord.toBlob(), response.headers.pkfpSource);
        }

        response.body.metadata = metadataRecords[metadataRecords.length - 1];
        self.sessionManager.broadcastServiceMessage(response.headers.pkfpSource, response);
        Logger.info("Resync completed on "+response.headers.pkfpDest);
        self.syncInProgress.delete(response.headers.pkfpSource);
        Coordinator.notify("metadata_synced", response.headers.pkfpSource);
    }


    async registerMetadataUpdate(message, pkfp){
        let msg = await this.createSaveServiceRecord(pkfp, message.headers.event,
            this.generateMessageOnMetadataIssue(message));
        this.sessionManager.broadcastServiceRecord(pkfp, msg);
    }

    async registerInviteRequest(request, connectionID, self){
        let msg = await self.createSaveServiceRecord(request.headers.pkfpSource, request.headers.command, "Invite requested");
        self.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);
    }


    async processInviteRequestSuccess(envelope, self){
        let request = envelope.payload;
        let msg = await self.createSaveServiceRecord(request.headers.pkfpSource, request.headers.command, "Invite created successfully. Code: " + request.body.inviteCode);
        self.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);
    }

    async processInviteRequestError(envelope, self){
        let request = Envelope.getOriginalPayload(envelope);
        let msg = await self.createSaveServiceRecord(request.headers.pkfpSource, request.headers.command, "Invite request error: " + envelope.error);
        self.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);
    }

    async registerBootMemberRequest(request, connectionID, self){
        let msg = await self.createSaveServiceRecord(request.headers.pkfpSource, request.headers.command, "Boot requested for user " + request.body.pkfp +  " created successfully");
        self.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);
    }

    async registerBootNotce(envelope, self){
        let message = envelope.payload;
        let lastMetadata = Metadata.parseMetadata(await self.hm.getLastMetadata(message.headers.pkfpDest));
        if(!Request.isRequestValid(message, lastMetadata.body.topicAuthority.publicKey)){
            console.log("FALSE BOOT REQUEST");
            return;
        }
        let msg = await self.createSaveServiceRecord(message.headers.pkfpDest, "u_booted", "You have been excluded from this channel");
        self.sessionManager.broadcastServiceRecord(message.headers.pkfpSource, msg);
    }

    async registerSettingsUpdate(){
        Logger.debug("Settings update registered");
    }


    generateMessageOnMetadataIssue(message){
        if(message.headers.event === "new_member_joined"){
            return "Member " + message.body.nickname + " has joined the channel."
        }else if(message.headers.event === "member_booted"){
            return "Member id: " + message.body.bootedPkfp + " has left the channel."
        } else if(message.headers.response === "meta_sync_success"){
            return "Metadata has been synchronized.";
        }

    }


    async loadMoreMessages(request, connectionId, self){
        console.log("Load more messages called");
        let messages, metadataIDs;

        //Getting public key og the owner
        let publicKey = await self.hm.getOwnerPublicKey(request.headers.pkfpSource)

        if (!Request.isRequestValid(request, publicKey)){
            throw "Request was not verified";
        }

        let data = await self.hm.loadMoreMessages(request.headers.pkfpSource, request.body.lastLoadedMessageID);
        messages = data[0];
        metadataIDs = data[1];
        let allLoaded = data[2];

        let gatheredKeys  = await self.hm.getSharedKeysSet(metadataIDs, request.headers.pkfpSource)

        let response = new Response("load_more_messages_success", request );

        response.body.lastMessages = {
            messages: messages,
            keys: gatheredKeys,
            allLoaded: allLoaded
        };
        self.sessionManager.broadcastUserResponse(request.headers.pkfpSource, response);
    }



    async processIncomingNicknameRequest(envelope, self){
        return self.verifyAndForwardServiceMessage(envelope, self)
    }

    async processNicknameResponse(envelope, self){
        return self.verifyAndForwardServiceMessage(envelope, self)
    }


    async processIncomingNameChangeNote(envelope, self){
        return self.verifyAndForwardServiceMessage(envelope, self)
    }

    async verifyAndForwardServiceMessage(envelope, self, broadcast = false){
        Logger.debug("Received service message. Verifying and forwarding to ")
        let request = Envelope.getOriginalPayload(envelope);
        let pkfpDest = request.headers.pkfpDest;
        let metadata = Metadata.parseMetadata(await self.hm.getLastMetadata(pkfpDest));
        let senderPublicKey = metadata.body.participants[request.headers.pkfpSource].publicKey;
        if(!Request.isRequestValid(request, senderPublicKey)){
            delete request.headers.pkfpDest;
            if(!Request.isRequestValid(request, senderPublicKey)){
                Logger.warn("Invalid request", {
                    command: request.headers.command,
                    pkfpSource: request.headers.pkfpSource,
                    pkfpDest: pkfpDest
                });
                return;
            }
        }
        if(broadcast){
            self.sessionManager.broadcastServiceMessage(pkfpDest, request)
        }else{
            let destActiveSessions = self.sessionManager.getActiveUserSessions(pkfpDest);
            if (destActiveSessions.length > 0){
                self.sessionManager.sendServiceMessage(destActiveSessions[0].getConnectionID(), request)
            }
        }
    }

    async processStandardNameExchabgeRequest(request, connectionId, self){
        Logger.debug("Sending name request", {
            pkfpSource: request.headers.pkfpSource,
            pkfpDest: request.headers.pkfpDest
        });
        const metadata = JSON.parse(await self.hm.getLastMetadata(request.headers.pkfpSource));
        const recipient = metadata.body.participants[request.headers.pkfpDest];
        const sender = metadata.body.participants[request.headers.pkfpSource];
        const myPublicKey = sender.publicKey;
        if(!self.sessionManager.isSessionActive(request.headers.pkfpSource)){
            Logger.warn("Attempt to send a message without logging in", {
                pkfp: request.headers.pkfpSource
            });
            throw "Login required";
        }
        if(!Request.isRequestValid(request, myPublicKey)){
            throw "Sending private message error: signature is not valid!";
        }
        if(recipient){
            await self._sendToSignleRecipient(request, sender.residence, recipient.residence,)
        } else {
            await self._sendToAll(request, metadata)
        }
        await self.createServiceRecordOnNameChangeRequest(request)
    }

    async createServiceRecordOnNameChangeRequest(request){
        if (request.headers.command === "nickname_change_broadcast"){
            let msg = await this.createSaveServiceRecord(request.headers.pkfpSource, request.headers.command,
                "You have changed your nickname.");
            this.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);
        }
    }

    async registerClientServiceRecord(request, connectionId, self){
        let publicKey = await self.hm.getOwnerPublicKey(request.headers.pkfpSource);

        if (!Request.isRequestValid(request, publicKey)){
            throw "Request was not verified";
        }

        let msg = await self.createSaveServiceRecord(request.headers.pkfpSource,
            request.body.event,
            request.body.message,
            true);
        self.sessionManager.broadcastServiceRecord(request.headers.pkfpSource, msg);

    }


    /*****************************************************
     * ~END HANDLERS
     *****************************************************/


    /*****************************************************
     * HELPERS
     *****************************************************/

    async _sendToSignleRecipient(request, origin, destination){
        Logger.debug("Sending service message to single participant", {
            origin: origin,
            destination: destination
        });
        let envelope = new Envelope(destination, request, origin);
        envelope.setReturnOnFail(true);
        this.ciMessenger.send(envelope);
    }

    _sendToAll(request, metadata){
        Logger.debug("Sending service message to all participants");
        let participants = metadata.body.participants;
        const sender = metadata.body.participants[request.headers.pkfpSource];
        let stringifiedRequest = JSON.stringify(request);
        for(let pkfp of Object.keys(participants)){
            if (pkfp === request.headers.pkfpSource){
                continue;
            }
            const recipient = metadata.body.participants[pkfp];
            let prepRequest = JSON.parse(stringifiedRequest);
            prepRequest.headers.pkfpDest = pkfp;
            let envelope = new Envelope(recipient.residence, prepRequest, sender.residence)
            envelope.setReturnOnFail(true);
            this.ciMessenger.send(envelope);
        }
    }

    async createSaveServiceRecord(pkfp, event, messageText, encrypted = false){
        const msg = new ServiceRecord(pkfp, event, messageText);
        if(!encrypted){
            let publicKey = await this.hm.getOwnerPublicKey(pkfp);
            msg.encrypt(publicKey);
        }
        await this.hm.appendMessage(msg.toBlob(), pkfp);
        return msg;
    }



    subscribeToClientRequests(requestEmitter){
        this.subscribe(requestEmitter, {
            whats_your_name: this.processStandardNameExchabgeRequest,
            nickname_change_broadcast: this.processStandardNameExchabgeRequest,
            my_name_response: this.processStandardNameExchabgeRequest,
            request_invite: this.registerInviteRequest,
            boot_participant: this.registerBootMemberRequest,
            update_settings: this.registerSettingsUpdate,
            load_more_messages: this.loadMoreMessages,
            register_service_record: this.registerClientServiceRecord
        }, this.clientErrorHandler)
    }


    //Subscribes to relevant cross-island requests
    subscribeToCrossIslandsMessages(ciMessenger){
        this.subscribe(ciMessenger, {
            //HANDLERS
            whats_your_name: this.processIncomingNicknameRequest,
            nickname_change_broadcast: this.processIncomingNameChangeNote,
            my_name_response: this.processNicknameResponse,
            u_booted: this.registerBootNotce,
            meta_sync: this.processIncomingResyncRequest,
            metadata_issue: this.metadataIssue, //new member joined
            meta_sync_success: this.processMetaSyncResponse,
            request_invite_success: this.processInviteRequestSuccess,
            metadata_outdated: this.processMetadataOutdatedNote,
            return_request_invite: this.processInviteRequestError
        }, this.crossIslandErrorHandler)
    }

    async crossIslandErrorHandler(envelope, self, err){
        Logger.error("Service assistant: Error handling cross-island message.", {
            err: err.message,
            envelope: JSON.stringify(envelope)
        });
    }

    async clientErrorHandler(request, connectionID, self, err){
        Logger.error("Error handling client request", {
            request: JSON.stringify(request),
            error: err.message
        })
    }
    /*****************************************************
     * ~END HELPERS
     *****************************************************/


    /*****************************************************
     * INTERNAL
     *****************************************************/

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
     * ~END INTERNAL~
     *****************************************************/
}


module.exports = ServiceAssistant;