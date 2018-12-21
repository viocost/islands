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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2xpYi9pQ3J5cHRvLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9saWIvQmFzZTMyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLW9wdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7QUNsRkE7QUFBQTtBQUFhO0FBQ2IsVUFBVSxhQUFhOztBQUV2QjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsQ0FBYTs7OztBQUlwQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUF1Qyx5Q0FBeUM7QUFDaEYsNENBQTRDLDZDQUE2QztBQUN6RixpQ0FBaUMsc0NBQXNDO0FBQ3ZFLGlDQUFpQyx1Q0FBdUM7QUFDeEUsOEJBQThCLG9DQUFvQztBQUNsRSxnQ0FBZ0MscUNBQXFDO0FBQ3JFLGdDQUFnQywrQkFBK0I7QUFDL0QsOEJBQThCO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsa0NBQWtDO0FBQ3JFLGlDQUFpQyxnQ0FBZ0M7QUFDakUsaUNBQWlDLGdDQUFnQztBQUNqRSxnQ0FBZ0MsK0JBQStCO0FBQy9ELDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBLDhCQUE4Qix1Q0FBdUM7QUFDckUsaUNBQWlDLDBDQUEwQztBQUMzRSxpQ0FBaUMsMENBQTBDO0FBQzNFLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOzs7QUFHQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsTUFBTTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsTUFBTTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLDBCQUEwQjtBQUNqRTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBLHFCQUFxQjs7QUFFckI7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxrREFBa0QseUJBQXlCO0FBQzNFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCxJQUFJLHNCQUFzQixJQUFJLFFBQVEsSUFBSSx1QkFBdUIsSUFBSTtBQUMxSCxxREFBcUQsSUFBSSxvQkFBb0IsSUFBSSxRQUFRLElBQUkscUJBQXFCLElBQUk7QUFDdEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQSxTQUFTO0FBQ1Q7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFLHNEQUFzRDtBQUM3SDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixrQkFBa0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQSw0Q0FBNEMsWUFBWTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxZQUFZO0FBQzNCLGVBQWUsWUFBWTtBQUMzQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDN3VDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUE0QixJQUFJLHNCQUFVO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUEscUJBQXFCLG9CQUFvQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZDQUE2QyxXQUFXO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFEQUFxRCxXQUFXO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQix5QkFBeUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxREFBcUQsV0FBVztBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkMsV0FBVztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsTUFBTSxtQ0FBTztBQUNiO0FBQ0EsT0FBTztBQUFBLG9HQUFDO0FBQ1I7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7O0FDamJEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFVBQVU7Ozs7Ozs7QUN2THRDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7OztBQ25CQTtBQUNBIiwiZmlsZSI6ImljcnlwdG8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCIndXNlIHN0cmljdCc7XG4vL2ltcG9ydCB7IEpTQ2hhQ2hhMjAgfSBmcm9tICdqcy1jaGFjaGEyMCdcblxuLy9jb25zdCBsem1hID0gcmVxdWlyZSgnbHptYScpO1xuLy9jb25zdCBmb3JnZSA9IHJlcXVpcmUoJ25vZGUtZm9yZ2UnKTtcbi8vY29uc3Qgc2pjbCA9IHJlcXVpcmUoXCIuL3NqY2wuanNcIik7XG5jb25zdCBCYXNlMzIgPSByZXF1aXJlKFwiLi9CYXNlMzIuanNcIik7XG5cblxuXG5jbGFzcyBpQ3J5cHRvRmFjdG9yeXtcblxuICAgIGNvbnN0cnVjdG9yKHNldHRpbmdzKXtcbiAgICAgICAgdGhpcy5yZWFkU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBjcmVhdGVJQ3J5cHRvcigpe1xuICAgICAgICByZXR1cm4gbmV3IGlDcnlwdG8odGhpcy5zZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmdzKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVhZHViZyBzZXR0aW5nc1wiKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IG51bGw7XG4gICAgfVxufVxuXG5cblxuZXhwb3J0IGNsYXNzIGlDcnlwdG8ge1xuICAgIGNvbnN0cnVjdG9yKHNldHRpbmdzKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNldHRpbmdzID0ge307XG4gICAgICAgIHNlbGYubG9ja2VkID0gZmFsc2U7XG4gICAgICAgIHNlbGYuc2V0RW5jb2RlcnNBbmREZWNvZGVycygpO1xuICAgICAgICBzZWxmLnN5bUNpcGhlcnMgPSBbJ2FlcyddO1xuICAgICAgICBzZWxmLnN0cmVhbUNpcGhlcnMgPSBbJ2NoYWNoYSddO1xuICAgICAgICBzZWxmLmFzeW1DaXBoZXJzID0gWydyc2EnXTtcbiAgICAgICAgc2VsZi5zdG9yZSA9IHt9XG5cbiAgICAgICAgc2VsZi5yc2EgPSB7XG4gICAgICAgICAgICBjcmVhdGVLZXlQYWlyOiAoLi4uYXJncyk9PnsgcmV0dXJuIHNlbGYuZ2VuZXJhdGVSU0FLZXlQYWlyKC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIGFzeW5jQ3JlYXRlS2V5UGFpcjogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuYXN5bmNHZW5lcmF0ZVJTQUtleVBhaXIoLi4uYXJncyl9LFxuICAgICAgICAgICAgZW5jcnlwdDogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYucHVibGljS2V5RW5jcnlwdCguLi5hcmdzKX0sXG4gICAgICAgICAgICBkZWNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5wcml2YXRlS2V5RGVjcnlwdCguLi5hcmdzKX0sXG4gICAgICAgICAgICBzaWduOiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5wcml2YXRlS2V5U2lnbiguLi5hcmdzKX0sXG4gICAgICAgICAgICB2ZXJpZnk6ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLnB1YmxpY0tleVZlcmlmeSguLi5hcmdzKX0sXG4gICAgICAgICAgICBzZXRLZXk6ICguLi5hcmdzKT0+e3JldHVybiBzZWxmLnNldFJTQUtleSguLi5hcmdzKX0sXG4gICAgICAgICAgICBnZXRTZXR0aW5nczogKCk9PntyZXR1cm4gXCJSU0FcIn1cbiAgICAgICAgfTtcblxuICAgICAgICBzZWxmLmFlcyA9IHtcbiAgICAgICAgICAgIG1vZGVzOiBbJ0NCQycsICdDRkInLCAnQ1RSJ10sXG4gICAgICAgICAgICBtb2RlOiAnQ0JDJyxcbiAgICAgICAgICAgIGl2TGVuZ3RoOiAxNixcbiAgICAgICAgICAgIGtleVNpemU6IDMyLFxuICAgICAgICAgICAgY3JlYXRlS2V5OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5jcmVhdGVTWU1LZXkoLi4uYXJncyl9LFxuICAgICAgICAgICAgZW5jcnlwdDogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuQUVTRW5jcnlwdCguLi5hcmdzKX0sXG4gICAgICAgICAgICBkZWNyeXB0OiAoLi4uYXJncyk9PntyZXR1cm4gc2VsZi5BRVNEZWNyeXB0KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIHNldEtleTogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuc2V0U1lNS2V5KC4uLmFyZ3MpfSxcbiAgICAgICAgICAgIGdldFNldHRpbmdzOiAoKT0+e3JldHVybiBcIkFFU1wifVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlbGYuY2hhY2hhID0ge1xuICAgICAgICAgICAgaW5pdDogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuaW5pdFN0cmVhbUNyeXB0b3IoLi4uYXJncyl9LFxuICAgICAgICAgICAgZW5jcnlwdDogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuc3RyZWFtQ3J5cHRvckVuY3J5cHQoLi4uYXJncyl9LFxuICAgICAgICAgICAgZGVjcnlwdDogKC4uLmFyZ3MpPT57cmV0dXJuIHNlbGYuc3RyZWFtQ3J5cHRvckRlY3J5cHQoLi4uYXJncyl9LFxuICAgICAgICAgICAgZ2V0U2V0dGluZ3M6ICgpPT57cmV0dXJuIFwiQ2hhQ2hhXCJ9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2VsZi5zZXRBc3ltQ2lwaGVyKCdyc2EnKTtcbiAgICAgICAgc2VsZi5zZXRTeW1DaXBoZXIoJ2FlcycpO1xuICAgICAgICBzZWxmLnNldFN0cmVhbUNpcGhlcignY2hhY2hhJyk7XG5cblxuICAgIH1cblxuXG4gICAgLyoqKioqKioqKioqKioqKioqIFNFVFRJTkcgQ0lQSEVSUyBBUEkgKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgc2V0U3ltQ2lwaGVyKC4uLm9wdHMpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5zeW1DaXBoZXJzLmluY2x1ZGVzKG9wdHNbMF0pKXtcbiAgICAgICAgICAgIHRocm93IFwic2V0U3ltQ2lwaGVyOiBJbnZhbGlkIG9yIHVuc3VwcG9ydGVkIGFsZ29yaXRobVwiXG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zeW0gPSBzZWxmW29wdHNbMF1dXG4gICAgfVxuXG4gICAgc2V0QXN5bUNpcGhlciguLi5vcHRzKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuYXN5bUNpcGhlcnMuaW5jbHVkZXMob3B0c1swXSkpe1xuICAgICAgICAgICAgdGhyb3cgXCJzZXRTeW1DaXBoZXI6IEludmFsaWQgb3IgdW5zdXBwb3J0ZWQgYWxnb3JpdGhtXCJcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmFzeW0gPSBzZWxmW29wdHNbMF1dXG4gICAgfVxuXG4gICAgc2V0U3RyZWFtQ2lwaGVyKC4uLm9wdHMpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5zdHJlYW1DaXBoZXJzLmluY2x1ZGVzKG9wdHNbMF0pKXtcbiAgICAgICAgICAgIHRocm93IFwic2V0U3ltQ2lwaGVyOiBJbnZhbGlkIG9yIHVuc3VwcG9ydGVkIGFsZ29yaXRobVwiXG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zc3ltID0gc2VsZltvcHRzWzBdXVxuICAgIH1cblxuXG5cbiAgICAvKioqKioqKioqKioqKioqKiogRU5EICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIHNldEVuY29kZXJzQW5kRGVjb2RlcnMoKXtcbiAgICAgICAgdGhpcy5lbmNvZGVycyA9IHtcbiAgICAgICAgICAgIGhleDogaUNyeXB0by5oZXhFbmNvZGUsXG4gICAgICAgICAgICBiYXNlNjQ6IGlDcnlwdG8uYmFzZTY0RW5jb2RlXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZWNvZGVycyA9IHtcbiAgICAgICAgICAgIGhleDogaUNyeXB0by5oZXhEZWNvZGUsXG4gICAgICAgICAgICBiYXNlNjQ6IGlDcnlwdG8uYmFzZTY0RGVjb2RlXG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqTUFJTiBNRVRIT0RTKioqKioqKioqKioqKiovXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKiQkKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqKiMjIyNOT05DRVMgUExBSU4gVEVYVCMjIyMqKiovXG5cbiAgICBhc3luY0NyZWF0ZU5vbmNlKG5hbWVUb1NhdmUsIGxlbmd0aD0zMil7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5jcmVhdGVOb25jZShuYW1lVG9TYXZlLCBsZW5ndGgpKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbm9uY2Ugb2YgdGhlIGdpdmVuIGxlbmd0aCBhbmRcbiAgICAgKiBzYXZlcyBpdCB1bmRlciB0aGUgcHJvdmlkZWQgbmFtZS5cbiAgICAgKiBEZWZhdWx0IGlzIDMyIGJ5dGVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGhcbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICBjcmVhdGVOb25jZShuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJjcmVhdGVOb25jZVwiKSwgbGVuZ3RoPTMyKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBpQ3J5cHRvLmdldEJ5dGVzKGxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuXG5cbiAgICBhc3luY0FkZEJsb2IobmFtZVRvU2F2ZSwgcGxhaW5UZXh0KXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmFkZEJsb2IobmFtZVRvU2F2ZSwgcGxhaW5UZXh0KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGFkZEJsb2IobmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYWRkQmxvYlwiKSwgcGxhaW5UZXh0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJhZGRCbG9iXCIpKXtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgcGxhaW5UZXh0LnRvU3RyaW5nKCkudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqJCQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKioqIyMjIyBLRVlTIENSWVBUTyAjIyMjKioqL1xuXG4gICAgYXN5bmNDcmVhdGVTWU1LZXkobmFtZVRvU2F2ZSwgaXZMZW5ndGg9MTYsIGtleUxlbmd0aD0zMil7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5jcmVhdGVTWU1LZXkobmFtZVRvU2F2ZSwgaXZMZW5ndGgsIGtleUxlbmd0aCkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBoZXgtZW5jb2RlZCBTWU0ga2V5LCB3aGljaCBpcyBqdXN0IHNvbWUgcmFuZG9tIGhleC1lbmNvZGVkIGJ5dGVzXG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmVcbiAgICAgKiBAcGFyYW0ga2V5TGVuZ3RoXG4gICAgICogQHJldHVybnMge2lDcnlwdG99XG4gICAgICovXG4gICAgY3JlYXRlU1lNS2V5KG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImNyZWF0ZVNZTUtleVwiKSwga2V5TGVuZ3RoPTMyKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQga2V5ID0gaUNyeXB0by5nZXRCeXRlcyhrZXlMZW5ndGgpO1xuICAgICAgICBzZWxmLnNldChuYW1lVG9TYXZlLCBmb3JnZS51dGlsLmJ5dGVzVG9IZXgoa2V5KSk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgcGFzc2VkIFNZTSBrZXkgaW5zaWRlIHRoZSBvYmplY3RcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgTXVzdCBiZSBoZXhpZmllZCBzdHJpbmdcbiAgICAgKi9cbiAgICBzZXRTWU1LZXkobmFtZVRvU2F2ZSA9ICBpQ3J5cHRvLnBSZXF1aXJlZChcInNldFNZTUtleVwiKSxcbiAgICAgICAgICAgICAga2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzZXRTWU1LZXlcIikpe1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBrZXkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXF1aXJlcyBvYmplY3Qgb2Ygc2ltaWxhciBzdHJ1Y3R1cmUgZm9yIGtleSBhcyBiZWluZyBjcmVhdGVkIGJ5IGNyZWF0ZVNZTUtleVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBhc3luY0FFU0VuY3J5cHQodGFyZ2V0LCBrZXksIG5hbWVUb1NhdmUsIGhleGlmeSwgbW9kZSwgZW5jb2RpbmcgKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLkFFU0VuY3J5cHQodGFyZ2V0LCBrZXksIG5hbWVUb1NhdmUsIGhleGlmeSwgbW9kZSwgZW5jb2RpbmcpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5jcnlwdHMgYmxvYiBpZGVudGlmaWVkIGJ5IFwidGFyZ2V0XCIgcGFyYW1ldGVyLlxuICAgICAqIFRhcmdldCBtdXN0IGJlIHNldCBpbnNpZGUgaUNyeXB0byBvYmplY3RcbiAgICAgKiBJViBpcyByYW5kb21seSBnZW5lcmF0ZWQgYW5kIGFwcGVuZGVkIHRvIHRoZSBjaXBoZXIgYmxvYlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVUb1NhdmVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhleGlmeSAtIFNwZWNpZmllcyB0aGUgZW5jb2Rpbmcgb2YgdGhlIHJlc3VsdGluZyBjaXBoZXIuIERlZmF1bHQ6IGhleC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZSAtIHNwZWNpZmllcyBBRVMgbW9kZS4gRGVmYXVsdCAtIENCQ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpdkxlbmd0aCAtIHNwZWNpZmllcyBsZW5ndGggb2YgaW5pdGlhbGl6YXRpb24gdmVjdG9yXG4gICAgICogIFRoZSBpbml0aWFsaXphdGlvbiB2ZWN0b3Igb2Ygc3BlY2lmaWVkIGxlbmd0aCB3aWxsIGJlIGdlbmVyYXRlZCBhbmRcbiAgICAgKiAgYXBwZW5kZWQgdG8gdGhlIGVuZCBvZiByZXN1bHRpbmcgY2lwaGVyLiBJViBibG9iIHdpbGwgYmUgZW5jb2RlZCBhY2NvcmRpbmcgdG9cbiAgICAgKiAgb3V0cHV0RW5jb2RpbmcgcGFyYW1ldGVyLCBhbmQgaXRzIGxlbmd0aCB3aWxsIGJlIGxhc3QgMyBieXRlcyBvZiB0aGUgY2lwaGVyIHN0cmluZy5cbiAgICAgKlxuICAgICAqL1xuICAgIEFFU0VuY3J5cHQodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAga2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiQUVTRW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgIGhleGlmeSA9IHRydWUsXG4gICAgICAgICAgICAgICBtb2RlID0gJ0NCQycsXG4gICAgICAgICAgICAgICBlbmNvZGluZyl7XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZighc2VsZi5hZXMubW9kZXMuaW5jbHVkZXMobW9kZS50b1VwcGVyQ2FzZSgpKSl7XG4gICAgICAgICAgICB0aHJvdyBcIkFFU2VuY3J5cHQ6IEludmFsaWQgQUVTIG1vZGVcIjtcbiAgICAgICAgfVxuICAgICAgICBtb2RlID0gXCJBRVMtXCIgKyBtb2RlLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIC8vQ3JlYXRpbmcgcmFuZG9tIDE2IGJ5dGVzIElWXG4gICAgICAgIGNvbnN0IGl2ID0gaUNyeXB0by5nZXRCeXRlcygxNik7XG4gICAgICAgIGxldCBBRVNrZXkgPSBmb3JnZS51dGlsLmhleFRvQnl0ZXMoc2VsZi5nZXQoa2V5KSk7XG4gICAgICAgIGNvbnN0IGNpcGhlciA9IGZvcmdlLmNpcGhlci5jcmVhdGVDaXBoZXIobW9kZSwgQUVTa2V5KTtcbiAgICAgICAgY2lwaGVyLnN0YXJ0KHtpdjppdn0pO1xuICAgICAgICBjaXBoZXIudXBkYXRlKGZvcmdlLnV0aWwuY3JlYXRlQnVmZmVyKHRoaXMuZ2V0KHRhcmdldCksIGVuY29kaW5nKSk7XG4gICAgICAgIGNpcGhlci5maW5pc2goKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgKGhleGlmeSA/IGZvcmdlLnV0aWwuYnl0ZXNUb0hleChpdikgKyBjaXBoZXIub3V0cHV0LnRvSGV4KCk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdiArIGNpcGhlci5vdXRwdXQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBhc3luY0FFU0RlY3J5cHQodGFyZ2V0LCBrZXksIG5hbWVUb1NhdmUpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuQUVTRGVjcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNyeXB0cyB0aGUgYmxvYiBsb2FkZWQgaW50byBpQ3J5cHRvIG9iamVjdCBhbmQgc3BlY2lmaWVkIGJ5IHRhcmdlIHBhcmFtZXRlclxuICAgICAqIEFzc3VtZXMgdGhhdCBpbml0aWFsaXphdGlvbiB2ZWN0b3IgaXMgUFJFUEVOREVEIHRvIHRoZSBjaXBoZXIgdGV4dFxuICAgICAqIGFuZCBpdHMgbGVuZ3RoIGlzIDE2IGJ5dGVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0IC0gY2lwaGVydGV4dCB3aXRoaW4gaUNyeXB0byBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gU3ltbWV0cmljIEFFUyBrZXkgaW4gZm9ybSBvZiBoZXggc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVUb1NhdmVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRlaGV4aWZ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGUgQUVTIG1vZGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW5jb2RpbmcgLSByZXN1bHRpbmcgcGxhaW4gdGV4dCBlbmNvZGluZyBkZWZhdWx0IChVVEY4KVxuICAgICAqL1xuICAgIEFFU0RlY3J5cHQodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNEZWNyeXB0XCIpLFxuICAgICAgICAgICAgICAga2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJBRVNEZWNyeXB0XCIpLFxuICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiQUVTRGVjcnlwdFwiKSxcbiAgICAgICAgICAgICAgIGRlaGV4aWZ5ID0gZmFsc2UsXG4gICAgICAgICAgICAgICBtb2RlID0gXCJDQkNcIixcbiAgICAgICAgICAgICAgIGVuY29kaW5nKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgY2lwaGVyV09JVjtcbiAgICAgICAgaWYoIXNlbGYuYWVzLm1vZGVzLmluY2x1ZGVzKG1vZGUudG9VcHBlckNhc2UoKSkpe1xuICAgICAgICAgICAgdGhyb3cgXCJBRVNlbmNyeXB0OiBJbnZhbGlkIEFFUyBtb2RlXCI7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZSA9IFwiQUVTLVwiICsgbW9kZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBsZXQgY2lwaGVyID0gc2VsZi5nZXQodGFyZ2V0KTtcbiAgICAgICAgbGV0IGl2O1xuICAgICAgICBpZihkZWhleGlmeSl7XG4gICAgICAgICAgICBpdiA9IGZvcmdlLnV0aWwuaGV4VG9CeXRlcyhjaXBoZXIuc3Vic3RyaW5nKDAsIDMyKSk7XG4gICAgICAgICAgICBjaXBoZXJXT0lWID0gZm9yZ2UudXRpbC5oZXhUb0J5dGVzKGNpcGhlci5zdWJzdHIoMzIpKTtcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgLy9Bc3N1bWluZyBjaXBoZXIgaXMgYSBiaW5hcnkgc3RyaW5nXG4gICAgICAgICAgICBjaXBoZXJXT0lWID0gY2lwaGVyLnN1YnN0cigxNik7XG4gICAgICAgICAgICBpdiA9IGNpcGhlci5zdWJzdHJpbmcoMCwgMTYpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IEFFU2tleSA9IGZvcmdlLnV0aWwuaGV4VG9CeXRlcyh0aGlzLmdldChrZXkpKTtcbiAgICAgICAgbGV0IGRlY2lwaGVyID0gZm9yZ2UuY2lwaGVyLmNyZWF0ZURlY2lwaGVyKG1vZGUsIEFFU2tleSk7XG4gICAgICAgIGRlY2lwaGVyLnN0YXJ0KHtpdjppdn0pO1xuICAgICAgICBkZWNpcGhlci51cGRhdGUoZm9yZ2UudXRpbC5jcmVhdGVCdWZmZXIoY2lwaGVyV09JVikpO1xuICAgICAgICBkZWNpcGhlci5maW5pc2goKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgZGVjaXBoZXIub3V0cHV0LnRvU3RyaW5nKCd1dGY4JykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3luY0hhc2godGFyZ2V0LCBuYW1lVG9TYXZlLCBhbGdvcml0aG0gPSBcInNoYTI1NlwiKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmhhc2godGFyZ2V0LCBuYW1lVG9TYXZlLCBhbGdvcml0aG0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBtZWFudCB0byBiZSB1c2VkIG9uIGxhcmdlIGZpbGVzXG4gICAgICogSXQgaXMgYXN5bmNocm9ub3VzLCB1c2VzIHdlYiB3b3JrZXJzLFxuICAgICAqIGFuZCBpdCBjYWxjdWxhdGVzIGhhc2ggb2YgYSBsYXJnZSBmaWxlIHdpdGhvdXQgbG9hZGluZyBpdFxuICAgICAqIGZ1bGx5IGludG8gbWVtb3J5XG4gICAgICogQHBhcmFtIGZpbGUgIC0gIHZhbHVlIG9mIGFuIGlucHV0IG9mIHR5cGUgZmlsZVxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlIC0gbmFtZSB0byBzdG9yZSByZXN1bHRpbmcgaGFzaFxuICAgICAqIEBwYXJhbSBhbGdvcml0aG0gLSBzaGEyNTYgaXMgZGVmYXVsdFxuICAgICAqL1xuICAgIGhhc2hGaWxlV29ya2VyKGZpbGUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImZpbGVIYXNoV29ya2VyIGZpbGVcIiksXG4gICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZmlsZUhhc2hXb3JrZXIgbmFtZVRvU2F2ZVwiKSxcbiAgICAgICAgICAgICAgICAgICBhbGdvcml0aG0gPSBcInNoYTI1NlwiKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBpZihXb3JrZXIgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJXZWIgd29ya2VycyBhcmUgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgd29ya2VyID0gbmV3IFdvcmtlcihcIi9qcy9pQ3J5cHRvV29ya2VyLmpzXCIpO1xuICAgICAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IChldikgPT57XG4gICAgICAgICAgICAgICAgaWYgKGV2LmRhdGFbMF0gPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXQobmFtZVRvU2F2ZSwgZXYuZGF0YVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChldi5kYXRhWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoW1wiaGFzaEZpbGVcIiwgZmlsZV0pO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHN0cmVhbSBlbmNyeXB0b3Igb3IgZGVjcnlwdG9yXG4gICAgICpcbiAgICAgKiBTdXBwb3J0ZWQgYWxnb3JpdGhtIGlzIGNoYWNoYTIwIG9ubHlcbiAgICAgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgYSBzaW5nbGUgc3RyZWFtIGNyeXB0b3IgY2FuIGJlIHVzZWRcbiAgICAgKiBvbmx5IG9uZSB0aW1lLCBvbmUgd2F5LCBhbmQgb25seSBmb3IgYSBzaW5nbGUgc3RyZWFtLlxuICAgICAqIE1lYW5pbmcgeW91IGNhbiB0YWtlIGEgc2luZ2xlIHN0cmVhbSBhbmQgZW5jcnlwdCBpdCBjaHVuayBieSBjaHVuayxcbiAgICAgKiBidXQgdGhlbiwgaWYgeW91IHdhbnQgdG8gZGVjcnlwdCB0aGUgc3RyZWFtLCAgeW91IGhhdmUgdG9cbiAgICAgKiByZS1pbml0aWFsaXplIGNyeXB0b3IgaW5zdGFuY2Ugb3IgdXNlIGEgbmV3IG9uZSxcbiAgICAgKiBvdGhlcndpc2UgdGhlIG91dHB1dCB3aWxsIGJlIG1lYW5pbmdsZXNzLlxuICAgICAqXG4gICAgICogQWxsIHRoZSBjaHVua3MgbXVzdCBmbG93IGluIHNlcXVlbmNlLlxuICAgICAqXG4gICAgICogISEhSW1wb3J0YW50XG4gICAgICpcbiAgICAgKiBFbmNyeXB0aW9uOlxuICAgICAqIFN0cmVhbSBjcnlwdG9yIGhhbmRsZXMgaW5pdGlhbGl6YXRpb24gdmVjdG9yIChpdilcbiAgICAgKiBieSBwcmVwZW5kaW5nIHRoZW0gdG8gY2lwaGVyLiBTbywgdG8gZW5jcnlwdCB0aGUgZGF0YSAtXG4gICAgICoganVzdCBwYXNzIHRoZSBrZXkgYW5kIG5ldyBpdiB3aWxsIGJlIGNyZWF0ZWQgYXV0b21hdGljYWxseVxuICAgICAqIGFuZCBwcmVwZW5kZWQgdG8gdGhlIGNpcGhlclxuICAgICAqXG4gICAgICogRGVjcnlwdGlvbjpcbiAgICAgKiBPbiBEZWNyeXB0aW9uIHRoZSBhbGdvcml0aG0gQVNTVU1FUyB0aGF0IGZpcnN0IDYgYnl0ZXMgb2ZcbiAgICAgKiB0aGUgY2lwaGVydGV4dCBpcyBpdi5cbiAgICAgKiBTbywgaXQgd2lsbCB0cmVhdCBmaXJzdCA2IGJ5dGVzIGFzIGl2IHJlZ2FyZGxlcyBvZiBjaHVua3MsXG4gICAgICogYW5kIHdpbGwgYmVnaW4gZGVjcnlwdGlvbiBzdGFydGluZyBmcm9tIGJ5dGUgN1xuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVUb1NhdmUgLSBTdHJlYW0gY3J5cHRvciB3aWxsIGJlIHNhdmVkIGluc2lkZSBpQ3J5cHRvIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBTdHJpbmcgb2YgYnl0ZXMgaW4gaGV4IC0gU3ltbWV0cmljIGtleSB1c2VkIHRvIGVuY3J5cHQvZGVjcnlwdCBkYXRhXG4gICAgICogIFRoZSBhbGdvcml0aG0gcmVxdWlyZXMga2V5IHRvIGJlIDMyIGJ5dGVzIHByZWNpc2VseVxuICAgICAgICBPbmx5IGZpcnN0IDMyIGJ5dGVzIChhZnRlciBkZWNvZGluZyBoZXgpIHdpbGwgYmUgdGFrZW5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzRW5jcnlwdGlvbk1vZGUgLSBmbGFnIGVuY3J5cHRpb24gbW9kZSAtIHRydWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWxnb3JpdGhtIFN1cHBvcnRzIG9ubHkgY2hhY2hhMjAgZm9yIG5vd1xuICAgICAqL1xuICAgIGluaXRTdHJlYW1DcnlwdG9yKG5hbWVUb1NhdmUgPWlDcnlwdG8ucFJlcXVpcmVkKFwiaW5pdFN0cmVhbUVuY3J5cHRvclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImluaXRTdHJlYW1FbmNyeXB0b3JcIiksXG4gICAgICAgICAgICAgICAgICAgICAgaXNFbmNyeXB0aW9uTW9kZSA9IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgYWxnb3JpdGhtID0gXCJjaGFjaGEyMFwiKXtcbiAgICAgICAgbGV0IHNlbGYgID0gdGhpcztcbiAgICAgICAgbGV0IGl2UmF3LCBpdkhleCwga2V5UmF3LCBjcnlwdG9yLCBpdkJ1ZmZlcjtcbiAgICAgICAgbGV0IG1vZGUgPSBcImVuY1wiO1xuXG4gICAgICAgIGtleVJhdyA9IGlDcnlwdG8uaGV4RGVjb2RlKGtleSk7XG4gICAgICAgIGlmIChrZXlSYXcubGVuZ3RoIDwgMTYpe1xuICAgICAgICAgICAgdGhyb3cgXCJjaGFjaGEyMDogaW52YWxpZCBrZXkgc2l6ZTogXCIgKyBrZXlSYXcubGVuZ3RoICsgXCIga2V5IGxlbmd0aCBtdXN0IGJlIDMyIGJ5dGVzXCI7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQga2V5QnVmZmVyID0gaUNyeXB0by5zdHJpbmdUb0FycmF5QnVmZmVyKGtleVJhdykuc2xpY2UoMCwgMzIpO1xuXG5cbiAgICAgICAgaWYgKGlzRW5jcnlwdGlvbk1vZGUpe1xuICAgICAgICAgICAgaXZSYXcgPSBpQ3J5cHRvLmdldEJ5dGVzKDYpXG4gICAgICAgICAgICBpdkhleCA9IGlDcnlwdG8uaGV4RW5jb2RlKGl2UmF3KTtcbiAgICAgICAgICAgIGl2QnVmZmVyID0gaUNyeXB0by5zdHJpbmdUb0FycmF5QnVmZmVyKGl2UmF3KS5zbGljZSgwLCAxMik7XG4gICAgICAgICAgICBjcnlwdG9yID0gbmV3IEpTQ2hhQ2hhMjAobmV3IFVpbnQ4QXJyYXkoa2V5QnVmZmVyKSwgbmV3IFVpbnQ4QXJyYXkoaXZCdWZmZXIpLCAwKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9kZSA9IFwiZGVjXCI7XG4gICAgICAgICAgICBpdkJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcigwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXMgPSBuZXcgZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBzZWxmLmNyeXB0b3I9IGNyeXB0b3I7XG4gICAgICAgICAgICBzZWxmLmtleSA9ICBrZXk7XG4gICAgICAgICAgICBzZWxmLml2ID0gaXZIZXg7XG4gICAgICAgICAgICBzZWxmLm1vZGUgPSBtb2RlO1xuICAgICAgICAgICAgc2VsZi5lbmNyeXB0aW9uTW9kZSA9ICAoKT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLm1vZGUgPT09IFwiZW5jXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmRlY3J5cHRpb25Nb2RlID0gKCk9PntcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5tb2RlID09PSBcImRlY1wiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5lbmNyeXB0ID0gKGlucHV0KT0+e1xuICAgICAgICAgICAgICAgIGxldCBibG9iID0gKHR5cGVvZihpbnB1dCkgPT09IFwic3RyaW5nXCIpID8gaUNyeXB0by5zdHJpbmdUb0FycmF5QnVmZmVyKGlucHV0KSA6IGlucHV0O1xuICAgICAgICAgICAgICAgIGlmICghKGJsb2IgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgJiYgIShibG9iIGluc3RhbmNlb2YgVWludDhBcnJheSkpe1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlN0cmVhbUNyeXB0b3IgZW5jcnlwdDogaW5wdXQgdHlwZSBpcyBpbnZhbGlkXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmNyeXB0b3IuX2J5dGVDb3VudGVyID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgLy9GaXJzdCBjaGVjayBpZiBjb3VudGVyIGlzIDAuXG4gICAgICAgICAgICAgICAgICAgIC8vSWYgc28gLSBpdCBpcyBhIGZpcnN0IGVuY3J5cHRpb24gYmxvY2sgYW5kIHdlIG5lZWQgdG8gcHJlcGVuZCBJVlxuICAgICAgICAgICAgICAgICAgICBsZXQgZW5jcnlwdGVkID0gc2VsZi5jcnlwdG9yLmVuY3J5cHQobmV3IFVpbnQ4QXJyYXkoYmxvYikpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaUNyeXB0by5jb25jYXRVaW50OEFycmF5cyhuZXcgVWludDhBcnJheShpdkJ1ZmZlciksIGVuY3J5cHRlZClcbiAgICAgICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIC8vSnVzdCBlbmNyeXB0aW5nIHRoZSBibG9iXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNyeXB0b3IuZW5jcnlwdChuZXcgVWludDhBcnJheShibG9iKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2VsZi5kZWNyeXB0ID0gKGlucHV0KT0+e1xuICAgICAgICAgICAgICAgIGxldCBibG9iID0gKHR5cGVvZihpbnB1dCkgPT09IFwic3RyaW5nXCIpID8gaUNyeXB0by5zdHJpbmdUb0FycmF5QnVmZmVyKGlucHV0KSA6IGlucHV0O1xuICAgICAgICAgICAgICAgIGlmICghKGJsb2IgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpe1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlN0cmVhbUNyeXB0b3IgZW5jcnlwdDogaW5wdXQgdHlwZSBpcyBpbnZhbGlkXCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuY3J5cHRvciA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWNyeXB0b3Igd2FzIG5vdCBpbml0aWFsaXplZCB5ZXQgYmVjYXVzZVxuICAgICAgICAgICAgICAgICAgICAvL0luaXRhbGl6YXRpb24gdmVjb3RvciAoaXYpd2FzIG5vdCB5ZXQgb2J0YWluZWRcbiAgICAgICAgICAgICAgICAgICAgLy9JViBhc3N1bWVkIHRvIGJlIGZpcnN0IDYgYnl0ZXMgcHJlcGVuZGVkIHRvIGNpcGhlclxuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudElWTGVuZ3RoID0gaXZCdWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJVkxlbmd0aCArIGJsb2IuYnl0ZUxlbmd0aCA8PSAxMil7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdkJ1ZmZlciA9IGlDcnlwdG8uY29uY2F0QXJyYXlCdWZmZXJzKGl2QnVmZmVyLCBibG9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU3RpbGwgZ2F0aGVyaW5nIGl2LCBzbyByZXR1cm5pbmcgZW1wdHkgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtYWluaW5nSVZCeXRlcyA9IDEyLWl2QnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdkJ1ZmZlciA9IGlDcnlwdG8uY29uY2F0QXJyYXlCdWZmZXJzKGl2QnVmZmVyLCBibG9iLnNsaWNlKDAsIHJlbWFpbmluZ0lWQnl0ZXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXYgPSBpQ3J5cHRvLmhleEVuY29kZShpQ3J5cHRvLmFycmF5QnVmZmVyVG9TdHJpbmcoaXZCdWZmZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY3J5cHRvciA9IG5ldyBKU0NoYUNoYTIwKG5ldyBVaW50OEFycmF5KGtleUJ1ZmZlciksIG5ldyBVaW50OEFycmF5KGl2QnVmZmVyKSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2h1bmsgPSBuZXcgVWludDhBcnJheShibG9iLnNsaWNlKHJlbWFpbmluZ0lWQnl0ZXMsIGJsb2IuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY3J5cHRvci5kZWNyeXB0KGNodW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vRGVjcnlwdG8gaXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgZGVjcnlwdGluZyB0aGUgYmxvYiBhbmQgcmV0dXJuaW5nIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jcnlwdG9yLmRlY3J5cHQobmV3IFVpbnQ4QXJyYXkoYmxvYikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLnNldChuYW1lVG9TYXZlLCByZXMpO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBzdHJlYW1DcnlwdG9yR2V0SVYodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJlYW1DcnlwdG9yR2V0SVZcIikpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBjcnlwdG9yID0gc2VsZi5nZXQodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIGNyeXB0b3IuaXY7XG4gICAgfVxuXG4gICAgc3RyZWFtQ3J5cHRvckVuY3J5cHQoY3J5cHRvcklEID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJlYW1DcnlwdG9yRW5jcnlwdFwiKSxcbiAgICAgICAgICAgICBibG9iID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJlYW1DcnlwdG9yRW5jcnlwdFwiKSxcbiAgICAgICAgICAgICBlbmNvZGluZyA9IFwicmF3XCIpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgbGV0IGNyeXB0b3IgPSBzZWxmLmdldChjcnlwdG9ySUQpO1xuICAgICAgICBpZiAoIWNyeXB0b3IuZW5jcnlwdGlvbk1vZGUoKSl7XG4gICAgICAgICAgICB0aHJvdyBcInN0cmVhbUNyeXB0b3JFbmNyeXB0IGVycm9yOiBtb2RlIGlzIGludmFsaWRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChibG9iIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgICAgICAgICAgaW5wdXQgPSBibG9iXG4gICAgICAgIH0gZWxzZSBpZiAoYmxvYiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpe1xuICAgICAgICAgICAgaW5wdXQgPSBibG9iLmJ1ZmZlclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZihibG9iKSA9PT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBpbnB1dCA9IGlDcnlwdG8uc3RyaW5nVG9BcnJheUJ1ZmZlcihibG9iKVxuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICB0aHJvdyhcInN0cmVhbUNyeXB0b3JFbmNyeXB0OiBpbnZhbGlkIGZvcm1hdCBpbnB1dFwiKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQgfHwgZW5jb2RpbmcgPT09IFwicmF3XCIpe1xuICAgICAgICAgICAgcmV0dXJuIGNyeXB0b3IuZW5jcnlwdChpbnB1dCkuYnVmZmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIk5PVCBJTVBMRU1FTlRFRFwiXG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgc3RyZWFtQ3J5cHRvckRlY3J5cHQoY3J5cHRvcklEID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJlYW1DcnlwdG9yRW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBibG9iID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJlYW1DcnlwdG9yRW5jcnlwdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZyA9IFwicmF3XCIpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBjcnlwdG9yID0gc2VsZi5nZXQoY3J5cHRvcklEKTtcblxuICAgICAgICBsZXQgaW5wdXQ7XG5cbiAgICAgICAgaWYgKCFjcnlwdG9yLmRlY3J5cHRpb25Nb2RlKCkpe1xuICAgICAgICAgICAgdGhyb3cgXCJzdHJlYW1DcnlwdG9yRW5jcnlwdCBlcnJvcjogbW9kZSBpcyBpbnZhbGlkXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmxvYiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICAgICAgICAgIGlucHV0ID0gYmxvYlxuICAgICAgICB9IGVsc2UgaWYgKGJsb2IgaW5zdGFuY2VvZiBVaW50OEFycmF5KXtcbiAgICAgICAgICAgIGlucHV0ID0gYmxvYi5idWZmZXJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoYmxvYikgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgaW5wdXQgPSBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoYmxvYilcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgdGhyb3coXCJzdHJlYW1DcnlwdG9yRW5jcnlwdDogaW52YWxpZCBmb3JtYXQgaW5wdXRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQgfHwgZW5jb2RpbmcgPT09IFwicmF3XCIpe1xuICAgICAgICAgICAgcmV0dXJuIGNyeXB0b3IuZGVjcnlwdChpbnB1dCkuYnVmZmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIk5PVCBJTVBMRU1FTlRFRFwiXG4gICAgICAgIH1cbiAgICB9XG5cblxuXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSBhbGdvcml0aG1cbiAgICAgKi9cbiAgICBoYXNoKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiaGFzaFwiKSxcbiAgICAgICAgIG5hbWVUb1NhdmUgID0gaUNyeXB0by5wUmVxdWlyZWQoXCJoYXNoXCIpLFxuICAgICAgICAgYWxnb3JpdGhtID0gXCJzaGEyNTZcIil7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGJsb2IgPSBzZWxmLmdldCh0YXJnZXQpO1xuICAgICAgICBpZih0eXBlb2YoYmxvYikgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgdGhyb3cgXCJoYXNoOiBpbnZhbGlkIHRhcmdldCB0eXBlOiBcIiArIHR5cGVvZihibG9iKSArIFwiICBUYXJnZXQgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgICBhbGdvcml0aG0gPSBhbGdvcml0aG0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgbGV0IGhhc2ggPSBmb3JnZS5tZC5oYXNPd25Qcm9wZXJ0eShhbGdvcml0aG0pID8gZm9yZ2UubWRbYWxnb3JpdGhtXS5jcmVhdGUoKTogdGhpcy50aHJvd0Vycm9yKFwiV3JvbmcgaGFzaCBhbGdvcml0aG1cIik7XG5cbiAgICAgICAgaGFzaC51cGRhdGUoYmxvYik7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGhhc2guZGlnZXN0KCkudG9IZXgoKSk7XG4gICAgICAgIHJldHVybiBzZWxmXG4gICAgfVxuXG5cbiAgICBjcmVhdGVIYXNoKG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImNyZWF0ZUhhc2hcIiksXG4gICAgICAgICAgICAgICBhbGdvcml0aG0gPSBcInNoYTI1NlwiKXtcbiAgICAgICAgbGV0IGhhc2ggPSBzamNsLmhhc2guaGFzT3duUHJvcGVydHkoYWxnb3JpdGhtKSA/IG5ldyBzamNsLmhhc2hbYWxnb3JpdGhtXSgpOiB0aGlzLnRocm93RXJyb3IoXCJXcm9uZyBoYXNoIGFsZ29yaXRobVwiKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgaGFzaCk7XG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICogQHBhcmFtIHt9IGJsb2IgY2FuIGJlIGJpbmFyeSBzdHJpbmcgb3IgYXJyYXlCdWZmZXJcbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICB1cGRhdGVIYXNoKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwidXBkYXRlSGFzaDogdGFyZ2V0XCIpLCBibG9iID0gaUNyeXB0by5wUmVxdWlyZWQoXCJ1cGRhdGVIYXNoOiBibG9iXCIpKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgaW5wdXQ7XG4gICAgICAgIGlmICh0eXBlb2YoYmxvYikgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgaW5wdXQgPSBpQ3J5cHRvLnN0cmluZ1RvQXJyYXlCdWZmZXIoYmxvYilcbiAgICAgICAgfSBlbHNlIGlmIChibG9iIGluc3RhbmNlb2YgVWludDhBcnJheSl7XG4gICAgICAgICAgICBpbnB1dCA9IGJsb2IuYnVmZmVyO1xuICAgICAgICB9IGVsc2UgaWYgKGJsb2IgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICAgICAgICBpbnB1dCA9IGJsb2JcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGlucHV0IGZvcm1hdCFcIlxuICAgICAgICB9XG4gICAgICAgIGxldCBoYXNoID0gc2VsZi5nZXQodGFyZ2V0KTtcbiAgICAgICAgaGFzaC51cGRhdGUoc2pjbC5jb2RlYy5hcnJheUJ1ZmZlci50b0JpdHMoaW5wdXQpKTtcbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cbiAgICBkaWdlc3RIYXNoKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZGlnZXN0SGFzaFwiLCksXG4gICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJkaWdlc3RIYXNoXCIpLFxuICAgICAgICAgICAgICAgaGV4aWZ5ID0gdHJ1ZSl7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGhSZXMgPSBzZWxmLmdldCh0YXJnZXQpO1xuICAgICAgICBsZXQgcmVzID0gaGV4aWZ5ID8gc2pjbC5jb2RlYy5oZXguZnJvbUJpdHMoaFJlcy5maW5hbGl6ZSgpKVxuICAgICAgICAgICAgOiBzamNsLmNvZGVjLmFycmF5QnVmZmVyLmZyb21CaXRzKGhSZXMuZmluYWxpemUoKSk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsICByZXMpO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cblxuICAgIGFzeW5jR2VuZXJhdGVSU0FLZXlQYWlyKG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImFzeW5jR2VuZXJhdGVSU0FLZXlQYWlyXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IDIwNDgpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZvcmdlLnJzYS5nZW5lcmF0ZUtleVBhaXIoe2JpdHM6IGxlbmd0aCwgd29ya2VyczogLTF9LCAoZXJyLCBwYWlyKT0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB0cnl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwdWJLZXkgPSAgZm9yZ2UucGtpLnB1YmxpY0tleVRvUGVtKHBhaXIucHVibGljS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcml2S2V5ID0gZm9yZ2UucGtpLnByaXZhdGVLZXlUb1BlbShwYWlyLnByaXZhdGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXQobmFtZVRvU2F2ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY0tleTogcHViS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGVLZXk6IHByaXZLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgUlNBIGtleSBwYWlyLlxuICAgICAqIEtleSBzYXZlZCBpbiBQRU0gZm9ybWF0XG4gICAgICogcmVzdWx0aW5nIG9iamVjdCBoYXMgcHVibGljS2V5LCBwcml2YXRlS2V5LCBrZXlUeXBlLCBsZW5ndGhcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqIEBwYXJhbSBsZW5ndGhcbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICBnZW5lcmF0ZVJTQUtleVBhaXIobmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZ2VuZXJhdGVSU0FLZXlQYWlyXCIpLCBsZW5ndGggPSAyMDQ4KXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgcGFpciA9IGZvcmdlLnBraS5yc2EuZ2VuZXJhdGVLZXlQYWlyKHtiaXRzOiBsZW5ndGgsIGU6IDB4MTAwMDF9KTtcbiAgICAgICAgbGV0IHB1YktleSA9ICBmb3JnZS5wa2kucHVibGljS2V5VG9QZW0ocGFpci5wdWJsaWNLZXkpO1xuICAgICAgICBsZXQgcHJpdktleSA9IGZvcmdlLnBraS5wcml2YXRlS2V5VG9QZW0ocGFpci5wcml2YXRlS2V5KTtcblxuICAgICAgICBzZWxmLnNldChuYW1lVG9TYXZlLCB7XG4gICAgICAgICAgICBwdWJsaWNLZXk6IHB1YktleSxcbiAgICAgICAgICAgIHByaXZhdGVLZXk6IHByaXZLZXksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBwcmV2aW91c2x5IHNhdmVkIFJTQSBwcml2YXRlIGtleSBpbiBQRU0gZm9ybWF0LFxuICAgICAqIGV4dHJhY3RzIGl0cyBwdWJsaWMga2V5XG4gICAgICogYW5kIHNhdmVzIGl0IGluIFBFTSBmb3JtYXQgdW5kZXIgdGhlIG5hbWUgc3BlY2lmaWVkXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogQHJldHVybnMge2lDcnlwdG99XG4gICAgICovXG4gICAgcHVibGljRnJvbVByaXZhdGUodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNGcm9tUHJpdmF0ZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNGcm9tUHJpdmF0ZVwiKSl7XG4gICAgICAgIGxldCBmb3JnZVByaXZhdGVLZXkgPSBmb3JnZS5wa2kucHJpdmF0ZUtleUZyb21QZW0odGhpcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGZvcmdlLnBraS5wdWJsaWNLZXlUb1BlbShmb3JnZVByaXZhdGVLZXkpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjZXB0cyBhcyBhbiBpbnB1dCBSU0Ega2V5IGFuZCBzYXZlcyBpdCBpbnNpZGUgYW4gb2JqZWN0IHVuZGVyIHRoZSBuYW1lIHNwZWNpZmllZC5cbiAgICAgKiBLZXkgbXVzdCBiZSBwcm92aWRlZCBlaXRoZXIgaW4gUEVNIG9yIGluIHJhdyBiYXNlNjQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVUb1NhdmVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5RGF0YTogcHVibGljIG9yIHByaXZhdGUgUlNBIGtleSBlaXRoZXIgaW4gcmF3IGJhc2U2NCBvciBQRU0gZm9ybWF0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGU6IG11c3QgYmUgZWl0aGVyIFwicHVibGljXCIgb3IgXCJwcml2YXRlXCJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtpQ3J5cHRvfVxuICAgICAqL1xuICAgIHNldFJTQUtleShuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzZXRSU0FQdWJsaWNLZXlcIiksXG4gICAgICAgICAgICAgIGtleURhdGEgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInNldFJTQVB1YmxpY0tleVwiKSxcbiAgICAgICAgICAgICAgdHlwZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwic2V0UlNBUHVibGljS2V5XCIpKXtcbiAgICAgICAgaWYgKHR5cGUhPT0gXCJwdWJsaWNcIiAmJiB0eXBlICE9PSBcInByaXZhdGVcIil7XG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQga2V5IHR5cGVcIlxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpQ3J5cHRvLmlzUlNBUEVNVmFsaWQoa2V5RGF0YSwgdHlwZSkpe1xuICAgICAgICAgICAga2V5RGF0YSA9IGlDcnlwdG8uYmFzZTY0VG9QRU0oa2V5RGF0YSwgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSA9PT0gXCJwdWJsaWNcIiA/IGZvcmdlLnBraS5wdWJsaWNLZXlGcm9tUGVtKGtleURhdGEpIDogZm9yZ2UucGtpLnByaXZhdGVLZXlGcm9tUGVtKGtleURhdGEpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBrZXlEYXRhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRm9yIGludGVybmFsIHVzZSBvbmx5LiBUYWtlcyBrZXkgZGF0YSBpbiBmb3JtIG9mIGEgc3RyaW5nXG4gICAgICogYW5kIGNoZWNrcyB3aGV0aGVyIGl0IG1hdGNoZXMgUlNBIFBFTSBrZXkgZm9ybWF0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleURhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ310eXBlIEVOVU0gXCJwdWJsaWNcIiwgXCJwcml2YXRlXCJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNSU0FQRU1WYWxpZChrZXlEYXRhLCB0eXBlKXtcbiAgICAgICAga2V5RGF0YSA9IGtleURhdGEudHJpbSgpO1xuICAgICAgICBsZXQgaGVhZGVyUGF0dGVybiA9ICh0eXBlID09PSBcInB1YmxpY1wiID8gL14tezQsNX1CRUdJTi4qUFVCTElDLipLRVkuKi17NCw1fS8gOiAvXi17NCw1fUJFR0lOLipQUklWQVRFLipLRVkuKi17NCw1fS8pO1xuICAgICAgICBsZXQgZm9vdGVyUGF0dGVybiA9ICh0eXBlID09PSBcInB1YmxpY1wiID8gL14tezQsNX1FTkQuKlBVQkxJQy4qS0VZLiotezQsNX0vIDogL14tezQsNX1FTkQuKlBSSVZBVEUuKktFWS4qLXs0LDV9Lyk7XG4gICAgICAgIGxldCB2YWxpZCA9IHRydWU7XG4gICAgICAgIGtleURhdGEgPSBrZXlEYXRhLnJlcGxhY2UoL1xccj9cXG4kLywgXCJcIik7XG4gICAgICAgIGxldCBrZXlEYXRhQXJyID0ga2V5RGF0YS5zcGxpdCgvXFxyP1xcbi8pO1xuICAgICAgICB2YWxpZCA9ICh2YWxpZCAmJlxuICAgICAgICAgICAga2V5RGF0YUFyci5sZW5ndGg+MiAmJlxuICAgICAgICAgICAgaGVhZGVyUGF0dGVybi50ZXN0KGtleURhdGFBcnJbMF0pICYmXG4gICAgICAgICAgICBmb290ZXJQYXR0ZXJuLnRlc3Qoa2V5RGF0YUFycltrZXlEYXRhQXJyLmxlbmd0aCAtMV0pXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYmFzZTY0VG9QRU0oa2V5RGF0YSwgdHlwZSl7XG4gICAgICAgIGxldCBoZWFkZXIgPSB0eXBlID09PSBcInB1YmxpY1wiID8gXCItLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLVwiIDogXCItLS0tLUJFR0lOIFJTQSBQUklWQVRFIEtFWS0tLS0tXCI7XG4gICAgICAgIGxldCBmb290ZXIgPSB0eXBlID09PSBcInB1YmxpY1wiID8gXCItLS0tLUVORCBQVUJMSUMgS0VZLS0tLS1cIiA6IFwiLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS1cIjtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGhlYWRlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGk8a2V5RGF0YS5sZW5ndGg7ICsraSl7XG4gICAgICAgICAgICByZXN1bHQgKz0gKGklNjQ9PT0wID8gXCJcXHJcXG5cIiArIGtleURhdGFbaV0gOiBrZXlEYXRhW2ldKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIlxcclxcblwiICsgZm9vdGVyO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGFzeW5jUHVibGljS2V5RW5jcnlwdCh0YXJnZXQsIGtleVBhaXIsIG5hbWVUb1NhdmUsIGVuY29kaW5nKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnB1YmxpY0tleUVuY3J5cHQodGFyZ2V0LCBrZXlQYWlyLCBuYW1lVG9TYXZlKSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycil7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIGNyZWF0ZXMgYW5kIHNhdmVzIHB1YmxpYyBrZXkgZmluZ2VycHJpbnRcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IC0gcHVibGljIGtleSwgZWl0aGVyIGtleXBhaXIgb3IgcHVibGljIGtleVxuICAgICAqIEBwYXJhbSBuYW1lVG9TYXZlXG4gICAgICogQHBhcmFtIGhhc2hBbGdvcml0aG1cbiAgICAgKiBAcmV0dXJucyB7aUNyeXB0b31cbiAgICAgKi9cbiAgICBnZXRQdWJsaWNLZXlGaW5nZXJwcmludCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImdldFB1YmxpY0tleUZpbmdlcnBpbnRcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9ICBpQ3J5cHRvLnBSZXF1aXJlZChcImdldFB1YmxpY0tleUZpbmdlcnBpbnRcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaEFsZ29yaXRobSA9IFwic2hhMjU2XCIpe1xuICAgICAgICBsZXQga2V5ID0gdGhpcy52YWxpZGF0ZUV4dHJhY3RSU0FLZXkodGhpcy5nZXQodGFyZ2V0KSwgXCJwdWJsaWNcIik7XG4gICAgICAgIGxldCBmb3JnZUtleSA9IGZvcmdlLnBraS5wdWJsaWNLZXlGcm9tUGVtKGtleSk7XG4gICAgICAgIGxldCBmaW5nZXJwcmludCA9IGZvcmdlLnBraS5nZXRQdWJsaWNLZXlGaW5nZXJwcmludChmb3JnZUtleSwge2VuY29kaW5nOiAnaGV4JywgbWQ6IGZvcmdlLm1kW2hhc2hBbGdvcml0aG1dLmNyZWF0ZSgpfSk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGZpbmdlcnByaW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljS2V5RW5jcnlwdCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0tleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0tleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNLZXlFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmcpe1xuICAgICAgICBrZXkgPSB0aGlzLnZhbGlkYXRlRXh0cmFjdFJTQUtleSh0aGlzLmdldChrZXkpLCBcInB1YmxpY1wiKTtcbiAgICAgICAgbGV0IHB1YmxpY0tleSA9IGZvcmdlLnBraS5wdWJsaWNLZXlGcm9tUGVtKGtleSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBwdWJsaWNLZXkuZW5jcnlwdCh0aGlzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgaWYgKGVuY29kaW5nKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2VuY29kZUJsb2IocmVzdWx0LCBlbmNvZGluZylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlLiBFbmNvZGUgdGhlIGJsb2IgaW4gZm9ybWF0IHNwZWNpZmllZFxuICAgICAqIEBwYXJhbSBibG9iXG4gICAgICogQHBhcmFtIGVuY29kaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZW5jb2RlQmxvYihibG9iID0gaUNyeXB0by5wUmVxdWlyZWQoXCJfZW5jb2RlQmxvYlwiKSxcbiAgICAgICAgICAgICAgICBlbmNvZGluZyA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiX2VuY29kZUJsb2JcIikpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5lbmNvZGVycy5oYXNPd25Qcm9wZXJ0eShlbmNvZGluZykpe1xuICAgICAgICAgICAgdGhyb3cgXCJfZW5jb2RlQmxvYjogSW52YWxpZCBlbmNvZGluZzogXCIgKyBlbmNvZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZi5lbmNvZGVyc1tlbmNvZGluZ10oYmxvYilcbiAgICB9XG5cbiAgICBfZGVjb2RlQmxvYihibG9iID0gaUNyeXB0by5wUmVxdWlyZWQoXCJfZW5jb2RlQmxvYlwiKSxcbiAgICAgICAgICAgICAgICBlbmNvZGluZyA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiX2VuY29kZUJsb2JcIikpe1xuXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLmVuY29kZXJzLmhhc093blByb3BlcnR5KGVuY29kaW5nKSl7XG4gICAgICAgICAgICB0aHJvdyBcIl9kZWNvZGVCbG9iOiBJbnZhbGlkIGVuY29kaW5nOiBcIiArIGVuY29kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZXJzW2VuY29kaW5nXShibG9iKVxuICAgIH1cblxuXG4gICAgYXN5bmNQcml2YXRlS2V5RGVjcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5wcml2YXRlS2V5RGVjcnlwdCh0YXJnZXQsIGtleSwgbmFtZVRvU2F2ZSkpXG4gICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwcml2YXRlS2V5RGVjcnlwdCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInByaXZhdGVLZXlEZWNyeXB0XCIpLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleURlY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleURlY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmcpe1xuXG4gICAgICAgIGtleSA9IHRoaXMudmFsaWRhdGVFeHRyYWN0UlNBS2V5KHRoaXMuZ2V0KGtleSksIFwicHJpdmF0ZVwiKTtcbiAgICAgICAgbGV0IHByaXZhdGVLZXkgPSBmb3JnZS5wa2kucHJpdmF0ZUtleUZyb21QZW0oa2V5KTtcbiAgICAgICAgbGV0IGNpcGhlciA9IHRoaXMuZ2V0KHRhcmdldCk7XG4gICAgICAgIGlmIChlbmNvZGluZyl7XG4gICAgICAgICAgICBjaXBoZXIgPSB0aGlzLl9kZWNvZGVCbG9iKGNpcGhlciwgZW5jb2RpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIHByaXZhdGVLZXkuZGVjcnlwdChjaXBoZXIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBhc3luY1ByaXZhdGVLZXlTaWduKHRhcmdldCwga2V5UGFpciwgbmFtZVRvU2F2ZSl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5wcml2YXRlS2V5U2lnbih0YXJnZXQsIGtleVBhaXIsIG5hbWVUb1NhdmUpKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwcml2YXRlS2V5U2lnbih0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInByaXZhdGVLZXlFbmNyeXB0XCIpLFxuICAgICAgICAgICAgICAgICAgIGtleSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHJpdmF0ZUtleUVuY3J5cHRcIiksXG4gICAgICAgICAgICAgICAgICAgaGFzaEFsZ29yaXRobSA9IFwic2hhMjU2XCIsXG4gICAgICAgICAgICAgICAgICAgaGV4aWZ5U2lnbiA9IHRydWUpe1xuICAgICAgICBrZXkgPSB0aGlzLnZhbGlkYXRlRXh0cmFjdFJTQUtleSh0aGlzLmdldChrZXkpLCBcInByaXZhdGVcIik7XG4gICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBmb3JnZS5wa2kucHJpdmF0ZUtleUZyb21QZW0oa2V5KTtcbiAgICAgICAgY29uc3QgbWQgPSBmb3JnZS5tZFtoYXNoQWxnb3JpdGhtXS5jcmVhdGUoKTtcbiAgICAgICAgbWQudXBkYXRlKHRoaXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICBsZXQgc2lnbmF0dXJlID0gcHJpdmF0ZUtleS5zaWduKG1kKTtcbiAgICAgICAgc2lnbmF0dXJlID0gaGV4aWZ5U2lnbiA/IGZvcmdlLnV0aWwuYnl0ZXNUb0hleChzaWduYXR1cmUpIDogc2lnbmF0dXJlO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBzaWduYXR1cmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIGFzeW5jUHVibGljS2V5VmVyaWZ5KHRhcmdldCwgc2lnbmF0dXJlLCBrZXksIG5hbWVUb1NhdmUpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucHVibGljS2V5VmVyaWZ5KHRhcmdldCwgc2lnbmF0dXJlLCBrZXksIG5hbWVUb1NhdmUpKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwdWJsaWNLZXlWZXJpZnkodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJwdWJsaWNLZXlWZXJpZnlcIiksXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hdHVyZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHVibGljS2V5VmVyaWZ5XCIpLFxuICAgICAgICAgICAgICAgICAgICBrZXkgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInB1YmxpY0tleVZlcmlmeVwiKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwicHVibGljS2V5VmVyaWZ5XCIpLFxuICAgICAgICAgICAgICAgICAgICBkZWhleGlmeVNpZ25SZXF1aXJlZCA9IHRydWUpe1xuICAgICAgICBrZXkgPSB0aGlzLnZhbGlkYXRlRXh0cmFjdFJTQUtleSh0aGlzLmdldChrZXkpLCBcInB1YmxpY1wiKTtcbiAgICAgICAgbGV0IHB1YmxpY0tleSA9IGZvcmdlLnBraS5wdWJsaWNLZXlGcm9tUGVtKGtleSk7XG4gICAgICAgIGNvbnN0IG1kID0gZm9yZ2UubWQuc2hhMjU2LmNyZWF0ZSgpO1xuICAgICAgICBtZC51cGRhdGUodGhpcy5nZXQodGFyZ2V0KSk7XG4gICAgICAgIGxldCBzaWduID0gdGhpcy5nZXQoc2lnbmF0dXJlKTtcbiAgICAgICAgc2lnbiA9IGRlaGV4aWZ5U2lnblJlcXVpcmVkID8gZm9yZ2UudXRpbC5oZXhUb0J5dGVzKHNpZ24pIDogc2lnbjtcbiAgICAgICAgY29uc3QgdmVyaWZpZWQgPSBwdWJsaWNLZXkudmVyaWZ5KG1kLmRpZ2VzdCgpLmJ5dGVzKCksIHNpZ24pO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCB2ZXJpZmllZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyBhbmQgZXh0cmFjdHMgUlNBIGtleSBmcm9tIGVpdGhlciBrZXlwYWlyXG4gICAgICogb3Igc2VwYXJhdGUgcHJpdmF0ZSBvciBwdWJsaWMga2V5cyBzYXZlZCBwcmV2aW91c2x5IHdpdGhpbiB0aGUgb2JqZWN0LlxuICAgICAqIENoZWNrcyBQRU0gc3RydWN0dXJlIGFuZCByZXR1cm5zIHJlcXVlc3RlZCBrZXkgaW4gUEVNIGZvcm1hdFxuICAgICAqIG9yIHRocm93cyBlcnJvciBpZiBzb21ldGhpbmcgd3JvbmdcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGFyZ2V0IGtleVxuICAgICAqIEBwYXJhbSB0eXBlIC0gXCJwdWJsaWNcIiBvciBcInByaXZhdGVcIlxuICAgICAqIEByZXR1cm4gcHVibGljIG9yIHByaXZhdGUga2V5IGluIFBFTSBmb3JtYXRcbiAgICAgKi9cbiAgICB2YWxpZGF0ZUV4dHJhY3RSU0FLZXkoa2V5ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJ2YWxpZGF0ZUFuZEV4dHJhY3RSU0FLZXlcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleVR5cGUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInZhbGlkYXRlQW5kRXh0cmFjdFJTQUtleVwiKSl7XG4gICAgICAgIGNvbnN0IGtleVR5cGVzID0ge3B1YmxpYzogXCJwdWJsaWNLZXlcIiwgcHJpdmF0ZTogXCJwcml2YXRlS2V5XCJ9O1xuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGtleVR5cGVzKS5pbmNsdWRlcyhrZXlUeXBlKSlcbiAgICAgICAgICAgIHRocm93IFwidmFsaWRhdGVFeHRyYWN0UlNBS2V5OiBrZXkgdHlwZSBpcyBpbnZhbGlkIVwiO1xuICAgICAgICBpZiAoa2V5W2tleVR5cGVzW2tleVR5cGVdXSl7XG4gICAgICAgICAgICBrZXkgPSBrZXlba2V5VHlwZXNba2V5VHlwZV1dO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaUNyeXB0by5pc1JTQVBFTVZhbGlkKGtleSwga2V5VHlwZSkpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coa2V5VHlwZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICAgICAgdGhyb3cgXCJ2YWxpZGF0ZUV4dHJhY3RSU0FLZXk6IEludmFsaWQga2V5IGZvcm1hdFwiXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICBwZW1Ub0Jhc2U2NCh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInBlbVRvQmFzZTY0XCIpLFxuICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInBlbVRvQmFzZTY0XCIpLFxuICAgICAgICAgICAgICAgIGtleVR5cGUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInBlbVRvQmFzZTY0XCIpKXtcbiAgICAgICAgbGV0IGtleSA9IHRoaXMuZ2V0KHRhcmdldCk7XG4gICAgICAgIGlmICghaUNyeXB0by5pc1JTQVBFTVZhbGlkKGtleSwga2V5VHlwZSkpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coa2V5VHlwZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICAgICAgdGhyb3cgXCJ2YWxpZGF0ZUV4dHJhY3RSU0FLZXk6IEludmFsaWQga2V5IGZvcm1hdFwiXG4gICAgICAgIH1cbiAgICAgICAga2V5ID0ga2V5LnRyaW0oKS5zcGxpdCgvXFxyP1xcbi8pLnNsaWNlKDEsIC0xKS5qb2luKFwiXCIpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBrZXkpO1xuICAgIH1cblxuXG4gICAgLyoqKiMjIyMgQ09NUFJFU1NJT04gIyMjIyoqKi9cblxuICAgIGFzeW5jQ29tcHJlc3ModGFyZ2V0LCBuYW1lVG9TYXZlKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmNvbXByZXNzKHRhcmdldCwgbmFtZVRvU2F2ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXByZXNzZXMgZGF0YSB1bmRlciBrZXkgbmFtZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiAgdHlwZTogU3RyaW5nXG4gICAgICogIEtleSB0byBkYXRhIHRoYXQgbmVlZGVkIHRvIGJlIGNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gbmFtZVRvU2F2ZVxuICAgICAqICB0eXBlOiBTdHJpbmdcbiAgICAgKiAgaWYgcGFzc2VkIC0gZnVuY3Rpb24gd2lsbCBzYXZlIHRoZSByZXN1bHQgb2YgY29tcHJlc3Npb24gdW5kZXIgdGhpcyBrZXlcbiAgICAgKiAgb3RoZXJ3aXNlIHRoZSBjb21wcmVzc2lvbiB3aWxsIGhhcHBlbiBpbi1wbGFjZVxuICAgICAqL1xuICAgIGNvbXByZXNzKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiY29tcHJlc3NcIiksIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImNvbXByZXNzXCIpKXtcbiAgICAgICAgbGV0IGNvbXByZXNzZWQgPSBMWk1BLmNvbXByZXNzKHRoaXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBjb21wcmVzc2VkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXN5bmNEZWNvbXByZXNzKHRhcmdldCwgbmFtZVRvU2F2ZSl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5kZWNvbXByZXNzKHRhcmdldCwgbmFtZVRvU2F2ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjb21wcmVzc2VzIGRhdGEgdW5kZXIga2V5IG5hbWVcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICogIHR5cGU6IFN0cmluZ1xuICAgICAqICBLZXkgdG8gZGF0YSB0aGF0IG5lZWRlZCB0byBiZSBjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIG5hbWVUb1NhdmVcbiAgICAgKiAgdHlwZTogU3RyaW5nXG4gICAgICogIGlmIHBhc3NlZCAtIGZ1bmN0aW9uIHdpbGwgc2F2ZSB0aGUgcmVzdWx0IG9mIGNvbXByZXNzaW9uIHVuZGVyIHRoaXMga2V5XG4gICAgICogIG90aGVyd2lzZSBkZWNvbXByZXNzaW9uIHdpbGwgaGFwcGVuIGluLXBsYWNlXG4gICAgICovXG4gICAgZGVjb21wcmVzcyh0YXJnZXQgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImRlY29tcHJlc3NcIiksXG4gICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJkZWNvbXByZXNzXCIpKXtcbiAgICAgICAgbGV0IGRlY29tcHJlc3NlZCA9IExaTUEuZGVjb21wcmVzcyh0aGlzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgZGVjb21wcmVzc2VkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICAvKioqIyMjIyBVVElMUyAjIyMjKioqL1xuXG4gICAgZW5jb2RlKHRhcmdldCA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZW5jb2RlXCIpLFxuICAgICAgICAgICBlbmNvZGluZyA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiZW5jb2RlXCIpLFxuICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVcIikpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2V0KG5hbWVUb1NhdmUsIHNlbGYuX2VuY29kZUJsb2IodGhpcy5nZXQodGFyZ2V0KSwgZW5jb2RpbmcpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cblxuXG5cbiAgICBiYXNlNjRFbmNvZGUobmFtZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYmFzZTY0RW5jb2RlXCIpLFxuICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJiYXNlNjRFbmNvZGVcIiksXG4gICAgICAgICAgICAgICAgIHN0cmluZ2lmeSA9IGZhbHNlKXtcbiAgICAgICAgbGV0IHRhcmdldCA9IHN0cmluZ2lmeSA/IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0KG5hbWUpKTogdGhpcy5nZXQobmFtZSlcbiAgICAgICAgdGhpcy5zZXQobmFtZVRvU2F2ZSwgaUNyeXB0by5iYXNlNjRFbmNvZGUodGFyZ2V0KSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGJhc2U2NERlY29kZShuYW1lID0gaUNyeXB0by5wUmVxdWlyZWQoXCJiYXNlNjRkZWNvZGVcIiksXG4gICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImJhc2U2NGRlY29kZVwiKSxcbiAgICAgICAgICAgICAgICAganNvblBhcnNlID0gZmFsc2Upe1xuICAgICAgICBsZXQgZGVjb2RlZCA9IGlDcnlwdG8uYmFzZTY0RGVjb2RlKHRoaXMuZ2V0KG5hbWUpKTtcbiAgICAgICAgZGVjb2RlZCA9IGpzb25QYXJzZSA/IEpTT04ucGFyc2UoZGVjb2RlZCkgOiBkZWNvZGVkO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBkZWNvZGVkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgYmFzZTMyRW5jb2RlKG5hbWUgPSB0aGlzLnBSZXF1aXJlZChcImJhc2UzMkVuY29kZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSB0aGlzLnBSZXF1aXJlZChcImJhc2UzMkVuY29kZVwiKSl7XG4gICAgICAgICAgICBsZXQgYmFzZTMyID0gbmV3IEJhc2UzMigpO1xuICAgICAgICAgICAgbGV0IGVuY29kZWQgPSBiYXNlMzIuZW5jb2RlKHRoaXMuZ2V0KG5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGVuY29kZWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGJhc2UzMkRlY29kZShuYW1lID0gdGhpcy5wUmVxdWlyZWQoXCJiYXNlNjRkZWNvZGVcIiksXG4gICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gdGhpcy5wUmVxdWlyZWQoXCJiYXNlNjRkZWNvZGVcIikpe1xuICAgICAgICAgICAgbGV0IGJhc2UzMiA9IG5ldyBCYXNlMzIoKTtcbiAgICAgICAgICAgIGxldCBkZWNvZGVkID0gYmFzZTMyLmRlY29kZSh0aGlzLmdldChuYW1lKSk7XG4gICAgICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBkZWNvZGVkKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgLyoqL1xuICAgIGJ5dGVzVG9IZXgobmFtZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwiYnl0ZXNUb0hleFwiKSxcbiAgICAgICAgICAgICAgIG5hbWVUb1NhdmUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImJ5dGVzVG9IZXhcIiksXG4gICAgICAgICAgICAgICBzdHJpbmdpZnkgPSBmYWxzZSl7XG4gICAgICAgIGxldCB0YXJnZXQgPSBzdHJpbmdpZnkgPyBKU09OLnN0cmluZ2lmeSh0aGlzLmdldChuYW1lKSk6IHRoaXMuZ2V0KG5hbWUpXG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIGlDcnlwdG8uaGV4RW5jb2RlKHRhcmdldCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBoZXhUb0J5dGVzKG5hbWUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImhleFRvQnl0ZXNcIiksXG4gICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJoZXhUb0J5dGVzXCIpLFxuICAgICAgICAgICAgICAganNvblBhcnNlID0gZmFsc2Upe1xuICAgICAgICBsZXQgZGVjb2RlZCA9IGlDcnlwdG8uaGV4RGVjb2RlKHRoaXMuZ2V0KG5hbWUpKTtcbiAgICAgICAgZGVjb2RlZCA9IGpzb25QYXJzZSA/IEpTT04ucGFyc2UoZGVjb2RlZCkgOiBkZWNvZGVkO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBkZWNvZGVkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3RyaW5naWZ5SlNPTihuYW1lID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJpbmdpZnlcIiksXG4gICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJzdHJpbmdpZnlcIikpe1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICh0eXBlb2YodGFyZ2V0KSAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICB0aHJvdyBcInN0cmluZ2lmeUpTT046IHRhcmdldCBpbnZhbGlkXCI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCBKU09OLnN0cmluZ2lmeSh0YXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcGFyc2VKU09OKG5hbWUgPSBpQ3J5cHRvLnBSZXF1aXJlZChcInN0cmluZ2lmeVwiKSxcbiAgICAgICAgICAgICAgbmFtZVRvU2F2ZSA9IGlDcnlwdG8ucFJlcXVpcmVkKFwic3RyaW5naWZ5XCIpKXtcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAodHlwZW9mKHRhcmdldCkgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgdGhyb3cgXCJzdHJpbmdpZnlKU09OOiB0YXJnZXQgaW52YWxpZFwiO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIEpTT04ucGFyc2UodGFyZ2V0KSlcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVyZ2VzIGVsZW1lbnRzIGludG8gYSBzaW5nbGUgc3RyaW5nXG4gICAgICogaWYgbmFtZSBwYXNzZWQgLSBzYXZlcyB0aGUgbWVyZ2UgcmVzdWx0IGluc2lkZSB0aGUgb2JqZWN0XG4gICAgICogdW5kZXIga2V5IDxuYW1lPi5cbiAgICAgKiBAcGFyYW0gdGhpbmdzXG4gICAgICogICAgIHR5cGU6IGFycmF5XG4gICAgICogICAgIGFycmF5IG9mIHN0cmluZ3MuIEVhY2ggc3RyaW5nIGlzIGEga2V5LlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogICAgIHR5cGU6IHN0cmluZ1xuICAgICAqICAgICBuYW1lIG9mIHRoZSBrZXkgdW5kZXIgd2hpY2ggdG8gc2F2ZSB0aGUgbWVyZ2UgcmVzdWx0XG4gICAgICovXG4gICAgbWVyZ2UodGhpbmdzID0gaUNyeXB0by5wUmVxdWlyZWQoXCJtZXJnZVwiKSwgbmFtZVRvU2F2ZSAgPSBpQ3J5cHRvLnBSZXF1aXJlZChcIm1lcmdlXCIpKXtcblxuICAgICAgICBpZiAoIXRoaXMua2V5c0V4aXN0KHRoaW5ncykpXG4gICAgICAgICAgICB0aHJvdyBcIm1lcmdlOiBzb21lIG9yIGFsbCBvYmplY3RzIHdpdGggc3VjaCBrZXlzIG5vdCBmb3VuZCBcIjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIk1lcmdpbicgdGhpbmdzXCIpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgZm9yIChsZXQgaT0gMDsgaTwgdGhpbmdzLmxlbmd0aDsgKytpKXtcbiAgICAgICAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmdldCh0aGluZ3NbaV0pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAoY2FuZGlkYXRlKSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YoY2FuZGlkYXRlKSA9PT1cIm51bWJlclwiIClcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gY2FuZGlkYXRlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IFwiT2JqZWN0IFwiICsgdGhpbmdzW2ldICsgXCIgaXMgbm90IG1lcmdlYWJsZVwiO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KG5hbWVUb1NhdmUsIHJlc3VsdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGVuY29kZUJsb2JMZW5ndGgodGFyZ2V0ID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVCbG9iTGVuZ3RoXCIpLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVuZ3RoID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVCbG9iTGVuZ3RoXCIpLFxuICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0NoYXIgPSBpQ3J5cHRvLnBSZXF1aXJlZChcImVuY29kZUJsb2JMZW5ndGhcIiksXG4gICAgICAgICAgICAgICAgICAgICBuYW1lVG9TYXZlID0gaUNyeXB0by5wUmVxdWlyZWQoXCJlbmNvZGVCbG9iTGVuZ3RoXCIpKXtcbiAgICAgICAgaWYodHlwZW9mIChwYWRkaW5nQ2hhcikgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgdGhyb3cgXCJlbmNvZGVCbG9iTGVuZ3RoOiBJbnZhbGlkIHBhZGRpbmcgY2hhclwiO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsID0gU3RyaW5nKHRoaXMuZ2V0KHRhcmdldCkubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBhZGRpbmdMZW5ndGggPSB0YXJnZXRMZW5ndGggLSBsLmxlbmd0aDtcbiAgICAgICAgaWYgKHBhZGRpbmdMZW5ndGg8MCl7XG4gICAgICAgICAgICB0aHJvdyBcImVuY29kZUJsb2JMZW5ndGg6IFN0cmluZyBsZW5ndGggZXhjZWVkZXMgdGFyZ2V0IGxlbmd0aFwiO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwYWRkaW5nID0gcGFkZGluZ0NoYXJbMF0ucmVwZWF0KHBhZGRpbmdMZW5ndGgpO1xuICAgICAgICB0aGlzLnNldChuYW1lVG9TYXZlLCAocGFkZGluZyArIGwpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKlNFUlZJQ0UgRlVOQ1RJT05TKioqKioqKioqKioqKiovXG5cbiAgICBzdGF0aWMgYXJyYXlCdWZmZXJUb1N0cmluZyhidWYpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQxNkFycmF5KGJ1ZikpO1xuICAgIH1cblxuXG4gICAgc3RhdGljIHN0cmluZ1RvQXJyYXlCdWZmZXIoc3RyKSB7XG4gICAgICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoc3RyLmxlbmd0aCAqIDIpOyAvLyAyIGJ5dGVzIGZvciBlYWNoIGNoYXJcbiAgICAgICAgdmFyIGJ1ZlZpZXcgPSBuZXcgVWludDE2QXJyYXkoYnVmKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHN0ckxlbiA9IHN0ci5sZW5ndGg7IGkgPCBzdHJMZW47IGkrKykge1xuICAgICAgICAgICAgYnVmVmlld1tpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVE9ETyBtYWtlIGl0IHVuaXZlcnNhbCBhbmQgZm9yIGFyYml0cmFyeSBudW1iZXIgb2YgYXJyYXlzICAgICAqXG4gICAgICogQHBhcmFtIGFycjFcbiAgICAgKiBAcGFyYW0gYXJyMlxuICAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb25jYXRVaW50OEFycmF5cyhhcnIxLCBhcnIyKXtcbiAgICAgICAgbGV0IHJlcyA9IG5ldyBVaW50OEFycmF5KGFycjEuYnl0ZUxlbmd0aCArIGFycjIuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHJlcy5zZXQoYXJyMSwgMCk7XG4gICAgICAgIHJlcy5zZXQoYXJyMiwgYXJyMS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25jYXRpbmF0ZXMgMiBhcnJheSBidWZmZXJzIGluIG9yZGVyIGJ1ZmZlcjEgKyBidWZmZXIyXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYnVmZmVyMVxuICAgICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGJ1ZmZlcjJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJMaWtlfVxuICAgICAqL1xuICAgIHN0YXRpYyBjb25jYXRBcnJheUJ1ZmZlcnMgKGJ1ZmZlcjEsIGJ1ZmZlcjIpIHtcbiAgICAgICAgbGV0IHRtcCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcjEuYnl0ZUxlbmd0aCArIGJ1ZmZlcjIuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHRtcC5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmZmVyMSksIDApO1xuICAgICAgICB0bXAuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZmZlcjIpLCBidWZmZXIxLmJ5dGVMZW5ndGgpO1xuICAgICAgICByZXR1cm4gdG1wLmJ1ZmZlcjtcbiAgICB9O1xuXG5cbiAgICBzdGF0aWMgZ2V0Qnl0ZXMobGVuZ3RoKXtcbiAgICAgICAgcmV0dXJuIGZvcmdlLnJhbmRvbS5nZXRCeXRlc1N5bmMobGVuZ3RoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGV4RW5jb2RlKGJsb2Ipe1xuICAgICAgICByZXR1cm4gZm9yZ2UudXRpbC5ieXRlc1RvSGV4KGJsb2IpO1xuICAgIH1cblxuICAgIHN0YXRpYyBoZXhEZWNvZGUoYmxvYil7XG4gICAgICAgIHJldHVybiBmb3JnZS51dGlsLmhleFRvQnl0ZXMoYmxvYik7XG4gICAgfVxuXG4gICAgc3RhdGljIGJhc2U2NEVuY29kZShibG9iKXtcbiAgICAgICAgcmV0dXJuIGZvcmdlLnV0aWwuZW5jb2RlNjQoYmxvYik7XG4gICAgfVxuXG4gICAgc3RhdGljIGJhc2U2NERlY29kZShibG9iKXtcbiAgICAgICAgcmV0dXJuIGZvcmdlLnV0aWwuZGVjb2RlNjQoYmxvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyByYW5kb20gaW50ZWdlclxuICAgICAqIEBwYXJhbSBhXG4gICAgICogQHBhcmFtIGJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmFuZEludChtaW4sIG1heCkge1xuICAgICAgICBpZiAobWF4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG4gICAgfTtcblxuICAgIHN0YXRpYyBjcmVhdGVSYW5kb21IZXhTdHJpbmcobGVuZ3RoKXtcbiAgICAgICAgbGV0IGJ5dGVzID0gaUNyeXB0by5nZXRCeXRlcyhsZW5ndGgpO1xuICAgICAgICBsZXQgaGV4ID0gaUNyeXB0by5oZXhFbmNvZGUoYnl0ZXMpO1xuICAgICAgICBsZXQgb2Zmc2V0ID0gaUNyeXB0by5yYW5kSW50KDAsIGhleC5sZW5ndGggLSBsZW5ndGgpO1xuICAgICAgICByZXR1cm4gaGV4LnN1YnN0cmluZyhvZmZzZXQsIG9mZnNldCtsZW5ndGgpO1xuICAgIH1cblxuICAgIGdldCAgKG5hbWUpe1xuICAgICAgICBpZiAodGhpcy5rZXlzRXhpc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVtuYW1lXTtcbiAgICAgICAgdGhyb3cgXCJQcm9wZXJ0eSBcIiArIG5hbWUgKyBcIiBub3QgZm91bmRcIlxuICAgIH07XG5cbiAgICBzZXQgKG5hbWUsIHZhbHVlKXtcbiAgICAgICAgaWYgKHRoaXMubG9ja2VkKVxuICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHByb3BlcnR5OiBvYmplY3QgbG9ja2VkXCI7XG4gICAgICAgIHRoaXMuYXNzZXJ0S2V5c0F2YWlsYWJsZShuYW1lKTtcbiAgICAgICAgdGhpcy5zdG9yZVtuYW1lXSA9IHZhbHVlO1xuICAgIH07XG5cbiAgICBsb2NrKCl7XG4gICAgICAgIHRoaXMubG9ja2VkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdW5sb2NrKCl7XG4gICAgICAgIHRoaXMubG9ja2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIGFzc2VydEtleXNBdmFpbGFibGUoa2V5cyl7XG4gICAgICAgIGlmICh0aGlzLmtleXNFeGlzdChrZXlzKSlcbiAgICAgICAgICAgIHRocm93IFwiQ2Fubm90IGFkZCBwcm9wZXJ0eTogXCIgKyBrZXlzLnRvU3RyaW5nKCkgKyBcIiBwcm9wZXJ0eSB3aXRoIHN1Y2ggbmFtZSBhbHJlYWR5IGV4aXN0c1wiO1xuICAgIH1cblxuICAgIGtleXNFeGlzdChrZXlzKXtcbiAgICAgICAgaWYgKCFrZXlzKVxuICAgICAgICAgICAgdGhyb3cgXCJrZXlzRXhpc3Q6IE1pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnRzXCI7XG4gICAgICAgIGlmKHR5cGVvZiAoa2V5cykgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mKGtleXMpID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2tleUV4aXN0cyhrZXlzKTtcbiAgICAgICAgaWYodHlwZW9mIChrZXlzKSAhPT0gXCJvYmplY3RcIilcbiAgICAgICAgICAgIHRocm93IChcImtleXNFeGlzdDogdW5zdXBwb3J0ZWQgdHlwZVwiKTtcbiAgICAgICAgaWYoa2V5cy5sZW5ndGg8MSlcbiAgICAgICAgICAgIHRocm93IFwiYXJyYXkgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBrZXlcIjtcblxuICAgICAgICBsZXQgY3VycmVudEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0b3JlKTtcblxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8IGtleXMubGVuZ3RoOyArK2kpe1xuICAgICAgICAgICAgaWYgKCFjdXJyZW50S2V5cy5pbmNsdWRlcyhrZXlzW2ldLnRvU3RyaW5nKCkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBfa2V5RXhpc3RzKGtleSl7XG4gICAgICAgIGlmICgha2V5KVxuICAgICAgICAgICAgdGhyb3cgXCJrZXlFeGlzdHM6IE1pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnRzXCI7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnN0b3JlKS5pbmNsdWRlcyhrZXkudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBSZXF1aXJlZChmdW5jdGlvbk5hbWUgPSBcImlDcnlwdG8gZnVuY3Rpb25cIil7XG4gICAgICAgIHRocm93IGZ1bmN0aW9uTmFtZSArIFwiOiBtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciFcIlxuICAgIH1cblxuICAgIHRocm93RXJyb3IobWVzc2FnZSA9IFwiVW5rbm93biBlcnJvclwiKXtcbiAgICAgICAgdGhyb3cgbWVzc2FnZTtcbiAgICB9XG59XG5cblxuIiwiLypcbiAqIFtoaS1iYXNlMzJde0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9lbW4xNzgvaGktYmFzZTMyfVxuICpcbiAqIEB2ZXJzaW9uIDAuMy4wXG4gKiBAYXV0aG9yIENoZW4sIFlpLUN5dWFuIFtlbW4xNzhAZ21haWwuY29tXVxuICogQGNvcHlyaWdodCBDaGVuLCBZaS1DeXVhbiAyMDE1LTIwMTdcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4vKmpzbGludCBiaXR3aXNlOiB0cnVlICovXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHJvb3QgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHt9O1xuICB2YXIgTk9ERV9KUyA9ICFyb290LkhJX0JBU0UzMl9OT19OT0RFX0pTICYmIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZTtcbiAgaWYgKE5PREVfSlMpIHtcbiAgICByb290ID0gZ2xvYmFsO1xuICB9XG4gIHZhciBDT01NT05fSlMgPSAhcm9vdC5ISV9CQVNFMzJfTk9fQ09NTU9OX0pTICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzO1xuICB2YXIgQU1EID0gdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kO1xuICB2YXIgQkFTRTMyX0VOQ09ERV9DSEFSID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMjM0NTY3Jy5zcGxpdCgnJyk7XG4gIHZhciBCQVNFMzJfREVDT0RFX0NIQVIgPSB7XG4gICAgJ0EnOiAwLCAnQic6IDEsICdDJzogMiwgJ0QnOiAzLCAnRSc6IDQsICdGJzogNSwgJ0cnOiA2LCAnSCc6IDcsICdJJzogOCxcbiAgICAnSic6IDksICdLJzogMTAsICdMJzogMTEsICdNJzogMTIsICdOJzogMTMsICdPJzogMTQsICdQJzogMTUsICdRJzogMTYsIFxuICAgICdSJzogMTcsICdTJzogMTgsICdUJzogMTksICdVJzogMjAsICdWJzogMjEsICdXJzogMjIsICdYJzogMjMsICdZJzogMjQsIFxuICAgICdaJzogMjUsICcyJzogMjYsICczJzogMjcsICc0JzogMjgsICc1JzogMjksICc2JzogMzAsICc3JzogMzFcbiAgfTtcblxuICB2YXIgYmxvY2tzID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuXG4gIHZhciB0b1V0ZjhTdHJpbmcgPSBmdW5jdGlvbiAoYnl0ZXMpIHtcbiAgICB2YXIgc3RyID0gJycsIGxlbmd0aCA9IGJ5dGVzLmxlbmd0aCwgaSA9IDAsIGZvbGxvd2luZ0NoYXJzID0gMCwgYiwgYztcbiAgICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgICAgYiA9IGJ5dGVzW2krK107XG4gICAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGIpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAoYiA+IDB4QkYgJiYgYiA8PSAweERGKSB7XG4gICAgICAgIGMgPSBiICYgMHgxRjtcbiAgICAgICAgZm9sbG93aW5nQ2hhcnMgPSAxO1xuICAgICAgfSBlbHNlIGlmIChiIDw9IDB4RUYpIHtcbiAgICAgICAgYyA9IGIgJiAweDBGO1xuICAgICAgICBmb2xsb3dpbmdDaGFycyA9IDI7XG4gICAgICB9IGVsc2UgaWYgKGIgPD0gMHhGNykge1xuICAgICAgICBjID0gYiAmIDB4MDc7XG4gICAgICAgIGZvbGxvd2luZ0NoYXJzID0gMztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdub3QgYSBVVEYtOCBzdHJpbmcnO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZvbGxvd2luZ0NoYXJzOyArK2opIHtcbiAgICAgICAgYiA9IGJ5dGVzW2krK107XG4gICAgICAgIGlmIChiIDwgMHg4MCB8fCBiID4gMHhCRikge1xuICAgICAgICAgIHRocm93ICdub3QgYSBVVEYtOCBzdHJpbmcnO1xuICAgICAgICB9XG4gICAgICAgIGMgPDw9IDY7XG4gICAgICAgIGMgKz0gYiAmIDB4M0Y7XG4gICAgICB9XG4gICAgICBpZiAoYyA+PSAweEQ4MDAgJiYgYyA8PSAweERGRkYpIHtcbiAgICAgICAgdGhyb3cgJ25vdCBhIFVURi04IHN0cmluZyc7XG4gICAgICB9XG4gICAgICBpZiAoYyA+IDB4MTBGRkZGKSB7XG4gICAgICAgIHRocm93ICdub3QgYSBVVEYtOCBzdHJpbmcnO1xuICAgICAgfVxuXG4gICAgICBpZiAoYyA8PSAweEZGRkYpIHtcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjIC09IDB4MTAwMDA7XG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDEwKSArIDB4RDgwMCk7XG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMHgzRkYpICsgMHhEQzAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcblxuICB2YXIgZGVjb2RlQXNCeXRlcyA9IGZ1bmN0aW9uIChiYXNlMzJTdHIpIHtcbiAgICBiYXNlMzJTdHIgPSBiYXNlMzJTdHIucmVwbGFjZSgvPS9nLCAnJyk7XG4gICAgdmFyIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgYnl0ZXMgPSBbXSwgaW5kZXggPSAwLCBsZW5ndGggPSBiYXNlMzJTdHIubGVuZ3RoO1xuXG4gICAgLy8gNCBjaGFyIHRvIDMgYnl0ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgY291bnQgPSBsZW5ndGggPj4gMyA8PCAzOyBpIDwgY291bnQ7KSB7XG4gICAgICB2MSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjIgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYzID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjUgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY2ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjggPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYxIDw8IDMgfCB2MiA+Pj4gMikgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHY0IDw8IDQgfCB2NSA+Pj4gMSkgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2NSA8PCA3IHwgdjYgPDwgMiB8IHY3ID4+PiAzKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHY3IDw8IDUgfCB2OCkgJiAyNTU7XG4gICAgfVxuXG4gICAgLy8gcmVtYWluIGJ5dGVzXG4gICAgdmFyIHJlbWFpbiA9IGxlbmd0aCAtIGNvdW50O1xuICAgIGlmIChyZW1haW4gPT09IDIpIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNCkge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYxIDw8IDMgfCB2MiA+Pj4gMikgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NTtcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNSkge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjQgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY1ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2MSA8PCAzIHwgdjIgPj4+IDIpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjIgPDwgNiB8IHYzIDw8IDEgfCB2NCA+Pj4gNCkgJiAyNTU7XG4gICAgICBieXRlc1tpbmRleCsrXSA9ICh2NCA8PCA0IHwgdjUgPj4+IDEpICYgMjU1O1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSA3KSB7XG4gICAgICB2MSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjIgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYzID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjUgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY2ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NyA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHYyIDw8IDYgfCB2MyA8PCAxIHwgdjQgPj4+IDQpICYgMjU1O1xuICAgICAgYnl0ZXNbaW5kZXgrK10gPSAodjQgPDwgNCB8IHY1ID4+PiAxKSAmIDI1NTtcbiAgICAgIGJ5dGVzW2luZGV4KytdID0gKHY1IDw8IDcgfCB2NiA8PCAyIHwgdjcgPj4+IDMpICYgMjU1O1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXM7XG4gIH07XG5cbiAgdmFyIGVuY29kZUFzY2lpID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciB2MSwgdjIsIHYzLCB2NCwgdjUsIGJhc2UzMlN0ciA9ICcnLCBsZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBjb3VudCA9IHBhcnNlSW50KGxlbmd0aCAvIDUpICogNTsgaSA8IGNvdW50Oykge1xuICAgICAgdjEgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjIgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjMgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjQgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjUgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCB8IHYzID4+PiA0KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSB8IHY0ID4+PiA3KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPj4+IDIpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA8PCAzIHwgdjUgPj4+IDUpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSW3Y1ICYgMzFdO1xuICAgIH1cblxuICAgIC8vIHJlbWFpbiBjaGFyXG4gICAgdmFyIHJlbWFpbiA9IGxlbmd0aCAtIGNvdW50O1xuICAgIGlmIChyZW1haW4gPT09IDEpIHtcbiAgICAgIHYxID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMikgJiAzMV0gK1xuICAgICAgICAnPT09PT09JztcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gMikge1xuICAgICAgdjEgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjIgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQpICYgMzFdICtcbiAgICAgICAgJz09PT0nO1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSAzKSB7XG4gICAgICB2MSA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MiA9IHN0ci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICB2MyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCB8IHYzID4+PiA0KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSkgJiAzMV0gK1xuICAgICAgICAnPT09JztcbiAgICB9IGVsc2UgaWYgKHJlbWFpbiA9PT0gNCkge1xuICAgICAgdjEgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjIgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjMgPSBzdHIuY2hhckNvZGVBdChpKyspO1xuICAgICAgdjQgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA+Pj4gMSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYzIDw8IDEgfCB2NCA+Pj4gNykgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0ID4+PiAyKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPDwgMykgJiAzMV0gK1xuICAgICAgICAnPSc7XG4gICAgfVxuICAgIHJldHVybiBiYXNlMzJTdHI7XG4gIH07XG5cbiAgdmFyIGVuY29kZVV0ZjggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIHYxLCB2MiwgdjMsIHY0LCB2NSwgY29kZSwgZW5kID0gZmFsc2UsIGJhc2UzMlN0ciA9ICcnLFxuICAgICAgaW5kZXggPSAwLCBpLCBzdGFydCA9IDAsIGJ5dGVzID0gMCwgbGVuZ3RoID0gc3RyLmxlbmd0aDtcbiAgICBkbyB7XG4gICAgICBibG9ja3NbMF0gPSBibG9ja3NbNV07XG4gICAgICBibG9ja3NbMV0gPSBibG9ja3NbNl07XG4gICAgICBibG9ja3NbMl0gPSBibG9ja3NbN107XG4gICAgICBmb3IgKGkgPSBzdGFydDsgaW5kZXggPCBsZW5ndGggJiYgaSA8IDU7ICsraW5kZXgpIHtcbiAgICAgICAgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgaWYgKGNvZGUgPCAweDgwKSB7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSBjb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPCAweDgwMCkge1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHhjMCB8IChjb2RlID4+IDYpO1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHg4MCB8IChjb2RlICYgMHgzZik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA8IDB4ZDgwMCB8fCBjb2RlID49IDB4ZTAwMCkge1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHhlMCB8IChjb2RlID4+IDEyKTtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IDB4ODAgfCAoKGNvZGUgPj4gNikgJiAweDNmKTtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IDB4ODAgfCAoY29kZSAmIDB4M2YpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvZGUgPSAweDEwMDAwICsgKCgoY29kZSAmIDB4M2ZmKSA8PCAxMCkgfCAoc3RyLmNoYXJDb2RlQXQoKytpbmRleCkgJiAweDNmZikpO1xuICAgICAgICAgIGJsb2Nrc1tpKytdID0gMHhmMCB8IChjb2RlID4+IDE4KTtcbiAgICAgICAgICBibG9ja3NbaSsrXSA9IDB4ODAgfCAoKGNvZGUgPj4gMTIpICYgMHgzZik7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweDgwIHwgKChjb2RlID4+IDYpICYgMHgzZik7XG4gICAgICAgICAgYmxvY2tzW2krK10gPSAweDgwIHwgKGNvZGUgJiAweDNmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnl0ZXMgKz0gaSAtIHN0YXJ0O1xuICAgICAgc3RhcnQgPSBpIC0gNTtcbiAgICAgIGlmIChpbmRleCA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICsraW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoaW5kZXggPiBsZW5ndGggJiYgaSA8IDYpIHtcbiAgICAgICAgZW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHYxID0gYmxvY2tzWzBdO1xuICAgICAgaWYgKGkgPiA0KSB7XG4gICAgICAgIHYyID0gYmxvY2tzWzFdO1xuICAgICAgICB2MyA9IGJsb2Nrc1syXTtcbiAgICAgICAgdjQgPSBibG9ja3NbM107XG4gICAgICAgIHY1ID0gYmxvY2tzWzRdO1xuICAgICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYzIDw8IDEgfCB2NCA+Pj4gNykgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPj4+IDIpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0IDw8IDMgfCB2NSA+Pj4gNSkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlt2NSAmIDMxXTtcbiAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMSkge1xuICAgICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyKSAmIDMxXSArXG4gICAgICAgICAgJz09PT09PSc7XG4gICAgICB9IGVsc2UgaWYgKGkgPT09IDIpIHtcbiAgICAgICAgdjIgPSBibG9ja3NbMV07XG4gICAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQpICYgMzFdICtcbiAgICAgICAgICAnPT09PSc7XG4gICAgICB9IGVsc2UgaWYgKGkgPT09IDMpIHtcbiAgICAgICAgdjIgPSBibG9ja3NbMV07XG4gICAgICAgIHYzID0gYmxvY2tzWzJdO1xuICAgICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyIHwgdjIgPj4+IDYpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYzIDw8IDEpICYgMzFdICtcbiAgICAgICAgICAnPT09JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHYyID0gYmxvY2tzWzFdO1xuICAgICAgICB2MyA9IGJsb2Nrc1syXTtcbiAgICAgICAgdjQgPSBibG9ja3NbM107XG4gICAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyIDw8IDQgfCB2MyA+Pj4gNCkgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSB8IHY0ID4+PiA3KSAmIDMxXSArXG4gICAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA+Pj4gMikgJiAzMV0gK1xuICAgICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPDwgMykgJiAzMV0gK1xuICAgICAgICAgICc9JztcbiAgICAgIH1cbiAgICB9IHdoaWxlICghZW5kKTtcbiAgICByZXR1cm4gYmFzZTMyU3RyO1xuICB9O1xuXG4gIHZhciBlbmNvZGVCeXRlcyA9IGZ1bmN0aW9uIChieXRlcykge1xuICAgIHZhciB2MSwgdjIsIHYzLCB2NCwgdjUsIGJhc2UzMlN0ciA9ICcnLCBsZW5ndGggPSBieXRlcy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGNvdW50ID0gcGFyc2VJbnQobGVuZ3RoIC8gNSkgKiA1OyBpIDwgY291bnQ7KSB7XG4gICAgICB2MSA9IGJ5dGVzW2krK107XG4gICAgICB2MiA9IGJ5dGVzW2krK107XG4gICAgICB2MyA9IGJ5dGVzW2krK107XG4gICAgICB2NCA9IGJ5dGVzW2krK107XG4gICAgICB2NSA9IGJ5dGVzW2krK107XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxIHwgdjQgPj4+IDcpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA+Pj4gMikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHY0IDw8IDMgfCB2NSA+Pj4gNSkgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbdjUgJiAzMV07XG4gICAgfVxuXG4gICAgLy8gcmVtYWluIGNoYXJcbiAgICB2YXIgcmVtYWluID0gbGVuZ3RoIC0gY291bnQ7XG4gICAgaWYgKHJlbWFpbiA9PT0gMSkge1xuICAgICAgdjEgPSBieXRlc1tpXTtcbiAgICAgIGJhc2UzMlN0ciArPSBCQVNFMzJfRU5DT0RFX0NIQVJbdjEgPj4+IDNdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MSA8PCAyKSAmIDMxXSArXG4gICAgICAgICc9PT09PT0nO1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSAyKSB7XG4gICAgICB2MSA9IGJ5dGVzW2krK107XG4gICAgICB2MiA9IGJ5dGVzW2ldO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCkgJiAzMV0gK1xuICAgICAgICAnPT09PSc7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDMpIHtcbiAgICAgIHYxID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYyID0gYnl0ZXNbaSsrXTtcbiAgICAgIHYzID0gYnl0ZXNbaV07XG4gICAgICBiYXNlMzJTdHIgKz0gQkFTRTMyX0VOQ09ERV9DSEFSW3YxID4+PiAzXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjEgPDwgMiB8IHYyID4+PiA2KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPj4+IDEpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MiA8PCA0IHwgdjMgPj4+IDQpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2MyA8PCAxKSAmIDMxXSArXG4gICAgICAgICc9PT0nO1xuICAgIH0gZWxzZSBpZiAocmVtYWluID09PSA0KSB7XG4gICAgICB2MSA9IGJ5dGVzW2krK107XG4gICAgICB2MiA9IGJ5dGVzW2krK107XG4gICAgICB2MyA9IGJ5dGVzW2krK107XG4gICAgICB2NCA9IGJ5dGVzW2ldO1xuICAgICAgYmFzZTMyU3RyICs9IEJBU0UzMl9FTkNPREVfQ0hBUlt2MSA+Pj4gM10gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYxIDw8IDIgfCB2MiA+Pj4gNikgJiAzMV0gK1xuICAgICAgICBCQVNFMzJfRU5DT0RFX0NIQVJbKHYyID4+PiAxKSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjIgPDwgNCB8IHYzID4+PiA0KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjMgPDwgMSB8IHY0ID4+PiA3KSAmIDMxXSArXG4gICAgICAgIEJBU0UzMl9FTkNPREVfQ0hBUlsodjQgPj4+IDIpICYgMzFdICtcbiAgICAgICAgQkFTRTMyX0VOQ09ERV9DSEFSWyh2NCA8PCAzKSAmIDMxXSArXG4gICAgICAgICc9JztcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UzMlN0cjtcbiAgfTtcblxuICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGlucHV0LCBhc2NpaU9ubHkpIHtcbiAgICB2YXIgbm90U3RyaW5nID0gdHlwZW9mKGlucHV0KSAhPT0gJ3N0cmluZyc7XG4gICAgaWYgKG5vdFN0cmluZyAmJiBpbnB1dC5jb25zdHJ1Y3RvciA9PT0gQXJyYXlCdWZmZXIpIHtcbiAgICAgIGlucHV0ID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpO1xuICAgIH1cbiAgICBpZiAobm90U3RyaW5nKSB7XG4gICAgICByZXR1cm4gZW5jb2RlQnl0ZXMoaW5wdXQpO1xuICAgIH0gZWxzZSBpZiAoYXNjaWlPbmx5KSB7XG4gICAgICByZXR1cm4gZW5jb2RlQXNjaWkoaW5wdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZW5jb2RlVXRmOChpbnB1dCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkZWNvZGUgPSBmdW5jdGlvbiAoYmFzZTMyU3RyLCBhc2NpaU9ubHkpIHtcbiAgICBpZiAoIWFzY2lpT25seSkge1xuICAgICAgcmV0dXJuIHRvVXRmOFN0cmluZyhkZWNvZGVBc0J5dGVzKGJhc2UzMlN0cikpO1xuICAgIH1cbiAgICB2YXIgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCBzdHIgPSAnJywgbGVuZ3RoID0gYmFzZTMyU3RyLmluZGV4T2YoJz0nKTtcbiAgICBpZiAobGVuZ3RoID09PSAtMSkge1xuICAgICAgbGVuZ3RoID0gYmFzZTMyU3RyLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyA4IGNoYXIgdG8gNSBieXRlc1xuICAgIGZvciAodmFyIGkgPSAwLCBjb3VudCA9IGxlbmd0aCA+PiAzIDw8IDM7IGkgPCBjb3VudDspIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjYgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY3ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2OCA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKHYxIDw8IDMgfCB2MiA+Pj4gMikgJiAyNTUpICtcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSgodjIgPDwgNiB8IHYzIDw8IDEgfCB2NCA+Pj4gNCkgJiAyNTUpICtcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSgodjQgPDwgNCB8IHY1ID4+PiAxKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2NSA8PCA3IHwgdjYgPDwgMiB8IHY3ID4+PiAzKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2NyA8PCA1IHwgdjgpICYgMjU1KTtcbiAgICB9XG5cbiAgICAvLyByZW1haW4gYnl0ZXNcbiAgICB2YXIgcmVtYWluID0gbGVuZ3RoIC0gY291bnQ7XG4gICAgaWYgKHJlbWFpbiA9PT0gMikge1xuICAgICAgdjEgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHYyID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NSk7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDQpIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NSk7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDUpIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKHYxIDw8IDMgfCB2MiA+Pj4gMikgJiAyNTUpICtcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSgodjIgPDwgNiB8IHYzIDw8IDEgfCB2NCA+Pj4gNCkgJiAyNTUpICtcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSgodjQgPDwgNCB8IHY1ID4+PiAxKSAmIDI1NSk7XG4gICAgfSBlbHNlIGlmIChyZW1haW4gPT09IDcpIHtcbiAgICAgIHYxID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2MiA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjMgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY0ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICB2NSA9IEJBU0UzMl9ERUNPREVfQ0hBUltiYXNlMzJTdHIuY2hhckF0KGkrKyldO1xuICAgICAgdjYgPSBCQVNFMzJfREVDT0RFX0NIQVJbYmFzZTMyU3RyLmNoYXJBdChpKyspXTtcbiAgICAgIHY3ID0gQkFTRTMyX0RFQ09ERV9DSEFSW2Jhc2UzMlN0ci5jaGFyQXQoaSsrKV07XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgodjEgPDwgMyB8IHYyID4+PiAyKSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2MiA8PCA2IHwgdjMgPDwgMSB8IHY0ID4+PiA0KSAmIDI1NSkgK1xuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2NCA8PCA0IHwgdjUgPj4+IDEpICYgMjU1KSArXG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoKHY1IDw8IDcgfCB2NiA8PCAyIHwgdjcgPj4+IDMpICYgMjU1KTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcblxuICB2YXIgZXhwb3J0cyA9IHtcbiAgICBlbmNvZGU6IGVuY29kZSxcbiAgICBkZWNvZGU6IGRlY29kZVxuICB9O1xuICBkZWNvZGUuYXNCeXRlcyA9IGRlY29kZUFzQnl0ZXM7XG5cbiAgaWYgKENPTU1PTl9KUykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcbiAgfSBlbHNlIHtcbiAgICByb290LmJhc2UzMiA9IGV4cG9ydHM7XG4gICAgaWYgKEFNRCkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZXhwb3J0cztcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSkoKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IG5ldyBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG59IGNhdGNoIChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKSBnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG4iLCIvKiBnbG9iYWxzIF9fd2VicGFja19hbWRfb3B0aW9uc19fICovXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19hbWRfb3B0aW9uc19fO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==