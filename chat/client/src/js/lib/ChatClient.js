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

                //At this point we have loaded all topic keys, so login is successful
                this.emit(Events.LOGIN_SUCCESS)

                // Post-login
                this.postLogin();
            } catch (err){
                this.emit(Events.LOGIN_ERROR, err);
                console.trace(err)
            }
        })
    }


    // Sends all topic pkfps (ids) to gather metadata and encrypted services
    postLogin(){
        //sending post_login request
        let message = new Message(this.version);
        message.setSource(this.vault.id);
        message.setCommand(Internal.POST_LOGIN);
        message.addNonce();
        message.body.topics = Object.keys(this.topics);
        message.signMessage(this.vault.privateKey);
        this.vault.once(Internal.POST_LOGIN_DECRYPT, (msg)=>{
            this.postLoginDecrypt(msg, this);
        })
        this.messageQueue.enqueue(message);
    }

    // Decrypts topic authorities' and hidden services keys
    // and re-encrypts them with session key, so island can poke all services
   
    postLoginDecrypt(msg, self){
        console.log(`Got decrypt command from server.`)
        //decrypting and sending data back

        let decryptBlob = (privateKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            let symLength = parseInt(blob.substr(-lengthChars))
            let blobLength = blob.length;
            let symk = blob.substring(blobLength- symLength - lengthChars, blobLength-lengthChars );
            let cipher = blob.substring(0, blobLength- symLength - lengthChars);
            icn.addBlob("symcip", symk)
                .addBlob("cipher", cipher)
                .asym.setKey("priv", privateKey, "private")
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .sym.decrypt("cipher", "sym", "blob-raw", true)
            return icn.get("blob-raw")
        };

        let encryptBlob = (publicKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            icn.createSYMKey("sym")
                .asym.setKey("pub", publicKey, "public")
                .addBlob("blob-raw", blob)
                .sym.encrypt("blob-raw", "sym", "blob-cip", true)
                .asym.encrypt("sym", "pub", "symcip", "hex")
                .encodeBlobLength("symcip", 4, "0", "symcipl")
                .merge(["blob-cip", "symcip", "symcipl"], "res")
            return icn.get("res");
        };

        let services = msg.body.services;
        let sessionKey = msg.body.sessionKey;
        let res = {}
        for (let pkfp of Object.keys(services)){
            let topicData = services[pkfp];
            let topicPrivateKey = self.topics[pkfp].privateKey;

            let clientHSPrivateKey, taHSPrivateKey, taPrivateKey;

            if (topicData.clientHSPrivateKey){
                clientHSPrivateKey = decryptBlob(topicPrivateKey, topicData.clientHSPrivateKey)
            }

            if (topicData.topicAuthority && topicData.topicAuthority.taPrivateKey){
                taPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taPrivateKey )
            }

            if (topicData.topicAuthority && topicData.topicAuthority.taHSPrivateKey){
                taHSPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taHSPrivateKey)
            }

            let preDecrypted = {};

            if (clientHSPrivateKey){
                preDecrypted.clientHSPrivateKey = encryptBlob(sessionKey, clientHSPrivateKey)
            }
            if (taPrivateKey || taHSPrivateKey){
                preDecrypted.topicAuthority = {}
            }
            if (taPrivateKey){
                preDecrypted.topicAuthority.taPrivateKey = encryptBlob(sessionKey, taPrivateKey)
            }
            if (taHSPrivateKey){
                preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(sessionKey, taHSPrivateKey)
            }

            res[pkfp] = preDecrypted
        }

        console.log("Decryption is successfull.");
        let message = new Message(self.version);
        message.setCommand(Internal.POST_LOGIN_CHECK_SERVICES)
        message.setSource(self.vault.getId());
        message.body.services = res;
        message.signMessage(self.vault.privateKey);
        self.vault.once(Events.POST_LOGIN_SUCCESS, ()=>{
            console.log("Post login success!");
            self.emit(Events.POST_LOGIN_SUCCESS)
        })
        
        this.messageQueue.enqueue(message);

    }

    //END//////////////////////////////////////////////////////////////////////


    // ---------------------------------------------------------------------------------------------------------------------------
    // Invite handling

    requestInvite(topicId){
        if (!this.topics.hasOwnProperty(topicId)) throw new Error(`Topic ${topicId}, not found`)
        let topic = this.topics[topicId];

    }

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


    getTopics(){
        return this.topics;
    }

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
