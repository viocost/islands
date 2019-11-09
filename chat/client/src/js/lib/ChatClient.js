import { WildEmitter } from "./WildEmitter";
import { Events, Internal } from "../../../../common/Events";
import { Vault } from "./Vault"
import { XHR } from "./xhr";
import { Connector } from "./Connector";
import { MessageQueue } from  "./MessageQueue";
import { ArrivalHub } from "./ArrivalHub";
import  { ChatUtility }  from "./ChatUtility";
import { Message } from "./Message";
import  { Metadata } from "./Metadata";
import  { Participant}  from "./Participant";
import  { AttachmentInfo } from "./AttachmentInfo";
import { ClientSettings } from  "./ClientSettings";
import { iCrypto } from "./iCrypto"

export class ChatClient{
    constructor(opts){
        WildEmitter.mixin(this);
        if(!opts.version){
            throw new Error("Version required!");
        }
        this.version = opts.version;
        this.vault;
        this.topics;
        this.messageQueue;
        this.connector;
        this.arrivalHub;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Login and session initialization
    initSession(password){
        setImmediate(async ()=>{
            try{
                if (!password){
                    throw new Error("Password is missing.")
                }
                console.log("Initializing session");
                let response = await this.getVault();
                if (!response.vault){
                    throw new Error("Vault not found")
                }

                this.vault = new Vault()
                let vault = response.vault;
                let vaultId = response.vaultId;
                console.log("Got vault. Initializing");
                //Initialize vault

                this.vault.initSaved(vault, password)
                this.vault.setId(vaultId);
                console.log("Vault initialized. Initializing connector...");


                //Initialize multiplexor socket
                this.connector = new Connector();

                //Initializing arrival hub
                this.arrivalHub = new ArrivalHub(this.connector);


                //bootstrapping vault
                this.vault.bootstrap(this.arrivalHub);


                await this.connector.establishConnection(vaultId);
                console.log("Connection established. Initializing arrival hub..");

                //Initialize message queue
                this.messageQueue = new MessageQueue(this.connector);

                console.log(`Initializing topic listeners...`);
                this.topics = this.vault.topics;
                for(let pkfp of Object.keys(this.topics)){
                    this.topics[pkfp].bootstrap(this.messageQueue, this.arrivalHub, this.version);
                }
                //Initialize topic instances
                this.emit(Events.LOGIN_SUCCESS)

                // Post-login
                this.postLogin();
            } catch (err){
                this.emit(Events.LOGIN_ERROR, err);
                console.trace(err)
            }
        })
    }

    // Check hidden services
    // Check topic authorities
    // Load current metadata for all topics in the vault
    postLogin(){
        //sending post_login request
        let message = new Message(this.version);
        message.setSource(this.vault.id);
        message.setCommand(Internal.POST_LOGIN);
        message.addNonce();
        message.body.topics = Object.keys(this.topics);
        message.signMessage(this.vault.privateKey);
        this.vault.once(Internal.POST_LOGIN_DECRYPT, this.postLoginDecrypt)
        this.messageQueue.enqueue(message);
    }

    postLoginDecrypt(msg){
        console.log(`Got decrypt command from server.`)
        //decrypting and sending data back

    }

    
    //END//////////////////////////////////////////////////////////////////////



    // ---------------------------------------------------------------------------------------------------------------------------
    // Topic creation
    /**
     * Called initially on topic creation
     * @param {String} nickname
     * @param {String} topicName
     * @returns {Promise<any>}
     */
    initTopic(nickname, topicName){
        let self = this;
        setImmediate(async ()=>{
            try{
                nickname = String(nickname).trim();
                if (!nickname || nickname.length < 2){
                    self.emit(Events.INIT_TOPIC_ERROR,
                              `Nickname entered is invalid`);
                    return;
                }

                //CREATE NEW TOPIC PENDING
                let ic = new iCrypto();
                //Generate keypairs one for user, other for topic
                ic = await ic.asym.asyncCreateKeyPair('owner-keys');
                ic = await ic.asym.asyncCreateKeyPair('topic-keys');
                ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                let newTopic = {
                    ownerKeyPair: ic.get("owner-keys"),
                    topicKeyPair: ic.get("topic-keys"),
                    ownerPkfp: ic.get("owner-pkfp"),
                    topicID: ic.get("topic-pkfp"),
                    ownerNickName: nickname,
                    topicName: topicName
                };

                //Request island to init topic creation and get one-time key.
                let request = new Message(self.version);
                request.headers.command = Internal.INIT_TOPIC_GET_TOKEN;
                request.setSource(newTopic.ownerPkfp);
                let body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                };
                request.set("body", body);


                self.arrivalHub.once(newTopic.ownerPkfp, (data)=>{
                    switch(data.headers.response){
                        case Internal.INIT_TOPIC_TOKEN:
                            self.initTopicContinueAfterTokenReceived(self, data, newTopic);
                            break;
                        case Events.INIT_TOPIC_ERROR:
                            self.processInitTopicError(data, self);
                            break;
                        default:
                            console.error(`Invalid topic init response`)
                    }
                })
                self.messageQueue.enqueue(request);
                //this.chatSocket.emit("request", request);
            }catch(err){

                    self.emit(Events.INIT_TOPIC_ERROR,
                              `Nickname entered is invalid`);
                throw err;
            }
        })
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
        let settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName,
            pendingTopic.topicName,
            pendingTopic.ownerKeyPair.publicKey);

