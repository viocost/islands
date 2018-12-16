"use strict";

importScripts("/js/iCrypto.js");
importScripts("/js/socket.io.js");
importScripts("/js/forge.min.js");
importScripts("/js/sjcl.js");
importScripts("/js/socket.io-stream.js");
importScripts("/js/lzma-worker.min.js");
importScripts("/js/chacha.js");

var commandHandlers = {
    "download": processDownload
};

onmessage = function onmessage(ev) {
    console.log("Downloader received message from main thread: " + ev.command);
    processMessage(ev.data);
};

function processMessage(msg) {
    console.log("Processing message from main thread..");
    commandHandlers[msg.command](msg.data);
}

function parseFileLink(link) {
    var ic = new iCrypto();
    ic.addBlob('l', link).base64Decode("l", "ls");
    var parsed = ic.get("ls");
    var splitted = parsed.split("/");
    return {
        onion: splitted[0],
        pkfp: splitted[1],
        name: splitted[2]
    };
}

/**
 * Concatenates 2 buffers
 * @param buffer1
 * @param buffer2
 * @returns {ArrayBufferLike}
 */
var appendBuffer = function appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

function processDownload(data) {
    return new Promise(async function (resolve, reject) {
        var fileInfo = JSON.parse(data.fileInfo);
        var link = parseFileLink(fileInfo.link);
        var myPkfp = data.myPkfp;
        var privk = data.privk;
        var ownerPubk = data.pubk;
        var metaID = fileInfo.metaID;

        var fileSocket = await establishConnection();
        /**
         * event triggered by Island when file is ready to be transferred to the client
         * key is encrypted shared SYM key to decrypt file
         */

        fileSocket.on("download_ready", function (key) {
            //prepare file
            var symk = key[metaID];

            console.log("download_ready triggered. shared key found: " + symk);
            var dataBuffer = new ArrayBuffer(0);
            ss(fileSocket).on("file", function (stream) {

                console.log("File download in progress!");
                var ic = new iCrypto();
                ic.addBlob("k", symk).asym.setKey("privk", privk, "private").asym.decrypt("k", "privk", "symk", "hex");
                ic.createHash("h");

                ic.ssym.init("stc", ic.get("symk"), false);

                stream.on('data', function (data) {

                    console.log("ENCRYPTED: " + new Uint8Array(data.slice(0, 32)));
                    var chunk = ic.ssym.decrypt("stc", data.buffer);
                    console.log("UNENCRYPTED: " + new Uint8Array(chunk.slice(0, 32)));
                    ic.updateHash("h", new Uint8Array(chunk));
                    dataBuffer = iCrypto.concatArrayBuffers(dataBuffer, chunk);
                });
                stream.on('end', function () {
                    ic.digestHash("h", "hres").addBlob("sign", fileInfo.signUnencrypted).asym.setKey("pubk", ownerPubk, "public").asym.verify("hres", "sign", "pubk", "vres");

                    if (!ic.get("vres")) {
                        throw "File validation error!";
                    } else {

                        postMessage({ result: "download_complete", data: dataBuffer });
                        console.log("Stream finished");
                    }
                });
            });

            //create stream
            //emit
            console.log("About to emit process_download");
            fileSocket.emit("proceed_download", {
                link: link,
                pkfp: myPkfp

            });
        });

        fileSocket.emit("download_attachment", {
            link: link,
            myPkfp: myPkfp,
            metaID: fileInfo.metaID,
            hashEncrypted: fileInfo.hashEncrypted,
            signEncrypted: fileInfo.signEncrypted
        });
    });
}

function establishConnection() {
    return new Promise(function (resolve, reject) {
        console.log("Connecting to file socket");
        var fileSocket = io('/file', {
            'reconnection': true,
            'forceNew': true,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax': 5000,
            'reconnectionAttempts': 5
        });

        fileSocket.on("connect", function () {
            console.log("File transfer connection established");
            resolve(fileSocket);
        });

        fileSocket.on("connect_error", function (err) {
            console.log('Island connection failed: ' + err.message);
            reject(err);
        });
    });
}