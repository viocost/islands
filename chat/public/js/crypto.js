/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iCrypto", function() { return iCrypto; });

//import { JSChaCha20 } from 'js-chacha20'

//const lzma = require('lzma');
//const forge = require('node-forge');
//const sjcl = require("./sjcl.js");
const Base32 = __webpack_require__(1);



class iCryptoFactory{

    constructor(settings){
        this.readSettings();
    }

    createICryptor(){
        return new iCrypto(this.settings);
    }

    readSettings(){
        console.log("readubg settings");
        this.settings = null;
    }
}



class iCrypto {
    constructor(settings){
        let self = this;
        self.settings = {};
        self.locked = false;
        self.setEncodersAndDecoders();
        self.symCiphers = ['aes'];
        self.streamCiphers = ['chacha'];
        self.asymCiphers = ['rsa'];
        self.store = {}

        self.rsa = {
            createKeyPair: (...args)=>{ return self.generateRSAKeyPair(...args)},
            asyncCreateKeyPair: (...args)=>{return self.asyncGenerateRSAKeyPair(...args)},
            encrypt: (...args)=>{return self.publicKeyEncrypt(...args)},
            decrypt: (...args)=>{return self.privateKeyDecrypt(...args)},
            sign: (...args)=>{return self.privateKeySign(...args)},
            verify: (...args)=>{return self.publicKeyVerify(...args)},
            setKey: (...args)=>{return self.setRSAKey(...args)},
            getSettings: ()=>{return "RSA"}
        };

        self.aes = {
            modes: ['CBC', 'CFB', 'CTR'],
            mode: 'CBC',
            ivLength: 16,
            keySize: 32,
            createKey: (...args)=>{return self.createSYMKey(...args)},
            encrypt: (...args)=>{return self.AESEncrypt(...args)},
            decrypt: (...args)=>{return self.AESDecrypt(...args)},
            setKey: (...args)=>{return self.setSYMKey(...args)},
            getSettings: ()=>{return "AES"}
        };

        self.chacha = {
            init: (...args)=>{return self.initStreamCryptor(...args)},
            encrypt: (...args)=>{return self.streamCryptorEncrypt(...args)},
            decrypt: (...args)=>{return self.streamCryptorDecrypt(...args)},
            getSettings: ()=>{return "ChaCha"}
        };

        self.setAsymCipher('rsa');
        self.setSymCipher('aes');
        self.setStreamCipher('chacha');


    }


    /***************** SETTING CIPHERS API *******************/


    setSymCipher(...opts){
        let self = this;
        if (!self.symCiphers.includes(opts[0])){
            throw "setSymCipher: Invalid or unsupported algorithm"
        }
        self.sym = self[opts[0]]
    }

    setAsymCipher(...opts){
        let self = this;
        if (!self.asymCiphers.includes(opts[0])){
            throw "setSymCipher: Invalid or unsupported algorithm"
        }
        self.asym = self[opts[0]]
    }

    setStreamCipher(...opts){
        let self = this;
        if (!self.streamCiphers.includes(opts[0])){
            throw "setSymCipher: Invalid or unsupported algorithm"
        }
        self.ssym = self[opts[0]]
    }



    /***************** END **********************************/


