const { NotImplemented } = require("./Error");
const { iCrypto } = require("./iCrypto");


class CryptoAgent{
    encrypt(){
        throw new NotImplemented()
    }

    decrypt(){
        throw new NotImplemented()
    }

    sign(){
        throw new NotImplemented()
    }

    verify(){
        throw new NotImplemented()
    }
}


class SymCryptoAgent{
    constructor(key){
        if( undefined === key ){
            let key = iCrypto.hexEncode(iCrypto.getBytes());
        }

        this._key = key;
    }

    encrypt(data){
        if(typeof data !== "string"){
            data = JSON.stringify(data);
        }

        let ic = new iCrypto()
        ic.addBlob("k-hex", this._key)
          .hexToBytes("k-hex", "k")
          .addBlob("data", data)
          .AESEncrypt("data", "k", "res", true)

        return ic.get("res")
    }

    decrypt(data){
        let ic = new iCrypto()
        ic.addBlob("k-hex", this._key)
          .hexToBytes("k-hex", "k")
          .addBlob("data", data)
          .AESDecrypt("data", "k", "res", true)
        return ic.get("res")
    }

    getKey(){
        return this._key;
    }

}

class CryptoAgentFactory{
    static makeSessionCryptoAgent(key){
        return new SymCryptoAgent(key);
    }
}

module.exports = {
    CryptoAgentFactory: CryptoAgentFactory
}
