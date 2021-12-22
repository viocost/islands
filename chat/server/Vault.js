const { iCrypto } = require("../common/iCrypto");
const RandExp = require("randexp");
const Logger = require("../old_server/classes/libs/Logger");
const { Storage } = require("./Storage")

const KeyBuilder = require("./StorageKeyBuilderAdapter")


const { Internal } = require("../common/Events")


/**FILENAMES*/
const PENDING = "pending";
const ADMIN = "admin";
const HASH = "hash"
const VAULT = "vault";
const PUBLIC_KEY = "publicKey";
const HIDDEN_SERVICES_DIRNAME = "hidden_services"
const HISTORY_DIRNAME = "history"

const VAULT_ID_LENGTH = 64;

class Vault{
    constructor({
        storage,
        vaultId,
        requestEmitter,
        secretary
    }){
        this.id  = vaultId;
        this.secretary = secretary;
        this.storage = storage;


        //TODO REFACTOR
        if(requestEmitter){
            requestEmitter.on(Internal.UPDATE_VAULT_FORMAT, this.updateVaultFormat.bind(this))
            requestEmitter.on(Internal.SAVE_VAULT_SETTINGS, this.saveVaultSettings.bind(this))
            requestEmitter.on(Internal.SAVE_VAULT, this.saveVault.bind(this))
        }
    }



    isAdmin(){
        let res = this.storage.has(ADMIN)
        console.log(`Is admin called ${res}`);
        return res
    }

    isPending(){
        let res = this.storage.has(PENDING)
        console.log(`Is vault pending: ${res}`);
        return res;
    }

    getId(){
        return this.id

    }

