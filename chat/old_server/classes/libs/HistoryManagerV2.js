const WrapupRecord = require("../objects/WrapupRecord.js");
const KeyBuilder = require("../../../server/StorageKeyBuilderAdapter")
const Logger = require("../libs/Logger.js");
const { Storage } = require("../../../server/Storage")
const { HistoryManager } = require("./HistoryManager")



class HistoryManagerV2 extends HistoryManager{

    constructor(){
        super("./")

    }

    setTopicKeyPaths(){
        this.topicKeyPaths = {
            ownerHSPrivateKey: "client_hs_key", //Encrypted private key for Owner (client) hidden service
            ownerPublicKey: "client_public_key", //Raw owner's (client) public key
            taHSPrivateKey: "topic_hs_private_key", //Encrypted private key for topic hidden service
            taPrivateKey: "topic_private_key", //Encrypted topic authority private key () required to sign metadata and invites)
        }
    }
    //Given topic pkfp returns corresponding storage object
    //pkfp can be either topic pkfp or topic authority pkfp
    getStorageByTopicPkfp(pkfp){
        let topicKey = KeyBuilder.buildKey( "history", pkfp, "history_store" )
        let taKey = KeyBuilder.buildKey( "history", pkfp, "metadata" )
        let storages = Storage.getAllByKeyPresent(topicKey).concat(Storage.getAllByKeyPresent(taKey))


        if(storages.length < 1){
            throw new Error(`No storage found for topic ${pkfp}`)
        }

        if(storages.length > 1){
            throw new Error(`Multiple storages found for topic ${pkfp}`)
        }

        return storages[0]
    }

    getHistoryStorage(pkfp){
        let storages = Storage.getAllByKeyPresent(path.join("history", pkfp, "history"))

        if(storages.length === 0){
            throw new Error(`History directory does not exist for pkfp ${pkfp}`)
        }

        if(storages.length > 1){
            throw new Error(`Multiple history directories exist for ${pkfp}`)
        }


        return storages[0];

    }

    getAllhistoryIDs(includingTAMetadata = false){
        let result = []
        for(let storage of Storage.everyStorageObject()){

            let keys = storage.allKeys()
                .filter(key=> includingTAMetadata ? /(history_store|metadata)/.test(key): /history_store/.test(key))
                .map(key=>KeyBuilder.decomposeKey(key)[1])

            result.concat(keys)
        }
        return result
    }

    /**
     * initializes new topic and history file. After completion history will be found in
     * historyDirectory/topicID/history
     * @param pkfp - going to be a directory name in the history directory
     * @param ownerPublicKey
     * @param ownerHSKey - encrypted private key for user's hidden service.
     *          Will be appended as is to private key file.
     */
    initTopic(pkfp = Err.required("HistoryManager initTopic error: missing required parameter 'pkfp'"),
              ownerPublicKey = Err.required("HistoryManager initTopic error: missing required parameter 'ownerPublicKey'"),
              ownerHSKey = Err.required("HistoryManager initTopic error: missing required parameter 'ownerHSKey'"),
              vaultId = Err.required("Vault ID")
              ){
        return new Promise((resolve, reject)=>{
            Logger.debug("Initializing topic for pkfp: " + pkfp);

            try{
                let storageObject = Storage.getByIdentity(vaultId)

                if(!storageObject) {
                    throw new Error("No storage object found")
                }


                //let topicPath = path.join(storageObject.getBasePath(), "history" , pkfp);
                if (storageObject.has(pkfp)) {
                    reject("Topic with such id already exists!");
                    return;
                }


                //Writing topic keys

                let ownerPublicKeyPath = this.getKeyPath(pkfp, "ownerPublicKey");
                let ownerHSPrivateKeyPath = this.getKeyPath(pkfp, "ownerHSPrivateKey");
                let historyFilePath = KeyBuilder.buildKey(  "history", pkfp, "history_store"  )
                console.log(`Writing key ${ownerPublicKeyPath}`);
                console.log(`Writing key ${ownerHSPrivateKeyPath}`);
                storageObject.write(ownerPublicKeyPath, ownerPublicKey)
                storageObject.write(ownerHSPrivateKeyPath, ownerHSKey)

                //writing empty history file
                console.log("Writing empty history file");
                storageObject.write(historyFilePath,"")
                resolve();

            } catch(err){
                console.log(err);
                reject(err)
            }
        })
    }

