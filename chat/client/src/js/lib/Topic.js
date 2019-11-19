import { Events, Internal } from "../../../../common/Events";
import { WildEmitter } from "./WildEmitter";
import { Message } from "./Message";
import { ChatUtility } from "./ChatUtility";
import { iCrypto } from  "./iCrypto";
import { ChatMessage } from "./ChatMessage";
import { INSPECT_MAX_BYTES } from "buffer";

const INITIAL_NUM_MESSAGES = 25

export class Topic{
    constructor(pkfp, name, key, comment){
        WildEmitter.mixin(this);
        this.pkfp = pkfp;
        this.name = name;
        this.privateKey = key;
        this.comment = comment;
        this.handlers = {};
        this.messageQueue;
        this.arrivalHub;
        this.currentMetadata;
        this.participants = {};
        this.messages = [];
        this.settings = {};
        this.invites = {};


        // Meaning event listeners are set for arrivalHub
        this.isBootstrapped = false;

        // Initial messages load has been completed
        this.isInitLoaded = false;

        // All messages on this toipcs has been loaded
        this.allMessagesLoaded = false;

        // When topic has sent load n messages from the server and awaiting result
        this.awaitingMessages = false
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // INITIALIZING
    bootstrap(messageQueue, arrivalHub, version){
        let self = this;
        this.messageQueue = messageQueue;
        this.arrivalHub = arrivalHub;
        this.arrivalHub.on(this.pkfp, (msg)=>{
            self.processIncomingMessage(msg, self);
        });
        this.version = version;
        this.setHandlers()
        this.bootstrapped = true;
    }


    loadMetadata(metadata){

        metadata.body.settings = JSON.parse(ChatUtility.decryptStandardMessage(metadata.body.settings, this.privateKey))
        this._metadata = metadata
        this.participants = {};
        for(let pkfp of Object.keys(metadata.body.participants)){
            this.participants[pkfp] = {};
            this.participants[pkfp].key = metadata.body.participants[pkfp].key;
            this.participants[pkfp].pkfp = metadata.body.participants[pkfp].pkfp;
            this.participants[pkfp].publicKey = metadata.body.participants[pkfp].publicKey;
            this.participants[pkfp].residence = metadata.body.participants[pkfp].residence;
            this.participants[pkfp].rights = metadata.body.participants[pkfp].rights;

            this.participants[pkfp].nickname = metadata.body.settings.membersData[pkfp] ?
                metadata.body.settings.membersData[pkfp].nickname : "";
            this.participants[pkfp].joined = metadata.body.settings.membersData[pkfp]?
                metadata.body.settings.membersData[pkfp].joined : "";

        }

        this.invites = metadata.body.settings.invites;
    }

    /**
     * Loads topic's last n messsages
     * If wait for completion function will return only after load is completed
     */
    async initLoad(messagesToLoad=INITIAL_NUM_MESSAGES, waitCompletion=false){
        let self = this
        self.ensureBootstrapped();
        setTimeout(()=>{
            self._loadMessages(self, messagesToLoad)
            self.awaitingMessages = true;
        })
    }

    //Called when init_load event is received
    processInitLoad(data){

    }

    setHandlers(){
        this.handlers[Internal.LOAD_MESSAGES_SUCCESS] = this.processMessagesLoaded
    }

    //End//////////////////////////////////////////////////////////////////////





    // ---------------------------------------------------------------------------------------------------------------------------
    // MESSAGE HANDLING

    getMessages(messagesToLoad=INITIAL_NUM_MESSAGES, lastMessageId){
        if(this.initLoaded){
            this.emit(Events.MESSAGES_LOADED, this.messages)
        } else {
            console.log("Messages has not been loaded. Loading....");
            //init load and then emit
            this.initLoad()
        }
    }

    shout(messageContent, filesAttached){
        let self = this;
        this.ensureBootstrapped();
        setImmediate(async ()=>{
            try{

                let attachmentsInfo;

                const metaID = self.session.metadata.id;
                const chatMessage = await self.prepareMessage(this.version, messageContent);

                if (filesAttached && filesAttached.length >0){
                    attachmentsInfo = await self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);
                    for (let att of attachmentsInfo) {
                        chatMessage.addAttachmentInfo(att);
                    }
                }

                chatMessage.encryptMessage(this.session.metadata.sharedKey);
                chatMessage.sign(this.session.privateKey);

                //Preparing request
                let message = new Message(self.version);

                message.headers.pkfpSource = this.session.publicKeyFingerprint;
                message.headers.command = "broadcast_message";
                message.body.message = chatMessage.toBlob();
                let currentTime = new Date().getTime();
                message.travelLog = {};
                message.travelLog[currentTime] = "Outgoing processed on client.";
                let userPrivateKey = this.session.privateKey;
                message.signMessage(userPrivateKey);
                this.chatSocket.emit("request", message);
            }catch(err){
                console.error(`Error sending message: ${err.message}`)
                throw err;
            }
        })
    }


