"use strict";

importScripts("/js/iCrypto.js");
importScripts("/js/socket.io.js");
importScripts("/js/forge.min.js");
importScripts("/js/sjcl.js");
importScripts("/js/socket.io-stream.js");
importScripts("/js/lzma-worker.min.js");
importScripts("/js/chacha.js");

var commandHandlers = {
    "upload": uploadAttachment
};

onmessage = function onmessage(ev) {
    console.log("Received message from main thread: " + ev.data.command);
    processMessage(ev.data);
};

function processMessage(msg) {
    console.log("Processing message from main thread..");
    commandHandlers[msg.command](msg);
}

/**
 * Uploads and encrypts a file to the Island and
 * calculates encrypted and unencrypted hashes
 * @param attachment
 * @param pkfp
 * @param privK
 * @param symk
 * @param fileSocket
 * @returns {Promise<any>}
 */
function processUpload(file, pkfp, privK, symk, fileSocket) {
    return new Promise(function (resolve, reject) {
        console.log("Processing upload");
        var stream = ss.createStream();

        console.log("Uploading and encrypting chunk by chunk");
        var offset = 0;
        var bufferSize = 1024 * 64;
        var fileSize = file.size;
        var ic = new iCrypto();
        ic.ssym.init("cha", symk).createHash("unenc") //hash of unencrypted
        .createHash("enc") //has of encrypted
        .createNonce("nonce", 8).asym.setKey("privk", privK, "private").privateKeySign("nonce", "privk", "sign").bytesToHex("nonce", "noncehex");

        console.log("NONCE: " + ic.get('noncehex'));

        fileSocket.on("invalid_request", function () {
            console.error("WORKER: Invalid request event received");
            finishOnError(fileSocket, "invalid_request");
            reject("invalid_request");
        });

        /**
         * Emited by Island after file has been successfully written,
         * renamed and saved.
         * Closing connection, notifying main thread.
         */
        fileSocket.on("upload_success", function () {
            console.log("upload successfull!");
            fileSocket.disconnect();
            postMessage({
                result: "upload_complete",
                data: {
                    hashEncrypted: ic.get("encres"),
                    hashUnencrypted: ic.get("unencres")
                }
            });
        });

        fileSocket.on("upload_ready", function () {
            console.log("received upload_ready. Pumping data");
            chunkReaderBlock(offset, bufferSize, file);
        });

        fileSocket.on("upload_error", function (err) {
            console.log("WORKER Upload error: " + err);
            finishOnError(fileSocket, "upload_error", err);
            reject(err);
        });

        /**
         * Event emited by Island after hash received
         * and file is ready to be renamed
         */
        fileSocket.on("end_stream", function () {
            stream.end();
        });

        var errorEventHandler = function errorEventHandler(ev) {
            console.error("Error processing upload: " + ev.target.error);
            reject(ev.target.error);
        };

        var readEventHandler = function readEventHandler(ev) {

            if (ev.target.error === null) {
                offset = Math.min(offset + bufferSize, fileSize);
                handleBlock(ev.target.result);
            } else {
                console.log("Read error: " + ev.target.error);
                finishOnError(fileSocket, "upload_error", ev.target.error);
                reject(ev.target.error);
                return;
            }

            if (offset >= fileSize) {
                ic.digestHash("unenc", "unencres");
                ic.digestHash("enc", "encres");
                ic.asym.sign("unencres", "privk", "unencressign");
                fileSocket.emit("finalize_upload", { hashUnencrypted: ic.get("unencres") });
                return;
            }
            chunkReaderBlock(offset, bufferSize, file);
        };

        var chunkReaderBlock = function chunkReaderBlock(_offset, bufferSize, _file) {
            var reader = new FileReader();
            var upperBound = Math.min(_offset + bufferSize, fileSize);
            var blob = _file.slice(_offset, upperBound);
            reader.onload = readEventHandler;
            reader.onerror = errorEventHandler;
            reader.readAsArrayBuffer(blob);
        };

        var handleBlock = function handleBlock(chunk) {
            ic.updateHash("unenc", chunk);
            var encrypted = ic.ssym.encrypt("cha", chunk);
            ic.updateHash("enc", encrypted);
            var b = new ss.Buffer(encrypted);
            stream.write(b);
        };

        /**
         * Initializing file upload
         */
        ss(fileSocket).emit('upload_attachment', stream, {
            pkfp: pkfp,
            nonce: ic.get("noncehex"),
            sign: ic.get("sign")
        });
    });
}

function finishOnError(fileSocket, result, errorMsg) {
    if (fileSocket && fileSocket.connected) {
        fileSocket.disconnect();
    }
    postMessage({
        result: result,
        data: errorMsg
    });
}

async function uploadAttachment(msg) {
    var attachment = msg.attachment;
    var pkfp = msg.pkfp;
    var privK = msg.privk;
    var symk = msg.symk;
    var fileSocket = await establishConnection();
    await processUpload(attachment, pkfp, privK, symk, fileSocket);
    console.log("Upload successfull");
    //TODO Send message to main thread
    postMessage(["upload_complete"]);
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
            console.log("File transfer connectiopn established");
            resolve(fileSocket);
        });

        fileSocket.on("connect_error", function (err) {
            console.log('Island connection failed: ' + err.message);
            reject(err);
        });
    });
}

/**
 * Encrypts and uploads file chunk by chunk
 * @param file
 */
function encryptAndUpload(msg) {
    console.log("encryptUpload in worker called");
    var file = msg[1];
    var fileSize = file.size;
    var bufferSize = 128 * 1024;
    var offset = 0;

    var chunkReaderBlock = function chunkReaderBlock(_offset, bufferLength, _file) {
        var reader = new FileReader();
        var blob = _file.slice(_offset, _offset + bufferLength);

        reader.onload = readEventHandler;
        reader.onerror = errorEventHandler;
        reader.readAsArrayBuffer(blob);
    };

    var handleBlock = function handleBlock(block) {};

    var readEventHandler = function readEventHandler(ev) {
        if (ev.target.error === null) {
            offset += bufferSize;
            handleBlock(ev.target.result);
        } else {
            console.log("Read error: " + ev.target.error);
            return;
        }
        if (offset >= fileSize) {
            console.log("Done reading file");
            return;
        }

        chunkReaderBlock(offset, bufferSize, file);
    };

    var errorEventHandler = function errorEventHandler(ev) {
        console.log("Read error: " + ev.target.error);
    };
}

function chachaEncrypt() {
    var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    var ic = new iCrypto();
    var self = chat;
    var keyStruct = self.session.metadata.sharedKey;
    var iv = forge.util.hexToBytes(keyStruct.iv);
    var key = forge.util.hexToBytes(keyStruct.key);
    var arr = str2ab(txt);
    if (file) {
        var fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = function () {
            console.log("File loaded! Encrypting!");
            var ab = fr.result;
            var chacha = new JSChaCha20(new Uint8Array(str2ab(key).slice(0, 32)), new Uint8Array(str2ab(iv)).slice(0, 12), undefined);
            var offset = 0;
            var bufferSize = 1024 * 64;
            var res = new Uint8Array(0);
            var t1 = performance.now();
            while (offset < ab.byteLength) {
                var chunk = chacha.encrypt(new Uint8Array(ab.slice(offset, Math.min(offset + bufferSize, ab.byteLength))));
                offset += bufferSize;
                console.log("Appending chunk from " + offset + " to " + Math.min(offset + bufferSize, ab.byteLength));
                //res = concat2Uint8Arrays(res, chunk);
            }
            var t2 = performance.now();
            console.log("All chunks are encrypted! That took: " + (t2 - t1));
        };
    }
}