    initTopicAuthority(taPkfp = Err.required(), vaultId){
        console.log("Initializing topic authority");

        let storageObject = Storage.getByIdentity(vaultId)

        if(!storageObject) {
            throw new Error("No storage object found")
        }

        //let taPath = this.getPath(taPkfp, "topicAuthority");
        let taMetadataPath = KeyBuilder.buildKey("history", taPkfp, "metadata");

        storageObject.write(taMetadataPath, "")
        console.log("Topic authority created");
    }


    taSavePrivateKey(taPkfp, keyData){
        let storage = this.getStorageByTopicPkfp(taPkfp);
        let key = this.getKeyPath(taPkfp, "taPrivateKey")
        storage.write(key, keyData)
    }

    taGetPrivateKey(taPkfp){
        let storage = this.getStorageByTopicPkfp(taPkfp);
        let key = this.getKeyPath(taPkfp, "taPrivateKey")
        return storage.getBlob(key);
    }

    taSaveHsPrivateKey(taPkfp, keyData){
        let storage = this.getStorageByTopicPkfp(taPkfp);
        let key = this.getKeyPath(taPkfp, "taHSPrivateKey")
        storage.write(key, keyData)
    }

    taGetHsPrivateKey(taPkfp){

        let storage = this.getStorageByTopicPkfp(taPkfp);
        let key = this.getKeyPath(taPkfp, "taHSPrivateKey")
        return storage.getBlob(key);
    }

    getAllhistoryIDs(includingTAMetadata = false){
        let result = []

        for (let storage of Storage.everyStorageObject()){
            let pattern = includingTAMetadata ? /^history\/[0-9a-f]{64}\/history_store/ :
                /^history\/[0-9a-f]{64}\/(history_store|metadata)/
            let keys  = storage.allKeys().filter(item=>pattern.test(item))

            //The key is in form of history/<pkfp/history_store
            //thus we split it with separator KeyBuilder.SEP and only add second element of
            // splitted key, which will be pkfp
            result = result.concat(keys.map(item=>item.split(KeyBuilder.SEP)[1]))
        }

        console.dir(result)
        return  result
    }


    historyKey(pkfp = Err.required("Path to history")){
        return KeyBuilder.buildKey("history", pkfp, "history_store")
    }

    inviteKey(pkfp = Err.required("pkfp - inviteKey"),
              inviteId = Err.required("invite id")){

        return KeyBuilder.buildKey("history", pkfp, "invites", inviteId)
    }



    pathToHSPrivateKey(pkfp = Err.required("Path to history")){

        return KeyBuilder.buildKey("history", pkfp, "owner_hs_private_key")
    }

    async _appendHistory(pkfp, blob){
        let storage = this.getStorageByTopicPkfp(pkfp)
        let key = this.historyKey(pkfp)
        console.log(`Appending history ${key}`);
        storage.append(key, blob)
    }

    getKeyPath(pkfp = Err.required('getPath: pkfp'),
            pathTo = Err.required('getPath: pathTo')){
        if(!this.topicKeyPaths.hasOwnProperty(pathTo)){
            throw("error getPath: invalid history object: "  + pathTo)
        }
        return KeyBuilder.buildKey("history", pkfp, this.topicKeyPaths[pathTo])
    }


    /**
     * Writes public key of the history's owner to the topic folder
     * @param pkfp
     * @param publicKey
     */
    async writeOwnersPublicKey(pkfp, publicKey){
        let storage = this.getStorageByTopicPkfp(pkfp)
        let key = this.getKeyPath(pkfp,  "ownerPublicKey")
        storage.write(key, publicKey)
    }


