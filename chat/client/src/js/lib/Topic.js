import { Events, Internal } from "../../../../common/Events";
import { WildEmitter } from "./WildEmitter";
import { Message } from "./Message";
import { Metadata } from  "./Metadata";
import { ChatUtility } from "./ChatUtility";
import { iCrypto } from  "./iCrypto";
import { ChatMessage } from "./ChatMessage";
import { ClientSettings } from "./ClientSettings";
import { INSPECT_MAX_BYTES } from "buffer";

const INITIAL_NUM_MESSAGES = 25

export class Topic{
    constructor(version, pkfp, name, key, comment){
        WildEmitter.mixin(this);
        this.pkfp = pkfp;
        this.name = name; // Topic alias. Not shared.
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
        this.version  = version;
        this.getPrivateKey = ()=>{ return key }

        // Meaning event listeners are set for arrivalHub
        this.isBootstrapped = false;

        // Whether topic's metadata loaded
        this.metadataLoaded = false;

        // Initial messages load has been completed
        this.isInitLoaded = false;

        // All messages on this toipcs has been loaded
        this.allMessagesLoaded = false;

        // When topic has sent load n messages from the server and awaiting result
        this.awaitingMessages = false
    }

    static prepareNewTopicSettings(version, nickname, topicName, publicKey, encrypt = true){
        //Creating and encrypting topic settings:
        let settings = new ClientSettings(version);
        if(nickname){
            let ic = new iCrypto;
            ic.asym.setKey("pubk", publicKey, "public")
                .getPublicKeyFingerprint("pubk", "pkfp");
            settings.setOwnerNickname(ic.get("pkfp"), nickname);
        }

        if (encrypt){
            return ClientSettings.encrypt(publicKey, settings)
        }else {
            return settings;
        }
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // INITIALIZING
    bootstrap(self,
              messageQueue,
              arrivalHub,
              version){
        self.messageQueue = messageQueue;
        self.arrivalHub = arrivalHub;
        self.arrivalHub.on(self.pkfp, (msg)=>{
            self.processIncomingMessage(msg, self);
        });
        self.version = version;
        self.setHandlers()
        self.bootstrapped = true;
    }


    loadMetadata(metadata){
        if(typeof metadata === "string"){
            metadata = JSON.parse(metadata);
        }
        let settingsCipher = metadata.body.settings;
        let settings;
        if (!settingsCipher){
            settings = Topic.prepareNewTopicSettings(this.version, undefined, undefined, this.getPublicKey, false)
        } else{
            settings = JSON.parse(ChatUtility.decryptStandardMessage(settingsCipher, this.privateKey))
        }

        this._metadata = metadata
        this._metadata.body.settings = settings;
        this.settings = settings;
        this.participants = {};
        for(let pkfp of Object.keys(metadata.body.participants)){
            this.participants[pkfp] = {};
            this.participants[pkfp].key = metadata.body.participants[pkfp].key;
            this.participants[pkfp].pkfp = metadata.body.participants[pkfp].pkfp;
            this.participants[pkfp].publicKey = metadata.body.participants[pkfp].publicKey;
            this.participants[pkfp].residence = metadata.body.participants[pkfp].residence;
            this.participants[pkfp].rights = metadata.body.participants[pkfp].rights;

            if(metadata.body.settings.membersData){
                this.participants[pkfp].nickname = metadata.body.settings.membersData[pkfp] ?
                    metadata.body.settings.membersData[pkfp].nickname : "";
                this.participants[pkfp].joined = metadata.body.settings.membersData[pkfp]?
                    metadata.body.settings.membersData[pkfp].joined : "";
            }

        }

        this.topicAuthority = metadata.body.topicAuthority;
        if (!metadata.body.settings.invites){
            metadata.body.settings.invites = {};
        }

        this.invites = metadata.body.settings.invites;
        this.metadataLoaded = true;

    }

    /**
     * Loads topic's last n messsages
     * If wait for completion function will return only after load is completed
     */
    async initLoad(messagesToLoad=INITIAL_NUM_MESSAGES, waitCompletion=false){
        let self = this
        self.ensureBootstrapped(self);
        setTimeout(()=>{
            self._loadMessages(self, messagesToLoad)
            self.awaitingMessages = true;
        })
    }

    //Called when init_load event is received
    processInitLoad(data){

    }

    setHandlers(){
        let self = this;
        this.handlers[Internal.LOAD_MESSAGES_SUCCESS] = this.processMessagesLoaded
        this.handlers[Internal.INVITE_REQUEST_TIMEOUT] = ()=>{
            console.log("Invite request timeout");
        }

        this.handlers[Internal.INVITE_REQUEST_FAIL] = (msg)=>{
            console.log(`Invite request failed: ${msg.body.errorMsg}`);
        }
        this.handlers[Events.INVITE_CREATED] = (msg)=>{
            console.log("Invite created event");
            self.processInviteCreated(self, msg);
            self.emit(Events.INVITE_CREATED);
        }

        this.handlers[Internal.SETTINGS_UPDATED] = (msg)=>{
            console.log("Settings updated");
            self.processSettingsUpdated(msg);
        }


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
        if(!self.metadataLoaded){
            throw new Error("Metadata has not been loaded yet.")
        }
        setTimeout(()=>{
            let request = new Message(self.version);
            let taPublicKey = self.topicAuthority.publicKey;
            let myNickNameEncrypted = ChatUtility.encryptStandardMessage(self.participants[self.pkfp].nickname,
                taPublicKey);
            let topicNameEncrypted = ChatUtility.encryptStandardMessage(self.name, taPublicKey);
            request.setCommand(Internal.REQUEST_INVITE);
            request.setSource(self.pkfp);
            request.setDest(self.topicAuthority.pkfp);
            request.body.nickname = myNickNameEncrypted;
            request.body.topicName = topicNameEncrypted;
            request.signMessage(self.privateKey);
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

    deleteInvite(inviteCode){
        console.log("About to delete invite: " + inviteCode);
        if(!this.invites.hasOwnProperty(inviteCode)){
            console.error(`Invite does not exist: ${inviteCode}`)
        }
        let request = new Message(this.version);
        request.headers.command = Internal.DELETE_INVITE;
        request.headers.pkfpSource = this.pkfp;
        request.headers.pkfpDest = this.topicAuthority.pkfp
        let body = {
            invite: inviteCode,
        };
        request.set("body", body);
        request.signMessage(this.privateKey);
        this.messageQueue.enqueue(request);
    }

    updatePendingInvites(userInvites){
        for(let i of userInvites){
            if(!this.session.settings.invites.hasOwnProperty(i)){
                this.session.settings.invites[i] = {}
            }
        }
        for (let i of Object.keys(this.session.settings.invites)){
            if(!userInvites.includes(i)){
                delete this.session.settings.invites[i];
            }
        }

        this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
    //END//////////////////////////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Nickname handling
    //TODO
    exchangeNicknames(){
        for(let pkfp of Object.keys(this.participants)){

        }

    }

    setMemberAlias(pkfp, alias){
        if(!pkfp){
            throw new Error("Missing required parameter");
        }
        if(!this.session){
            return
        }
        let membersData = this.session.settings.membersData;
        if (!membersData[pkfp]){
            membersData[pkfp] = {}
        }
        if(!alias){
            delete membersData[pkfp].alias
        }else{
            membersData[pkfp].alias = alias;
        }

    }

    requestNickname(pkfp){
        if(!pkfp){
            throw new Error("Missing required parameter");
        }
        let request = new Message(self.version);
        request.setCommand("whats_your_name");
        request.setSource(this.session.publicKeyFingerprint);
        request.setDest(pkfp);
        request.addNonce();
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    broadcastNameChange(){
        let self = this;
        let message = new Message(self.version);
        message.setCommand("nickname_change_broadcast");
        message.setSource(this.session.publicKeyFingerprint);
        message.addNonce();
        message.body.nickname = ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
        message.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", message);
    }

    processNicknameResponse(request, self){
        self._processNicknameResponseHelper(request, self)
    }

    processNicknameChangeNote(request, self){
        self._processNicknameResponseHelper(request, self, true)
    }

    _processNicknameResponseHelper(request, self, broadcast = false){
        console.log("Got nickname response");
        let publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, request)){
            console.trace("Invalid signature");
            return
        }
        let existingNickname = self.getMemberNickname(request.headers.pkfpSource);
        let memberRepr = self.getMemberRepr(request.headers.pkfpSource);
        let newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) :
            ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);
        newNickname = newNickname.toString("utf8");

        if( newNickname !== existingNickname){
            self.setMemberNickname(request.headers.pkfpSource, newNickname);
            self.saveClientSettings();
            if(existingNickname && existingNickname !== ""){
                self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
            }
        }
    }

    //~END NICKNAME HANDLING///////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Settings handling

    saveClientSettings(settingsRaw, privateKey){
        if(!settingsRaw){
            settingsRaw = this.settings;
        }
        if(!privateKey){
            privateKey = this.privateKey;
        }
        let ic = new iCrypto();
        ic.asym.setKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pub")
        let publicKey = ic.get("pub");

        if(typeof settingsRaw === "object"){
            settingsRaw = JSON.stringify(settingsRaw);
        }
        let settingsEnc = ClientSettings.encrypt(publicKey, settingsRaw);

        ic.addBlob("cipher", settingsEnc)
          .privateKeySign("cipher", "privk", "sign")

        let body = {
            settings: settingsEnc,
            signature: ic.get("sign")
        };

        let request = new Message(this.version);
        request.setSource(this.pkfp);
        request.setCommand(Internal.UPDATE_SETTINGS)
        request.set("body", body);
        request.signMessage(privateKey);
        console.log("Sending update settings request");
        this.messageQueue.enqueue(request);
    }

    //~END SETTINGS ///////////////////////////////////////////////////////////

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

    processSettingsUpdated(msg){
        let settings = msg.body.settings;
        let signature = msg.body.signature;

        let ic = new iCrypto()
        ic.addBlob("settings", settings)
          .addBlob("sign", signature)
          .setRSAKey("pub", this.getPublicKey(), "public")
          .publicKeyVerify("settings", "sign", "pub", "res")
        if(!ic.get("res")) throw new Error("Settings blob signature verification failed")
        let settingsPlain = JSON.parse(ChatUtility.decryptStandardMessage(settings, this.privateKey))
        this.settings = settingsPlain
        console.log("Settings updated successfully!")
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

    processInviteCreated(self, msg){
        console.log(`New invite: ${msg.body.inviteCode}`);
        let userInvites = msg.body.userInvites;
        if(!self.settings.invites) self.settings.invites = {}

        for(let i of userInvites){
            if(!self.settings.invites.hasOwnProperty(i)){
                self.settings.invites[i] = {}
            }
        }
        for (let i of Object.keys(self.settings.invites)){
            if(!userInvites.includes(i)){
                delete self.settings.invites[i];
            }
        }
        self.saveClientSettings(self.settings, self.privateKey);
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

    getPublicKey(){
        if(!this.privateKey) throw new Error("No private key found")
        if(!this.publicKey){
            let ic = new iCrypto()
            ic.setRSAKey("priv", this.privateKey, "private")
                .publicFromPrivate("priv", "pub")
            this.publicKey = ic.get("pub")
        }
        return this.publicKey;
    }

    ensureInitLoaded(){
        if(!this.initLoaded || !this.currentMetadata){
            throw new Error("Topic has no metadata");
        }
    }

    ensureBootstrapped(self){
        if(!self.bootstrapped || !self.messageQueue || !self.arrivalHub){
            throw new Error("Topic is not bootstrapped!");
        }
    }

    setName(name){
        this.name = name;
    }


    //Verifies current metadata
    verifyMetadata(){
        return Metadata.isMetadataValid(this._metadata)
    }
}
