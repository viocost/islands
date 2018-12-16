'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var iCryptoFactory = function () {
    function iCryptoFactory(settings) {
        _classCallCheck(this, iCryptoFactory);

        this.readSettings();
    }

    _createClass(iCryptoFactory, [{
        key: 'createICryptor',
        value: function createICryptor() {
            return new iCrypto(this.settings);
        }
    }, {
        key: 'readSettings',
        value: function readSettings() {
            console.log("readubg settings");
            this.settings = null;
        }
    }]);

    return iCryptoFactory;
}();

var iCrypto = function () {
    function iCrypto(settings) {
        _classCallCheck(this, iCrypto);

        var self = this;
        self.settings = {};
        self.locked = false;
        self.setEncodersAndDecoders();
        self.symCiphers = ['aes'];
        self.streamCiphers = ['chacha'];
        self.asymCiphers = ['rsa'];
        self.store = {};

        self.rsa = {
            createKeyPair: function createKeyPair() {
                return self.generateRSAKeyPair.apply(self, arguments);
            },
            asyncCreateKeyPair: function asyncCreateKeyPair() {
                return self.asyncGenerateRSAKeyPair.apply(self, arguments);
            },
            encrypt: function encrypt() {
                return self.publicKeyEncrypt.apply(self, arguments);
            },
            decrypt: function decrypt() {
                return self.privateKeyDecrypt.apply(self, arguments);
            },
            sign: function sign() {
                return self.privateKeySign.apply(self, arguments);
            },
            verify: function verify() {
                return self.publicKeyVerify.apply(self, arguments);
            },
            setKey: function setKey() {
                return self.setRSAKey.apply(self, arguments);
            },
            getSettings: function getSettings() {
                return "RSA";
            }
        };

        self.aes = {
            modes: ['CBC', 'CFB', 'CTR'],
            mode: 'CBC',
            ivLength: 16,
            keySize: 32,
            createKey: function createKey() {
                return self.createSYMKey.apply(self, arguments);
            },
            encrypt: function encrypt() {
                return self.AESEncrypt.apply(self, arguments);
            },
            decrypt: function decrypt() {
                return self.AESDecrypt.apply(self, arguments);
            },
            setKey: function setKey() {
                return self.setSYMKey.apply(self, arguments);
            },
            getSettings: function getSettings() {
                return "AES";
            }
        };

        self.chacha = {
            init: function init() {
                return self.initStreamCryptor.apply(self, arguments);
            },
            encrypt: function encrypt() {
                return self.streamCryptorEncrypt.apply(self, arguments);
            },
            decrypt: function decrypt() {
                return self.streamCryptorDecrypt.apply(self, arguments);
            },
            getSettings: function getSettings() {
                return "ChaCha";
            }
        };

        self.setAsymCipher('rsa');
        self.setSymCipher('aes');
        self.setStreamCipher('chacha');
    }

    /***************** SETTING CIPHERS API *******************/

    _createClass(iCrypto, [{
        key: 'setSymCipher',
        value: function setSymCipher() {
            var self = this;

            for (var _len = arguments.length, opts = Array(_len), _key = 0; _key < _len; _key++) {
                opts[_key] = arguments[_key];
            }

            if (!self.symCiphers.includes(opts[0])) {
                throw "setSymCipher: Invalid or unsupported algorithm";
            }
            self.sym = self[opts[0]];
        }
    }, {
        key: 'setAsymCipher',
        value: function setAsymCipher() {
            var self = this;

            for (var _len2 = arguments.length, opts = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                opts[_key2] = arguments[_key2];
            }

            if (!self.asymCiphers.includes(opts[0])) {
                throw "setSymCipher: Invalid or unsupported algorithm";
            }
            self.asym = self[opts[0]];
        }
    }, {
        key: 'setStreamCipher',
        value: function setStreamCipher() {
            var self = this;

            for (var _len3 = arguments.length, opts = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                opts[_key3] = arguments[_key3];
            }

            if (!self.streamCiphers.includes(opts[0])) {
                throw "setSymCipher: Invalid or unsupported algorithm";
            }
            self.ssym = self[opts[0]];
        }

        /***************** END **********************************/

    }, {
        key: 'setEncodersAndDecoders',
        value: function setEncodersAndDecoders() {
            this.encoders = {
                hex: iCrypto.hexEncode,
                base64: iCrypto.base64Encode
            };

            this.decoders = {
                hex: iCrypto.hexDecode,
                base64: iCrypto.base64Decode
            };
        }

        /*********MAIN METHODS**************/

        /**********************$$*****************************/
        /***####NONCES PLAIN TEXT####***/

    }, {
        key: 'asyncCreateNonce',
        value: function asyncCreateNonce(nameToSave) {
            var _this = this;

            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this.createNonce(nameToSave, length));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Creates nonce of the given length and
         * saves it under the provided name.
         * Default is 32 bytes
         *
         * @param {string} nameToSave
         * @param {number} length
         * @returns {iCrypto}
         */

    }, {
        key: 'createNonce',
        value: function createNonce() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createNonce");
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;

            var self = this;
            this.set(nameToSave, iCrypto.getBytes(length));
            return this;
        }
    }, {
        key: 'asyncAddBlob',
        value: function asyncAddBlob(nameToSave, plainText) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this2.addBlob(nameToSave, plainText));
                } catch (err) {
                    reject(err);
                }
            });
        }
    }, {
        key: 'addBlob',
        value: function addBlob() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("addBlob");
            var plainText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("addBlob");

            this.set(nameToSave, plainText.toString().trim());
            return this;
        }

        /**********************$$*****************************/
        /***#### KEYS CRYPTO ####***/

    }, {
        key: 'asyncCreateSYMKey',
        value: function asyncCreateSYMKey(nameToSave) {
            var _this3 = this;

            var ivLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
            var keyLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 32;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this3.createSYMKey(nameToSave, ivLength, keyLength));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Creates hex-encoded SYM key, which is just some random hex-encoded bytes
         * @param nameToSave
         * @param keyLength
         * @returns {iCrypto}
         */

    }, {
        key: 'createSYMKey',
        value: function createSYMKey() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createSYMKey");
            var keyLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;

            var self = this;
            var key = iCrypto.getBytes(keyLength);
            self.set(nameToSave, forge.util.bytesToHex(key));
            return self;
        }

        /**
         * Sets passed SYM key inside the object
         * @param nameToSave
         * @param {string} key Must be hexified string
         */

    }, {
        key: 'setSYMKey',
        value: function setSYMKey() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("setSYMKey");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("setSYMKey");

            this.set(nameToSave, key);
            return this;
        }

        /**
         * requires object of similar structure for key as being created by createSYMKey
         * @param target
         * @param key
         * @param nameToSave
         * @returns {Promise}
         */

    }, {
        key: 'asyncAESEncrypt',
        value: function asyncAESEncrypt(target, key, nameToSave, hexify, mode, encoding) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this4.AESEncrypt(target, key, nameToSave, hexify, mode, encoding));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Encrypts blob identified by "target" parameter.
         * Target must be set inside iCrypto object
         * IV is randomly generated and appended to the cipher blob
         * @param {string} target
         * @param {string} key
         * @param {string} nameToSave
         * @param {boolean} hexify - Specifies the encoding of the resulting cipher. Default: hex.
         * @param {string} mode - specifies AES mode. Default - CBC
         * @param {number} ivLength - specifies length of initialization vector
         *  The initialization vector of specified length will be generated and
         *  appended to the end of resulting cipher. IV blob will be encoded according to
         *  outputEncoding parameter, and its length will be last 3 bytes of the cipher string.
         *
         */

    }, {
        key: 'AESEncrypt',
        value: function AESEncrypt() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESEncrypt");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESEncrypt");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESEncrypt");
            var hexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
            var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'CBC';
            var encoding = arguments[5];


            var self = this;
            if (!self.aes.modes.includes(mode.toUpperCase())) {
                throw "AESencrypt: Invalid AES mode";
            }
            mode = "AES-" + mode.toUpperCase();
            //Creating random 16 bytes IV
            var iv = iCrypto.getBytes(16);
            var AESkey = forge.util.hexToBytes(self.get(key));
            var cipher = forge.cipher.createCipher(mode, AESkey);
            cipher.start({ iv: iv });
            cipher.update(forge.util.createBuffer(this.get(target), encoding));
            cipher.finish();
            this.set(nameToSave, hexify ? forge.util.bytesToHex(iv) + cipher.output.toHex() : iv + cipher.output);
            return this;
        }
    }, {
        key: 'asyncAESDecrypt',
        value: function asyncAESDecrypt(target, key, nameToSave) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this5.AESDecrypt(target, key, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Decrypts the blob loaded into iCrypto object and specified by targe parameter
         * Assumes that initialization vector is PREPENDED to the cipher text
         * and its length is 16 bytes
         *
         * @param {string} target - ciphertext within iCrypto object
         * @param {string} key - Symmetric AES key in form of hex string
         * @param {string} nameToSave
         * @param {boolean} dehexify
         * @param {string} mode AES mode
         * @param {string} encoding - resulting plain text encoding default (UTF8)
         */

    }, {
        key: 'AESDecrypt',
        value: function AESDecrypt() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESDecrypt");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESDecrypt");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESDecrypt");
            var dehexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "CBC";
            var encoding = arguments[5];

            var self = this;
            var cipherWOIV = void 0;
            if (!self.aes.modes.includes(mode.toUpperCase())) {
                throw "AESencrypt: Invalid AES mode";
            }
            mode = "AES-" + mode.toUpperCase();
            var cipher = self.get(target);
            var iv = void 0;
            if (dehexify) {
                iv = forge.util.hexToBytes(cipher.substring(0, 32));
                cipherWOIV = forge.util.hexToBytes(cipher.substr(32));
            } else {
                //Assuming cipher is a binary string
                cipherWOIV = cipher.substr(16);
                iv = cipher.substring(0, 16);
            }
            var AESkey = forge.util.hexToBytes(this.get(key));
            var decipher = forge.cipher.createDecipher(mode, AESkey);
            decipher.start({ iv: iv });
            decipher.update(forge.util.createBuffer(cipherWOIV));
            decipher.finish();
            this.set(nameToSave, decipher.output.toString('utf8'));
            return this;
        }
    }, {
        key: 'asyncHash',
        value: function asyncHash(target, nameToSave) {
            var _this6 = this;

            var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this6.hash(target, nameToSave, algorithm));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * This function meant to be used on large files
         * It is asynchronous, uses web workers,
         * and it calculates hash of a large file without loading it
         * fully into memory
         * @param file  -  value of an input of type file
         * @param nameToSave - name to store resulting hash
         * @param algorithm - sha256 is default
         */

    }, {
        key: 'hashFileWorker',
        value: function hashFileWorker() {
            var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("fileHashWorker file");

            var _this7 = this;

            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("fileHashWorker nameToSave");
            var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";

            return new Promise(function (resolve, reject) {
                var self = _this7;
                if (Worker === undefined) {
                    throw "Web workers are not supported in current environment";
                }
                var worker = new Worker("/js/iCryptoWorker.js");
                worker.onmessage = function (ev) {
                    if (ev.data[0] === "success") {
                        self.set(nameToSave, ev.data[1]);
                        resolve(self);
                        worker.terminate();
                    } else {
                        reject(ev.data[1]);
                        worker.terminate();
                    }
                };
                worker.postMessage(["hashFile", file]);
            });
        }

        /**
         * Initializes stream encryptor or decryptor
         *
         * Supported algorithm is chacha20 only
         * Single instance of a single stream cryptor can be used
         * only one time, one way, and only for a single stream.
         * Meaning you can take a single stream and encrypt it chunk by chunk,
         * but then, if you want to decrypt the stream,  you have to
         * re-initialize cryptor instance or use a new one,
         * otherwise the output will be meaningless.
         *
         * All the chunks must flow in sequence.
         *
         * !!!Important
         *
         * Encryption:
         * Stream cryptor handles initialization vector (iv)
         * by prepending them to cipher. So, to encrypt the data -
         * just pass the key and new iv will be created automatically
         * and prepended to the cipher
         *
         * Decryption:
         * On Decryption the algorithm ASSUMES that first 6 bytes of
         * the ciphertext is iv.
         * So, it will treat first 6 bytes as iv regardles of chunks,
         * and will begin decryption starting from byte 7
         *
         * @param {String} nameToSave - Stream cryptor will be saved inside iCrypto instance
         * @param {String} key String of bytes in hex - Symmetric key used to encrypt/decrypt data
         *  The algorithm requires key to be 32 bytes precisely
            Only first 32 bytes (after decoding hex) will be taken
         * @param {Boolean} isEncryptionMode - flag encryption mode - true
         * @param {String} algorithm Supports only chacha20 for now
         */

    }, {
        key: 'initStreamCryptor',
        value: function initStreamCryptor() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("initStreamEncryptor");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("initStreamEncryptor");
            var isEncryptionMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var algorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "chacha20";

            var self = this;
            var ivRaw = void 0,
                ivHex = void 0,
                keyRaw = void 0,
                cryptor = void 0,
                ivBuffer = void 0;
            var mode = "enc";

            keyRaw = iCrypto.hexDecode(key);
            if (keyRaw.length < 16) {
                throw "chacha20: invalid key size: " + keyRaw.length + " key length must be 32 bytes";
            }

            var keyBuffer = iCrypto.stringToArrayBuffer(keyRaw).slice(0, 32);

            if (isEncryptionMode) {
                ivRaw = iCrypto.getBytes(6);
                ivHex = iCrypto.hexEncode(ivRaw);
                ivBuffer = iCrypto.stringToArrayBuffer(ivRaw).slice(0, 12);
                cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
            } else {
                mode = "dec";
                ivBuffer = new ArrayBuffer(0);
            }

            var res = new function () {
                var self = this;
                self.cryptor = cryptor;
                self.key = key;
                self.iv = ivHex;
                self.mode = mode;
                self.encryptionMode = function () {
                    return self.mode === "enc";
                };
                self.decryptionMode = function () {
                    return self.mode === "dec";
                };
                self.encrypt = function (input) {
                    var blob = typeof input === "string" ? iCrypto.stringToArrayBuffer(input) : input;
                    if (!(blob instanceof ArrayBuffer) && !(blob instanceof Uint8Array)) {
                        throw "StreamCryptor encrypt: input type is invalid";
                    }
                    if (self.cryptor._byteCounter === 0) {
                        //First check if counter is 0.
                        //If so - it is a first encryption block and we need to prepend IV
                        var encrypted = self.cryptor.encrypt(new Uint8Array(blob));
                        return iCrypto.concatUint8Arrays(new Uint8Array(ivBuffer), encrypted);
                    } else {
                        //Just encrypting the blob
                        return self.cryptor.encrypt(new Uint8Array(blob));
                    }
                };

                self.decrypt = function (input) {
                    var blob = typeof input === "string" ? iCrypto.stringToArrayBuffer(input) : input;
                    if (!(blob instanceof ArrayBuffer)) {
                        throw "StreamCryptor encrypt: input type is invalid";
                    }

                    if (self.cryptor === undefined) {
                        //decryptor was not initialized yet because
                        //Initalization vecotor (iv)was not yet obtained
                        //IV assumed to be first 6 bytes prepended to cipher
                        var currentIVLength = ivBuffer.byteLength;
                        if (currentIVLength + blob.byteLength <= 12) {
                            ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob);
                            //Still gathering iv, so returning empty array
                            return new Uint8Array();
                        } else {
                            var remainingIVBytes = 12 - ivBuffer.byteLength;
                            ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob.slice(0, remainingIVBytes));
                            self.iv = iCrypto.hexEncode(iCrypto.arrayBufferToString(ivBuffer));
                            self.cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
                            var chunk = new Uint8Array(blob.slice(remainingIVBytes, blob.byteLength));
                            return self.cryptor.decrypt(chunk);
                        }
                    } else {
                        //Decrypto is initialized.
                        // Just decrypting the blob and returning result
                        return self.cryptor.decrypt(new Uint8Array(blob));
                    }
                };
            }();
            self.set(nameToSave, res);
            return self;
        }
    }, {
        key: 'streamCryptorGetIV',
        value: function streamCryptorGetIV() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorGetIV");

            var self = this;
            var cryptor = self.get(target);
            return cryptor.iv;
        }
    }, {
        key: 'streamCryptorEncrypt',
        value: function streamCryptorEncrypt() {
            var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
            var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
            var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";

            var self = this;
            var input = void 0;
            var cryptor = self.get(cryptorID);
            if (!cryptor.encryptionMode()) {
                throw "streamCryptorEncrypt error: mode is invalid";
            }

            if (blob instanceof ArrayBuffer) {
                input = blob;
            } else if (blob instanceof Uint8Array) {
                input = blob.buffer;
            } else if (typeof blob === "string") {
                input = iCrypto.stringToArrayBuffer(blob);
            } else {
                throw "streamCryptorEncrypt: invalid format input";
            }

            if (encoding === undefined || encoding === "raw") {
                return cryptor.encrypt(input).buffer;
            } else {
                throw "NOT IMPLEMENTED";
            }
        }
    }, {
        key: 'streamCryptorDecrypt',
        value: function streamCryptorDecrypt() {
            var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
            var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
            var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";

            var self = this;
            var cryptor = self.get(cryptorID);

            var input = void 0;

            if (!cryptor.decryptionMode()) {
                throw "streamCryptorEncrypt error: mode is invalid";
            }

            if (blob instanceof ArrayBuffer) {
                input = blob;
            } else if (blob instanceof Uint8Array) {
                input = blob.buffer;
            } else if (typeof blob === "string") {
                input = iCrypto.stringToArrayBuffer(blob);
            } else {
                throw "streamCryptorEncrypt: invalid format input";
            }
            if (encoding === undefined || encoding === "raw") {
                return cryptor.decrypt(input).buffer;
            } else {
                throw "NOT IMPLEMENTED";
            }
        }

        /**
         *
         * @param target
         * @param nameToSave
         * @param algorithm
         */

    }, {
        key: 'hash',
        value: function hash() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("hash");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("hash");
            var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";

            var self = this;
            var blob = self.get(target);
            if (typeof blob !== "string") {
                throw "hash: invalid target type: " + (typeof blob === 'undefined' ? 'undefined' : _typeof(blob)) + "  Target must be string.";
            }
            algorithm = algorithm.toLowerCase();
            var hash = forge.md.hasOwnProperty(algorithm) ? forge.md[algorithm].create() : this.throwError("Wrong hash algorithm");

            hash.update(blob);
            this.set(nameToSave, hash.digest().toHex());
            return self;
        }
    }, {
        key: 'createHash',
        value: function createHash() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createHash");
            var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sha256";

            var hash = sjcl.hash.hasOwnProperty(algorithm) ? new sjcl.hash[algorithm]() : this.throwError("Wrong hash algorithm");
            this.set(nameToSave, hash);
            return this;
        }

        /**
         *
         * @param target
         * @param {} blob can be binary string or arrayBuffer
         * @returns {iCrypto}
         */

    }, {
        key: 'updateHash',
        value: function updateHash() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("updateHash: target");
            var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("updateHash: blob");

            var self = this;
            var input = void 0;
            if (typeof blob === "string") {
                input = iCrypto.stringToArrayBuffer(blob);
            } else if (blob instanceof Uint8Array) {
                input = blob.buffer;
            } else if (blob instanceof ArrayBuffer) {
                input = blob;
            } else {
                throw "invalid input format!";
            }
            var hash = self.get(target);
            hash.update(sjcl.codec.arrayBuffer.toBits(input));
            return self;
        }
    }, {
        key: 'digestHash',
        value: function digestHash() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("digestHash");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("digestHash");
            var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var self = this;
            var hRes = self.get(target);
            var res = hexify ? sjcl.codec.hex.fromBits(hRes.finalize()) : sjcl.codec.arrayBuffer.fromBits(hRes.finalize());
            this.set(nameToSave, res);
            return self;
        }
    }, {
        key: 'asyncGenerateRSAKeyPair',
        value: function asyncGenerateRSAKeyPair() {
            var _this8 = this;

            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("asyncGenerateRSAKeyPair");
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;

            return new Promise(function (resolve, reject) {
                var self = _this8;
                forge.rsa.generateKeyPair({ bits: length, workers: -1 }, function (err, pair) {
                    if (err) reject(err);else {
                        try {

                            var pubKey = forge.pki.publicKeyToPem(pair.publicKey);
                            var privKey = forge.pki.privateKeyToPem(pair.privateKey);
                            self.set(nameToSave, {
                                publicKey: pubKey,
                                privateKey: privKey
                            });
                            resolve(_this8);
                        } catch (err) {

                            reject(err);
                        }
                    }
                });
            });
        }

        /**
         * Generates RSA key pair.
         * Key saved in PEM format
         * resulting object has publicKey, privateKey, keyType, length
         * @param nameToSave
         * @param length
         * @returns {iCrypto}
         */

    }, {
        key: 'generateRSAKeyPair',
        value: function generateRSAKeyPair() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("generateRSAKeyPair");
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;

            var self = this;
            var pair = forge.pki.rsa.generateKeyPair({ bits: length, e: 0x10001 });
            var pubKey = forge.pki.publicKeyToPem(pair.publicKey);
            var privKey = forge.pki.privateKeyToPem(pair.privateKey);

            self.set(nameToSave, {
                publicKey: pubKey,
                privateKey: privKey
            });
            return self;
        }

        /**
         * Takes previously saved RSA private key in PEM format,
         * extracts its public key
         * and saves it in PEM format under the name specified
         * @param target
         * @param nameToSave
         * @returns {iCrypto}
         */

    }, {
        key: 'publicFromPrivate',
        value: function publicFromPrivate() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicFromPrivate");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicFromPrivate");

            var forgePrivateKey = forge.pki.privateKeyFromPem(this.get(target));
            this.set(nameToSave, forge.pki.publicKeyToPem(forgePrivateKey));
            return this;
        }

        /**
         * Accepts as an input RSA key and saves it inside an object under the name specified.
         * Key must be provided either in PEM or in raw base64.
         * @param {String} nameToSave
         * @param {String} keyData: public or private RSA key either in raw base64 or PEM format
         * @param {String} type: must be either "public" or "private"
         *
         * @returns {iCrypto}
         */

    }, {
        key: 'setRSAKey',
        value: function setRSAKey() {
            var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("setRSAPublicKey");
            var keyData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("setRSAPublicKey");
            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("setRSAPublicKey");

            if (type !== "public" && type !== "private") {
                throw "Invalid key type";
            }

            if (!iCrypto.isRSAPEMValid(keyData, type)) {
                keyData = iCrypto.base64ToPEM(keyData, type);
            }
            type === "public" ? forge.pki.publicKeyFromPem(keyData) : forge.pki.privateKeyFromPem(keyData);
            this.set(nameToSave, keyData);
            return this;
        }

        /**
         * For internal use only. Takes key data in form of a string
         * and checks whether it matches RSA PEM key format
         * @param {string} keyData
         * @param {string}type ENUM "public", "private"
         * @returns {boolean}
         */

    }, {
        key: 'asyncPublicKeyEncrypt',
        value: function asyncPublicKeyEncrypt(target, keyPair, nameToSave, encoding) {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this9.publicKeyEncrypt(target, keyPair, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * creates and saves public key fingerprint
         * @param target - public key, either keypair or public key
         * @param nameToSave
         * @param hashAlgorithm
         * @returns {iCrypto}
         */

    }, {
        key: 'getPublicKeyFingerprint',
        value: function getPublicKeyFingerprint() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("getPublicKeyFingerpint");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("getPublicKeyFingerpint");
            var hashAlgorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";

            var key = this.validateExtractRSAKey(this.get(target), "public");
            var forgeKey = forge.pki.publicKeyFromPem(key);
            var fingerprint = forge.pki.getPublicKeyFingerprint(forgeKey, { encoding: 'hex', md: forge.md[hashAlgorithm].create() });
            this.set(nameToSave, fingerprint);
            return this;
        }
    }, {
        key: 'publicKeyEncrypt',
        value: function publicKeyEncrypt() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicKeyEncrypt");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicKeyEncrypt");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("publicKeyEncrypt");
            var encoding = arguments[3];

            key = this.validateExtractRSAKey(this.get(key), "public");
            var publicKey = forge.pki.publicKeyFromPem(key);
            var result = publicKey.encrypt(this.get(target));
            if (encoding) {
                result = this._encodeBlob(result, encoding);
            }
            this.set(nameToSave, result);
            return this;
        }

        /**
         * For internal use. Encode the blob in format specified
         * @param blob
         * @param encoding
         * @private
         */

    }, {
        key: '_encodeBlob',
        value: function _encodeBlob() {
            var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("_encodeBlob");
            var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("_encodeBlob");

            var self = this;
            if (!this.encoders.hasOwnProperty(encoding)) {
                throw "_encodeBlob: Invalid encoding: " + encoding;
            }
            return self.encoders[encoding](blob);
        }
    }, {
        key: '_decodeBlob',
        value: function _decodeBlob() {
            var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("_encodeBlob");
            var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("_encodeBlob");


            var self = this;
            if (!this.encoders.hasOwnProperty(encoding)) {
                throw "_decodeBlob: Invalid encoding: " + encoding;
            }
            return this.decoders[encoding](blob);
        }
    }, {
        key: 'asyncPrivateKeyDecrypt',
        value: function asyncPrivateKeyDecrypt(target, key, nameToSave) {
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this10.privateKeyDecrypt(target, key, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }
    }, {
        key: 'privateKeyDecrypt',
        value: function privateKeyDecrypt() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("privateKeyDecrypt");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("privateKeyDecrypt");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("privateKeyDecrypt");
            var encoding = arguments[3];


            key = this.validateExtractRSAKey(this.get(key), "private");
            var privateKey = forge.pki.privateKeyFromPem(key);
            var cipher = this.get(target);
            if (encoding) {
                cipher = this._decodeBlob(cipher, encoding);
            }
            this.set(nameToSave, privateKey.decrypt(cipher));
            return this;
        }
    }, {
        key: 'asyncPrivateKeySign',
        value: function asyncPrivateKeySign(target, keyPair, nameToSave) {
            var _this11 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this11.privateKeySign(target, keyPair, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }
    }, {
        key: 'privateKeySign',
        value: function privateKeySign() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("privateKeyEncrypt");
            var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("privateKeyEncrypt");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("privateKeyEncrypt");
            var hashAlgorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "sha256";
            var hexifySign = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            key = this.validateExtractRSAKey(this.get(key), "private");
            var privateKey = forge.pki.privateKeyFromPem(key);
            var md = forge.md[hashAlgorithm].create();
            md.update(this.get(target));
            var signature = privateKey.sign(md);
            signature = hexifySign ? forge.util.bytesToHex(signature) : signature;
            this.set(nameToSave, signature);
            return this;
        }
    }, {
        key: 'asyncPublicKeyVerify',
        value: function asyncPublicKeyVerify(target, signature, key, nameToSave) {
            var _this12 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this12.publicKeyVerify(target, signature, key, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }
    }, {
        key: 'publicKeyVerify',
        value: function publicKeyVerify() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicKeyVerify");
            var signature = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicKeyVerify");
            var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("publicKeyVerify");
            var nameToSave = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : iCrypto.pRequired("publicKeyVerify");
            var dehexifySignRequired = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            key = this.validateExtractRSAKey(this.get(key), "public");
            var publicKey = forge.pki.publicKeyFromPem(key);
            var md = forge.md.sha256.create();
            md.update(this.get(target));
            var sign = this.get(signature);
            sign = dehexifySignRequired ? forge.util.hexToBytes(sign) : sign;
            var verified = publicKey.verify(md.digest().bytes(), sign);
            this.set(nameToSave, verified);
            return this;
        }

        /**
         * Validates and extracts RSA key from either keypair
         * or separate private or public keys saved previously within the object.
         * Checks PEM structure and returns requested key in PEM format
         * or throws error if something wrong
         * @param key - target key
         * @param type - "public" or "private"
         * @return public or private key in PEM format
         */

    }, {
        key: 'validateExtractRSAKey',
        value: function validateExtractRSAKey() {
            var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("validateAndExtractRSAKey");
            var keyType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("validateAndExtractRSAKey");

            var keyTypes = { public: "publicKey", private: "privateKey" };
            if (!Object.keys(keyTypes).includes(keyType)) throw "validateExtractRSAKey: key type is invalid!";
            if (key[keyTypes[keyType]]) {
                key = key[keyTypes[keyType]];
            }
            if (!iCrypto.isRSAPEMValid(key, keyType)) {
                console.log(keyType);
                console.log(key);
                throw "validateExtractRSAKey: Invalid key format";
            }
            return key;
        }
    }, {
        key: 'pemToBase64',
        value: function pemToBase64() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("pemToBase64");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("pemToBase64");
            var keyType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("pemToBase64");

            var key = this.get(target);
            if (!iCrypto.isRSAPEMValid(key, keyType)) {
                console.log(keyType);
                console.log(key);
                throw "validateExtractRSAKey: Invalid key format";
            }
            key = key.trim().split(/\r?\n/).slice(1, -1).join("");
            this.set(nameToSave, key);
        }

        /***#### COMPRESSION ####***/

    }, {
        key: 'asyncCompress',
        value: function asyncCompress(target, nameToSave) {
            var _this13 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this13.compress(target, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Compresses data under key name
         * @param target
         *  type: String
         *  Key to data that needed to be compressed
         * @param nameToSave
         *  type: String
         *  if passed - function will save the result of compression under this key
         *  otherwise the compression will happen in-place
         */

    }, {
        key: 'compress',
        value: function compress() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("compress");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("compress");

            var compressed = LZMA.compress(this.get(target));
            this.set(nameToSave, compressed);
            return this;
        }
    }, {
        key: 'asyncDecompress',
        value: function asyncDecompress(target, nameToSave) {
            var _this14 = this;

            return new Promise(function (resolve, reject) {
                try {
                    resolve(_this14.decompress(target, nameToSave));
                } catch (err) {
                    reject(err);
                }
            });
        }

        /**
         * Decompresses data under key name
         * @param target
         *  type: String
         *  Key to data that needed to be compressed
         * @param nameToSave
         *  type: String
         *  if passed - function will save the result of compression under this key
         *  otherwise decompression will happen in-place
         */

    }, {
        key: 'decompress',
        value: function decompress() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("decompress");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("decompress");

            var decompressed = LZMA.decompress(this.get(target));
            this.set(nameToSave, decompressed);
            return this;
        }

        /***#### UTILS ####***/

    }, {
        key: 'encode',
        value: function encode() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("encode");
            var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("encode");
            var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("encode");

            var self = this;
            self.set(nameToSave, self._encodeBlob(this.get(target), encoding));
            return this;
        }
    }, {
        key: 'base64Encode',
        value: function base64Encode() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("base64Encode");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("base64Encode");
            var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
            this.set(nameToSave, iCrypto.base64Encode(target));
            return this;
        }
    }, {
        key: 'base64Decode',
        value: function base64Decode() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("base64decode");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("base64decode");
            var jsonParse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var decoded = iCrypto.base64Decode(this.get(name));
            decoded = jsonParse ? JSON.parse(decoded) : decoded;
            this.set(nameToSave, decoded);
            return this;
        }

        /*
            base32Encode(name = this.pRequired("base32Encode"),
                         nameToSave = this.pRequired("base32Encode")){
                let base32 = new Base32();
                let encoded = base32.encode(this.get(name));
                this.set(nameToSave, encoded);
                return this;
            }
              base32Decode(name = this.pRequired("base64decode"),
                         nameToSave = this.pRequired("base64decode")){
                let base32 = new Base32();
                let decoded = base32.decode(this.get(name));
                this.set(nameToSave, decoded);
                return this;
            }
        /**/

    }, {
        key: 'bytesToHex',
        value: function bytesToHex() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("bytesToHex");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("bytesToHex");
            var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
            this.set(nameToSave, iCrypto.hexEncode(target));
            return this;
        }
    }, {
        key: 'hexToBytes',
        value: function hexToBytes() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("hexToBytes");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("hexToBytes");
            var jsonParse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var decoded = iCrypto.hexDecode(this.get(name));
            decoded = jsonParse ? JSON.parse(decoded) : decoded;
            this.set(nameToSave, decoded);
            return this;
        }
    }, {
        key: 'stringifyJSON',
        value: function stringifyJSON() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("stringify");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("stringify");

            var target = this.get(name);
            if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object") {
                throw "stringifyJSON: target invalid";
            }

            this.set(nameToSave, JSON.stringify(target));
            return this;
        }
    }, {
        key: 'parseJSON',
        value: function parseJSON() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("stringify");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("stringify");

            var target = this.get(name);
            if (typeof target !== "string") {
                throw "stringifyJSON: target invalid";
            }
            this.set(nameToSave, JSON.parse(target));
            return this;
        }

        /**
         * Merges elements into a single string
         * if name passed - saves the merge result inside the object
         * under key <name>.
         * @param things
         *     type: array
         *     array of strings. Each string is a key.
         * @param name
         *     type: string
         *     name of the key under which to save the merge result
         */

    }, {
        key: 'merge',
        value: function merge() {
            var things = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("merge");
            var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("merge");


            if (!this.keysExist(things)) throw "merge: some or all objects with such keys not found ";

            console.log("Mergin' things");
            var result = "";
            for (var i = 0; i < things.length; ++i) {
                var candidate = this.get(things[i]);
                if (typeof candidate === "string" || typeof candidate === "number") result += candidate;else throw "Object " + things[i] + " is not mergeable";
            }
            this.set(nameToSave, result);
            return this;
        }
    }, {
        key: 'encodeBlobLength',
        value: function encodeBlobLength() {
            var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("encodeBlobLength");
            var targetLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("encodeBlobLength");
            var paddingChar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("encodeBlobLength");
            var nameToSave = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : iCrypto.pRequired("encodeBlobLength");

            if (typeof paddingChar !== "string") {
                throw "encodeBlobLength: Invalid padding char";
            }
            var l = String(this.get(target).length);
            var paddingLength = targetLength - l.length;
            if (paddingLength < 0) {
                throw "encodeBlobLength: String length exceedes target length";
            }
            var padding = paddingChar[0].repeat(paddingLength);
            this.set(nameToSave, padding + l);
            return this;
        }

        /************SERVICE FUNCTIONS**************/

    }, {
        key: 'get',
        value: function get(name) {
            if (this.keysExist(name)) return this.store[name];
            throw "Property " + name + " not found";
        }
    }, {
        key: 'set',
        value: function set(name, value) {
            if (this.locked) throw "Cannot add property: object locked";
            this.assertKeysAvailable(name);
            this.store[name] = value;
        }
    }, {
        key: 'lock',
        value: function lock() {
            this.locked = true;
        }
    }, {
        key: 'unlock',
        value: function unlock() {
            this.locked = false;
        }
    }, {
        key: 'assertKeysAvailable',
        value: function assertKeysAvailable(keys) {
            if (this.keysExist(keys)) throw "Cannot add property: " + keys.toString() + " property with such name already exists";
        }
    }, {
        key: 'keysExist',
        value: function keysExist(keys) {
            if (!keys) throw "keysExist: Missing required arguments";
            if (typeof keys === "string" || typeof keys === "number") return this._keyExists(keys);
            if ((typeof keys === 'undefined' ? 'undefined' : _typeof(keys)) !== "object") throw "keysExist: unsupported type";
            if (keys.length < 1) throw "array must have at least one key";

            var currentKeys = Object.keys(this.store);

            for (var i = 0; i < keys.length; ++i) {
                if (!currentKeys.includes(keys[i].toString())) return false;
            }
            return true;
        }
    }, {
        key: '_keyExists',
        value: function _keyExists(key) {
            if (!key) throw "keyExists: Missing required arguments";
            return Object.keys(this.store).includes(key.toString());
        }
    }, {
        key: 'throwError',
        value: function throwError() {
            var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unknown error";

            throw message;
        }
    }], [{
        key: 'isRSAPEMValid',
        value: function isRSAPEMValid(keyData, type) {
            keyData = keyData.trim();
            var headerPattern = type === "public" ? /^-{4,5}BEGIN.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}BEGIN.*PRIVATE.*KEY.*-{4,5}/;
            var footerPattern = type === "public" ? /^-{4,5}END.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}END.*PRIVATE.*KEY.*-{4,5}/;
            var valid = true;
            keyData = keyData.replace(/\r?\n$/, "");
            var keyDataArr = keyData.split(/\r?\n/);
            valid = valid && keyDataArr.length > 2 && headerPattern.test(keyDataArr[0]) && footerPattern.test(keyDataArr[keyDataArr.length - 1]);
            return valid;
        }
    }, {
        key: 'base64ToPEM',
        value: function base64ToPEM(keyData, type) {
            var header = type === "public" ? "-----BEGIN PUBLIC KEY-----" : "-----BEGIN RSA PRIVATE KEY-----";
            var footer = type === "public" ? "-----END PUBLIC KEY-----" : "-----END RSA PRIVATE KEY-----";
            var result = header;
            for (var i = 0; i < keyData.length; ++i) {
                result += i % 64 === 0 ? "\r\n" + keyData[i] : keyData[i];
            }
            result += "\r\n" + footer;
            return result;
        }
    }, {
        key: 'arrayBufferToString',
        value: function arrayBufferToString(buf) {
            return String.fromCharCode.apply(null, new Uint16Array(buf));
        }
    }, {
        key: 'stringToArrayBuffer',
        value: function stringToArrayBuffer(str) {
            var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            var bufView = new Uint16Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        /**
         * TODO make it universal and for arbitrary number of arrays     *
         * @param arr1
         * @param arr2
         * @returns {Uint8Array}
         */

    }, {
        key: 'concatUint8Arrays',
        value: function concatUint8Arrays(arr1, arr2) {
            var res = new Uint8Array(arr1.byteLength + arr2.byteLength);
            res.set(arr1, 0);
            res.set(arr2, arr1.byteLength);
            return res;
        }

        /**
         * Concatinates 2 array buffers in order buffer1 + buffer2
         * @param {ArrayBuffer} buffer1
         * @param {ArrayBuffer} buffer2
         * @returns {ArrayBufferLike}
         */

    }, {
        key: 'concatArrayBuffers',
        value: function concatArrayBuffers(buffer1, buffer2) {
            var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
            tmp.set(new Uint8Array(buffer1), 0);
            tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
            return tmp.buffer;
        }
    }, {
        key: 'getBytes',
        value: function getBytes(length) {
            return forge.random.getBytesSync(length);
        }
    }, {
        key: 'hexEncode',
        value: function hexEncode(blob) {
            return forge.util.bytesToHex(blob);
        }
    }, {
        key: 'hexDecode',
        value: function hexDecode(blob) {
            return forge.util.hexToBytes(blob);
        }
    }, {
        key: 'base64Encode',
        value: function base64Encode(blob) {
            return forge.util.encode64(blob);
        }
    }, {
        key: 'base64Decode',
        value: function base64Decode(blob) {
            return forge.util.decode64(blob);
        }

        /**
         * Returns random integer
         * @param a
         * @param b
         */

    }, {
        key: 'randInt',
        value: function randInt(min, max) {
            if (max === undefined) {
                max = min;
                min = 0;
            }

            if (typeof min !== 'number' || typeof max !== 'number') {
                throw new TypeError('Expected all arguments to be numbers');
            }

            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }, {
        key: 'createRandomHexString',
        value: function createRandomHexString(length) {
            var bytes = iCrypto.getBytes(length);
            var hex = iCrypto.hexEncode(bytes);
            var offset = iCrypto.randInt(0, hex.length - length);
            return hex.substring(offset, offset + length);
        }
    }, {
        key: 'pRequired',
        value: function pRequired() {
            var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "iCrypto function";

            throw functionName + ": missing required parameter!";
        }
    }]);

    return iCrypto;
}();

