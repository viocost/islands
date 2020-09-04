import { createDerivedErrorClasses } from "../../../../common/DynamicError"
import { iCrypto } from "../../../../common/iCrypto"

class CryptoAgentError extends Error { constructor(data) { super(data); this.name = "CryptoAgentError" } }
const err = createDerivedErrorClasses(CryptoAgentError, {
    baseClassInvoke: "BaseClassMethodInvokeAttempt"
})

class CryptoAgent {
    encrypt() {
        throw new err.baseClassInvoke()
    }

    decrypt() {
        throw new err.baseClassInvoke()
    }
}

class SYMCryptoAgent extends CryptoAgent{
    constructor(key){
        super()
        this._key = key
    }

    encrypt(data) {
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        const ic = new iCrypto();
        ic.addBlob("msg_raw", msg)
            .setSYMKey("key", this._key)
            .AESEncrypt("msg_raw", "key", "msg_enc", true)
        return ic.get("msg_enc");
    }

    decrypt(data) {
        const ic = new iCrypto();
        ic.addBlob("msg_enc", data)
            .setSYMKey("key", this._key)
            .AESDecrypt("msg_enc", "key", "msg_raw", true)
        return ic.get("msg_raw");
    }
}

class PasswordBasedSYMCryptoAgent extends CryptoAgent{
    constructor(key){

        console.log("hello")
        super()


    }
}

class ASYMCryptoAgent extends CryptoAgent{



}
