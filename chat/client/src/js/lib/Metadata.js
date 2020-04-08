import { iCrypto } from "./iCrypto"
import { assert, IErrror as Err } from "../../../../common/IError";

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

    static isMetadataValid(metadata){

        if (typeof metadata === "string"){
            metadata = JSON.parse(metadata);
        }
        let ic = new iCrypto();
        ic.setRSAKey("pub", metadata.body.topicAuthority.publicKey, "public")
          .addBlob("body", JSON.stringify(metadata.body))
          .addBlob("sign", metadata.signature)
          .publicKeyVerify("body", "sign", "pub", "res")
        return ic.get("res");
    }


    constructor(){
        this.body = {
            id: "",
            timestamp: "",
            owner: "",
            sharedKeySignature: "",
            participants: {},
            topicAuthority: {},
            settings: {
                version: "",
                membersData: {},
                invites: {}
            }
        }
        this.signature;
    }

    setMemberAlias(alias = Err.required("alias"), pkfp){
        if(!pkfp){
            pkfp = this.body.owner;
        }
        return this.body.settings.membersData[pkfp].alias = alias;
    }

    getMemberAlias(pkfp){
        if(!pkfp){
            pkfp = this.body.owner;
        }
        return this.body.settings.membersData[pkfp].alias
    }

    setMemberNickname(nickname = Err.required("nickname"), pkfp){
        if(!pkfp){
            pkfp = this.body.owner;
        }
        return this.body.settings.membersData[pkfp].nickname = nickname;
    }

    getMemberNickname(){
        return this.body.settings.membersData[pkfp].nickname
    }
}
