import { IError as Err }  from "../../../../common/IError";
import { verifyPassword } from "./PasswordVerify";
import { Topic } from "../lib/Topic";
import { iCrypto } from "../../../../common/iCrypto";
import { WildEmitter } from "./WildEmitter";
import { IslandsVersion } from "../../../../common/Version"
import { Message } from "./Message";
import { Events, Internal  } from "../../../../common/Events";
import { assert } from "../../../../common/IError";
import { XHR } from "./xhr"
import * as semver from "semver";
import { fetchJSON } from "./FetchJSON";
import { ChatUtility } from "./ChatUtility";
import { UXMessage } from "../ui/Common"

/**
 * Represents key vault
 *
 *
 */
export class Vault{
    constructor(version){
        WildEmitter.mixin(this);

        this.version = version;
        this.id = null;
        this.pkfp;
        this.initialized = false;
        this.admin = null;
        this.adminKey = null;
        this.topics = {};
        this.publicKey = null;
        this.privateKey = null;
        this.handlers;
        this.connector;
        this.pendingInvites = {}
        this.error = null;
        this.initHandlers();
    }

    isSoundOn(){
        if(this.settings)
            return this.settings.sound;
    }




    static registerVault(password, confirm, version){
        return new Promise((resolve, reject) => {
            setTimeout(()=>{

                try{
                    let result = verifyPassword(password.value.trim(), confirm.value.trim());
                    if(result !== undefined ){
                        reject(new Error(result));
                    }

                    let vault = new Vault();
                    vault.init(password.value.trim(), version);
                    let vaultEncData = vault.pack();
                    let vaultPublicKey = vault.publicKey;

                    let ic = new iCrypto();
                    ic.generateRSAKeyPair("adminkp")
                        .createNonce("n")
                        .privateKeySign("n", "adminkp", "sign")
                        .bytesToHex("n", "nhex");

                    console.log(`Hash: ${vaultEncData.hash}`)
                    if(!vaultEncData.hash){
                        throw new Error("NO HASH!")
                    }
                    XHR({
                        type: "POST",
                        url: "/register",
                        dataType: "json",
                        data: {
                            nonce: ic.get('nhex'),
                            sign: ic.get("sign"),
                            vault: vaultEncData.vault,
                            vaultHash: vaultEncData.hash,
                            vaultSign: vaultEncData.sign,
                            vaultPublicKey: vaultPublicKey,
                        },
                        success: (data, statusText, res) => {
                            if(res.status >= 400){
                                reject(new Error(`Vault registration error: ${res.statusText} Response code ${res.status}, `))
                                return;

                            } else {
                                console.log("VAULT REGISTER SUCCESS");
                                resolve();
                            }
                        },
                        error: err => {

                            console.log(`VAULT REGISTER ERROR: ${err}`);
                            reject(err);
                        }
                    });
                }catch (err){
                    reject(err)
                }
            }, 50)
        })
    }


    static registerAdminVault(passwdEl, confirmEl, version){
        return new Promise((resolve, reject)=>{
            let password = passwdEl.value.trim()
            let result = verifyPassword(password, confirmEl.value.trim());
            if(result !== undefined ){
                throw new Error(result);
            }

            let ic = new iCrypto();
            ic.generateRSAKeyPair("adminkp")
                .createNonce("n")
                .privateKeySign("n", "adminkp", "sign")
                .bytesToHex("n", "nhex");
            let vault = new Vault();
            vault.initAdmin(password, ic.get("adminkp").privateKey, version);


            let vaultEncData = vault.pack();
            let vaultPublicKey = vault.publicKey;
            let adminPublicKey = ic.get("adminkp").publicKey;

            console.log(`sending register request. Hash: ${vaultEncData.hash}`);


            XHR({
                type: "POST",
                url: "/admin",
                dataType: "json",
                data: {
                    action: "admin_setup",
                    adminPublickKey: adminPublicKey,
                    hash: vaultEncData.hash,
                    nonce: ic.get('nhex'),
                    sign: ic.get("sign"),
                    vault: vaultEncData.vault,
                    vaultPublicKey: vaultPublicKey,
                    vaultSign: vaultEncData.sign
                },
                success: () => {
                    console.log("Success admin register");
                    resolve();
                },
                error: err => {
                    console.log(err.message);
                    reject("Fail!" + err);
                }
            });
        })
    }


