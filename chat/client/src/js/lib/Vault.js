import { iCrypto } from "../lib/iCrypto";
import { IError }  from "../../../../common/IError";
import { Topic } from "../lib/Topic";



/**
 * Represents key vault
 *
 *
 */
export class Vault{

    constructor(){
        this.initialized = false;
        this.admin = null;
        this.adminKey = null;
        this.topics = {};
        this.password = null;
        this.publicKey = null;
        this.privateKey = null;
    }



    /**
     * Given a password creates an empty vault
     * with generated update private key inside
     * @param password
     * @returns {Vault}
     */
    init(password){
        if(!password || password.trim === ""){
            throw "Password required"
        }

        //CHECK password strength and reject if not strong enough

        let ic = new iCrypto();
        ic.generateRSAKeyPair("kp");
        //Create new Vault object
        this.password = password;
        this.topics = {};
        this.privateKey = ic.get("kp").privateKey;
        this.publicKey = ic.get("kp").publicKey;
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

        Object.keys(data.topics).forEach((k, v)=>{
            this.topics[k] = new Topic(
                k,
                data.topics[k].name,
                data.topics[k].key,
                data.topics[k].comment);
        });

        this.initialized = true;
    }





    //This has to be moved outside
    save(){
        if (!this.password || this.privateKey || this.topics){
            throw "Vault object structure is not valid";
        }

        //Check if vault exists decrypted and loaded

        //If not
            // Throw error

        //Encrypt vault data with given password
        let vault = JSON.stringify({
            privateKey: this.privateKey,
            topics: JSON.parse(JSON.stringify(this.topics))
        });

        let ic = new iCrypto();
        ic.createNonce("salt",128)
            .base64Encode("salt", "s64")
            .createPasswordBasedSymKey("key", this.password, "s64")
            .addBlob("vault", vault)
            .AESEncrypt("vault", "key", "cipher")
            .base64Encode("cipher", "cip64")
            .merge(["cip64", "s64"], "res")
            .setRSAKey("asymkey", this.privateKey, "private")
            .privateKeySign("res", "asymkey", "sign");


        //Sign encrypted vault with private key
        let body = {

            vault: ic.get("res"),
            sign: ic.get("sign")
        };
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/update", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = ()=>{
            console.log("Server said that vault is saved!");
        };
        xhr.send(body);

        //Send vault to the server
        //Display result of save request

    }

    changePassword(newPassword){
        if(!this.initialized){
            throw "The vault hasn't been initialized";
        }
        if(!newPassword || newPassword.trim === ""){
            throw "Password required";
        }
        this.password = newPassword;
    }


    /**
     * Stringifies and encrypts this object
     */
    pack(){
        if(!this.initialized){
            throw "The vault hasn't been initialized"
        }

        let res = JSON.stringify({
            topics: this.topics,
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            admin: this.admin,
            adminKey: this.adminKey
        });

        console.log(this.topics);

        let ic = new iCrypto();
        ic.createNonce("salt", 128)
            .bytesToHex("salt", "s16")
            .createPasswordBasedSymKey("key", this.password, "s16")
            .addBlob("vault", res)
            .AESEncrypt("vault", "key", "v_cip", true, "CBC",  "utf8")
            .merge(["s16", "v_cip"], "reshex")
            .setRSAKey("priv", this.privateKey, "private")
            .hexToBytes("reshex", "res")
            .privateKeySign("res", "priv", "sign");

        return {
            vault: ic.get("reshex"),
            sign: ic.get("sign")
        }
    }

    addTopic(pkfp, name, privateKey, comment){
        if (this.topics.hasOwnProperty(pkfp)) throw "Topic with such id already exists";
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
