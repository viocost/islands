const { iCrypto } = require("./iCrypto");

class SecretHandle{
    static _secrets = {}
    constructor(secret, visibleText="Secret"){
        this.visibleText = visibleText

        //finding nonexistent key and writing secret to static _secrets mape
        //under new key
        while(true){
            let key = iCrypto.createRandomHexString(10); //parameter is a key length
            if(key in SecretHandle._secrets) continue
            SecretHandle._secrets[key] = secret
            this.key = key
            break;
        }
    }

    getSecret(){
        return SecretHandle._secrets[this.key]
    }

    forget(){
        delete SecretHandle._secrets[this.key]
        this.key = null;
        this.visibleText = null;
    }

    toString(){
        return this.visibleText;
    }
}


module.exports = {
    SecretHandle: SecretHandle
};
