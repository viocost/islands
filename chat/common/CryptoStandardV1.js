/**
 * This module implements low level standard crypto API for Islands.
 *
 * This protocol version supports symmetric and asymmetric cryptography.
 *
 * All produced ciphers are prepended with protocol id.
 * On decryption protocol ID is stripped from given cipher and parsed.
 * It must match protocol ID defined in this module, or an error will be thrown.
 * Protocol ID never encrypted.
 *
 * For asymmetric crypto RSA 2048bit keys are used
 * Output cipher is hexified and then protocol ID is prepended
 * On decryption protocol ID is stripped, the rest of the blob dehexified and
 * then blob is decrypted
 * Keys are exported and imported in PEM format.
 *
 *
 * For symmetric crytpo 32 byte keys are used (64 bytes when hexified).
 * Keys are imported and exported in hexified form.
 * All cypher blobs are prepended with protocol ID, On decrytpion it is stripped and parsed.
 * AES-256 algorithm is used for encryption / decryption
 * cypher is always hexified.
 * On decryption protocol id is stripped, cipher dehexified and then decrypted.
 *
 *
 */


//This constant is always prepended to any produced cipher text
//Any decryption attempt will strip first 3 bytes from cipher text and match it with
// this constant. If it doesn't match - error will be thrown
class CryptoError extends Error{ constructor(data){ super(data); this.name = "CryptoError" } }
class InvalidProtocolError extends CryptoError{ constructor(data){ super(data); this.name = "InvalidProtocolError" } }

const { iCrypto } = require("./iCrypto")
const PROTOCOL_ID = "!01"

const SYMKEY_LENGTH_ENCODING = 4





module.exports.publicKeyEncrypt = function(blob = Err.required(),
                        publicKey = Err.required()){
    let ic = new iCrypto();
    ic.sym.createKey("symk")
        .addBlob("payload", blob)
        .asym.setKey("pubk", publicKey, "public")
        .sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8")
        .asym.encrypt("symk", "pubk", "symcip", "hex")
        .encodeBlobLength("symcip", SYMKEY_LENGTH_ENCODING, "0", "symciplength")
        .merge(["blobcip", "symcip", "symciplength"], "res");
    return `${PROTOCOL_ID}${ic.get("res")}`;
}


module.exports.privateKeyDecrypt = function(blob, privateKey){
    let protocol  = blob.substring(0, 3)
    if(protocol !== PROTOCOL_ID){
        throw new InvalidProtocolError(`Crypto protocol is invalid: ${protocol}`)
    }

    let symKeyLength = parseInt(blob.substr(blob.length - SYMKEY_LENGTH_ENCODING));

    let symKeyCipher = blob.substring(blob.length - SYMKEY_LENGTH_ENCODING - symKeyLength, blob.length - SYMKEY_LENGTH_ENCODING);
    let payloadCipher = blob.substring(3, blob.length - SYMKEY_LENGTH_ENCODING - symKeyLength);
    let ic = new iCrypto();
    ic.addBlob("blobcip", payloadCipher)
        .addBlob("symkciphex", symKeyCipher)
        .hexToBytes("symkciphex", "symkcip")
        .asym.setKey("privk", privateKey, "private")
        .asym.decrypt("symkcip", "privk", "symk")
        .AESDecrypt("blobcip", "symk", "blob-raw", true, "CBC", "utf8");
    return ic.get("blob-raw");
}


module.exports.sign = function(data, privateKey){
    if (typeof data !== "string") throw new Error("Data must be a string");
    let ic = new iCrypto()

    ic.addBlob("body", data)
        .setRSAKey("priv", privateKey, "private")
        .privateKeySign("body", "priv", "sign");
    return ic.get("sign");
}

module.exports.verify = function(data, publicKey, sign){
    if (typeof data !== "string") throw new Error("Data must be a string");
    let ic = new iCrypto();
    ic.setRSAKey("pubk", publicKey, "public")
        .addBlob("sign", sign)
        .hexToBytes('sign', "signraw")
        .addBlob("b", data);
    ic.publicKeyVerify("b", "sign", "pubk", "v");
    return ic.get("v");
}

module.exports.createAsymKey = function(){
    let ic = new iCrypto()
    ic.generateRSAKeyPair('kp', 2048)
    return ic.get("kp")
}

module.exports.symKeyEncrypt = function(data, key){
    const ic = new iCrypto();
    ic.addBlob("msg_raw", data)
      .setSYMKey("key", key)
      .AESEncrypt("msg_raw", "key", "msg_enc", true)
    return `${PROTOCOL_ID}${ic.get("msg_enc")}`;
}

module.exports.symKeyDecrypt = function(data, key){
    let protocolId = data.substring(0, 3);
    if(protocolId !== PROTOCOL_ID) throw new InvalidProtocolError(protocolId)
    const ic = new iCrypto();
    ic.addBlob("msg_enc", data.substr(3))
      .setSYMKey("key", key)
      .AESDecrypt("msg_enc", "key", "msg_raw", true)
    return ic.get("msg_raw");

}

module.exports.createSymKey = function(){
    let ic = new iCrypto()
    ic.createSYMKey("sym", 32)
    return ic.get("sym")
}

module.exports.hash = function(blob){
    let ic = new iCrypto()
    ic.addBlob("b", blob)
      .hash("b", "hash", "sha256")
    return (ic.get("hash"))

}
