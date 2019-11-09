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

        //this.chatSocket.emit("request", request);
    }

    createInvite(){

    }

    syncInvites(){

    }

    updateInvite(){

    }

    deleteInvite(){

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
}
