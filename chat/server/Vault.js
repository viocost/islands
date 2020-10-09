const fs = require("fs-extra");
const path = require("path")
const { iCrypto } = require("../common/iCrypto");
const RandExp = require("randexp");
const Logger = require("../old_server/classes/libs/Logger");

const { Internal } = require("../common/Events")


/**FILENAMES*/
const PENDING = "pending";
const VAULT = "vault";
const PUBLIC_KEY = "publicKey";
const HIDDEN_SERVICES_DIRNAME = "hidden_services"

const VAULT_ID_LENGTH = 64;

class Vault{
    constructor({
        vaultDirectory,
        vaultId,
        requestEmitter
    }){
        this.id  = vaultId;
        this.vaultDirectory = vaultDirectory;

        if(!fs.existsSync(this.vaultDirectory)){
            Logger.debug("Vaults directory doesn't exist. Creating...");
            fs.mkdirSync(this.vaultDirectory);
            Logger.debug("Vaults directory created!");
        }



        //TODO REFACTOR
        if(requestEmitter){
            requestEmitter.on(Internal.UPDATE_VAULT_FORMAT, this.updateVaultFormat.bind(this))
            requestEmitter.on(Internal.SAVE_VAULT_SETTINGS, this.saveVaultSettings.bind(this))
            requestEmitter.on(Internal.SAVE_VAULT, this.saveVault.bind(this))
        }
    }


    /**
     * Initializes pending vault
     */
    static createPendingVault(vaultsPath, { onion, key, isEnabled }){
        let id = Vault.generateId()
        let vaultPath = path.join(vaultsPath, id)
        let hsRootDir = path.join(vaultPath, HIDDEN_SERVICES_DIRNAME)
        let hsPath = path.join(hsRootDir, onion)

        fs.mkdirSync(vaultPath)
        fs.mkdirSync(hsRootDir)
        fs.writeFileSync(path.join(vaultPath, "admin"), "")
        fs.writeFileSync(hsPath, JSON.stringify({
            key: key,
            enabled: isEnabled
        }))
        fs.writeFileSync(path.join(vaultPath, PENDING), "")
    }

    isPending(){
        return fs.existsSync(path.join(this.vaultDirectory, PENDING))
    }

    getId(){
        return this.id

    }

    loadHiddenServices(){
        const hsDir = path.join(this.vaultDirectory, HIDDEN_SERVICES_DIRNAME)
        const hsFiles = fs.readdirSync(hsDir);

        return hsFiles.map(hsName =>{
            let hsFilePath = path.join(hsDir, hsName)
            return {
                onion: hsName,
                hsPath: hsFilePath
            }
        })

    }

    getVault(){
        //Get vault
        return fs.readFileSync(path.join(this.vaultDirectory, VAULT), 'utf8');
    }

    getPublicKey(){
        return fs.readFileSync(path.join(this.vaultDirectory, PUBLIC_KEY), 'utf8')
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

    /**
     * This funcion called when the entire vault needs to be resaved.
     * One particular use case if for password change.
     * The entire vault is re-encrypted with new key and resaved
     */
    saveVault(request){
        console.log("SAVE VAULT REQUEST RECEIVED");
        let vaultId = request.headers.pkfpSource;
        let { vault, topics, hash, sign } = request.body
        let publicKey = this.getPublicKey()

        //verifying topic data
        this.verifyVault(vault, hash, sign, publicKey);

        //all is good. Writing
        this._writeVault(vaultId, vault, publicKey, hash, topics)
        console.log("Vault written successfully");

    }



    saveNewVault(vaultBlob, hash, signature, publicKey, id){

        this.verifyVault(vaultBlob, hask, signature, publicKey)

        Logger.debug("Signature is valid");

        if (!id){
            do{
                id = Vault.generateId();
            }while (this.isVaultExist());
        } else if (this.isVaultExist()){
            throw new Error("Vault already exists");
        }
        this._writeVault(id, vaultBlob, publicKey, hash);
        return id;
    }

    verifyVault(vaultBlob, hash, signature, publicKey){
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
        return  fs.existsSync(path.join(this.vaultDirectory  )) &&
            !fs.existsSync(path.join(this.vaultDirectory,  VAULT)) &&
            !fs.existsSync(path.join(this.vaultDirectory,  PUBLIC_KEY)) &&
            fs.existsSync(path.join(this.vaultDirectory,   PENDING))
    }

    isRegistrationActive(){
        let adminPublicKey = AdminKey.get();
        if(!this.isRegistrationPending()){
            return false
        }

        let signData =  fs.readFileSync(path.join(this.vaultDirectory, PENDING), "utf8");
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
        return this.vaultDirectory ;
    }

    getVaultPath(){
        return path.join(this.vaultDirectory, "vault");
    }

    getTopicsPath(){
        let topicsPath =  path.join(this.vaultDirectory, "topics");
        if(!fs.existsSync(topicsPath)){
            fs.mkdirSync(topicsPath)
        }
        return topicsPath;
    }

    async deleteVault(){
        if(fs.existsSync(this.vaultDirectory))
            await fs.remove(this.vaultDirectory);
    }

    isVaultExist(){
        let vaultDirectory = this.vaultDirectory;
        let vaultFile = path.join(this.vaultDirectory, "vault");
        let pubKey = path.join(this.vaultDirectory, "publicKey");

        return (fs.existsSync(vaultDirectory) &&
                fs.existsSync(vaultFile) &&
                fs.existsSync(pubKey));
    }


    _writeVault(id, blob, publicKey, hash, topics = {}){
        //Checking if vault directory exist
        if(!fs.existsSync(this.vaultDirectory)){
            //creating if doesn't exist
            fs.mkdirSync(this.vaultDirectory);
        }

        //Same about toipcs directory
        if (!fs.existsSync(path.join(this.vaultDirectory, "topics"))){
            fs.mkdirSync(path.join(this.vaultDirectory, "topics"));
        }


        //If any topics are passed
        if(topics){
            //writing them
            for(let pkfp in topics){
                fs.writeFileSync(path.join(this.vaultDirectory, "topics", pkfp), topics[pkfp])
            }
        }


        //Finalizing: writing vault master key, public key and hash
        fs.writeFileSync(path.join(this.vaultDirectory, "vault"), blob);
        fs.writeFileSync(path.join(this.vaultDirectory, "publicKey"), publicKey);
        fs.writeFileSync(path.join(this.vaultDirectory, "hash"), hash);
    }

    _backupVault(){
        console.log("Backing up vault");
        let timestamp = new Date().toISOString()
        let vaultPath = path.join(this.vaultDirectory, "vault");
        let vaultBakPath = path.join(this.vaultDirectory, `vault_BAK_${timestamp}`);

        let vaultHashPath = path.join(this.vaultDirectory, "hash");
        let vaultHashBakPath = path.join(this.vaultDirectory, `hash_BAK_${timestamp}`);

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

    static generateId(){
        return new RandExp(new RegExp("[a-f0-9]{" + VAULT_ID_LENGTH + "}")).gen();
    }

}

module.exports = {
    Vault: Vault
}
