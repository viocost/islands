import { IError as Err } from "../../../../common/IError";
import { iCrypto } from "../../../../common/iCrypto";
import { createDerivedErrorClasses } from "../../../../common/DynamicError"

class KeyAgentError extends Error{ constructor(data){ super(data); this.name = "KeyAgentError" } }

const err = createDerivedErrorClasses(KeyAgentError, {
    decryptionError: "DecryptionError"
})

class KeyAgent{
    constructor(password){
        this.password = password;
    }
}


export class MasterRSAKeyAgent extends KeyAgent{
    constructor(password){
        super(password);
        this.masterPrivateKey;
        this.masterPublicKey;
    }

    initializeMasterKey(vaultEncrypted){
        // trying to decrypt
        let vaultRaw = JSON.parse(this._passwordSymkeyDecrypt(vaultEncrypted));
        this.masterPrivateKey = vaultRaw.privateKey;
        let ic = new iCrypto()
        ic.setRSAKey("private_key", this.masterPrivateKey, "private")
          .publicFromPrivate("private_key", "public_key")
        this.masterPublicKey = ic.get("public_key")
    }

    masterKeyEncrypt(data){
        const ic = new iCrypto();
        ic.addBlob("data", data)
            .asym.setKey("pubk", publicKey, "public")
            .publicKeyEncrypt("data", "pubk", "datacip", "hex");
        return ic.get("datacip");
    }

    masterKeyDecrypt(data){
        try{
            const ic = new iCrypto();
            ic.addBlob("blobcip", data)
                .asym.setKey("priv", this.privateKey, "private")
                .privateKeyDecrypt("blobcip", "priv", "data", "hex");
            return ic.get("data");
        }catch(error){
            throw new err.decryptionError(error.message)
        }
    }


    masterKeySign(data = Err.required("Blob to sign")){
        let ic = new iCrypto();
        ic.addBlob("data", data)
            .hash("data", "hash")
            .setRSAKey("asymkey", this.privateKey, "private")
            .privateKeySign("hash", "asymkey", "sign");
        return ic.get("sign")

    }

    masterKeyVerify(data = Err.required("Blob to verify"),
                    signature = Err.required("Signature")){
        let ic = new iCrypto();
        ic.setRSAKey("pub", this.publicKey, "public")
            .addBlob("cipher", data)
            .addBlob("sign", signature)
            .publicKeyVerify("cipher", "sign", "pub", "verified")
        return ic.get("verified")
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _passwordSymkeyDecrypt(vaultEncrypted){
        try{
            let ic = new iCrypto();

            ic.addBlob("s16", vaultEncrypted.substring(0, 256))
                .addBlob("v_cip", vaultEncrypted.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", this.password, "s16")
                .AESDecrypt("v_cip", "sym", "vault_raw", true);
            return ic.get("vault_raw")
        } catch(error){
            throw new err.decryptionError(error.message);
        }
    }

    _passwordSymkeyEncrypt(rawData = Err.required("Data to encrypt")){
        ic.createNonce("salt", 128)
            .encode("salt", "hex", "salt-hex")
            .createPasswordBasedSymKey("key", this.password, "salt-hex")
            .addBlob("data", rawData)
            .AESEncrypt("data", "key", "cipher", true, "CBC", "utf8")
            .merge(["salt-hex", "cipher"], "encrypted_data")
        return ic.get("encrypted_data");
    }

}
