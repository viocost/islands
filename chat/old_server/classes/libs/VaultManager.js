const Logger = require("./Logger.js");
const path = require("path")
const RandExp = require("randexp");
const { iCrypto } = require("../../../common/iCrypto");
const AdminKey = require("./AdminKey");
const HSMap = require("./HSVaultMap");
const Message = require("../objects/Message")
const { Internal } = require("../../../common/Events")
const { Storage } = require("../../../server/Storage")

const Err = require("../libs/IError.js");

const KeyBuilder = require("../../../server/StorageKeyBuilderAdapter")


/**FILENAMES*/
const PENDING = "pending";
const VAULT = "vault";
const PUBLICKEY = "publicKey";


class VaultManager{
    constructor(config, requestEmitter){
        if (!config.vaultsPath){
            throw new Error("Init error: Vaults path is not specified!");
        }
        this.vaultsPath = config.vaultsPath;


        this.vaultIdLength = config.vaultIdLength || 64;

    }

    registerSessionManager(sessionManager){
        this.clientSessionManager = sessionManager;
    }

    saveVaultSettings(request){
        console.log("SAVING VAULT SETTINGS");
        let id = request.headers.pkfpSource;
        let { vault, hash } = request.body
        let publicKey = this.getVaultPublicKey(id)

        this._backupVault(id)
        this._writeVault(id, vault, publicKey, hash)
        console.log("VAULT SHOULD BE UPDATED NOW");

        this.notifyUser(Internal.VAULT_SETTINGS_UPDATED, id)
    }


    updateVaultFormat(request){
        let id = request.headers.pkfpSource;

        let { vault, topics, hash } = request.body
        let publicKey = this.getVaultPublicKey(id)
        Logger.info("Updating vault format", {cat: "vault"});

        console.log(`UPDATING VAULT FORMAT: \nVault: ${vault}\nTopics: ${topics}\npublicKey: ${publicKey}\nHash: ${hash}`);
        this._backupVault(id)
        this._writeVault(id, vault, publicKey, hash)
        for(let pkfp of Object.keys(topics)){
            this.saveTopic(id, pkfp, topics[pkfp])
        }
        console.log("VAULT SHOULD BE UPDATED NOW");

        this.notifyUser(Internal.VAULT_FORMAT_UPDATED, id)

    }


    notifyUser(event = Err.required("Notify user event"), vaultId = Err.required("Vault id")){

        if(!this.clientSessionManager){
            return;
        }

        let session = this.clientSessionManager.getSessionBySessionID(vaultId);

        if(!session) return;

        let response = new Message()
        response.setSource("island");
        response.setDest(vaultId);
        response.setCommand(event)
        session.broadcast(response);
    }


    updateVault(vaultBlob, id, hash, previousHash, signature, publicKey = null){

        if(!publicKey){
            publicKey = this.getVaultPublicKey(id);
        }

        if(!this.isOwnerVerified(vaultBlob, hash, signature, publicKey)){
            throw new Error("Owner's signature is invalid");
        }

        if(this.isRegistrationPending(id)){
            throw new Error("The vault registration is pending. Updates are disabled");
        }


        this._updateVault(id, vaultBlob, publicKey);
        Logger.debug("Vault successfully updated!");
    }

    isOwnerVerified(vaultBlob, hash,  signature, publicKey){
        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("hash", hash)
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .publicKeyVerify("hash", "sign", "pubkey", "verified");

        return ic.get("verified")
    }

    saveNewVault(vaultBlob, hash, signature, publicKey, id){

        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("hash", hash)
            .hash("vaulthex", "calc-hash")
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .publicKeyVerify("hash", "sign", "pubkey", "verified");
        if(!ic.get("verified")){
            throw new Error("Vault signature is not valid");
        }

        if(ic.get("calc-hash") !== hash){

            throw new Error(`Vault hash is invalid. Passed: ${hash}, calculated: ${ic.get("calc-hash")}`);
        }

        Logger.debug("Signature is valid");

        if (!id){
            do{
                id = this.generateID();
            }while (this.isVaultExist(id));
        }
        this._writeVault(id, vaultBlob, publicKey, hash);
        this._consumeRegistrationToken(id)
        return id;
    }

