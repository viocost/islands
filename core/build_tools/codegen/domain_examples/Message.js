/**
 *
 * /// FOR FUTURE
 * !message-type
 *     hex-pkfp validated-by hex_pkfp_validate
 *     pem   validated-by pem_validate
 *     hex-string validated-by hex-string-validate
 * ////////////////////////
 *
 * !message CreateTopic
 *     vaultId validated-by hex-pkfp
 *     publicKey validated-by pem
 *     encryptedTopicSettings validated-by hex-string
 *     encryptedVaultRecord validated-by hex-string
 *
 * //sample call
 *
 * let msg = MSG.createTopic(...)
 * let msg2 = MSG.decodeFromBlob(blob);
 *
 * */
//const { hex_pkfp_validete, MessageBase } = require("./CodegenSupport.js");



class CreateTopicMessage extends MessageBase{
    constructor(vaultId, publicKey, encryptedTopicSettings, encryptedVaultRecord){
        super("CreateTopicMessage")
        this.vaultId = vaultId; //not null
        this.publicKey = publicKey; // not null, validate pem format
        this.encryptedVaultRecord = encryptedVaultRecord; // not null
        this.encryptedTopicSettings = encryptedTopicSettings; //not null

    }

    getName(){
        return "CreateTopicMessage"
    }

}