    initializeSettings(settings){
        this.settings = settings ?
            JSON.parse(JSON.stringify(settings)) :
            { sound: true }
    }


    processVault(args){
        const { vault, vaultId } = args[0]
        console.log(`Processing vault. `);
        //this.initSaved(vault)
        this.setId(vaultId)
    }

    processJSONError(err){
        console.log("Processing json error");
        this.emit("error", err)
    }

    fetchVault(){
        fetchJSON("/vault", this.stateMachine);
    }


    // Given raw topic data as arguments encrytps with password and returns cipher
    prepareVaultTopicRecord(version = Err.required("Version"),
                            pkfp = Err.required("pkfp"),
                            privateKey = Err.required("Private key"),
                            name = Err.required("Name"),
                            settings,
                            comment){
        let topicBlob = JSON.stringify({
            version: version,
            name:  name,
            key:  privateKey,
            settings: settings,
            comment: comment,
            pkfp: pkfp
        })
        let ic = new iCrypto()
        ic.createNonce("salt", 128)
            .encode("salt", "hex", "salt-hex")
            .createPasswordBasedSymKey("key", this.password, "salt-hex")
            .addBlob("topic", topicBlob)
            .AESEncrypt("topic", "key", "cipher", true, "CBC", "utf8")
            .merge(["salt-hex", "cipher"], "blob")
            .setRSAKey("priv", this.privateKey, "private")
            .privateKeySign("cipher", "priv", "sign")
            .encodeBlobLength("sign", 3, "0", "sign-length")
            .merge(["blob", "sign", "sign-length"], "res")
        return ic.get("res")
    }

    initHandlers(){
        let self = this;
        this.handlers = {};

        this.handlers[Internal.POST_LOGIN_DECRYPT] = (msg)=>{ self.emit(Internal.POST_LOGIN_DECRYPT, msg) }
        this.handlers[Events.POST_LOGIN_SUCCESS] = ()=>{ self.emit(Events.POST_LOGIN_SUCCESS); }
        this.handlers[Internal.TOPIC_CREATED] = (msg)=>{
            self.addNewTopic(self, msg)
            self.emit(Internal.TOPIC_CREATED, msg.body.topicPkfp)
        }
        this.handlers[Internal.TOPIC_DELETED] = (msg) =>{
            console.log(`TOPIC DELETED: ${msg.body.topicPkfp}`)
            delete self.topics[msg.body.topicPkfp];
            self.uxBus.emit(VaultEvents.TOPIC_DELETED, msg.body.topicPkfp)
        }

        this.handlers[Events.VAULT_UPDATED] = () =>{
            console.log("Vault updated in vault");
            self.emit(Events.VAULT_UPDATED);

        }

        this.handlers[Internal.SESSION_KEY] = (msg)=>{
            if(!Message.verifyMessage(msg.body.sessionKey, msg)){
                throw new Error("Session key signature is invalid!")
            }
            self.sessionKey = msg.body.sessionKey;
            self.emit(Internal.SESSION_KEY, msg)
        }

        this.handlers[Internal.VAULT_FORMAT_UPDATED] = ()=>{
            console.log("%c VAULT FORMAT UPDATED", "color: red; font-size: 20px");
            this.emit(Internal.VAULT_FORMAT_UPDATED)
        }


        this.handlers[Internal.VAULT_SETTINGS_UPDATED] = ()=>{
            console.log("%c VAULT SETTINGS UPDATED",  "color: red; font-size: 20px");
            this.emit(Internal.VAULT_SETTINGS_UPDATED);
        }


        this.handlers[Internal.VAULT_SETTINGS_UPDATED] = ()=>{
            console.log("%c VAULT  UPDATED",  "color: red; font-size: 20px");
            this.emit(Internal.VAULT_SETTINGS_UPDATED);
        }
    }