    loadHiddenServices(){
        let keys = this.storage.allKeys().filter(key=>/.*\/hidden_services\//.test(key))
        return keys.map(storageKey =>{

            let { key, enabled } = JSON.parse(this.storage.getBlob())
            return {
                onion: storageKey.split("/").slice(-1),
                privateKey: key,
                isEnabled: enabled
            }
        })

    }

    getVault(){
        //Get vault
        return this.storage.getBlob(VAULT)
    }

    getPublicKey(){
        return this.storage.getBlob(PUBLIC_KEY)
    }

    saveVaultSettings(request){
        console.log("SAVING VAULT SETTINGS");
        let id = this.id;
        let { vault, hash } = request.body
        let publicKey = this.getVaultPublicKey(id)

        this._backupVault()
        this._writeVault(vault, publicKey, hash)
        this.notifyClient(Internal.VAULT_SETTINGS_UPDATED, id)
    }


    updateVaultFormat(request){
        let id = request.headers.pkfpSource;

        let { vault, topics, hash } = request.body
        let publicKey = this.getVaultPublicKey(id)
        Logger.info("Updating vault format", {cat: "vault"});

        console.log(`UPDATING VAULT FORMAT: \nVault: ${vault}\nTopics: ${topics}\npublicKey: ${publicKey}\nHash: ${hash}`);
        this._backupVault()
        this._writeVault(vault, publicKey, hash)
        for(let pkfp of Object.keys(topics)){
            this.saveTopic(id, pkfp, topics[pkfp])
        }
        console.log("VAULT SHOULD BE UPDATED NOW");

        this.notifyClient(Internal.VAULT_FORMAT_UPDATED, id)

    }


    notifyClient(event = Err.required("Notify user event"), data){
        //
        this.secretary.deliverAll(event, data)
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
        // CRYPTO:  Validate signature
        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("hash", hash)
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .publicKeyVerify("hash", "sign", "pubkey", "verified");

        return ic.get("verified")
    }


    /**
     * This funcion called when the entire vault needs to be resaved.
     * One particular use case if for password change.
     * The entire vault is re-encrypted with new key and resaved
     */
    saveVault(request){
        console.log("SAVE VAULT REQUEST RECEIVED!");
        let vaultId = request.headers.pkfpSource;
        let { vault, topics, hash, sign } = request.body

        console.dir(request.body)
        let publicKey = this.getPublicKey()

        //Backup vault
        this._backupVault()

        //all is good. Writing
        this._writeVault(vault, publicKey, hash, topics)
        console.log("Vault written successfully");

        this.notifyClient(Internal.VAULT_UPDATED, vaultId)

    }



    saveNewVault(vaultBlob, hash, signature, publicKey, id){

        this.verifyVault(vaultBlob, hash, signature, publicKey)

        Logger.debug("Signature is valid");

        if (!id){
            do{
                id = Vault.generateId();
            }while (this.isVaultExist());
        } else if (this.isVaultExist()){
            throw new Error("Vault already exists");
        }
        this._writeVault(vaultBlob, publicKey, hash);
        return id;
    }

    verifyVault(vaultBlob, hash, signature, publicKey){
        // CRYPTO: Validate vault signature
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
    }

    saveTopic(vaultId, topicPkfp, topicBlob){
        //verify
        Logger.debug(`Save topic request received: vault id: ${vaultId}, topicPkfp: ${topicPkfp}, blob lengt: ${topicBlob.length}`,
                     {cat: "topic_create"});
        let publicKey = this.getVaultPublicKey(vaultId);

        // CRYPTO: Validate topic blob
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
        Logger.debug("Topic update verified", {cat: "topic_create"})
        this.storage.write(KeyBuilder.buildKey("topics", topicPkfp), topicBlob)
        Logger.debug("Topic record saved", {cat: "topic_create"})
    }

    async deleteTopic(vaultId, topicPkfp, nonce, sign){
        Logger.debug(`Deleting topic record pkfp: ${topicPkfp}, vault: ${vaultId}`, {cat: "topic_delete"})
        let publicKey = this.getVaultPublicKey(vaultId)
        // CRYPTO: Validate request
        let ic = new iCrypto()
        ic.addBlob("sign", sign)
          .addBlob("nonce", nonce)
          .setRSAKey("pub", publicKey, "public")
          .publicKeyVerify("nonce", "sign", "pub", "res")
        if(!ic.get("res")) throw new Error("Error deleting topic record: signature verification failed")

        this.storage.delete(KeyBuilder.buildKey("topics", topicPkfp))
        Logger.debug("Topic record is deleted", {cat: "topic_delete"})
    }

    completeRegistration(vaultBlob, hash, signature, publicKey){
        // CRYPTO: Validate request
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
        if(!this.isRegistrationActive()){
            throw new Error("Registration is not active for: " + id)
        }

        this._writeVault(vaultBlob, publicKey, hash);
        this._consumeRegistrationToken(id)
    }


    getTopics(){
        if(!this.isVaultExist()){
            return null
        }
        let res = {}
        let keys = this.storage.allKeys().filter(key=>/topics\/[0-9a-f]{64}/.test(key))

        for (let key of keys){
            let pkfp = KeyBuilder.decomposeKey(key).slice(-1)
            res[pkfp] = this.storage.getBlob(key);
        }

        return res
    }

    getTopicsIds(){
        return this.storage.allKeys()
            .filter(key=>/topics\/[0-9a-f]{64}/.test(key))
            .map(id=>id.split("/").slice(-1)[0])
    }

    isRegistrationPending(){

        return  !this.storage.has(VAULT) &&
            !this.storage.has(PUBLIC_KEY) &&
            this.storage.has(PENDING)
    }

    isRegistrationActive(){
        let adminPublicKey = AdminKey.get();
        if(!this.isRegistrationPending()){
            return false
        }

        let signData =  this.storage.getBlbo(PENDING);
        // CRYPTO: Validate requrest
        let ic = new iCrypto();
        ic.addBlob("sign", signData)
          .addBlob("idhex", this.id)
            .hexToBytes("idhex", "id")
            .setRSAKey("pub", adminPublicKey, "public")
            .publicKeyVerify("id", "sign", "pub", "res");
        return ic.get("res")
    }

    _consumeRegistrationToken(){
        this.storage.delete(PENDING)
    }


    logUnauthorizedWriteAttempt(data){
        Logger.warn("Unauthorized vault write attempt!", data)
    }


    isVaultExist(){
        return this.storage.has(VAULT) &&
            this.storage.has(PUBLIC_KEY)
    }


    async _writeVault(blob, publicKey, hash, topics = {}){
        //If any topics are passed
        if(topics){
            //writing them
            for(let pkfp in topics){
                this.storage.write(KeyBuilder.buildKey("topics", pkfp), topics[pkfp])
            }
        }

        //Finalizing: writing vault master key, public key and hash
        this.storage.write(VAULT, blob);
        this.storage.write(PUBLIC_KEY, publicKey);
        this.storage.write("hash", hash);
    }

    async _backupVault(){
        console.log("Backing up vault");
        let timestamp = new Date().toISOString()

        let vaultBakKey =  `vault_BAK_${timestamp}`
        let vaultHashBakKey = `hash_BAK_${timestamp}`;

        if(await this.storage.has(VAULT)){
            let vaultBlob = this.storage.getBlob(VAULT);
            await this.storage.write(vaultBakKey, vaultBlob)
        }

        if(this.storage.has("hash")){
            let hashBlob = this.storage.getBlob("hash")
            this.storage.write(vaultHashBakKey , hashBlob)
        }
    }

    _updateVault(id, blob){
        this.storage.write(VAULT, blob)
    }

    getVaultPublicKey(id){
        if(!this.isVaultExist(id)){
            throw new Error("Vault not found");
        }

        return this.storage.getBlob(PUBLIC_KEY)
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

    static generateId(){
        return new RandExp(new RegExp("[a-f0-9]{" + VAULT_ID_LENGTH + "}")).gen();
    }

}

module.exports = {
    Vault: Vault,
    VaultPending: PENDING,
    VaultAdmin: ADMIN,
    VaultIdLength: VAULT_ID_LENGTH
}
