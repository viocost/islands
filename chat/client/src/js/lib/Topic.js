import { Events, Internal } from "../../../../common/Events";
import { inRange } from "../../../../common/Util";
import { WildEmitter } from "./WildEmitter";
import { Message } from "./Message";
import { Metadata } from  "./Metadata";
import { IslandsVersion } from "../../../../common/Version"
import { ChatUtility } from "./ChatUtility";
import { iCrypto } from  "../../../../common/iCrypto";
import { ChatMessage } from "./ChatMessage";
import { ClientSettings } from "./ClientSettings";
import { INSPECT_MAX_BYTES } from "buffer";
import { assert } from "../../../../common/IError";
import { UXMessage } from "../ui/Common"
import { StateMachine } from "../../../../common/AdvStateMachine"
import { RequestForMessagesFactory } from "./RequestForMessages";
import { SendMessageAgent } from "./SendMessageAgent"
import { VaultEvents } from "./Vault"
import { BootParticipantAgent, BootParticipatAgent } from "./BootParticipantAgent"

const INITIAL_NUM_MESSAGES = 25

//for later refactoring
class TopicBase{
    messages = [];
    constructor(){

    }

}

export class Topic{
    constructor(pkfp, name, key, comment){
        WildEmitter.mixin(this);
        this.pkfp = pkfp;
        this.name = name; // Topic alias. Not shared.
        this.privateKey = key;
        this.comment = comment;
        this.handlers = {};
        this.connector;
        this.arrivalHub;
        this.currentMetadata;
        this.sharedKey;
        this.metadataId;
        this.lastPrivate;
        this.participants = {};
        this.messages = [];
        this.settings = {};
        this.invites = {};
        this.getPrivateKey = ()=>{ return key }

        // Meaning event listeners are set for arrivalHub
        this.isBootstrapped = false;

        // Whether topic's metadata loaded
        this.metadataLoaded = false;

        // Initial messages load has been completed
        this.isInitLoaded = false;

        // All messages on this topics has been loaded
        this.allMessagesLoaded = false;

        // When topic has sent load n messages from the server and awaiting result
        this.awaitingMessages = false

        this._messageServerSM = this._prepareMessageServerSM()
        this._messageFetcherSM = this._prepareMessageFetcherSM();

    }

    //Whenever there is a request for messages
    //this state machine handles is making sure
    //there is only a single message request served at a time
    _prepareMessageServerSM(){
        return new StateMachine(this, {
            name: "Message server SM",
            stateMap: {
                idle: {
                    initial: true,
                    transitions: {
                        getMessages: {
                            state: "processing",
                            actions: this._initializeGetMessagesRequest.bind(this)
                        }
                    }
                },

                processing: {
                    transitions: {
                        entry: this._giveMessages.bind(this),
                        fulfilled: {
                            state: "idle",
                        },

                        moreMessages: {
                            actions: this._giveMessages.bind(this)
                        }

                    }
                }
            }
        })

    }

    //This function is called when message request from
    // UX is received
    _giveMessages(args){
        //If not fulfilled the request and not all messages loaded
        //   invoke message fetcher

        //let { pkfp, before } = args[0]; //before is the id of the earliest message

        //not our requets
        //if(pkfp !== this.pkfp) return

        let lastId = args[0] || 0;
        let messagesRequested = args[1];
        let lastMessageIndex = this.messages.find(message.header.id === lastId)


        //Give any messages that already cached
    }


    //When get_messages request received
    // it MUST provide all the requested messages eventually
    //
    // if it doesn't have all the messages right away, it provides what it has and
    // invokes message fetcher to fetch messages from the island. When following messages
    // arrive, they are given to requester and the request is terminated
    //
    //
    _initializeGetMessagesRequest(args){
        let { lastId=0, howMany, } = args[0];


        let lastMessageIndex = this.messages.find(message.header.id === lastId)
    }