var Base32 = function () {
    function Base32() {
        _classCallCheck(this, Base32);

        this.RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        this.RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
        this.CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    }

    _createClass(Base32, [{
        key: 'encode',
        value: function encode(buffer, variant) {
            var alphabet, padding;

            switch (variant) {
                case 'RFC3548':
                case 'RFC4648':
                    alphabet = this.RFC4648;
                    padding = true;
                    break;
                case 'RFC4648-HEX':
                    alphabet = this.RFC4648_HEX;
                    padding = true;
                    break;
                case 'CROCKFORD':
                    alphabet = this.CROCKFORD;
                    padding = false;
                    break;
                default:
                    throw new Error('Unknown base32 variant: ' + variant);
            }

            var length = buffer.byteLength;
            var view = new Uint8Array(buffer);

            var bits = 0;
            var value = 0;
            var output = '';

            for (var i = 0; i < length; i++) {
                value = value << 8 | view[i];
                bits += 8;

                while (bits >= 5) {
                    output += alphabet[value >>> bits - 5 & 31];
                    bits -= 5;
                }
            }

            if (bits > 0) {
                output += alphabet[value << 5 - bits & 31];
            }

            if (padding) {
                while (output.length % 8 !== 0) {
                    output += '=';
                }
            }

            return output;
        }
    }]);

    return Base32;
}();