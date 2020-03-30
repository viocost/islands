import { ChatMessage } from "./ChatMessage";

export class SendMessageAgent{
    constructor(topic, msg, recipient, files){
        this.private = (recipient && recipient !== "ALL");
        this.topic = topic;
        this.files = files;
        this.chatMessage = this.prepareMessage(this.version, msg, recipient);
    }


    send(messageContent, recipient, filesAttached){
        let self = this;
        setTimeout(async ()=>{
            let attachmentsInfo;
            const metaID = self.topic.metadataId;

            const chatMessage = self.prepareMessage(this.topic.version, messageContent, recipient);

            if (this.files && this.files.length >0){
                attachmentsInfo = await self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);
                for (let att of attachmentsInfo) {
                    chatMessage.addAttachmentInfo(att);
                }
            }

            chatMessage.encryptMessage(self.sharedKey);
            chatMessage.sign(self.privateKey);

            //Preparing request
            let message = new Message(self.version);

            message.headers.pkfpSource = self.pkfp;
            message.headers.command = (!recipient || recipient === "ALL") ?
                Internal.BROADCAST_MESSAGE : Internal.SEND_MESSAGE;
            message.body.message = chatMessage.toBlob();
            let currentTime = new Date().getTime();
            message.travelLog = {};
            message.travelLog[currentTime] = "Outgoing processed on client.";
            message.signMessage(self.privateKey);
            console.log("Sending outgoing broadcast message");
            self.messageQueue.enqueue(message);
            console.log("Chat message enqueued");
        }, 100)

        return self.chatMessage.header.id;
    }

    prepareMessage(version, messageContent, recipient) {
        if(version === undefined || version === "") throw new Error("Chat message initialization error: Version is required");
        console.log("Preparing message: " + messageContent);


        let chatMessage = new ChatMessage();
        chatMessage.version = version;
        chatMessage.header.metadataID = this.metadataId;
        chatMessage.header.author = this.pkfp;
        chatMessage.header.recipient = recipient ? recipient : "ALL";
        chatMessage.header.private = !!recipient && chatMessage.header.recipient !== "ALL";
        chatMessage.header.nickname = this.topic.getCurrentNickname();
        chatMessage.body = messageContent;
        return chatMessage;
    }

    uploadAttachments(){

    }


}