    _prepareMessageFetcherSM(){

        return new StateMachine(this, {
            name: "Message fetcher SM",
            stateMap: {
                idle: {
                    initial: true,
                    transitions: {
                        fetch: {
                            state: "fetching",
                            actions: this.loadMoreMessages.bind(this)
                        }
                    },

                },

                fetching: {
                    transitions: {
                        messagesArrived: {
                            actions: this.cacheMessages.bind(this)
                        },

                        fulfilled: {
                            state: "idle"
                        },

                        allLoaded: {
                            state: "allLoaded",
                            actions: ()=>console.log("Fetcher now goes to all loaded state")
                        }
                    }
                },

                allLoaded: {
                    final: true
                }
            }
        }, { msgNotExistMode: StateMachine.Warn })
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
    bootstrap(connector,
              arrivalHub,
              uxBus,
              version){
        this.connector = connector;
        this.arrivalHub = arrivalHub;
        this.arrivalHub.on(this.pkfp, (msg)=>{
            this.preprocessIncomingMessage(msg, this);
        });
        this.version = version;
        this.setHandlers()
        this.uxBus = uxBus;
        this.subscribeToBus(uxBus),
        this.isBootstrapped = true;

    }

    subscribeToBus(uxBus){
        uxBus.on(this.pkfp, this.processBusMessage.bind(this), this)
    }


    processBusMessage(pkg){
        let handlers = {}
        handlers[UXMessage.INVITE_REQUEST] = this.requestInvite.bind(this)
        handlers[UXMessage.GET_LAST_MESSAGES] = this.processGetMessagesRequest.bind(this) ,
        handlers[UXMessage.SEND_CHAT_MESSAGE] = this.sendChatMessage.bind(this)
        handlers[UXMessage.DELETE_INVITE] = this.deleteInvite.bind(this)
        handlers[VaultEvents.TOPIC_DELETED] = this.processTopicDeleted.bind(this)
        handlers[UXMessage.SET_INVITE_ALIAS] = this.setInviteAlias.bind(this)
        handlers[UXMessage.SET_PARTICIPANT_ALIAS] = this.setParticipantAlias.bind(this)
        handlers[UXMessage.BOOT_PARTICIPANT] = this.bootParticipant.bind(this)

        handlers[UXMessage.CHANGE_MY_NICKNAME] = (data)=>{
            let { nickname } = data;
            this.setParticipantNickname.call(this, nickname, this.pkfp )
        }


        if(pkg.message in handlers){
            handlers[pkg.message](pkg)
        }
    }

    processTopicDeleted(pkfp){
        if(pkfp === this.pkfp){
            this.uxBus.off(this);
        }
    }

    //Called when newly issued metadata arrived
    updateMetadata(metadata){
        console.log("METADATA UPDATE RECEIVED!!!!");
        if(typeof metadata === "string"){
            metadata = JSON.parse(metadata);
        }
        let settings = this._metadata.body.settings
        metadata.body.settings = settings;
        settings.membersData = ChatUtility.syncMap(Object.keys(metadata.body.participants),
                                                               settings.membersData,
                                                               {nickname: ""})
        this._metadata = metadata
        this.sharedKey = ChatUtility.privateKeyDecrypt(this.participants[this.pkfp].key, this.privateKey);
        this.metadataId = metadata.body.id;
        this.topicAuthority = metadata.body.topicAuthority;
        this.updateParticipants();
        this.saveClientSettings();
    }

    bootParticipant(data){
        let { pkfp } = data;
        let agent  = new BootParticipantAgent(this, pkfp, this.connector)
        agent.boot()
    }

    loadMetadata(metadata){
        let privateKey=this.privateKey;
        this._metadata = Metadata.fromBlob(metadata, privateKey);
        this.updateParticipants();
        this.sharedKey = this.getSharedKey()
        this.metadataId = this._metadata.getId();
        this.metadataLoaded = true;
        this.invites = this._metadata.body.settings.invites;
    }
    //called only when loading metadata from Island on login
    loadMetadataBAK(metadata){
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
        this.updateParticipants()

        this.sharedKey = ChatUtility.privateKeyDecrypt(this.participants[this.pkfp].key, this.privateKey);
        this.metadataId = metadata.body.id;

        this.topicAuthority = metadata.body.topicAuthority;
        if (!metadata.body.settings.invites){
            metadata.body.settings.invites = {};
        }

        this.invites = metadata.body.settings.invites;
        this.metadataLoaded = true;
    }

    updateParticipants(){
        console.log("Updating participants");
        let metadata = this._metadata
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
    }

    /**
     * Loads topic's last n messsages
     * If wait for completion function will return only after load is completed
     */
    initLoad(cb){
        this.ensureBootstrapped();
        this.awaitingMessages = true;

        if(cb){
            this.once(Internal.MESSAGES_LOADED, ()=>{ cb(this.messages)})
        }

        this.requestMessages()
    }


    sendChatMessage(request){

        if(!request.chatMessage){
            console.log("chat message not provided")
            return
        }
        console.log("SEND CHAT MESSAGE CALLED");
        let sendMessageAgent = new SendMessageAgent(this, request.chatMessage)
        return sendMessageAgent.send();
    }


    setHandlers(){
        let self = this;
        this.handlers[Internal.LOAD_MESSAGES_SUCCESS] = this.processMessagesLoaded.bind(this)
        this.handlers[Internal.INVITE_REQUEST_TIMEOUT] = ()=>{
            console.log("Invite request timeout");
        }

        this.handlers[Internal.MESSAGES_SYNC] = msg =>{
            console.log("Got messages sync");
            console.dir(msg)
            if(!msg.body.lastMessages || !msg.body.lastMessages.messages) return;
            for(let chatMsg of msg.body.lastMessages.messages.reverse()){
                self.processIncomingMessage(self, JSON.parse(chatMsg))
            }
        }


        this.handlers[Internal.INVITE_REQUEST_FAIL] = (msg)=>{
            console.log(`Invite request failed: ${msg.body.errorMsg}`);
        }
        this.handlers[Events.INVITE_CREATED] = (msg)=>{
            console.log("Invite created event");
            let newInvite = self.processInvitesUpdated(self, msg);
            self.uxBus.emit(TopicEvents.INVITE_CREATED, {
                pkfp: this.pkfp,
                invite: newInvite
            });
        }

        this.handlers[Internal.DELETE_INVITE_SUCCESS] = (msg)=>{
            console.log("Invite deleted event");
            self.processInviteDeleted(self, msg);
        }

        this.handlers[Internal.SETTINGS_UPDATED] = (msg)=>{
            console.log("Settings updated");
            self.processSettingsUpdated(self, msg);
        }

        // THIS REQUIRES REFACTORING
        this.handlers[Internal.METADATA_ISSUE] = (msg) =>{
            console.log(`Metadata issue received. Event: ${msg.headers.event}`)
            console.dir(msg)
            assert(Message.verifyMessage(self._metadata.getTAPublicKey(), msg), "TA signature is invalid")
            console.log("Signature verified. Loading metadata...");
            self._metadata.updateMetadata(msg.body.metadata);

            // If consumed invite in the message and this toipc has it - delete it
            if(msg.body.invite && this._metadata.hasInvite(msg.body.invite)){
                //Invite was used by new member:
                this._metadata.deleteInvite(msg.body.invite);

                //Notify anyone interested
                self.uxBus.emit(TopicEvents.INVITE_CONSUMED, {
                    pkfp: this.pkfp,
                    userInvites: Object.keys(this.invites)
                })
            }

            if(msg.headers.event === Events.NEW_MEMBER_JOINED){

                self.uxBus.emit(TopicEvents.NEW_PARTICIPANT_JOINED, {
                    topicPkfp: this.pkfp,
                    pkfp: msg.body.pkfp,
                    nickname: msg.body.nickname
                })
            }

            if (msg.body.inviteePkfp){
                self.nicknameChangeNotify(msg.body.inviteePkfp)
            }
            self.saveClientSettings();
            console.log("Metadata updated");
            self.emit(Events.METADATA_UPDATED);
        }

        this.handlers[Internal.NICKNAME_INITAL_EXCHANGE] = (msg)=>{
            console.log("Initial nickname exchange request received. Processing");
            let senderPkfp = msg.headers.pkfpSource
            assert(self.participants[senderPkfp], "Member has not yet been registered")
            //assert(Message.verifyMessage(senderPublicKey, msg), "Signature is invalid")
            if(msg.body.metadataId === self._metadata.getId() && msg.body.myNickname){
                console.log("Decrypting new participant nickname...");
                let nickname = ChatUtility.symKeyDecrypt(msg.body.myNickname,
                                                         self.getSharedKey())
                console.log(`New member's nickname is ${nickname}`);
                console.log(`My current nickname is ${self.getCurrentNickname()}`);
                self.setParticipantNickname(nickname, senderPkfp);
            }

        }

        this.handlers[Internal.NICKNAME_NOTE] = (msg)=>{
            console.log(`nickname note received: metadataId: ${msg.body[Internal.METADATA_ID]}`);
            let senderPkfp = msg.headers.pkfpSource
            let senderPublicKey = self.participants[senderPkfp].publicKey;
            //assert(Message.verifyMessage(senderPublicKey, msg), "Signature is invalid")
            let sharedKey = ChatUtility.privateKeyDecrypt(msg.sharedKey, self.privateKey)
            let currentSharedKey = self.getSharedKey();
            console.log(`Current key: ${currentSharedKey}, received key ${sharedKey}`);
            let nickname = ChatUtility.symKeyDecrypt(msg.body.nickname, sharedKey)
            console.log(`Participan ${senderPkfp} changed his nickname to ${nickname}` );
            self.setParticipantNickname(nickname, senderPkfp)
        }

        this.handlers[Internal.SERVICE_RECORD] = (msg)=>{
            console.log("New service record arrved")
            let record = msg.body.serviceRecord;
            if (!record){
                console.error("Error: Service record is not found!");
                return;
            }

            record = new ChatMessage(record);
            record.decryptServiceRecord(self.privateKey);
            self.addNewMessage(self, record);
        }

        this.handlers[Internal.BROADCAST_MESSAGE] = (msg)=>{
            console.log("Broadcast message received");
            let msgCopy = JSON.parse(JSON.stringify(msg))
            // pkfpDest is added by server when message is broadcasted, so to verify it
            // must be deleted
            delete msgCopy.pkfpDest;
            assert(self.participants[msg.headers.pkfpSource], `The participant ${msgCopy.pkfpDest} not found`)

            let publicKey = self.participants[msg.headers.pkfpSource].publicKey;

            //assert(Message.verifyMessage(publicKey, msgCopy), "Message was not verified")
            let message = new ChatMessage(msg.body.message)
            message.decryptMessage(self.getSharedKey())
            self.addNewMessage(self, message);

            if(message.header.nickname !== self.getParticipantNickname(msg.headers.pkfpSource)){
                console.log(`Member's nickname has changed from ${self.getParticipantNickname(msg.headers.pkfpSource)} to ${message.header.nickname}`);
                self.setParticipantNickname(message.header.nickname, msg.headers.pkfpSource);
            }

        }

        this.handlers[Internal.SEND_MESSAGE] = (msg)=>{

            assert(self.participants[msg.headers.pkfpSource], `The participant ${msg.headers.pkfpDest} not found`)

            let publicKey = self.participants[msg.headers.pkfpSource].publicKey;
            assert(Message.verifyMessage(publicKey, msg))
            let message = new ChatMessage(msg.body.message)
            message.decryptPrivateMessage(self.privateKey);
            self.addNewMessage(self, message);
        }

        this.handlers[Internal.MESSAGE_SENT] = (msg)=>{
            console.log(`Message sent received. Message: ${msg.body.message}`);
            this.processMessageSent(this, msg)
        }

    }

    //End//////////////////////////////////////////////////////////////////////





    // ---------------------------------------------------------------------------------------------------------------------------
    // MESSAGE HANDLING

    processIncomingMessage(self, msg){
        let message = new ChatMessage(msg)
        if(message.header.service){
            message.decryptServiceRecord(self.privateKey)
        } else if (message.header.private){
            message.decryptPrivateMessage(self.privateKey)
        } else {
            message.decryptMessage(self.getSharedKey())
        }

        if(!message.header.service){
            if(message.header.nickname !== self.getParticipantNickname(msg.header.author)){
                console.log(`Member's nickname has changed from ${self.getParticipantNickname(msg.header.author)} to ${message.header.nickname}`);
                self.setParticipantNickname(message.header.nickname, msg.header.author);
            }
        }

        self.addNewMessage(self, message);

    }




    processMessageSent(self, msg){
        let sentMessage = new ChatMessage(msg.body.message);
            console.log("Setting existing message from pending to delivered")
        let existingMessages = self.messages.filter((m)=>{
            return m.header.id === sentMessage.header.id;
        })
        assert(existingMessages.length < 2, `Message doubling error: ${existingMessages.length}`);
        let existingMessage = existingMessages[0];
        if (existingMessage){
            existingMessage.pending = false;
            self.emit(Internal.MESSAGE_SENT, existingMessage);
        } else {
            console.log("Decrypting and adding sent message.");
            sentMessage.header.private ?
                sentMessage.decryptPrivateMessage(self.privateKey) :
                sentMessage.decryptMessage(self.getSharedKey())
            self.addNewMessage(self, sentMessage);
        }
    }

    addNewMessage(self, chatMessage){
        console.log(`!!========ADDING NEW CHAT MESSAGE. msgCount: ${self.messages.length} \n${chatMessage.body}`);

        self.messages.splice(0, 0, chatMessage);
        console.log(`Message added. msgCount: ${self.messages.length}`);

        console.log("Emitting messages to the bus");
        this.uxBus.emit(TopicEvents.NEW_CHAT_MESSAGE, {
            topicPkfp: this.pkfp,
            message: chatMessage,
            authorAlias: this.getParticipantAlias(chatMessage.header.author)
        });
    }

    getMessages(cb){
        if(this.initLoaded){
            cb(this.messages)
        } else {
            console.log("Messages has not been loaded. Loading....");
            this.initLoad(cb)
        }
    }



    getMessagesAsync(){
        if(this.initLoaded){
            return this.messages;
        } else {
            console.log("Messages has not been loaded. Loading....");
            //init load and then emit
            this.initLoad()
            return null;
        }
    }

    // Incoming message
    preprocessIncomingMessage(msg, self){
        console.log(`Incoming message on ${this.pkfp} received!`);

        if(self.handlers.hasOwnProperty(msg.headers.command)){
            self.handlers[msg.headers.command](msg, self)
        } else {
            let errMsg = `No handler found for command: ${msg.headers.command}`
            throw new Error(errMsg);
        }
    }

    getCurrentNickname(){
        if (!this.metadataLoaded){
            throw new Error("Cannot get current nickname: metadata is not loaded.")
        }

        return this._metadata.getParticipantNickname(this.pkfp);
    }

    getSharedKey(){
        return this._metadata.getSharedKey(this.pkfp, this.privateKey);
    }

    getParticipantPublicKey(pkfp){
        return this._metadata.getParticipantPublicKey(pkfp);
    }

    getMetadataId(){
        return this._metadata.getId();
    }

    //Checks whether the request related to us
    //and passes it to the state machine that handles messages requests
    processGetMessagesRequest(data){

        let { before, howMany } = data; //before is the id of the earliest message

        let requestForMessages = RequestForMessagesFactory.make(this, howMany, this.uxBus, before);
        requestForMessages.run();

    }


    cacheMessages(args){
        console.log("Caching messages on client");
        let msg = args[0];

        let data = msg.body.lastMessages;
        let keys = data.keys;

        console.log(`Messages loaded. Processing.... Keys: ${keys}`);
        let metaIDs = Object.keys(keys);
        for (let i=0;i<metaIDs.length; ++i){
            let ic = new iCrypto;
            ic.addBlob('k', keys[metaIDs[i]])
                .hexToBytes("k", "kraw")
                .setRSAKey("priv", this.privateKey, "private")
                .privateKeyDecrypt("kraw", "priv", "kdec");
            keys[metaIDs[i]] = ic.get("kdec");
        }

        let messages = data.messages;
        let result = [];
        console.log(`Messages loaded: ${messages.length}`);
        for (let i=0; i<messages.length; ++i){
            let message = new ChatMessage(messages[i]);
            if(message.header.service){
                message.body = ChatUtility.decryptStandardMessage(message.body, this.privateKey)
            } else if(message.header.private){
                message.decryptPrivateMessage(this.privateKey);
            } else{
                if(!keys.hasOwnProperty(message.header.metadataID)){
                    console.error(`Warning! key not found for ${message.headers.metadataID}`)
                }
                message.decryptMessage(keys[message.header.metadataID]);
            }
            result.push(message);
        }

        if(!this.initLoaded || this.messages.length === 0){
            this.messages = result;
        } else {
            let latestLoadedID = result[0].header.id;
            let glueIndex = this.messages.findIndex((msg)=>{
                return msg.header.id === latestLoadedID;
            });
            this.messages = glueIndex ? [...this.messages.slice(0, glueIndex), ...result] :
                [...this.messages, ...result]

        }
        this.initLoaded = true;
        this.allMessagesLoaded = data.allLoaded;

        if(this.allMessagesLoaded){
            console.log(`ALL MESSAGES LOADED! `);
            this._messageFetcherSM.handle.allLoaded()
        } else {
            this._messageFetcherSM.handle.fulfilled()

        }

        this.awaitingMessages = false;
        this.uxBus.emit(TopicEvents.MESSAGES_LOADED)
    }

    loadMoreMessages(howMany){

        let lastMessageId = this.messages.length > 0 ?                             //
            this.messages[this.messages.length-1].header.id : undefined;           //

        this.requestMessages(howMany, lastMessageId);                                   //


        ////////////////////////////////////////////////////////////////////////////////
        // let { pkfp, before } = request; //before is the id of the earliest message //
        //                                                                            //
        // //not our requets                                                          //
        // if(pkfp !== this.pkfp) return                                              //
        //                                                                            //
        // console.log("Load more messages request received");                        //
        // if (this.awaitingMessages || this.allMessagesLoaded){                      //
        //     console.log("Already awaiting messages")                               //
        //     return;                                                                //
        // }                                                                          //
        // console.log("Loading more messages");                                      //
        // this.awaitingMessages = true;                                              //
        // let lastMessageId = this.messages.length > 0 ?                             //
        //     this.messages[this.messages.length-1].header.id : undefined;           //
        // this.requestMessages(25, lastMessageId);                                   //
        ////////////////////////////////////////////////////////////////////////////////
    }

    requestMessages(quantity=INITIAL_NUM_MESSAGES, lastMessageId){
        let request = new Message(IslandsVersion.getVersion());
        request.headers.command = Internal.LOAD_MESSAGES;
        request.headers.pkfpSource = this.pkfp;

        request.body.quantity = quantity;
        if (lastMessageId){
            request.body.lastMessageId = lastMessageId;
        }
        request.addNonce();
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request)
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
            let taPublicKey = self._metadata.getTAPublicKey();
            let myNickNameEncrypted = ChatUtility.encryptStandardMessage(self.participants[self.pkfp].nickname,
                taPublicKey);
            let topicNameEncrypted = ChatUtility.encryptStandardMessage(self.name, taPublicKey);
            request.setCommand(Internal.REQUEST_INVITE);
            request.setSource(self.pkfp);
            request.setDest(self._metadata.getTAPkfp());
            request.body.nickname = myNickNameEncrypted;
            request.body.topicName = topicNameEncrypted;
            request.signMessage(self.privateKey);
            self.connector.acceptMessage(request);
        }, 100)

    }

    setInviteAlias(data){
        let { inviteCode, alias } = data
        console.log(`Setting alias for an invite: ${inviteCode}, ${alias}`);
        this._metadata.setInviteAlias(inviteCode, alias)
        this.saveClientSettings();
    }

    getInvites(){
        return this._metadata.getInvites();
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


    deleteInvite(data){
        let { inviteCode } = data;
        console.log("About to delete invite: " + inviteCode);
        assert(this._metadata.hasInvite(inviteCode), `Invite does not exists: ${inviteCode}`)
        let request = new Message(this.version);
        request.headers.command = Internal.DELETE_INVITE;
        request.headers.pkfpSource = this.pkfp;
        request.headers.pkfpDest = this._metadata.getTAPkfp();
        let body = {
            invite: inviteCode,
        };
        request.set("body", body);
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request);
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

        this.saveClientSettings();
    }
    //END//////////////////////////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Nickname handling
    //TODO
    exchangeNicknames(){
        console.log(`Attempting to exchange nicknames. Sending my nickname: ${this.getCurrentNickname()}`);
        if(!this.isBootstrapped){
            console.log("Cannot exchange nicknames: topic not bootstrapped.");
            return;
        }
        let myNicknameRaw = this.getCurrentNickname();
        let myNickname = ChatUtility.symKeyEncrypt(myNicknameRaw,  this.sharedKey);
        let request = Message.createRequest(this.version,
                                            this.pkfp,
                                            Internal.NICKNAME_INITAL_EXCHANGE)
        request.body.metadataId = this.metadataId;
        request.body.myNickname = myNickname;
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request);
        console.log(`Nicknames exchange request sent: nickname: ${myNicknameRaw}`);
    }

    getMetadata(){
        return this._metadata;
    }

    hasParticipant(pkfp){
        return this._metadata.hasParticipant(pkfp);
    }

    getParticipantNickname(pkfp){
        if (this._metadata.body.settings.membersData[pkfp]){
            return this._metadata.body.settings.membersData[pkfp].nickname
        }
    }

    setParticipantNickname(nickname, pkfp){
        this._metadata.setParticipantNickname(nickname, pkfp);
        this.saveClientSettings();
        if (pkfp === this.pkfp){
            this.nicknameChangeNotify()
        }

    }

    setParticipantAlias(data){
        let { alias, pkfp } = data
        this._metadata.setParticipantAlias(alias, pkfp)
        this.saveClientSettings();
    }

    nicknameChangeNotify(pkfp){
        let self = this;
        let curNickname = self.getCurrentNickname()
        let sharedKey = self.getSharedKey()
        console.log(`Sending current nickname: ${curNickname}. Encrypting with: ${sharedKey}`);
        let message = new Message(self.version);
        message.setCommand(Internal.NICKNAME_NOTE)
        message.setSource(self.pkfp);
        if(pkfp){
            message.setDest(pkfp);
        }
        message.addNonce();
        message.setAttribute("nickname",
                            ChatUtility.symKeyEncrypt(curNickname, sharedKey));
        message.setAttribute(Internal.METADATA_ID, self._metadata.getId());
        message.signMessage(self.privateKey);
        self.connector.acceptMessage(message);
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
        let existingNickname = self.getMemberNicknamr(request.headers.pkfpSource);
        let memberRepr = self.getMemberRepr(request.headers.pkfpSource);
        let newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) :
            ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);
        newNickname = newNickname.toString("utf8");

        if( newNickname !== existingNickname){
            self.setParticipantNickname(newNickname, request.headers.pkfpSource);
            self.saveClientSettings();
            if(existingNickname && existingNickname !== ""){
                self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
            }
        }
    }

    //~END NICKNAME HANDLING///////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Settings handling

    saveClientSettings(){
        let body = this._metadata.getSettingsEncrypted(this.privateKey)
        let request = new Message(this.version);
        request.setSource(this.pkfp);
        request.setCommand(Internal.UPDATE_SETTINGS)
        request.set("body", body);
        request.signMessage(this.privateKey);
        console.log("Sending update settings request");
        this.connector.acceptMessage(request);
    }

    //~END SETTINGS ///////////////////////////////////////////////////////////


    createRegisterServiceRecord(event, message){
        let request = new Message(self.version);
        request.addNonce();
        request.setSource(this.session.publicKeyFingerprint);
        request.setCommand(Internal.REGISTER_SERVICE_RECORD);
        request.body.event = event;
        request.body.message = ChatUtility.encryptStandardMessage(message,
            this.getPublicKey);
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request)
    }

    processMessagesLoaded(msg){
        this._messageFetcherSM.handle.messagesArrived(msg)
    }


    areAllMessagesLoaded(){
        return this.allMessagesLoaded;
    }

    processSettingsUpdated(self, msg){
        let settings = msg.body.settings;
        let signature = msg.body.signature;
        let metadata = Metadata.fromBlob(msg.body.metadata, self.privateKey);

        let ic = new iCrypto()
        ic.addBlob("settings", settings)
          .addBlob("sign", signature)
          .setRSAKey("pub", self.getPublicKey(), "public")
          .publicKeyVerify("settings", "sign", "pub", "res")
        if(!ic.get("res")) throw new Error("Settings blob signature verification failed")

        let settingsPlain = JSON.parse(ChatUtility.decryptStandardMessage(settings, self.privateKey))
        if(this._metadata.getId() !== metadata.getId()){
            console.log("Metadata has been updated. Updating...");
            this._metadata.updateMetadata(metadata)
        }

        self._metadata.updateSettings(settingsPlain);
        self.updateParticipants();
        this.uxBus.emit(TopicEvents.SETTINGS_UPDATED, this)
        console.log("Settings updated successfully!");
    }

    //Notification on alias change. Disable for now
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // detectAliasNicknameChangesOnSettingsUpdate(settingsPlain){                                                  //
    //     Object.keys(this._metadata.body.settings.membersData).forEach(k=>{                                      //
    //                                                                                                             //
    //         if(this._metadata.body.settings.membersData[k].nickname !== settingsPlain.membersData[k].nickname){ //
    //             this.emit(Events.NICKNAME_CHANGED, {                                                            //
    //                 topicPkfp: this.pkfp,                                                                       //
    //                 oldNickname: this._metadata.body.settings.membersData[k].nickname,                          //
    //                 newNickname: settingsPlain.membersData[k].nickname,                                         //
    //                 participantPkfp: k                                                                          //
    //             })                                                                                              //
    //         }                                                                                                   //
    //                                                                                                             //
    //         if(this._metadata.body.settings.membersData[k].alias !== settingsPlain.membersData[k].alias){       //
    //             this.emit(Events.PARTICIPANT_ALIAS_CHANGED, {                                                   //
    //                 topicPkfp: this.pkfp,                                                                       //
    //                 oldAlias: this._metadata.body.settings.membersData[k].alias,                                //
    //                 newAlias: settingsPlain.membersData[k].alias,                                               //
    //                 participantPkfp: k                                                                          //
    //             })                                                                                              //
    //         }                                                                                                   //
    //     })                                                                                                      //
    //                                                                                                             //
    //     Object.keys(this._metadata.body.settings.invites).forEach(k=>{                                          //
    //         if (this._metadata.body.settings.invites[k].name !== settingsPlain.invites[k].name){                //
    //             this.emit(Events.INVITE_ALIAS_CHANGED, {                                                        //
    //                 topicPkfp: this.pkfp,                                                                       //
    //                 oldAlias: this._metadata.body.settings.invites[k].name,                                     //
    //                 newAlias: settingsPlain.invites[k].name,                                                    //
    //                 invite: k                                                                                   //
    //             })                                                                                              //
    //         }                                                                                                   //
    //     })                                                                                                      //
    // }                                                                                                           //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //TODO  REFACTOR!!! Cleanup or implememnt

    processInvitesUpdated(self, msg){
        assert(Message.verifyMessage(self._metadata.getTAPublicKey(), msg), "TA signature is invalid")
        let data = JSON.parse(ChatUtility.decryptStandardMessage(msg.body.data, self.privateKey))

        console.log(`Invites data has been decrypted successfully.`);
        if (data.inviteCode){
            console.log(`New invite: ${data.inviteCode}`);
        }

        self._metadata.updateInvites(data.userInvites);
        self.saveClientSettings();
        return data.inviteCode;
    }


    processInviteDeleted(self, msg){
        assert(Message.verifyMessage(self._metadata.getTAPublicKey(), msg), "TA signature is invalid")
        let data = JSON.parse(ChatUtility.decryptStandardMessage(msg.body.data, self.privateKey))
        console.log(`Invites data has been decrypted successfully.`);
        self._metadata.updateInvites(data.userInvites);
        self.saveClientSettings();
        self.uxBus.emit(TopicEvents.INVITE_DELETED, {
            pkfp: this.pkfp,
            userInvites: data.userInvites
        })
    }

    getParticipantAlias(pkfp){
        if(!this.isBootstrapped || !pkfp){
            return
        }
        return this._metadata.getParticipantAlias(pkfp)
    }

    getParticipants(){
        let res = JSON.parse(JSON.stringify(this._metadata.body.participants))
        Object.keys(res).forEach(k =>{
            res[k].alias = this._metadata.getParticipantAlias(k)
            res[k].nickname = this._metadata.getParticipantNickname(k)
        })
        return res;
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

    ensureBootstrapped(){
        if(!this.isBootstrapped || !this.connector || !this.arrivalHub){
            throw new Error("Topic is not bootstrapped!");
        }
    }

    setName(name){
        this.name = name;
    }

    setPrivate(pkfp){
        assert(this.hasParticipant(pkfp), `Set private error: no member found ${pkfp}`)
        this.lastPrivate = pkfp;
    }

    getPrivate(pkfp){
        return this.lastPrivate;
    }

    resetPrivate(){
        this.lastPrivate = null
    }

    //Verifies current metadata
    verifyMetadata(){
        return Metadata.isMetadataValid(this._metadata)
    }

    setTopicName(name){
        assert(inRange(name.length, 2, 30) , `Topic name is invalid`)
        this.name = name;
    }

    getLastMessageId(){
        for (let msg of this.messages){
            if (msg.header && msg.header.id) return msg.header.id
        }

        return null;

    }


    //returns last n messages since the very last one
    //or since id if it is passed
    getLastMessages(howMany, id){
        let res;
        if(id){
            let lastMessage = this.messages.find(msg=>msg.header.id === id)
            let index = this.messages.indexOf(lastMessage);
            res = this.messages.slice(index, index+howMany)

        }else{
            res = this.messages.slice(0, howMany)
        }


        //if needToLoadMoreMessages
        //   startLoadingMessages()

        if(this.isMoreMessagesNeeded(howMany, id)){
            this._messageFetcherSM.handle.fetch(howMany * 3)
        }
        return res
    }

    //Determins whether it is needed to fetch more chat messages
    // from the island
    isMoreMessagesNeeded(lastRequestedHowMany, lastRequestedId ){
        console.log("CHECKING IF MORE MESSAGES NEEDED");

        //if all messages are already loaded, then the answer is no
        if (this.areAllMessagesLoaded()){
            console.log("ALL LOADED not needed");
            return false;

        }

        //otherwise we take last requested result and making sure we have
        // at least twice as many

        let index = 0
        if(lastRequestedId){
            let lastMessage = this.messages.find(message=>message.header.id === lastRequestedId)
            index = this.messages.indexOf(lastMessage);
        }

        if(this.messages.slice(index).length >= lastRequestedHowMany * 3){

            console.log("Still have enough messages. ");
            return false
        }

        console.log("NEED TO LOAD MORE MESSAGES");
        return true;
    }


}



export const TopicEvents = {
    MESSAGES_LOADED: Symbol("messages_loaded"),
    NEW_CHAT_MESSAGE: Symbol("new_chat_message"),
    INVITE_CREATED: Symbol("invite_created"),
    INVITE_DELETED: Symbol("invite_deleted"),
    NEW_PARTICIPANT_JOINED: Symbol("new_participant"),
    PARTICIPANT_EXCLUDED: Symbol("participant_booted"),
    INVITE_CONSUMED: Symbol("invite_consumed"),
    SETTINGS_UPDATED: Symbol("settings_updated")
}
