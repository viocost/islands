import { ChatMessage } from "./ChatMessage";
import { Message } from "./Message"
import { assert } from "../../../../common/IError";
import { Topic } from "./Topic";
import { Internal } from "../../../../common/Events";

export class SendMessageAgent{
    constructor(topic, msg, recipient, files){
        assert(topic instanceof Topic);
        assert(msg);
        this.private = (recipient && recipient !== "ALL");
        this.recipient = recipient;
        this.topic = topic;
        this.files = files;
        this.version = this.topic.version;
        this.chatMessage = this.prepareMessage(this.version, msg, recipient);
    }


    send(){
        let self = this;
        setTimeout(async ()=>{
            let attachmentsInfo;
            const metaID = self.topic.metadataId;
            console.log(`ON SEND: metadata id: ${metaID}`  )

            if (self.files && self.files.length >0){
                attachmentsInfo = await self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);
                for (let att of attachmentsInfo) {
                    chatMessage.addAttachmentInfo(att);
                }
            }

            self.chatMessage.encryptMessage(self.topic.sharedKey);
            self.chatMessage.sign(self.topic.privateKey);

            //Preparing request
            let message = new Message(self.version);
            message.headers.pkfpSource = self.topic.pkfp;
            message.headers.command = (self.private) ?
                Internal.SEND_MESSAGE : Internal.BROADCAST_MESSAGE;
            message.body.message = self.chatMessage.toBlob();
            let currentTime = new Date().getTime();
            message.travelLog = {};
            message.travelLog[currentTime] = "Outgoing processed on client.";
            message.signMessage(self.topic.privateKey);
            console.log(`Sending outgoing broadcast message. command: ${message.headers.command}`);
            self.topic.messageQueue.enqueue(message);
            console.log("Chat message enqueued");
        }, 100)

        return self.chatMessage;
    }

    prepareMessage(version, messageContent, recipient) {
        assert(version !== undefined && version !== "", "Chat message initialization error: Version is required")
        console.log(`Preparing message: ${version}, ${messageContent}, ${recipient}`);

        let chatMessage = new ChatMessage();
        chatMessage.version = version;
        chatMessage.header.metadataID = this.topic.metadataId;
        console.log(`Metadata id is set to ${chatMessage.header.metadataID}`)
        chatMessage.header.author = this.pkfp;
        chatMessage.header.recipient = this.recipient ? this.recipient : "ALL";
        chatMessage.header.private = this.private;
        chatMessage.header.nickname = this.topic.getCurrentNickname();
        chatMessage.body = messageContent;
        return chatMessage;
    }

    uploadAttachments(){

    }


}
