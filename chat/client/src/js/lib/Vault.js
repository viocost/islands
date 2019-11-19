import { IError }  from "../../../../common/IError";
import { verifyPassword } from "./PasswordVerify";
import { Topic } from "../lib/Topic";
import { iCrypto } from "./iCrypto";
import { WildEmitter } from "./WildEmitter";
import { Events, Internal  } from "../../../../common/Events";
import { XHR } from "./xhr"

/**
 * Represents key vault
 *
 *
 */
export class Vault{
    constructor(){
        WildEmitter.mixin(this);
        this.id = null;
        this.initialized = false;
        this.admin = null;
        this.adminKey = null;
        this.topics = {};
        this.password = null;
        this.publicKey = null;
        this.privateKey = null;
        this.handlers;
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
        this.handlers[Events.TOPIC_CREATED] = (data)=>{
            self.addNewTopic(self, data)
        }
    }

    /**
     * Given a password creates an empty vault
     * with generated update private key inside
     * @param password
     * @returns {Vault}
     */
    init(password){
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


    initSaved(vault_encrypted = IError.required("Vault parse: data parameter missing"),
              password = IError.required("Vault parse: password parameter missing")){
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

        Object.keys(data.topics).forEach((pkfp)=>{
            this.topics[pkfp] = new Topic(
                pkfp,
                data.topics[pkfp].name,
                data.topics[pkfp].key,
                data.topics[pkfp].comment);
        });

        this.initialized = true;
    }

    setId(id = IError.required("ID is required")){
        this.id = id;
    }

    getId(){
        return this.id;
    }

    isAdmin(){
        return this.admin;
    }

    bootstrap(arrivalHub, version){
        let self = this;
        this.version = version;
        this.arrivalHub = arrivalHub;
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
        message.setSource(this.pkfp);
        message.setCommand(Events.VAULT_UPDATED);
        message.addNonce();
        message.body.vault = vault;
        message.body.sign = sign;
        message.body.cause = cause;
        message.signMessage(this.privateKey);
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

    packTopics(){
        let res = {}
        for(let pkfp of Object.keys(this.topics)){
            res[pkfp] = {
                name:  this.topics[pkfp].name,
                key:  this.topics[pkfp].privateKey,
                comment: this.topics[pkfp].comment,
                pkfp: pkfp
            }
        }
        return res;
    }

    /**
     * Stringifies this vault and topics, hashes, signes and encrypts it
     */
    pack(){
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
        this.topics[pkfp] = new Topic(pkfp, name, privateKey, comment)
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
