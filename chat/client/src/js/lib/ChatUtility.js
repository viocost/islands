import { iCrypto } from "./iCrypto"


export class ChatUtility{
    /**
     * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
     * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
     * Sym key generated randomly every time
     * @param blob - cipher blob
     * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
     * @param privateKey
     * @returns {}
     */
    static decryptStandardMessage(blob = Err.required(),
                                  privateKey = Err.required(),
                                  lengthSymLengthEncoded = 4, ){

        let symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));

        let symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
        let payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
        let ic = new iCrypto();
        ic.addBlob("blobcip", payloadCipher)
            .addBlob("symkcip", symKeyCipher)
            .asym.setKey("privk", privateKey, "private")
            .privateKeyDecrypt("symkcip", "privk", "symk", "hex")
            .AESDecrypt("blobcip", "symk", "blob-raw", true,  "CBC", "utf8");
        return ic.get("blob-raw");
    }

    static encryptStandardMessage(blob = Err.required(),
                                  publicKey = Err.required(),
                                  lengthSymLengthEncoded = 4,){
        let ic = new iCrypto();
        ic.sym.createKey("symk")
            .addBlob("payload", blob)
            .asym.setKey("pubk", publicKey, "public")
            .AESEncrypt("payload", "symk", "blobcip", true, "CBC", "utf8")
            .asym.encrypt("symk", "pubk", "symcip", "hex")
            .encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength")
            .merge(["blobcip", "symcip", "symciplength"], "res");
        return ic.get("res");
    }

    static publicKeyEncrypt(blob = Err.required(),
                            publicKey = Err.required()){
        const ic = new iCrypto();
        ic.addBlob("blob", blob)
            .asym.setKey("pubk", publicKey, "public")
            .publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
        return ic.get("blobcip");
    }

    static privateKeyDecrypt(blob, privateKey, encoding = "hex"){
        const ic = new iCrypto();
        ic.addBlob("blobcip", blob)
            .asym.setKey("priv", privateKey, "private")
            .privateKeyDecrypt("blobcip", "priv", "blob", encoding);
        return ic.get("blob");
    }

    static symKeyEncrypt(blob, key, hexify = true){
        const ic = new iCrypto();
        ic.addBlob("b", blob)
            .sym.setKey("sym", key)
            .AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8");
        return ic.get("cip")
    }

    static symKeyDecrypt(cip, key, dehexify = true){
        const ic = new iCrypto();
        ic.addBlob("cip", cip)
            .sym.setKey("sym", key)
            .AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
        return ic.get("b")
    }



}