    setEncodersAndDecoders(){
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

    asyncCreateNonce(nameToSave, length=32){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.createNonce(nameToSave, length))
            } catch (err){
                reject(err)
            }
        })
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
    createNonce(nameToSave = iCrypto.pRequired("createNonce"), length=32){
        let self = this;
        this.set(nameToSave, iCrypto.getBytes(length));
        return this;
    }




    asyncAddBlob(nameToSave, plainText){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.addBlob(nameToSave, plainText));
            } catch (err){
                reject(err);
            }
        })
    }

    addBlob(nameToSave = iCrypto.pRequired("addBlob"), plainText = iCrypto.pRequired("addBlob")){
        this.set(nameToSave, plainText.toString().trim());
        return this
    }


    /**********************$$*****************************/
    /***#### KEYS CRYPTO ####***/

    asyncCreateSYMKey(nameToSave, ivLength=16, keyLength=32){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.createSYMKey(nameToSave, ivLength, keyLength));
            } catch (err){
                reject(err);
            }
        })
    }



    /**
     * Creates hex-encoded SYM key, which is just some random hex-encoded bytes
     * @param nameToSave
     * @param keyLength
     * @returns {iCrypto}
     */
    createSYMKey(nameToSave = iCrypto.pRequired("createSYMKey"), keyLength=32){
        let self = this;
        let key = iCrypto.getBytes(keyLength);
        self.set(nameToSave, forge.util.bytesToHex(key));
        return self;
    }

    /**
     * Sets passed SYM key inside the object
     * @param nameToSave
     * @param {string} key Must be hexified string
     */
    setSYMKey(nameToSave =  iCrypto.pRequired("setSYMKey"),
              key = iCrypto.pRequired("setSYMKey")){
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
    asyncAESEncrypt(target, key, nameToSave, hexify, mode, encoding ){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.AESEncrypt(target, key, nameToSave, hexify, mode, encoding));
            } catch (err){
                reject(err);
            }
        })
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
    AESEncrypt(target = iCrypto.pRequired("AESEncrypt"),
               key = iCrypto.pRequired("AESEncrypt"),
               nameToSave = iCrypto.pRequired("AESEncrypt"),
               hexify = true,
               mode = 'CBC',
               encoding){

        let self = this;
        if(!self.aes.modes.includes(mode.toUpperCase())){
            throw "AESencrypt: Invalid AES mode";
        }
        mode = "AES-" + mode.toUpperCase();
        //Creating random 16 bytes IV
        const iv = iCrypto.getBytes(16);
        let AESkey = forge.util.hexToBytes(self.get(key));
        const cipher = forge.cipher.createCipher(mode, AESkey);
        cipher.start({iv:iv});
        cipher.update(forge.util.createBuffer(this.get(target), encoding));
        cipher.finish();
        this.set(nameToSave, (hexify ? forge.util.bytesToHex(iv) + cipher.output.toHex():
                                       iv + cipher.output));
        return this;
    }


    asyncAESDecrypt(target, key, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.AESDecrypt(target, key, nameToSave));
            } catch (err){
                reject(err);
            }
        })
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
    AESDecrypt(target = iCrypto.pRequired("AESDecrypt"),
               key = iCrypto.pRequired("AESDecrypt"),
               nameToSave = iCrypto.pRequired("AESDecrypt"),
               dehexify = false,
               mode = "CBC",
               encoding){
        let self = this;
        let cipherWOIV;
        if(!self.aes.modes.includes(mode.toUpperCase())){
            throw "AESencrypt: Invalid AES mode";
        }
        mode = "AES-" + mode.toUpperCase();
        let cipher = self.get(target);
        let iv;
        if(dehexify){
            iv = forge.util.hexToBytes(cipher.substring(0, 32));
            cipherWOIV = forge.util.hexToBytes(cipher.substr(32));
        } else{
            //Assuming cipher is a binary string
            cipherWOIV = cipher.substr(16);
            iv = cipher.substring(0, 16);
        }
        const AESkey = forge.util.hexToBytes(this.get(key));
        let decipher = forge.cipher.createDecipher(mode, AESkey);
        decipher.start({iv:iv});
        decipher.update(forge.util.createBuffer(cipherWOIV));
        decipher.finish();
        this.set(nameToSave, decipher.output.toString('utf8'));
        return this;
    }

    asyncHash(target, nameToSave, algorithm = "sha256"){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.hash(target, nameToSave, algorithm));
            } catch (err){
                reject(err);
            }
        })
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
    hashFileWorker(file = iCrypto.pRequired("fileHashWorker file"),
                   nameToSave = iCrypto.pRequired("fileHashWorker nameToSave"),
                   algorithm = "sha256"){
        return new Promise((resolve, reject)=>{
            let self = this;
            if(Worker === undefined){
                throw "Web workers are not supported in current environment";
            }
            let worker = new Worker("/js/iCryptoWorker.js");
            worker.onmessage = (ev) =>{
                if (ev.data[0] === "success"){
                    self.set(nameToSave, ev.data[1]);
                    resolve(self);
                    worker.terminate();
                } else{
                    reject(ev.data[1]);
                    worker.terminate();
                }
            };
            worker.postMessage(["hashFile", file]);
        })
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
    initStreamCryptor(nameToSave =iCrypto.pRequired("initStreamEncryptor"),
                      key = iCrypto.pRequired("initStreamEncryptor"),
                      isEncryptionMode = true,
                      algorithm = "chacha20"){
        let self  = this;
        let ivRaw, ivHex, keyRaw, cryptor, ivBuffer;
        let mode = "enc";

        keyRaw = iCrypto.hexDecode(key);
        if (keyRaw.length < 16){
            throw "chacha20: invalid key size: " + keyRaw.length + " key length must be 32 bytes";
        }

        let keyBuffer = iCrypto.stringToArrayBuffer(keyRaw).slice(0, 32);


        if (isEncryptionMode){
            ivRaw = iCrypto.getBytes(6)
            ivHex = iCrypto.hexEncode(ivRaw);
            ivBuffer = iCrypto.stringToArrayBuffer(ivRaw).slice(0, 12);
            cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0)
        } else {
            mode = "dec";
            ivBuffer = new ArrayBuffer(0);
        }

        let res = new function (){
            let self = this;
            self.cryptor= cryptor;
            self.key =  key;
            self.iv = ivHex;
            self.mode = mode;
            self.encryptionMode =  ()=>{
                return self.mode === "enc"
            };
            self.decryptionMode = ()=>{
                return self.mode === "dec"
            };
            self.encrypt = (input)=>{
                let blob = (typeof(input) === "string") ? iCrypto.stringToArrayBuffer(input) : input;
                if (!(blob instanceof ArrayBuffer) && !(blob instanceof Uint8Array)){
                    throw "StreamCryptor encrypt: input type is invalid";
                }
                if (self.cryptor._byteCounter === 0){
                    //First check if counter is 0.
                    //If so - it is a first encryption block and we need to prepend IV
                    let encrypted = self.cryptor.encrypt(new Uint8Array(blob));
                    return iCrypto.concatUint8Arrays(new Uint8Array(ivBuffer), encrypted)
                } else{
                    //Just encrypting the blob
                    return self.cryptor.encrypt(new Uint8Array(blob));
                }
            };

            self.decrypt = (input)=>{
                let blob = (typeof(input) === "string") ? iCrypto.stringToArrayBuffer(input) : input;
                if (!(blob instanceof ArrayBuffer)){
                    throw "StreamCryptor encrypt: input type is invalid";
                }

                if (self.cryptor === undefined){
                    //decryptor was not initialized yet because
                    //Initalization vecotor (iv)was not yet obtained
                    //IV assumed to be first 6 bytes prepended to cipher
                    let currentIVLength = ivBuffer.byteLength;
                    if (currentIVLength + blob.byteLength <= 12){
                        ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob);
                        //Still gathering iv, so returning empty array
                        return new Uint8Array();
                    } else{
                        let remainingIVBytes = 12-ivBuffer.byteLength;
                        ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob.slice(0, remainingIVBytes));
                        self.iv = iCrypto.hexEncode(iCrypto.arrayBufferToString(ivBuffer));
                        self.cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
                        let chunk = new Uint8Array(blob.slice(remainingIVBytes, blob.byteLength));
                        return self.cryptor.decrypt(chunk);
                    }
                } else {
                    //Decrypto is initialized.
                    // Just decrypting the blob and returning result
                    return self.cryptor.decrypt(new Uint8Array(blob));
                }

            }
        };
        self.set(nameToSave, res);
        return self;
    }

    streamCryptorGetIV(target = iCrypto.pRequired("streamCryptorGetIV")){
        let self = this;
        let cryptor = self.get(target);
        return cryptor.iv;
    }

    streamCryptorEncrypt(cryptorID = iCrypto.pRequired("streamCryptorEncrypt"),
             blob = iCrypto.pRequired("streamCryptorEncrypt"),
             encoding = "raw"){
        let self = this;
        let input;
        let cryptor = self.get(cryptorID);
        if (!cryptor.encryptionMode()){
            throw "streamCryptorEncrypt error: mode is invalid";
        }

        if (blob instanceof ArrayBuffer){
            input = blob
        } else if (blob instanceof Uint8Array){
            input = blob.buffer
        } else if (typeof(blob) === "string"){
            input = iCrypto.stringToArrayBuffer(blob)
        } else{
            throw("streamCryptorEncrypt: invalid format input");
        }


        if (encoding === undefined || encoding === "raw"){
            return cryptor.encrypt(input).buffer
        } else {
            throw "NOT IMPLEMENTED"
        }


    }

    streamCryptorDecrypt(cryptorID = iCrypto.pRequired("streamCryptorEncrypt"),
                         blob = iCrypto.pRequired("streamCryptorEncrypt"),
                         encoding = "raw"){
        let self = this;
        let cryptor = self.get(cryptorID);

        let input;

        if (!cryptor.decryptionMode()){
            throw "streamCryptorEncrypt error: mode is invalid";
        }

        if (blob instanceof ArrayBuffer){
            input = blob
        } else if (blob instanceof Uint8Array){
            input = blob.buffer
        } else if (typeof(blob) === "string"){
            input = iCrypto.stringToArrayBuffer(blob)
        } else{
            throw("streamCryptorEncrypt: invalid format input");
        }
        if (encoding === undefined || encoding === "raw"){
            return cryptor.decrypt(input).buffer
        } else {
            throw "NOT IMPLEMENTED"
        }
    }




    /**
     *
     * @param target
     * @param nameToSave
     * @param algorithm
     */
    hash(target = iCrypto.pRequired("hash"),
         nameToSave  = iCrypto.pRequired("hash"),
         algorithm = "sha256"){
        let self = this;
        let blob = self.get(target);
        if(typeof(blob) !== "string"){
            throw "hash: invalid target type: " + typeof(blob) + "  Target must be string."
        }
        algorithm = algorithm.toLowerCase();
        let hash = forge.md.hasOwnProperty(algorithm) ? forge.md[algorithm].create(): this.throwError("Wrong hash algorithm");

        hash.update(blob);
        this.set(nameToSave, hash.digest().toHex());
        return self
    }


    createHash(nameToSave = iCrypto.pRequired("createHash"),
               algorithm = "sha256"){
        let hash = sjcl.hash.hasOwnProperty(algorithm) ? new sjcl.hash[algorithm](): this.throwError("Wrong hash algorithm");
        this.set(nameToSave, hash);
        return this
    }

    /**
     *
     * @param target
     * @param {} blob can be binary string or arrayBuffer
     * @returns {iCrypto}
     */
    updateHash(target = iCrypto.pRequired("updateHash: target"), blob = iCrypto.pRequired("updateHash: blob")){
        let self = this;
        let input;
        if (typeof(blob) === "string"){
            input = iCrypto.stringToArrayBuffer(blob)
        } else if (blob instanceof Uint8Array){
            input = blob.buffer;
        } else if (blob instanceof ArrayBuffer){
            input = blob
        } else{
            throw "invalid input format!"
        }
        let hash = self.get(target);
        hash.update(sjcl.codec.arrayBuffer.toBits(input));
        return self
    }

    digestHash(target = iCrypto.pRequired("digestHash",),
               nameToSave = iCrypto.pRequired("digestHash"),
               hexify = true){
        let self = this;
        let hRes = self.get(target);
        let res = hexify ? sjcl.codec.hex.fromBits(hRes.finalize())
            : sjcl.codec.arrayBuffer.fromBits(hRes.finalize());
        this.set(nameToSave,  res);
        return self;
    }


    asyncGenerateRSAKeyPair(nameToSave = iCrypto.pRequired("asyncGenerateRSAKeyPair"),
                            length = 2048){
        return new Promise((resolve, reject)=>{
            let self = this;
            forge.rsa.generateKeyPair({bits: length, workers: -1}, (err, pair)=> {
                if (err)
                    reject(err);
                else{
                    try{

                        let pubKey =  forge.pki.publicKeyToPem(pair.publicKey);
                        let privKey = forge.pki.privateKeyToPem(pair.privateKey);
                        self.set(nameToSave, {
                            publicKey: pubKey,
                            privateKey: privKey,
                        });
                        resolve(this);

                    } catch(err){

                        reject(err);

                    }
                }
            });
        })
    }


    /**
     * Generates RSA key pair.
     * Key saved in PEM format
     * resulting object has publicKey, privateKey, keyType, length
     * @param nameToSave
     * @param length
     * @returns {iCrypto}
     */
    generateRSAKeyPair(nameToSave = iCrypto.pRequired("generateRSAKeyPair"), length = 2048){
        let self = this;
        let pair = forge.pki.rsa.generateKeyPair({bits: length, e: 0x10001});
        let pubKey =  forge.pki.publicKeyToPem(pair.publicKey);
        let privKey = forge.pki.privateKeyToPem(pair.privateKey);

        self.set(nameToSave, {
            publicKey: pubKey,
            privateKey: privKey,
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
    publicFromPrivate(target = iCrypto.pRequired("publicFromPrivate"),
                      nameToSave = iCrypto.pRequired("publicFromPrivate")){
        let forgePrivateKey = forge.pki.privateKeyFromPem(this.get(target));
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
    setRSAKey(nameToSave = iCrypto.pRequired("setRSAPublicKey"),
              keyData = iCrypto.pRequired("setRSAPublicKey"),
              type = iCrypto.pRequired("setRSAPublicKey")){
        if (type!== "public" && type !== "private"){
            throw "Invalid key type"
        }

        if (!iCrypto.isRSAPEMValid(keyData, type)){
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
    static isRSAPEMValid(keyData, type){
        keyData = keyData.trim();
        let headerPattern = (type === "public" ? /^-{4,5}BEGIN.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}BEGIN.*PRIVATE.*KEY.*-{4,5}/);
        let footerPattern = (type === "public" ? /^-{4,5}END.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}END.*PRIVATE.*KEY.*-{4,5}/);
        let valid = true;
        keyData = keyData.replace(/\r?\n$/, "");
        let keyDataArr = keyData.split(/\r?\n/);
        valid = (valid &&
            keyDataArr.length>2 &&
            headerPattern.test(keyDataArr[0]) &&
            footerPattern.test(keyDataArr[keyDataArr.length -1])
        );
        return valid;
    }

    static base64ToPEM(keyData, type){
        let header = type === "public" ? "-----BEGIN PUBLIC KEY-----" : "-----BEGIN RSA PRIVATE KEY-----";
        let footer = type === "public" ? "-----END PUBLIC KEY-----" : "-----END RSA PRIVATE KEY-----";
        let result = header;
        for (let i = 0; i<keyData.length; ++i){
            result += (i%64===0 ? "\r\n" + keyData[i] : keyData[i])
        }
        result += "\r\n" + footer;
        return result;
    }

    asyncPublicKeyEncrypt(target, keyPair, nameToSave, encoding){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.publicKeyEncrypt(target, keyPair, nameToSave))
            } catch (err){
                reject(err);
            }

        })
    }


    /**
     * creates and saves public key fingerprint
     * @param target - public key, either keypair or public key
     * @param nameToSave
     * @param hashAlgorithm
     * @returns {iCrypto}
     */
    getPublicKeyFingerprint(target = iCrypto.pRequired("getPublicKeyFingerpint"),
                            nameToSave =  iCrypto.pRequired("getPublicKeyFingerpint"),
                            hashAlgorithm = "sha256"){
        let key = this.validateExtractRSAKey(this.get(target), "public");
        let forgeKey = forge.pki.publicKeyFromPem(key);
        let fingerprint = forge.pki.getPublicKeyFingerprint(forgeKey, {encoding: 'hex', md: forge.md[hashAlgorithm].create()});
        this.set(nameToSave, fingerprint);
        return this;
    }

    publicKeyEncrypt(target = iCrypto.pRequired("publicKeyEncrypt"),
                     key = iCrypto.pRequired("publicKeyEncrypt"),
                     nameToSave = iCrypto.pRequired("publicKeyEncrypt"),
                     encoding){
        key = this.validateExtractRSAKey(this.get(key), "public");
        let publicKey = forge.pki.publicKeyFromPem(key);
        let result = publicKey.encrypt(this.get(target));
        if (encoding){
            result = this._encodeBlob(result, encoding)
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
    _encodeBlob(blob = iCrypto.pRequired("_encodeBlob"),
                encoding = iCrypto.pRequired("_encodeBlob")){
        let self = this;
        if (!this.encoders.hasOwnProperty(encoding)){
            throw "_encodeBlob: Invalid encoding: " + encoding;
        }
        return self.encoders[encoding](blob)
    }

    _decodeBlob(blob = iCrypto.pRequired("_encodeBlob"),
                encoding = iCrypto.pRequired("_encodeBlob")){

        let self = this;
        if (!this.encoders.hasOwnProperty(encoding)){
            throw "_decodeBlob: Invalid encoding: " + encoding;
        }
        return this.decoders[encoding](blob)
    }


    asyncPrivateKeyDecrypt(target, key, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.privateKeyDecrypt(target, key, nameToSave))
            }catch(err){
                reject(err);
            }
        })
    }

    privateKeyDecrypt(target = iCrypto.pRequired("privateKeyDecrypt"),
                      key = iCrypto.pRequired("privateKeyDecrypt"),
                      nameToSave = iCrypto.pRequired("privateKeyDecrypt"),
                      encoding){

        key = this.validateExtractRSAKey(this.get(key), "private");
        let privateKey = forge.pki.privateKeyFromPem(key);
        let cipher = this.get(target);
        if (encoding){
            cipher = this._decodeBlob(cipher, encoding);
        }
        this.set(nameToSave, privateKey.decrypt(cipher));
        return this;
    }


    asyncPrivateKeySign(target, keyPair, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.privateKeySign(target, keyPair, nameToSave));
            } catch(err){
                reject(err);
            }
        })
    }

    privateKeySign(target = iCrypto.pRequired("privateKeyEncrypt"),
                   key = iCrypto.pRequired("privateKeyEncrypt"),
                   nameToSave = iCrypto.pRequired("privateKeyEncrypt"),
                   hashAlgorithm = "sha256",
                   hexifySign = true){
        key = this.validateExtractRSAKey(this.get(key), "private");
        const privateKey = forge.pki.privateKeyFromPem(key);
        const md = forge.md[hashAlgorithm].create();
        md.update(this.get(target));
        let signature = privateKey.sign(md);
        signature = hexifySign ? forge.util.bytesToHex(signature) : signature;
        this.set(nameToSave, signature);
        return this;
    }


    asyncPublicKeyVerify(target, signature, key, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.publicKeyVerify(target, signature, key, nameToSave));
            } catch(err){
                reject(err);
            }
        })
    }

    publicKeyVerify(target = iCrypto.pRequired("publicKeyVerify"),
                    signature = iCrypto.pRequired("publicKeyVerify"),
                    key = iCrypto.pRequired("publicKeyVerify"),
                    nameToSave = iCrypto.pRequired("publicKeyVerify"),
                    dehexifySignRequired = true){
        key = this.validateExtractRSAKey(this.get(key), "public");
        let publicKey = forge.pki.publicKeyFromPem(key);
        const md = forge.md.sha256.create();
        md.update(this.get(target));
        let sign = this.get(signature);
        sign = dehexifySignRequired ? forge.util.hexToBytes(sign) : sign;
        const verified = publicKey.verify(md.digest().bytes(), sign);
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
    validateExtractRSAKey(key = iCrypto.pRequired("validateAndExtractRSAKey"),
                          keyType = iCrypto.pRequired("validateAndExtractRSAKey")){
        const keyTypes = {public: "publicKey", private: "privateKey"};
        if (!Object.keys(keyTypes).includes(keyType))
            throw "validateExtractRSAKey: key type is invalid!";
        if (key[keyTypes[keyType]]){
            key = key[keyTypes[keyType]];
        }
        if (!iCrypto.isRSAPEMValid(key, keyType)){
            console.log(keyType);
            console.log(key);
            throw "validateExtractRSAKey: Invalid key format"
        }
        return key;
    }

    pemToBase64(target = iCrypto.pRequired("pemToBase64"),
                nameToSave = iCrypto.pRequired("pemToBase64"),
                keyType = iCrypto.pRequired("pemToBase64")){
        let key = this.get(target);
        if (!iCrypto.isRSAPEMValid(key, keyType)){
            console.log(keyType);
            console.log(key);
            throw "validateExtractRSAKey: Invalid key format"
        }
        key = key.trim().split(/\r?\n/).slice(1, -1).join("");
        this.set(nameToSave, key);
    }


    /***#### COMPRESSION ####***/

    asyncCompress(target, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.compress(target, nameToSave));
            } catch(err){
                reject(err);
            }
        })
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
    compress(target = iCrypto.pRequired("compress"), nameToSave = iCrypto.pRequired("compress")){
        let compressed = LZMA.compress(this.get(target));
        this.set(nameToSave, compressed);
        return this;
    }

    asyncDecompress(target, nameToSave){
        return new Promise((resolve, reject)=>{
            try{
                resolve(this.decompress(target, nameToSave));
            } catch(err){
                reject(err);
            }

        })
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
    decompress(target = iCrypto.pRequired("decompress"),
               nameToSave = iCrypto.pRequired("decompress")){
        let decompressed = LZMA.decompress(this.get(target));
        this.set(nameToSave, decompressed);
        return this;
    }


    /***#### UTILS ####***/

    encode(target = iCrypto.pRequired("encode"),
           encoding = iCrypto.pRequired("encode"),
           nameToSave = iCrypto.pRequired("encode")){
        let self = this;
        self.set(nameToSave, self._encodeBlob(this.get(target), encoding));
        return this;
    }





    base64Encode(name = iCrypto.pRequired("base64Encode"),
                 nameToSave = iCrypto.pRequired("base64Encode"),
                 stringify = false){
        let target = stringify ? JSON.stringify(this.get(name)): this.get(name)
        this.set(nameToSave, iCrypto.base64Encode(target));
        return this;
    }

    base64Decode(name = iCrypto.pRequired("base64decode"),
                 nameToSave = iCrypto.pRequired("base64decode"),
                 jsonParse = false){
        let decoded = iCrypto.base64Decode(this.get(name));
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
    bytesToHex(name = iCrypto.pRequired("bytesToHex"),
               nameToSave = iCrypto.pRequired("bytesToHex"),
               stringify = false){
        let target = stringify ? JSON.stringify(this.get(name)): this.get(name)
        this.set(nameToSave, iCrypto.hexEncode(target));
        return this;
    }

    hexToBytes(name = iCrypto.pRequired("hexToBytes"),
               nameToSave = iCrypto.pRequired("hexToBytes"),
               jsonParse = false){
        let decoded = iCrypto.hexDecode(this.get(name));
        decoded = jsonParse ? JSON.parse(decoded) : decoded;
        this.set(nameToSave, decoded);
        return this;
    }

    stringifyJSON(name = iCrypto.pRequired("stringify"),
                  nameToSave = iCrypto.pRequired("stringify")){
        let target = this.get(name);
        if (typeof(target) !== "object"){
            throw "stringifyJSON: target invalid";
        }

        this.set(nameToSave, JSON.stringify(target));
        return this;
    }

    parseJSON(name = iCrypto.pRequired("stringify"),
              nameToSave = iCrypto.pRequired("stringify")){
        let target = this.get(name);
        if (typeof(target) !== "string"){
            throw "stringifyJSON: target invalid";
        }
        this.set(nameToSave, JSON.parse(target))
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
    merge(things = iCrypto.pRequired("merge"), nameToSave  = iCrypto.pRequired("merge")){

        if (!this.keysExist(things))
            throw "merge: some or all objects with such keys not found ";

        console.log("Mergin' things");
        let result = "";
        for (let i= 0; i< things.length; ++i){
            let candidate = this.get(things[i]);
            if (typeof (candidate) === "string" || typeof(candidate) ==="number" )
                result += candidate;
            else
                throw "Object " + things[i] + " is not mergeable";
        }
        this.set(nameToSave, result);
        return this;
    }

    encodeBlobLength(target = iCrypto.pRequired("encodeBlobLength"),
                     targetLength = iCrypto.pRequired("encodeBlobLength"),
                     paddingChar = iCrypto.pRequired("encodeBlobLength"),
                     nameToSave = iCrypto.pRequired("encodeBlobLength")){
        if(typeof (paddingChar) !== "string"){
            throw "encodeBlobLength: Invalid padding char";
        }
        let l = String(this.get(target).length);
        let paddingLength = targetLength - l.length;
        if (paddingLength<0){
            throw "encodeBlobLength: String length exceedes target length";
        }
        let padding = paddingChar[0].repeat(paddingLength);
        this.set(nameToSave, (padding + l));
        return this;
    }

    /************SERVICE FUNCTIONS**************/

    static arrayBufferToString(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }


    static stringToArrayBuffer(str) {
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
    static concatUint8Arrays(arr1, arr2){
        let res = new Uint8Array(arr1.byteLength + arr2.byteLength);
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
    static concatArrayBuffers (buffer1, buffer2) {
        let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    };


    static getBytes(length){
        return forge.random.getBytesSync(length);
    }

    static hexEncode(blob){
        return forge.util.bytesToHex(blob);
    }

    static hexDecode(blob){
        return forge.util.hexToBytes(blob);
    }

    static base64Encode(blob){
        return forge.util.encode64(blob);
    }

    static base64Decode(blob){
        return forge.util.decode64(blob);
    }

    /**
     * Returns random integer
     * @param a
     * @param b
     */
    static randInt(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }

        if (typeof min !== 'number' || typeof max !== 'number') {
            throw new TypeError('Expected all arguments to be numbers');
        }

        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    static createRandomHexString(length){
        let bytes = iCrypto.getBytes(length);
        let hex = iCrypto.hexEncode(bytes);
        let offset = iCrypto.randInt(0, hex.length - length);
        return hex.substring(offset, offset+length);
    }

    get  (name){
        if (this.keysExist(name))
            return this.store[name];
        throw "Property " + name + " not found"
    };

    set (name, value){
        if (this.locked)
            throw "Cannot add property: object locked";
        this.assertKeysAvailable(name);
        this.store[name] = value;
    };

    lock(){
        this.locked = true;
    };

    unlock(){
        this.locked = false;
    };

    assertKeysAvailable(keys){
        if (this.keysExist(keys))
            throw "Cannot add property: " + keys.toString() + " property with such name already exists";
    }

    keysExist(keys){
        if (!keys)
            throw "keysExist: Missing required arguments";
        if(typeof (keys) === "string" || typeof(keys) === "number")
            return this._keyExists(keys);
        if(typeof (keys) !== "object")
            throw ("keysExist: unsupported type");
        if(keys.length<1)
            throw "array must have at least one key";

        let currentKeys = Object.keys(this.store);

        for (let i=0; i< keys.length; ++i){
            if (!currentKeys.includes(keys[i].toString()))
                return false;
        }
        return true;
    }

    _keyExists(key){
        if (!key)
            throw "keyExists: Missing required arguments";
        return Object.keys(this.store).includes(key.toString());
    }

    static pRequired(functionName = "iCrypto function"){
        throw functionName + ": missing required parameter!"
    }

    throwError(message = "Unknown error"){
        throw message;
    }
}




/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * [hi-base32]{@link https://github.com/emn178/hi-base32}
 *
 * @version 0.3.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var root = typeof window === 'object' ? window : {};
  var NODE_JS = !root.HI_BASE32_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  }
  var COMMON_JS = !root.HI_BASE32_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD =  true && __webpack_require__(4);
  var BASE32_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('');
  var BASE32_DECODE_CHAR = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8,
    'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 
    'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 
    'Z': 25, '2': 26, '3': 27, '4': 28, '5': 29, '6': 30, '7': 31
  };

  var blocks = [0, 0, 0, 0, 0, 0, 0, 0];

  var toUtf8String = function (bytes) {
    var str = '', length = bytes.length, i = 0, followingChars = 0, b, c;
    while (i < length) {
      b = bytes[i++];
      if (b <= 0x7F) {
        str += String.fromCharCode(b);
        continue;
      } else if (b > 0xBF && b <= 0xDF) {
        c = b & 0x1F;
        followingChars = 1;
      } else if (b <= 0xEF) {
        c = b & 0x0F;
        followingChars = 2;
      } else if (b <= 0xF7) {
        c = b & 0x07;
        followingChars = 3;
      } else {
        throw 'not a UTF-8 string';
      }

      for (var j = 0; j < followingChars; ++j) {
        b = bytes[i++];
        if (b < 0x80 || b > 0xBF) {
          throw 'not a UTF-8 string';
        }
        c <<= 6;
        c += b & 0x3F;
      }
      if (c >= 0xD800 && c <= 0xDFFF) {
        throw 'not a UTF-8 string';
      }
      if (c > 0x10FFFF) {
        throw 'not a UTF-8 string';
      }

      if (c <= 0xFFFF) {
        str += String.fromCharCode(c);
      } else {
        c -= 0x10000;
        str += String.fromCharCode((c >> 10) + 0xD800);
        str += String.fromCharCode((c & 0x3FF) + 0xDC00);
      }
    }
    return str;
  };

  var decodeAsBytes = function (base32Str) {
    base32Str = base32Str.replace(/=/g, '');
    var v1, v2, v3, v4, v5, v6, v7, v8, bytes = [], index = 0, length = base32Str.length;

    // 4 char to 3 bytes
    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
      bytes[index++] = (v7 << 5 | v8) & 255;
    }

    // remain bytes
    var remain = length - count;
    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
    }
    return bytes;
  };

  var encodeAscii = function (str) {
    var v1, v2, v3, v4, v5, base32Str = '', length = str.length;
    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i++);
      v5 = str.charCodeAt(i++);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] +
        BASE32_ENCODE_CHAR[v5 & 31];
    }

    // remain char
    var remain = length - count;
    if (remain === 1) {
      v1 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2) & 31] +
        '======';
    } else if (remain === 2) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4) & 31] +
        '====';
    } else if (remain === 3) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1) & 31] +
        '===';
    } else if (remain === 4) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3) & 31] +
        '=';
    }
    return base32Str;
  };

  var encodeUtf8 = function (str) {
    var v1, v2, v3, v4, v5, code, end = false, base32Str = '',
      index = 0, i, start = 0, bytes = 0, length = str.length;
    do {
      blocks[0] = blocks[5];
      blocks[1] = blocks[6];
      blocks[2] = blocks[7];
      for (i = start; index < length && i < 5; ++index) {
        code = str.charCodeAt(index);
        if (code < 0x80) {
          blocks[i++] = code;
        } else if (code < 0x800) {
          blocks[i++] = 0xc0 | (code >> 6);
          blocks[i++] = 0x80 | (code & 0x3f);
        } else if (code < 0xd800 || code >= 0xe000) {
          blocks[i++] = 0xe0 | (code >> 12);
          blocks[i++] = 0x80 | ((code >> 6) & 0x3f);
          blocks[i++] = 0x80 | (code & 0x3f);
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++index) & 0x3ff));
          blocks[i++] = 0xf0 | (code >> 18);
          blocks[i++] = 0x80 | ((code >> 12) & 0x3f);
          blocks[i++] = 0x80 | ((code >> 6) & 0x3f);
          blocks[i++] = 0x80 | (code & 0x3f);
        }
      }
      bytes += i - start;
      start = i - 5;
      if (index === length) {
        ++index;
      }
      if (index > length && i < 6) {
        end = true;
      }
      v1 = blocks[0];
      if (i > 4) {
        v2 = blocks[1];
        v3 = blocks[2];
        v4 = blocks[3];
        v5 = blocks[4];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
          BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
          BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
          BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
          BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
          BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
          BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] +
          BASE32_ENCODE_CHAR[v5 & 31];
      } else if (i === 1) {
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
          BASE32_ENCODE_CHAR[(v1 << 2) & 31] +
          '======';
      } else if (i === 2) {
        v2 = blocks[1];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
          BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
          BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
          BASE32_ENCODE_CHAR[(v2 << 4) & 31] +
          '====';
      } else if (i === 3) {
        v2 = blocks[1];
        v3 = blocks[2];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
          BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
          BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
          BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
          BASE32_ENCODE_CHAR[(v3 << 1) & 31] +
          '===';
      } else {
        v2 = blocks[1];
        v3 = blocks[2];
        v4 = blocks[3];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
          BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
          BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
          BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
          BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
          BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
          BASE32_ENCODE_CHAR[(v4 << 3) & 31] +
          '=';
      }
    } while (!end);
    return base32Str;
  };

  var encodeBytes = function (bytes) {
    var v1, v2, v3, v4, v5, base32Str = '', length = bytes.length;
    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i++];
      v5 = bytes[i++];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] +
        BASE32_ENCODE_CHAR[v5 & 31];
    }

    // remain char
    var remain = length - count;
    if (remain === 1) {
      v1 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2) & 31] +
        '======';
    } else if (remain === 2) {
      v1 = bytes[i++];
      v2 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4) & 31] +
        '====';
    } else if (remain === 3) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1) & 31] +
        '===';
    } else if (remain === 4) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3) & 31] +
        '=';
    }
    return base32Str;
  };

  var encode = function (input, asciiOnly) {
    var notString = typeof(input) !== 'string';
    if (notString && input.constructor === ArrayBuffer) {
      input = new Uint8Array(input);
    }
    if (notString) {
      return encodeBytes(input);
    } else if (asciiOnly) {
      return encodeAscii(input);
    } else {
      return encodeUtf8(input);
    }
  };

  var decode = function (base32Str, asciiOnly) {
    if (!asciiOnly) {
      return toUtf8String(decodeAsBytes(base32Str));
    }
    var v1, v2, v3, v4, v5, v6, v7, v8, str = '', length = base32Str.indexOf('=');
    if (length === -1) {
      length = base32Str.length;
    }

    // 8 char to 5 bytes
    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) +
        String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255) +
        String.fromCharCode((v7 << 5 | v8) & 255);
    }

    // remain bytes
    var remain = length - count;
    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255);
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255);
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255);
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) +
        String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255);
    }
    return str;
  };

  var exports = {
    encode: encode,
    decode: decode
  };
  decode.asBytes = decodeAsBytes;

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.base32 = exports;
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return exports;
      }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2), __webpack_require__(3)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(this, {}))

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2xpYi9pQ3J5cHRvLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9saWIvQmFzZTMyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLW9wdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7QUNsRkE7QUFBQTtBQUFhO0FBQ2IsVUFBVSxhQUFhOztBQUV2QjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsQ0FBYTs7OztBQUlwQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUF1Qyx5Q0FBeUM7QUFDaEYsNENBQTRDLDZDQUE2QztBQUN6RixpQ0FBaUMsc0NBQXNDO0FBQ3ZFLGlDQUFpQyx1Q0FBdUM7QUFDeEUsOEJBQThCLG9DQUFvQztBQUNsRSxnQ0FBZ0MscUNBQXFDO0FBQ3JFLGdDQUFnQywrQkFBK0I7QUFDL0QsOEJBQThCO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsa0NBQWtDO0FBQ3JFLGlDQUFpQyxnQ0FBZ0M7QUFDakUsaUNBQWlDLGdDQUFnQztBQUNqRSxnQ0FBZ0MsK0JBQStCO0FBQy9ELDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBLDhCQUE4Qix1Q0FBdUM7QUFDckUsaUNBQWlDLDBDQUEwQztBQUMzRSxpQ0FBaUMsMENBQTBDO0FBQzNFLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOzs7QUFHQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsTUFBTTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsTUFBTTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLDBCQUEwQjtBQUNqRTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBLHFCQUFxQjs7QUFFckI7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxrREFBa0QseUJBQXlCO0FBQzNFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCxJQUFJLHNCQUFzQixJQUFJLFFBQVEsSUFBSSx1QkFBdUIsSUFBSTtBQUMxSCxxREFBcUQsSUFBSSxvQkFBb0IsSUFBSSxRQUFRLElBQUkscUJBQXFCLElBQUk7QUFDdEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQSxTQUFTO0FBQ1Q7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFLHNEQUFzRDtBQUM3SDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixrQkFBa0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQSw0Q0FBNEMsWUFBWTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxZQUFZO0FBQzNCLGVBQWUsWUFBWTtBQUMzQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDN3VDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUE0QixJQUFJLHNCQUFVO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUEscUJBQXFCLG9CQUFvQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZDQUE2QyxXQUFXO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFEQUFxRCxXQUFXO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQix5QkFBeUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxREFBcUQsV0FBVztBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkMsV0FBVztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsTUFBTSxtQ0FBTztBQUNiO0FBQ0EsT0FBTztBQUFBLG9HQUFDO0FBQ1I7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7O0FDamJEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFVBQVU7Ozs7Ozs7QUN2THRDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7OztBQ25CQTtBQUNBIiwiZmlsZSI6ImNyeXB0by5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vaW1wb3J0IHsgSlNDaGFDaGEyMCB9IGZyb20gJ2pzLWNoYWNoYTIwJ1xuXG4vL2NvbnN0IGx6bWEgPSByZXF1aXJlKCdsem1hJyk7XG4vL2NvbnN0IGZvcmdlID0gcmVxdWlyZSgnbm9kZS1mb3JnZScpO1xuLy9jb25zdCBzamNsID0gcmVxdWlyZShcIi4vc2pjbC5qc1wiKTtcbmNvbnN0IEJhc2UzMiA9IHJlcXVpcmUoXCIuL0Jhc2UzMi5qc1wiKTtcblxuXG5cbmNsYXNzIGlDcnlwdG9GYWN0b3J5e1xuXG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3Mpe1xuICAgICAgICB0aGlzLnJlYWRTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGNyZWF0ZUlDcnlwdG9yKCl7XG4gICAgICAgIHJldHVybiBuZXcgaUNyeXB0byh0aGlzLnNldHRpbmdzKTtcbiAgICB9XG5cbiAgICByZWFkU2V0dGluZ3MoKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZWFkdWJnIHNldHRpbmdzXCIpO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gbnVsbDtcbiAgICB9XG59XG5cblxuXG5leHBvcnQgY2xhc3MgaUNyeXB0byB7XG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3Mpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2V0dGluZ3MgPSB7fTtcbiAgICAgICAgc2VsZi5sb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5zZXRFbmNvZGVyc0FuZERlY29kZXJzKCk7XG4gICAgICAgIHNlbGYuc3ltQ2lwaGVycyA9IFsnYWVzJ107XG4gICAgICAgIHNlbGYuc3RyZWFtQ2lwaGVycyA9IFsnY2hhY2hhJ107XG4gICAgICAgIHNlbGYuYXN5bUNpcGhlcnMgPSBbJ3JzYSddO1xuICAgICAgICBzZWxmLnN0b3JlID0ge31cblxuICAgICAgICBzZWxmLnJzYSA9IHtcbiAgICAgICAgICAgIGNyZWF0ZUtleVBhaXI6ICguLi5hcmdzKT0+eyByZXR1cm4gc2VsZi5nZW5lcmF0ZVJTQUtleVBhaXIoLi4uYXJncyl9LFxuICAgICAgICAgICAgYXN5bmNDcmVhdGVLZXlQYWlyOiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5hc3luY0dlbmVyYXRlUlNBS2V5UGFpciguLi5hcmdzKX0sXG4gICAgICAgICAgICBlbmNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5wdWJsaWNLZXlFbmNyeXB0KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIGRlY3J5cHQ6ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLnByaXZhdGVLZXlEZWNyeXB0KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIHNpZ246ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLnByaXZhdGVLZXlTaWduKC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIHZlcmlmeTogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYucHVibGljS2V5VmVyaWZ5KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIHNldEtleTogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuc2V0UlNBS2V5KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIGdldFNldHRpbmdzOiAoKT0+e3JldHVybiBcIlJTQVwifVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlbGYuYWVzID0ge1xuICAgICAgICAgICAgbW9kZXM6IFsnQ0JDJywgJ0NGQicsICdDVFInXSxcbiAgICAgICAgICAgIG1vZGU6ICdDQkMnLFxuICAgICAgICAgICAgaXZMZW5ndGg6IDE2LFxuICAgICAgICAgICAga2V5U2l6ZTogMzIsXG4gICAgICAgICAgICBjcmVhdGVLZXk6ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLmNyZWF0ZVNZTUtleSguLi5hcmdzKX0sXG4gICAgICAgICAgICBlbmNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5BRVNFbmNyeXB0KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIGRlY3J5cHQ6ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLkFFU0RlY3J5cHQoLi4uYXJncyl9LFxuICAgICAgICAgICAgc2V0S2V5OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5zZXRTWU1LZXkoLi4uYXJncyl9LFxuICAgICAgICAgICAgZ2V0U2V0dGluZ3M6ICgpPT57cmV0dXJuIFwiQUVTXCJ9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2VsZi5jaGFjaGEgPSB7XG4gICAgICAgICAgICBpbml0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5pbml0U3RyZWFtQ3J5cHRvciguLi5hcmdzKX0sXG4gICAgICAgICAgICBlbmNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5zdHJlYW1DcnlwdG9yRW5jcnlwdCguLi5hcmdzKX0sXG4gICAgICAgICAgICBkZWNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5zdHJlYW1DcnlwdG9yRGVjcnlwdCguLi5hcmdzKX0sXG4gICAgICAgICAgICBnZXRTZXR0aW5nczogKCk9PntyZXR1cm4gXCJDaGFDaGFcIn1cbiAgICAgICAgfTtcblxuICAgICAgICBzZWxmLnNldEFzeW1DaXBoZXIoJ3JzYScpO1xuICAgICAgICBzZWxmLnNldFN5bUNpcGhlcignYWVzJyk7XG4gICAgICAgIHNlbGYuc2V0U3RyZWFtQ2lwaGVyKCdjaGFjaGEnKTtcblxuXG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKiogU0VUVElORyBDSVBIRVJTIEFQSSAqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBzZXRTeW1DaXBoZXIoLi4ub3B0cyl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFzZWxmLnN5bUNpcGhlcnMuaW5jbHVkZXMob3B0c1swXSkpe1xuICAgICAgICAgICAgdGhyb3cgXCJzZXRTeW1DaXBoZXI6IEludmFsaWQgb3IgdW5zdXBwb3J0ZWQgYWxnb3JpdGhtXCJcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnN5bSA9IHNlbGZbb3B0c1swXV1cbiAgICB9XG5cbiAgICBzZXRBc3ltQ2lwaGVyKC4uLm9wdHMpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5hc3ltQ2lwaGVycy5pbmNsdWRlcyhvcHRzWzBdKSl7XG4gICAgICAgICAgICB0aHJvdyBcInNldFN5bUNpcGhlcjogSW52YWxpZCBvciB1bnN1cHBvcnRlZCBhbGdvcml0aG1cIlxuICAgICAgICB9XG4gICAgICAgIHNlbGYuYXN5bSA9IHNlbGZbb3B0c1swXV1cbiAgICB9XG5cbiAgICBzZXRTdHJlYW1DaXBoZXIoLi4ub3B0cyl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFzZWxmLnN0cmVhbUNpcGhlcnMuaW5jbHVkZXMob3B0c1swXSkpe1xuICAgICAgICAgICAgdGhyb3cgXCJzZXRTeW1DaXBoZXI6IEludmFsaWQgb3IgdW5zdXBwb3J0ZWQgYWxnb3JpdGhtXCJcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNzeW0gPSBzZWxmW29wdHNbMF1dXG4gICAgfVxuXG5cblxuICAgIC8qKioqKioqKioqKioqKioqKiBFTkQgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgc2V0RW5jb2RlcnNBbmREZWNvZGVycygpe1xuICAgICAgICB0aGlzLmVuY29kZXJzID0ge1xuICAgICAgICAgICAgaGV4OiBpQ3J5cHRvLmhleEVuY29kZSxcbiAgICAgICAgICAgIGJhc2U2NDogaUNyeXB0by5iYXNlNjRFbmNvZGVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlY29kZXJzID0ge1xuICAgICAgICAgICAgaGV4OiBpQ3J5cHRvLmhleERlY29kZSxcbiAgICAgICAgICAgIGJhc2U2NDogaUNyeXB0by5iYXNlNjREZWNvZGVcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIC8qKioqKioqKipNQUlOIE1FVEhPRFMqKioqKioqKioqKioqKi9cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqJCQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKioqIyMjI05PTkNFUyBQTEFJTiBURVhUIyMjIyoqKi9cblxuICAgIGFzeW5jQ3JlYXRlTm9uY2UobmFtZVRvU2F2ZSwgbGVuZ3RoPTMyKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmNyZWF0ZU5vbmNlKG5hbWVUb1NhdmUsIGxlbmd0aCkpXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBub25jZSBvZiB0aGUgZ2l2ZW4gbGVuZ3RoIGFuZFxuICAgICAqIHNhdmVzIGl0IHVuZGVyIHRoZSBwcm92aWRlZCBuYW1lLlxuICAgICAqIERlZmF1bHQgaXMgMzIgYnl0ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lVG9TYXZlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICAgICAqIEByZXR1cm5zIHtpQ3J5cHRvfVxuICAgICAqL1xuICAgIGNyZWF0ZU5vbmNlKG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImNyZWF0ZU5vbmNlXCIpLCBsZW5ndGg9MzIpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGlDcnlwdG8uZ2V0Qnl0ZXMobGVuZ3RoKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG5cblxuICAgIGFzeW5jQWRkQmxvYihuYW1lVG9TYXZlLCBwbGFpblRleHQpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuYWRkQmxvYihuYW1lVG9TYXZlLCBwbGFpblRleHQpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgYWRkQmxvYihuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJhZGRCbG9iXCIpLCBwbGFpblRleHQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImFkZEJsb2JcIikpe1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBwbGFpblRleHQudG9TdHJpbmcoKS50cmltKCkpO1xuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiokJCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKiojIyMjIEtFWVMgQ1JZUFRPICMjIyMqKiovXG5cbiAgICBhc3luY0NyZWF0ZVNZTUtleShuYW1lVG9TYXZlLCBpdkxlbmd0aD0xNiwga2V5TGVuZ3RoPTMyKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmNyZWF0ZVNZTUtleShuYW1lVG9TYXZlLCBpdkxlbmd0aCwga2V5TGVuZ3RoKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGhleC1lbmNvZGVkIFNZTSBrZXksIHdoaWNoIGlzIGp1c3Qgc29tZSByYW5kb20gaGV4LWVuY29kZWQgYnl0ZXNcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSBrZXlMZW5ndGhcbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICBjcmVhdGVTWU1LZXkobmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiY3JlYXRlU1lNS2V5XCIpLCBrZXlMZW5ndGg9MzIpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBrZXkgPSBpQ3J5cHRvLmdldEJ5dGVzKGtleUxlbmd0aCk7XG4gICAgICAgIHNlbGYuc2V0KG5hbWVUb1NhdmUsIGZvcmdlLnV0aWwuYnl0ZXNUb0hleChrZXkpKTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyBwYXNzZWQgU1lNIGtleSBpbnNpZGUgdGhlIG9iamVjdFxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBNdXN0IGJlIGhleGlmaWVkIHN0cmluZ1xuICAgICAqL1xuICAgIHNldFNZTUtleShuYW1lVG9TYXZlID0gIGlDcnlwdG8ucFJlcXVpcmVkKFwic2V0U1lNS2V5XCIpLFxuICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInNldFNZTUtleVwiKSl7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGtleSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJlcXVpcmVzIG9iamVjdCBvZiBzaW1pbGFyIHN0cnVjdHVyZSBmb3Iga2V5IGFzIGJlaW5nIGNyZWF0ZWQgYnkgY3JlYXRlU1lNS2V5XG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGFzeW5jQUVTRW5jcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSwgaGV4aWZ5LCBtb2RlLCBlbmNvZGluZyApe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuQUVTRW5jcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSwgaGV4aWZ5LCBtb2RlLCBlbmNvZGluZykpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmNyeXB0cyBibG9iIGlkZW50aWZpZWQgYnkgXCJ0YXJnZXRcIiBwYXJhbWV0ZXIuXG4gICAgICogVGFyZ2V0IG11c3QgYmUgc2V0IGluc2lkZSBpQ3J5cHRvIG9iamVjdFxuICAgICAqIElWIGlzIHJhbmRvbWx5IGdlbmVyYXRlZCBhbmQgYXBwZW5kZWQgdG8gdGhlIGNpcGhlciBibG9iXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGV4aWZ5IC0gU3BlY2lmaWVzIHRoZSBlbmNvZGluZyBvZiB0aGUgcmVzdWx0aW5nIGNpcGhlci4gRGVmYXVsdDogaGV4LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlIC0gc3BlY2lmaWVzIEFFUyBtb2RlLiBEZWZhdWx0IC0gQ0JDXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGl2TGVuZ3RoIC0gc3BlY2lmaWVzIGxlbmd0aCBvZiBpbml0aWFsaXphdGlvbiB2ZWN0b3JcbiAgICAgKiAgVGhlIGluaXRpYWxpemF0aW9uIHZlY3RvciBvZiBzcGVjaWZpZWQgbGVuZ3RoIHdpbGwgYmUgZ2VuZXJhdGVkIGFuZFxuICAgICAqICBhcHBlbmRlZCB0byB0aGUgZW5kIG9mIHJlc3VsdGluZyBjaXBoZXIuIElWIGJsb2Igd2lsbCBiZSBlbmNvZGVkIGFjY29yZGluZyB0b1xuICAgICAqICBvdXRwdXRFbmNvZGluZyBwYXJhbWV0ZXIsIGFuZCBpdHMgbGVuZ3RoIHdpbGwgYmUgbGFzdCAzIGJ5dGVzIG9mIHRoZSBjaXBoZXIgc3RyaW5nLlxuICAgICAqXG4gICAgICovXG4gICAgQUVTRW5jcnlwdCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIkFFU0VuY3J5cHRcIiksXG4gICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIkFFU0VuY3J5cHRcIiksXG4gICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgaGV4aWZ5ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgIG1vZGUgPSAnQ0JDJyxcbiAgICAgICAgICAgICAgIGVuY29kaW5nKXtcblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmKCFzZWxmLmFlcy5tb2Rlcy5pbmNsdWRlcyhtb2RlLnRvVXBwZXJDYXNlKCkpKXtcbiAgICAgICAgICAgIHRocm93IFwiQUVTZW5jcnlwdDogSW52YWxpZCBBRVMgbW9kZVwiO1xuICAgICAgICB9XG4gICAgICAgIG1vZGUgPSBcIkFFUy1cIiArIG1vZGUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgLy9DcmVhdGluZyByYW5kb20gMTYgYnl0ZXMgSVZcbiAgICAgICAgY29uc3QgaXYgPSBpQ3J5cHRvLmdldEJ5dGVzKDE2KTtcbiAgICAgICAgbGV0IEFFU2tleSA9IGZvcmdlLnV0aWwuaGV4VG9CeXRlcyhzZWxmLmdldChrZXkpKTtcbiAgICAgICAgY29uc3QgY2lwaGVyID0gZm9yZ2UuY2lwaGVyLmNyZWF0ZUNpcGhlcihtb2RlLCBBRVNrZXkpO1xuICAgICAgICBjaXBoZXIuc3RhcnQoe2l2Oml2fSk7XG4gICAgICAgIGNpcGhlci51cGRhdGUoZm9yZ2UudXRpbC5jcmVhdGVCdWZmZXIodGhpcy5nZXQodGFyZ2V0KSwgZW5jb2RpbmcpKTtcbiAgICAgICAgY2lwaGVyLmZpbmlzaCgpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCAoaGV4aWZ5ID8gZm9yZ2UudXRpbC5ieXRlc1RvSGV4KGl2KSArIGNpcGhlci5vdXRwdXQudG9IZXgoKTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl2ICsgY2lwaGVyLm91dHB1dCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIGFzeW5jQUVTRGVjcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5BRVNEZWNyeXB0KHRhcmdldCwga2V5LCBuYW1lVG9TYXZlKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY3J5cHRzIHRoZSBibG9iIGxvYWRlZCBpbnRvIGlDcnlwdG8gb2JqZWN0IGFuZCBzcGVjaWZpZWQgYnkgdGFyZ2UgcGFyYW1ldGVyXG4gICAgICogQXNzdW1lcyB0aGF0IGluaXRpYWxpemF0aW9uIHZlY3RvciBpcyBQUkVQRU5ERUQgdG8gdGhlIGNpcGhlciB0ZXh0XG4gICAgICogYW5kIGl0cyBsZW5ndGggaXMgMTYgYnl0ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgLSBjaXBoZXJ0ZXh0IHdpdGhpbiBpQ3J5cHRvIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSBTeW1tZXRyaWMgQUVTIGtleSBpbiBmb3JtIG9mIGhleCBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVoZXhpZnlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZSBBRVMgbW9kZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmNvZGluZyAtIHJlc3VsdGluZyBwbGFpbiB0ZXh0IGVuY29kaW5nIGRlZmF1bHQgKFVURjgpXG4gICAgICovXG4gICAgQUVTRGVjcnlwdCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIkFFU0RlY3J5cHRcIiksXG4gICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIkFFU0RlY3J5cHRcIiksXG4gICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNEZWNyeXB0XCIpLFxuICAgICAgICAgICAgICAgZGVoZXhpZnkgPSBmYWxzZSxcbiAgICAgICAgICAgICAgIG1vZGUgPSBcIkNCQ1wiLFxuICAgICAgICAgICAgICAgZW5jb2Rpbmcpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBjaXBoZXJXT0lWO1xuICAgICAgICBpZighc2VsZi5hZXMubW9kZXMuaW5jbHVkZXMobW9kZS50b1VwcGVyQ2FzZSgpKSl7XG4gICAgICAgICAgICB0aHJvdyBcIkFFU2VuY3J5cHQ6IEludmFsaWQgQUVTIG1vZGVcIjtcbiAgICAgICAgfVxuICAgICAgICBtb2RlID0gXCJBRVMtXCIgKyBtb2RlLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGxldCBjaXBoZXIgPSBzZWxmLmdldCh0YXJnZXQpO1xuICAgICAgICBsZXQgaXY7XG4gICAgICAgIGlmKGRlaGV4aWZ5KXtcbiAgICAgICAgICAgIGl2ID0gZm9yZ2UudXRpbC5oZXhUb0J5dGVzKGNpcGhlci5zdWJzdHJpbmcoMCwgMzIpKTtcbiAgICAgICAgICAgIGNpcGhlcldPSVYgPSBmb3JnZS51dGlsLmhleFRvQnl0ZXMoY2lwaGVyLnN1YnN0cigzMikpO1xuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAvL0Fzc3VtaW5nIGNpcGhlciBpcyBhIGJpbmFyeSBzdHJpbmdcbiAgICAgICAgICAgIGNpcGhlcldPSVYgPSBjaXBoZXIuc3Vic3RyKDE2KTtcbiAgICAgICAgICAgIGl2ID0gY2lwaGVyLnN1YnN0cmluZygwLCAxNik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgQUVTa2V5ID0gZm9yZ2UudXRpbC5oZXhUb0J5dGVzKHRoaXMuZ2V0KGtleSkpO1xuICAgICAgICBsZXQgZGVjaXBoZXIgPSBmb3JnZS5jaXBoZXIuY3JlYXRlRGVjaXBoZXIobW9kZSwgQUVTa2V5KTtcbiAgICAgICAgZGVjaXBoZXIuc3RhcnQoe2l2Oml2fSk7XG4gICAgICAgIGRlY2lwaGVyLnVwZGF0ZShmb3JnZS51dGlsLmNyZWF0ZUJ1ZmZlcihjaXBoZXJXT0lWKSk7XG4gICAgICAgIGRlY2lwaGVyLmZpbmlzaCgpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBkZWNpcGhlci5vdXRwdXQudG9TdHJpbmcoJ3V0ZjgnKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFzeW5jSGFzaCh0YXJnZXQsIG5hbWVUb1NhdmUsIGFsZ29yaXRobSA9IFwic2hhMjU2XCIpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuaGFzaCh0YXJnZXQsIG5hbWVUb1NhdmUsIGFsZ29yaXRobSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIG1lYW50IHRvIGJlIHVzZWQgb24gbGFyZ2UgZmlsZXNcbiAgICAgKiBJdCBpcyBhc3luY2hyb25vdXMsIHVzZXMgd2ViIHdvcmtlcnMsXG4gICAgICogYW5kIGl0IGNhbGN1bGF0ZXMgaGFzaCBvZiBhIGxhcmdlIGZpbGUgd2l0aG91dCBsb2FkaW5nIGl0XG4gICAgICogZnVsbHkgaW50byBtZW1vcnlcbiAgICAgKiBAcGFyYW0gZmlsZSAgLSAgdmFsdWUgb2YgYW4gaW5wdXQgb2YgdHlwZSBmaWxlXG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmUgLSBuYW1lIHRvIHN0b3JlIHJlc3VsdGluZyBoYXNoXG4gICAgICogQHBhcmFtIGFsZ29yaXRobSAtIHNoYTI1NiBpcyBkZWZhdWx0XG4gICAgICovXG4gICAgaGFzaEZpbGVXb3JrZXIoZmlsZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZmlsZUhhc2hXb3JrZXIgZmlsZVwiKSxcbiAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJmaWxlSGFzaFdvcmtlciBuYW1lVG9TYXZlXCIpLFxuICAgICAgICAgICAgICAgICAgIGFsZ29yaXRobSA9IFwic2hhMjU2XCIpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGlmKFdvcmtlciA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIldlYiB3b3JrZXJzIGFyZSBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB3b3JrZXIgPSBuZXcgV29ya2VyKFwiL2pzL2lDcnlwdG9Xb3JrZXIuanNcIik7XG4gICAgICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gKGV2KSA9PntcbiAgICAgICAgICAgICAgICBpZiAoZXYuZGF0YVswXSA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldChuYW1lVG9TYXZlLCBldi5kYXRhWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGV2LmRhdGFbMV0pO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShbXCJoYXNoRmlsZVwiLCBmaWxlXSk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgc3RyZWFtIGVuY3J5cHRvciBvciBkZWNyeXB0b3JcbiAgICAgKlxuICAgICAqIFN1cHBvcnRlZCBhbGdvcml0aG0gaXMgY2hhY2hhMjAgb25seVxuICAgICAqIFNpbmdsZSBpbnN0YW5jZSBvZiBhIHNpbmdsZSBzdHJlYW0gY3J5cHRvciBjYW4gYmUgdXNlZFxuICAgICAqIG9ubHkgb25lIHRpbWUsIG9uZSB3YXksIGFuZCBvbmx5IGZvciBhIHNpbmdsZSBzdHJlYW0uXG4gICAgICogTWVhbmluZyB5b3UgY2FuIHRha2UgYSBzaW5nbGUgc3RyZWFtIGFuZCBlbmNyeXB0IGl0IGNodW5rIGJ5IGNodW5rLFxuICAgICAqIGJ1dCB0aGVuLCBpZiB5b3Ugd2FudCB0byBkZWNyeXB0IHRoZSBzdHJlYW0sICB5b3UgaGF2ZSB0b1xuICAgICAqIHJlLWluaXRpYWxpemUgY3J5cHRvciBpbnN0YW5jZSBvciB1c2UgYSBuZXcgb25lLFxuICAgICAqIG90aGVyd2lzZSB0aGUgb3V0cHV0IHdpbGwgYmUgbWVhbmluZ2xlc3MuXG4gICAgICpcbiAgICAgKiBBbGwgdGhlIGNodW5rcyBtdXN0IGZsb3cgaW4gc2VxdWVuY2UuXG4gICAgICpcbiAgICAgKiAhISFJbXBvcnRhbnRcbiAgICAgKlxuICAgICAqIEVuY3J5cHRpb246XG4gICAgICogU3RyZWFtIGNyeXB0b3IgaGFuZGxlcyBpbml0aWFsaXphdGlvbiB2ZWN0b3IgKGl2KVxuICAgICAqIGJ5IHByZXBlbmRpbmcgdGhlbSB0byBjaXBoZXIuIFNvLCB0byBlbmNyeXB0IHRoZSBkYXRhIC1cbiAgICAgKiBqdXN0IHBhc3MgdGhlIGtleSBhbmQgbmV3IGl2IHdpbGwgYmUgY3JlYXRlZCBhdXRvbWF0aWNhbGx5XG4gICAgICogYW5kIHByZXBlbmRlZCB0byB0aGUgY2lwaGVyXG4gICAgICpcbiAgICAgKiBEZWNyeXB0aW9uOlxuICAgICAqIE9uIERlY3J5cHRpb24gdGhlIGFsZ29yaXRobSBBU1NVTUVTIHRoYXQgZmlyc3QgNiBieXRlcyBvZlxuICAgICAqIHRoZSBjaXBoZXJ0ZXh0IGlzIGl2LlxuICAgICAqIFNvLCBpdCB3aWxsIHRyZWF0IGZpcnN0IDYgYnl0ZXMgYXMgaXYgcmVnYXJkbGVzIG9mIGNodW5rcyxcbiAgICAgKiBhbmQgd2lsbCBiZWdpbiBkZWNyeXB0aW9uIHN0YXJ0aW5nIGZyb20gYnl0ZSA3XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVRvU2F2ZSAtIFN0cmVhbSBjcnlwdG9yIHdpbGwgYmUgc2F2ZWQgaW5zaWRlIGlDcnlwdG8gaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IFN0cmluZyBvZiBieXRlcyBpbiBoZXggLSBTeW1tZXRyaWMga2V5IHVzZWQgdG8gZW5jcnlwdC9kZWNyeXB0IGRhdGFcbiAgICAgKiAgVGhlIGFsZ29yaXRobSByZXF1aXJlcyBrZXkgdG8gYmUgMzIgYnl0ZXMgcHJlY2lzZWx5XG4gICAgICAgIE9ubHkgZmlyc3QgMzIgYnl0ZXMgKGFmdGVyIGRlY29kaW5nIGhleCkgd2lsbCBiZSB0YWtlblxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNFbmNyeXB0aW9uTW9kZSAtIGZsYWcgZW5jcnlwdGlvbiBtb2RlIC0gdHJ1ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhbGdvcml0aG0gU3VwcG9ydHMgb25seSBjaGFjaGEyMCBmb3Igbm93XG4gICAgICovXG4gICAgaW5pdFN0cmVhbUNyeXB0b3IobmFtZVRvU2F2ZSA9aUNyeXB0by5wUmVxdWlyZWQoXCJpbml0U3RyZWFtRW5jcnlwdG9yXCIpLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiaW5pdFN0cmVhbUVuY3J5cHRvclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBpc0VuY3J5cHRpb25Nb2RlID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICBhbGdvcml0aG0gPSBcImNoYWNoYTIwXCIpe1xuICAgICAgICBsZXQgc2VsZiAgPSB0aGlzO1xuICAgICAgICBsZXQgaXZSYXcsIGl2SGV4LCBrZXlSYXcsIGNyeXB0b3IsIGl2QnVmZmVyO1xuICAgICAgICBsZXQgbW9kZSA9IFwiZW5jXCI7XG5cbiAgICAgICAga2V5UmF3ID0gaUNyeXB0by5oZXhEZWNvZGUoa2V5KTtcbiAgICAgICAgaWYgKGtleVJhdy5sZW5ndGggPCAxNil7XG4gICAgICAgICAgICB0aHJvdyBcImNoYWNoYTIwOiBpbnZhbGlkIGtleSBzaXplOiBcIiArIGtleVJhdy5sZW5ndGggKyBcIiBrZXkgbGVuZ3RoIG11c3QgYmUgMzIgYnl0ZXNcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBrZXlCdWZmZXIgPSBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoa2V5UmF3KS5zbGljZSgwLCAzMik7XG5cblxuICAgICAgICBpZiAoaXNFbmNyeXB0aW9uTW9kZSl7XG4gICAgICAgICAgICBpdlJhdyA9IGlDcnlwdG8uZ2V0Qnl0ZXMoNilcbiAgICAgICAgICAgIGl2SGV4ID0gaUNyeXB0by5oZXhFbmNvZGUoaXZSYXcpO1xuICAgICAgICAgICAgaXZCdWZmZXIgPSBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoaXZSYXcpLnNsaWNlKDAsIDEyKTtcbiAgICAgICAgICAgIGNyeXB0b3IgPSBuZXcgSlNDaGFDaGEyMChuZXcgVWludDhBcnJheShrZXlCdWZmZXIpLCBuZXcgVWludDhBcnJheShpdkJ1ZmZlciksIDApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2RlID0gXCJkZWNcIjtcbiAgICAgICAgICAgIGl2QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlcyA9IG5ldyBmdW5jdGlvbiAoKXtcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYuY3J5cHRvcj0gY3J5cHRvcjtcbiAgICAgICAgICAgIHNlbGYua2V5ID0gIGtleTtcbiAgICAgICAgICAgIHNlbGYuaXYgPSBpdkhleDtcbiAgICAgICAgICAgIHNlbGYubW9kZSA9IG1vZGU7XG4gICAgICAgICAgICBzZWxmLmVuY3J5cHRpb25Nb2RlID0gICgpPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYubW9kZSA9PT0gXCJlbmNcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlbGYuZGVjcnlwdGlvbk1vZGUgPSAoKT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLm1vZGUgPT09IFwiZGVjXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmVuY3J5cHQgPSAoaW5wdXQpPT57XG4gICAgICAgICAgICAgICAgbGV0IGJsb2IgPSAodHlwZW9mKGlucHV0KSA9PT0gXCJzdHJpbmdcIikgPyBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoaW5wdXQpIDogaW5wdXQ7XG4gICAgICAgICAgICAgICAgaWYgKCEoYmxvYiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSAmJiAhKGJsb2IgaW5zdGFuY2VvZiBVaW50OEFycmF5KSl7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiU3RyZWFtQ3J5cHRvciBlbmNyeXB0OiBpbnB1dCB0eXBlIGlzIGludmFsaWRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuY3J5cHRvci5fYnl0ZUNvdW50ZXIgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICAvL0ZpcnN0IGNoZWNrIGlmIGNvdW50ZXIgaXMgMC5cbiAgICAgICAgICAgICAgICAgICAgLy9JZiBzbyAtIGl0IGlzIGEgZmlyc3QgZW5jcnlwdGlvbiBibG9jayBhbmQgd2UgbmVlZCB0byBwcmVwZW5kIElWXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmNyeXB0ZWQgPSBzZWxmLmNyeXB0b3IuZW5jcnlwdChuZXcgVWludDhBcnJheShibG9iKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpQ3J5cHRvLmNvbmNhdFVpbnQ4QXJyYXlzKG5ldyBVaW50OEFycmF5KGl2QnVmZmVyKSwgZW5jcnlwdGVkKVxuICAgICAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgLy9KdXN0IGVuY3J5cHRpbmcgdGhlIGJsb2JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY3J5cHRvci5lbmNyeXB0KG5ldyBVaW50OEFycmF5KGJsb2IpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZWxmLmRlY3J5cHQgPSAoaW5wdXQpPT57XG4gICAgICAgICAgICAgICAgbGV0IGJsb2IgPSAodHlwZW9mKGlucHV0KSA9PT0gXCJzdHJpbmdcIikgPyBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoaW5wdXQpIDogaW5wdXQ7XG4gICAgICAgICAgICAgICAgaWYgKCEoYmxvYiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSl7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiU3RyZWFtQ3J5cHRvciBlbmNyeXB0OiBpbnB1dCB0eXBlIGlzIGludmFsaWRcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5jcnlwdG9yID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgICAgICAvL2RlY3J5cHRvciB3YXMgbm90IGluaXRpYWxpemVkIHlldCBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgIC8vSW5pdGFsaXphdGlvbiB2ZWNvdG9yIChpdil3YXMgbm90IHlldCBvYnRhaW5lZFxuICAgICAgICAgICAgICAgICAgICAvL0lWIGFzc3VtZWQgdG8gYmUgZmlyc3QgNiBieXRlcyBwcmVwZW5kZWQgdG8gY2lwaGVyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SVZMZW5ndGggPSBpdkJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudElWTGVuZ3RoICsgYmxvYi5ieXRlTGVuZ3RoIDw9IDEyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl2QnVmZmVyID0gaUNyeXB0by5jb25jYXRBcnJheUJ1ZmZlcnMoaXZCdWZmZXIsIGJsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9TdGlsbCBnYXRoZXJpbmcgaXYsIHNvIHJldHVybmluZyBlbXB0eSBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1haW5pbmdJVkJ5dGVzID0gMTItaXZCdWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl2QnVmZmVyID0gaUNyeXB0by5jb25jYXRBcnJheUJ1ZmZlcnMoaXZCdWZmZXIsIGJsb2Iuc2xpY2UoMCwgcmVtYWluaW5nSVZCeXRlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdiA9IGlDcnlwdG8uaGV4RW5jb2RlKGlDcnlwdG8uYXJyYXlCdWZmZXJUb1N0cmluZyhpdkJ1ZmZlcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jcnlwdG9yID0gbmV3IEpTQ2hhQ2hhMjAobmV3IFVpbnQ4QXJyYXkoa2V5QnVmZmVyKSwgbmV3IFVpbnQ4QXJyYXkoaXZCdWZmZXIpLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJsb2Iuc2xpY2UocmVtYWluaW5nSVZCeXRlcywgYmxvYi5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jcnlwdG9yLmRlY3J5cHQoY2h1bmspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9EZWNyeXB0byBpcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBkZWNyeXB0aW5nIHRoZSBibG9iIGFuZCByZXR1cm5pbmcgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNyeXB0b3IuZGVjcnlwdChuZXcgVWludDhBcnJheShibG9iKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuc2V0KG5hbWVUb1NhdmUsIHJlcyk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIHN0cmVhbUNyeXB0b3JHZXRJVih0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmVhbUNyeXB0b3JHZXRJVlwiKSl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGNyeXB0b3IgPSBzZWxmLmdldCh0YXJnZXQpO1xuICAgICAgICByZXR1cm4gY3J5cHRvci5pdjtcbiAgICB9XG5cbiAgICBzdHJlYW1DcnlwdG9yRW5jcnlwdChjcnlwdG9ySUQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmVhbUNyeXB0b3JFbmNyeXB0XCIpLFxuICAgICAgICAgICAgIGJsb2IgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmVhbUNyeXB0b3JFbmNyeXB0XCIpLFxuICAgICAgICAgICAgIGVuY29kaW5nID0gXCJyYXdcIil7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGlucHV0O1xuICAgICAgICBsZXQgY3J5cHRvciA9IHNlbGYuZ2V0KGNyeXB0b3JJRCk7XG4gICAgICAgIGlmICghY3J5cHRvci5lbmNyeXB0aW9uTW9kZSgpKXtcbiAgICAgICAgICAgIHRocm93IFwic3RyZWFtQ3J5cHRvckVuY3J5cHQgZXJyb3I6IG1vZGUgaXMgaW52YWxpZFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJsb2IgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICAgICAgICBpbnB1dCA9IGJsb2JcbiAgICAgICAgfSBlbHNlIGlmIChibG9iIGluc3RhbmNlb2YgVWludDhBcnJheSl7XG4gICAgICAgICAgICBpbnB1dCA9IGJsb2IuYnVmZmVyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKGJsb2IpID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGlucHV0ID0gaUNyeXB0by5zdHJpbmdUb0FycmF5QnVmZmVyKGJsb2IpXG4gICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgIHRocm93KFwic3RyZWFtQ3J5cHRvckVuY3J5cHQ6IGludmFsaWQgZm9ybWF0IGlucHV0XCIpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCB8fCBlbmNvZGluZyA9PT0gXCJyYXdcIil7XG4gICAgICAgICAgICByZXR1cm4gY3J5cHRvci5lbmNyeXB0KGlucHV0KS5idWZmZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiTk9UIElNUExFTUVOVEVEXCJcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbiAgICBzdHJlYW1DcnlwdG9yRGVjcnlwdChjcnlwdG9ySUQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmVhbUNyeXB0b3JFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2IgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmVhbUNyeXB0b3JFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nID0gXCJyYXdcIil7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGNyeXB0b3IgPSBzZWxmLmdldChjcnlwdG9ySUQpO1xuXG4gICAgICAgIGxldCBpbnB1dDtcblxuICAgICAgICBpZiAoIWNyeXB0b3IuZGVjcnlwdGlvbk1vZGUoKSl7XG4gICAgICAgICAgICB0aHJvdyBcInN0cmVhbUNyeXB0b3JFbmNyeXB0IGVycm9yOiBtb2RlIGlzIGludmFsaWRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChibG9iIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgICAgICAgICAgaW5wdXQgPSBibG9iXG4gICAgICAgIH0gZWxzZSBpZiAoYmxvYiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpe1xuICAgICAgICAgICAgaW5wdXQgPSBibG9iLmJ1ZmZlclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZihibG9iKSA9PT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBpbnB1dCA9IGlDcnlwdG8uc3RyaW5nVG9BcnJheUJ1ZmZlcihibG9iKVxuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICB0aHJvdyhcInN0cmVhbUNyeXB0b3JFbmNyeXB0OiBpbnZhbGlkIGZvcm1hdCBpbnB1dFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCB8fCBlbmNvZGluZyA9PT0gXCJyYXdcIil7XG4gICAgICAgICAgICByZXR1cm4gY3J5cHRvci5kZWNyeXB0KGlucHV0KS5idWZmZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiTk9UIElNUExFTUVOVEVEXCJcbiAgICAgICAgfVxuICAgIH1cblxuXG5cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogQHBhcmFtIGFsZ29yaXRobVxuICAgICAqL1xuICAgIGhhc2godGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJoYXNoXCIpLFxuICAgICAgICAgbmFtZVRvU2F2ZSAgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImhhc2hcIiksXG4gICAgICAgICBhbGdvcml0aG0gPSBcInNoYTI1NlwiKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgYmxvYiA9IHNlbGYuZ2V0KHRhcmdldCk7XG4gICAgICAgIGlmKHR5cGVvZihibG9iKSAhPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICB0aHJvdyBcImhhc2g6IGludmFsaWQgdGFyZ2V0IHR5cGU6IFwiICsgdHlwZW9mKGJsb2IpICsgXCIgIFRhcmdldCBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9XG4gICAgICAgIGFsZ29yaXRobSA9IGFsZ29yaXRobS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBsZXQgaGFzaCA9IGZvcmdlLm1kLmhhc093blByb3BlcnR5KGFsZ29yaXRobSkgPyBmb3JnZS5tZFthbGdvcml0aG1dLmNyZWF0ZSgpOiB0aGlzLnRocm93RXJyb3IoXCJXcm9uZyBoYXNoIGFsZ29yaXRobVwiKTtcblxuICAgICAgICBoYXNoLnVwZGF0ZShibG9iKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgaGFzaC5kaWdlc3QoKS50b0hleCgpKTtcbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cblxuICAgIGNyZWF0ZUhhc2gobmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiY3JlYXRlSGFzaFwiKSxcbiAgICAgICAgICAgICAgIGFsZ29yaXRobSA9IFwic2hhMjU2XCIpe1xuICAgICAgICBsZXQgaGFzaCA9IHNqY2wuaGFzaC5oYXNPd25Qcm9wZXJ0eShhbGdvcml0aG0pID8gbmV3IHNqY2wuaGFzaFthbGdvcml0aG1dKCk6IHRoaXMudGhyb3dFcnJvcihcIldyb25nIGhhc2ggYWxnb3JpdGhtXCIpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBoYXNoKTtcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiBAcGFyYW0ge30gYmxvYiBjYW4gYmUgYmluYXJ5IHN0cmluZyBvciBhcnJheUJ1ZmZlclxuICAgICAqIEByZXR1cm5zIHtpQ3J5cHRvfVxuICAgICAqL1xuICAgIHVwZGF0ZUhhc2godGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJ1cGRhdGVIYXNoOiB0YXJnZXRcIiksIGJsb2IgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInVwZGF0ZUhhc2g6IGJsb2JcIikpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgaWYgKHR5cGVvZihibG9iKSA9PT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBpbnB1dCA9IGlDcnlwdG8uc3RyaW5nVG9BcnJheUJ1ZmZlcihibG9iKVxuICAgICAgICB9IGVsc2UgaWYgKGJsb2IgaW5zdGFuY2VvZiBVaW50OEFycmF5KXtcbiAgICAgICAgICAgIGlucHV0ID0gYmxvYi5idWZmZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoYmxvYiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICAgICAgICAgIGlucHV0ID0gYmxvYlxuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICB0aHJvdyBcImludmFsaWQgaW5wdXQgZm9ybWF0IVwiXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhhc2ggPSBzZWxmLmdldCh0YXJnZXQpO1xuICAgICAgICBoYXNoLnVwZGF0ZShzamNsLmNvZGVjLmFycmF5QnVmZmVyLnRvQml0cyhpbnB1dCkpO1xuICAgICAgICByZXR1cm4gc2VsZlxuICAgIH1cblxuICAgIGRpZ2VzdEhhc2godGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJkaWdlc3RIYXNoXCIsKSxcbiAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImRpZ2VzdEhhc2hcIiksXG4gICAgICAgICAgICAgICBoZXhpZnkgPSB0cnVlKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgaFJlcyA9IHNlbGYuZ2V0KHRhcmdldCk7XG4gICAgICAgIGxldCByZXMgPSBoZXhpZnkgPyBzamNsLmNvZGVjLmhleC5mcm9tQml0cyhoUmVzLmZpbmFsaXplKCkpXG4gICAgICAgICAgICA6IHNqY2wuY29kZWMuYXJyYXlCdWZmZXIuZnJvbUJpdHMoaFJlcy5maW5hbGl6ZSgpKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgIHJlcyk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuXG4gICAgYXN5bmNHZW5lcmF0ZVJTQUtleVBhaXIobmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYXN5bmNHZW5lcmF0ZVJTQUtleVBhaXJcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMjA0OCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgZm9yZ2UucnNhLmdlbmVyYXRlS2V5UGFpcih7Yml0czogbGVuZ3RoLCB3b3JrZXJzOiAtMX0sIChlcnIsIHBhaXIpPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRyeXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB1YktleSA9ICBmb3JnZS5wa2kucHVibGljS2V5VG9QZW0ocGFpci5wdWJsaWNLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByaXZLZXkgPSBmb3JnZS5wa2kucHJpdmF0ZUtleVRvUGVtKHBhaXIucHJpdmF0ZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldChuYW1lVG9TYXZlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljS2V5OiBwdWJLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZUtleTogcHJpdktleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoKGVycil7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBSU0Ega2V5IHBhaXIuXG4gICAgICogS2V5IHNhdmVkIGluIFBFTSBmb3JtYXRcbiAgICAgKiByZXN1bHRpbmcgb2JqZWN0IGhhcyBwdWJsaWNLZXksIHByaXZhdGVLZXksIGtleVR5cGUsIGxlbmd0aFxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogQHBhcmFtIGxlbmd0aFxuICAgICAqIEByZXR1cm5zIHtpQ3J5cHRvfVxuICAgICAqL1xuICAgIGdlbmVyYXRlUlNBS2V5UGFpcihuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJnZW5lcmF0ZVJTQUtleVBhaXJcIiksIGxlbmd0aCA9IDIwNDgpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBwYWlyID0gZm9yZ2UucGtpLnJzYS5nZW5lcmF0ZUtleVBhaXIoe2JpdHM6IGxlbmd0aCwgZTogMHgxMDAwMX0pO1xuICAgICAgICBsZXQgcHViS2V5ID0gIGZvcmdlLnBraS5wdWJsaWNLZXlUb1BlbShwYWlyLnB1YmxpY0tleSk7XG4gICAgICAgIGxldCBwcml2S2V5ID0gZm9yZ2UucGtpLnByaXZhdGVLZXlUb1BlbShwYWlyLnByaXZhdGVLZXkpO1xuXG4gICAgICAgIHNlbGYuc2V0KG5hbWVUb1NhdmUsIHtcbiAgICAgICAgICAgIHB1YmxpY0tleTogcHViS2V5LFxuICAgICAgICAgICAgcHJpdmF0ZUtleTogcHJpdktleSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2VzIHByZXZpb3VzbHkgc2F2ZWQgUlNBIHByaXZhdGUga2V5IGluIFBFTSBmb3JtYXQsXG4gICAgICogZXh0cmFjdHMgaXRzIHB1YmxpYyBrZXlcbiAgICAgKiBhbmQgc2F2ZXMgaXQgaW4gUEVNIGZvcm1hdCB1bmRlciB0aGUgbmFtZSBzcGVjaWZpZWRcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmVcbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICBwdWJsaWNGcm9tUHJpdmF0ZSh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0Zyb21Qcml2YXRlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0Zyb21Qcml2YXRlXCIpKXtcbiAgICAgICAgbGV0IGZvcmdlUHJpdmF0ZUtleSA9IGZvcmdlLnBraS5wcml2YXRlS2V5RnJvbVBlbSh0aGlzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgZm9yZ2UucGtpLnB1YmxpY0tleVRvUGVtKGZvcmdlUHJpdmF0ZUtleSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY2NlcHRzIGFzIGFuIGlucHV0IFJTQSBrZXkgYW5kIHNhdmVzIGl0IGluc2lkZSBhbiBvYmplY3QgdW5kZXIgdGhlIG5hbWUgc3BlY2lmaWVkLlxuICAgICAqIEtleSBtdXN0IGJlIHByb3ZpZGVkIGVpdGhlciBpbiBQRU0gb3IgaW4gcmF3IGJhc2U2NC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlEYXRhOiBwdWJsaWMgb3IgcHJpdmF0ZSBSU0Ega2V5IGVpdGhlciBpbiByYXcgYmFzZTY0IG9yIFBFTSBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZTogbXVzdCBiZSBlaXRoZXIgXCJwdWJsaWNcIiBvciBcInByaXZhdGVcIlxuICAgICAqXG4gICAgICogQHJldHVybnMge2lDcnlwdG99XG4gICAgICovXG4gICAgc2V0UlNBS2V5KG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInNldFJTQVB1YmxpY0tleVwiKSxcbiAgICAgICAgICAgICAga2V5RGF0YSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwic2V0UlNBUHVibGljS2V5XCIpLFxuICAgICAgICAgICAgICB0eXBlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzZXRSU0FQdWJsaWNLZXlcIikpe1xuICAgICAgICBpZiAodHlwZSE9PSBcInB1YmxpY1wiICYmIHR5cGUgIT09IFwicHJpdmF0ZVwiKXtcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCBrZXkgdHlwZVwiXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlDcnlwdG8uaXNSU0FQRU1WYWxpZChrZXlEYXRhLCB0eXBlKSl7XG4gICAgICAgICAgICBrZXlEYXRhID0gaUNyeXB0by5iYXNlNjRUb1BFTShrZXlEYXRhLCB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlID09PSBcInB1YmxpY1wiID8gZm9yZ2UucGtpLnB1YmxpY0tleUZyb21QZW0oa2V5RGF0YSkgOiBmb3JnZS5wa2kucHJpdmF0ZUtleUZyb21QZW0oa2V5RGF0YSk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGtleURhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuIFRha2VzIGtleSBkYXRhIGluIGZvcm0gb2YgYSBzdHJpbmdcbiAgICAgKiBhbmQgY2hlY2tzIHdoZXRoZXIgaXQgbWF0Y2hlcyBSU0EgUEVNIGtleSBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5RGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfXR5cGUgRU5VTSBcInB1YmxpY1wiLCBcInByaXZhdGVcIlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHN0YXRpYyBpc1JTQVBFTVZhbGlkKGtleURhdGEsIHR5cGUpe1xuICAgICAgICBrZXlEYXRhID0ga2V5RGF0YS50cmltKCk7XG4gICAgICAgIGxldCBoZWFkZXJQYXR0ZXJuID0gKHR5cGUgPT09IFwicHVibGljXCIgPyAvXi17NCw1fUJFR0lOLipQVUJMSUMuKktFWS4qLXs0LDV9LyA6IC9eLXs0LDV9QkVHSU4uKlBSSVZBVEUuKktFWS4qLXs0LDV9Lyk7XG4gICAgICAgIGxldCBmb290ZXJQYXR0ZXJuID0gKHR5cGUgPT09IFwicHVibGljXCIgPyAvXi17NCw1fUVORC4qUFVCTElDLipLRVkuKi17NCw1fS8gOiAvXi17NCw1fUVORC4qUFJJVkFURS4qS0VZLiotezQsNX0vKTtcbiAgICAgICAgbGV0IHZhbGlkID0gdHJ1ZTtcbiAgICAgICAga2V5RGF0YSA9IGtleURhdGEucmVwbGFjZSgvXFxyP1xcbiQvLCBcIlwiKTtcbiAgICAgICAgbGV0IGtleURhdGFBcnIgPSBrZXlEYXRhLnNwbGl0KC9cXHI/XFxuLyk7XG4gICAgICAgIHZhbGlkID0gKHZhbGlkICYmXG4gICAgICAgICAgICBrZXlEYXRhQXJyLmxlbmd0aD4yICYmXG4gICAgICAgICAgICBoZWFkZXJQYXR0ZXJuLnRlc3Qoa2V5RGF0YUFyclswXSkgJiZcbiAgICAgICAgICAgIGZvb3RlclBhdHRlcm4udGVzdChrZXlEYXRhQXJyW2tleURhdGFBcnIubGVuZ3RoIC0xXSlcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH1cblxuICAgIHN0YXRpYyBiYXNlNjRUb1BFTShrZXlEYXRhLCB0eXBlKXtcbiAgICAgICAgbGV0IGhlYWRlciA9IHR5cGUgPT09IFwicHVibGljXCIgPyBcIi0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXCIgOiBcIi0tLS0tQkVHSU4gUlNBIFBSSVZBVEUgS0VZLS0tLS1cIjtcbiAgICAgICAgbGV0IGZvb3RlciA9IHR5cGUgPT09IFwicHVibGljXCIgPyBcIi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLVwiIDogXCItLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLVwiO1xuICAgICAgICBsZXQgcmVzdWx0ID0gaGVhZGVyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaTxrZXlEYXRhLmxlbmd0aDsgKytpKXtcbiAgICAgICAgICAgIHJlc3VsdCArPSAoaSU2ND09PTAgPyBcIlxcclxcblwiICsga2V5RGF0YVtpXSA6IGtleURhdGFbaV0pXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IFwiXFxyXFxuXCIgKyBmb290ZXI7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmNQdWJsaWNLZXlFbmNyeXB0KHRhcmdldCwga2V5UGFpciwgbmFtZVRvU2F2ZSwgZW5jb2Rpbmcpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucHVibGljS2V5RW5jcnlwdCh0YXJnZXQsIGtleVBhaXIsIG5hbWVUb1NhdmUpKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogY3JlYXRlcyBhbmQgc2F2ZXMgcHVibGljIGtleSBmaW5nZXJwcmludFxuICAgICAqIEBwYXJhbSB0YXJnZXQgLSBwdWJsaWMga2V5LCBlaXRoZXIga2V5cGFpciBvciBwdWJsaWMga2V5XG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmVcbiAgICAgKiBAcGFyYW0gaGFzaEFsZ29yaXRobVxuICAgICAqIEByZXR1cm5zIHtpQ3J5cHRvfVxuICAgICAqL1xuICAgIGdldFB1YmxpY0tleUZpbmdlcnByaW50KHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZ2V0UHVibGljS2V5RmluZ2VycGludFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gIGlDcnlwdG8ucFJlcXVpcmVkKFwiZ2V0UHVibGljS2V5RmluZ2VycGludFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoQWxnb3JpdGhtID0gXCJzaGEyNTZcIil7XG4gICAgICAgIGxldCBrZXkgPSB0aGlzLnZhbGlkYXRlRXh0cmFjdFJTQUtleSh0aGlzLmdldCh0YXJnZXQpLCBcInB1YmxpY1wiKTtcbiAgICAgICAgbGV0IGZvcmdlS2V5ID0gZm9yZ2UucGtpLnB1YmxpY0tleUZyb21QZW0oa2V5KTtcbiAgICAgICAgbGV0IGZpbmdlcnByaW50ID0gZm9yZ2UucGtpLmdldFB1YmxpY0tleUZpbmdlcnByaW50KGZvcmdlS2V5LCB7ZW5jb2Rpbmc6ICdoZXgnLCBtZDogZm9yZ2UubWRbaGFzaEFsZ29yaXRobV0uY3JlYXRlKCl9KTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgZmluZ2VycHJpbnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWNLZXlFbmNyeXB0KHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHVibGljS2V5RW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgIGtleSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHVibGljS2V5RW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0tleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICBlbmNvZGluZyl7XG4gICAgICAgIGtleSA9IHRoaXMudmFsaWRhdGVFeHRyYWN0UlNBS2V5KHRoaXMuZ2V0KGtleSksIFwicHVibGljXCIpO1xuICAgICAgICBsZXQgcHVibGljS2V5ID0gZm9yZ2UucGtpLnB1YmxpY0tleUZyb21QZW0oa2V5KTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB1YmxpY0tleS5lbmNyeXB0KHRoaXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICBpZiAoZW5jb2Rpbmcpe1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fZW5jb2RlQmxvYihyZXN1bHQsIGVuY29kaW5nKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIHJlc3VsdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvciBpbnRlcm5hbCB1c2UuIEVuY29kZSB0aGUgYmxvYiBpbiBmb3JtYXQgc3BlY2lmaWVkXG4gICAgICogQHBhcmFtIGJsb2JcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9lbmNvZGVCbG9iKGJsb2IgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIl9lbmNvZGVCbG9iXCIpLFxuICAgICAgICAgICAgICAgIGVuY29kaW5nID0gaUNyeXB0by5wUmVxdWlyZWQoXCJfZW5jb2RlQmxvYlwiKSl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLmVuY29kZXJzLmhhc093blByb3BlcnR5KGVuY29kaW5nKSl7XG4gICAgICAgICAgICB0aHJvdyBcIl9lbmNvZGVCbG9iOiBJbnZhbGlkIGVuY29kaW5nOiBcIiArIGVuY29kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWxmLmVuY29kZXJzW2VuY29kaW5nXShibG9iKVxuICAgIH1cblxuICAgIF9kZWNvZGVCbG9iKGJsb2IgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIl9lbmNvZGVCbG9iXCIpLFxuICAgICAgICAgICAgICAgIGVuY29kaW5nID0gaUNyeXB0by5wUmVxdWlyZWQoXCJfZW5jb2RlQmxvYlwiKSl7XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMuZW5jb2RlcnMuaGFzT3duUHJvcGVydHkoZW5jb2RpbmcpKXtcbiAgICAgICAgICAgIHRocm93IFwiX2RlY29kZUJsb2I6IEludmFsaWQgZW5jb2Rpbmc6IFwiICsgZW5jb2Rpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlcnNbZW5jb2RpbmddKGJsb2IpXG4gICAgfVxuXG5cbiAgICBhc3luY1ByaXZhdGVLZXlEZWNyeXB0KHRhcmdldCwga2V5LCBuYW1lVG9TYXZlKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnByaXZhdGVLZXlEZWNyeXB0KHRhcmdldCwga2V5LCBuYW1lVG9TYXZlKSlcbiAgICAgICAgICAgIH1jYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHByaXZhdGVLZXlEZWNyeXB0KHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleURlY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICAga2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwcml2YXRlS2V5RGVjcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwcml2YXRlS2V5RGVjcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZyl7XG5cbiAgICAgICAga2V5ID0gdGhpcy52YWxpZGF0ZUV4dHJhY3RSU0FLZXkodGhpcy5nZXQoa2V5KSwgXCJwcml2YXRlXCIpO1xuICAgICAgICBsZXQgcHJpdmF0ZUtleSA9IGZvcmdlLnBraS5wcml2YXRlS2V5RnJvbVBlbShrZXkpO1xuICAgICAgICBsZXQgY2lwaGVyID0gdGhpcy5nZXQodGFyZ2V0KTtcbiAgICAgICAgaWYgKGVuY29kaW5nKXtcbiAgICAgICAgICAgIGNpcGhlciA9IHRoaXMuX2RlY29kZUJsb2IoY2lwaGVyLCBlbmNvZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgcHJpdmF0ZUtleS5kZWNyeXB0KGNpcGhlcikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIGFzeW5jUHJpdmF0ZUtleVNpZ24odGFyZ2V0LCBrZXlQYWlyLCBuYW1lVG9TYXZlKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnByaXZhdGVLZXlTaWduKHRhcmdldCwga2V5UGFpciwgbmFtZVRvU2F2ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHByaXZhdGVLZXlTaWduKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAga2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwcml2YXRlS2V5RW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwcml2YXRlS2V5RW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICBoYXNoQWxnb3JpdGhtID0gXCJzaGEyNTZcIixcbiAgICAgICAgICAgICAgICAgICBoZXhpZnlTaWduID0gdHJ1ZSl7XG4gICAgICAgIGtleSA9IHRoaXMudmFsaWRhdGVFeHRyYWN0UlNBS2V5KHRoaXMuZ2V0KGtleSksIFwicHJpdmF0ZVwiKTtcbiAgICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IGZvcmdlLnBraS5wcml2YXRlS2V5RnJvbVBlbShrZXkpO1xuICAgICAgICBjb25zdCBtZCA9IGZvcmdlLm1kW2hhc2hBbGdvcml0aG1dLmNyZWF0ZSgpO1xuICAgICAgICBtZC51cGRhdGUodGhpcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgIGxldCBzaWduYXR1cmUgPSBwcml2YXRlS2V5LnNpZ24obWQpO1xuICAgICAgICBzaWduYXR1cmUgPSBoZXhpZnlTaWduID8gZm9yZ2UudXRpbC5ieXRlc1RvSGV4KHNpZ25hdHVyZSkgOiBzaWduYXR1cmU7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIHNpZ25hdHVyZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgYXN5bmNQdWJsaWNLZXlWZXJpZnkodGFyZ2V0LCBzaWduYXR1cmUsIGtleSwgbmFtZVRvU2F2ZSl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5wdWJsaWNLZXlWZXJpZnkodGFyZ2V0LCBzaWduYXR1cmUsIGtleSwgbmFtZVRvU2F2ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHB1YmxpY0tleVZlcmlmeSh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0tleVZlcmlmeVwiKSxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmF0dXJlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNLZXlWZXJpZnlcIiksXG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHVibGljS2V5VmVyaWZ5XCIpLFxuICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNLZXlWZXJpZnlcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlaGV4aWZ5U2lnblJlcXVpcmVkID0gdHJ1ZSl7XG4gICAgICAgIGtleSA9IHRoaXMudmFsaWRhdGVFeHRyYWN0UlNBS2V5KHRoaXMuZ2V0KGtleSksIFwicHVibGljXCIpO1xuICAgICAgICBsZXQgcHVibGljS2V5ID0gZm9yZ2UucGtpLnB1YmxpY0tleUZyb21QZW0oa2V5KTtcbiAgICAgICAgY29uc3QgbWQgPSBmb3JnZS5tZC5zaGEyNTYuY3JlYXRlKCk7XG4gICAgICAgIG1kLnVwZGF0ZSh0aGlzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgbGV0IHNpZ24gPSB0aGlzLmdldChzaWduYXR1cmUpO1xuICAgICAgICBzaWduID0gZGVoZXhpZnlTaWduUmVxdWlyZWQgPyBmb3JnZS51dGlsLmhleFRvQnl0ZXMoc2lnbikgOiBzaWduO1xuICAgICAgICBjb25zdCB2ZXJpZmllZCA9IHB1YmxpY0tleS52ZXJpZnkobWQuZGlnZXN0KCkuYnl0ZXMoKSwgc2lnbik7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIHZlcmlmaWVkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIGFuZCBleHRyYWN0cyBSU0Ega2V5IGZyb20gZWl0aGVyIGtleXBhaXJcbiAgICAgKiBvciBzZXBhcmF0ZSBwcml2YXRlIG9yIHB1YmxpYyBrZXlzIHNhdmVkIHByZXZpb3VzbHkgd2l0aGluIHRoZSBvYmplY3QuXG4gICAgICogQ2hlY2tzIFBFTSBzdHJ1Y3R1cmUgYW5kIHJldHVybnMgcmVxdWVzdGVkIGtleSBpbiBQRU0gZm9ybWF0XG4gICAgICogb3IgdGhyb3dzIGVycm9yIGlmIHNvbWV0aGluZyB3cm9uZ1xuICAgICAqIEBwYXJhbSBrZXkgLSB0YXJnZXQga2V5XG4gICAgICogQHBhcmFtIHR5cGUgLSBcInB1YmxpY1wiIG9yIFwicHJpdmF0ZVwiXG4gICAgICogQHJldHVybiBwdWJsaWMgb3IgcHJpdmF0ZSBrZXkgaW4gUEVNIGZvcm1hdFxuICAgICAqL1xuICAgIHZhbGlkYXRlRXh0cmFjdFJTQUtleShrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInZhbGlkYXRlQW5kRXh0cmFjdFJTQUtleVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAga2V5VHlwZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwidmFsaWRhdGVBbmRFeHRyYWN0UlNBS2V5XCIpKXtcbiAgICAgICAgY29uc3Qga2V5VHlwZXMgPSB7cHVibGljOiBcInB1YmxpY0tleVwiLCBwcml2YXRlOiBcInByaXZhdGVLZXlcIn07XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoa2V5VHlwZXMpLmluY2x1ZGVzKGtleVR5cGUpKVxuICAgICAgICAgICAgdGhyb3cgXCJ2YWxpZGF0ZUV4dHJhY3RSU0FLZXk6IGtleSB0eXBlIGlzIGludmFsaWQhXCI7XG4gICAgICAgIGlmIChrZXlba2V5VHlwZXNba2V5VHlwZV1dKXtcbiAgICAgICAgICAgIGtleSA9IGtleVtrZXlUeXBlc1trZXlUeXBlXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpQ3J5cHRvLmlzUlNBUEVNVmFsaWQoa2V5LCBrZXlUeXBlKSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrZXlUeXBlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICAgICAgICB0aHJvdyBcInZhbGlkYXRlRXh0cmFjdFJTQUtleTogSW52YWxpZCBrZXkgZm9ybWF0XCJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5O1xuICAgIH1cblxuICAgIHBlbVRvQmFzZTY0KHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicGVtVG9CYXNlNjRcIiksXG4gICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicGVtVG9CYXNlNjRcIiksXG4gICAgICAgICAgICAgICAga2V5VHlwZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicGVtVG9CYXNlNjRcIikpe1xuICAgICAgICBsZXQga2V5ID0gdGhpcy5nZXQodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFpQ3J5cHRvLmlzUlNBUEVNVmFsaWQoa2V5LCBrZXlUeXBlKSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrZXlUeXBlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICAgICAgICB0aHJvdyBcInZhbGlkYXRlRXh0cmFjdFJTQUtleTogSW52YWxpZCBrZXkgZm9ybWF0XCJcbiAgICAgICAgfVxuICAgICAgICBrZXkgPSBrZXkudHJpbSgpLnNwbGl0KC9cXHI/XFxuLykuc2xpY2UoMSwgLTEpLmpvaW4oXCJcIik7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGtleSk7XG4gICAgfVxuXG5cbiAgICAvKioqIyMjIyBDT01QUkVTU0lPTiAjIyMjKioqL1xuXG4gICAgYXN5bmNDb21wcmVzcyh0YXJnZXQsIG5hbWVUb1NhdmUpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuY29tcHJlc3ModGFyZ2V0LCBuYW1lVG9TYXZlKSk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHJlc3NlcyBkYXRhIHVuZGVyIGtleSBuYW1lXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqICB0eXBlOiBTdHJpbmdcbiAgICAgKiAgS2V5IHRvIGRhdGEgdGhhdCBuZWVkZWQgdG8gYmUgY29tcHJlc3NlZFxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogIHR5cGU6IFN0cmluZ1xuICAgICAqICBpZiBwYXNzZWQgLSBmdW5jdGlvbiB3aWxsIHNhdmUgdGhlIHJlc3VsdCBvZiBjb21wcmVzc2lvbiB1bmRlciB0aGlzIGtleVxuICAgICAqICBvdGhlcndpc2UgdGhlIGNvbXByZXNzaW9uIHdpbGwgaGFwcGVuIGluLXBsYWNlXG4gICAgICovXG4gICAgY29tcHJlc3ModGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJjb21wcmVzc1wiKSwgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiY29tcHJlc3NcIikpe1xuICAgICAgICBsZXQgY29tcHJlc3NlZCA9IExaTUEuY29tcHJlc3ModGhpcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGNvbXByZXNzZWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3luY0RlY29tcHJlc3ModGFyZ2V0LCBuYW1lVG9TYXZlKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmRlY29tcHJlc3ModGFyZ2V0LCBuYW1lVG9TYXZlKSk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNvbXByZXNzZXMgZGF0YSB1bmRlciBrZXkgbmFtZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiAgdHlwZTogU3RyaW5nXG4gICAgICogIEtleSB0byBkYXRhIHRoYXQgbmVlZGVkIHRvIGJlIGNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqICB0eXBlOiBTdHJpbmdcbiAgICAgKiAgaWYgcGFzc2VkIC0gZnVuY3Rpb24gd2lsbCBzYXZlIHRoZSByZXN1bHQgb2YgY29tcHJlc3Npb24gdW5kZXIgdGhpcyBrZXlcbiAgICAgKiAgb3RoZXJ3aXNlIGRlY29tcHJlc3Npb24gd2lsbCBoYXBwZW4gaW4tcGxhY2VcbiAgICAgKi9cbiAgICBkZWNvbXByZXNzKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZGVjb21wcmVzc1wiKSxcbiAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImRlY29tcHJlc3NcIikpe1xuICAgICAgICBsZXQgZGVjb21wcmVzc2VkID0gTFpNQS5kZWNvbXByZXNzKHRoaXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBkZWNvbXByZXNzZWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIC8qKiojIyMjIFVUSUxTICMjIyMqKiovXG5cbiAgICBlbmNvZGUodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVcIiksXG4gICAgICAgICAgIGVuY29kaW5nID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVcIiksXG4gICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImVuY29kZVwiKSl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zZXQobmFtZVRvU2F2ZSwgc2VsZi5fZW5jb2RlQmxvYih0aGlzLmdldCh0YXJnZXQpLCBlbmNvZGluZykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuXG5cblxuICAgIGJhc2U2NEVuY29kZShuYW1lID0gaUNyeXB0by5wUmVxdWlyZWQoXCJiYXNlNjRFbmNvZGVcIiksXG4gICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImJhc2U2NEVuY29kZVwiKSxcbiAgICAgICAgICAgICAgICAgc3RyaW5naWZ5ID0gZmFsc2Upe1xuICAgICAgICBsZXQgdGFyZ2V0ID0gc3RyaW5naWZ5ID8gSlNPTi5zdHJpbmdpZnkodGhpcy5nZXQobmFtZSkpOiB0aGlzLmdldChuYW1lKVxuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBpQ3J5cHRvLmJhc2U2NEVuY29kZSh0YXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYmFzZTY0RGVjb2RlKG5hbWUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImJhc2U2NGRlY29kZVwiKSxcbiAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYmFzZTY0ZGVjb2RlXCIpLFxuICAgICAgICAgICAgICAgICBqc29uUGFyc2UgPSBmYWxzZSl7XG4gICAgICAgIGxldCBkZWNvZGVkID0gaUNyeXB0by5iYXNlNjREZWNvZGUodGhpcy5nZXQobmFtZSkpO1xuICAgICAgICBkZWNvZGVkID0ganNvblBhcnNlID8gSlNPTi5wYXJzZShkZWNvZGVkKSA6IGRlY29kZWQ7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGRlY29kZWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBiYXNlMzJFbmNvZGUobmFtZSA9IHRoaXMucFJlcXVpcmVkKFwiYmFzZTMyRW5jb2RlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IHRoaXMucFJlcXVpcmVkKFwiYmFzZTMyRW5jb2RlXCIpKXtcbiAgICAgICAgICAgIGxldCBiYXNlMzIgPSBuZXcgQmFzZTMyKCk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlZCA9IGJhc2UzMi5lbmNvZGUodGhpcy5nZXQobmFtZSkpO1xuICAgICAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgZW5jb2RlZCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgYmFzZTMyRGVjb2RlKG5hbWUgPSB0aGlzLnBSZXF1aXJlZChcImJhc2U2NGRlY29kZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSB0aGlzLnBSZXF1aXJlZChcImJhc2U2NGRlY29kZVwiKSl7XG4gICAgICAgICAgICBsZXQgYmFzZTMyID0gbmV3IEJhc2UzMigpO1xuICAgICAgICAgICAgbGV0IGRlY29kZWQgPSBiYXNlMzIuZGVjb2RlKHRoaXMuZ2V0KG5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGRlY29kZWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAvKiovXG4gICAgYnl0ZXNUb0hleChuYW1lID0gaUNyeXB0by5wUmVxdWlyZWQoXCJieXRlc1RvSGV4XCIpLFxuICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYnl0ZXNUb0hleFwiKSxcbiAgICAgICAgICAgICAgIHN0cmluZ2lmeSA9IGZhbHNlKXtcbiAgICAgICAgbGV0IHRhcmdldCA9IHN0cmluZ2lmeSA/IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0KG5hbWUpKTogdGhpcy5nZXQobmFtZSlcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgaUNyeXB0by5oZXhFbmNvZGUodGFyZ2V0KSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGhleFRvQnl0ZXMobmFtZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiaGV4VG9CeXRlc1wiKSxcbiAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImhleFRvQnl0ZXNcIiksXG4gICAgICAgICAgICAgICBqc29uUGFyc2UgPSBmYWxzZSl7XG4gICAgICAgIGxldCBkZWNvZGVkID0gaUNyeXB0by5oZXhEZWNvZGUodGhpcy5nZXQobmFtZSkpO1xuICAgICAgICBkZWNvZGVkID0ganNvblBhcnNlID8gSlNPTi5wYXJzZShkZWNvZGVkKSA6IGRlY29kZWQ7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGRlY29kZWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdHJpbmdpZnlKU09OKG5hbWUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmluZ2lmeVwiKSxcbiAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmluZ2lmeVwiKSl7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKHR5cGVvZih0YXJnZXQpICE9PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgIHRocm93IFwic3RyaW5naWZ5SlNPTjogdGFyZ2V0IGludmFsaWRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIEpTT04uc3RyaW5naWZ5KHRhcmdldCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwYXJzZUpTT04obmFtZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwic3RyaW5naWZ5XCIpLFxuICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJpbmdpZnlcIikpe1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICh0eXBlb2YodGFyZ2V0KSAhPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICB0aHJvdyBcInN0cmluZ2lmeUpTT046IHRhcmdldCBpbnZhbGlkXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgSlNPTi5wYXJzZSh0YXJnZXQpKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXJnZXMgZWxlbWVudHMgaW50byBhIHNpbmdsZSBzdHJpbmdcbiAgICAgKiBpZiBuYW1lIHBhc3NlZCAtIHNhdmVzIHRoZSBtZXJnZSByZXN1bHQgaW5zaWRlIHRoZSBvYmplY3RcbiAgICAgKiB1bmRlciBrZXkgPG5hbWU+LlxuICAgICAqIEBwYXJhbSB0aGluZ3NcbiAgICAgKiAgICAgdHlwZTogYXJyYXlcbiAgICAgKiAgICAgYXJyYXkgb2Ygc3RyaW5ncy4gRWFjaCBzdHJpbmcgaXMgYSBrZXkuXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiAgICAgdHlwZTogc3RyaW5nXG4gICAgICogICAgIG5hbWUgb2YgdGhlIGtleSB1bmRlciB3aGljaCB0byBzYXZlIHRoZSBtZXJnZSByZXN1bHRcbiAgICAgKi9cbiAgICBtZXJnZSh0aGluZ3MgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIm1lcmdlXCIpLCBuYW1lVG9TYXZlICA9IGlDcnlwdG8ucFJlcXVpcmVkKFwibWVyZ2VcIikpe1xuXG4gICAgICAgIGlmICghdGhpcy5rZXlzRXhpc3QodGhpbmdzKSlcbiAgICAgICAgICAgIHRocm93IFwibWVyZ2U6IHNvbWUgb3IgYWxsIG9iamVjdHMgd2l0aCBzdWNoIGtleXMgbm90IGZvdW5kIFwiO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWVyZ2luJyB0aGluZ3NcIik7XG4gICAgICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgICAgICBmb3IgKGxldCBpPSAwOyBpPCB0aGluZ3MubGVuZ3RoOyArK2kpe1xuICAgICAgICAgICAgbGV0IGNhbmRpZGF0ZSA9IHRoaXMuZ2V0KHRoaW5nc1tpXSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIChjYW5kaWRhdGUpID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZihjYW5kaWRhdGUpID09PVwibnVtYmVyXCIgKVxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBjYW5kaWRhdGU7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJPYmplY3QgXCIgKyB0aGluZ3NbaV0gKyBcIiBpcyBub3QgbWVyZ2VhYmxlXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgcmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZW5jb2RlQmxvYkxlbmd0aCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImVuY29kZUJsb2JMZW5ndGhcIiksXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZW5ndGggPSBpQ3J5cHRvLnBSZXF1aXJlZChcImVuY29kZUJsb2JMZW5ndGhcIiksXG4gICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQ2hhciA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZW5jb2RlQmxvYkxlbmd0aFwiKSxcbiAgICAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImVuY29kZUJsb2JMZW5ndGhcIikpe1xuICAgICAgICBpZih0eXBlb2YgKHBhZGRpbmdDaGFyKSAhPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICB0aHJvdyBcImVuY29kZUJsb2JMZW5ndGg6IEludmFsaWQgcGFkZGluZyBjaGFyXCI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGwgPSBTdHJpbmcodGhpcy5nZXQodGFyZ2V0KS5sZW5ndGgpO1xuICAgICAgICBsZXQgcGFkZGluZ0xlbmd0aCA9IHRhcmdldExlbmd0aCAtIGwubGVuZ3RoO1xuICAgICAgICBpZiAocGFkZGluZ0xlbmd0aDwwKXtcbiAgICAgICAgICAgIHRocm93IFwiZW5jb2RlQmxvYkxlbmd0aDogU3RyaW5nIGxlbmd0aCBleGNlZWRlcyB0YXJnZXQgbGVuZ3RoXCI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBhZGRpbmcgPSBwYWRkaW5nQ2hhclswXS5yZXBlYXQocGFkZGluZ0xlbmd0aCk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIChwYWRkaW5nICsgbCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqU0VSVklDRSBGVU5DVElPTlMqKioqKioqKioqKioqKi9cblxuICAgIHN0YXRpYyBhcnJheUJ1ZmZlclRvU3RyaW5nKGJ1Zikge1xuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDE2QXJyYXkoYnVmKSk7XG4gICAgfVxuXG5cbiAgICBzdGF0aWMgc3RyaW5nVG9BcnJheUJ1ZmZlcihzdHIpIHtcbiAgICAgICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcihzdHIubGVuZ3RoICogMik7IC8vIDIgYnl0ZXMgZm9yIGVhY2ggY2hhclxuICAgICAgICB2YXIgYnVmVmlldyA9IG5ldyBVaW50MTZBcnJheShidWYpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgc3RyTGVuID0gc3RyLmxlbmd0aDsgaSA8IHN0ckxlbjsgaSsrKSB7XG4gICAgICAgICAgICBidWZWaWV3W2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUT0RPIG1ha2UgaXQgdW5pdmVyc2FsIGFuZCBmb3IgYXJiaXRyYXJ5IG51bWJlciBvZiBhcnJheXMgICAgICpcbiAgICAgKiBAcGFyYW0gYXJyMVxuICAgICAqIEBwYXJhbSBhcnIyXG4gICAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAgICovXG4gICAgc3RhdGljIGNvbmNhdFVpbnQ4QXJyYXlzKGFycjEsIGFycjIpe1xuICAgICAgICBsZXQgcmVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyMS5ieXRlTGVuZ3RoICsgYXJyMi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmVzLnNldChhcnIxLCAwKTtcbiAgICAgICAgcmVzLnNldChhcnIyLCBhcnIxLmJ5dGVMZW5ndGgpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbmNhdGluYXRlcyAyIGFycmF5IGJ1ZmZlcnMgaW4gb3JkZXIgYnVmZmVyMSArIGJ1ZmZlcjJcbiAgICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXIxXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYnVmZmVyMlxuICAgICAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlckxpa2V9XG4gICAgICovXG4gICAgc3RhdGljIGNvbmNhdEFycmF5QnVmZmVycyAoYnVmZmVyMSwgYnVmZmVyMikge1xuICAgICAgICBsZXQgdG1wID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyMS5ieXRlTGVuZ3RoICsgYnVmZmVyMi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgdG1wLnNldChuZXcgVWludDhBcnJheShidWZmZXIxKSwgMCk7XG4gICAgICAgIHRtcC5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmZmVyMiksIGJ1ZmZlcjEuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHJldHVybiB0bXAuYnVmZmVyO1xuICAgIH07XG5cblxuICAgIHN0YXRpYyBnZXRCeXRlcyhsZW5ndGgpe1xuICAgICAgICByZXR1cm4gZm9yZ2UucmFuZG9tLmdldEJ5dGVzU3luYyhsZW5ndGgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBoZXhFbmNvZGUoYmxvYil7XG4gICAgICAgIHJldHVybiBmb3JnZS51dGlsLmJ5dGVzVG9IZXgoYmxvYik7XG4gICAgfVxuXG4gICAgc3RhdGljIGhleERlY29kZShibG9iKXtcbiAgICAgICAgcmV0dXJuIGZvcmdlLnV0aWwuaGV4VG9CeXRlcyhibG9iKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYmFzZTY0RW5jb2RlKGJsb2Ipe1xuICAgICAgICByZXR1cm4gZm9yZ2UudXRpbC5lbmNvZGU2NChibG9iKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYmFzZTY0RGVjb2RlKGJsb2Ipe1xuICAgICAgICByZXR1cm4gZm9yZ2UudXRpbC5kZWNvZGU2NChibG9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHJhbmRvbSBpbnRlZ2VyXG4gICAgICogQHBhcmFtIGFcbiAgICAgKiBAcGFyYW0gYlxuICAgICAqL1xuICAgIHN0YXRpYyByYW5kSW50KG1pbiwgbWF4KSB7XG4gICAgICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIGFyZ3VtZW50cyB0byBiZSBudW1iZXJzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbiAgICB9O1xuXG4gICAgc3RhdGljIGNyZWF0ZVJhbmRvbUhleFN0cmluZyhsZW5ndGgpe1xuICAgICAgICBsZXQgYnl0ZXMgPSBpQ3J5cHRvLmdldEJ5dGVzKGxlbmd0aCk7XG4gICAgICAgIGxldCBoZXggPSBpQ3J5cHRvLmhleEVuY29kZShieXRlcyk7XG4gICAgICAgIGxldCBvZmZzZXQgPSBpQ3J5cHRvLnJhbmRJbnQoMCwgaGV4Lmxlbmd0aCAtIGxlbmd0aCk7XG4gICAgICAgIHJldHVybiBoZXguc3Vic3RyaW5nKG9mZnNldCwgb2Zmc2V0K2xlbmd0aCk7XG4gICAgfVxuXG4gICAgZ2V0ICAobmFtZSl7XG4gICAgICAgIGlmICh0aGlzLmtleXNFeGlzdChuYW1lKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3JlW25hbWVdO1xuICAgICAgICB0aHJvdyBcIlByb3BlcnR5IFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZFwiXG4gICAgfTtcblxuICAgIHNldCAobmFtZSwgdmFsdWUpe1xuICAgICAgICBpZiAodGhpcy5sb2NrZWQpXG4gICAgICAgICAgICB0aHJvdyBcIkNhbm5vdCBhZGQgcHJvcGVydHk6IG9iamVjdCBsb2NrZWRcIjtcbiAgICAgICAgdGhpcy5hc3NlcnRLZXlzQXZhaWxhYmxlKG5hbWUpO1xuICAgICAgICB0aGlzLnN0b3JlW25hbWVdID0gdmFsdWU7XG4gICAgfTtcblxuICAgIGxvY2soKXtcbiAgICAgICAgdGhpcy5sb2NrZWQgPSB0cnVlO1xuICAgIH07XG5cbiAgICB1bmxvY2soKXtcbiAgICAgICAgdGhpcy5sb2NrZWQgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgYXNzZXJ0S2V5c0F2YWlsYWJsZShrZXlzKXtcbiAgICAgICAgaWYgKHRoaXMua2V5c0V4aXN0KGtleXMpKVxuICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHByb3BlcnR5OiBcIiArIGtleXMudG9TdHJpbmcoKSArIFwiIHByb3BlcnR5IHdpdGggc3VjaCBuYW1lIGFscmVhZHkgZXhpc3RzXCI7XG4gICAgfVxuXG4gICAga2V5c0V4aXN0KGtleXMpe1xuICAgICAgICBpZiAoIWtleXMpXG4gICAgICAgICAgICB0aHJvdyBcImtleXNFeGlzdDogTWlzc2luZyByZXF1aXJlZCBhcmd1bWVudHNcIjtcbiAgICAgICAgaWYodHlwZW9mIChrZXlzKSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Yoa2V5cykgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fa2V5RXhpc3RzKGtleXMpO1xuICAgICAgICBpZih0eXBlb2YgKGtleXMpICE9PSBcIm9iamVjdFwiKVxuICAgICAgICAgICAgdGhyb3cgKFwia2V5c0V4aXN0OiB1bnN1cHBvcnRlZCB0eXBlXCIpO1xuICAgICAgICBpZihrZXlzLmxlbmd0aDwxKVxuICAgICAgICAgICAgdGhyb3cgXCJhcnJheSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGtleVwiO1xuXG4gICAgICAgIGxldCBjdXJyZW50S2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc3RvcmUpO1xuXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTwga2V5cy5sZW5ndGg7ICsraSl7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRLZXlzLmluY2x1ZGVzKGtleXNbaV0udG9TdHJpbmcoKSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIF9rZXlFeGlzdHMoa2V5KXtcbiAgICAgICAgaWYgKCFrZXkpXG4gICAgICAgICAgICB0aHJvdyBcImtleUV4aXN0czogTWlzc2luZyByZXF1aXJlZCBhcmd1bWVudHNcIjtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc3RvcmUpLmluY2x1ZGVzKGtleS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcFJlcXVpcmVkKGZ1bmN0aW9uTmFtZSA9IFwiaUNyeXB0byBmdW5jdGlvblwiKXtcbiAgICAgICAgdGhyb3cgZnVuY3Rpb25OYW1lICsgXCI6IG1pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIVwiXG4gICAgfVxuXG4gICAgdGhyb3dFcnJvcihtZXNzYWdlID0gXCJVbmtub3duIGVycm9yXCIpe1xuICAgICAgICB0aHJvdyBtZXNzYWdlO1xuICAgIH1cbn1cblxuXG4iLCIvKlxuICogW2hpLWJhc2UzMl17QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2VtbjE3OC9oaS1iYXNlMzJ9XG4gKlxuICogQHZlcnNpb24gMC4zLjBcbiAqIEBhdXRob3IgQ2hlbiwgWWktQ3l1YW4gW2VtbjE3OEBnbWFpbC5jb21dXG4gKiBAY29weXJpZ2h0IENoZW4sIFlpLUN5dWFuIDIwMTUtMjAxN1xuICogQGxpY2Vuc2UgTUlUXG4gKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUgKi9cbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgcm9vdCA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDoge307XG4gIHZhciBOT0RFX0pTID0gIXJvb3QuSElfQkFTRTMyX05PX05PREVfSlMgJiYgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuICBpZiAoTk9ERV9KUykge1xuICAgIHJvb3QgPSBnbG9iYWw7XG4gIH1cbiAgdmFyIENPTU1PTl9KUyA9ICFyb290LkhJX0JBU0UzMl9OT19DT01NT05fSlMgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHM7XG4gIHZhciBBTUQgPSB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQ7XG4gIHZhciBCQVNFMzJfRU5DT0RFX0NIQVIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVoyMzQ1NjcnLnNwbGl0KCcnKTtcbiAgdmFyIEJBU0UzMl9ERUNPREVfQ0hBUiA9IHtcbiAgICAnQSc6IDAsICdCJzogMSwgJ0MnOiAyLCAnRCc6IDMsICdFJzogNCwgJ0YnOiA1LCAnRyc6IDYsICdIJzogNywgJ0knOiA4LFxuICAgICdKJzogOSwgJ0snOiAxMCwgJ0wnOiAxMSwgJ00nOiAxMiwgJ04nOiAxMywgJ08nOiAxNCwgJ1AnOiAxNSwgJ1EnOiAxNiwgXG4gICAgJ1InOiAxNywgJ1MnOiAxOCwgJ1QnOiAxOSwgJ1UnOiAyMCwgJ1YnOiAyMSwgJ1cnOiAyMiwgJ1gnOiAyMywgJ1knOiAyNCwgXG4gICAgJ1onOiAyNSwgJzInOiAyNiwgJzMnOiAyNywgJzQnOiAyOCwgJzUnOiAyOSwgJzYnOiAzMCwgJzcnOiAzMVxuICB9O1xuXG4gIHZhciBibG9ja3MgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG5cbiAgdmFyIHRvVXRmOFN0cmluZyA9IGZ1bmN0aW9uIChieXRlcykge1xuICAgIHZhciBzdHIgPSAnJywgbGVuZ3RoID0gYnl0ZXMubGVuZ3RoLCBpID0gMCwgZm9sbG93aW5nQ2hhcnMgPSAwLCBiLCBjO1xuICAgIHdoaWxlIChpIDwgbGVuZ3RoKSB7XG4gICAgICBiID0gYnl0ZXNbaSsrXTtcbiAgICAgIGlmIChiIDw9IDB4N0YpIHtcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChiID4gMHhCRiAmJiBiIDw9IDB4REYpIHtcbiAgICAgICAgYyA9IGIgJiAweDFGO1xuICAgICAgICBmb2xsb3dpbmdDaGFycyA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGIgPD0gMHhFRikge1xuICAgICAgICBjID0gYiAmIDB4MEY7XG4gICAgICAgIGZvbGxvd2luZ0NoYXJzID0gMjtcbiAgICAgIH0gZWxzZSBpZiAoYiA8PSAweEY3KSB7XG4gICAgICAgIGMgPSBiICYgMHgwNztcbiAgICAgICAgZm9sbG93aW5nQ2hhcnMgPSAzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ25vdCBhIFVURi04IHN0cmluZyc7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZm9sbG93aW5nQ2hhcnM7ICsraikge1xuICAgICAgICBiID0gYnl0ZXNbaSsrXTtcbiAgICAgICAgaWYgKGIgPCAweDgwIHx8IGIgPiAweEJGKSB7XG4gICAgICAgICAgdGhyb3cgJ25vdCBhIFVURi04IHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgYyA8PD0gNjtcbiAgICAgICAgYyArPSBiICYgMHgzRjtcbiAgICAgIH1cbiAgICAgIGlmIChjID49IDB4RDgwMCAmJiBjIDw9IDB4REZGRikge1xuICAgICAgICB0aHJvdyAnbm90IGEgVVRGLTggc3RyaW5nJztcbiAgICAgIH1cbiAgICAgIGlmIChjID4gMHgxMEZGRkYpIHtcbiAgICAgICAgdGhyb3cgJ25vdCBhIFVURi04IHN0cmluZyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChjIDw9IDB4RkZGRikge1xuICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGMgLT0gMHgxMDAwMDtcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgPj4gMTApICsgMHhEODAwKTtcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAweDNGRikgKyAweERDMDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHZhciBkZWNvZGVBc0J5dGVzID0gZnVuY3Rpb24gKGJhc2UzMlN0cikge1xuICAgIGJhc2UzMlN0ciA9IGJhc2UzMlN0ci5yZXBsYWNlKC89L2csICcnKTtcbiAgICB2YXIgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCBieXRlcyA9IFtdLCBpbmRleCA9IDAsIGxlbmd0aCA9IGJhc2UzMlN0ci5sZW5ndGg7XG5cbiAgICAvLyA0IGNoYXIgdG8gMyBieXRlc1xuICAgIGZvciAodmFyIGkgPSAwLCBjb3VudCA9IGxlbmd0aCA+PiAzIDw8IDM7IGkgPCBjb3VudDspIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjYgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY3ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2OCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYyIDw8IDYgfCB2MyA8PCAxIHwgdjQgPj4+IDQpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjQgPDwgNCB8IHY1ID4+PiAxKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHY1IDw8IDcgfCB2NiA8PCAyIHwgdjcgPj4+IDMpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjcgPDwgNSB8IHY4KSAmIDI1NTtcbiAgICB9XG5cbiAgICAvLyByZW1haW4gYnl0ZXNcbiAgICB2YXIgcmVtYWluID0gbGVuZ3RoIC0gY291bnQ7XG4gICAgaWYgKHJlbWFpbiA9PT0gMikge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1O1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSA0KSB7XG4gICAgICB2MSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjIgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYzID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYyIDw8IDYgfCB2MyA8PCAxIHwgdjQgPj4+IDQpICYgMjU1O1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSA1KSB7XG4gICAgICB2MSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjIgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYzID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjUgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYxIDw8IDMgfCB2MiA+Pj4gMikgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHY0IDw8IDQgfCB2NSA+Pj4gMSkgJiAyNTU7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDcpIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjYgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY3ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjIgPDwgNiB8IHYzIDw8IDEgfCB2NCA+Pj4gNCkgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2NCA8PCA0IHwgdjUgPj4+IDEpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjUgPDwgNyB8IHY2IDw8IDIgfCB2NyA+Pj4gMykgJiAyNTU7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbiAgfTtcblxuICB2YXIgZW5jb2RlQXNjaWkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIHYxLCB2MiwgdjMsIHY0LCB2NSwgYmFzZTMyU3RyID0gJycsIGxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGNvdW50ID0gcGFyc2VJbnQobGVuZ3RoIC8gNSkgKiA1OyBpIDwgY291bnQ7KSB7XG4gICAgICB2MSA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MiA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MyA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2NCA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2NSA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxIHwgdjQgPj4+IDcpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA+Pj4gMikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0IDw8IDMgfCB2NSA+Pj4gNSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbdjUgJiAzMV07XG4gICAgfVxuXG4gICAgLy8gcmVtYWluIGNoYXJcbiAgICB2YXIgcmVtYWluID0gbGVuZ3RoIC0gY291bnQ7XG4gICAgaWYgKHJlbWFpbiA9PT0gMSkge1xuICAgICAgdjEgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyKSAmIDMxXSArXG4gICAgICAgICc9PT09PT0nO1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSAyKSB7XG4gICAgICB2MSA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MiA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCkgJiAzMV0gK1xuICAgICAgICAnPT09PSc7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDMpIHtcbiAgICAgIHYxID0gc3RyLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIHYyID0gc3RyLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIHYzID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxKSAmIDMxXSArXG4gICAgICAgICc9PT0nO1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSA0KSB7XG4gICAgICB2MSA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MiA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MyA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2NCA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCB8IHYzID4+PiA0KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSB8IHY0ID4+PiA3KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPj4+IDIpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA8PCAzKSAmIDMxXSArXG4gICAgICAgICc9JztcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UzMlN0cjtcbiAgfTtcblxuICB2YXIgZW5jb2RlVXRmOCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgdjEsIHYyLCB2MywgdjQsIHY1LCBjb2RlLCBlbmQgPSBmYWxzZSwgYmFzZTMyU3RyID0gJycsXG4gICAgICBpbmRleCA9IDAsIGksIHN0YXJ0ID0gMCwgYnl0ZXMgPSAwLCBsZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIGRvIHtcbiAgICAgIGJsb2Nrc1swXSA9IGJsb2Nrc1s1XTtcbiAgICAgIGJsb2Nrc1sxXSA9IGJsb2Nrc1s2XTtcbiAgICAgIGJsb2Nrc1syXSA9IGJsb2Nrc1s3XTtcbiAgICAgIGZvciAoaSA9IHN0YXJ0OyBpbmRleCA8IGxlbmd0aCAmJiBpIDwgNTsgKytpbmRleCkge1xuICAgICAgICBjb2RlID0gc3RyLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgICAgICBpZiAoY29kZSA8IDB4ODApIHtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IGNvZGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA8IDB4ODAwKSB7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweGMwIHwgKGNvZGUgPj4gNik7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweDgwIHwgKGNvZGUgJiAweDNmKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlIDwgMHhkODAwIHx8IGNvZGUgPj0gMHhlMDAwKSB7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweGUwIHwgKGNvZGUgPj4gMTIpO1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHg4MCB8ICgoY29kZSA+PiA2KSAmIDB4M2YpO1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHg4MCB8IChjb2RlICYgMHgzZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29kZSA9IDB4MTAwMDAgKyAoKChjb2RlICYgMHgzZmYpIDw8IDEwKSB8IChzdHIuY2hhckNvZGVBdCgrK2luZGV4KSAmIDB4M2ZmKSk7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweGYwIHwgKGNvZGUgPj4gMTgpO1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHg4MCB8ICgoY29kZSA+PiAxMikgJiAweDNmKTtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IDB4ODAgfCAoKGNvZGUgPj4gNikgJiAweDNmKTtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IDB4ODAgfCAoY29kZSAmIDB4M2YpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBieXRlcyArPSBpIC0gc3RhcnQ7XG4gICAgICBzdGFydCA9IGkgLSA1O1xuICAgICAgaWYgKGluZGV4ID09PSBsZW5ndGgpIHtcbiAgICAgICAgKytpbmRleDtcbiAgICAgIH1cbiAgICAgIGlmIChpbmRleCA+IGxlbmd0aCAmJiBpIDwgNikge1xuICAgICAgICBlbmQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdjEgPSBibG9ja3NbMF07XG4gICAgICBpZiAoaSA+IDQpIHtcbiAgICAgICAgdjIgPSBibG9ja3NbMV07XG4gICAgICAgIHYzID0gYmxvY2tzWzJdO1xuICAgICAgICB2NCA9IGJsb2Nrc1szXTtcbiAgICAgICAgdjUgPSBibG9ja3NbNF07XG4gICAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSB8IHY0ID4+PiA3KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA+Pj4gMikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPDwgMyB8IHY1ID4+PiA1KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSW3Y1ICYgMzFdO1xuICAgICAgfSBlbHNlIGlmIChpID09PSAxKSB7XG4gICAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIpICYgMzFdICtcbiAgICAgICAgICAnPT09PT09JztcbiAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMikge1xuICAgICAgICB2MiA9IGJsb2Nrc1sxXTtcbiAgICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCkgJiAzMV0gK1xuICAgICAgICAgICc9PT09JztcbiAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMykge1xuICAgICAgICB2MiA9IGJsb2Nrc1sxXTtcbiAgICAgICAgdjMgPSBibG9ja3NbMl07XG4gICAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSkgJiAzMV0gK1xuICAgICAgICAgICc9PT0nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdjIgPSBibG9ja3NbMV07XG4gICAgICAgIHYzID0gYmxvY2tzWzJdO1xuICAgICAgICB2NCA9IGJsb2Nrc1szXTtcbiAgICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCB8IHYzID4+PiA0KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxIHwgdjQgPj4+IDcpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0ID4+PiAyKSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA8PCAzKSAmIDMxXSArXG4gICAgICAgICAgJz0nO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKCFlbmQpO1xuICAgIHJldHVybiBiYXNlMzJTdHI7XG4gIH07XG5cbiAgdmFyIGVuY29kZUJ5dGVzID0gZnVuY3Rpb24gKGJ5dGVzKSB7XG4gICAgdmFyIHYxLCB2MiwgdjMsIHY0LCB2NSwgYmFzZTMyU3RyID0gJycsIGxlbmd0aCA9IGJ5dGVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgY291bnQgPSBwYXJzZUludChsZW5ndGggLyA1KSAqIDU7IGkgPCBjb3VudDspIHtcbiAgICAgIHYxID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYyID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYzID0gYnl0ZXNbaSsrXTtcbiAgICAgIHY0ID0gYnl0ZXNbaSsrXTtcbiAgICAgIHY1ID0gYnl0ZXNbaSsrXTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYzIDw8IDEgfCB2NCA+Pj4gNykgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0ID4+PiAyKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPDwgMyB8IHY1ID4+PiA1KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlt2NSAmIDMxXTtcbiAgICB9XG5cbiAgICAvLyByZW1haW4gY2hhclxuICAgIHZhciByZW1haW4gPSBsZW5ndGggLSBjb3VudDtcbiAgICBpZiAocmVtYWluID09PSAxKSB7XG4gICAgICB2MSA9IGJ5dGVzW2ldO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIpICYgMzFdICtcbiAgICAgICAgJz09PT09PSc7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDIpIHtcbiAgICAgIHYxID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYyID0gYnl0ZXNbaV07XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0KSAmIDMxXSArXG4gICAgICAgICc9PT09JztcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gMykge1xuICAgICAgdjEgPSBieXRlc1tpKytdO1xuICAgICAgdjIgPSBieXRlc1tpKytdO1xuICAgICAgdjMgPSBieXRlc1tpXTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYzIDw8IDEpICYgMzFdICtcbiAgICAgICAgJz09PSc7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDQpIHtcbiAgICAgIHYxID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYyID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYzID0gYnl0ZXNbaSsrXTtcbiAgICAgIHY0ID0gYnl0ZXNbaV07XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxIHwgdjQgPj4+IDcpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA+Pj4gMikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0IDw8IDMpICYgMzFdICtcbiAgICAgICAgJz0nO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZTMyU3RyO1xuICB9O1xuXG4gIHZhciBlbmNvZGUgPSBmdW5jdGlvbiAoaW5wdXQsIGFzY2lpT25seSkge1xuICAgIHZhciBub3RTdHJpbmcgPSB0eXBlb2YoaW5wdXQpICE9PSAnc3RyaW5nJztcbiAgICBpZiAobm90U3RyaW5nICYmIGlucHV0LmNvbnN0cnVjdG9yID09PSBBcnJheUJ1ZmZlcikge1xuICAgICAgaW5wdXQgPSBuZXcgVWludDhBcnJheShpbnB1dCk7XG4gICAgfVxuICAgIGlmIChub3RTdHJpbmcpIHtcbiAgICAgIHJldHVybiBlbmNvZGVCeXRlcyhpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChhc2NpaU9ubHkpIHtcbiAgICAgIHJldHVybiBlbmNvZGVBc2NpaShpbnB1dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbmNvZGVVdGY4KGlucHV0KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uIChiYXNlMzJTdHIsIGFzY2lpT25seSkge1xuICAgIGlmICghYXNjaWlPbmx5KSB7XG4gICAgICByZXR1cm4gdG9VdGY4U3RyaW5nKGRlY29kZUFzQnl0ZXMoYmFzZTMyU3RyKSk7XG4gICAgfVxuICAgIHZhciB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2NywgdjgsIHN0ciA9ICcnLCBsZW5ndGggPSBiYXNlMzJTdHIuaW5kZXhPZignPScpO1xuICAgIGlmIChsZW5ndGggPT09IC0xKSB7XG4gICAgICBsZW5ndGggPSBiYXNlMzJTdHIubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIDggY2hhciB0byA1IGJ5dGVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGNvdW50ID0gbGVuZ3RoID4+IDMgPDwgMzsgaSA8IGNvdW50Oykge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY1ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjcgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY4ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2NCA8PCA0IHwgdjUgPj4+IDEpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHY1IDw8IDcgfCB2NiA8PCAyIHwgdjcgPj4+IDMpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHY3IDw8IDUgfCB2OCkgJiAyNTUpO1xuICAgIH1cblxuICAgIC8vIHJlbWFpbiBieXRlc1xuICAgIHZhciByZW1haW4gPSBsZW5ndGggLSBjb3VudDtcbiAgICBpZiAocmVtYWluID09PSAyKSB7XG4gICAgICB2MSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjIgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1KTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNCkge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHYyIDw8IDYgfCB2MyA8PCAxIHwgdjQgPj4+IDQpICYgMjU1KTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNSkge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY1ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2NCA8PCA0IHwgdjUgPj4+IDEpICYgMjU1KTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNykge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY1ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjcgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHYyIDw8IDYgfCB2MyA8PCAxIHwgdjQgPj4+IDQpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHY0IDw8IDQgfCB2NSA+Pj4gMSkgJiAyNTUpICtcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSgodjUgPDwgNyB8IHY2IDw8IDIgfCB2NyA+Pj4gMykgJiAyNTUpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHZhciBleHBvcnRzID0ge1xuICAgIGVuY29kZTogZW5jb2RlLFxuICAgIGRlY29kZTogZGVjb2RlXG4gIH07XG4gIGRlY29kZS5hc0J5dGVzID0gZGVjb2RlQXNCeXRlcztcblxuICBpZiAoQ09NTU9OX0pTKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuYmFzZTMyID0gZXhwb3J0cztcbiAgICBpZiAoQU1EKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59KSgpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgbmV3IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbn0gY2F0Y2ggKGUpIHtcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpIGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcbiIsIi8qIGdsb2JhbHMgX193ZWJwYWNrX2FtZF9vcHRpb25zX18gKi9cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX2FtZF9vcHRpb25zX187XG4iXSwic291cmNlUm9vdCI6IiJ9