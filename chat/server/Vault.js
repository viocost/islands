const fs = require("fs-extra");
const path = require("path")
const { iCrypto } = require("../common/iCrypto");
const RandExp = require("randexp");
const Logger = require("../old_server/classes/libs/Logger");

const { Internal } = require("../common/Events")

/**FILENAMES*/
const PENDING = "pending.signature";
const VAULT = "vault";
const PUBLICKEY = "publicKey";

class Vault{
    constructor(vaultId, vaultDir, requestEmitter){
        this.id  = vaultId;
        this.vaultDir = vaultDir;

        if(!fs.existsSync(this.vaultDir)){
            Logger.debug("Vaults directory doesn't exist. Creating...");
            fs.mkdirSync(this.vaultDir);
            Logger.debug("Vaults directory created!");
        }

        //this.vaultIdLength = config.vaultIdLength || 64;

        //TODO REFACTOR
        if(requestEmitter){
            requestEmitter.on(Internal.UPDATE_VAULT_FORMAT, this.updateVaultFormat.bind(this))
            requestEmitter.on(Internal.SAVE_VAULT_SETTINGS, this.saveVaultSettings.bind(this))
        }
    }

    saveVaultSettings(request){
        console.log("SAVING VAULT SETTINGS");
        let id = this.id;
        let { vault, hash } = request.body
        let publicKey = this.getVaultPublicKey(id)

        this._backupVault()
        this._writeVault(vault, publicKey, hash)
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
        } else if (this.isVaultExist(id)){
            throw new Error("Vault already exists");
        }
        this._writeVault(id, vaultBlob, publicKey, hash);
        return id;
    }

    saveTopic(vaultId, topicPkfp, topicBlob){
        //verify
        Logger.debug(`Save topic request received: vault id: ${vaultId}, toipcPkfp: ${topicPkfp}, blob lengt: ${topicBlob.length}`,
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
        Logger.debug("Topic update verified", {cat: "topic_create"})
        fs.writeFileSync(path.join(this.vaultsPath, vaultId, "topics", topicPkfp), topicBlob);
        Logger.debug("Topic record saved", {cat: "topic_create"})
    }

    async deleteTopic(vaultId, topicPkfp, nonce, sign){
        Logger.debug(`Deleting toipc record pkfp: ${topicPkfp}, vault: ${vaultId}`, {cat: "topic_delete"})
        let publicKey = this.getVaultPublicKey(vaultId)
        let ic = new iCrypto()
        ic.addBlob("sign", sign)
          .addBlob("nonce", nonce)
          .setRSAKey("pub", publicKey, "public")
          .publicKeyVerify("nonce", "sign", "pub", "res")
        if(!ic.get("res")) throw new Error("Error deleting topic record: signature verification failed")

        let recordPath = path.join(this.getTopicsPath(vaultId), topicPkfp);
        fs.unlinkSync(recordPath);
        Logger.debug("Topic record is deleted", {cat: "topic_delete"})
    }

    completeRegistration(vaultBlob, hash, signature, publicKey){
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

        this._writeVault(id, vaultBlob, publicKey, hash);
        this._consumeRegistrationToken(id)
    }

    getVault(){
        //Get vault
        if(!this.isVaultExist()){
            Logger.debug(`Vault not found for id: {id}`, {cat: "vault"})
            return undefined;
        }

        let vaultPath = this.getVaultPath(id);
        let vault =  fs.readFileSync(vaultPath, 'utf8');
        return vault
    }

    getTopics(){
        if(!this.isVaultExist()){
            return null
        }

        let res = {}
        let topicsPath = this.getTopicsPath();

        if (!fs.existsSync(topicsPath)){
            console.log("Topics path does not exist. Probably vault is in v1 format. Creating...")
            fs.mkdirSync(topicsPath)
        }
        let topicsFiles = fs.readdirSync(topicsPath)

        for (let topic of topicsFiles){
            res[topic] = fs.readFileSync(path.join(topicsPath,  topic), "utf8")
        }

        return res
    }

    getTopicsIds(){
        if(!this.isVaultExist()) return null;
        let topicsPath = this.getTopicsPath();
        let ids = fs.readdirSync(topicsPath);
        console.log(`topic ids: ${ids}`)
        return ids
    }

    isRegistrationPending(vaultID){
        return  fs.existsSync(path.join(this.vaultDir  )) &&
            !fs.existsSync(path.join(this.vaultDir,  VAULT)) &&
            !fs.existsSync(path.join(this.vaultDir,  PUBLICKEY)) &&
            fs.existsSync(path.join(this.vaultDir,   PENDING))
    }

    isRegistrationActive(){
        let adminPublicKey = AdminKey.get();
        if(!this.isRegistrationPending()){
            return false
        }

        let signData =  fs.readFileSync(path.join(this.vaultDir, PENDING), "utf8");
        let ic = new iCrypto();
        ic.addBlob("sign", signData)
          .addBlob("idhex", this.id)
            .hexToBytes("idhex", "id")
            .setRSAKey("pub", adminPublicKey, "public")
            .publicKeyVerify("id", "sign", "pub", "res");
        return ic.get("res")
    }

    _consumeRegistrationToken(vaultID){
        fs.unlinkSync(path.join(this.vaultsPath, vaultID, PENDING));
    }

    createGuestVault(vaultID, signature){
        fs.mkdirSync(path.join(this.vaultsPath,  vaultID));
        fs.writeFileSync(path.join(this.vaultsPath, vaultID, PENDING), signature)
    }

    logUnauthorizedWriteAttempt(data){
        Logger.warn("Unauthorized vault write attempt!", data)
    }

    //backward compatability
    getVaultDirPath(){
        return this.vaultDir ;
    }

    getVaultPath(){
        return path.join(this.vaultDir, "vault");
    }

    getTopicsPath(){
        let topicsPath =  path.join(this.vaultDir, "topics");
        if(!fs.existsSync(topicsPath)){
            fs.mkdirSync(topicsPath)
        }
        return topicsPath;
    }

    async deleteVault(){
        if(fs.existsSync(this.vaultDir))
            await fs.remove(this.vaultDir);
    }

    isVaultExist(){
        let vaultDir = this.vaultDir;
        let vaultFile = path.join(this.vaultDir, "vault");
        let pubKey = path.join(this.vaultDir, "publicKey");

        return (fs.existsSync(vaultDir) &&
                fs.existsSync(vaultFile) &&
                fs.existsSync(pubKey));
    }

    _writeVault(id, blob, publicKey, hash){
        if(!fs.existsSync(this.vaultDir)){
            fs.mkdirSync(this.vaultDir);
        }
        if (!fs.existsSync(path.join(this.vaultDir, "topics"))){
            fs.mkdirSync(path.join(this.vaultDir, "topics"));
        }
        fs.writeFileSync(path.join(this.vaultDir, "vault"), blob);
        fs.writeFileSync(path.join(this.vaultDir, "publicKey"), publicKey);
        fs.writeFileSync(path.join(this.vaultDir, "hash"), hash);
    }

    _backupVault(){
        console.log("Backing up vault");
        let timestamp = new Date().toISOString()
        let vaultPath = path.join(this.vaultDir, "vault");
        let vaultBakPath = path.join(this.vaultDir, `vault_BAK_${timestamp}`);

        let vaultHashPath = path.join(this.vaultDir, "hash");
        let vaultHashBakPath = path.join(this.vaultDir, `hash_BAK_${timestamp}`);

        if(fs.existsSync(vaultPath)){
            fs.renameSync(vaultPath, vaultBakPath);
        }


        if(fs.existsSync(vaultHashPath)){
            fs.renameSync(vaultHashPath, vaultHashBakPath);
        }
    }

    _updateVault(id, blob){
        let vaultPath = path.join(this.vaultsPath, id);
        fs.writeFileSync(path.join(vaultPath, "vault"), blob);
    }

    getVaultPublicKey(id){
        if(!this.isVaultExist(id)){
            throw new Error("Vault not found");
        }

        return fs.readFileSync(path.join(this.vaultsPath, id, "publicKey"), 'utf8');
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

}

module.exports = {
    Vault: Vault
}