    saveTopic(vaultId, topicPkfp, topicBlob){
        //verify
        Logger.debug(`Save topic request received: vault id: ${vaultId}, topicPkfp: ${topicPkfp}, blob lengt: ${topicBlob.length}`,
                     {cat: "topic_create"});
        let publicKey = this.getVaultPublicKey(vaultId);

        let ic = new iCrypto();
        let signLength = parseInt(topicBlob.substr(topicBlob.length - 3))
        let signature = topicBlob.substring(topicBlob.length - signLength - 3, topicBlob.length - 3);
        let topicCipher = topicBlob.substring(256, topicBlob.length - signLength - 3);
        ic.setRSAKey("pub", publicKey, "public")
            .addBlob("cipher", topicCipher)
            .addBlob("sign", signature)
            .publicKeyVerify("cipher", "sign", "pub", "verified")
        if(!ic.get("verified")) throw new Error("Topic signature is invalid!")


        // write blob
        let storage = this.getStorageByVaultId(vaultId)
        let key = this.keyForTopicRecord(topicPkfp);
        storage.write(key, topicBlob);
        Logger.debug("Topic record saved", {cat: "topic_create"})
    }

    async deleteTopic(vaultId, topicPkfp, nonce, sign){
        Logger.debug(`Deleting topic record pkfp: ${topicPkfp}, vault: ${vaultId}`, {cat: "topic_delete"})
        let publicKey = this.getVaultPublicKey(vaultId)
        let ic = new iCrypto()
        ic.addBlob("sign", sign)
          .addBlob("nonce", nonce)
          .setRSAKey("pub", publicKey, "public")
          .publicKeyVerify("nonce", "sign", "pub", "res")
        if(!ic.get("res")) throw new Error("Error deleting topic record: signature verification failed")


        let storage = this.getStorageByVaultId(vaultId)
        let key = this.keyForTopicRecord(topicPkfp);
        //storage.delete(key);

        Logger.debug("Topic record is deleted", {cat: "topic_delete"})
    }


    completeRegistration(vaultBlob, hash, signature, publicKey, id){
        console.log(`Completing registration for id ${id}`);
        let ic = new iCrypto();
        ic.addBlob("vault64", vaultBlob)
            .addBlob("hash", hash)
            .hash("vault64", "calc-hash")
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .hexToBytes("vault64", "vault")
            .publicKeyVerify("hash", "sign", "pubkey", "verified");
        if(!ic.get("verified")){
            throw new Error("Vault signature is not valid");
        }
        if (ic.get("calc-hash") !== hash){
            throw new Error("Vault hash is invalid")
        }

        Logger.debug("Signature is valid");
        if(!this.isRegistrationActive(id)){
            throw new Error("Registration is not active for: " + id)
        }

        console.log("Writing vault....");
        this._writeVault(id, vaultBlob, publicKey, hash);
        this._consumeRegistrationToken(id)
    }

    getVault(id){
        //Get vault
        if(!this.isVaultExist(id)){
            Logger.debug(`Vault not found for id: {id}`, {cat: "vault"})
            return undefined;
        }

        let storage = this.getStorageByVaultId(id)
        return storage.getBlob("vault")

    }

    getAdminVault(){

        for(let storage of Storage.everyStorageObject()){

            if(storage.has("admin")){
                return {
                    pkfp: storage.id,
                    vault: storage.getBlob("vault"),
                    publicKey: storage.getBlob("publicKey")

                }
            }

        }

    }

    getTopics(vaultId){
        if(!this.isVaultExist(vaultId)){
            return null
        }

        let storage = Storage.getByIdentity(vaultId);

        let topicKeys = storage.allKeys().filter(key=>/topics\/[0-9a-f]{64}/.test(key))

        let res = {}

        topicKeys.forEach(key=>{
            let pkfp = key.split("/").slice(-1)[0]
            res[pkfp] = storage.getBlob(key)
        })

        return res
    }


