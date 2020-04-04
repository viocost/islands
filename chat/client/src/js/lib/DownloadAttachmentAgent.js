import { WildEmitter } from "./WildEmitter";
import { FileWorker } from "./FileWorker";
import { IError as Err } from "../../../../common/IError";


export class DownloadAttachmentAgent extends WildEmitter{
    constructor(fileInfo = Err.required("File info")){
        super();
        this.fileInfo = fileInfo;
    }
/**
     * Downloads requested attachment
     *
     * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
     *          Must contain all required info including hashes, signatures, and link
     */
    downloadAttachment(){
        return new Promise(async (resolve, reject)=>{
            console.log("About to download the attachment");
            try{
                let self = this;
                let privk = self.session.privateKey; //To decrypt SYM key

                //Getting public key of
                let parsedFileInfo = JSON.parse(fileInfo);

                let fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

                console.log(`Downloading with worker or sync`);
                const myPkfp = self.session.publicKeyFingerprint;
                let fileData = await self.downloadAttachmentDefault(fileInfo, myPkfp, privk, fileOwnerPublicKey, parsedFileInfo.name);
                self.emit("download_complete", {fileInfo: fileInfo, fileData: fileData});
                resolve()
            } catch (err){
                reject(err)
            }
        })

    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // This is for test purposes only!
    downloadAttachmentDefault(fileInfo, myPkfp, privk, ownerPubk, fileName){
        console.log(`Downloading attachment by default`);
        let self = this;

        return new Promise(async (resolve, reject)=>{
            try{
                const downloader = new FileWorker();

                const downloadComplete = (fileBuffer)=>{
                    console.log("RECEIVED FILE BUFFER FROM THE WORKER: length: " + fileBuffer.length)
                    resolve(fileBuffer);
                };

                const downloadFailed = (err)=>{
                    console.log("Download failed with error: " + err);
                    reject(err);
                };

                const processLog = (msg) =>{
                    console.log("WORKER LOG: " + msg)
                }

                const messageHandlers = {
                    "download_complete": downloadComplete,
                    "download_failed": downloadFailed,
                    "log": processLog,
                    "file_available_locally": ()=>{
                        self.emit("file_available_locally", fileName)
                        notify("File found locally.")
                    },
                    "requesting_peer": ()=>{

                        self.emit("requesting_peer", fileName)
                        notify("Requesting peer to hand the file...")
                    }
                };


                const notify = (msg)=>{
                    console.log("FILE TRANSFER EVENT NOTIFICATION: " + msg);
                }

                const processMessage = (msg)=>{
                    messageHandlers[msg.message](msg.data)
                };

                downloader.on("message",  (ev)=>{
                    processMessage(ev.data)
                });

                downloader.on("error",  (ev)=>{
                    console.log(ev);
                    reject("Downloader worker error");
                });

                try{

                    downloader.downloadFile({
                            fileInfo: fileInfo,
                            myPkfp: myPkfp,
                            privk: privk,
                            pubk: ownerPubk
                        })
                }catch (e){
                    console.log(`Error downloading file: ${e}`);
                    throw e;
                }
            }catch (e) {

                reject(e)
            }

        })
    }

}
