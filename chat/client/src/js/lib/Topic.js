import { Events, Internal } from "../../../../common/Events";
import { inRange } from "../../../../common/Util";
import { WildEmitter } from "./WildEmitter";
import { Message } from "./Message";
import { IslandsVersion } from "../../../../common/Version"
import { ChatUtility } from "./ChatUtility";
import { ChatMessage } from "./ChatMessage";
import { assert, IError as Err } from "../../../../common/IError";
import { UXMessage } from "../ui/Common"
import { StateMachine } from "../../../../common/AdvStateMachine"
import { RequestForMessagesFactory } from "./RequestForMessages";
import { SendMessageAgent } from "./SendMessageAgent"
import { VaultEvents } from "./Vault"
import { BootParticipantAgent } from "./BootParticipantAgent"
import { TopicKey, makeTopicKey, makeTopicAuthorityPublicKey } from "./TopicKey"
import { ObjectCollection } from "../../../../common/ObjectCollection"

const  CuteSet =  require("cute-set");
const INITIAL_NUM_MESSAGES = 25



//Topic will receive requests for messages.
//If messages are not already cached on the client,
//Topic will try to fetch more messages from the island.
//To avoid multiple roundtips - the island will request
//number of messages requested times this constant.
const REQUEST_MESSAGES_MULTIPLIER = 3


