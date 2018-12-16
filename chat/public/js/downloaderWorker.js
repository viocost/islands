"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    var _this = this;

    return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
            var fileInfo, link, myPkfp, privk, ownerPubk, metaID, fileSocket;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            fileInfo = JSON.parse(data.fileInfo);
                            link = parseFileLink(fileInfo.link);
                            myPkfp = data.myPkfp;
                            privk = data.privk;
                            ownerPubk = data.pubk;
                            metaID = fileInfo.metaID;
                            _context.next = 8;
                            return establishConnection();

                        case 8:
                            fileSocket = _context.sent;

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

                        case 11:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }());
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