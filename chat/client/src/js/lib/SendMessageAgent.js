import { ChatMessage } from "./ChatMessage";
import { Message } from "./Message"
import { assert } from "../../../../common/IError";
import { Topic } from "./Topic";
import { Internal } from "../../../../common/Events";
import { FileWorker } from "./FileWorker"
import { AttachmentInfo } from "./AttachmentInfo";

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

            if (self.files && self.files.length >0){
                attachmentsInfo = await self.uploadAttachments(self.files, self.chatMessage.header.id, metaID);
                for (let att of attachmentsInfo) {
                    self.chatMessage.addAttachmentInfo(att);
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


    /**
     * Takes list of files and uploads them
     * to the Island asynchronously.
     *
     * Resolves with list of fileInfo JSON objects.
     * @param filesAttached list of files each type of File
     * @return Promise
     */
    uploadAttachments(filesAttached, messageID, metaID){
        return new Promise(async (resolve, reject)=>{
            const self = this;

            const filesProcessed = [];

            const pkfp = self.topic.pkfp;
            const privk = self.topic.privateKey;
            const symk = self.topic.sharedKey;
            const residence = self.topic.participants[pkfp].residence;

            for (let file of filesAttached){
                console.log("Calling worker function");
                filesProcessed.push(self.uploadAttachmentDefault(file, pkfp, privk, symk, messageID, metaID, residence))
            }

            Promise.all(filesProcessed)
                .then((fileInfo)=>{
                    resolve(fileInfo)
                })
                .catch(()=>{
                    console.log("ERROR DURING UPLOAD ATTACHMENTS");
                    reject();
                })
        })
    }

    /**
     * Uploads single attachment without workers asyncronously
     *
     */
    uploadAttachmentDefault(file, pkfp, privk, symk, messageID, metaID, residence){
        let self = this;
        return new Promise((resolve, reject)=>{

            console.log(`Initializing worker...`);
            let uploader = new FileWorker(0);

            let uploadComplete = (msg)=>{
                let fileInfo = new AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
                resolve(fileInfo);
            };

            let uploadProgress = (msg) =>{
                //TODO implement event handling
                console.log("Upload progress: " + msg)

            };

            let logMessage = (msg)=>{
                console.log("WORKER LOG: " + msg);
            }

            let uploadError = (msg)=>{
                console.log(`Upload attachment error: ${msg.data}`)
                reject(msg.data);
            };

            let messageHandlers = {
                "upload_complete": uploadComplete,
                "upload_progress": uploadProgress,
                "upload_error": uploadError,
                "log": logMessage
            };

            uploader.on("message", (data)=>{
                let msg = data.data;
                messageHandlers[msg.message](msg.data);
            });

            uploader.uploadFile({
                attachment: file,
                pkfp: pkfp,
                privk: privk,
                symk: symk
            })
        })
    }



}