    getTopicsIds(vaultId){

        let storage = Storage.getByIdentity(vaultId);

        let ids = storage.allKeys()
                      .filter(key=>/topics\/[0-9a-f]{64}/.test(key))
                      .map(key=>key.split("/")
                                   .slice(-1)[0])

        console.log(`topic ids: ${ids}`)
        return ids
    }

    isRegistrationPending(vaultID){

        let storage = this.getStorageByVaultId(vaultID);
        let res = storage.has(VAULT_SETTINGS_UPDATED) &&
            storage.has(PUBLICKEY) &&
            storage.has(PENDING)
        console.log(`Registration pending: ${res}`);
        return res
    }

    isRegistrationActive(vaultID){
        if(!this.isRegistrationPending(vaultID)){
            return false
        }

        let storage = Storage.getByIdentity(vaultID)
        return storage.has(PENDING)
    }


    _consumeRegistrationToken(vaultID){
        let storage = this.getStorageByVaultId(vaultID);
        storage.delete(PENDING)
    }

    logUnauthorizedWriteAttempt(data){
        Logger.warn("Unauthorized vault write attempt!", data)
    }

    getVaultDirPath(id){
        return path.join(this.vaultsPath, id);
    }

    getVaultPath(id){
        return path.join(this.vaultsPath, id, "vault");
    }

    getTopicsPath(id){
        return  path.join(this.vaultsPath, id, "topics");
    }


    isVaultExist(id){
        let storage = Storage.getByIdentity(id);
        return (storage && storage.has("vault"))
    }

    _writeVault(id, blob, publicKey, hash){
        console.log(`Writing vault id: ${id}`);
    //    let vaultPath = path.join(this.vaultsPath, id);
        let storage = this.getStorageByVaultId(id)

        storage.write(this.getKey("vault"), blob)
        storage.write(this.getKey("publicKey"), publicKey)
        storage.write(this.getKey("hash"), hash)

        console.log("Vault written.");
    }

    _backupVault(id){
        let storage = Storage.getByIdentity(id)
        console.log("Backing up vault");
        let timestamp = new Date().toISOString()

        let vaultBakKey =  `vault_BAK_${timestamp}`
        let vaultHashBakKey = `hash_BAK_${timestamp}`;

        if(storage.has(VAULT)){
            let vaultBlob = storage.getBlob(VAULT);
            storage.write(vaultBakKey, vaultBlob)
        }

        if(storage.has("hash")){
            let hashBlob = storage.getBlob("hash")
            storage.write(vaultHashBakKey , hashBlob)
        }
    }

    _updateVault(id, blob){
        let storage = this.getStorageByVaultId(id)
        storage.write(this.getKey("vault"), blob)
    }

    getVaultPublicKey(id){
        if(!this.isVaultExist(id)){
            throw new Error("Vault not found");
        }

        let storage = this.getStorageByVaultId(id)
        return storage.getBlob(this.getKey("publicKey"))
    }


    getVaultId (host){
        if (!this.isOnion(host)) {
            return AdminKey.getPkfp();
        } else {
            return HSMap.getVaultId(this._extractOnion(host));
        }
    }

    _extractOnion(host){
        return host.match(/[a-z2-7]{16}\.onion/)[0];
    }

    isOnion(host){
        let pattern = /.*[a-z2-7]{16}\.onion.*/;
        return pattern.test(host);
    }

    generateID(){
        return new RandExp(new RegExp("[a-f0-9]{" + this.vaultIdLength + "}")).gen();
    }

    getStorageByVaultId(vaultId){
        return Storage.getByIdentity(vaultId)
    }

    keyForTopicRecord(pkfp){
        return KeyBuilder.buildKey("topics", pkfp)
    }


    getKey(type){
        let keys = {
            admin: "admin",
            hash: "hash",
            publicKey: "publicKey",
            vault: "vault"
        }

        if(!(type in keys)){
            throw new Error(`Invalid key type: ${type}`)
        }

        return KeyBuilder.buildKey(keys[type])
    }

}
module.exports = VaultManager;

   
/**
 *  dir-id
 *    vaul//t
 *    publicKey
 *
 */