    deleteTopic(pkfp){
        let topic = this.topics[pkfp];
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex")
            .setRSAKey("priv", this.privateKey, "private")
            .privateKeySign("nhex", "priv", "sign")

        let request = new Message(IslandsVersion.getVersion());
        request.setCommand(Internal.DELETE_TOPIC);
        request.setSource(this.id);
        request.body.vaultId = this.id;
        request.body.topicPkfp = pkfp;
        request.body.vaultNonce = ic.get("nhex")
        request.body.vaultSign = ic.get("sign")
        request.addNonce();
        request.signMessage(topic.getPrivateKey());
        this.connector.acceptMessage(request);
    }

    /**
     * Given a password creates an empty vault
     * with generated update private key inside
     * @param password
     * @returns {Vault}
     */
    init(password = Err.required(),
         version = Err.required("Version required")){
        if(!password || password.trim === ""){
            throw new Error("Password required");
        }

        //CHECK password strength and reject if not strong enough

        let ic = new iCrypto();
        ic.generateRSAKeyPair("kp")
            .getPublicKeyFingerprint("kp", "pkfp")
        //Create new Vault object
        this.password = password;
        this.topics = {};
        this.privateKey = ic.get("kp").privateKey;
        this.publicKey = ic.get("kp").publicKey;
        this.pkfp = ic.get("pkfp");
        this.version = version;
        this.initialized = true;
        this.getPrivateKey = ()=>{ return ic.get("kp").privateKey }
    }


    /**
     * Given a password and a key
     * initializes a vault, creates update key
     * sets it to admin vault and sets admin private key
     *
     * @param password
     * @param adminKey
     * @returns {Vault}
     */
    initAdmin(password, adminKey, version = Err.required("Version required!")){
        this.init(password, version);
        this.admin = true;
        this.adminKey = adminKey;

    }



    initSaved(vaultRaw = Err.required("Vault parse: vaultRaw parameter missing")){
        //Populating new object

        this.adminKey = vaultRaw.adminKey;
        this.admin = vaultRaw.admin;

        this.publicKey = vaultRaw.publicKey;
        this.privateKey = vaultRaw.privateKey;

        //settings
        if(vaultRaw.settings){
            this.settings = JSON.parse(JSON.stringify(vaultRaw.settings));
        } else {
            this.settings = {
                sound: true
            }
        }


        if(!vaultRaw.pkfp){
            ic.setRSAKey("pub", vaultRaw.publicKey, "public")
              .getPublicKeyFingerprint("pub", "pkfp");
            this.pkfp = ic.get("pkfp");
        } else {
            this.pkfp = vaultRaw.pkfp;
        }

        if (!vaultRaw.version || semver.lt(vaultRaw.version, "2.0.0")){
            // TODO format update required!
            console.log(`vault format update required to version ${version}`)
            let self = this;
            this.version = version;
            this.versionUpdate = async ()=>{
                console.log("!!!Version update lambda");
                await  self.updateVaultFormat(vaultRaw)
            };
        }
    }


    async updateVaultFormat(data){
        if (typeof data.topics === "object"){


            Object.keys(data.topics).forEach((pkfp)=>{
                this.topics[pkfp] = new Topic(
                    pkfp,
                    data.topics[pkfp].name,
                    data.topics[pkfp].key,
                    data.topics[pkfp].comment);
            });

        }
        this.save("update_format")

    }

    setId(id = Err.required("ID is required")){
        this.id = id;
    }

    getId(){
        return this.id;
    }

    isAdmin(){
        return this.admin;
    }

    bootstrap(arrivalHub, connector, version, uxBus){
        this.arrivalHub = arrivalHub;
        this.connector = connector;
        this.version = version;
        this.uxBus = uxBus;

        uxBus.on(UXMessage.DELETE_TOPIC, pkfp=>{
            this.deleteTopic(pkfp);
        })

        this.arrivalHub.on(this.id, (msg)=>{
            this.processIncomingMessage(msg, this);
        })

        ////////////////////////////////////////////////////////
        // if(this.versionUpdate){                            //
        //     console.log("Updating vault to new format.."); //
        //     await this.versionUpdate();                    //
        // }                                                  //
        ////////////////////////////////////////////////////////
    }


