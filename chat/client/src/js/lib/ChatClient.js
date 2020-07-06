import { WildEmitter } from "./WildEmitter";
import { Events, Internal } from "../../../../common/Events";
import { inRange } from "../../../../common/Util";
import { assert } from "../../../../common/IError";
import { Vault } from "./Vault"
import { XHR } from "./xhr";
import { Connector, ConnectionState } from "./Connector";
import { MessageQueue } from  "./MessageQueue";
import { ArrivalHub } from "./ArrivalHub";
import  { ChatUtility }  from "./ChatUtility";
import { Message } from "./Message";
import { Topic } from "./Topic";
import { DownloadAttachmentAgent } from "./DownloadAttachmentAgent";
import { iCrypto } from "./iCrypto"
import { TopicJoinAgent } from "./TopicJoinAgent";
import { SendMessageAgent } from "./SendMessageAgent";
import { BootParticipantAgent } from "./BootParticipantAgent";

export class ChatClient{
    constructor(opts){
        WildEmitter.mixin(this);
        if(!opts.version){
            throw new Error("Version required!");
        }
        if (opts.test){
            this.connectionString = opts.connectionString;
        }
        this.version = opts.version;
        this.vault;
        this.topics;
        this.connector;
        this.arrivalHub;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Login and session initialization


    static async fetchVault(){
        let url = "/";
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if(!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
        return await response.json()
    }

    processVault(err, data){


    }

    setConnectorListeners(){
        let self = this;
        this.connector.on(Internal.CONNECTION_STATE_CHANGED, state => {
            console.log(`Island connection state changed: ${state}`);
            this.emit(Events.CONNECTION_STATUS_CHANGED, state);
            if(state === ConnectionState.DISCONNECTED || state === ConnectionState.ERROR){
                let lastMessagesIds = {}
                Object.values(self.vault.topics).forEach(topic =>{
                    lastMessagesIds[topic.pkfp] =  topic.getLastMessageId();
                })

                console.log("Setting last messages ids for reconnect");
                self.connector.setConnectionQueryProperty("lastMessagesIds", lastMessagesIds);
            }
        })
    }

    getConnectionState(){
        return this.connector.state;
    }

    // Sends all topic pkfps (ids) to gather metadata and encrypted services

    initTopicListeners(topic){
        topic.on(Events.MESSAGES_LOADED, (messages)=>{
            this.emit(Events.MESSAGES_LOADED, {pkfp: topic.pkfp, messages: messages})
        })

        topic.on(Events.INVITE_CREATED, (inviteCode)=>{
            this.emit(Events.INVITE_CREATED, {pkfp: topic.pkfp, inviteCode: inviteCode})
        })

        topic.on(Events.NEW_CHAT_MESSAGE, (msg, pkfp)=>{
            this.emit(Events.NEW_CHAT_MESSAGE, msg, topic.pkfp);
        })

        topic.on(Events.METADATA_UPDATED, ()=>{
            this.emit(Events.METADATA_UPDATED, topic.pkfp);
        })

        topic.on(Events.SETTINGS_UPDATED, ()=>{
            this.emit(Events.SETTINGS_UPDATED, topic.pkfp);
        })

        ///////////////////////////////////////////////////////////
        // topic.on(Events.NICKNAME_CHANGED, (data)=>{           //
        //     this.emit(Events.NICKNAME_CHANGED, data)          //
        // })                                                    //
        //                                                       //
        // topic.on(Events.PARTICIPANT_ALIAS_CHANGED, (data)=>{  //
        //     this.emit(Events.PARTICIPANT_ALIAS_CHANGED, data) //
        // })                                                    //
        //                                                       //
        // topic.on(Events.INVITE_ALIAS_CHANGED, (data)=>{       //
        //     this.emit(Events.INVITE_ALIAS_CHANGED, data)      //
        // })                                                    //
        ///////////////////////////////////////////////////////////
    }
    //END//////////////////////////////////////////////////////////////////////


    // ---------------------------------------------------------------------------------------------------------------------------
    // Invite handling

    requestInvite(topicId){
        if (!this.topics.hasOwnProperty(topicId)) throw new Error(`Topic ${topicId}, not found`)
        let topic = this.topics[topicId];
        topic.requestInvite();

    }

    deleteInvite(topicId, inviteCode){
        if (!this.topics.hasOwnProperty(topicId)) throw new Error(`Topic ${topicId}, not found`)
        let topic = this.topics[topicId];
        topic.deleteInvite(inviteCode);
    }

    getInvites(topicId){
        assert(this.topics.hasOwnProperty(topicId), `Topic ${topicId}, not found`)
        return this.topics[topicId].getInvites();
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Topic creation



    //~END INIT TOPIC//////////////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Sound
    toggleSound(){
        this.emit(Events.SOUND_STATUS, this.vault.toggleSound())

    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // DELETE TOPIC, LEAVE
    deleteTopic(pkfp){
        let self = this
       
        // let privateKey = this.session.privateKey;
        let topic = this.vault.topics[pkfp]
        if (!topic) throw new Error(`Topic ${pkfp} not found`);

        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex")
            .setRSAKey("priv", self.vault.privateKey, "private")
            .privateKeySign("nhex", "priv", "sign")

        let request = new Message(self.version);
        request.setCommand(Internal.DELETE_TOPIC);
        request.setSource(self.vault.id);
        request.body.vaultId = self.vault.id;
        request.body.topicPkfp = pkfp;
        request.body.vaultNonce = ic.get("nhex")
        request.body.vaultSign = ic.get("sign")
        request.addNonce();
        request.signMessage(topic.getPrivateKey());
        self.connector.send(request);
    }


    leaveTopic(pkfp, deleteHistory = true){

        let self = this

        // let privateKey = this.session.privateKey;
        let topic = this.vault.topics[pkfp]
        assert(topic, `Topic ${pkfp} not found`)

        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex")
            .setRSAKey("priv", self.vault.privateKey, "private")
            .privateKeySign("nhex", "priv", "sign")

        let request = new Message(self.version);
        request.setCommand(Internal.LEAVE_TOPIC);
        request.setSource(self.vault.id);
        request.body.vaultId = self.vault.id;
        request.body.topicPkfp = pkfp;
        request.body.deleteHistory = deleteHistory;
        request.body.vaultNonce = ic.get("nhex")
        request.body.vaultSign = ic.get("sign")
        request.addNonce();
        request.signMessage(topic.getPrivateKey());
        self.connector.send(request);
    }

    //~END DELETE TOPIC////////////////////////////////////////////////////////


    // ---------------------------------------------------------------------------------------------------------------------------
    // BOOT PARTICIPANT

    bootParticipant(topicPkfp, participantPkfp){
        let topic = this.topics[topicPkfp.trim()];
        assert(topic, `No topic found: ${topicPkfp}`);
        assert(topic.hasParticipant(participantPkfp.trim()), `No participant found: ${participantPkfp}`)
        let bootAgent = new BootParticipantAgent(topic, participantPkfp, this.connector)
        console.log("Proceeding participant boot");
        bootAgent.boot();
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // TOPIC JOIN

    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */
    async joinTopic(nickname, topicName, inviteString) {
        let topicJoinAgent = new TopicJoinAgent(nickname, topicName, inviteString, this.arrivalHub, this.connector, this.vault);
        let self = this;
        topicJoinAgent.on(Internal.JOIN_TOPIC_SUCCESS, (data)=>{
            // data is object: { pkfp: pkfp, nickname: nickname }
            self.initTopicListeners(self.topics[data.pkfp])
            self.emit(Events.TOPIC_JOINED, data)
        })
        topicJoinAgent.on(Internal.JOIN_TOPIC_FAIL, ()=>{ console.log("Join topic fail received from the agent")})
        topicJoinAgent.start()
    }


    getTopicName(pkfp){
        if(!this.topics.hasOwnProperty(pkfp)){
            throw new Error(`Topic ${pkfp} does not exist`)
        }
        return this.topics[pkfp].name
    }

    onSuccessfullSettingsUpdate(response, self){
        console.log("Settings successfully updated!");
        self.emit("settings_updated");
    }






    /**
     * New token on init topic received. Proceeding with topic creation
     * @param response
     * @param self
     */
    initTopicContinueAfterTokenReceived(self, response, pendingTopic){

        console.log("Token received, continuing creating topic");

        let token = response.body.token; // Token is 1-time disposable public key generated by server

        //Forming request
        let newTopicData = {
            topicKeyPair: pendingTopic.topicKeyPair,
            ownerPublicKey: pendingTopic.ownerKeyPair.publicKey,
        };

        let newTopicDataCipher = ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token);

        //initializing topic settings
        let settings = Topic.prepareNewTopicSettings(self.version, pendingTopic.ownerNickName,
            pendingTopic.topicName,
            pendingTopic.ownerKeyPair.publicKey);

        let vaultRecord = self.vault.prepareVaultTopicRecord(this.version,
                                                             pendingTopic.ownerPkfp,
                                                             pendingTopic.ownerKeyPair.privateKey,
                                                             pendingTopic.topicName)

        //Preparing request
        let request = new Message(self.version);
        request.headers.command = Internal.INIT_TOPIC;
        request.headers.pkfpSource = pendingTopic.ownerPkfp;
        request.body.topicID = pendingTopic.topicID;
        request.body.settings = settings;
        request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicDataCipher;
        request.body.vaultRecord = vaultRecord;
        request.body.vaultId = self.vault.id;


        self.arrivalHub.once(pendingTopic.ownerPkfp, (data)=>{
            switch(data.headers.message){
                case Events.INIT_TOPIC_SUCCESS:
                    self.initTopicSuccess(self, data, pendingTopic);
                    break;
                case Events.INIT_TOPIC_ERROR:
                    self.processInitTopicError(data, self);
                    console.error("Init topic error");
                    console.error(data.headers.error);
                    self.emit(Events.INIT_TOPIC_ERROR);
                    break;
                default:
                    console.error(`Invalid topic init response: ${data.headers.message}`)
            }
        })

        //Sending request

        self.connector.send(request);
    }

    initTopicSuccess(self, request, pendingTopic ){

        let pkfp = pendingTopic.ownerPkfp;
        let privateKey = pendingTopic.ownerKeyPair.privateKey;
        let nickname = pendingTopic.ownerNickName;
        let topicName = pendingTopic.topicName;

        let topic = self.vault.addTopic(pkfp, topicName, privateKey);
        topic.bootstrap(self.connector, self.arrivalHub, self.version);
        topic.loadMetadata(data.body.metadata);
        self.vault.save(Internal.TOPIC_ADDED);

        // Add new topic to vault and save it


        self.emit("init_topic_success", {
            pkfp: pendingTopic.ownerPkfp,
            nickname: pendingTopic.ownerNickName,
            privateKey: pendingTopic.ownerKeyPair.privateKey
        });
        //delete self.newTopicPending[request.body.topicID];
    }

    renameTopic(topicPkfp, name){
        this.vault.renameTopic(topicPkfp, name);
    }






    //END//////////////////////////////////////////////////////////////////////

    // ---------------------------------------------------------------------------------------------------------------------------
    // Main API methods used by UI

    // Given topic pkfp request loaded messages
    getMessages(pkfp){
        console.log(`Get messages request on Chat`);
        let self = this
        if (!self.topics[pkfp])
            throw new Error(`Topic ${pkfp} not found!`)
        setTimeout(()=>{
            self.topics[pkfp].getMessages()
        }, 50)
    }

    async getMessagesAsync(pkfp){
        assert(this.topics[pkfp], `Topic ${pkfp} not found!`)
        return this.topics[pkfp].getMessagesAsync();
    }

    getParticipantNickname(topicPkfp, participantPkfp){

        if (!this.topics[topicPkfp]){
            throw new Error(`Topic ${topicPkfp} not found`)
        }
        return this.topics[topicPkfp].getParticipantNickname(participantPkfp);
    }

    getParticipantAlias(topicPkfp, participantPkfp){
        if (!this.topics[topicPkfp]){
            throw new Error(`Topic ${topicPkfp} not found`)
        }
        return this.topics[topicPkfp].getParticipantAlias(participantPkfp);
    }

    setParticipantAlias(topicPkfp, participantPkfp, newAlias){
        assert(this.topics[topicPkfp], `Topic ${topicPkfp}, not found`)
        this.topics[topicPkfp].setParticipantAlias(newAlias, participantPkfp)
    }

    changeNickname(topicPkfp, newNickname){
        assert(this.topics[topicPkfp], `Topic ${topicPkfp}, not found`)
        assert(newNickname && inRange(newNickname.length, 3, 30), `New nickname length is invalid`)
        this.topics[topicPkfp].setParticipantNickname(newNickname, topicPkfp); //here topic is the same as particiapnt pkfp
    }

    setInviteAlias(topicPkfp, inviteCode, alias){
        assert(this.topics[topicPkfp], `Topic ${topicPkfp}, not found`)
        this.topics[topicPkfp].setInviteAlias(inviteCode, alias);
    }

    // Sends message
    sendMessage(msg, topicPkfp, recipient, files, onFilesUploaded){
        console.log(`Chat client send message called: ${msg} ${topicPkfp} ${recipient}`);
        let topic = this.topics[topicPkfp]

        if (!topic){
            throw new Error(`Topic ${topicPkfp} not found`)
        }
        let sendMessageAgent = new SendMessageAgent(topic, msg, recipient, files, onFilesUploaded)
        return sendMessageAgent.send();
    }

    downloadAttachment(fileInfo, topicPkfp){
        assert(this.topics[topicPkfp], "Topic is invalid");
        let topic = this.topics[topicPkfp];
        let downloadAttachmentAgent = new DownloadAttachmentAgent(fileInfo, topic);
        downloadAttachmentAgent.once(Events.DOWNLOAD_SUCCESS, (fileData, fileName)=>{
            console.log("Download successful event from agent");
            this.emit(Events.DOWNLOAD_SUCCESS, fileData, fileName);
        })
        downloadAttachmentAgent.once(Events.DOWNLOAD_FAIL, (err)=>{
            this.emit(Events.DOWNLOAD_FAIL, err);
        })


        downloadAttachmentAgent.download();
    }

    loadMoreMessages(topicPkfp){
        assert(this.topics[topicPkfp], "Topic is invalid");
        this.topics[topicPkfp].loadMoreMessages();
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // HELPERS
    //

    getParticipants(topicPkfp){
        if(this.topics.hasOwnProperty(topicPkfp)){
            return this.topics[topicPkfp].getParticipants();
        }
    }

    getTopics(){
        return this.topics;
    }

    getParticipantRepr(topicPkfp, participantPkfp){
        if (!this.topics[topicPkfp]){
            throw new Error(`Topic ${topicPkfp} not found`)
        }
        return this.topics[topicPkfp].getParticipantRepr(participantPkfp);
    }

    //requests vault and returns it
    getVault(){
        let url = "/";
        if (this.connectionString){
            url = this.connectionString;
        }
        return new Promise((resolve, reject)=>{
            XHR({
                type: "post",
                url: url,
                success: (data)=>{
                    console.log("Vault obtained. Processing...");
                    try{
                        resolve(data)
                    }catch(err){
                        reject(err);
                    }
                },
                error: err => {
                    reject(err);
                }
            })
        })
    }


}
