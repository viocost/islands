import { iCrypto } from "./iCrypto"
import { assert, IError as Err } from "../../../../common/IError";
import { ClientSettings } from "./ClientSettings";
import { ChatUtility } from "./ChatUtility";

export class Metadata{
    static parseMetadata(blob){
        if(typeof (blob) === "string"){
            return JSON.parse(blob);
        }else{
            return blob;
        }
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

    //Parses metadata blob and decrypts settings if found
    static fromBlob(metadata = Err.required(), privateKey){
        let parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        let res = new Metadata();

        res.body = parsed.body;
        res.signature = parsed.signature;
        if (parsed.body.settings){
            assert(privateKey, "No Private key to decrypt settings")
            res.body.settings = res.decryptSettings(parsed.body.settings, privateKey);
        } else {
            console.log("Warning! Metadata without settings!")
            res.body.settings = res.initializeSettings();
        }

        return res;
    }

    decryptSettings(settings = Err.required("settings"),
                    privateKey = Err.required("privateKey")){
      return JSON.parse(ChatUtility.decryptStandardMessage(settings, privateKey))
    }

    encryptSettings(publicKey = Err.required("publicKey"), settings = Err.required("settings")){
        if(typeof settings === "object"){
            settings = JSON.stringify(settings);
        }
        return ChatUtility.encryptStandardMessage(settings, publicKey);
    }

    getSharedKey(privateKey){

        return ChatUtility.privateKeyDecrypt(this.body.participants[this.pkfp].key, this.privateKey);
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


    addInvite(inviteCode, name = ""){
        this.body.settings.invites[inviteCode] =  {
            name: name
        }
    }

    deleteInvite(inviteCode){
        delete this.body.settings.invites[inviteCode];
    }

    getInvites(){
        return JSON.parse(JSON.stringify(this.body.settings.invites));
    }

    updateMetadata(newMetadata){

    }

    updateInvites(invites){
        this.body.settings.invites = ChatUtility.syncMap(invites, this.body.settings.invites, {name: ""});
    }

    updateSettings(){

    }

    getId(){
        return this.body.id;
    }

    getSharedKey(pkfp = Err.required("pkfp"),
                 privateKey = Err.required("privateKey")){
        return ChatUtility.privateKeyDecrypt(this.body.participants[pkfp].key, privateKey);
    }

    getSettingsEncrypted(privateKey = Err.required()){
        let ic = new iCrypto();
        ic.asym.setKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pub")
        let publicKey = ic.get("pub");

        let settings = JSON.stringify(this.body.settings);
        let settingsEnc = ClientSettings.encrypt(publicKey, settings);

        ic.addBlob("cipher", settingsEnc)
          .privateKeySign("cipher", "privk", "sign")

        return {
            settings: settingsEnc,
            signature: ic.get("sign")
        }
    }

    getTAPublicKey(){
        return this.body.topicAuthority.publicKey
    }

    getTAPkfp(){
        return this.body.topicAuthority.pkfp
    }


    initializeSettings(version = "2.0.0"){
        return {
            version: version,
            membersData: {},
            invites : {}
        }
    }
}
