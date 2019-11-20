import { IError as Err }  from "../../../../common/IError";
import { verifyPassword } from "./PasswordVerify";
import { Topic } from "../lib/Topic";
import { iCrypto } from "./iCrypto";
import { WildEmitter } from "./WildEmitter";
import { Events, Internal  } from "../../../../common/Events";
import { XHR } from "./xhr"
import * as semver from "semver";

/**
 * Represents key vault
 *
 *
 */
export class Vault{
    constructor(){
        WildEmitter.mixin(this);
        this.id = null;
        this.pkfp;
        this.initialized = false;
        this.admin = null;
        this.adminKey = null;
        this.topics = {};
        this.password = null;
        this.publicKey = null;
        this.privateKey = null;
        this.handlers;
        this.messageQueue;
        this.version;
        this.initHandlers();
    }

    static registerVault(password, confirm){
        return new Promise((resolve, reject) => {
            setTimeout(()=>{

                try{
                    let result = verifyPassword(password.value.trim(), confirm.value.trim());
                    if(result !== undefined ){
                        reject(new Error(result));
                    }

                    let vault = new Vault();
                    vault.init(password.value.trim());
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
                        success: () => {
                            resolve();
                        },
                        error: err => {
                            reject(err);
                        }
                    });
                }catch (err){
                    reject(err)
                }
            }, 50)
        })
    }

    initHandlers(){
        let self = this;
        this.handlers = {};
        this.handlers[Internal.POST_LOGIN_DECRYPT] = (data)=>{ self.emit(Internal.POST_LOGIN_DECRYPT, data) }
        this.handlers[Events.POST_LOGIN_SUCCESS] = ()=>{ self.emit(Events.POST_LOGIN_SUCCESS); }
        this.handlers[Internal.TOPIC_CREATED] = (data)=>{
            self.addNewTopic(self, data)
        }
        this.handlers[Internal.SESSION_KEY] = (data)=>{
            self.emit(Internal.SESSION_KEY, data)
        }
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
    initAdmin(password, adminKey){
        this.init(password);
        this.admin = true;
        this.adminKey = adminKey;

    }


    async initSaved(vault_encrypted = Err.required("Vault parse: data parameter missing"),
              password = Err.required("Vault parse: password parameter missing"),
              topics={}){
        let ic = new iCrypto();
        console.log(`Salt: ${vault_encrypted.substring(0, 256)}`)
        console.log(`Vault: ${vault_encrypted.substr(256)}`)
        ic.addBlob("s16", vault_encrypted.substring(0, 256))
            .addBlob("v_cip", vault_encrypted.substr(256))
            .hexToBytes("s16", "salt")
            .createPasswordBasedSymKey("sym", password, "s16")
            .AESDecrypt("v_cip", "sym", "vault_raw", true);

        //Populating new object
        let data = JSON.parse(ic.get("vault_raw"));

        this.adminKey = data.adminKey;
        this.admin = data.admin;

        this.publicKey = data.publicKey;
        this.privateKey = data.privateKey;
        this.password = password;

        if(!data.pkfp){
            ic.setRSAKey("pub", data.publicKey, "public")
              .getPublicKeyFingerprint("pub", "pkfp");
            this.pkfp = ic.get("pkfp");
        } else {
            this.pkfp = data.pkfp;
        }

        let unpackedTopics = this.unpackTopics(topics, password)

        if (unpackedTopics){
            for(let pkfp of Object.keys(unpackedTopics)){
                this.topics[pkfp] = new Topic(
                    pkfp,
                    unpackedTopics.name,
                    unpackedTopics.key,
                    unpackedTopics.comment
                )
            }
        }
            //     this.topics[pkfp] = new Topic(         //
            //         pkfp,                              //
            //         data.topics[pkfp].name,            //
            //         data.topics[pkfp].key,             //
            //         data.topics[pkfp].comment);        //
            // });                                        //

        if (!data.version || semver.lt(data.version, "1.0.5")){
            // TODO format update required!
            console.log("vault format update required")

            await this.updateVaultFormat(data)
        }



        this.initialized = true;
    }


    async updateVaultFormat(data){
        console.log("Updating vault format...")

            ////////////////////////////////////////////////
            // Object.keys(data.topics).forEach((pkfp)=>{ //
            //     this.topics[pkfp] = new Topic(         //
            //         pkfp,                              //
            //         data.topics[pkfp].name,            //
            //         data.topics[pkfp].key,             //
            //         data.topics[pkfp].comment);        //
            // });                                        //
            ////////////////////////////////////////////////

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

    bootstrap(arrivalHub, messageQueue ,version){
        let self = this;
        this.version = version;
        this.arrivalHub = arrivalHub;
        this.messageQueue = messageQueue;
        this.arrivalHub.on(this.id, (msg)=>{
            self.processIncomingMessage(msg, self);
        })
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
    // cause - cause for vault update
    save(cause){
        if (!this.password || this.privateKey || this.topics){
            throw new Error("Vault object structure is not valid");
        }

        let vault = this.pack();
        let message = new Message(this.version);
        message.setSource(this.id);
        message.setCommand(Internal.SAVE_VAULT);
        message.addNonce();
        message.body.vault = vault;
        message.body.sign = sign;
        message.body.cause = cause;
        message.body.hash = vault.hash;
        message.signMessage(this.privateKey);
        this.messageQueue.enqueue(message)
    }

    //This has to be moved outside
    /////////////////////////////////////////////////////////////////////
    // save(){                                                         //
    //     if (!this.password || this.privateKey || this.topics){      //
    //         throw new Error("Vault object structure is not valid"); //
    //     }                                                           //
    //                                                                 //
    //     //Check if vault exists decrypted and loaded                //
    //                                                                 //
    //     //If not                                                    //
    //         // Throw error                                          //
    //
    //                                                                 //
    //     //Encrypt vault data with given password                    //
    //     let vault = JSON.stringify({                                //
    //         privateKey: this.privateKey,                            //
    //         topics: JSON.parse(JSON.stringify(this.topics))         //
    //     });                                                         //
    //                                                                 //
    //     let ic = new iCrypto();                                     //
    //     ic.createNonce("salt",128)                                  //
    //         .base64Encode("salt", "s64")                            //
    //         .createPasswordBasedSymKey("key", this.password, "s64") //
    //         .addBlob("vault", vault)                                //
    //         .AESEncrypt("vault", "key", "cipher")                   //
    //         .base64Encode("cipher", "cip64")                        //
    //         .merge(["cip64", "s64"], "res")                         //
    //         .setRSAKey("asymkey", this.privateKey, "private")       //
    //         .privateKeySign("res", "asymkey", "sign");              //
    //                                                                 //
    //                                                                 //
    //     //Sign encrypted vault with private key                     //
    //     let body = {                                                //
    //                                                                 //
    //         vault: ic.get("res"),                                   //
    //         sign: ic.get("sign")                                    //
    //     };                                                          //
    //     let xhr = new XMLHttpRequest();                             //
    //     xhr.open("POST", "/update", true);                          //
    //     xhr.setRequestHeader('Content-Type', 'application/json');   //
    //     xhr.onreadystatechange = ()=>{                              //
    //         console.log("Server said that vault is saved!");        //
    //     };                                                          //
    //     xhr.send(body);                                             //
    //                                                                 //
    //     //Send vault to the server                                  //
    //     //Display result of save request                            //
    //                                                                 //
    // }                                                               //
    /////////////////////////////////////////////////////////////////////

    changePassword(newPassword){
        if(!this.initialized){
            throw new Error("The vault hasn't been initialized");
        }
        if(!newPassword || newPassword.trim === ""){
            throw new Error("Password required");
        }
        this.password = newPassword;
    }

    unpackTopics(topics, password){
        let res = {};
        for(let pkfp of Object.keys(topics)){
            let topicBlob = topics[pkfp];
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
            res[pkfp] = ic.get("topic-plain")
        }
        return res;
    }

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


        console.log(`Salt: ${ic.get("salt-hex")}`)
        console.log(`Vault: ${ic.get("cip-hex")}`)
        //Sign encrypted vault with private key
        return {
            vault:  ic.get("res"),
            topics: topics,
            hash : ic.get("vault-hash"),
            sign :  ic.get("sign")
        }


    }

    /**
     * Stringifies this vault and topics, hashes, signes and encrypts it
     */
    packBAK(){
         let vaultBlob =  JSON.stringify({
            topics: this.packTopics(),
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


        console.log(`Salt: ${ic.get("salt-hex")}`)
        console.log(`Vault: ${ic.get("cip-hex")}`)
        //Sign encrypted vault with private key
        return {
            vault:  ic.get("res"),
            hash : ic.get("vault-hash"),
            sign :  ic.get("sign")
        }


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

    removeTopic(){

    }



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
