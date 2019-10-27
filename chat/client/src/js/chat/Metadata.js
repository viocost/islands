import { iCrypto } from "../lib/iCrypto";

export class Metadata{
    static parseMetadata(blob){
        if(typeof (blob) === "string"){
            return JSON.parse(blob);
        }else{
            return blob;
        }
    }

    static extractSharedKey(pkfp, privateKey, metadata){
        let keyCipher = metadata.body.participants[pkfp].key;
        let ic = new iCrypto();
        ic.addBlob("symcip", keyCipher)
            .asym.setKey("priv", privateKey, "private")
            .asym.decrypt("symcip", "priv", "sym", "hex");
        return ic.get("sym");
    }

    static isMetadataValid(metadata, taPublicKey){

    }
}




