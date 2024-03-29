const { NotImplemented } = require("./Error");
const { iCrypto } = require("./iCrypto");
const { SecretHandle } = require("./SecretHandle")

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


class SymCryptoAgent extends CryptoAgent{
    constructor(key = iCrypto.hexEncode(iCrypto.getBytes(32))){
        super()
        this._key = new SecretHandle(key, "Symmetric key");
        console.log(`Sym crypto agent initialized with key ${this._key}`);
    }

    encrypt(data){
        if(typeof data !== "string"){
            data = JSON.stringify(data);
        }

        let ic = new iCrypto()

        let rawKey = this._key.getSecret()
        ic.addBlob("k-hex", rawKey)
          .hexToBytes("k-hex", "k")
          .addBlob("data", data)
          .AESEncrypt("data", "k", "res", true)

        return ic.get("res")
    }

    decrypt(data){
        let ic = new iCrypto()
        ic.addBlob("k-hex", this._key.getSecret())
          .hexToBytes("k-hex", "k")
          .addBlob("data", data)
          .AESDecrypt("data", "k", "res", true)
        return ic.get("res")
    }

    getKey(){
        return this._key;
    }

}


/**
* Sometimes symkey was not decoded to raw bytes before
* encrypting or decrypting which results in crypto errors
*
* This kind of agent encrypts and decrypts without decoding its key to bytes.
* Obviously this is bad and should be used only
* for compatabililty
*
*/
class SymCryptoAgentHexKey extends SymCryptoAgent{
    constructor(key){
        super(key)
    }

    encrypt(data){
        if(typeof data !== "string"){
            data = JSON.stringify(data);
        }

        let ic = new iCrypto()

        ic.addBlob("k-hex", this._key.getSecret())
          .addBlob("data", data)
          .AESEncrypt("data", "k-hex", "res", true)
        return ic.get("res")
 32   }

    decrypt(data){
        let ic = new iCrypto()
        ic.addBlob("k-hex", this._key.getSecret())
          .addBlob("data", data)
          .AESDecrypt("data", "k-hex", "res", true)
        return ic.get("res")
    }
}

class AsymPublicCryptoAgent extends CryptoAgent{
    constructor(key){
        super()
        this._publicKey = key
        this._pkfp = this._calculateFingerprint(key)

    }

    encrypt(blob){
        let ic = new iCrypto()
        ic.setRSAKey("pub", this._publicKey, "public")
          .addBlob("blob", blob)
          .publicKeyEncrypt("blob", "pub", "res", "hex")
        return ic.get("res")
    }

    getKey(){
        return this._publicKey
    }

    verify(blob, signature){

    }

    getPublicKey(){
        return this._publicKey
    }

    getPkfp(){
        return this._pkfp
    }

    _calculateFingerprint(publicKey){
        let ic = new iCrypto()
        ic.setRSAKey("pub", publicKey, "public")
          .getPublicKeyFingerprint("pub", "pkfp")
        return ic.get("pkfp")
    }
}

class AsymFullCryptoAgent extends AsymPublicCryptoAgent{
    constructor(key){
        super(AsymFullCryptoAgent.derivePublicKey(key))
        this.privateKey = new SecretHandle(key);
    }

    static derivePublicKey(privateKey){
        let ic = new iCrypto()
        ic.setRSAKey("pkraw", privateKey, "private")
            .publicFromPrivate("pkraw", "pubk")
        return ic.get("pubk")
    }

    decrypt(blob){
        let ic = new iCrypto()
        ic.addBlob("blob", blob)
          .setRSAKey("privk", this.getPrivateKey(), "private")
          .hexToBytes("blob", "blob-raw")
          .privateKeyDecrypt("blob-raw", "privk", "res")
        return ic.get("res")
    }

    sign(blob){
        let ic = new iCrypto()
        ic.addBlob("blob", blob)
          .setRSAKey("privk", this.getPrivateKey(), "private")
          .privateKeySign("blob", "privk", "res", "sha256", true) //Sha256 hash used, and true is for hexifying the signature
        return ic.get("res")

    }

    getPrivateKey(){
        return this.privateKey.getSecret()
    }
}

class AsymFullCryptoAgentFactory{
    static make(key){
        if(!key){
            let ic = new iCrypto()
            ic.generateRSAKeyPair('kp', 2048)
            key = ic.get("kp").privateKey
        }
        return new AsymFullCryptoAgent(key)
    }
}

class SymCryptoAgentFactory{
    static make(key){
        return new SymCryptoAgent(key)
    }

    static makeFromPassword(password, saltInHex = iCrypto.hexEncode(iCrypto.getBytes(128))){
        let ic = new iCrypto()
        ic.addBlob("salt-hex", saltInHex)
            .createPasswordBasedSymKey("sym", password, "salt-hex")
        return new SymCryptoAgent(ic.get("sym"))
    }

    static makeHex(key){
        return new SymCryptoAgentHexKey(key)
    }

    static makeHexFromPassword(password, saltInHex){
        let ic = new iCrypto()
        ic.addBlob("salt-hex", saltInHex)
            .createPasswordBasedSymKey("sym", password, "salt-hex")
        return new SymCryptoAgentHexKey(ic.get("sym"))
    }
}

class AsymPublicCryptoAgentFactory{
    static make(key){
        //validate key
        return new AsymPublicCryptoAgent(key)
    }
}



module.exports = {
    SymCryptoAgentFactory: SymCryptoAgentFactory,
    AsymPublicCryptoAgentFactory: AsymPublicCryptoAgentFactory,
    AsymFullCryptoAgentFactory: AsymFullCryptoAgentFactory,
}