export class Topic{
    constructor(pkfp, name, key, comment){

        WildEmitter.mixin(this);
        this.pkfp = pkfp;
        this.name = name; // Topic alias. Not shared.
        this.topicKey = makeTopicKey(key);
        this.privateKey = key
        this.comment = comment;
        this.handlers = {};
        this.connector;
        this.arrivalHub;
        this.lastPrivate;
        this.participants = makeParticipants()
        this.messages = [];
        this.settings = {};
        this.invites = new ObjectCollection(invite=>invite.getCode(), obj=> obj instanceof Invite);
        this.getPrivateKey = ()=>{ return key }


        // Metadata variables
        this.metadataId;
        this.metadataSharedKeySignature;
        this.metadataSignatrue;

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

    static prepareNewTopicSettings(nickname, privateKey){
        //Creating and encrypting topic settings:
        let topicKey = makeTopicKey(privateKey)
        return exportSettingsBlob(topicKey, nickname)
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
            this.preprocessIncomingMessage.call(this, msg);
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
        handlers[UXMessage.INVITE_REQUEST] = this.requestInvite
        handlers[UXMessage.GET_LAST_MESSAGES] = this.processGetMessagesRequest
        handlers[UXMessage.SEND_CHAT_MESSAGE] = this.sendChatMessage
        handlers[UXMessage.DELETE_INVITE] = this.deleteInvite
        handlers[VaultEvents.TOPIC_DELETED] = this.processTopicDeleted
        handlers[UXMessage.SET_INVITE_ALIAS] = this.setInviteAlias
        handlers[UXMessage.SET_PARTICIPANT_ALIAS] = this.setParticipantAlias
        handlers[UXMessage.BOOT_PARTICIPANT] = this.bootParticipant

        handlers[UXMessage.CHANGE_MY_NICKNAME] = (data)=>{
            let { nickname } = data;
            this.setParticipantNickname.call(this, nickname, this.pkfp )
        }


        if(pkg.message in handlers){
            handlers[pkg.message].call(this, pkg)
        }
    }

    processTopicDeleted(pkfp){
        if(pkfp === this.pkfp){
            this.uxBus.off(this);
        }
    }


    syncParticipants(incoming = {}){
        let participants = makeParticipants()

        for (let pkfp in incoming){
            let participant = Participant.fromBlob(incoming[pkfp])
            let oldParticipant = this.participants.get(pkfp)
            if(oldParticipant){
                participant.setNickname(oldParticipant.getNickname())
                participant.setAlias(oldParticipant.getAlias())
            }
            participants.add(participant)
        }

        this.participants = participants
    }

    //Called when newly issued metadata arrived
    updateMetadata(metadataBlob){
        let metadata = JSON.parse(metadataBlob);
        this.loadMetadata(metadata)
        this.saveClientSettings();
    }

    bootParticipant(data){
        let { pkfp } = data;
        let agent  = new BootParticipantAgent(this, pkfp, this.connector)
        agent.boot()
    }

    // Metadata must be already JSON parsed.
    loadMetadata(metadata){
        this.syncParticipants(metadata.body.participants)
        this.topicAuthority = TopicAuthority.fromBlob(metadata.body.topicAuthority)
        let { id, timestamp, sharedKeySignature, signature } = metadata.body
        this.metadataId = id;
        this.metadataTimestamp = timestamp
        this.metadataSharedKeySignature = sharedKeySignature
        this.metadataSignatrue = signature
        this.metadataLoaded = true;
    }


    // does reverse of  export settings:
    // Given settings encrypted blob
    // decrypts it and loads all things in current topic
    applySettings(settingsEncrypted){
        try{
            console.log("Applying settings");
            let settings = this.topicKey.decryptSettings(settingsEncrypted);

            // Setting version
            this.settingsVersion = settings.version

            // Setting aliases and nicknames
            let pData = settings.membersData
            for(let participant of this.participants){
                if(participant.pkfp in pData){
                    participant.setNickname(pData[participant.pkfp].nickname)
                    participant.setAlias(pData[participant.pkfp].alias)
                }
            }

            this.invites.deleteAll()
            // Settings aliases for invites
            for (let code in settings.invites){
                this.invites.add(new Invite(code, settings.invites[code].name))
            }
        } catch(err){
            console.error(`Error applying settings ${err}\n ${settingsEncrypted}`);
        }
    }


    exportSettings(){
        let owner = this.participants.get(this.pkfp)
        let settingsEncrypted = exportSettingsBlob(this.topicKey, owner, this.participants, this.invites)

        let signature = this.topicKey.signSettings(settingsEncrypted)

        return {
            settings: settingsEncrypted,
            signature: signature
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

        if(!this.metadataLoaded){
            this.uxBus.emit(TopicEvents.ERROR, "Error sending message: topic is not properly initialized ")
            return
        }
        console.log("SEND CHAT MESSAGE CALLED");
        let sendMessageAgent = new SendMessageAgent(this, request.chatMessage)
        return sendMessageAgent.send();
    }


    setHandlers(){
        this.handlers[Internal.LOAD_MESSAGES_SUCCESS] = this.processMessagesLoaded.bind(this)
        this.handlers[Internal.INVITE_REQUEST_TIMEOUT] = ()=>{
            console.log("Invite request timeout");
        }

        this.handlers[Internal.MESSAGES_SYNC] = msg =>{
            console.log("Got messages sync");
            console.dir(msg)
            if(!msg.body.lastMessages || !msg.body.lastMessages.messages) return;
            for(let chatMsg of msg.body.lastMessages.messages.reverse()){
                this.processIncomingMessage(JSON.parse(chatMsg))
            }
        }


        this.handlers[Internal.INVITE_REQUEST_FAIL] = (msg)=>{
            console.log(`Invite request failed: ${msg.body.errorMsg}`);
        }
        this.handlers[Events.INVITE_CREATED] = (msg)=>{
            console.log("Invite created event");
            let newInvite = this.processInvitesUpdated(msg);
            this.uxBus.emit(TopicEvents.INVITE_CREATED, {
                pkfp: this.pkfp,
                invite: newInvite
            });
        }

        this.handlers[Internal.DELETE_INVITE_SUCCESS] = (msg)=>{
            console.log("Invite deleted event");
            this.processInviteDeleted(msg);
        }

        this.handlers[Internal.SETTINGS_UPDATED] = (msg)=>{
            console.log("Settings updated");
            this.applySettings(msg.body.settings);
            this.uxBus.emit(TopicEvents.SETTINGS_UPDATED, this)
        }

        // THIS REQUIRES REFACTORING
        this.handlers[Internal.METADATA_ISSUE] = (msg) =>{
            console.log(`Metadata issue received. Event: ${msg.headers.event}`)
            console.dir(msg)
            assert(Message.verifyMessage(this.topicAuthority.getPublicKey(), msg), "TA signature is invalid")
            console.log("Signature verified. Loading metadata...");
            this.loadMetadata(JSON.parse(msg.body.metadata));

            // If consumed invite in the message and this toipc has it - delete it
            if(msg.body.invite && this.invites.has(msg.body.invite)){
                //Invite was used by new member:
                this.invites.delete(msg.body.invite);

                //Notify anyone interested
                this.uxBus.emit(TopicEvents.INVITE_CONSUMED, {
                    pkfp: this.pkfp,
                    userInvites: this.invites
                })
            }

            if(msg.headers.event === Events.NEW_MEMBER_JOINED){

                this.uxBus.emit(TopicEvents.NEW_PARTICIPANT_JOINED, {
                    topicPkfp: this.pkfp,
                    pkfp: msg.body.pkfp,
                    nickname: msg.body.nickname
                })
            }


            if (msg.body.inviteePkfp){
                this.nicknameChangeNotify(msg.body.inviteePkfp)
            }


            if(msg.headers.event === "member_booted"){
                console.log("Member booted event received!");
                console.log(msg.body.bootedPkfp);
                console.dir(msg)
                this.uxBus.emit(TopicEvents.PARTICIPANT_EXCLUDED, {
                    topicPkfp: this.pkfp,
                    bootedPkfp: msg.body.bootedPkfp
                })
            }

            this.saveClientSettings();
            console.log("Metadata updated");
            this.emit(Events.METADATA_UPDATED);
        }

        this.handlers[Internal.NICKNAME_INITAL_EXCHANGE] = (msg)=>{
            console.log("Initial nickname exchange request received. Processing");
            let senderPkfp = msg.headers.pkfpSource


            if(!this.participants.has(senderPkfp)){
                console.error( "Member has not yet been registered")
                return
            }
            //assert(Message.verifyMessage(senderPublicKey, msg), "Signature is invalid")
            if(msg.body.metadataId === this.metadataId && msg.body.myNickname){
                console.log("Decrypting new participant nickname...");
                // CRYPTO: Decrypt participant nickname
                let nickname = ChatUtility.symKeyDecrypt(msg.body.myNickname,
                                                         this.getSharedKey())
                console.log(`New member's nickname is ${nickname}`);
                console.log(`My current nickname is ${this.getCurrentNickname()}`);
                this.setParticipantNickname(nickname, senderPkfp);
            }

        }

        //TODO Debug
        this.handlers[Internal.NICKNAME_NOTE] = (msg)=>{
            console.log(`nickname note received: metadataId: ${msg.body[Internal.METADATA_ID]}`);
            let senderPkfp = msg.headers.pkfpSource
            let senderPublicKey = this.participants.get(senderPkfp).publicKey;
            //assert(Message.verifyMessage(senderPublicKey, msg), "Signature is invalid")
            // CRYPTO:  Decrypt shared key
            //let sharedKey = ChatUtility.privateKeyDecrypt(msg.sharedKey, this.privateKey)
            let sharedKey = this.topicKey.decryptSharedKey(msg.sharedKey);
            let currentSharedKey = this.getSharedKey();
            console.log(`Current key: ${currentSharedKey}, received key ${sharedKey}`);
            // CRYPTO:  Decrypt nickname
            let nickname = ChatUtility.symKeyDecrypt(msg.body.nickname, sharedKey)
            console.log(`Participan ${senderPkfp} changed his nickname to ${nickname}` );
            this.setParticipantNickname(nickname, senderPkfp)
        }

        this.handlers[Internal.SERVICE_RECORD] = (msg)=>{
            console.log("New service record arrved")
            let record = msg.body.serviceRecord;
            if (!record){
                console.error("Error: Service record is not found!");
                return;
            }

            record = new ChatMessage(record);
            record.decryptServiceRecord(this.privateKey);
            this.addNewMessage(record);
        }

        this.handlers[Internal.BROADCAST_MESSAGE] = (msg)=>{
            console.log("Broadcast message received");
            let msgCopy = JSON.parse(JSON.stringify(msg))
            // pkfpDest is added by server when message is broadcasted, so to verify it
            // must be deleted
            delete msgCopy.pkfpDest;
            assert(this.participants.has(msg.headers.pkfpSource), `The participant ${msgCopy.pkfpDest} not found`)

            let publicKey = this.participants.get(msg.headers.pkfpSource).publicKey;

            //assert(Message.verifyMessage(publicKey, msgCopy), "Message was not verified")
            let message = new ChatMessage(msg.body.message)
            // CRYPTO: decrypt message
            message.decryptMessage(this.getSharedKey())
            this.addNewMessage(message);

            if(message.header.nickname !== this.getParticipantNickname(msg.headers.pkfpSource)){
                console.log(`Member's nickname has changed from ${this.getParticipantNickname(msg.headers.pkfpSource)} to ${message.header.nickname}`);
                this.setParticipantNickname(message.header.nickname, msg.headers.pkfpSource);
            }

        }

        this.handlers[Internal.SEND_MESSAGE] = (msg)=>{

            assert(this.participants.has(msg.headers.pkfpSource), `The participant ${msg.headers.pkfpDest} not found`)

            let publicKey = this.participants.get(msg.headers.pkfpSource).publicKey;
            assert(Message.verifyMessage(publicKey, msg))
            let message = new ChatMessage(msg.body.message)
            message.decryptPrivateMessage(this.privateKey);
            this.addNewMessage(message);
        }

        this.handlers[Internal.MESSAGE_SENT] = (msg)=>{
            console.log(`Message sent received. Message: ${msg.body.message}`);
            this.processMessageSent(msg)
        }

    }

    //End//////////////////////////////////////////////////////////////////////





    // ---------------------------------------------------------------------------------------------------------------------------
    // MESSAGE HANDLING

    processIncomingMessage(msg){
        let message = new ChatMessage(msg)
        if(message.header.service){
            message.decryptServiceRecord(this.privateKey)
        } else if (message.header.private){
            message.decryptPrivateMessage(this.privateKey)
        } else {
            message.decryptMessage(this.getSharedKey())
        }

        if(!message.header.service){
            if(message.header.nickname !== this.getParticipantNickname(msg.header.author)){
                console.log(`Member's nickname has changed from ${this.getParticipantNickname(msg.header.author)} to ${message.header.nickname}`);
                this.setParticipantNickname(message.header.nickname, msg.header.author);
            }
        }

        this.addNewMessage(message);
    }




    processMessageSent(msg){
        let sentMessage = new ChatMessage(msg.body.message);
            console.log("Setting existing message from pending to delivered")
        let existingMessages = this.messages.filter((m)=>{
            return m.header.id === sentMessage.header.id;
        })
        assert(existingMessages.length < 2, `Message doubling error: ${existingMessages.length}`);
        let existingMessage = existingMessages[0];
        if (existingMessage){
            existingMessage.pending = false;
            this.uxBus.emit(TopicEvents.MESSAGE_SENT, existingMessage);
        } else {
            console.log("Decrypting and adding sent message.");
            sentMessage.header.private ?
                sentMessage.decryptPrivateMessage(this.privateKey) :
                sentMessage.decryptMessage(this.getSharedKey())
            this.addNewMessage(sentMessage);
        }
    }

    addNewMessage(chatMessage){
        console.log(`!!========ADDING NEW CHAT MESSAGE. msgCount: ${this.messages.length} \n${chatMessage.body}`);

        this.messages.splice(0, 0, chatMessage);
        console.log(`Message added. msgCount: ${this.messages.length}`);

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
    preprocessIncomingMessage(msg){
        console.log(`Incoming message on ${this.pkfp} received!`);

        if(this.handlers.hasOwnProperty(msg.headers.command)){
            this.handlers[msg.headers.command].call(this, msg)
        } else if(msg.body.errorMsg){
            this.uxBus.emit(TopicEvents.ERROR, msg.body.errorMsg)
        } else {
            let errMsg = `No handler found for command: ${msg.headers.command}`
            throw new Error(errMsg);
        }
    }

    // Returns _my_ current nickname
    getCurrentNickname(){
        if (!this.metadataLoaded){
            throw new Error("Cannot get current nickname: metadata is not loaded.")
        }

        return this.participants.get(this.pkfp).getNickname()
    }

    getSharedKey(){
        return this.topicKey.decryptSharedKey(this.participants.get(this.pkfp).key)
    }

    getParticipantPublicKey(pkfp){
        return this.participants.get(pkfp).getPublicKey()
    }

    getMetadataId(){
        return this.metadataId
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
            let sharedKeyCipher =  keys[metaIDs[i]]
            keys[metaIDs[i]] = this.topicKey.decryptSharedKey(sharedKeyCipher);
        }

        let messages = data.messages;
        let result = [];
        console.log(`Messages loaded: ${messages.length}`);
        for (let i=0; i<messages.length; ++i){
            let message = new ChatMessage(messages[i]);
            if(message.header.service){
                message.body = this.topicKey.decryptServiceMessageBody(message.body)
            } else if(message.header.private){
                message.decryptPrivateMessage(this.privateKey);

            } else{
                if(!keys.hasOwnProperty(message.header.metadataID)){
                    console.dir(message)
                    console.error(`Warning! No metadata id in message header. Skipping it.`)
                    continue
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
        if(!this.metadataLoaded){
            throw new Error("Metadata has not been loaded yet.")
        }
        setTimeout(()=>{
            let request = new Message(IslandsVersion.getVersion());
            let taPublicKey = this.topicAuthority.getPublicKey();
            let myNickNameEncrypted = ChatUtility.encryptStandardMessage(this.participants.get(this.pkfp).nickname,
                taPublicKey);
            let topicNameEncrypted = ChatUtility.encryptStandardMessage(this.name, taPublicKey);
            request.setCommand(Internal.REQUEST_INVITE);
            request.setSource(this.pkfp);
            request.setDest(this.topicAuthority.getPkfp());
            request.body.nickname = myNickNameEncrypted;
            request.body.topicName = topicNameEncrypted;
            request.signMessage(this.privateKey);
            this.connector.acceptMessage(request);
        }, 100)

    }

    getTopicAuthorityId(){
        return this.topicAuthority.getPkfp();
    }

    setInviteAlias(data){
        let { inviteCode, alias } = data
        let invite = this.invites.get(inviteCode)
        invite.setAlias(alias)
        this.saveClientSettings();
    }

    getInvites(){
        return this.invites
    }

    //TODO:
    //Nothing is calling it
    //When implementing sync this function should be used
    //
    getSyncInvitesRequest(){
        let request = new Message(this.version);
        request.headers.command = "sync_invites";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.signMessage(this.session.privateKey);
        return request
    }


    deleteInvite(data){
        let { inviteCode } = data;
        console.log("About to delete invite: " + inviteCode);
        assert(this.invites.has(inviteCode), `Invite does not exists: ${inviteCode}`)
        let request = new Message(this.version);
        request.headers.command = Internal.DELETE_INVITE;
        request.headers.pkfpSource = this.pkfp;
        request.headers.pkfpDest = this.topicAuthority.getPkfp();
        let body = {
            invite: inviteCode,
        };
        request.set("body", body);
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request);
    }

    //END//////////////////////////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Nickname handling
    exchangeNicknames(){
        console.log(`Attempting to exchange nicknames. Sending my nickname: ${this.getCurrentNickname()}`);
        if(!this.isBootstrapped){
            console.log("Cannot exchange nicknames: topic not bootstrapped.");
            return;
        }
        let myNicknameRaw = this.getCurrentNickname();
        let myNickname = ChatUtility.symKeyEncrypt(myNicknameRaw,  this.getSharedKey());
        let request = Message.createRequest(this.version,
                                            this.pkfp,
                                            Internal.NICKNAME_INITAL_EXCHANGE)
        request.body.metadataId = this.metadataId;
        request.body.myNickname = myNickname;
        request.signMessage(this.privateKey);
        this.connector.acceptMessage(request);
        console.log(`Nicknames exchange request sent: nickname: ${myNicknameRaw}`);
    }




    hasParticipant(pkfp){
        return this.participants.has(pkfp)
    }

    getParticipantNickname(pkfp){
        let participant = this.participants.get(pkfp)
        if(participant){
            return participant.getNickname()
        }

        console.log(`WARNING: Participant ${pkfp} not found`);
    }

    setParticipantNickname(nickname, pkfp){

        let participant = this.participants.get(pkfp)

        console.log(`Setting participant nickname to ${nickname}`);

        participant.setNickname(nickname)
        this.saveClientSettings();
        if (pkfp === this.pkfp){
            this.nicknameChangeNotify()
        }

    }

    setParticipantAlias(data){
        let { alias, pkfp } = data
        this.participants.get(pkfp).setAlias(alias)
        this.saveClientSettings();
    }

    getParticipantAlias(pkfp){

        let participant = this.participants.get(pkfp)
        if(participant){
            return participant.getAlias()
        }


        console.log(`WARNING: Participant ${pkfp} not found`);
    }

    nicknameChangeNotify(pkfp){
        let curNickname = this.getCurrentNickname()
        let sharedKey = this.getSharedKey()
        console.log(`%c Sending current nickname: ${curNickname}. Encrypting with: ${sharedKey}`, "color: red, size: 20px");
        let message = new Message(this.version);
        message.setCommand(Internal.NICKNAME_NOTE)
        message.setSource(this.pkfp);
        if(pkfp){
            message.setDest(pkfp);
        }
        message.addNonce();
        message.setAttribute("nickname",
                            ChatUtility.symKeyEncrypt(curNickname, sharedKey));
        message.setAttribute(Internal.METADATA_ID, this.getMetadataId());
        message.signMessage(this.privateKey);
        this.connector.acceptMessage(message);
    }



    processNicknameResponse(request){
        this._processNicknameResponseHelper(request, this)
    }

    processNicknameChangeNote(request){
        this._processNicknameResponseHelper(request, this, true)
    }

    _processNicknameResponseHelper(request, broadcast = false){
        console.log("Got nickname response");
        let publicKey = this.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, request)){
            console.trace("Invalid signature");
            return
        }
        let existingNickname = this.getMemberNicknamr(request.headers.pkfpSource);
        let memberRepr = this.getMemberRepr(request.headers.pkfpSource);
        let newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, this.session.metadata.sharedKey) :
            ChatUtility.decryptStandardMessage(request.body.nickname, this.session.privateKey);
        newNickname = newNickname.toString("utf8");

        if( newNickname !== existingNickname){
            this.setParticipantNickname(newNickname, request.headers.pkfpSource);
            this.saveClientSettings();
            if(existingNickname && existingNickname !== ""){
                this.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
            }
        }
    }

    //~END NICKNAME HANDLING///////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Settings handling

    saveClientSettings(){
        let body = this.exportSettings()
        console.log(`Saving client settings`);
        console.dir(body);
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
        let request = new Message(this.version);
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
        console.log(`ALL MESSAGES LOADED: ${this.allMessagesLoaded}`);
        return this.allMessagesLoaded;
    }

    processInvitesUpdated(msg){
        assert(Message.verifyMessage(this.topicAuthority.getPublicKey(), msg), "TA signature is invalid")
        let data = JSON.parse(ChatUtility.decryptStandardMessage(msg.body.data, this.privateKey))

        console.log(`Invites data has been decrypted successfully.`);
        if (data.inviteCode){
            console.log(`New invite: ${data.inviteCode}`);
        }

        this.updateInvites(data.userInvites);
        this.saveClientSettings();
        return data.inviteCode;
    }


    /**
     * This function is called when
     * invites update received from
     * toipc authority.
     *
     * Invites is just anarray of codes
     * After updating invites settings must be saved to persist the effect
     * */
    updateInvites(invites){

        let invitesSet = new CuteSet(invites);

        for(let code of invitesSet){
            if(!this.invites.has(code)){
                this.invites.add(new Invite(code))
            }
        }

        for(let invite of this.invites){
            if(!invitesSet.has(invite.getCode())){
                this.invites.delete(invite)
            }
        }
    }


    processInviteDeleted(msg){
        assert(Message.verifyMessage(this.topicAuthority.getPublicKey(), msg), "TA signature is invalid")
        let data = JSON.parse(ChatUtility.decryptStandardMessage(msg.body.data, this.privateKey))
        console.log(`Invites data has been decrypted successfully.`);
        this.updateInvites(data.userInvites);
        this.saveClientSettings();

        this.uxBus.emit(TopicEvents.INVITE_DELETED, {
             pkfp: this.pkfp,
             userInvites: this.invites
        })
    }


    getParticipants(){
        return this.participants
    }

    getParticipantRepr(pkfp){
        return this.paticipants.get(pkfp).repr()
    }

    getPublicKey(){
        return this.topicKey.getPublicKey();
    }

    ensureInitLoaded(){
        if(!this.initLoaded){
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

    resetPrivate(){
        this.lastPrivate = null
    }

    setTopicName(name){
        if(!inRange(name.length, 2, 30)){
            console.error("Topic name is invalid")
        }
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
            this._messageFetcherSM.handle.fetch(howMany * REQUEST_MESSAGES_MULTIPLIER)
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

    static validateProcessInitParameters(key, pkfp, name){
        // CRYPTO: fingerprint calculation
        let topicKey = makeTopicKey(key)
        let derivedPkfp = topicKey.pkfp()
        if(derivedPkfp !== pkfp){
            console.warn(`Topic validation of init parameters: Error, invalid public key fingerprint: ${pkfp}. Derived: ${derivedPkfp}`)
        }
        return {
            name: name,
            key: key,
            pkfp: derivedPkfp
        }
    }
}


export class TopicCreator {
    constructor(nickname, topicName, session, vault, uxBus) {
        WildEmitter.mixin(this)
        this.nickname = nickname;
        this.topicName = topicName;
        this.session = session;
        this.vault = vault;
        this.uxBus = uxBus;
        this.sm = this._prepareStateMachine();

        //TODO GET RID OF SESSION KEY HERE!
        this.sessionKey = vault.sessionKey
        this.version = vault.version

    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS

    run(){
        this.sm.handle.run()
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Topic Creator SM",
            stateMap: {
                ready: {
                    initial: true,
                    transitions: {
                        run: {
                            state: "creatingTopic",
                            actions: this._initTopic
                        }
                    }
                },
                creatingTopic: {
                    transitions: {
                        success: {
                            state: "success",
                            actions: []
                        },

                        error: {
                            state: "error",
                            actions: []
                        }
                    }
                },
                success: {
//                    entry: this._addTopicToVault,
                    final: true
                },
                error: {
                    entry: this._processTopicCreateError,
                    final: true
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    async _initTopic(args) {
        console.log("Init topic top of the function");
        let nickname = this.nickname;
        let topicName = this.topicName;

        console.log("Checking input");
        nickname = String(nickname).trim();
        if (!nickname || !/^.{2,20}$/.test(nickname)) {
            console.log("Nickname entered is invalid");
            this.uxBus.emit(Events.INIT_TOPIC_ERROR,
                `Nickname entered is invalid`);
            return;
        }
        if (!/^.{0,20}$/.test(topicName)) {

            console.log("Topic name entered is invalid");
            this.uxBus.emit(Events.INIT_TOPIC_ERROR,
                `Topic name entered is invalid`);
            return;
        }

        console.log("Generating keys");
        //CREATE NEW TOPIC PENDING
        let ownerKey = makeTopicKey()
        let taKey = makeTopicKey()


        //Forming request
        //These are topic authority keypair and owner's public key
        let newTopicData = {
            topicKeyPair: { publicKey: taKey.getPublicKey(), privateKey: taKey.raw() },
            ownerPublicKey: ownerKey.getPublicKey()
        };

        console.log("Preparing request");

        //initializing topic settings
        let settings = exportSettingsBlob(ownerKey, {
            getNickname: ()=>this.nickname,
            getAlias: ()=>"",
            pkfp: ownerKey.pkfp()
        })

        let vault = this.vault;

        let vaultRecord = vault.prepareVaultTopicRecord(
            this.version,
            ownerKey.pkfp(),
            ownerKey.raw(),
            topicName)

        //Preparing request
        let request = new Message(vault.version);
        request.headers.command = Internal.INIT_TOPIC;
        request.headers.pkfpSource = vault.id;
        request.body.topicID = ownerKey.pkfp();
        request.body.topicPkfp = ownerKey.pkfp();
        request.body.settings = settings;
        request.body.ownerPublicKey = ownerKey.getPublicKey();
        request.body.newTopicData = newTopicData;
        request.body.vaultRecord = vaultRecord;
        request.body.vaultId = vault.id;
        request.signMessage(vault.privateKey)
        this.session.acceptMessage(request)
    }


    _processTopicCreateError(args){
        console.log(`Error creating topic ${args[0]}`);
    }
}


class Participant{
    constructor(publicKey, residence, rights, pkfp, key){
        this.publicKey = publicKey;
        this.residence = residence;
        this.rights = rights;
        this.pkfp = pkfp;
        this.key = key;
        this.alias = "";
        this.nickname = "Unknown";
    }


    static fromBlob(blob){
        let { publicKey, residence, rights, pkfp, key } = blob
        return new Participant(publicKey, residence, rights, pkfp, key)
    }

    setAlias(alias){
        this.alias = alias

    }

    getAlias(){
        return this.alias
    }

    setNickname(nickname){
        this.nickname = nickname
    }

    getNickname(){
        return this.nickname
    }

    repr(){
        return "repr"
    }

    static validateParticipant(p){
        if(!(p instanceof Participant)){
            throw new TypeError("Participant type is invalid")
        }
    }
}


function makeParticipants(){
        return  new ObjectCollection(participant=>participant.pkfp, participant=>participant instanceof Participant);
}


class TopicAuthority{
    constructor(pkfp, publicKey, residence){
        this.pkfp = pkfp;
        this.key = makeTopicAuthorityPublicKey(publicKey)
        this.residence = residence;
    }


    static fromBlob(blob){
        let { pkfp, publicKey, residence } = blob
        return new TopicAuthority(pkfp, publicKey, residence)
    }

    getPkfp(){
        return this.pkfp
    }


    getPublicKey(){
        return this.key.raw()
    }

}


/**
    * Given all ingridients creates settings object
    * that can be encrypted and exported.
    *
    * */
export function exportSettingsBlob(key, owner,
                            participants = new ObjectCollection(p=>p.pkfp, p=>p instanceof Participant),
                            invites = new ObjectCollection(i=>i.getCode(), i=>i instanceof Invite)){
    let settings = {
        version: IslandsVersion.getVersion(),
        membersData: {},
        invites: {}
    }
    settings.nickname = owner.getNickname()

    for(let participant of participants){
        settings.membersData[participant.pkfp] = {
            nickname: participant.getNickname(),
            alias: participant.getAlias()
        }
    }

    //overwrite the owner
    settings.membersData[owner.pkfp] = {
        nickname: owner.getNickname(),
        alias: owner.getAlias()
    }

    for (let invite of invites){
        settings.invites[invite.getCode()] = {
            name: invite.getAlias()
        }
    }

    return key.encryptSettings(settings)
}



class Invite{
    constructor(code, alias = ""){
        this.code = code;
        this.alias = alias
    }

    getCode(){
        return this.code
    }

    getAlias(){
        return this.alias
    }

    setAlias(alias){
        this.alias = alias
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
    SETTINGS_UPDATED: Symbol("settings_updated"),
    MESSAGE_SENT: Symbol("message_sent"),
    ERROR: Symbol("error")
}