    /**
     * Returns a promise of history element as uint8 buffer, no encoding
     * @param {number}length - length of the history element
     * @param {number}start - start position in the history file
     * @param pkfp
     */
    async getHistoryElement(length, start, pkfp, type = "history"){
        return this.getHistoryElementSync(length, start, pkfp, type)
    }


    getHistoryElementSync(length, start, pkfp, type = "history"){

        console.log(`Get history element: length: ${length}, start: ${start},  pkfp: ${pkfp}, type: ${type}`);
        let key = type === "history" ? this.historyKey(pkfp) :
            KeyBuilder.buildKey("history", pkfp, "metadata")

        let storage = this.getStorageByTopicPkfp(pkfp);
        let blobLength = storage.getLength(key);
        start = start === undefined ? blobLength - length : start;

        return storage.getPartialBlob(key, start, length);
    }


    /**
     * Returns last metadata record from history file
     * given history owner's pkfp
     * @param {String} pkfp
     */
    async getLastMetadata(pkfp){
        if (!pkfp) return null;
        // get last wrapup record - last 64 bytes of a file
        let wrapupBlob = await this.getWrapupBlob(pkfp)
        let wrup = new WrapupRecord(wrapupBlob);
        let mStart = wrup.lastMetadataStart;
        let mLength = wrup.lastMetadataEnd - wrup.lastMetadataStart;
        return this.getHistoryElement(mLength, mStart, pkfp)
    }

    getLastMetadataSync(pkfp){
        if (!pkfp) return null;
        // get last wrapup record - last 64 bytes of a file
        let wrapupBlob = this.getWrapupBlobSync(pkfp)
        let wrup = new WrapupRecord(wrapupBlob);
        let mStart = wrup.lastMetadataStart;
        let mLength = wrup.lastMetadataEnd - wrup.lastMetadataStart;
        let buffer = this.getHistoryElementSync(mLength, mStart, pkfp)
        let metadata = buffer.toString();
        return metadata;
    }


    /**
     * Returns wrapup record as utf8 String.
     * if endPos is not specified - it gets last record in the history file
     * which is last 64 bytes.
     * @param pkfp
     * @param endPos
     */
    async getWrapupBlob(pkfp, endPos, type = "history"){
        return this.getWrapupBlobSync(pkfp, endPos, type)
    }

    getWrapupBlobSync(pkfp, endPos, type){
        endPos = endPos ? endPos - 64 : undefined;
        if (endPos < 0) {
            console.log("invalid end position for wrapup record.");
            return;
        }
        return this.getHistoryElementSync(64, endPos, pkfp, type)
    }


    /**
     * Finds and returns specified topic key
     * @param pkfp
     * @param keyType
     */
    async getTopicKey(pkfp = Err.required("getTopicKey: pkfp"),
                keyType = Err.required("getTopicKey: keyType")){

        if (!this.topicKeyPaths.hasOwnProperty(keyType)){
            throw new Error("getTopicKey: invalid key type: " + keyType)
        }
        let pathToKey = this.getKeyPath(pkfp, keyType);

        let storage = this.getStorageByTopicPkfp(pkfp)
        return storage.getBlob(pathToKey)

    }

    async deleteTopic(pkfp){

        let storage = this.getStorageByTopicPkfp(pkfp)
        let pattern = new RegExp(pkfp)
        let keys = storage.allKeys().filter(key=>pattern.test(key));
        for(let key of keys){
            console.log(`Deleting key ${key}`);
            storage.delete(key);
        }
    }

    getHistorySize(pkfp){
        let storage = this.getStorageByTopicPkfp(pkfp)
        let key = this.historyKey(pkfp)
        return storage.getLength(key)
    }


