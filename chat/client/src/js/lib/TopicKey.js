const { AsymFullCryptoAgentFactory, AsymPublicCryptoAgentFactory } = require("../../../../common/CryptoAgent")
const { ChatUtility } = require("./ChatUtility")


class TopicKey{
    constructor(key){
        this.key = AsymFullCryptoAgentFactory.make(key)
        this._raw = this.key.getPrivateKey()
    }

    encryptSettings(settingsObj){
        return ChatUtility.encryptStandardMessage(JSON.stringify(settingsObj), this.key.getPublicKey())
    }

    signSettings(settingsCipher){
        return this.key.sign(settingsCipher)
    }

    encryptName(name){

    }
    encryptNickname(nickname){

    }

    decryptNickname(nickname){


    }

    decryptMessage(msg){

    }

    decryptSettings(settings){
        return JSON.parse(ChatUtility.decryptStandardMessage(settings, this.raw()))
    }

    decryptServiceMessageBody(blob){
        return ChatUtility.decryptStandardMessage(blob, this.raw())
    }

    decryptSharedKey(sharedKeyCipher){
        return this.key.decrypt(sharedKeyCipher)
    }

    getPublicKey(){
        return this.key.getPublicKey()
    }

    validateSettingsSignature(settingsEncrypted, signature){
        if(this.key.verify(settingsEncrypted, signature)){
            throw new Error("Settings blob signature verification failed")
        }
    }

    raw(){
        return this._raw
    }

    pkfp(){
        return this.key.getPkfp()
    }

    static validate(obj){
        if(!(obj instanceof TopicKey)) throw TypeError("Topic key: type is invalid")
    }

}

class TopicAuthorityKey{
    constructor(key){
        this.key = AsymPublicCryptoAgentFactory.make(key)
    }

    raw(){
        return this.key.getKey()
    }
}


function makeTopicKey(key){
    return new TopicKey(key)
}

function makeTopicAuthorityPublicKey(key){
    return new TopicAuthorityKey(key)
}


module.exports =  {
    makeTopicKey: makeTopicKey,
    makeTopicAuthorityPublicKey: makeTopicAuthorityPublicKey,
    TopicKey: TopicKey
}