    renameTopic(pkfp, name){
        assert(this.topics[pkfp], `Topic ${pkfp} does not exist`)
        let topic = this.topics[pkfp]
        topic.setTopicName(name);
        this.save(Internal.TOPIC_UPDATED);
    }

    processIncomingMessage(msg, self){
        console.log("Processing vault incoming message");
        if (msg.headers.error){
            throw new Error(`Error received: ${msg.headers.error}. WARNING ERROR HADLING NOT IMPLEMENTED!!!`)
        }
        if (!self.handlers.hasOwnProperty(msg.headers.command)){
            console.error(`Invalid vault command received: ${msg.headers.command}`)
            return
        }
        self.handlers[msg.headers.command](msg);
    }

    // Saves current sate of the vault on the island
    // cause - reasoun for vault update
    save(cause){
        if (!this.password || !this.privateKey || !this.topics){
            throw new Error("Vault object structure is not valid");
        }

        let { vault, topics, hash, sign } = this.pack();
        let message = new Message(this.version);
        message.setSource(this.id);
        message.setCommand(Internal.SAVE_VAULT);
        message.addNonce();
        message.body.vault = vault;
        message.body.sign = sign;
        message.body.hash = hash;
        message.body.topics = topics;
        message.body.cause = cause;
        message.signMessage(this.privateKey);

        console.log("SAVING VAULT");
        this.connector.acceptMessage(message)
    }

    saveVaultSettings(){
        let { vault, hash, sign } = this.pack();

        let message = new Message(this.version);
        message.setSource(this.id);
        message.setCommand(Internal.SAVE_VAULT_SETTINGS);
        message.addNonce();
        message.body.vault = vault;
        message.body.sign = sign;
        message.body.hash = hash;
        message.signMessage(this.privateKey);

        console.log("UPDATING VAULT SETTINGS");
        this.connector.acceptMessage(message)
    }

    changePassword(newPassword){
        if(!this.initialized){
            throw new Error("The vault hasn't been initialized");
        }
        if(!newPassword || newPassword.trim === ""){
            throw new Error("Password required");
        }
        this.password = newPassword;
    }

    // Encrypts all topics and returns an object of
    // pkfp: cipher encrypted topics
    packTopics(){
        let res = {}
        for(let pkfp of Object.keys(this.topics)){
            let topic = this.topics[pkfp]
            res[pkfp] = this.prepareVaultTopicRecord(
                this.version,
                topic.pkfp,
                topic.privateKey,
                topic.name,
                topic.settings,
                topic.comment
            );
        }
        return res;
    }

    // Given topics object of pkfp: cipher
    // decrypts each cipher and JSON parses with password
    // returns object of pkfp: { topic raw data  }
    unpackTopics(topics){
        let res = {};
        for(let pkfp of Object.keys(topics)){
            res[pkfp] = this.decryptTopic(topics[pkfp], this.password);
        }
        return res;
    }

    // Decrypts topic blob with password
    decryptTopic(topicBlob, password){
        let signLength = parseInt(topicBlob.substr(topicBlob.length - 3))
        let signature = topicBlob.substring(topicBlob.length - signLength - 3, topicBlob.length - 3);
        let salt = topicBlob.substring(0, 256);
        let topicCipher = topicBlob.substring(256, topicBlob.length - signLength - 3);
        let ic = new iCrypto();
        ic.setRSAKey("pub", this.publicKey, "public")
            .addBlob("cipher", topicCipher)
            .addBlob("sign", signature)
            .publicKeyVerify("cipher", "sign", "pub", "verified")
        if(!ic.get("verified")) throw new Error("Topic signature is invalid!")

        ic.addBlob("salt-hex", salt)
            .createPasswordBasedSymKey("sym", password, "salt-hex")
            .AESDecrypt("cipher", "sym", "topic-plain", true)
        return JSON.parse(ic.get("topic-plain"));
    }


