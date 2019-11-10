import { Events, Internal } from "../../../../common/Events";
import { WildEmitter } from "./WildEmitter";
import { Message } from "./Message";

export class Topic{
    constructor(pkfp, name, key, comment){
        WildEmitter.mixin(this);
        this.pkfp = pkfp;
        this.name = name;
        this.privateKey = key;
        this.comment = comment;
        this.messageQueue;
        this.arrivalHub;
        this.currentMetadata;
        this.members = {};
        this.messages = [];
        this.settings = {};
        this.invites = {};
        this.isBootstrapped = false;
        this.isInitLoaded = false;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // INITIALIZING
    bootstrap(messageQueue, arrivalHub, version){
        this.messageQueue = messageQueue;
        this.arrivalHub = arrivalHub;
        this.arrivalHub.on(this.pkfp, this.processIncomingMessage);
        this.version = version;
        this.bootstrapped = true;
    }

    /**
     * Loads topic metadata and last 20 messsages
     * If wait for completion function will return only after load is completed
     */
    async initLoad(messagesToLoad=20, waitCompletion=false){
        this.ensureBootstrapped();
        setImmediate(()=>{
            let message = new Message();
            message.setSource(this.pkfp);
            message.setCommand(Internal.INIT_LOAD);
            message.addNonce();
            message.signMessage(this.privateKey);
            this.messageQueue.enqueue(message);
        })
    }

    //Called when init_load event is received
    processInitLoad(data){

    }

    //End//////////////////////////////////////////////////////////////////////





    // ---------------------------------------------------------------------------------------------------------------------------
    // MESSAGE HANDLING
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
    processIncomingMessage(msg){
        console.log(`Incoming message on ${this.pkfp} received!`);


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

    loadMessages(){
        let request = new Message(self.version);
        request.headers.command = Internal.LOAD_MESSAGES;
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.body.lastLoadedMessageID = lastLoadedMessageID;
        request.signMessage(this.session.privateKey);
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
