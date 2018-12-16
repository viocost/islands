importScripts("/js/iCrypto.js");
importScripts("/js/socket.io.js");
importScripts("/js/forge.min.js");
importScripts("/js/sjcl.js");
importScripts("/js/socket.io-stream.js");
importScripts("/js/lzma-worker.min.js");
importScripts("/js/chacha.js");


let commandHandlers = {
    "download": processDownload
};


onmessage = (ev)=>{
    console.log("Downloader received message from main thread: " + ev.command);
    processMessage(ev.data);
};


function processMessage(msg){
    console.log("Processing message from main thread..");
    commandHandlers[msg.command](msg.data);

}

function parseFileLink(link){
    let ic = new iCrypto();
    ic.addBlob('l', link)
        .base64Decode("l", "ls");
    let parsed = ic.get("ls");
    let splitted = parsed.split("/");
    return {
        onion: splitted[0],
        pkfp: splitted[1],
        name: splitted[2]
    }
}

/**
 * Concatenates 2 buffers
 * @param buffer1
 * @param buffer2
 * @returns {ArrayBufferLike}
 */
let appendBuffer = function(buffer1, buffer2) {
    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

function processDownload(data){
    return new Promise(async (resolve, reject)=>{
        const fileInfo = JSON.parse(data.fileInfo);
        const link = parseFileLink(fileInfo.link);
        const myPkfp = data.myPkfp;
        const privk = data.privk;
        const ownerPubk = data.pubk;
        const metaID = fileInfo.metaID;

        let fileSocket = await establishConnection();
        /**
         * event triggered by Island when file is ready to be transferred to the client
         * key is encrypted shared SYM key to decrypt file
         */



        fileSocket.on("download_ready", (key)=>{
            //prepare file
            let symk = key[metaID];

            console.log("download_ready triggered. shared key found: " + symk);
            let dataBuffer = new ArrayBuffer(0);
            ss(fileSocket).on("file", (stream)=>{

                console.log("File download in progress!");
                let ic = new iCrypto();
                ic.addBlob("k", symk)
                    .asym.setKey("privk", privk, "private")
                    .asym.decrypt("k", "privk", "symk", "hex");
                    ic.createHash("h");

                ic.ssym.init("stc", ic.get("symk"), false);

                stream.on('data', (data)=>{

                    console.log("ENCRYPTED: " + new Uint8Array(data.slice(0, 32)));
                    let chunk = ic.ssym.decrypt("stc", data.buffer);
                    console.log("UNENCRYPTED: " + new Uint8Array(chunk.slice(0, 32)));
                    ic.updateHash("h", new Uint8Array(chunk));
                    dataBuffer = iCrypto.concatArrayBuffers(dataBuffer, chunk);
                });
                stream.on('end', ()=>{
                    ic.digestHash("h", "hres")
                        .addBlob("sign", fileInfo.signUnencrypted)
                        .asym.setKey("pubk", ownerPubk, "public")
                        .asym.verify("hres", "sign","pubk", "vres");

                    if(!ic.get("vres")){
                        throw "File validation error!"
                    }else{

                        postMessage({result: "download_complete", data: dataBuffer});
                        console.log("Stream finished");
                    }

                });
            });

            //create stream
            //emit
            console.log("About to emit process_download");
            fileSocket.emit("proceed_download", {
                link: link,
                pkfp: myPkfp,

            })
        });

        fileSocket.emit("download_attachment", {
            link: link,
            myPkfp: myPkfp,
            metaID: fileInfo.metaID,
            hashEncrypted: fileInfo.hashEncrypted,
            signEncrypted: fileInfo.signEncrypted
        });
    })
}


function establishConnection(){
    return new Promise((resolve, reject)=>{
        console.log("Connecting to file socket");
        let fileSocket = io('/file', {
            'reconnection': true,
            'forceNew': true,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax' : 5000,
            'reconnectionAttempts': 5
        });

        fileSocket.on("connect", ()=>{
            console.log("File transfer connection established");
            resolve(fileSocket)
        });

        fileSocket.on("connect_error", (err)=>{
            console.log('Island connection failed: ' + err.message);
            reject(err);
        });
    })

}