    //Send private message
    whisper(msg, addressee){

    }



    //Incoming message
    processIncomingMessage(msg, self){
        console.log(`Incoming message on ${this.pkfp} received!`);

        if(self.handlers.hasOwnProperty(msg.headers.command)){
            self.handlers[msg.headers.command](msg, self)
        } else {
            let errMsg = `No handler found for command: ${msg.headers.command}`
            throw new Error(errMsg);
        }
    }


    prepareMessage(version, messageContent, recipientPkfp) {
        if(version === undefined || version === "") throw new Error("Chat message initialization error: Version is required");
        let self = this;
        console.log("Preparing message: " + messageContent);
        //if (!self.isLoggedIn()) {
        //    self.emit("login_required");
        //    reject();
        //}
        //Preparing chat message
        let chatMessage = new ChatMessage();
        chatMessage.version = version;
        chatMessage.header.metadataID = this.session.metadata.id;
        chatMessage.header.author = this.session.publicKeyFingerprint;
        chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
        chatMessage.header.private = !!recipientPkfp;
        chatMessage.header.nickname = self.session.settings.nickname;
        chatMessage.body = messageContent;
        return chatMessage;
    }



    updateSettings(){
         
    }

    _loadMessages(self, quantity=25, lastMessageId){
        let request = new Message(self.version);
        request.headers.command = Internal.LOAD_MESSAGES;
        request.headers.pkfpSource = self.pkfp;

        request.body.quantity = quantity;
        if (lastMessageId){
            request.body.lastMessageId = lastMessageId;
        }
        request.addNonce();
        request.signMessage(self.privateKey);
        self.messageQueue.enqueue(request)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // INVITES HANDLING
    requestInvite(){
        let self = this;
        if(!self.initLoaded){
            throw new Error("Metadata has not been loading yet.")
        }
        setTimeout(()=>{
            let request = new Message(self.version);
            let myNickNameEncrypted = ChatUtility.encryptStandardMessage(self.settings.nickname,
                self.session.metadata.topicAuthority.publicKey);
            let topicNameEncrypted = ChatUtility.encryptStandardMessage(self.session.settings.topicName,
                self.session.metadata.topicAuthority.publicKey);
            request.setCommand(Internal.REQUEST_INVITE);
            request.setSource(self.publicKeyFingerprint);
            request.setDest(self.metadata.topicAuthority.pkfp);
            request.body.nickname = myNickNameEncrypted;
            request.body.topicName = topicNameEncrypted;
            request.signMessage(self.session.privateKey);
            self.messageQueue.enqueue(request);
        }, 100)

    }

    syncInvites(){

        let request = new Message(self.version);
        request.headers.command = "sync_invites";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.headers.nonce = ic.get("nhex");
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    updateInvite(){

        this.session.settings.invites[inviteID].name = name;
        this.saveClientSettings(this.session.settings, this.session.privateKey)
    }

    deleteInvite(){

        console.log("About to delete invite: " + id);
        let request = new Message(self.version);
        request.headers.command = "del_invite";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp
        let body = {
            invite: id,
        };
        request.set("body", body);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }
    //END//////////////////////////////////////////////////////////////////////

    processMessagesLoaded(msg, self){
        console.log("Messages loaded. Processing...");
        let data = msg.body.lastMessages;


        let keys = data.keys;
        let metaIDs = Object.keys(keys);
        for (let i=0;i<metaIDs.length; ++i){
            let ic = new iCrypto;
            ic.addBlob('k', keys[metaIDs[i]])
                .hexToBytes("k", "kraw")
                .setRSAKey("priv", self.privateKey, "private")
                .privateKeyDecrypt("kraw", "priv", "kdec");
            keys[metaIDs[i]] = ic.get("kdec");
        }

        let messages = data.messages;
        let result = [];
        for (let i=0; i<messages.length; ++i){
            let message = new ChatMessage(messages[i]);
            if(message.header.service){
                message.body = ChatUtility.decryptStandardMessage(message.body, self.privateKey)
            } else if(message.header.private){
                message.decryptPrivateMessage(self.privateKey);
            } else{
                message.decryptMessage(keys[message.header.metadataID]);
            }
            result.push(message);
        }

        if(!self.initLoaded || self.messages.length === 0){
            self.messages = result;
        } else {
            let latestLoadedID = result[0].header.id;
            let glueIndex = self.messages.findIndex((msg)=>{
                return msg.header.id === latestLoadedID;
            });
            self.messages = glueIndex ? [...self.messages.slice(0, glueIndex), ...result] :
                [...self.messages, ...result]

        }
        self.initLoaded = true;
        self.allMessagesLoaded = data.allLoaded;
        self.emit(Events.MESSAGES_LOADED, self.messages);
    }

    bootPraticipant(){

    }

    processMetadataUpdate(){

    }

    processNicknameRequest(){

    }

    processNicknameResponse(){

    }

    processNicknameChangeNote(){

    }



    getParticipantAlias(pkfp){
        if(!this.isBootstrapped || !pkfp){
            return
        }
        let participantData = this.participants[pkfp];

        if (participantData && participantData.alias){
            return participantData.alias;
        } else{
            return pkfp.substring(0, 8);
        }
    }

    getParticipantRepr(pkfp){
        if (this.participants[pkfp]){
            return this.participants[pkfp].alias || this.participants[pkfp].nickname  || "Unknown";
        }
    }

    ensureInitLoaded(){
        if(!this.initLoaded || !this.currentMetadata){
            throw new Error("Topic has no metadata");
        }
    }

    ensureBootstrapped(){
        if(!this.bootstrapped || !this.messageQueue || !this.arrivalHub){
            throw new Error("Topic is not bootstrapped!");
        }
    }

    setName(name){
        this.name = name;
    }


    saveClientSettings(settingsRaw, privateKey){
        if(!settingsRaw){
            settingsRaw = this.session.settings;
        }
        if(!privateKey){
            privateKey = this.session.privateKey;
        }
        let ic = new iCrypto();
        ic.asym.setKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pub")
            .getPublicKeyFingerprint("pub", "pkfp");
        let publicKey = ic.get("pub");
        let pkfp = ic.get("pkfp");

        if(typeof settingsRaw === "object"){
            settingsRaw = JSON.stringify(settingsRaw);
        }
        let settingsEnc = ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
        let headers = {
            command: "update_settings",
            pkfpSource: pkfp
        };
        let body = {
            settings: settingsEnc
        };

        let request = new Message(self.version);
        request.set("headers", headers);
        request.set("body", body);
        request.signMessage(privateKey);
        console.log("Sending update settings request");
        this.chatSocket.emit("request", request);
    }


}
