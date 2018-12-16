"use strict";

importScripts("/js/forge.min.js");
importScripts("/js/sjcl.js");
importScripts("/js/iCrypto.js");

var commandHandlers = {
    "hashFile": processHashFile
};

onmessage = function onmessage(ev) {
    console.log("iCrypto worker received message: " + ev.data[0]);
    processMessage(ev.data);
};

function processMessage(msg) {
    console.log("Processing message from main thread..");
    commandHandlers[msg[0]](msg);
}

function processHashFile(msg) {
    getHash(msg[1]).then(function (hash) {
        //return hash to main thread
        postMessage(["success", hash]);
    }).catch(function (err) {
        //return error to main thread
        postMessage(["error", err]);
    });
}

function getHash(file) {
    return new Promise(function (resolve, reject) {
        if (!file) {
            reject("getHash worker: File is not defined");
            return;
        }
        console.log("Calculating hash...");
        var offset = 0;
        var fileSize = file.size;
        var bufferSize = 1024 * 256;
        var ic = new iCrypto();
        ic.createHash("h");
        var errorEventHandler = function errorEventHandler(ev) {
            console.log("Read error: " + ev.target.error);
        };

        var readEventHandler = function readEventHandler(ev) {
            if (ev.target.error === null) {
                offset = Math.min(offset + bufferSize, fileSize);
                handleBlock(ev.target.result);
            } else {
                console.log("Read error: " + ev.target.error);
                return;
            }
            if (offset >= fileSize) {
                ic.digestHash("h", "hres");
                console.log("Hash calcluated.");
                resolve(ic.get("hres"));
                return;
            }

            chunkReaderBlock(offset, bufferSize, file);
        };

        var chunkReaderBlock = function chunkReaderBlock(_offset, bufferSize, _file) {
            var reader = new FileReader();
            var blob = _file.slice(_offset, Math.min(_offset + bufferSize, fileSize));
            reader.onload = readEventHandler;
            reader.onerror = errorEventHandler;
            reader.readAsBinaryString(blob);
        };
        var handleBlock = function handleBlock(blob) {
            ic.updateHash("h", blob);
        };

        chunkReaderBlock(offset, bufferSize, file);
    });
}