    addNewTopic(self, data){

        //if(!Message.verifyMessage(self.sessionKey, data)){
        //    throw new Error("Session key signature is invalid!")
        //}
        console.log(`Adding new topic to vault`)
        let vaultRecord = data.body.vaultRecord;
        let metadata = data.body.metadata;
        let topicData = self.decryptTopic(vaultRecord, self.password);
        let pkfp = topicData.pkfp;
        let newTopic = new Topic(
            pkfp,
            topicData.name,
            topicData.key,
            topicData.comment
        )

        console.log(`New topic initialized: ${pkfp}, ${topicData.name} `)
        newTopic.loadMetadata(metadata);
        newTopic.bootstrap(self.connector, self.arrivalHub, self.uxBus, self.version);
        self.topics[pkfp] = newTopic;

        if (self.pendingInvites.hasOwnProperty(data.body.inviteCode)){
            let inviteeNickname = self.pendingInvites[data.body.inviteCode].nickname
            console.log(`Initialize settings  on topic join. Invitee ${inviteeNickname}`);
            self.initSettingsOnTopicJoin(self, pkfp, inviteeNickname, data)
        }
        self.uxBus.emit(Events.TOPIC_CREATED, newTopic);
        return pkfp
    }

    pack(){
         let vaultBlob =  JSON.stringify({
            version: this.version,
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            admin: this.admin,
            adminKey: this.adminKey,
            settings: this.settings
        });

        let ic = new iCrypto();
        ic.createNonce("salt", 128)
            .encode("salt","hex", "salt-hex")
            .createPasswordBasedSymKey("key", this.password, "salt-hex")
            .addBlob("vault", vaultBlob)
            .AESEncrypt("vault", "key", "cip-hex", true, "CBC", "utf8")
            .merge(["salt-hex", "cip-hex"], "res")
            .hash("res", "vault-hash")
            .setRSAKey("asymkey", this.privateKey, "private")
            .privateKeySign("vault-hash", "asymkey", "sign");

        let topics = this.packTopics(this.password)


        //console.log(`Salt: ${ic.get("salt-hex")}`)
        //console.log(`Vault: ${ic.get("cip-hex")}`)
        //Sign encrypted vault with private key
        return {
            vault:  ic.get("res"),
            topics: topics,
            hash : ic.get("vault-hash"),
            sign :  ic.get("sign")
        }
    }

    toggleSound(){
        if(!this.settings){
            this.settings = {
                sound: true
            }
        } else {
            this.settings.sound = !this.settings.sound;
        }

        this.saveVaultSettings(Events.SOUND_STATUS);
        return this.settings.sound
    }

    processNewTopicEvent(self, data){
        //verify session key
        let metadata = data.body.metadata;
 
    }

    addTopic(pkfp, name, privateKey, comment){
        if (this.topics.hasOwnProperty(pkfp)) throw new Error("Topic with such id already exists");
        let newTopic = new Topic(pkfp, name, privateKey, comment)
        this.topics[pkfp] = newTopic;
        return newTopic
    }


    //Only adds initialized topic to vault topics
    registerTopic(topic = Err.required()){
        console.log(`Registring topic ${topic.pkfp}`);
        this.topics[topic.pkfp] = topic;
    }


}

export class VaultFactory{
    static makeNew(version){
        return new Vault(version)
    }

    static initSaved(version, data, vaultId){
        console.log("Initializing saved vault. Data:");
        console.dir(data)

        let vault = new Vault(version)
        vault.initSaved(data)
        vault.id = vaultId
        return vault
    }
}



export const VaultEvents = {
    TOPIC_DELETED: Symbol("topic_deleted")
}

// a = {
//
//
//     encrypted: "some-bytes",

//
//     privateKey: "key",
//     publicKey: "key",
//     password: passwordRaw
//
//     topics: {
//         topicName1: {
//             key: "key",
//             comment: "comment"
//         },
//         topicName2: {
//             key: "key",
//             comment: "comment"
//         }
//
//         //...
//     }
//
// };