    async taGetMetadata(pkfp, start, length){
        let endPos;
        if (start && length){
            endPos = parseInt(start) + parseInt(length);
        }
        let wrapupBlob = await this.getWrapupBlob(pkfp, endPos, "ta-metadata");
        let wrup = new WrapupRecord(wrapupBlob);
        let mStart = wrup.lastMetadataStart;
        let mLength = wrup.lastMetadataEnd - wrup.lastMetadataStart;
        let buffer = await this.getHistoryElement(mLength, mStart, pkfp, "ta-metadata");
        let blob = buffer.toString();

        return buffer.toString();
    }


    /**
     * Appends metadata to TopicAuthority metadata file
     * @param taPkfp
     * @param metadata
     */
    _preapreTaAppendMetadataJob(taPkfp, metadata){
        if (typeof(metadata) !== "string"){
            throw new Error("taAppendMetadata error - metadata must be type of string");
        }

        let self = this;
        return async function(){
            let hm = this.hm;

            let key = KeyBuilder.buildKey("history", taPkfp, "metadata")
            let storage = self.getStorageByTopicPkfp(taPkfp);
            let start, wrup;

            if(storage.has(key) && storage.getLength(key) > 64){
                wrup =  await hm.getWrapupBlob(this.taPkfp, undefined, "ta-metadata");
                wrup = new WrapupRecord(wrup);
                start = hm.taGetMetadataSize(this.taPkfp);
            } else {
                wrup = new WrapupRecord();
                start = 0;
            }

            let end = start + this.metadata.length;
            wrup.setLastMetadata(start, end);

            const res = this.metadata + wrup.toBlob();

            await hm._appendTAMetadata(this.taPkfp, res);
        }.bind({taPkfp: taPkfp, metadata: metadata, hm: this})
    }

    async _appendTAMetadata(pkfp, blob){
        let storage = this.getStorageByTopicPkfp(pkfp)
        let key = KeyBuilder.buildKey("history", pkfp, "metadata")
        storage.append(key, blob)
    }


    async taGetInvite(inviteId = Err.required(), pkfp = Err.required()){
        let inviteKey = this.inviteKey(pkfp, inviteId);
        let storage = this.getStorageByTopicPkfp(pkfp);
        return storage.getBlob(inviteKey)
    }

    async taDelInvite(inviteId = Err.required(), pkfp = Err.required()){
        let inviteKey = this.inviteKey(pkfp, inviteId);
        let storage = this.getStorageByTopicPkfp(pkfp);
        storage.delete(inviteKey)
    }

    async saveNewInvite(blob, inviteID, pkfp ){
        let inviteKey = this.inviteKey(pkfp, inviteID);
        let storage = this.getStorageByTopicPkfp(pkfp);
        storage.write(inviteKey, blob)
    }


    getHistorySize(pkfp){
        let storage = this.getStorageByTopicPkfp(pkfp)
        let key = KeyBuilder.buildKey("history", pkfp, "history_store")
        return storage.getLength(key)
    }


    taGetMetadataSize(taPkfp){
        let storage = this.getStorageByTopicPkfp(taPkfp)
        let key = KeyBuilder.buildKey("history", taPkfp, "metadata")
        return storage.getLength(key);
    }


    async taSaveInviteIndex(taPkfp, data){
        let storage = this.getStorageByTopicPkfp(taPkfp)
        let key = KeyBuilder.buildKey("history", taPkfp, "invites", "invite_index")
        storage.write(key, data)
    }


    async taDelInvite(inviteId = Err.required(), taPkfp = Err.required()){

        let storage = this.getStorageByTopicPkfp(taPkfp)
        let key = KeyBuilder.buildKey("history", taPkfp, "invites", inviteId)
        storage.delete(key)
    }


    /**
     * Removes invite file
     * @param pkfp
     * @param inviteCode
     */
    async consumeInvite(taPkfp = Err.required("consumeInvite"),
                  inviteId = Err.required("consumeInvite")){

        let storage = this.getStorageByTopicPkfp(taPkfp)
        let key = KeyBuilder.buildKey("history", taPkfp, "invites", inviteId)
        storage.delete(key)

    }

}

module.exports = {
    HistoryManagerV2: HistoryManagerV2
}