        //Preparing request
        let request = new Message(self.version);
        request.headers.command = Internal.INIT_TOPIC;
        request.headers.pkfpSource = pendingTopic.ownerPkfp;
        request.body.topicID = pendingTopic.topicID;
        request.body.settings = settings;
        request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicDataCipher;


        self.arrivalHub.once(pendingTopic.ownerPkfp, (data)=>{
            switch(data.headers.response){
                case Events.INIT_TOPIC_SUCCESS:
                    self.initTopicSuccess(self, data, pendingTopic);
                    break;
                case Events.INIT_TOPIC_ERROR:
                    self.processInitTopicError(data, self);
                    break;
                default:
                    console.error(`Invalid topic init response`)
            }
        })

        //Sending request

        self.messageQueue.enqueue(request);
    }

    initTopicSuccess(self, request, pendingTopic ){
        let pkfp = pendingTopic.pkfp;
        let privateKey = pendingTopic.privateKey;
        let nickname = pendingTopic.nickname;
        self.emit("init_topic_success", {
            pkfp: pendingTopic.ownerPkfp,
            nickname: pendingTopic.ownerNickName,
            privateKey: pendingTopic.ownerKeyPair.privateKey
        });
        //delete self.newTopicPending[request.body.topicID];
    }

    prepareNewTopicSettings(nickname, topicName, publicKey, encrypt = true){
        //Creating and encrypting topic settings:
        let settings = {
            version: version,
            membersData: {},
            soundsOn: true
        };
        if(nickname){
            let ic = new iCrypto;
            ic.asym.setKey("pubk", publicKey, "public")
                .getPublicKeyFingerprint("pubk", "pkfp");
            settings.nickname = nickname;
            settings.membersData[ic.get("pkfp")] = {nickname: nickname};
        }

        if(topicName){
            settings.topicName = topicName;
        }
        if (encrypt){
            return ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey);
        }else {
            return settings;
        }
    }

    //END//////////////////////////////////////////////////////////////////////

    shout(msg){
        this.messageQueue.enqueue(msg)
    }

    whisper(msg){
        this.messageQueue.enqueue(msg)
    }



    async _vaultLogin(vaultData, password){
    }


    async _initMessageQueue(){
        this.messageQueue = new MessageQueue();
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // HELPERS

    //requests vault and returns it
    getVault(){
        return new Promise((resolve, reject)=>{
            XHR({
                type: "post",
                url: "/",
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
