import { iCrypto } from "./iCrypto";
import { Message } from "./Message";
import { WildEmitter } from "./WildEmitter";
import { Vault } from  "./Vault";
import { Events, Internal } from "../../../../common/Events";

export class TopicJoinAgent{

    constructor(nickname, topicName, inviteString, arrivalHub, messageQueue, vault){
        WildEmitter.mixin(this);
        this.nickname = nickname;
        this.topicName = topicName;
        this.inviteString = inviteString;
        this.messageQueue = messageQueue;
        this.arrivalHub = arrivalHub;
        this.vault = vault
    }

    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */
    start(){
        let self = this;
        setTimeout(()=>{

            let start = new Date();
            console.log("joining topic with nickname: " + self.nickname + " | Invite string: " + self.inviteString);

            console.log(`Preparing keys...`);

            let cryptoStart = new Date()
            let ic = new iCrypto();
            ic.asym.createKeyPair("rsa")
                .getPublicKeyFingerprint('rsa', 'pkfp')
                .addBlob("invite64", self.inviteString.trim())
                .base64Decode("invite64", "invite");

            self.pkfp = ic.get("pkfp")
            self.publicKey = ic.get("rsa").publicKey;
            self.privateKey = ic.get("rsa").privateKey;

            let now = new Date()

            console.log(`Keys generated in ${(now - cryptoStart) / 1000}sec. ${ (now - start) / 1000 } elapsed since beginning.`);

            let callStart = new Date()
            let invite = ic.get("invite").split("/");
            self.inviterResidence = invite[0];
            self.inviterPkfp = invite[1];
            self.inviteCode = invite[2];

            ///////////////////////////////////////////////////////////////////////////
            // if (!self.inviteRequestValid(inviterResidence, inviterPkfp, inviteCode)){ //
            //     self.emit("join_topic_fail");                                     //
            //     throw new Error("Invite request is invalid");                     //
            // }                                                                     //
            ///////////////////////////////////////////////////////////////////////////

            if(!self.inviteCode || !self.inviterPkfp || !(/^[a-z2-7]{16}\.onion$/.test(self.inviterResidence)))
                throw new error("Invite request is invalid")


            // Encrypted vault record
            console.log(`Topic name is: ${self.topicName}`);
            let vaultRecord = self.vault.prepareVaultTopicRecord(self.vault.version,
                                                                 self.pkfp,
                                                                 self.privateKey,
                                                                 self.topicName)
            let vault = JSON.stringify({
                record: vaultRecord,
                id: self.vault.id
            })

            ic.addBlob("vlt-rec", vault)
            .setRSAKey("priv", self.vault.privateKey, "private")
            .privateKeySign("vlt-rec", "priv", "vlt-sign")


            let request = new Message(self.vault.version);
            request.setCommand(Internal.JOIN_TOPIC);
            request.setSource(self.pkfp);
            request.setDest(self.inviterPkfp);
            let body = {
                inviteString: self.inviteString,
                inviteCode: self.inviteCode,
                destination: self.inviterResidence,
                invitee:{
                    publicKey: self.publicKey,
                    pkfp: self.pkfp
                }
            };

            request.set("body", body);
            request.vaultSign = ic.get("vlt-sign");
            request.vault = vault;
            request.signMessage(self.privateKey);
            console.log("Sending topic join request");
            let sendStart = new Date();
            //self.vault.pendingInvites[self.inviteCode] = {
            //    nickname: nickname,
            //}

            self.arrivalHub.on(self.inviteCode.trim(), (msg)=>{ self.processServerMessage(self, msg)})
            self.arrivalHub.on(Events.JOIN_TOPIC_FAIL, (msg)=>{ self.onJoinTopicFail(self, msg)})
            self.messageQueue.enqueue(request);
            now = new Date()
            console.log(`Request sent to island in  ${(now - sendStart) / 1000}sec. ${ (now - start) / 1000 } elapsed since beginning.`);
        }, 100)
    }

    processServerMessage(self, msg){
        console.log("Join agent got message from the server");
        console.log(msg.headers.command)
    }

    notifyJoinSuccess(request, self){
        console.log("Join successfull received!");
        return;
        let topicInfo = self.pendingTopicJoins[request.body.inviteCode];
        self.initSettingsOnTopicJoin(topicInfo, request);

        console.log("new topic pkfp: " + JSON.stringify(topicInfo));
        self.emit("topic_join_success", {
            pkfp: topicInfo.pkfp,
            nickname: topicInfo.nickname,
            privateKey: topicInfo.privateKey
        });
    }

    onJoinTopicSuccess(self, msg){


        console.log("Topic join success! Adding new topic...");
        return
        let topicPkfp = self.addNewTopic(self, msg);
        //self.vault.topics[topicPkfp].exchangeNicknames()
    }

    onJoinTopicFail(self, msg){
        console.log(`Join topic attempt has failed: ${msg.body.errorMsg}`);
        return
    }

}
