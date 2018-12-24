/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		0: 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
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
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([139,1]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ 10:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return iCrypto; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var js_chacha20__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(75);
/* harmony import */ var js_chacha20__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(js_chacha20__WEBPACK_IMPORTED_MODULE_3__);







var forge = __webpack_require__(146);

var sjcl = __webpack_require__(160); //const Base32 = require("./Base32.js");


var iCryptoFactory =
/*#__PURE__*/
function () {
  function iCryptoFactory(settings) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, iCryptoFactory);

    this.readSettings();
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(iCryptoFactory, [{
    key: "createICryptor",
    value: function createICryptor() {
      return new iCrypto(this.settings);
    }
  }, {
    key: "readSettings",
    value: function readSettings() {
      console.log("readubg settings");
      this.settings = null;
    }
  }]);

  return iCryptoFactory;
}();

var iCrypto =
/*#__PURE__*/
function () {
  function iCrypto(settings) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, iCrypto);

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


  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(iCrypto, [{
    key: "setSymCipher",
    value: function setSymCipher() {
      var self = this;

      for (var _len = arguments.length, opts = new Array(_len), _key = 0; _key < _len; _key++) {
        opts[_key] = arguments[_key];
      }

      if (!self.symCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.sym = self[opts[0]];
    }
  }, {
    key: "setAsymCipher",
    value: function setAsymCipher() {
      var self = this;

      for (var _len2 = arguments.length, opts = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        opts[_key2] = arguments[_key2];
      }

      if (!self.asymCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.asym = self[opts[0]];
    }
  }, {
    key: "setStreamCipher",
    value: function setStreamCipher() {
      var self = this;

      for (var _len3 = arguments.length, opts = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        opts[_key3] = arguments[_key3];
      }

      if (!self.streamCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.ssym = self[opts[0]];
    }
    /***************** END **********************************/

  }, {
    key: "setEncodersAndDecoders",
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
    key: "asyncCreateNonce",
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
    key: "createNonce",
    value: function createNonce() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createNonce");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
      var self = this;
      this.set(nameToSave, iCrypto.getBytes(length));
      return this;
    }
  }, {
    key: "asyncAddBlob",
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
    key: "addBlob",
    value: function addBlob() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("addBlob");
      var plainText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("addBlob");
      this.set(nameToSave, plainText.toString().trim());
      return this;
    }
    /**********************$$*****************************/

    /***#### KEYS CRYPTO ####***/

  }, {
    key: "asyncCreateSYMKey",
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
    key: "createSYMKey",
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
    key: "setSYMKey",
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
    key: "asyncAESEncrypt",
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
    key: "AESEncrypt",
    value: function AESEncrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESEncrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESEncrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESEncrypt");
      var hexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'CBC';
      var encoding = arguments.length > 5 ? arguments[5] : undefined;
      var self = this;

      if (!self.aes.modes.includes(mode.toUpperCase())) {
        throw "AESencrypt: Invalid AES mode";
      }

      mode = "AES-" + mode.toUpperCase(); //Creating random 16 bytes IV

      var iv = iCrypto.getBytes(16);
      var AESkey = forge.util.hexToBytes(self.get(key));
      var cipher = forge.cipher.createCipher(mode, AESkey);
      cipher.start({
        iv: iv
      });
      cipher.update(forge.util.createBuffer(this.get(target), encoding));
      cipher.finish();
      this.set(nameToSave, hexify ? forge.util.bytesToHex(iv) + cipher.output.toHex() : iv + cipher.output);
      return this;
    }
  }, {
    key: "asyncAESDecrypt",
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
    key: "AESDecrypt",
    value: function AESDecrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESDecrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESDecrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESDecrypt");
      var dehexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "CBC";
      var encoding = arguments.length > 5 ? arguments[5] : undefined;
      var self = this;
      var cipherWOIV;

      if (!self.aes.modes.includes(mode.toUpperCase())) {
        throw "AESencrypt: Invalid AES mode";
      }

      mode = "AES-" + mode.toUpperCase();
      var cipher = self.get(target);
      var iv;

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
      decipher.start({
        iv: iv
      });
      decipher.update(forge.util.createBuffer(cipherWOIV));
      decipher.finish();
      this.set(nameToSave, decipher.output.toString('utf8'));
      return this;
    }
  }, {
    key: "asyncHash",
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
    key: "hashFileWorker",
    value: function hashFileWorker() {
      var _this7 = this;

      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("fileHashWorker file");
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
    key: "initStreamCryptor",
    value: function initStreamCryptor() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("initStreamEncryptor");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("initStreamEncryptor");
      var isEncryptionMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var algorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "chacha20";
      var self = this;
      var ivRaw, ivHex, keyRaw, cryptor, ivBuffer;
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
        cryptor = new js_chacha20__WEBPACK_IMPORTED_MODULE_3__["JSChaCha20"](new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
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
              ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob); //Still gathering iv, so returning empty array

              return new Uint8Array();
            } else {
              var remainingIVBytes = 12 - ivBuffer.byteLength;
              ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob.slice(0, remainingIVBytes));
              self.iv = iCrypto.hexEncode(iCrypto.arrayBufferToString(ivBuffer));
              self.cryptor = new js_chacha20__WEBPACK_IMPORTED_MODULE_3__["JSChaCha20"](new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
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
    key: "streamCryptorGetIV",
    value: function streamCryptorGetIV() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorGetIV");
      var self = this;
      var cryptor = self.get(target);
      return cryptor.iv;
    }
  }, {
    key: "streamCryptorEncrypt",
    value: function streamCryptorEncrypt() {
      var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";
      var self = this;
      var input;
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
    key: "streamCryptorDecrypt",
    value: function streamCryptorDecrypt() {
      var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";
      var self = this;
      var cryptor = self.get(cryptorID);
      var input;

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
    key: "hash",
    value: function hash() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("hash");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("hash");
      var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      var self = this;
      var blob = self.get(target);

      if (typeof blob !== "string") {
        throw "hash: invalid target type: " + _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(blob) + "  Target must be string.";
      }

      algorithm = algorithm.toLowerCase();
      var hash = forge.md.hasOwnProperty(algorithm) ? forge.md[algorithm].create() : this.throwError("Wrong hash algorithm");
      hash.update(blob);
      this.set(nameToSave, hash.digest().toHex());
      return self;
    }
  }, {
    key: "createHash",
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
    key: "updateHash",
    value: function updateHash() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("updateHash: target");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("updateHash: blob");
      var self = this;
      var input;

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
    key: "digestHash",
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
    key: "asyncGenerateRSAKeyPair",
    value: function asyncGenerateRSAKeyPair() {
      var _this8 = this;

      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("asyncGenerateRSAKeyPair");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;
      return new Promise(function (resolve, reject) {
        var self = _this8;
        forge.rsa.generateKeyPair({
          bits: length,
          workers: -1
        }, function (err, pair) {
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
    key: "generateRSAKeyPair",
    value: function generateRSAKeyPair() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("generateRSAKeyPair");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;
      var self = this;
      var pair = forge.pki.rsa.generateKeyPair({
        bits: length,
        e: 0x10001
      });
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
    key: "publicFromPrivate",
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
    key: "setRSAKey",
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
    key: "asyncPublicKeyEncrypt",
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
    key: "getPublicKeyFingerprint",
    value: function getPublicKeyFingerprint() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("getPublicKeyFingerpint");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("getPublicKeyFingerpint");
      var hashAlgorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      var key = this.validateExtractRSAKey(this.get(target), "public");
      var forgeKey = forge.pki.publicKeyFromPem(key);
      var fingerprint = forge.pki.getPublicKeyFingerprint(forgeKey, {
        encoding: 'hex',
        md: forge.md[hashAlgorithm].create()
      });
      this.set(nameToSave, fingerprint);
      return this;
    }
  }, {
    key: "publicKeyEncrypt",
    value: function publicKeyEncrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicKeyEncrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicKeyEncrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("publicKeyEncrypt");
      var encoding = arguments.length > 3 ? arguments[3] : undefined;
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
    key: "_encodeBlob",
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
    key: "_decodeBlob",
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
    key: "asyncPrivateKeyDecrypt",
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
    key: "privateKeyDecrypt",
    value: function privateKeyDecrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("privateKeyDecrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("privateKeyDecrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("privateKeyDecrypt");
      var encoding = arguments.length > 3 ? arguments[3] : undefined;
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
    key: "asyncPrivateKeySign",
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
    key: "privateKeySign",
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
    key: "asyncPublicKeyVerify",
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
    key: "publicKeyVerify",
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
    key: "validateExtractRSAKey",
    value: function validateExtractRSAKey() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("validateAndExtractRSAKey");
      var keyType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("validateAndExtractRSAKey");
      var keyTypes = {
        public: "publicKey",
        private: "privateKey"
      };
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
    key: "pemToBase64",
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
    key: "asyncCompress",
    value: function asyncCompress(target, nameToSave) {} // return new Promise((resolve, reject)=>{
    //     try{
    //         resolve(this.compress(target, nameToSave));
    //     } catch(err){
    //         reject(err);
    //     }
    // })

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
    key: "compress",
    value: function compress() {//let compressed = LZMA.compress(this.get(target));
      // this.set(nameToSave, compressed);
      // return this;

      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("compress");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("compress");
    }
  }, {
    key: "asyncDecompress",
    value: function asyncDecompress(target, nameToSave) {} // return new Promise((resolve, reject)=>{
    //     try{
    //         resolve(this.decompress(target, nameToSave));
    //     } catch(err){
    //         reject(err);
    //     }
    //
    // })

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
    key: "decompress",
    value: function decompress() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("decompress");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("decompress");
    } // let decompressed = LZMA.decompress(this.get(target));
    // this.set(nameToSave, decompressed);
    // return this;

    /***#### UTILS ####***/

  }, {
    key: "encode",
    value: function encode() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("encode");
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("encode");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("encode");
      var self = this;
      self.set(nameToSave, self._encodeBlob(this.get(target), encoding));
      return this;
    }
  }, {
    key: "base64Encode",
    value: function base64Encode() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("base64Encode");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("base64Encode");
      var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
      this.set(nameToSave, iCrypto.base64Encode(target));
      return this;
    }
  }, {
    key: "base64Decode",
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
    key: "bytesToHex",
    value: function bytesToHex() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("bytesToHex");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("bytesToHex");
      var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
      this.set(nameToSave, iCrypto.hexEncode(target));
      return this;
    }
  }, {
    key: "hexToBytes",
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
    key: "stringifyJSON",
    value: function stringifyJSON() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("stringify");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("stringify");
      var target = this.get(name);

      if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(target) !== "object") {
        throw "stringifyJSON: target invalid";
      }

      this.set(nameToSave, JSON.stringify(target));
      return this;
    }
  }, {
    key: "parseJSON",
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
    key: "merge",
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
    key: "encodeBlobLength",
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
    key: "get",
    value: function get(name) {
      if (this.keysExist(name)) return this.store[name];
      throw "Property " + name + " not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (this.locked) throw "Cannot add property: object locked";
      this.assertKeysAvailable(name);
      this.store[name] = value;
    }
  }, {
    key: "lock",
    value: function lock() {
      this.locked = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.locked = false;
    }
  }, {
    key: "assertKeysAvailable",
    value: function assertKeysAvailable(keys) {
      if (this.keysExist(keys)) throw "Cannot add property: " + keys.toString() + " property with such name already exists";
    }
  }, {
    key: "keysExist",
    value: function keysExist(keys) {
      if (!keys) throw "keysExist: Missing required arguments";
      if (typeof keys === "string" || typeof keys === "number") return this._keyExists(keys);
      if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(keys) !== "object") throw "keysExist: unsupported type";
      if (keys.length < 1) throw "array must have at least one key";
      var currentKeys = Object.keys(this.store);

      for (var i = 0; i < keys.length; ++i) {
        if (!currentKeys.includes(keys[i].toString())) return false;
      }

      return true;
    }
  }, {
    key: "_keyExists",
    value: function _keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this.store).includes(key.toString());
    }
  }, {
    key: "throwError",
    value: function throwError() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unknown error";
      throw message;
    }
  }], [{
    key: "isRSAPEMValid",
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
    key: "base64ToPEM",
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
    key: "arrayBufferToString",
    value: function arrayBufferToString(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
  }, {
    key: "stringToArrayBuffer",
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
    key: "concatUint8Arrays",
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
    key: "concatArrayBuffers",
    value: function concatArrayBuffers(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    }
  }, {
    key: "getBytes",
    value: function getBytes(length) {
      return forge.random.getBytesSync(length);
    }
  }, {
    key: "hexEncode",
    value: function hexEncode(blob) {
      return forge.util.bytesToHex(blob);
    }
  }, {
    key: "hexDecode",
    value: function hexDecode(blob) {
      return forge.util.hexToBytes(blob);
    }
  }, {
    key: "base64Encode",
    value: function base64Encode(blob) {
      return forge.util.encode64(blob);
    }
  }, {
    key: "base64Decode",
    value: function base64Decode(blob) {
      return forge.util.decode64(blob);
    }
    /**
     * Returns random integer
     * @param a
     * @param b
     */

  }, {
    key: "randInt",
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
    key: "createRandomHexString",
    value: function createRandomHexString(length) {
      var bytes = iCrypto.getBytes(length);
      var hex = iCrypto.hexEncode(bytes);
      var offset = iCrypto.randInt(0, hex.length - length);
      return hex.substring(offset, offset + length);
    }
  }, {
    key: "pRequired",
    value: function pRequired() {
      var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "iCrypto function";
      throw functionName + ": missing required parameter!";
    }
  }]);

  return iCrypto;
}();

/***/ }),

/***/ 139:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var cute_set__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(142);
/* harmony import */ var cute_set__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(cute_set__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var toastr__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var toastr__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(toastr__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _chat_WildEmitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(74);
/* harmony import */ var _lib_iCrypto__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(10);


//Viendors
 //import { $ } from "jquery";

 //
//import { bar } from "loading-bar";
//import { waitMe } from "./lib/waitMe.min"



window.iCrypto = _lib_iCrypto__WEBPACK_IMPORTED_MODULE_5__[/* iCrypto */ "a"];
window.toastr = toastr__WEBPACK_IMPORTED_MODULE_3__;

var ChatClient = __webpack_require__(268).default; //chat page


var chat;
var DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; //variables to create new topic

var nickname, topicName; //variables to topic login

var topicID;
var sounds = {};
var soundsOnOfIcons = {
  on: "/img/sound-on.png",
  off: "/img/sound-off.png"
};
var sendLock = false;
var mainMenuItems = [{
  index: 0,
  subtitle: "Login",
  selector: "#login-container",
  active: true
}, {
  index: 1,
  subtitle: "Join",
  selector: "#join-by-invite-container",
  active: false
}, {
  index: 2,
  subtitle: "New",
  selector: "#new-topic-container",
  active: false
}];
var tempName;
var recording = false; //variables to display new topic data
//let newPubKey, newPrivKey, newNickname, newTopicID, newTopicName;

document.addEventListener('DOMContentLoaded', function (event) {
  console.log('initializing chat....');
  chat = new ChatClient();
  loadSounds();
  setView("auth");
  setupChatListeners(chat);
  document.querySelector('#create-topic').addEventListener('click', createTopic);
  document.querySelector('#login-topic').addEventListener('click', topicLogin);
  document.querySelector('#join-topic').addEventListener('click', joinTopic);
  document.querySelector('#send-new-msg').addEventListener('click', sendMessage);
  document.querySelector('#close-code-view').addEventListener('click', closeCodeView);
  document.querySelector('#new-invite').addEventListener('click', generateInvite);
  document.querySelector('#user-name').addEventListener('change', editMyNickname);
  document.querySelector('#topic-name').addEventListener('change', editTopicName);
  document.querySelector('#refresh-invites').addEventListener('click', refreshInvites);
  document.querySelector('#attach-file').addEventListener('change', processAttachmentChosen);
  document.querySelector('#re-connect').addEventListener('click', attemptReconnection);
  document.querySelector('#sounds-switch').addEventListener('click', switchSounds);
  document.querySelector('.right-arrow-wrap').addEventListener('click', processMainMenuSwitch);
  document.querySelector('.left-arrow-wrap').addEventListener('click', processMainMenuSwitch);
  $('#new-msg').keydown(function (e) {
    if (!e.ctrlKey && e.keyCode === 13) {
      event.preventDefault();
      sendMessage();
      moveCursor(e.target, "start");
      return false;
    } else if (e.ctrlKey && e.keyCode === 13) {
      e.target.value += "\n";
      moveCursor(e.target, "end");
    }
  });
  $('#chat_window').scroll(processChatScroll);
  $('#private-key').keyup(
  /*#__PURE__*/
  function () {
    var _ref = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
    /*#__PURE__*/
    _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(e) {
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(e.keyCode === 13)) {
                _context.next = 3;
                break;
              }

              _context.next = 3;
              return topicLogin();

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  $('#join-nickname, #invite-code').keyup(
  /*#__PURE__*/
  function () {
    var _ref2 = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
    /*#__PURE__*/
    _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee2(e) {
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(e.keyCode === 13)) {
                _context2.next = 3;
                break;
              }

              _context2.next = 3;
              return joinTopic();

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  $('#new-topic-nickname, #new-topic-name').keyup(
  /*#__PURE__*/
  function () {
    var _ref3 = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
    /*#__PURE__*/
    _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee3(e) {
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (e.keyCode === 13) {
                createTopic();
              }

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
  enableSettingsMenuListeners();
});

function loadSounds() {
  var sMap = {
    "incoming_message": "message_incoming.mp3",
    "message_sent": "message_sent.mp3",
    "user_online": "user_online.mp3"
  };

  var _arr = Object.keys(sMap);

  for (var _i = 0; _i < _arr.length; _i++) {
    var s = _arr[_i];
    sounds[s] = new Audio("/sounds/" + sMap[s]);
    sounds[s].load();
  }
}

function playSound(sound) {
  if (chat.session.settings.soundsOn) {
    sounds[sound].play();
  }
}

function moveCursor(el, pos) {
  if (pos === "end") {
    moveCursorToEnd(el);
  } else if (pos === "start") {
    moveCursorToStart(el);
  }
}

function moveCursorToEnd(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function moveCursorToStart(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = 0;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function createTopic() {
  nickname = document.querySelector('#new-topic-nickname').value.trim();
  topicName = document.querySelector('#new-topic-name').value.trim();
  loadingOn();
  chat.initTopic(nickname, topicName).then(function (data) {
    console.log("Topic create attempt successful");
    nickname.value = "";
    topicName.value = "";
  }).catch(function (err) {
    console.log("Error creating topic: " + err);
    loadingOff();
  });
}

function topicLogin() {
  return _topicLogin.apply(this, arguments);
}

function _topicLogin() {
  _topicLogin = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee4() {
    var privKey;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            loadingOn();
            console.log("called topic login");
            privKey = document.querySelector('#private-key').value;
            clearLoginPrivateKey();
            _context4.next = 6;
            return chat.topicLogin(privKey);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return _topicLogin.apply(this, arguments);
}

function joinTopic() {
  return _joinTopic.apply(this, arguments);
}

function _joinTopic() {
  _joinTopic = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee5() {
    var inviteCode, nickname, data;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            inviteCode = document.querySelector('#invite-code').value.trim();
            nickname = document.querySelector('#join-nickname').value.trim();
            loadingOn();
            _context5.prev = 3;
            _context5.next = 6;
            return chat.initTopicJoin(nickname, inviteCode);

          case 6:
            data = _context5.sent;
            _context5.next = 13;
            break;

          case 9:
            _context5.prev = 9;
            _context5.t0 = _context5["catch"](3);
            toastr__WEBPACK_IMPORTED_MODULE_3__["error"]("Topic was not created. Error: " + _context5.t0);
            loadingOff();

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[3, 9]]);
  }));
  return _joinTopic.apply(this, arguments);
}

function setupChatListeners(chat) {
  chat.on("init_topic_success", function (data) {
    loadingOff();
    displayNewTopicData(data);
  });
  chat.on("init_topic_error", function (err) {
    var msg;

    if (err instanceof Error) {
      msg = err.message;
    } else {
      msg = err;
    }

    loadingOff();
    toastr__WEBPACK_IMPORTED_MODULE_3__["error"]("Topic was not created. Error: " + msg);
  });
  chat.on("login_success", function (messages) {
    document.querySelector('#sounds-switch').src = chat.session.settings.soundsOn ? soundsOnOfIcons.on : soundsOnOfIcons.off;
    loadingOff();
    clearAllInputs();
    processLogin(messages);
    playSound("user_online");
    toastr__WEBPACK_IMPORTED_MODULE_3__["success"]("You are now online!");
  });
  chat.on("unknown_error", function (err) {
    console.log("unknown_error emited by chat: " + err);
    toastr__WEBPACK_IMPORTED_MODULE_3__["error"]("Chat error: " + err);
  });
  chat.on("login_fail", function (err) {
    clearLoginPrivateKey();
    loadingOff();
    console.log("Login fail emited by chat: " + err);
    toastr__WEBPACK_IMPORTED_MODULE_3__["error"]("Login fail: " + err);
  });
  chat.on('request_invite_success', function (inviteID) {
    buttonLoadingOff(document.querySelector("#new-invite"));
    showInviteCode(inviteID);
  });
  chat.on('invite_updated', function () {
    toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("Invite updated!");
  });
  chat.on("new_member_joined", function (data) {
    processNewMemberJoin(data);
  });
  chat.on("settings_updated", function () {
    updateParticipants();
    syncPendingInvites();
    updateLoadedMessages();
  });
  chat.on("participant_booted", function (message) {
    updateParticipants();
    toastr__WEBPACK_IMPORTED_MODULE_3__["info"](message);
  });
  chat.on("metadata_updated", function () {
    updateParticipants();
    updateLoadedMessages();
  });
  chat.on("boot_participant_success", function (message) {
    updateParticipants();
    toastr__WEBPACK_IMPORTED_MODULE_3__["info"](message);
  });
  chat.on("u_booted", function (message) {
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"](message);
  });
  chat.on("boot_participant_fail", function (message) {
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"]("Participant booting failed: " + message);
  });
  chat.on("topic_join_success", function (data) {
    processTopicJoinSuccess(data);
  });
  chat.on("del_invite_fail", function () {
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"]("Error deleting invite");
  });
  chat.on("del_invite_success", function () {
    syncPendingInvites();
    toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("Invite was deleted");
  });
  chat.on("chat_message", function (data) {
    processIncomingMessage(data);
    playSound("incoming_message");
  });
  chat.on("send_success", function (message) {
    playSound("message_sent");
    messageSendSuccess(message);
  });
  chat.on("send_fail", function (message) {
    messageSendFail(message);
  });
  chat.on("service_record", function (record) {
    processServiceRecord(record);
  });
  chat.on("sync_invites_success", function () {
    refreshInvitesSuccess();
  });
  chat.on("sync_invites_error", function (msg) {
    buttonLoadingOff(document.querySelector('#refresh-invites'));
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"]("Invite request failed: " + msg);
  });
  chat.on("request_invite_error", function (msg) {
    buttonLoadingOff(document.querySelector('#new-invite'));
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"]("Invite request failed: " + msg);
  });
  chat.on("messages_loaded", function (messages) {
    processMessagesLoaded(messages);
  });
  chat.on("connected_to_island", function () {
    switchConnectionStatus(true);
  });
  chat.on("disconnected_from_island", function () {
    switchConnectionStatus(false);
  });
  chat.on("download_complete", function (res) {
    var fileInfo = JSON.parse(res.fileInfo);
    var fileData = res.fileData;

    if (/audio/.test(fileInfo.type)) {
      loadAudio(fileInfo, fileData);
    } else {
      downloadAttachment(fileInfo.name, fileData);
    }
  });
}

function processIncomingMessage(message) {
  var pkfp = message.header.author;
  var storedNickname = chat.getMemberNickname(pkfp);

  if (storedNickname !== message.header.nickname) {
    chat.setMemberNickname(pkfp, message.header.nickname);
    storedNickname = chat.getMemberNickname(pkfp);
    chat.saveClientSettings(chat.session.publicKeyFingerprint);
  }

  var alias = chat.getMemberAlias(pkfp);
  var timestamp = message.header.timestamp;
  appendMessageToChat({
    nickname: storedNickname,
    alias: alias,
    timestamp: timestamp,
    pkfp: pkfp,
    body: message.body,
    messageID: message.header.id,
    private: message.header.private,
    recipient: message.header.recipient,
    attachments: message.attachments
  });
  toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("New message from " + chat.getMemberRepr(pkfp));
}

function processServiceRecord(record) {
  var timestamp = record.header.timestamp;
  var pkfp = record.header.author;
  appendMessageToChat({
    nickname: "Service",
    timestamp: timestamp,
    messageID: record.header.id,
    pkfp: "service",
    body: record.body,
    service: record.header.service,
    attachments: record.attachments
  });
}

function sendMessage() {
  ensureConnected();

  if (sendLock) {
    return;
  }

  lockSend(true);
  var message = document.querySelector('#new-msg');
  var attachments = document.querySelector('#attach-file').files;
  var addresseeSelect = document.querySelector("#select-member");
  var addressee = addresseeSelect[addresseeSelect.selectedIndex].value;

  if (message.value.trim() === "" && attachments.length === 0) {
    lockSend(false);
    return;
  }

  if (addressee === "ALL") {
    chat.shoutMessage(message.value.trim(), attachments).then(function () {
      console.log("Send message resolved");
    }).catch(function (err) {
      console.log("Error sending message" + err.message);
      lockSend(false);
    });
  } else {
    chat.whisperMessage(addressee, message.value.trim()).then(function () {
      console.log("Done whispering message!");
    }).catch(function (err) {
      console.log("Error sending message" + err.message);
      lockSend(false);
    });
  }

  message.value = "";
}

function messageSendSuccess(message) {
  var pkfp = message.header.author;
  var nickname = chat.getMemberNickname(pkfp) || message.header.nickname;
  var timestamp = message.header.timestamp;
  appendMessageToChat({
    nickname: nickname,
    timestamp: timestamp,
    pkfp: pkfp,
    body: message.body,
    messageID: message.header.id,
    attachments: message.attachments,
    private: message.header.private,
    recipient: message.header.recipient
  });
  clearAttachments();
  lockSend(false);
}

function messageSendFail(message) {
  console.log("Message send fail");
  lockSend(false);
}

function get_current_time() {
  var d = new Date();
  return padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
}

function getChatFormatedDate(timestamp) {
  var d = new Date(timestamp);
  var today = new Date();

  if (Math.floor((today - d) / 1000) <= 64000) {
    return d.getHours() + ':' + padWithZeroes(2, d.getMinutes());
  } else {
    return DAYSOFWEEK[d.getDay()] + ", " + d.getMonth() + "/" + padWithZeroes(2, d.getDate()) + " " + padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
  }
}

function padWithZeroes(requiredLength, value) {
  var res = "0".repeat(requiredLength) + String(value).trim();
  return res.substr(res.length - requiredLength);
}

function isMyMessage(pkfp) {
  return chat.session.publicKeyFingerprint === pkfp;
}

function processNewMemberJoin() {
  if (!chat.session) {
    console.log("Not logged in, nothing to update");
    return;
  }

  console.log("NEW MEMBER JOINED. UPDATING INFO");
  updateParticipants();
  syncPendingInvites();
  toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("New member just joined the channel!");
}

function bootParticipant(event) {
  console.log("About to boot participant");
  ensureConnected();
  var participantPkfp = event.target.parentElement.parentElement.lastElementChild.innerHTML;
  var participant = chat.session.settings.membersData[participantPkfp];

  if (participantPkfp == chat.session.publicKeyFingerprint) {
    if (confirm("Are you sure you want to leave this topic?")) {
      console.log("Leaving topic");
      return;
    }
  }

  if (confirm("Are you sure you want to boot " + participant + "? ")) {
    chat.bootParticipant(participantPkfp);
  }
}

function addParticipantToSettings(key) {
  var records = document.querySelector("#participants-records");
  var participant = chat.session.metadata.participants[key];

  if (!participant) {
    console.error("Error adding participant");
    return;
  }

  var wrapper = document.createElement("div");
  var id = document.createElement("div");
  var nickname = document.createElement("div");
  var rights = document.createElement("div");
  var actions = document.createElement("div");
  var delButton = document.createElement("div");
  id.setAttribute("class", "participant-id");
  wrapper.setAttribute("class", "participant-wrapper");
  nickname.setAttribute("class", "p-nickname");
  rights.setAttribute("class", "p-rights");
  actions.setAttribute("class", "p-actions");
  delButton.setAttribute("class", "boot-participant");
  delButton.addEventListener("click", bootParticipant);
  nickname.innerHTML = chat.getMemberRepr(key);
  rights.innerHTML = participant.rights;
  delButton.innerHTML = "Boot";
  id.innerHTML = key;
  wrapper.appendChild(id);
  wrapper.appendChild(nickname);
  wrapper.appendChild(rights);
  actions.appendChild(delButton);
  wrapper.appendChild(actions);
  wrapper.appendChild(id);
  records.appendChild(wrapper);
}

function updateParticipants() {
  $('#online-users-list').html("");
  $('#participants-records').html("");
  $('#participants--topic-name').html("Topic: " + chat.session.settings.topicName);
  var mypkfp = chat.session.publicKeyFingerprint;
  var participantsKeys = Object.keys(chat.session.metadata.participants).filter(function (val) {
    return val !== mypkfp;
  });
  var recipientChoice = document.querySelector("#select-member");
  var defaultRecipient = document.createElement("option");
  defaultRecipient.setAttribute("value", "ALL");
  defaultRecipient.innerText = "All";
  recipientChoice.innerHTML = "";
  recipientChoice.appendChild(defaultRecipient);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = participantsKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pkfp = _step.value;
      addParticipantToSettings(pkfp);
      var participantId = document.createElement("span");
      participantId.classList.add("online-user-id");
      participantId.innerText = pkfp;
      var status = document.createElement("img");
      status.classList.add("participant-status");
      status.setAttribute("src", "/img/online.png");
      var pName = document.createElement("input");
      pName.value = chat.getMemberAlias(pkfp) || chat.getMemberNickname(pkfp) || "Anonymous";
      pName.addEventListener("change", participantAliasChange);
      pName.classList.add("participant-alias");
      var pRow = document.createElement("div");
      pRow.classList.add("online-user-row");
      pRow.appendChild(participantId);
      pRow.appendChild(status);
      pRow.appendChild(pName);

      if (chat.getMemberAlias(pkfp)) {
        var chosenName = document.createElement("span");
        chosenName.innerText = "(" + (chat.getMemberNickname(pkfp) || "Anonymous") + ")";
        pRow.appendChild(chosenName);
      }

      document.querySelector("#online-users-list").appendChild(pRow); //Adding to list of recipients

      var recipientOption = document.createElement("option");
      recipientOption.setAttribute("value", pkfp);
      recipientOption.innerText = pName.value + " (" + chat.getMemberNickname(pkfp) + ")";
      recipientChoice.appendChild(recipientOption);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var participantsRecords = document.querySelector("#participants-records");

  if (participantsRecords.children.length > 0) {
    participantsRecords.lastChild.classList.add("participant-wrapper-last");
  }
}

function updateLoadedMessages() {
  document.querySelector("#chat_window").childNodes.forEach(function (msg) {
    if (msg.classList.contains("service-record")) {
      return;
    } else if (msg.classList.contains("my_message")) {
      if (!msg.classList.contains("private-message")) {
        return;
      }

      try {
        var heading = msg.firstChild;
        var pkfp = heading.querySelector(".m-recipient-id").innerHTML;
        heading.querySelector(".private-mark").innerText = "(private to " + chat.getMemberAlias(pkfp) + ")";
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        var _heading = msg.firstChild;

        var _pkfp = _heading.querySelector(".m-author-id").innerHTML;

        _heading.querySelector(".m-alias").innerText = chat.getMemberAlias(_pkfp);
      } catch (err) {
        console.error(err);
      }
    }
  });
}

function processLogin(messages) {
  setView("chat");
  var nickName = chat.session.settings.nickname;
  $('#user-name').val(nickName);
  $('#topic-name').val(chat.session.settings.topicName);
  if (chat.session.metadata.topicName) document.title = chat.session.metadata.topicName;
  updateParticipants();
  setNavbarListeners();
  syncPendingInvites();
  onLoginFillParticipants();
  onLoginLoadMessages(messages);
}

function processMessagesLoaded(messages) {
  while (messages.length > 0) {
    var message = messages.shift();

    try {
      message = typeof message === "string" ? JSON.parse(message) : message;
    } catch (err) {
      console.log("Could not parse json. Message: " + messages[messages.length - i - 1]);
      continue;
    }

    var authorPkfp = message.header.author;
    var alias = isMyMessage(authorPkfp) ? chat.getMemberNickname(authorPkfp) : chat.getMemberRepr(authorPkfp);
    appendMessageToChat({
      nickname: message.header.nickname,
      alias: alias,
      body: message.body,
      timestamp: message.header.timestamp,
      pkfp: message.header.author,
      service: message.header.service,
      private: message.header.private,
      recipient: message.header.recipient,
      messageID: message.header.id,
      attachments: message.attachments
    }, true);
  }
}

function processLogout() {
  console.log("Processing logout");
  document.querySelector('#chat_window').innerHTML = "";
  chat.logout();
  setView("auth");
  toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("You have successfully logged out!");
}

function setNavbarListeners() {
  $('#chat-view-button').click(function () {
    setView("chat");
  });
  $('#settings-view-button').click(function () {
    setView("settings");
  });
  $('#logout-button').click(function () {
    processLogout();
  });
}

function onLoginLoadMessages(messages) {
  document.querySelector("#chat_window").innerHTML = "";

  for (var _i2 = 0; _i2 < messages.length; ++_i2) {
    var message = void 0;

    try {
      message = typeof messages[messages.length - _i2 - 1] === "string" ? JSON.parse(messages[messages.length - _i2 - 1]) : messages[messages.length - _i2 - 1];
    } catch (err) {
      console.log("Could not parse json. Message: " + messages[messages.length - _i2 - 1]);
      continue;
    }

    var pkfp = message.header.author;
    var alias = isMyMessage(pkfp) ? chat.getMemberNickname(pkfp) : chat.getMemberRepr(pkfp);
    appendMessageToChat({
      nickname: message.header.nickname,
      alias: alias,
      body: message.body,
      timestamp: message.header.timestamp,
      pkfp: message.header.author,
      messageID: message.header.id,
      service: message.header.service,
      private: message.header.private,
      recipient: message.header.recipient,
      attachments: message.attachments
    });
  }
}

function onLoginFillParticipants() {}
/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */


function appendMessageToChat(message) {
  var toHead = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var chatWindow = document.querySelector('#chat_window');
  var msg = document.createElement('div');
  var message_id = document.createElement('div');
  var message_body = document.createElement('div');
  message_body.classList.add('msg-body');
  var message_heading = buildMessageHeading(message);

  if (isMyMessage(message.pkfp)) {
    // My message
    msg.classList.add('my_message');
  } else if (message.service) {
    msg.classList.add('service-record');
  } else {
    //Not my Message
    msg.classList.add('message');
    var author = document.createElement('div');
    author.classList.add("m-author-id");
    author.innerHTML = message.pkfp;
    message_heading.appendChild(author);
  }

  if (message.private) {
    var privateMark = preparePrivateMark(message);
    message_heading.appendChild(privateMark);
    msg.classList.add('private-message');
  }

  message_id.classList.add("message-id");
  message_id.innerHTML = message.messageID;
  message_heading.appendChild(message_id);
  message_body.appendChild(processMessageBody(message.body)); //msg.innerHTML = '<b>'+message.author +'</b><br>' + message.message;
  //processing attachments

  var attachments = processAttachments(message.attachments);
  msg.appendChild(message_heading);
  msg.appendChild(message_body);

  if (attachments !== undefined) {
    msg.appendChild(attachments);
  }

  if (toHead) {
    chatWindow.insertBefore(msg, chatWindow.firstChild);
  } else {
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function buildMessageHeading(message) {
  var message_heading = document.createElement('div');
  message_heading.classList.add('msg-heading');
  var alias, aliasNicknameDevisor;

  if (message.alias) {
    alias = document.createElement("b");
    alias.classList.add("m-alias");
    alias.innerText = message.alias;
    aliasNicknameDevisor = document.createElement("span");
    aliasNicknameDevisor.innerText = "  --  ";
  }

  var nickname = document.createElement("b");
  nickname.innerText = message.nickname;
  nickname.classList.add("m-nickname");
  var time_stamp = document.createElement('span');
  time_stamp.innerHTML = getChatFormatedDate(message.timestamp);
  time_stamp.classList.add('msg-time-stamp');

  if (isMyMessage(message.pkfp)) {
    message_heading.appendChild(time_stamp);
    message_heading.appendChild(nickname);
  } else if (message.service) {
    message_heading.innerHTML += '<b>Service  </b>';
    message_heading.appendChild(time_stamp);
  } else {
    //Not my Message
    if (message.alias) {
      message_heading.appendChild(alias);
      message_heading.appendChild(aliasNicknameDevisor);
    }

    message_heading.appendChild(nickname);
    message_heading.appendChild(time_stamp);
  }

  if (message.recipient && message.recipient !== "ALL") {
    var recipientId = document.createElement("div");
    recipientId.innerHTML = message.recipient;
    recipientId.classList.add("m-recipient-id");
    message_heading.appendChild(recipientId);
  }

  return message_heading;
}

function preparePrivateMark(message) {
  var privateMark = document.createElement("span");
  privateMark.classList.add("private-mark");

  if (isMyMessage(message.pkfp)) {
    privateMark.innerText = "(private to: ";
    var recipientName = chat.getMemberRepr(message.recipient);
    privateMark.innerText += recipientName + ")";
  } else {
    privateMark.innerText = "(private)";
  }

  return privateMark;
}
/**
 * Click handler when user clicks on attached file
 * @param ev
 * @returns {Promise<void>}
 */


function downloadOnClick(_x4) {
  return _downloadOnClick.apply(this, arguments);
}
/**
 * Processes all the attachments and returns
 * attachments wrapper which can be appended to a message
 * If no attachments are passed - returns undefined
 * @param attachments
 * @returns {*}
 */


function _downloadOnClick() {
  _downloadOnClick = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee6(ev) {
    var target, fileInfo, file;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            console.log("Download event triggered!");
            target = ev.target;

            while (target && !target.classList.contains("att-view")) {
              target = target.parentNode;
            }

            if (target) {
              _context6.next = 5;
              break;
            }

            throw "att-view container not found...";

          case 5:
            fileInfo = target.nextSibling.innerHTML; //Extract fileInfo from message

            console.log("obtained fileinfo: " + fileInfo);
            _context6.next = 9;
            return chat.downloadAttachment(fileInfo);

          case 9:
            file = _context6.sent;

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return _downloadOnClick.apply(this, arguments);
}

function processAttachments(attachments) {
  if (attachments === undefined) {
    return undefined;
  }

  var getAttachmentSize = function getAttachmentSize(size) {
    var res = "";
    size = parseInt(size);

    if (size < 1000) {
      res = size.toString() + "b";
    } else if (size < 1000000) {
      res = Number((size / 1000).toFixed(1)).toString() + "kb";
    } else if (size < 1000000000) {
      res = Number((size / 1000000).toFixed(1)).toString() + "mb";
    } else {
      res = Number((size / 1000000000).toFixed(1)).toString() + "gb";
    }

    return res;
  };

  var attachmentsWrapper = document.createElement("div");
  attachmentsWrapper.classList.add("msg-attachments");
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = attachments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var att = _step2.value;
      var attachment = document.createElement("div");
      var attView = document.createElement("div");
      var attInfo = document.createElement("div");
      var attSize = document.createElement("span");
      var attName = document.createElement("span");
      var attIcon = document.createElement("span");
      var iconImage = document.createElement("img"); // //State icons

      var attState = document.createElement("div");
      attState.classList.add("att-state");
      var spinner = document.createElement("img");
      spinner.classList.add("spinner");
      spinner.src = "/img/spinner.gif";
      spinner.display = "none";
      attState.appendChild(spinner);
      iconImage.src = "/img/attachment.png";
      attSize.classList.add("att-size");
      attView.classList.add("att-view");
      attInfo.classList.add("att-info");
      attName.classList.add("att-name");
      iconImage.classList.add("att-icon");
      attIcon.appendChild(iconImage);
      attInfo.innerHTML = JSON.stringify(att);
      attName.innerText = att.name;
      attSize.innerHTML = getAttachmentSize(att.size); //Appending elements to attachment view

      attView.appendChild(attState);
      attView.appendChild(attIcon);
      attView.appendChild(attName);
      attView.appendChild(attSize);
      attView.addEventListener("click", downloadOnClick);
      attachment.appendChild(attView);
      attachment.appendChild(attInfo);
      attachmentsWrapper.appendChild(attachment);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return attachmentsWrapper;
}

function processMessageBody(text) {
  text = text.trim();
  var result = document.createElement("div");
  var startPattern = /__code/;
  var endPattern = /__end/; //no code

  if (text.search(startPattern) === -1) {
    result.appendChild(document.createTextNode(text));
    return result;
  } //first occurrence of the code


  var firstOccurrence = text.search(startPattern);

  if (text.substring(0, firstOccurrence).length > 0) {
    result.appendChild(document.createTextNode(text.substring(0, firstOccurrence)));
    text = text.substr(firstOccurrence);
  }

  var substrings = text.split(startPattern).filter(function (el) {
    return el.length !== 0;
  });

  for (var _i3 = 0; _i3 < substrings.length; ++_i3) {
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    var afterText = null;

    var endCode = substrings[_i3].search(endPattern);

    if (endCode === -1) {
      code.innerText = processCodeBlock(substrings[_i3]);
    } else {
      code.innerText = processCodeBlock(substrings[_i3].substring(0, endCode));

      var rawAfterText = substrings[_i3].substr(endCode + 5).trim();

      if (rawAfterText.length > 0) afterText = document.createTextNode(rawAfterText);
    } //highliter:


    hljs.highlightBlock(code); ///////////

    pre.appendChild(code);
    result.appendChild(pre);
    pre.ondblclick = showCodeView;
    if (afterText) result.appendChild(afterText);
  }

  return result;
}

function showCodeView(event) {
  var pre = document.createElement("pre");
  pre.innerHTML = event.target.innerHTML;
  var div = document.createElement("div");
  div.appendChild(pre);
  showModalNotification("Code:", div.innerHTML);
}

function closeCodeView() {
  clearModal();
  document.querySelector("#code-view").style.display = "none";
}

function processCodeBlock(code) {
  code = code.trim();
  var separator = code.match(/\r?\n/) ? code.match(/\r?\n/)[0] : "\r\n";
  var lines = code.split(/\r?\n/);
  var min = Infinity;

  for (var _i4 = 1; _i4 < lines.length; ++_i4) {
    if (lines[_i4] === "") continue;

    try {
      min = Math.min(lines[_i4].match(/^\s+/)[0].length, min);
    } catch (err) {
      //found a line with no spaces, therefore returning the entire block as is
      return lines.join(separator);
    }
  }

  for (var _i5 = 1; _i5 < lines.length; ++_i5) {
    lines[_i5] = lines[_i5].substr(min);
  }

  return lines.join(separator);
}

function generateInvite(ev) {
  ensureConnected();
  console.log("Generating invite");
  buttonLoadingOn(ev.target);
  chat.requestInvite();
}

function addNewParticipant() {
  var nickname = document.querySelector('#new-participant-nickname').value;
  var pubKey = document.querySelector('#new-participant-public-key').value;
  var residence = document.querySelector('#new-participant-residence').value;
  var rights = document.querySelector('#new-participant-rights').value;
  chat.addNewParticipant(nickname, pubKey, residence, rights);
}

function broadcastNewMessage() {
  var newMessage = document.querySelector('#new-message').value;
  chat.shoutMessage(newMessage);
}

function displayNewTopicData(data, heading, toastrMessage) {
  heading = heading ? heading : "Your new topic data. SAVE YOUR PRIVATE KEY!!!";
  toastrMessage = toastrMessage ? toastrMessage : "Topic was created successfully!";
  var nicknameWrapper = document.createElement("div");
  var pkWrapper = document.createElement("div");
  var bodyWrapper = document.createElement("div");
  nicknameWrapper.innerHTML = "<b>Nickname: </b>" + data.nickname;
  pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + data.privateKey + "</textarea>";
  bodyWrapper.appendChild(nicknameWrapper);
  bodyWrapper.appendChild(pkWrapper);
  var tempWrap = document.createElement("div");
  tempWrap.appendChild(bodyWrapper);
  showModalNotification(heading, tempWrap.innerHTML);
  toastr__WEBPACK_IMPORTED_MODULE_3__["success"](toastrMessage);
}

function showInviteCode(newInvite) {
  syncPendingInvites();
  showModalNotification("Here is your invite code:", newInvite);
  toastr__WEBPACK_IMPORTED_MODULE_3__["success"]("New invite was generated successfully!");
}

function showModalNotification(headingText, bodyContent) {
  var wrapper = document.createElement("div");
  wrapper.classList.add("modal-notification--wrapper");
  var heading = document.createElement("h3");
  heading.classList.add("modal-notification--heading");
  var body = document.createElement("div");
  body.classList.add("modal-notification--body");
  heading.innerText = headingText;
  body.innerHTML = bodyContent;
  wrapper.appendChild(heading);
  wrapper.appendChild(body);
  var modalContent = document.querySelector('#code--content');
  modalContent.innerHTML = "";
  modalContent.appendChild(wrapper);
  var modalView = document.querySelector('#code-view');
  modalView.style.display = "block";
}

function loadingOn() {
  $('body').waitMe({
    effect: 'roundBounce',
    bg: 'rgba(255,255,255,0.7)',
    textPos: 'vertical',
    color: '#33b400'
  });
}

function loadingOff() {
  $('body').waitMe('hide');
}

function setView(view) {
  switch (view) {
    case "chat":
      $('#chat_room').css('display', 'flex');
      $('#you_online').css('display', 'flex');
      $('#auth-wrapper').hide();
      $('#chat-menu').css('display', 'flex');
      $('#settings-view').hide();
      $('#chat-view-button').addClass("active");
      $('#settings-view-button ').removeClass("active");
      break;

    case "auth":
      $('#chat_room').hide();
      $('#you_online').hide();
      $('#auth-wrapper').css('display', 'block');
      $('#chat-menu').hide();
      $('#settings-view').hide();
      break;

    case "settings":
      $('#settings-view').css('display', 'flex');
      $('#chat_room').hide();
      $('#you_online').hide();
      $('#auth-wrapper').hide();
      $('#chat-menu').css('display', 'flex');
      $('#chat-view-button').removeClass("active");
      $('#settings-view-button').addClass("active");
      break;

    default:
      throw "setView: Invalid view: " + view;
  }
}

function syncPendingInvites() {
  if (!chat.session) {
    return;
  } else if (chat.session.settings.invites === undefined) {
    chat.settingsInitInvites();
    return;
  }

  var invites = Object.keys(chat.session.settings.invites);
  var container = document.querySelector('#pending-invites');
  container.innerHTML = "";

  for (var _i6 in invites) {
    var inviteWrap = document.createElement("div");
    var inviteNum = document.createElement("div");
    var inviteRep = document.createElement("input");
    var inviteCopy = document.createElement("div");
    var inviteDel = document.createElement("div");
    var inviteID = document.createElement("div");
    var inviteCopyButton = document.createElement("button");
    var inviteDelButton = document.createElement("button");
    inviteWrap.classList.add("invite-wrap");
    inviteRep.classList.add("invite-rep");
    inviteID.classList.add("invite-id");
    inviteDel.classList.add("invite-del");
    inviteNum.classList.add("invite-num");
    inviteDelButton.classList.add("invite-del-button");
    inviteCopyButton.classList.add("invite-copy-button");
    inviteCopy.classList.add("invite-copy");
    inviteDelButton.innerText = 'Del';
    inviteCopyButton.innerText = 'Copy invite code';
    inviteDelButton.onclick = deleteInvite;
    inviteID.innerText = invites[_i6];
    inviteRep.value = chat.session.settings.invites[invites[_i6]].name ? chat.session.settings.invites[invites[_i6]].name : "New member";
    inviteNum.innerText = "#" + (parseInt(_i6) + 1);
    inviteDel.appendChild(inviteDelButton);
    inviteCopy.appendChild(inviteCopyButton);
    inviteWrap.appendChild(inviteNum);
    inviteWrap.appendChild(inviteRep);
    inviteWrap.appendChild(inviteCopy);
    inviteWrap.appendChild(inviteDel);
    inviteWrap.appendChild(inviteID);
    inviteCopyButton.addEventListener("click", copyInviteCode);
    inviteRep.addEventListener("click", editInviteeName);
    container.appendChild(inviteWrap);
  }
}

function editInviteeName(event) {
  tempName = event.target.value;
  event.target.value = "";
  event.target.addEventListener("focusout", processInviteeNameInput);
  event.target.addEventListener("keyup", inviteEditingProcessKeyPress);
}

function inviteEditingProcessKeyPress(event) {
  if (event.keyCode === 13) {
    console.log("Enter pressed!");
    event.target.blur();
  }
}

function processInviteeNameInput(event) {
  var newName = event.target.value.trim();

  if (newName === "") {
    event.target.value = tempName;
    return;
  } else {
    chat.updateSetInviteeName(event.target.parentNode.lastChild.innerHTML, newName);
  }

  event.target.removeEventListener("focusout", processInviteeNameInput);
}

function copyInviteCode(event) {
  var inviteElement = event.target.parentNode.parentNode.lastChild;
  var inviteID = inviteElement.innerHTML;
  var textArea = document.createElement("textarea");
  textArea.value = inviteID;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    toastr__WEBPACK_IMPORTED_MODULE_3__["info"]("Invite code was copied to the clipboard");
  } catch (err) {
    toastr__WEBPACK_IMPORTED_MODULE_3__["error"]("Error copying invite code to the clipboard");
  }

  textArea.remove();
}

function deleteInvite(event) {
  ensureConnected();
  var button = event.target;
  var inviteID = button.parentNode.parentNode.lastChild.innerHTML;
  chat.deleteInvite(inviteID);
}

function processTopicJoinSuccess(data) {
  clearInviteInputs();
  loadingOff();
  var heading = "You have joined topic successfully, and can now login. SAVE YOUR PRIVATE KEY!!!";
  var toastrMessage = "Topic was created successfully!";
  displayNewTopicData(data, heading, toastrMessage);
}

function enableSettingsMenuListeners() {
  var menuItems = document.querySelector("#settings-menu").children;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = menuItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _i7 = _step3.value;

      _i7.addEventListener("click", processSettingsMenuClick);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  document.querySelector("#invites-container").style.display = "flex";
  document.querySelector("#chat-settings").style.display = "none";
  document.querySelector("#participants-container").style.display = "none";
  document.querySelector("#admin-tools-container").style.display = "none";
}

function processSettingsMenuClick(event) {
  var menuItems = document.querySelector("#settings-menu").children;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = menuItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _i8 = _step4.value;

      _i8.classList.remove("active");
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var target = event.target;
  target.classList.add("active");
  document.querySelector("#invites-container").style.display = target.innerText === "INVITES" ? "flex" : "none";
  document.querySelector("#participants-container").style.display = target.innerText === "PARTICIPANTS" ? "flex" : "none";
  document.querySelector("#chat-settings").style.display = target.innerText === "CHAT SETTINGS" ? "flex" : "none";
  document.querySelector("#admin-tools-container").style.display = target.innerText === "ADMIN TOOLS" ? "flex" : "none";
}

function processChatScroll(event) {
  var chatWindow = event.target;
  if (!chatWindow.firstChild) return;

  if ($(event.target).scrollTop() <= 1) {
    //load more messages
    var lastLoadedMessageID = chatWindow.firstChild.querySelector(".message-id").innerText;
    chat.loadMoreMessages(lastLoadedMessageID);
  }
}

function clearModal() {
  $("#code--content").html("");
}

function clearInviteInputs() {
  $("#invite-code").val("");
  $("#join-nickname").val("");
}

function clearNewTopicFields() {
  $("#new-topic-nickname").val("");
  $("#new-topic-name").val("");
}

function clearLoginPrivateKey() {
  $("#private-key").val("");
}

function clearAllInputs() {
  clearModal();
  clearInviteInputs();
  clearNewTopicFields();
  clearLoginPrivateKey();
}

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} ///Testing blob download


function downloadAttachment(fileName, data) {
  var arr = new Uint8Array(data);
  var fileURL = URL.createObjectURL(new Blob([arr]));
  downloadURI(fileURL, fileName);
}
/**
 * Searches loaded message with provided ID
 * @param id
 */


function findMessage(id) {
  var chatWindow = document.querySelector("#chat_window");
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = chatWindow.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var msg = _step5.value;

      if (msg.getElementsByClassName("message-id")[0].innerHTML == id) {
        console.log("Message found");
        return msg;
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

function loadAudio(_x5, _x6) {
  return _loadAudio.apply(this, arguments);
}

function _loadAudio() {
  _loadAudio = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee7(fileInfo, fileData) {
    var message, audio, arr, fileURL, viewWrap;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            //search right message
            message = findMessage(fileInfo.messageID);

            if (message) {
              _context7.next = 4;
              break;
            }

            console.error("Message not found");
            return _context7.abrupt("return");

          case 4:
            audio = document.createElement("audio");
            arr = new Uint8Array(fileData);
            fileURL = URL.createObjectURL(new Blob([arr]));
            audio.setAttribute("controls", "");
            audio.setAttribute("src", fileURL);
            viewWrap = message.getElementsByClassName("att-view")[0];
            viewWrap.innerHTML = "";
            viewWrap.appendChild(audio);
            console.log("Removing even listener");
            viewWrap.removeEventListener("click", downloadOnClick);

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));
  return _loadAudio.apply(this, arguments);
}

function processAttachmentChosen(ev) {
  var attachemtsWrapper = document.querySelector("#chosen-files");
  var fileData = ev.target.files[0];
  attachemtsWrapper.innerHTML = "";

  if (!fileData) {
    return;
  }

  var attWrapper = document.createElement("div");
  attWrapper.classList.add("chosen-file-wrap");
  var chosenFileTxt = document.createElement("div");
  chosenFileTxt.classList.add("chosen-file");
  chosenFileTxt.innerText = fileData.name;
  var closeImg = document.createElement("img");
  closeImg.setAttribute("src", "/img/close.png");
  closeImg.addEventListener("click", clearAttachments);
  attWrapper.appendChild(closeImg);
  attWrapper.appendChild(chosenFileTxt);
  attachemtsWrapper.appendChild(attWrapper);
}

function clearAttachments() {
  var attachemtsInput = document.querySelector("#attach-file");
  attachemtsInput.value = "";
  var attachemtsWrapper = document.querySelector("#chosen-files");
  attachemtsWrapper.innerHTML = "";
}

function editMyNickname(ev) {
  var newNickname = ev.target.value.trim();

  if (!newNickname || newNickname === chat.session.settings.nickname) {
    ev.target.value = chat.session.settings.nickname;
    ev.target.blur();
    return;
  }

  ev.target.value = newNickname;
  chat.myNicknameUpdate(ev.target.value);
  ev.target.blur();
}

function editTopicName(ev) {
  var newTopicName = ev.target.value.trim();

  if (!newTopicName || newTopicName === chat.session.settings.topicName) {
    ev.target.value = chat.session.settings.topicName;
    ev.target.blur();
    return;
  }

  ev.target.value = newTopicName;
  chat.topicNameUpdate(ev.target.value);
  ev.target.blur();
}

function buttonLoadingOn(element) {
  element.classList.add("running");
  element.classList.add("disabled");
}

function buttonLoadingOff(element) {
  element.classList.remove("running");
  element.classList.remove("disabled");
}

function refreshInvites(ev) {
  ensureConnected();
  console.log("Generating invite");
  buttonLoadingOn(ev.target);
  chat.syncInvites();
}

function refreshInvitesSuccess() {
  buttonLoadingOff(document.querySelector("#refresh-invites"));
  toastr__WEBPACK_IMPORTED_MODULE_3__["success"]("Invites re-synced");
}

function switchConnectionStatus(connected) {
  var positive = document.querySelector("#connection-status--connected");
  var negative = document.querySelector("#connection-status--disconnected");

  if (connected) {
    $(positive).show();
    $(negative).hide();
  } else {
    $(positive).hide();
    $(negative).show();
  }
}

function attemptReconnection() {
  chat.attemptReconnection().then(function () {}).catch(function (err) {
    console.trace(err);
  });
}

function switchSounds(ev) {
  if (chat.session.settings.soundsOn) {
    chat.session.settings.soundsOn = false;
    ev.target.src = soundsOnOfIcons.off;
  } else {
    chat.session.settings.soundsOn = true;
    ev.target.src = soundsOnOfIcons.on;
  }
}

function participantAliasChange(ev) {
  console.log("Processing participant alias change");
  ensureConnected();
  var id = ev.target.parentNode.firstChild.innerText;
  var newAlias = ev.target.value.trim();

  if (!newAlias) {
    chat.deleteMemberAlias(id);
  } else {
    chat.setMemberAlias(id, ev.target.value);
  }

  chat.saveClientSettings();
}

function ensureConnected() {
  if (!chat.islandConnectionStatus) {
    toastr__WEBPACK_IMPORTED_MODULE_3__["warning"]("You are disconnected from the island. Please reconnect to continue");
    throw "No island connection";
  }
}

function lockSend(val) {
  sendLock = !!val;
  var sendButton = document.querySelector('#send-new-msg');
  var newMsgField = document.querySelector('#new-msg');
  sendLock ? buttonLoadingOn(sendButton) : buttonLoadingOff(sendButton);
  sendLock ? newMsgField.setAttribute("disabled", true) : newMsgField.removeAttribute("disabled");
}

function processMainMenuSwitch(ev) {
  var menuLength = mainMenuItems.length;
  var activeIndex = mainMenuItems.filter(function (item) {
    return item.active;
  })[0].index;
  var newActive = (ev.currentTarget.classList.contains("right-arrow-wrap") ? activeIndex + 1 : activeIndex - 1) % menuLength;

  if (newActive < 0) {
    newActive = menuLength + newActive;
  }

  mainMenuItems[activeIndex].active = false;
  mainMenuItems[newActive].active = true;
  $(mainMenuItems[activeIndex].selector).hide("fast");
  $(mainMenuItems[newActive].selector).show("fast");
  var nextIndex = (newActive + 1) % menuLength;
  var previousIndex = (newActive - 1) % menuLength;

  if (previousIndex < 0) {
    previousIndex = menuLength + previousIndex;
  }

  document.querySelector("#left-arrow-text").innerHTML = mainMenuItems[previousIndex].subtitle;
  document.querySelector("#right-arrow-text").innerHTML = mainMenuItems[nextIndex].subtitle; // active = get active
  // if arrow right:
  //activate next
  // else
  //activate previous
  //set subtitles
}

/***/ }),

/***/ 160:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);



var sjcl = {
  cipher: {},
  hash: {},
  keyexchange: {},
  mode: {},
  misc: {},
  codec: {},
  exception: {
    corrupt: function corrupt(a) {
      this.toString = function () {
        return "CORRUPT: " + this.message;
      };

      this.message = a;
    },
    invalid: function invalid(a) {
      this.toString = function () {
        return "INVALID: " + this.message;
      };

      this.message = a;
    },
    bug: function bug(a) {
      this.toString = function () {
        return "BUG: " + this.message;
      };

      this.message = a;
    },
    notReady: function notReady(a) {
      this.toString = function () {
        return "NOT READY: " + this.message;
      };

      this.message = a;
    }
  }
};

sjcl.cipher.aes = function (a) {
  this.M[0][0][0] || this.T();
  var b,
      d,
      c,
      e,
      f = this.M[0][4],
      g = this.M[1];
  b = a.length;
  var h = 1;
  if (4 !== b && 6 !== b && 8 !== b) throw new sjcl.exception.invalid("invalid aes key size");
  this.i = [c = a.slice(0), e = []];

  for (a = b; a < 4 * b + 28; a++) {
    d = c[a - 1];
    if (0 === a % b || 8 === b && 4 === a % b) d = f[d >>> 24] << 24 ^ f[d >> 16 & 255] << 16 ^ f[d >> 8 & 255] << 8 ^ f[d & 255], 0 === a % b && (d = d << 8 ^ d >>> 24 ^ h << 24, h = h << 1 ^ 283 * (h >> 7));
    c[a] = c[a - b] ^ d;
  }

  for (b = 0; a; b++, a--) {
    d = c[b & 3 ? a : a - 4], e[b] = 4 >= a || 4 > b ? d : g[0][f[d >>> 24]] ^ g[1][f[d >> 16 & 255]] ^ g[2][f[d >> 8 & 255]] ^ g[3][f[d & 255]];
  }
};

sjcl.cipher.aes.prototype = {
  encrypt: function encrypt(a) {
    return ba(this, a, 0);
  },
  decrypt: function decrypt(a) {
    return ba(this, a, 1);
  },
  M: [[[], [], [], [], []], [[], [], [], [], []]],
  T: function T() {
    var a = this.M[0],
        b = this.M[1],
        d = a[4],
        c = b[4],
        e,
        f,
        g,
        h = [],
        k = [],
        l,
        m,
        n,
        p;

    for (e = 0; 0x100 > e; e++) {
      k[(h[e] = e << 1 ^ 283 * (e >> 7)) ^ e] = e;
    }

    for (f = g = 0; !d[f]; f ^= l || 1, g = k[g] || 1) {
      for (n = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4, n = n >> 8 ^ n & 255 ^ 99, d[f] = n, c[n] = f, m = h[e = h[l = h[f]]], p = 0x1010101 * m ^ 0x10001 * e ^ 0x101 * l ^ 0x1010100 * f, m = 0x101 * h[n] ^ 0x1010100 * n, e = 0; 4 > e; e++) {
        a[e][f] = m = m << 24 ^ m >>> 8, b[e][n] = p = p << 24 ^ p >>> 8;
      }
    }

    for (e = 0; 5 > e; e++) {
      a[e] = a[e].slice(0), b[e] = b[e].slice(0);
    }
  }
};

function ba(a, b, d) {
  if (4 !== b.length) throw new sjcl.exception.invalid("invalid aes block size");
  var c = a.i[d],
      e = b[0] ^ c[0],
      f = b[d ? 3 : 1] ^ c[1],
      g = b[2] ^ c[2];
  b = b[d ? 1 : 3] ^ c[3];
  var h,
      k,
      l,
      m = c.length / 4 - 2,
      n,
      p = 4,
      r = [0, 0, 0, 0];
  h = a.M[d];
  a = h[0];
  var t = h[1],
      I = h[2],
      H = h[3],
      x = h[4];

  for (n = 0; n < m; n++) {
    h = a[e >>> 24] ^ t[f >> 16 & 255] ^ I[g >> 8 & 255] ^ H[b & 255] ^ c[p], k = a[f >>> 24] ^ t[g >> 16 & 255] ^ I[b >> 8 & 255] ^ H[e & 255] ^ c[p + 1], l = a[g >>> 24] ^ t[b >> 16 & 255] ^ I[e >> 8 & 255] ^ H[f & 255] ^ c[p + 2], b = a[b >>> 24] ^ t[e >> 16 & 255] ^ I[f >> 8 & 255] ^ H[g & 255] ^ c[p + 3], p += 4, e = h, f = k, g = l;
  }

  for (n = 0; 4 > n; n++) {
    r[d ? 3 & -n : n] = x[e >>> 24] << 24 ^ x[f >> 16 & 255] << 16 ^ x[g >> 8 & 255] << 8 ^ x[b & 255] ^ c[p++], h = e, e = f, f = g, g = b, b = h;
  }

  return r;
}

sjcl.bitArray = {
  bitSlice: function bitSlice(a, b, d) {
    a = sjcl.bitArray.ra(a.slice(b / 32), 32 - (b & 31)).slice(1);
    return void 0 === d ? a : sjcl.bitArray.clamp(a, d - b);
  },
  extract: function extract(a, b, d) {
    var c = Math.floor(-b - d & 31);
    return ((b + d - 1 ^ b) & -32 ? a[b / 32 | 0] << 32 - c ^ a[b / 32 + 1 | 0] >>> c : a[b / 32 | 0] >>> c) & (1 << d) - 1;
  },
  concat: function concat(a, b) {
    if (0 === a.length || 0 === b.length) return a.concat(b);
    var d = a[a.length - 1],
        c = sjcl.bitArray.getPartial(d);
    return 32 === c ? a.concat(b) : sjcl.bitArray.ra(b, c, d | 0, a.slice(0, a.length - 1));
  },
  bitLength: function bitLength(a) {
    var b = a.length;
    return 0 === b ? 0 : 32 * (b - 1) + sjcl.bitArray.getPartial(a[b - 1]);
  },
  clamp: function clamp(a, b) {
    if (32 * a.length < b) return a;
    a = a.slice(0, Math.ceil(b / 32));
    var d = a.length;
    b = b & 31;
    0 < d && b && (a[d - 1] = sjcl.bitArray.partial(b, a[d - 1] & 2147483648 >> b - 1, 1));
    return a;
  },
  partial: function partial(a, b, d) {
    return 32 === a ? b : (d ? b | 0 : b << 32 - a) + 0x10000000000 * a;
  },
  getPartial: function getPartial(a) {
    return Math.round(a / 0x10000000000) || 32;
  },
  equal: function equal(a, b) {
    if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) return !1;
    var d = 0,
        c;

    for (c = 0; c < a.length; c++) {
      d |= a[c] ^ b[c];
    }

    return 0 === d;
  },
  ra: function ra(a, b, d, c) {
    var e;
    e = 0;

    for (void 0 === c && (c = []); 32 <= b; b -= 32) {
      c.push(d), d = 0;
    }

    if (0 === b) return c.concat(a);

    for (e = 0; e < a.length; e++) {
      c.push(d | a[e] >>> b), d = a[e] << 32 - b;
    }

    e = a.length ? a[a.length - 1] : 0;
    a = sjcl.bitArray.getPartial(e);
    c.push(sjcl.bitArray.partial(b + a & 31, 32 < b + a ? d : c.pop(), 1));
    return c;
  },
  l: function l(a, b) {
    return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
  },
  byteswapM: function byteswapM(a) {
    var b, d;

    for (b = 0; b < a.length; ++b) {
      d = a[b], a[b] = d >>> 24 | d >>> 8 & 0xff00 | (d & 0xff00) << 8 | d << 24;
    }

    return a;
  }
};
sjcl.codec.utf8String = {
  fromBits: function fromBits(a) {
    var b = "",
        d = sjcl.bitArray.bitLength(a),
        c,
        e;

    for (c = 0; c < d / 8; c++) {
      0 === (c & 3) && (e = a[c / 4]), b += String.fromCharCode(e >>> 8 >>> 8 >>> 8), e <<= 8;
    }

    return decodeURIComponent(escape(b));
  },
  toBits: function toBits(a) {
    a = unescape(encodeURIComponent(a));
    var b = [],
        d,
        c = 0;

    for (d = 0; d < a.length; d++) {
      c = c << 8 | a.charCodeAt(d), 3 === (d & 3) && (b.push(c), c = 0);
    }

    d & 3 && b.push(sjcl.bitArray.partial(8 * (d & 3), c));
    return b;
  }
};
sjcl.codec.hex = {
  fromBits: function fromBits(a) {
    var b = "",
        d;

    for (d = 0; d < a.length; d++) {
      b += ((a[d] | 0) + 0xf00000000000).toString(16).substr(4);
    }

    return b.substr(0, sjcl.bitArray.bitLength(a) / 4);
  },
  toBits: function toBits(a) {
    var b,
        d = [],
        c;
    a = a.replace(/\s|0x/g, "");
    c = a.length;
    a = a + "00000000";

    for (b = 0; b < a.length; b += 8) {
      d.push(parseInt(a.substr(b, 8), 16) ^ 0);
    }

    return sjcl.bitArray.clamp(d, 4 * c);
  }
};
sjcl.codec.base32 = {
  D: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  la: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  BITS: 32,
  BASE: 5,
  REMAINING: 27,
  fromBits: function fromBits(a, b, d) {
    var c = sjcl.codec.base32.BASE,
        e = sjcl.codec.base32.REMAINING,
        f = "",
        g = 0,
        h = sjcl.codec.base32.D,
        k = 0,
        l = sjcl.bitArray.bitLength(a);
    d && (h = sjcl.codec.base32.la);

    for (d = 0; f.length * c < l;) {
      f += h.charAt((k ^ a[d] >>> g) >>> e), g < c ? (k = a[d] << c - g, g += e, d++) : (k <<= c, g -= c);
    }

    for (; f.length & 7 && !b;) {
      f += "=";
    }

    return f;
  },
  toBits: function toBits(a, b) {
    a = a.replace(/\s|=/g, "").toUpperCase();
    var d = sjcl.codec.base32.BITS,
        c = sjcl.codec.base32.BASE,
        e = sjcl.codec.base32.REMAINING,
        f = [],
        g,
        h = 0,
        k = sjcl.codec.base32.D,
        l = 0,
        m,
        n = "base32";
    b && (k = sjcl.codec.base32.la, n = "base32hex");

    for (g = 0; g < a.length; g++) {
      m = k.indexOf(a.charAt(g));

      if (0 > m) {
        if (!b) try {
          return sjcl.codec.base32hex.toBits(a);
        } catch (p) {}
        throw new sjcl.exception.invalid("this isn't " + n + "!");
      }

      h > e ? (h -= e, f.push(l ^ m >>> h), l = m << d - h) : (h += c, l ^= m << d - h);
    }

    h & 56 && f.push(sjcl.bitArray.partial(h & 56, l, 1));
    return f;
  }
};
sjcl.codec.base32hex = {
  fromBits: function fromBits(a, b) {
    return sjcl.codec.base32.fromBits(a, b, 1);
  },
  toBits: function toBits(a) {
    return sjcl.codec.base32.toBits(a, 1);
  }
};
sjcl.codec.base64 = {
  D: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  fromBits: function fromBits(a, b, d) {
    var c = "",
        e = 0,
        f = sjcl.codec.base64.D,
        g = 0,
        h = sjcl.bitArray.bitLength(a);
    d && (f = f.substr(0, 62) + "-_");

    for (d = 0; 6 * c.length < h;) {
      c += f.charAt((g ^ a[d] >>> e) >>> 26), 6 > e ? (g = a[d] << 6 - e, e += 26, d++) : (g <<= 6, e -= 6);
    }

    for (; c.length & 3 && !b;) {
      c += "=";
    }

    return c;
  },
  toBits: function toBits(a, b) {
    a = a.replace(/\s|=/g, "");
    var d = [],
        c,
        e = 0,
        f = sjcl.codec.base64.D,
        g = 0,
        h;
    b && (f = f.substr(0, 62) + "-_");

    for (c = 0; c < a.length; c++) {
      h = f.indexOf(a.charAt(c));
      if (0 > h) throw new sjcl.exception.invalid("this isn't base64!");
      26 < e ? (e -= 26, d.push(g ^ h >>> e), g = h << 32 - e) : (e += 6, g ^= h << 32 - e);
    }

    e & 56 && d.push(sjcl.bitArray.partial(e & 56, g, 1));
    return d;
  }
};
sjcl.codec.base64url = {
  fromBits: function fromBits(a) {
    return sjcl.codec.base64.fromBits(a, 1, 1);
  },
  toBits: function toBits(a) {
    return sjcl.codec.base64.toBits(a, 1);
  }
};
sjcl.codec.bytes = {
  fromBits: function fromBits(a) {
    var b = [],
        d = sjcl.bitArray.bitLength(a),
        c,
        e;

    for (c = 0; c < d / 8; c++) {
      0 === (c & 3) && (e = a[c / 4]), b.push(e >>> 24), e <<= 8;
    }

    return b;
  },
  toBits: function toBits(a) {
    var b = [],
        d,
        c = 0;

    for (d = 0; d < a.length; d++) {
      c = c << 8 | a[d], 3 === (d & 3) && (b.push(c), c = 0);
    }

    d & 3 && b.push(sjcl.bitArray.partial(8 * (d & 3), c));
    return b;
  }
};
sjcl.codec.z85 = {
  D: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#",
  ya: [0, 68, 0, 84, 83, 82, 72, 0, 75, 76, 70, 65, 0, 63, 62, 69, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 0, 73, 66, 74, 71, 81, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 77, 0, 78, 67, 0, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 79, 0, 80, 0, 0],
  fromBits: function fromBits(a) {
    if (!a) return null;
    if (0 !== sjcl.bitArray.bitLength(a) % 32) throw new sjcl.exception.invalid("Invalid bitArray length!");

    for (var b = "", d = sjcl.codec.z85.D, c = 0; c < a.length; ++c) {
      for (var e = a[c], f = 0, g = 0; 4 > g; ++g) {
        f = 0x100 * f + (e >>> 8 * (4 - g - 1) & 255);
      }

      for (e = 52200625; e;) {
        b += d.charAt(Math.floor(f / e) % 85), e = Math.floor(e / 85);
      }
    }

    if (b.length !== 5 * a.length) throw new sjcl.exception.invalid("Bad Z85 conversion!");
    return b;
  },
  toBits: function toBits(a) {
    if (!a) return [];
    if (0 !== a.length % 5) throw new sjcl.exception.invalid("Invalid Z85 string!");

    for (var b = [], d = 0, c = sjcl.codec.z85.ya, e = 0, f = 0, g = 0; g < a.length;) {
      if (d = 85 * d + c[a[g++].charCodeAt(0) - 32], 0 === g % 5) {
        for (var h = 0x1000000; h;) {
          e = e * Math.pow(2, 8) + Math.floor(d / h) % 0x100, ++f, 4 === f && (b.push(e), f = e = 0), h = Math.floor(h / 0x100);
        }

        d = 0;
      }
    }

    return b;
  }
};

sjcl.hash.sha256 = function (a) {
  this.i[0] || this.T();
  a ? (this.c = a.c.slice(0), this.h = a.h.slice(0), this.f = a.f) : this.reset();
};

sjcl.hash.sha256.hash = function (a) {
  return new sjcl.hash.sha256().update(a).finalize();
};

sjcl.hash.sha256.prototype = {
  blockSize: 512,
  reset: function reset() {
    this.c = this.A.slice(0);
    this.h = [];
    this.f = 0;
    return this;
  },
  update: function update(a) {
    "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
    var b,
        d = this.h = sjcl.bitArray.concat(this.h, a);
    b = this.f;
    a = this.f = b + sjcl.bitArray.bitLength(a);
    if (0x1fffffffffffff < a) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");

    if ("undefined" !== typeof Uint32Array) {
      var c = new Uint32Array(d),
          e = 0;

      for (b = 512 + b - (512 + b & 0x1ff); b <= a; b += 512) {
        this.m(c.subarray(16 * e, 16 * (e + 1))), e += 1;
      }

      d.splice(0, 16 * e);
    } else for (b = 512 + b - (512 + b & 0x1ff); b <= a; b += 512) {
      this.m(d.splice(0, 16));
    }

    return this;
  },
  finalize: function finalize() {
    var a,
        b = this.h,
        d = this.c,
        b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);

    for (a = b.length + 2; a & 15; a++) {
      b.push(0);
    }

    b.push(Math.floor(this.f / 0x100000000));

    for (b.push(this.f | 0); b.length;) {
      this.m(b.splice(0, 16));
    }

    this.reset();
    return d;
  },
  A: [],
  i: [],
  T: function T() {
    function a(a) {
      return 0x100000000 * (a - Math.floor(a)) | 0;
    }

    for (var b = 0, d = 2, c, e; 64 > b; d++) {
      e = !0;

      for (c = 2; c * c <= d; c++) {
        if (0 === d % c) {
          e = !1;
          break;
        }
      }

      e && (8 > b && (this.A[b] = a(Math.pow(d, .5))), this.i[b] = a(Math.pow(d, 1 / 3)), b++);
    }
  },
  m: function m(a) {
    var b,
        d,
        c,
        e = this.c,
        f = this.i,
        g = e[0],
        h = e[1],
        k = e[2],
        l = e[3],
        m = e[4],
        n = e[5],
        p = e[6],
        r = e[7];

    for (b = 0; 64 > b; b++) {
      16 > b ? d = a[b] : (d = a[b + 1 & 15], c = a[b + 14 & 15], d = a[b & 15] = (d >>> 7 ^ d >>> 18 ^ d >>> 3 ^ d << 25 ^ d << 14) + (c >>> 17 ^ c >>> 19 ^ c >>> 10 ^ c << 15 ^ c << 13) + a[b & 15] + a[b + 9 & 15] | 0), d = d + r + (m >>> 6 ^ m >>> 11 ^ m >>> 25 ^ m << 26 ^ m << 21 ^ m << 7) + (p ^ m & (n ^ p)) + f[b], r = p, p = n, n = m, m = l + d | 0, l = k, k = h, h = g, g = d + (h & k ^ l & (h ^ k)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
    }

    e[0] = e[0] + g | 0;
    e[1] = e[1] + h | 0;
    e[2] = e[2] + k | 0;
    e[3] = e[3] + l | 0;
    e[4] = e[4] + m | 0;
    e[5] = e[5] + n | 0;
    e[6] = e[6] + p | 0;
    e[7] = e[7] + r | 0;
  }
};

sjcl.hash.sha512 = function (a) {
  this.i[0] || this.T();
  a ? (this.c = a.c.slice(0), this.h = a.h.slice(0), this.f = a.f) : this.reset();
};

sjcl.hash.sha512.hash = function (a) {
  return new sjcl.hash.sha512().update(a).finalize();
};

sjcl.hash.sha512.prototype = {
  blockSize: 1024,
  reset: function reset() {
    this.c = this.A.slice(0);
    this.h = [];
    this.f = 0;
    return this;
  },
  update: function update(a) {
    "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
    var b,
        d = this.h = sjcl.bitArray.concat(this.h, a);
    b = this.f;
    a = this.f = b + sjcl.bitArray.bitLength(a);
    if (0x1fffffffffffff < a) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");

    if ("undefined" !== typeof Uint32Array) {
      var c = new Uint32Array(d),
          e = 0;

      for (b = 1024 + b - (1024 + b & 1023); b <= a; b += 1024) {
        this.m(c.subarray(32 * e, 32 * (e + 1))), e += 1;
      }

      d.splice(0, 32 * e);
    } else for (b = 1024 + b - (1024 + b & 1023); b <= a; b += 1024) {
      this.m(d.splice(0, 32));
    }

    return this;
  },
  finalize: function finalize() {
    var a,
        b = this.h,
        d = this.c,
        b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);

    for (a = b.length + 4; a & 31; a++) {
      b.push(0);
    }

    b.push(0);
    b.push(0);
    b.push(Math.floor(this.f / 0x100000000));

    for (b.push(this.f | 0); b.length;) {
      this.m(b.splice(0, 32));
    }

    this.reset();
    return d;
  },
  A: [],
  Fa: [12372232, 13281083, 9762859, 1914609, 15106769, 4090911, 4308331, 8266105],
  i: [],
  Ha: [2666018, 15689165, 5061423, 9034684, 4764984, 380953, 1658779, 7176472, 197186, 7368638, 14987916, 16757986, 8096111, 1480369, 13046325, 6891156, 15813330, 5187043, 9229749, 11312229, 2818677, 10937475, 4324308, 1135541, 6741931, 11809296, 16458047, 15666916, 11046850, 698149, 229999, 945776, 13774844, 2541862, 12856045, 9810911, 11494366, 7844520, 15576806, 8533307, 15795044, 4337665, 16291729, 5553712, 15684120, 6662416, 7413802, 12308920, 13816008, 4303699, 9366425, 10176680, 13195875, 4295371, 6546291, 11712675, 15708924, 1519456, 15772530, 6568428, 6495784, 8568297, 13007125, 7492395, 2515356, 12632583, 14740254, 7262584, 1535930, 13146278, 16321966, 1853211, 294276, 13051027, 13221564, 1051980, 4080310, 6651434, 14088940, 4675607],
  T: function T() {
    function a(a) {
      return 0x100000000 * (a - Math.floor(a)) | 0;
    }

    function b(a) {
      return 0x10000000000 * (a - Math.floor(a)) & 255;
    }

    for (var d = 0, c = 2, e, f; 80 > d; c++) {
      f = !0;

      for (e = 2; e * e <= c; e++) {
        if (0 === c % e) {
          f = !1;
          break;
        }
      }

      f && (8 > d && (this.A[2 * d] = a(Math.pow(c, .5)), this.A[2 * d + 1] = b(Math.pow(c, .5)) << 24 | this.Fa[d]), this.i[2 * d] = a(Math.pow(c, 1 / 3)), this.i[2 * d + 1] = b(Math.pow(c, 1 / 3)) << 24 | this.Ha[d], d++);
    }
  },
  m: function m(a) {
    var b,
        d,
        c = this.c,
        e = this.i,
        f = c[0],
        g = c[1],
        h = c[2],
        k = c[3],
        l = c[4],
        m = c[5],
        n = c[6],
        p = c[7],
        r = c[8],
        t = c[9],
        I = c[10],
        H = c[11],
        x = c[12],
        B = c[13],
        A = c[14],
        y = c[15],
        u;

    if ("undefined" !== typeof Uint32Array) {
      u = Array(160);

      for (var v = 0; 32 > v; v++) {
        u[v] = a[v];
      }
    } else u = a;

    var v = f,
        q = g,
        w = h,
        J = k,
        L = l,
        K = m,
        X = n,
        M = p,
        D = r,
        C = t,
        T = I,
        N = H,
        U = x,
        O = B,
        Y = A,
        P = y;

    for (a = 0; 80 > a; a++) {
      if (16 > a) b = u[2 * a], d = u[2 * a + 1];else {
        d = u[2 * (a - 15)];
        var z = u[2 * (a - 15) + 1];
        b = (z << 31 | d >>> 1) ^ (z << 24 | d >>> 8) ^ d >>> 7;
        var E = (d << 31 | z >>> 1) ^ (d << 24 | z >>> 8) ^ (d << 25 | z >>> 7);
        d = u[2 * (a - 2)];
        var F = u[2 * (a - 2) + 1],
            z = (F << 13 | d >>> 19) ^ (d << 3 | F >>> 29) ^ d >>> 6,
            F = (d << 13 | F >>> 19) ^ (F << 3 | d >>> 29) ^ (d << 26 | F >>> 6),
            Z = u[2 * (a - 7)],
            aa = u[2 * (a - 16)],
            Q = u[2 * (a - 16) + 1];
        d = E + u[2 * (a - 7) + 1];
        b = b + Z + (d >>> 0 < E >>> 0 ? 1 : 0);
        d += F;
        b += z + (d >>> 0 < F >>> 0 ? 1 : 0);
        d += Q;
        b += aa + (d >>> 0 < Q >>> 0 ? 1 : 0);
      }
      u[2 * a] = b |= 0;
      u[2 * a + 1] = d |= 0;
      var Z = D & T ^ ~D & U,
          ga = C & N ^ ~C & O,
          F = v & w ^ v & L ^ w & L,
          ka = q & J ^ q & K ^ J & K,
          aa = (q << 4 | v >>> 28) ^ (v << 30 | q >>> 2) ^ (v << 25 | q >>> 7),
          Q = (v << 4 | q >>> 28) ^ (q << 30 | v >>> 2) ^ (q << 25 | v >>> 7),
          la = e[2 * a],
          ha = e[2 * a + 1],
          z = P + ((D << 18 | C >>> 14) ^ (D << 14 | C >>> 18) ^ (C << 23 | D >>> 9)),
          E = Y + ((C << 18 | D >>> 14) ^ (C << 14 | D >>> 18) ^ (D << 23 | C >>> 9)) + (z >>> 0 < P >>> 0 ? 1 : 0),
          z = z + ga,
          E = E + (Z + (z >>> 0 < ga >>> 0 ? 1 : 0)),
          z = z + ha,
          E = E + (la + (z >>> 0 < ha >>> 0 ? 1 : 0)),
          z = z + d | 0,
          E = E + (b + (z >>> 0 < d >>> 0 ? 1 : 0));
      d = Q + ka;
      b = aa + F + (d >>> 0 < Q >>> 0 ? 1 : 0);
      Y = U;
      P = O;
      U = T;
      O = N;
      T = D;
      N = C;
      C = M + z | 0;
      D = X + E + (C >>> 0 < M >>> 0 ? 1 : 0) | 0;
      X = L;
      M = K;
      L = w;
      K = J;
      w = v;
      J = q;
      q = z + d | 0;
      v = E + b + (q >>> 0 < z >>> 0 ? 1 : 0) | 0;
    }

    g = c[1] = g + q | 0;
    c[0] = f + v + (g >>> 0 < q >>> 0 ? 1 : 0) | 0;
    k = c[3] = k + J | 0;
    c[2] = h + w + (k >>> 0 < J >>> 0 ? 1 : 0) | 0;
    m = c[5] = m + K | 0;
    c[4] = l + L + (m >>> 0 < K >>> 0 ? 1 : 0) | 0;
    p = c[7] = p + M | 0;
    c[6] = n + X + (p >>> 0 < M >>> 0 ? 1 : 0) | 0;
    t = c[9] = t + C | 0;
    c[8] = r + D + (t >>> 0 < C >>> 0 ? 1 : 0) | 0;
    H = c[11] = H + N | 0;
    c[10] = I + T + (H >>> 0 < N >>> 0 ? 1 : 0) | 0;
    B = c[13] = B + O | 0;
    c[12] = x + U + (B >>> 0 < O >>> 0 ? 1 : 0) | 0;
    y = c[15] = y + P | 0;
    c[14] = A + Y + (y >>> 0 < P >>> 0 ? 1 : 0) | 0;
  }
};

sjcl.hash.sha1 = function (a) {
  a ? (this.c = a.c.slice(0), this.h = a.h.slice(0), this.f = a.f) : this.reset();
};

sjcl.hash.sha1.hash = function (a) {
  return new sjcl.hash.sha1().update(a).finalize();
};

sjcl.hash.sha1.prototype = {
  blockSize: 512,
  reset: function reset() {
    this.c = this.A.slice(0);
    this.h = [];
    this.f = 0;
    return this;
  },
  update: function update(a) {
    "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
    var b,
        d = this.h = sjcl.bitArray.concat(this.h, a);
    b = this.f;
    a = this.f = b + sjcl.bitArray.bitLength(a);
    if (0x1fffffffffffff < a) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");

    if ("undefined" !== typeof Uint32Array) {
      var c = new Uint32Array(d),
          e = 0;

      for (b = this.blockSize + b - (this.blockSize + b & this.blockSize - 1); b <= a; b += this.blockSize) {
        this.m(c.subarray(16 * e, 16 * (e + 1))), e += 1;
      }

      d.splice(0, 16 * e);
    } else for (b = this.blockSize + b - (this.blockSize + b & this.blockSize - 1); b <= a; b += this.blockSize) {
      this.m(d.splice(0, 16));
    }

    return this;
  },
  finalize: function finalize() {
    var a,
        b = this.h,
        d = this.c,
        b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);

    for (a = b.length + 2; a & 15; a++) {
      b.push(0);
    }

    b.push(Math.floor(this.f / 0x100000000));

    for (b.push(this.f | 0); b.length;) {
      this.m(b.splice(0, 16));
    }

    this.reset();
    return d;
  },
  A: [1732584193, 4023233417, 2562383102, 271733878, 3285377520],
  i: [1518500249, 1859775393, 2400959708, 3395469782],
  m: function m(a) {
    var b,
        d,
        c,
        e,
        f,
        g,
        h = this.c,
        k;
    if ("undefined" !== typeof Uint32Array) for (k = Array(80), d = 0; 16 > d; d++) {
      k[d] = a[d];
    } else k = a;
    d = h[0];
    c = h[1];
    e = h[2];
    f = h[3];
    g = h[4];

    for (a = 0; 79 >= a; a++) {
      16 <= a && (b = k[a - 3] ^ k[a - 8] ^ k[a - 14] ^ k[a - 16], k[a] = b << 1 | b >>> 31), b = 19 >= a ? c & e | ~c & f : 39 >= a ? c ^ e ^ f : 59 >= a ? c & e | c & f | e & f : 79 >= a ? c ^ e ^ f : void 0, b = (d << 5 | d >>> 27) + b + g + k[a] + this.i[Math.floor(a / 20)] | 0, g = f, f = e, e = c << 30 | c >>> 2, c = d, d = b;
    }

    h[0] = h[0] + d | 0;
    h[1] = h[1] + c | 0;
    h[2] = h[2] + e | 0;
    h[3] = h[3] + f | 0;
    h[4] = h[4] + g | 0;
  }
};
sjcl.mode.ccm = {
  name: "ccm",
  W: [],
  listenProgress: function listenProgress(a) {
    sjcl.mode.ccm.W.push(a);
  },
  unListenProgress: function unListenProgress(a) {
    a = sjcl.mode.ccm.W.indexOf(a);
    -1 < a && sjcl.mode.ccm.W.splice(a, 1);
  },
  ha: function ha(a) {
    var b = sjcl.mode.ccm.W.slice(),
        d;

    for (d = 0; d < b.length; d += 1) {
      b[d](a);
    }
  },
  encrypt: function encrypt(a, b, d, c, e) {
    var f,
        g = b.slice(0),
        h = sjcl.bitArray,
        k = h.bitLength(d) / 8,
        l = h.bitLength(g) / 8;
    e = e || 64;
    c = c || [];
    if (7 > k) throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");

    for (f = 2; 4 > f && l >>> 8 * f; f++) {
      ;
    }

    f < 15 - k && (f = 15 - k);
    d = h.clamp(d, 8 * (15 - f));
    b = sjcl.mode.ccm.R(a, b, d, c, e, f);
    g = sjcl.mode.ccm.u(a, g, d, b, e, f);
    return h.concat(g.data, g.tag);
  },
  decrypt: function decrypt(a, b, d, c, e) {
    e = e || 64;
    c = c || [];
    var f = sjcl.bitArray,
        g = f.bitLength(d) / 8,
        h = f.bitLength(b),
        k = f.clamp(b, h - e),
        l = f.bitSlice(b, h - e),
        h = (h - e) / 8;
    if (7 > g) throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");

    for (b = 2; 4 > b && h >>> 8 * b; b++) {
      ;
    }

    b < 15 - g && (b = 15 - g);
    d = f.clamp(d, 8 * (15 - b));
    k = sjcl.mode.ccm.u(a, k, d, l, e, b);
    a = sjcl.mode.ccm.R(a, k.data, d, c, e, b);
    if (!f.equal(k.tag, a)) throw new sjcl.exception.corrupt("ccm: tag doesn't match");
    return k.data;
  },
  oa: function oa(a, b, d, c, e, f) {
    var g = [],
        h = sjcl.bitArray,
        k = h.l;
    c = [h.partial(8, (b.length ? 64 : 0) | c - 2 << 2 | f - 1)];
    c = h.concat(c, d);
    c[3] |= e;
    c = a.encrypt(c);
    if (b.length) for (d = h.bitLength(b) / 8, 65279 >= d ? g = [h.partial(16, d)] : 0xffffffff >= d && (g = h.concat([h.partial(16, 65534)], [d])), g = h.concat(g, b), b = 0; b < g.length; b += 4) {
      c = a.encrypt(k(c, g.slice(b, b + 4).concat([0, 0, 0])));
    }
    return c;
  },
  R: function R(a, b, d, c, e, f) {
    var g = sjcl.bitArray,
        h = g.l;
    e /= 8;
    if (e % 2 || 4 > e || 16 < e) throw new sjcl.exception.invalid("ccm: invalid tag length");
    if (0xffffffff < c.length || 0xffffffff < b.length) throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
    d = sjcl.mode.ccm.oa(a, c, d, e, g.bitLength(b) / 8, f);

    for (c = 0; c < b.length; c += 4) {
      d = a.encrypt(h(d, b.slice(c, c + 4).concat([0, 0, 0])));
    }

    return g.clamp(d, 8 * e);
  },
  u: function u(a, b, d, c, e, f) {
    var g,
        h = sjcl.bitArray;
    g = h.l;
    var k = b.length,
        l = h.bitLength(b),
        m = k / 50,
        n = m;
    d = h.concat([h.partial(8, f - 1)], d).concat([0, 0, 0]).slice(0, 4);
    c = h.bitSlice(g(c, a.encrypt(d)), 0, e);
    if (!k) return {
      tag: c,
      data: []
    };

    for (g = 0; g < k; g += 4) {
      g > m && (sjcl.mode.ccm.ha(g / k), m += n), d[3]++, e = a.encrypt(d), b[g] ^= e[0], b[g + 1] ^= e[1], b[g + 2] ^= e[2], b[g + 3] ^= e[3];
    }

    return {
      tag: c,
      data: h.clamp(b, l)
    };
  }
};
void 0 === sjcl.beware && (sjcl.beware = {});

sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."] = function () {
  sjcl.mode.ctr = {
    name: "ctr",
    encrypt: function encrypt(a, b, d, c) {
      return sjcl.mode.ctr.ga(a, b, d, c);
    },
    decrypt: function decrypt(a, b, d, c) {
      return sjcl.mode.ctr.ga(a, b, d, c);
    },
    ga: function ga(a, b, d, c) {
      var e, f, g;
      if (c && c.length) throw new sjcl.exception.invalid("ctr can't authenticate data");
      if (128 !== sjcl.bitArray.bitLength(d)) throw new sjcl.exception.invalid("ctr iv must be 128 bits");
      if (!(c = b.length)) return [];
      d = d.slice(0);
      e = b.slice(0);
      b = sjcl.bitArray.bitLength(e);

      for (g = 0; g < c; g += 4) {
        f = a.encrypt(d), e[g] ^= f[0], e[g + 1] ^= f[1], e[g + 2] ^= f[2], e[g + 3] ^= f[3], d[3]++;
      }

      return sjcl.bitArray.clamp(e, b);
    }
  };
};

void 0 === sjcl.beware && (sjcl.beware = {});

sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."] = function () {
  sjcl.mode.cbc = {
    name: "cbc",
    encrypt: function encrypt(a, b, d, c) {
      if (c && c.length) throw new sjcl.exception.invalid("cbc can't authenticate data");
      if (128 !== sjcl.bitArray.bitLength(d)) throw new sjcl.exception.invalid("cbc iv must be 128 bits");
      var e = sjcl.bitArray,
          f = e.l,
          g = e.bitLength(b),
          h = 0,
          k = [];
      if (g & 7) throw new sjcl.exception.invalid("pkcs#5 padding only works for multiples of a byte");

      for (c = 0; h + 128 <= g; c += 4, h += 128) {
        d = a.encrypt(f(d, b.slice(c, c + 4))), k.splice(c, 0, d[0], d[1], d[2], d[3]);
      }

      g = 0x1010101 * (16 - (g >> 3 & 15));
      d = a.encrypt(f(d, e.concat(b, [g, g, g, g]).slice(c, c + 4)));
      k.splice(c, 0, d[0], d[1], d[2], d[3]);
      return k;
    },
    decrypt: function decrypt(a, b, d, c) {
      if (c && c.length) throw new sjcl.exception.invalid("cbc can't authenticate data");
      if (128 !== sjcl.bitArray.bitLength(d)) throw new sjcl.exception.invalid("cbc iv must be 128 bits");
      if (sjcl.bitArray.bitLength(b) & 127 || !b.length) throw new sjcl.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");
      var e = sjcl.bitArray,
          f = e.l,
          g,
          h = [];

      for (c = 0; c < b.length; c += 4) {
        g = b.slice(c, c + 4), d = f(d, a.decrypt(g)), h.splice(c, 0, d[0], d[1], d[2], d[3]), d = g;
      }

      g = h[c - 1] & 255;
      if (0 === g || 16 < g) throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
      d = 0x1010101 * g;
      if (!e.equal(e.bitSlice([d, d, d, d], 0, 8 * g), e.bitSlice(h, 32 * h.length - 8 * g, 32 * h.length))) throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
      return e.bitSlice(h, 0, 32 * h.length - 8 * g);
    }
  };
};

sjcl.mode.ocb2 = {
  name: "ocb2",
  encrypt: function encrypt(a, b, d, c, e, f) {
    if (128 !== sjcl.bitArray.bitLength(d)) throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    var g,
        h = sjcl.mode.ocb2.U,
        k = sjcl.bitArray,
        l = k.l,
        m = [0, 0, 0, 0];
    d = h(a.encrypt(d));
    var n,
        p = [];
    c = c || [];
    e = e || 64;

    for (g = 0; g + 4 < b.length; g += 4) {
      n = b.slice(g, g + 4), m = l(m, n), p = p.concat(l(d, a.encrypt(l(d, n)))), d = h(d);
    }

    n = b.slice(g);
    b = k.bitLength(n);
    g = a.encrypt(l(d, [0, 0, 0, b]));
    n = k.clamp(l(n.concat([0, 0, 0]), g), b);
    m = l(m, l(n.concat([0, 0, 0]), g));
    m = a.encrypt(l(m, l(d, h(d))));
    c.length && (m = l(m, f ? c : sjcl.mode.ocb2.pmac(a, c)));
    return p.concat(k.concat(n, k.clamp(m, e)));
  },
  decrypt: function decrypt(a, b, d, c, e, f) {
    if (128 !== sjcl.bitArray.bitLength(d)) throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    e = e || 64;
    var g = sjcl.mode.ocb2.U,
        h = sjcl.bitArray,
        k = h.l,
        l = [0, 0, 0, 0],
        m = g(a.encrypt(d)),
        n,
        p,
        r = sjcl.bitArray.bitLength(b) - e,
        t = [];
    c = c || [];

    for (d = 0; d + 4 < r / 32; d += 4) {
      n = k(m, a.decrypt(k(m, b.slice(d, d + 4)))), l = k(l, n), t = t.concat(n), m = g(m);
    }

    p = r - 32 * d;
    n = a.encrypt(k(m, [0, 0, 0, p]));
    n = k(n, h.clamp(b.slice(d), p).concat([0, 0, 0]));
    l = k(l, n);
    l = a.encrypt(k(l, k(m, g(m))));
    c.length && (l = k(l, f ? c : sjcl.mode.ocb2.pmac(a, c)));
    if (!h.equal(h.clamp(l, e), h.bitSlice(b, r))) throw new sjcl.exception.corrupt("ocb: tag doesn't match");
    return t.concat(h.clamp(n, p));
  },
  pmac: function pmac(a, b) {
    var d,
        c = sjcl.mode.ocb2.U,
        e = sjcl.bitArray,
        f = e.l,
        g = [0, 0, 0, 0],
        h = a.encrypt([0, 0, 0, 0]),
        h = f(h, c(c(h)));

    for (d = 0; d + 4 < b.length; d += 4) {
      h = c(h), g = f(g, a.encrypt(f(h, b.slice(d, d + 4))));
    }

    d = b.slice(d);
    128 > e.bitLength(d) && (h = f(h, c(h)), d = e.concat(d, [-2147483648, 0, 0, 0]));
    g = f(g, d);
    return a.encrypt(f(c(f(h, c(h))), g));
  },
  U: function U(a) {
    return [a[0] << 1 ^ a[1] >>> 31, a[1] << 1 ^ a[2] >>> 31, a[2] << 1 ^ a[3] >>> 31, a[3] << 1 ^ 135 * (a[0] >>> 31)];
  }
};
sjcl.mode.ocb2progressive = {
  createEncryptor: function createEncryptor(a, b, d, c, e) {
    if (128 !== sjcl.bitArray.bitLength(b)) throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    var f,
        g = sjcl.mode.ocb2.U,
        h = sjcl.bitArray,
        k = h.l,
        l = [0, 0, 0, 0],
        m = g(a.encrypt(b)),
        n,
        p,
        r = [],
        t;
    d = d || [];
    c = c || 64;
    return {
      process: function process(b) {
        if (0 == sjcl.bitArray.bitLength(b)) return [];
        var d = [];
        r = r.concat(b);

        for (f = 0; f + 4 < r.length; f += 4) {
          n = r.slice(f, f + 4), l = k(l, n), d = d.concat(k(m, a.encrypt(k(m, n)))), m = g(m);
        }

        r = r.slice(f);
        return d;
      },
      finalize: function finalize() {
        n = r;
        p = h.bitLength(n);
        t = a.encrypt(k(m, [0, 0, 0, p]));
        n = h.clamp(k(n.concat([0, 0, 0]), t), p);
        l = k(l, k(n.concat([0, 0, 0]), t));
        l = a.encrypt(k(l, k(m, g(m))));
        d.length && (l = k(l, e ? d : sjcl.mode.ocb2.pmac(a, d)));
        return h.concat(n, h.clamp(l, c));
      }
    };
  },
  createDecryptor: function createDecryptor(a, b, d, c, e) {
    if (128 !== sjcl.bitArray.bitLength(b)) throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    c = c || 64;
    var f,
        g = sjcl.mode.ocb2.U,
        h = sjcl.bitArray,
        k = h.l,
        l = [0, 0, 0, 0],
        m = g(a.encrypt(b)),
        n,
        p,
        r = [],
        t;
    d = d || [];
    return {
      process: function process(b) {
        if (0 == b.length) return [];
        var d = [];
        r = r.concat(b);
        b = sjcl.bitArray.bitLength(r);

        for (f = 0; f + 4 < (b - c) / 32; f += 4) {
          n = k(m, a.decrypt(k(m, r.slice(f, f + 4)))), l = k(l, n), d = d.concat(n), m = g(m);
        }

        r = r.slice(f);
        return d;
      },
      finalize: function finalize() {
        p = sjcl.bitArray.bitLength(r) - c;
        t = a.encrypt(k(m, [0, 0, 0, p]));
        n = k(t, h.clamp(r, p).concat([0, 0, 0]));
        l = k(l, n);
        l = a.encrypt(k(l, k(m, g(m))));
        d.length && (l = k(l, e ? d : sjcl.mode.ocb2.pmac(a, d)));
        if (!h.equal(h.clamp(l, c), h.bitSlice(r, p))) throw new sjcl.exception.corrupt("ocb: tag doesn't match");
        return h.clamp(n, p);
      }
    };
  }
};
sjcl.mode.gcm = {
  name: "gcm",
  encrypt: function encrypt(a, b, d, c, e) {
    var f = b.slice(0);
    b = sjcl.bitArray;
    c = c || [];
    a = sjcl.mode.gcm.u(!0, a, f, c, d, e || 128);
    return b.concat(a.data, a.tag);
  },
  decrypt: function decrypt(a, b, d, c, e) {
    var f = b.slice(0),
        g = sjcl.bitArray,
        h = g.bitLength(f);
    e = e || 128;
    c = c || [];
    e <= h ? (b = g.bitSlice(f, h - e), f = g.bitSlice(f, 0, h - e)) : (b = f, f = []);
    a = sjcl.mode.gcm.u(!1, a, f, c, d, e);
    if (!g.equal(a.tag, b)) throw new sjcl.exception.corrupt("gcm: tag doesn't match");
    return a.data;
  },
  Da: function Da(a, b) {
    var d,
        c,
        e,
        f,
        g,
        h = sjcl.bitArray.l;
    e = [0, 0, 0, 0];
    f = b.slice(0);

    for (d = 0; 128 > d; d++) {
      (c = 0 !== (a[Math.floor(d / 32)] & 1 << 31 - d % 32)) && (e = h(e, f));
      g = 0 !== (f[3] & 1);

      for (c = 3; 0 < c; c--) {
        f[c] = f[c] >>> 1 | (f[c - 1] & 1) << 31;
      }

      f[0] >>>= 1;
      g && (f[0] ^= -0x1f000000);
    }

    return e;
  },
  J: function J(a, b, d) {
    var c,
        e = d.length;
    b = b.slice(0);

    for (c = 0; c < e; c += 4) {
      b[0] ^= 0xffffffff & d[c], b[1] ^= 0xffffffff & d[c + 1], b[2] ^= 0xffffffff & d[c + 2], b[3] ^= 0xffffffff & d[c + 3], b = sjcl.mode.gcm.Da(b, a);
    }

    return b;
  },
  u: function u(a, b, d, c, e, f) {
    var g,
        h,
        k,
        l,
        m,
        n,
        p,
        r,
        t = sjcl.bitArray;
    n = d.length;
    p = t.bitLength(d);
    r = t.bitLength(c);
    h = t.bitLength(e);
    g = b.encrypt([0, 0, 0, 0]);
    96 === h ? (e = e.slice(0), e = t.concat(e, [1])) : (e = sjcl.mode.gcm.J(g, [0, 0, 0, 0], e), e = sjcl.mode.gcm.J(g, e, [0, 0, Math.floor(h / 0x100000000), h & 0xffffffff]));
    h = sjcl.mode.gcm.J(g, [0, 0, 0, 0], c);
    m = e.slice(0);
    c = h.slice(0);
    a || (c = sjcl.mode.gcm.J(g, h, d));

    for (l = 0; l < n; l += 4) {
      m[3]++, k = b.encrypt(m), d[l] ^= k[0], d[l + 1] ^= k[1], d[l + 2] ^= k[2], d[l + 3] ^= k[3];
    }

    d = t.clamp(d, p);
    a && (c = sjcl.mode.gcm.J(g, h, d));
    a = [Math.floor(r / 0x100000000), r & 0xffffffff, Math.floor(p / 0x100000000), p & 0xffffffff];
    c = sjcl.mode.gcm.J(g, c, a);
    k = b.encrypt(e);
    c[0] ^= k[0];
    c[1] ^= k[1];
    c[2] ^= k[2];
    c[3] ^= k[3];
    return {
      tag: t.bitSlice(c, 0, f),
      data: d
    };
  }
};

sjcl.misc.hmac = function (a, b) {
  this.ka = b = b || sjcl.hash.sha256;
  var d = [[], []],
      c,
      e = b.prototype.blockSize / 32;
  this.P = [new b(), new b()];
  a.length > e && (a = b.hash(a));

  for (c = 0; c < e; c++) {
    d[0][c] = a[c] ^ 909522486, d[1][c] = a[c] ^ 1549556828;
  }

  this.P[0].update(d[0]);
  this.P[1].update(d[1]);
  this.ea = new b(this.P[0]);
};

sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function (a) {
  if (this.ta) throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
  this.update(a);
  return this.digest(a);
};

sjcl.misc.hmac.prototype.reset = function () {
  this.ea = new this.ka(this.P[0]);
  this.ta = !1;
};

sjcl.misc.hmac.prototype.update = function (a) {
  this.ta = !0;
  this.ea.update(a);
};

sjcl.misc.hmac.prototype.digest = function () {
  var a = this.ea.finalize(),
      a = new this.ka(this.P[1]).update(a).finalize();
  this.reset();
  return a;
};

sjcl.misc.pbkdf2 = function (a, b, d, c, e) {
  d = d || 1E4;
  if (0 > c || 0 > d) throw new sjcl.exception.invalid("invalid params to pbkdf2");
  "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
  "string" === typeof b && (b = sjcl.codec.utf8String.toBits(b));
  e = e || sjcl.misc.hmac;
  a = new e(a);
  var f,
      g,
      h,
      k,
      l = [],
      m = sjcl.bitArray;

  for (k = 1; 32 * l.length < (c || 1); k++) {
    e = f = a.encrypt(m.concat(b, [k]));

    for (g = 1; g < d; g++) {
      for (f = a.encrypt(f), h = 0; h < f.length; h++) {
        e[h] ^= f[h];
      }
    }

    l = l.concat(e);
  }

  c && (l = m.clamp(l, c));
  return l;
};

sjcl.misc.scrypt = function (a, b, d, c, e, f, g) {
  var h = Math.pow(2, 32) - 1,
      k = sjcl.misc.scrypt;
  d = d || 16384;
  c = c || 8;
  e = e || 1;
  if (c * e >= Math.pow(2, 30)) throw sjcl.exception.invalid("The parameters r, p must satisfy r * p < 2^30");
  if (2 > d || d & 0 != d - 1) throw sjcl.exception.invalid("The parameter N must be a power of 2.");
  if (d > h / 128 / c) throw sjcl.exception.invalid("N too big.");
  if (c > h / 128 / e) throw sjcl.exception.invalid("r too big.");
  b = sjcl.misc.pbkdf2(a, b, 1, 128 * e * c * 8, g);
  c = b.length / e;
  k.reverse(b);

  for (h = 0; h < e; h++) {
    var l = b.slice(h * c, (h + 1) * c);
    k.blockcopy(k.ROMix(l, d), 0, b, h * c);
  }

  k.reverse(b);
  return sjcl.misc.pbkdf2(a, b, 1, f, g);
};

sjcl.misc.scrypt.salsa20Core = function (a, b) {
  function d(a, b) {
    return a << b | a >>> 32 - b;
  }

  for (var c = a.slice(0), e = b; 0 < e; e -= 2) {
    c[4] ^= d(c[0] + c[12], 7), c[8] ^= d(c[4] + c[0], 9), c[12] ^= d(c[8] + c[4], 13), c[0] ^= d(c[12] + c[8], 18), c[9] ^= d(c[5] + c[1], 7), c[13] ^= d(c[9] + c[5], 9), c[1] ^= d(c[13] + c[9], 13), c[5] ^= d(c[1] + c[13], 18), c[14] ^= d(c[10] + c[6], 7), c[2] ^= d(c[14] + c[10], 9), c[6] ^= d(c[2] + c[14], 13), c[10] ^= d(c[6] + c[2], 18), c[3] ^= d(c[15] + c[11], 7), c[7] ^= d(c[3] + c[15], 9), c[11] ^= d(c[7] + c[3], 13), c[15] ^= d(c[11] + c[7], 18), c[1] ^= d(c[0] + c[3], 7), c[2] ^= d(c[1] + c[0], 9), c[3] ^= d(c[2] + c[1], 13), c[0] ^= d(c[3] + c[2], 18), c[6] ^= d(c[5] + c[4], 7), c[7] ^= d(c[6] + c[5], 9), c[4] ^= d(c[7] + c[6], 13), c[5] ^= d(c[4] + c[7], 18), c[11] ^= d(c[10] + c[9], 7), c[8] ^= d(c[11] + c[10], 9), c[9] ^= d(c[8] + c[11], 13), c[10] ^= d(c[9] + c[8], 18), c[12] ^= d(c[15] + c[14], 7), c[13] ^= d(c[12] + c[15], 9), c[14] ^= d(c[13] + c[12], 13), c[15] ^= d(c[14] + c[13], 18);
  }

  for (e = 0; 16 > e; e++) {
    a[e] = c[e] + a[e];
  }
};

sjcl.misc.scrypt.blockMix = function (a) {
  for (var b = a.slice(-16), d = [], c = a.length / 16, e = sjcl.misc.scrypt, f = 0; f < c; f++) {
    e.blockxor(a, 16 * f, b, 0, 16), e.salsa20Core(b, 8), 0 == (f & 1) ? e.blockcopy(b, 0, d, 8 * f) : e.blockcopy(b, 0, d, 8 * (f ^ 1 + c));
  }

  return d;
};

sjcl.misc.scrypt.ROMix = function (a, b) {
  for (var d = a.slice(0), c = [], e = sjcl.misc.scrypt, f = 0; f < b; f++) {
    c.push(d.slice(0)), d = e.blockMix(d);
  }

  for (f = 0; f < b; f++) {
    e.blockxor(c[d[d.length - 16] & b - 1], 0, d, 0), d = e.blockMix(d);
  }

  return d;
};

sjcl.misc.scrypt.reverse = function (a) {
  for (var b in a) {
    var d = a[b] & 255,
        d = d << 8 | a[b] >>> 8 & 255,
        d = d << 8 | a[b] >>> 16 & 255,
        d = d << 8 | a[b] >>> 24 & 255;
    a[b] = d;
  }
};

sjcl.misc.scrypt.blockcopy = function (a, b, d, c, e) {
  var f;
  e = e || a.length - b;

  for (f = 0; f < e; f++) {
    d[c + f] = a[b + f] | 0;
  }
};

sjcl.misc.scrypt.blockxor = function (a, b, d, c, e) {
  var f;
  e = e || a.length - b;

  for (f = 0; f < e; f++) {
    d[c + f] = d[c + f] ^ a[b + f] | 0;
  }
};

sjcl.prng = function (a) {
  this.s = [new sjcl.hash.sha256()];
  this.K = [0];
  this.da = 0;
  this.X = {};
  this.ca = 0;
  this.ia = {};
  this.qa = this.B = this.L = this.Aa = 0;
  this.i = [0, 0, 0, 0, 0, 0, 0, 0];
  this.F = [0, 0, 0, 0];
  this.aa = void 0;
  this.ba = a;
  this.V = !1;
  this.$ = {
    progress: {},
    seeded: {}
  };
  this.O = this.za = 0;
  this.Y = 1;
  this.Z = 2;
  this.va = 0x10000;
  this.fa = [0, 48, 64, 96, 128, 192, 0x100, 384, 512, 768, 1024];
  this.wa = 3E4;
  this.ua = 80;
};

sjcl.prng.prototype = {
  randomWords: function randomWords(a, b) {
    var d = [],
        c;
    c = this.isReady(b);
    var e;
    if (c === this.O) throw new sjcl.exception.notReady("generator isn't seeded");

    if (c & this.Z) {
      c = !(c & this.Y);
      e = [];
      var f = 0,
          g;
      this.qa = e[0] = new Date().valueOf() + this.wa;

      for (g = 0; 16 > g; g++) {
        e.push(0x100000000 * Math.random() | 0);
      }

      for (g = 0; g < this.s.length && (e = e.concat(this.s[g].finalize()), f += this.K[g], this.K[g] = 0, c || !(this.da & 1 << g)); g++) {
        ;
      }

      this.da >= 1 << this.s.length && (this.s.push(new sjcl.hash.sha256()), this.K.push(0));
      this.B -= f;
      f > this.L && (this.L = f);
      this.da++;
      this.i = sjcl.hash.sha256.hash(this.i.concat(e));
      this.aa = new sjcl.cipher.aes(this.i);

      for (c = 0; 4 > c && (this.F[c] = this.F[c] + 1 | 0, !this.F[c]); c++) {
        ;
      }
    }

    for (c = 0; c < a; c += 4) {
      0 === (c + 1) % this.va && ca(this), e = da(this), d.push(e[0], e[1], e[2], e[3]);
    }

    ca(this);
    return d.slice(0, a);
  },
  setDefaultParanoia: function setDefaultParanoia(a, b) {
    if (0 === a && "Setting paranoia=0 will ruin your security; use it only for testing" !== b) throw new sjcl.exception.invalid("Setting paranoia=0 will ruin your security; use it only for testing");
    this.ba = a;
  },
  addEntropy: function addEntropy(a, b, d) {
    d = d || "user";
    var c,
        e,
        f = new Date().valueOf(),
        g = this.X[d],
        h = this.isReady(),
        k = 0;
    c = this.ia[d];
    void 0 === c && (c = this.ia[d] = this.Aa++);
    void 0 === g && (g = this.X[d] = 0);
    this.X[d] = (this.X[d] + 1) % this.s.length;

    switch (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a)) {
      case "number":
        void 0 === b && (b = 1);
        this.s[g].update([c, this.ca++, 1, b, f, 1, a | 0]);
        break;

      case "object":
        d = Object.prototype.toString.call(a);

        if ("[object Uint32Array]" === d) {
          e = [];

          for (d = 0; d < a.length; d++) {
            e.push(a[d]);
          }

          a = e;
        } else for ("[object Array]" !== d && (k = 1), d = 0; d < a.length && !k; d++) {
          "number" !== typeof a[d] && (k = 1);
        }

        if (!k) {
          if (void 0 === b) for (d = b = 0; d < a.length; d++) {
            for (e = a[d]; 0 < e;) {
              b++, e = e >>> 1;
            }
          }
          this.s[g].update([c, this.ca++, 2, b, f, a.length].concat(a));
        }

        break;

      case "string":
        void 0 === b && (b = a.length);
        this.s[g].update([c, this.ca++, 3, b, f, a.length]);
        this.s[g].update(a);
        break;

      default:
        k = 1;
    }

    if (k) throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
    this.K[g] += b;
    this.B += b;
    h === this.O && (this.isReady() !== this.O && ea("seeded", Math.max(this.L, this.B)), ea("progress", this.getProgress()));
  },
  isReady: function isReady(a) {
    a = this.fa[void 0 !== a ? a : this.ba];
    return this.L && this.L >= a ? this.K[0] > this.ua && new Date().valueOf() > this.qa ? this.Z | this.Y : this.Y : this.B >= a ? this.Z | this.O : this.O;
  },
  getProgress: function getProgress(a) {
    a = this.fa[a ? a : this.ba];
    return this.L >= a ? 1 : this.B > a ? 1 : this.B / a;
  },
  startCollectors: function startCollectors() {
    if (!this.V) {
      this.j = {
        loadTimeCollector: G(this, this.Ia),
        mouseCollector: G(this, this.Ja),
        keyboardCollector: G(this, this.Ga),
        accelerometerCollector: G(this, this.xa),
        touchCollector: G(this, this.La)
      };
      if (window.addEventListener) window.addEventListener("load", this.j.loadTimeCollector, !1), window.addEventListener("mousemove", this.j.mouseCollector, !1), window.addEventListener("keypress", this.j.keyboardCollector, !1), window.addEventListener("devicemotion", this.j.accelerometerCollector, !1), window.addEventListener("touchmove", this.j.touchCollector, !1);else if (document.attachEvent) document.attachEvent("onload", this.j.loadTimeCollector), document.attachEvent("onmousemove", this.j.mouseCollector), document.attachEvent("keypress", this.j.keyboardCollector);else throw new sjcl.exception.bug("can't attach event");
      this.V = !0;
    }
  },
  stopCollectors: function stopCollectors() {
    this.V && (window.removeEventListener ? (window.removeEventListener("load", this.j.loadTimeCollector, !1), window.removeEventListener("mousemove", this.j.mouseCollector, !1), window.removeEventListener("keypress", this.j.keyboardCollector, !1), window.removeEventListener("devicemotion", this.j.accelerometerCollector, !1), window.removeEventListener("touchmove", this.j.touchCollector, !1)) : document.detachEvent && (document.detachEvent("onload", this.j.loadTimeCollector), document.detachEvent("onmousemove", this.j.mouseCollector), document.detachEvent("keypress", this.j.keyboardCollector)), this.V = !1);
  },
  addEventListener: function addEventListener(a, b) {
    this.$[a][this.za++] = b;
  },
  removeEventListener: function removeEventListener(a, b) {
    var d,
        c,
        e = this.$[a],
        f = [];

    for (c in e) {
      e.hasOwnProperty(c) && e[c] === b && f.push(c);
    }

    for (d = 0; d < f.length; d++) {
      c = f[d], delete e[c];
    }
  },
  Ga: function Ga() {
    R(this, 1);
  },
  Ja: function Ja(a) {
    var b, d;

    try {
      b = a.x || a.clientX || a.offsetX || 0, d = a.y || a.clientY || a.offsetY || 0;
    } catch (c) {
      d = b = 0;
    }

    0 != b && 0 != d && this.addEntropy([b, d], 2, "mouse");
    R(this, 0);
  },
  La: function La(a) {
    a = a.touches[0] || a.changedTouches[0];
    this.addEntropy([a.pageX || a.clientX, a.pageY || a.clientY], 1, "touch");
    R(this, 0);
  },
  Ia: function Ia() {
    R(this, 2);
  },
  xa: function xa(a) {
    a = a.accelerationIncludingGravity.x || a.accelerationIncludingGravity.y || a.accelerationIncludingGravity.z;

    if (window.orientation) {
      var b = window.orientation;
      "number" === typeof b && this.addEntropy(b, 1, "accelerometer");
    }

    a && this.addEntropy(a, 2, "accelerometer");
    R(this, 0);
  }
};

function ea(a, b) {
  var d,
      c = sjcl.random.$[a],
      e = [];

  for (d in c) {
    c.hasOwnProperty(d) && e.push(c[d]);
  }

  for (d = 0; d < e.length; d++) {
    e[d](b);
  }
}

function R(a, b) {
  "undefined" !== typeof window && window.performance && "function" === typeof window.performance.now ? a.addEntropy(window.performance.now(), b, "loadtime") : a.addEntropy(new Date().valueOf(), b, "loadtime");
}

function ca(a) {
  a.i = da(a).concat(da(a));
  a.aa = new sjcl.cipher.aes(a.i);
}

function da(a) {
  for (var b = 0; 4 > b && (a.F[b] = a.F[b] + 1 | 0, !a.F[b]); b++) {
    ;
  }

  return a.aa.encrypt(a.F);
}

function G(a, b) {
  return function () {
    b.apply(a, arguments);
  };
}

sjcl.random = new sjcl.prng(6);

a: try {
  var S, fa, V, ia;

  if (ia =  true && module.exports) {
    var ja;

    try {
      ja = __webpack_require__(162);
    } catch (a) {
      ja = null;
    }

    ia = fa = ja;
  }

  if (ia && fa.randomBytes) S = fa.randomBytes(128), S = new Uint32Array(new Uint8Array(S).buffer), sjcl.random.addEntropy(S, 1024, "crypto['randomBytes']");else if ("undefined" !== typeof window && "undefined" !== typeof Uint32Array) {
    V = new Uint32Array(32);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(V);else if (window.msCrypto && window.msCrypto.getRandomValues) window.msCrypto.getRandomValues(V);else break a;
    sjcl.random.addEntropy(V, 1024, "crypto['getRandomValues']");
  }
} catch (a) {
  "undefined" !== typeof window && window.console && (console.log("There was an error collecting entropy from the browser:"), console.log(a));
}

sjcl.json = {
  defaults: {
    v: 1,
    iter: 1E4,
    ks: 128,
    ts: 64,
    mode: "ccm",
    adata: "",
    cipher: "aes"
  },
  Ca: function Ca(a, b, d, c) {
    d = d || {};
    c = c || {};
    var e = sjcl.json,
        f = e.C({
      iv: sjcl.random.randomWords(4, 0)
    }, e.defaults),
        g;
    e.C(f, d);
    d = f.adata;
    "string" === typeof f.salt && (f.salt = sjcl.codec.base64.toBits(f.salt));
    "string" === typeof f.iv && (f.iv = sjcl.codec.base64.toBits(f.iv));
    if (!sjcl.mode[f.mode] || !sjcl.cipher[f.cipher] || "string" === typeof a && 100 >= f.iter || 64 !== f.ts && 96 !== f.ts && 128 !== f.ts || 128 !== f.ks && 192 !== f.ks && 0x100 !== f.ks || 2 > f.iv.length || 4 < f.iv.length) throw new sjcl.exception.invalid("json encrypt: invalid parameters");
    "string" === typeof a ? (g = sjcl.misc.cachedPbkdf2(a, f), a = g.key.slice(0, f.ks / 32), f.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.publicKey && (g = a.kem(), f.kemtag = g.tag, a = g.key.slice(0, f.ks / 32));
    "string" === typeof b && (b = sjcl.codec.utf8String.toBits(b));
    "string" === typeof d && (f.adata = d = sjcl.codec.utf8String.toBits(d));
    g = new sjcl.cipher[f.cipher](a);
    e.C(c, f);
    c.key = a;
    f.ct = "ccm" === f.mode && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && b instanceof ArrayBuffer ? sjcl.arrayBuffer.ccm.encrypt(g, b, f.iv, d, f.ts) : sjcl.mode[f.mode].encrypt(g, b, f.iv, d, f.ts);
    return f;
  },
  encrypt: function encrypt(a, b, d, c) {
    var e = sjcl.json,
        f = e.Ca.apply(e, arguments);
    return e.encode(f);
  },
  Ba: function Ba(a, b, d, c) {
    d = d || {};
    c = c || {};
    var e = sjcl.json;
    b = e.C(e.C(e.C({}, e.defaults), b), d, !0);
    var f, g;
    f = b.adata;
    "string" === typeof b.salt && (b.salt = sjcl.codec.base64.toBits(b.salt));
    "string" === typeof b.iv && (b.iv = sjcl.codec.base64.toBits(b.iv));
    if (!sjcl.mode[b.mode] || !sjcl.cipher[b.cipher] || "string" === typeof a && 100 >= b.iter || 64 !== b.ts && 96 !== b.ts && 128 !== b.ts || 128 !== b.ks && 192 !== b.ks && 0x100 !== b.ks || !b.iv || 2 > b.iv.length || 4 < b.iv.length) throw new sjcl.exception.invalid("json decrypt: invalid parameters");
    "string" === typeof a ? (g = sjcl.misc.cachedPbkdf2(a, b), a = g.key.slice(0, b.ks / 32), b.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.secretKey && (a = a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0, b.ks / 32));
    "string" === typeof f && (f = sjcl.codec.utf8String.toBits(f));
    g = new sjcl.cipher[b.cipher](a);
    f = "ccm" === b.mode && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && b.ct instanceof ArrayBuffer ? sjcl.arrayBuffer.ccm.decrypt(g, b.ct, b.iv, b.tag, f, b.ts) : sjcl.mode[b.mode].decrypt(g, b.ct, b.iv, f, b.ts);
    e.C(c, b);
    c.key = a;
    return 1 === d.raw ? f : sjcl.codec.utf8String.fromBits(f);
  },
  decrypt: function decrypt(a, b, d, c) {
    var e = sjcl.json;
    return e.Ba(a, e.decode(b), d, c);
  },
  encode: function encode(a) {
    var b,
        d = "{",
        c = "";

    for (b in a) {
      if (a.hasOwnProperty(b)) {
        if (!b.match(/^[a-z0-9]+$/i)) throw new sjcl.exception.invalid("json encode: invalid property name");
        d += c + '"' + b + '":';
        c = ",";

        switch (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a[b])) {
          case "number":
          case "boolean":
            d += a[b];
            break;

          case "string":
            d += '"' + escape(a[b]) + '"';
            break;

          case "object":
            d += '"' + sjcl.codec.base64.fromBits(a[b], 0) + '"';
            break;

          default:
            throw new sjcl.exception.bug("json encode: unsupported type");
        }
      }
    }

    return d + "}";
  },
  decode: function decode(a) {
    a = a.replace(/\s/g, "");
    if (!a.match(/^\{.*\}$/)) throw new sjcl.exception.invalid("json decode: this isn't json!");
    a = a.replace(/^\{|\}$/g, "").split(/,/);
    var b = {},
        d,
        c;

    for (d = 0; d < a.length; d++) {
      if (!(c = a[d].match(/^\s*(?:(["']?)([a-z][a-z0-9]*)\1)\s*:\s*(?:(-?\d+)|"([a-z0-9+\/%*_.@=\-]*)"|(true|false))$/i))) throw new sjcl.exception.invalid("json decode: this isn't json!");
      null != c[3] ? b[c[2]] = parseInt(c[3], 10) : null != c[4] ? b[c[2]] = c[2].match(/^(ct|adata|salt|iv)$/) ? sjcl.codec.base64.toBits(c[4]) : unescape(c[4]) : null != c[5] && (b[c[2]] = "true" === c[5]);
    }

    return b;
  },
  C: function C(a, b, d) {
    void 0 === a && (a = {});
    if (void 0 === b) return a;

    for (var c in b) {
      if (b.hasOwnProperty(c)) {
        if (d && void 0 !== a[c] && a[c] !== b[c]) throw new sjcl.exception.invalid("required parameter overridden");
        a[c] = b[c];
      }
    }

    return a;
  },
  Na: function Na(a, b) {
    var d = {},
        c;

    for (c in a) {
      a.hasOwnProperty(c) && a[c] !== b[c] && (d[c] = a[c]);
    }

    return d;
  },
  Ma: function Ma(a, b) {
    var d = {},
        c;

    for (c = 0; c < b.length; c++) {
      void 0 !== a[b[c]] && (d[b[c]] = a[b[c]]);
    }

    return d;
  }
};
sjcl.encrypt = sjcl.json.encrypt;
sjcl.decrypt = sjcl.json.decrypt;
sjcl.misc.Ka = {};

sjcl.misc.cachedPbkdf2 = function (a, b) {
  var d = sjcl.misc.Ka,
      c;
  b = b || {};
  c = b.iter || 1E3;
  d = d[a] = d[a] || {};
  c = d[c] = d[c] || {
    firstSalt: b.salt && b.salt.length ? b.salt.slice(0) : sjcl.random.randomWords(2, 0)
  };
  d = void 0 === b.salt ? c.firstSalt : b.salt;
  c[d] = c[d] || sjcl.misc.pbkdf2(a, d, b.iter);
  return {
    key: c[d].slice(0),
    salt: d.slice(0)
  };
};

sjcl.bn = function (a) {
  this.initWith(a);
};

sjcl.bn.prototype = {
  radix: 24,
  maxMul: 8,
  o: sjcl.bn,
  copy: function copy() {
    return new this.o(this);
  },
  initWith: function initWith(a) {
    var b = 0,
        d;

    switch (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a)) {
      case "object":
        this.limbs = a.limbs.slice(0);
        break;

      case "number":
        this.limbs = [a];
        this.normalize();
        break;

      case "string":
        a = a.replace(/^0x/, "");
        this.limbs = [];
        d = this.radix / 4;

        for (b = 0; b < a.length; b += d) {
          this.limbs.push(parseInt(a.substring(Math.max(a.length - b - d, 0), a.length - b), 16));
        }

        break;

      default:
        this.limbs = [0];
    }

    return this;
  },
  equals: function equals(a) {
    "number" === typeof a && (a = new this.o(a));
    var b = 0,
        d;
    this.fullReduce();
    a.fullReduce();

    for (d = 0; d < this.limbs.length || d < a.limbs.length; d++) {
      b |= this.getLimb(d) ^ a.getLimb(d);
    }

    return 0 === b;
  },
  getLimb: function getLimb(a) {
    return a >= this.limbs.length ? 0 : this.limbs[a];
  },
  greaterEquals: function greaterEquals(a) {
    "number" === typeof a && (a = new this.o(a));
    var b = 0,
        d = 0,
        c,
        e,
        f;

    for (c = Math.max(this.limbs.length, a.limbs.length) - 1; 0 <= c; c--) {
      e = this.getLimb(c), f = a.getLimb(c), d |= f - e & ~b, b |= e - f & ~d;
    }

    return (d | ~b) >>> 31;
  },
  toString: function toString() {
    this.fullReduce();
    var a = "",
        b,
        d,
        c = this.limbs;

    for (b = 0; b < this.limbs.length; b++) {
      for (d = c[b].toString(16); b < this.limbs.length - 1 && 6 > d.length;) {
        d = "0" + d;
      }

      a = d + a;
    }

    return "0x" + a;
  },
  addM: function addM(a) {
    "object" !== _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a) && (a = new this.o(a));
    var b = this.limbs,
        d = a.limbs;

    for (a = b.length; a < d.length; a++) {
      b[a] = 0;
    }

    for (a = 0; a < d.length; a++) {
      b[a] += d[a];
    }

    return this;
  },
  doubleM: function doubleM() {
    var a,
        b = 0,
        d,
        c = this.radix,
        e = this.radixMask,
        f = this.limbs;

    for (a = 0; a < f.length; a++) {
      d = f[a], d = d + d + b, f[a] = d & e, b = d >> c;
    }

    b && f.push(b);
    return this;
  },
  halveM: function halveM() {
    var a,
        b = 0,
        d,
        c = this.radix,
        e = this.limbs;

    for (a = e.length - 1; 0 <= a; a--) {
      d = e[a], e[a] = d + b >> 1, b = (d & 1) << c;
    }

    e[e.length - 1] || e.pop();
    return this;
  },
  subM: function subM(a) {
    "object" !== _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a) && (a = new this.o(a));
    var b = this.limbs,
        d = a.limbs;

    for (a = b.length; a < d.length; a++) {
      b[a] = 0;
    }

    for (a = 0; a < d.length; a++) {
      b[a] -= d[a];
    }

    return this;
  },
  mod: function mod(a) {
    var b = !this.greaterEquals(new sjcl.bn(0));
    a = new sjcl.bn(a).normalize();
    var d = new sjcl.bn(this).normalize(),
        c = 0;

    for (b && (d = new sjcl.bn(0).subM(d).normalize()); d.greaterEquals(a); c++) {
      a.doubleM();
    }

    for (b && (d = a.sub(d).normalize()); 0 < c; c--) {
      a.halveM(), d.greaterEquals(a) && d.subM(a).normalize();
    }

    return d.trim();
  },
  inverseMod: function inverseMod(a) {
    var b = new sjcl.bn(1),
        d = new sjcl.bn(0),
        c = new sjcl.bn(this),
        e = new sjcl.bn(a),
        f,
        g = 1;
    if (!(a.limbs[0] & 1)) throw new sjcl.exception.invalid("inverseMod: p must be odd");

    do {
      for (c.limbs[0] & 1 && (c.greaterEquals(e) || (f = c, c = e, e = f, f = b, b = d, d = f), c.subM(e), c.normalize(), b.greaterEquals(d) || b.addM(a), b.subM(d)), c.halveM(), b.limbs[0] & 1 && b.addM(a), b.normalize(), b.halveM(), f = g = 0; f < c.limbs.length; f++) {
        g |= c.limbs[f];
      }
    } while (g);

    if (!e.equals(1)) throw new sjcl.exception.invalid("inverseMod: p and x must be relatively prime");
    return d;
  },
  add: function add(a) {
    return this.copy().addM(a);
  },
  sub: function sub(a) {
    return this.copy().subM(a);
  },
  mul: function mul(a) {
    "number" === typeof a && (a = new this.o(a));
    var b,
        d = this.limbs,
        c = a.limbs,
        e = d.length,
        f = c.length,
        g = new this.o(),
        h = g.limbs,
        k,
        l = this.maxMul;

    for (b = 0; b < this.limbs.length + a.limbs.length + 1; b++) {
      h[b] = 0;
    }

    for (b = 0; b < e; b++) {
      k = d[b];

      for (a = 0; a < f; a++) {
        h[b + a] += k * c[a];
      }

      --l || (l = this.maxMul, g.cnormalize());
    }

    return g.cnormalize().reduce();
  },
  square: function square() {
    return this.mul(this);
  },
  power: function power(a) {
    a = new sjcl.bn(a).normalize().trim().limbs;
    var b,
        d,
        c = new this.o(1),
        e = this;

    for (b = 0; b < a.length; b++) {
      for (d = 0; d < this.radix; d++) {
        a[b] & 1 << d && (c = c.mul(e));
        if (b == a.length - 1 && 0 == a[b] >> d + 1) break;
        e = e.square();
      }
    }

    return c;
  },
  mulmod: function mulmod(a, b) {
    return this.mod(b).mul(a.mod(b)).mod(b);
  },
  powermod: function powermod(a, b) {
    a = new sjcl.bn(a);
    b = new sjcl.bn(b);

    if (1 == (b.limbs[0] & 1)) {
      var d = this.montpowermod(a, b);
      if (0 != d) return d;
    }

    for (var c, e = a.normalize().trim().limbs, f = new this.o(1), g = this, d = 0; d < e.length; d++) {
      for (c = 0; c < this.radix; c++) {
        e[d] & 1 << c && (f = f.mulmod(g, b));
        if (d == e.length - 1 && 0 == e[d] >> c + 1) break;
        g = g.mulmod(g, b);
      }
    }

    return f;
  },
  montpowermod: function montpowermod(a, b) {
    function d(a, b) {
      var d = b % a.radix;
      return (a.limbs[Math.floor(b / a.radix)] & 1 << d) >> d;
    }

    function c(a, d) {
      var c,
          e,
          f = (1 << l + 1) - 1;
      c = a.mul(d);
      e = c.mul(r);
      e.limbs = e.limbs.slice(0, k.limbs.length);
      e.limbs.length == k.limbs.length && (e.limbs[k.limbs.length - 1] &= f);
      e = e.mul(b);
      e = c.add(e).normalize().trim();
      e.limbs = e.limbs.slice(k.limbs.length - 1);

      for (c = 0; c < e.limbs.length; c++) {
        0 < c && (e.limbs[c - 1] |= (e.limbs[c] & f) << g - l - 1), e.limbs[c] >>= l + 1;
      }

      e.greaterEquals(b) && e.subM(b);
      return e;
    }

    a = new sjcl.bn(a).normalize().trim();
    b = new sjcl.bn(b);
    var e,
        f,
        g = this.radix,
        h = new this.o(1);
    e = this.copy();
    var k, l, m;
    m = a.bitLength();
    k = new sjcl.bn({
      limbs: b.copy().normalize().trim().limbs.map(function () {
        return 0;
      })
    });

    for (l = this.radix; 0 < l; l--) {
      if (1 == (b.limbs[b.limbs.length - 1] >> l & 1)) {
        k.limbs[k.limbs.length - 1] = 1 << l;
        break;
      }
    }

    if (0 == m) return this;
    m = 18 > m ? 1 : 48 > m ? 3 : 144 > m ? 4 : 768 > m ? 5 : 6;
    var n = k.copy(),
        p = b.copy();
    f = new sjcl.bn(1);

    for (var r = new sjcl.bn(0), t = k.copy(); t.greaterEquals(1);) {
      t.halveM(), 0 == (f.limbs[0] & 1) ? (f.halveM(), r.halveM()) : (f.addM(p), f.halveM(), r.halveM(), r.addM(n));
    }

    f = f.normalize();
    r = r.normalize();
    n.doubleM();
    p = n.mulmod(n, b);
    if (!n.mul(f).sub(b.mul(r)).equals(1)) return !1;
    e = c(e, p);
    h = c(h, p);
    n = {};
    f = (1 << m - 1) - 1;
    n[1] = e.copy();
    n[2] = c(e, e);

    for (e = 1; e <= f; e++) {
      n[2 * e + 1] = c(n[2 * e - 1], n[2]);
    }

    for (e = a.bitLength() - 1; 0 <= e;) {
      if (0 == d(a, e)) h = c(h, h), --e;else {
        for (p = e - m + 1; 0 == d(a, p);) {
          p++;
        }

        t = 0;

        for (f = p; f <= e; f++) {
          t += d(a, f) << f - p, h = c(h, h);
        }

        h = c(h, n[t]);
        e = p - 1;
      }
    }

    return c(h, 1);
  },
  trim: function trim() {
    var a = this.limbs,
        b;

    do {
      b = a.pop();
    } while (a.length && 0 === b);

    a.push(b);
    return this;
  },
  reduce: function reduce() {
    return this;
  },
  fullReduce: function fullReduce() {
    return this.normalize();
  },
  normalize: function normalize() {
    var a = 0,
        b,
        d = this.placeVal,
        c = this.ipv,
        e,
        f = this.limbs,
        g = f.length,
        h = this.radixMask;

    for (b = 0; b < g || 0 !== a && -1 !== a; b++) {
      a = (f[b] || 0) + a, e = f[b] = a & h, a = (a - e) * c;
    }

    -1 === a && (f[b - 1] -= d);
    this.trim();
    return this;
  },
  cnormalize: function cnormalize() {
    var a = 0,
        b,
        d = this.ipv,
        c,
        e = this.limbs,
        f = e.length,
        g = this.radixMask;

    for (b = 0; b < f - 1; b++) {
      a = e[b] + a, c = e[b] = a & g, a = (a - c) * d;
    }

    e[b] += a;
    return this;
  },
  toBits: function toBits(a) {
    this.fullReduce();
    a = a || this.exponent || this.bitLength();
    var b = Math.floor((a - 1) / 24),
        d = sjcl.bitArray,
        c = [d.partial((a + 7 & -8) % this.radix || this.radix, this.getLimb(b))];

    for (b--; 0 <= b; b--) {
      c = d.concat(c, [d.partial(Math.min(this.radix, a), this.getLimb(b))]), a -= this.radix;
    }

    return c;
  },
  bitLength: function bitLength() {
    this.fullReduce();

    for (var a = this.radix * (this.limbs.length - 1), b = this.limbs[this.limbs.length - 1]; b; b >>>= 1) {
      a++;
    }

    return a + 7 & -8;
  }
};

sjcl.bn.fromBits = function (a) {
  var b = new this(),
      d = [],
      c = sjcl.bitArray,
      e = this.prototype,
      f = Math.min(this.bitLength || 0x100000000, c.bitLength(a)),
      g = f % e.radix || e.radix;

  for (d[0] = c.extract(a, 0, g); g < f; g += e.radix) {
    d.unshift(c.extract(a, g, e.radix));
  }

  b.limbs = d;
  return b;
};

sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2, sjcl.bn.prototype.radix));
sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1;

sjcl.bn.pseudoMersennePrime = function (a, b) {
  function d(a) {
    this.initWith(a);
  }

  var c = d.prototype = new sjcl.bn(),
      e,
      f;
  e = c.modOffset = Math.ceil(f = a / c.radix);
  c.exponent = a;
  c.offset = [];
  c.factor = [];
  c.minOffset = e;
  c.fullMask = 0;
  c.fullOffset = [];
  c.fullFactor = [];
  c.modulus = d.modulus = new sjcl.bn(Math.pow(2, a));
  c.fullMask = 0 | -Math.pow(2, a % c.radix);

  for (e = 0; e < b.length; e++) {
    c.offset[e] = Math.floor(b[e][0] / c.radix - f), c.fullOffset[e] = Math.ceil(b[e][0] / c.radix - f), c.factor[e] = b[e][1] * Math.pow(.5, a - b[e][0] + c.offset[e] * c.radix), c.fullFactor[e] = b[e][1] * Math.pow(.5, a - b[e][0] + c.fullOffset[e] * c.radix), c.modulus.addM(new sjcl.bn(Math.pow(2, b[e][0]) * b[e][1])), c.minOffset = Math.min(c.minOffset, -c.offset[e]);
  }

  c.o = d;
  c.modulus.cnormalize();

  c.reduce = function () {
    var a,
        b,
        d,
        c = this.modOffset,
        e = this.limbs,
        f = this.offset,
        p = this.offset.length,
        r = this.factor,
        t;

    for (a = this.minOffset; e.length > c;) {
      d = e.pop();
      t = e.length;

      for (b = 0; b < p; b++) {
        e[t + f[b]] -= r[b] * d;
      }

      a--;
      a || (e.push(0), this.cnormalize(), a = this.minOffset);
    }

    this.cnormalize();
    return this;
  };

  c.sa = -1 === c.fullMask ? c.reduce : function () {
    var a = this.limbs,
        b = a.length - 1,
        d,
        c;
    this.reduce();

    if (b === this.modOffset - 1) {
      c = a[b] & this.fullMask;
      a[b] -= c;

      for (d = 0; d < this.fullOffset.length; d++) {
        a[b + this.fullOffset[d]] -= this.fullFactor[d] * c;
      }

      this.normalize();
    }
  };

  c.fullReduce = function () {
    var a, b;
    this.sa();
    this.addM(this.modulus);
    this.addM(this.modulus);
    this.normalize();
    this.sa();

    for (b = this.limbs.length; b < this.modOffset; b++) {
      this.limbs[b] = 0;
    }

    a = this.greaterEquals(this.modulus);

    for (b = 0; b < this.limbs.length; b++) {
      this.limbs[b] -= this.modulus.limbs[b] * a;
    }

    this.cnormalize();
    return this;
  };

  c.inverse = function () {
    return this.power(this.modulus.sub(2));
  };

  d.fromBits = sjcl.bn.fromBits;
  return d;
};

var W = sjcl.bn.pseudoMersennePrime;
sjcl.bn.prime = {
  p127: W(127, [[0, -1]]),
  p25519: W(255, [[0, -19]]),
  p192k: W(192, [[32, -1], [12, -1], [8, -1], [7, -1], [6, -1], [3, -1], [0, -1]]),
  p224k: W(224, [[32, -1], [12, -1], [11, -1], [9, -1], [7, -1], [4, -1], [1, -1], [0, -1]]),
  p256k: W(0x100, [[32, -1], [9, -1], [8, -1], [7, -1], [6, -1], [4, -1], [0, -1]]),
  p192: W(192, [[0, -1], [64, -1]]),
  p224: W(224, [[0, 1], [96, -1]]),
  p256: W(0x100, [[0, -1], [96, 1], [192, 1], [224, -1]]),
  p384: W(384, [[0, -1], [32, 1], [96, -1], [128, -1]]),
  p521: W(521, [[0, -1]])
};

sjcl.bn.random = function (a, b) {
  "object" !== _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(a) && (a = new sjcl.bn(a));

  for (var d, c, e = a.limbs.length, f = a.limbs[e - 1] + 1, g = new sjcl.bn();;) {
    do {
      d = sjcl.random.randomWords(e, b), 0 > d[e - 1] && (d[e - 1] += 0x100000000);
    } while (Math.floor(d[e - 1] / f) === Math.floor(0x100000000 / f));

    d[e - 1] %= f;

    for (c = 0; c < e - 1; c++) {
      d[c] &= a.radixMask;
    }

    g.limbs = d;
    if (!g.greaterEquals(a)) return g;
  }
};

sjcl.ecc = {};

sjcl.ecc.point = function (a, b, d) {
  void 0 === b ? this.isIdentity = !0 : (b instanceof sjcl.bn && (b = new a.field(b)), d instanceof sjcl.bn && (d = new a.field(d)), this.x = b, this.y = d, this.isIdentity = !1);
  this.curve = a;
};

sjcl.ecc.point.prototype = {
  toJac: function toJac() {
    return new sjcl.ecc.pointJac(this.curve, this.x, this.y, new this.curve.field(1));
  },
  mult: function mult(a) {
    return this.toJac().mult(a, this).toAffine();
  },
  mult2: function mult2(a, b, d) {
    return this.toJac().mult2(a, this, b, d).toAffine();
  },
  multiples: function multiples() {
    var a, b, d;
    if (void 0 === this.pa) for (d = this.toJac().doubl(), a = this.pa = [new sjcl.ecc.point(this.curve), this, d.toAffine()], b = 3; 16 > b; b++) {
      d = d.add(this), a.push(d.toAffine());
    }
    return this.pa;
  },
  negate: function negate() {
    var a = new this.curve.field(0).sub(this.y).normalize().reduce();
    return new sjcl.ecc.point(this.curve, this.x, a);
  },
  isValid: function isValid() {
    return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))));
  },
  toBits: function toBits() {
    return sjcl.bitArray.concat(this.x.toBits(), this.y.toBits());
  }
};

sjcl.ecc.pointJac = function (a, b, d, c) {
  void 0 === b ? this.isIdentity = !0 : (this.x = b, this.y = d, this.z = c, this.isIdentity = !1);
  this.curve = a;
};

sjcl.ecc.pointJac.prototype = {
  add: function add(a) {
    var b, d, c, e;
    if (this.curve !== a.curve) throw new sjcl.exception.invalid("sjcl['ecc']['add'](): Points must be on the same curve to add them!");
    if (this.isIdentity) return a.toJac();
    if (a.isIdentity) return this;
    b = this.z.square();
    d = a.x.mul(b).subM(this.x);
    if (d.equals(0)) return this.y.equals(a.y.mul(b.mul(this.z))) ? this.doubl() : new sjcl.ecc.pointJac(this.curve);
    b = a.y.mul(b.mul(this.z)).subM(this.y);
    c = d.square();
    a = b.square();
    e = d.square().mul(d).addM(this.x.add(this.x).mul(c));
    a = a.subM(e);
    b = this.x.mul(c).subM(a).mul(b);
    c = this.y.mul(d.square().mul(d));
    b = b.subM(c);
    d = this.z.mul(d);
    return new sjcl.ecc.pointJac(this.curve, a, b, d);
  },
  doubl: function doubl() {
    if (this.isIdentity) return this;
    var a = this.y.square(),
        b = a.mul(this.x.mul(4)),
        d = a.square().mul(8),
        a = this.z.square(),
        c = this.curve.a.toString() == new sjcl.bn(-3).toString() ? this.x.sub(a).mul(3).mul(this.x.add(a)) : this.x.square().mul(3).add(a.square().mul(this.curve.a)),
        a = c.square().subM(b).subM(b),
        b = b.sub(a).mul(c).subM(d),
        d = this.y.add(this.y).mul(this.z);
    return new sjcl.ecc.pointJac(this.curve, a, b, d);
  },
  toAffine: function toAffine() {
    if (this.isIdentity || this.z.equals(0)) return new sjcl.ecc.point(this.curve);
    var a = this.z.inverse(),
        b = a.square();
    return new sjcl.ecc.point(this.curve, this.x.mul(b).fullReduce(), this.y.mul(b.mul(a)).fullReduce());
  },
  mult: function mult(a, b) {
    "number" === typeof a ? a = [a] : void 0 !== a.limbs && (a = a.normalize().limbs);
    var d,
        c,
        e = new sjcl.ecc.point(this.curve).toJac(),
        f = b.multiples();

    for (d = a.length - 1; 0 <= d; d--) {
      for (c = sjcl.bn.prototype.radix - 4; 0 <= c; c -= 4) {
        e = e.doubl().doubl().doubl().doubl().add(f[a[d] >> c & 15]);
      }
    }

    return e;
  },
  mult2: function mult2(a, b, d, c) {
    "number" === typeof a ? a = [a] : void 0 !== a.limbs && (a = a.normalize().limbs);
    "number" === typeof d ? d = [d] : void 0 !== d.limbs && (d = d.normalize().limbs);
    var e,
        f = new sjcl.ecc.point(this.curve).toJac();
    b = b.multiples();
    var g = c.multiples(),
        h,
        k;

    for (c = Math.max(a.length, d.length) - 1; 0 <= c; c--) {
      for (h = a[c] | 0, k = d[c] | 0, e = sjcl.bn.prototype.radix - 4; 0 <= e; e -= 4) {
        f = f.doubl().doubl().doubl().doubl().add(b[h >> e & 15]).add(g[k >> e & 15]);
      }
    }

    return f;
  },
  negate: function negate() {
    return this.toAffine().negate().toJac();
  },
  isValid: function isValid() {
    var a = this.z.square(),
        b = a.square(),
        a = b.mul(a);
    return this.y.square().equals(this.curve.b.mul(a).add(this.x.mul(this.curve.a.mul(b).add(this.x.square()))));
  }
};

sjcl.ecc.curve = function (a, b, d, c, e, f) {
  this.field = a;
  this.r = new sjcl.bn(b);
  this.a = new a(d);
  this.b = new a(c);
  this.G = new sjcl.ecc.point(this, new a(e), new a(f));
};

sjcl.ecc.curve.prototype.fromBits = function (a) {
  var b = sjcl.bitArray,
      d = this.field.prototype.exponent + 7 & -8;
  a = new sjcl.ecc.point(this, this.field.fromBits(b.bitSlice(a, 0, d)), this.field.fromBits(b.bitSlice(a, d, 2 * d)));
  if (!a.isValid()) throw new sjcl.exception.corrupt("not on the curve!");
  return a;
};

sjcl.ecc.curves = {
  c192: new sjcl.ecc.curve(sjcl.bn.prime.p192, "0xffffffffffffffffffffffff99def836146bc9b1b4d22831", -3, "0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1", "0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012", "0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),
  c224: new sjcl.ecc.curve(sjcl.bn.prime.p224, "0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d", -3, "0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4", "0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21", "0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),
  c256: new sjcl.ecc.curve(sjcl.bn.prime.p256, "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", -3, "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
  c384: new sjcl.ecc.curve(sjcl.bn.prime.p384, "0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973", -3, "0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef", "0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7", "0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
  c521: new sjcl.ecc.curve(sjcl.bn.prime.p521, "0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", -3, "0x051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", "0xC6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", "0x11839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650"),
  k192: new sjcl.ecc.curve(sjcl.bn.prime.p192k, "0xfffffffffffffffffffffffe26f2fc170f69466a74defd8d", 0, 3, "0xdb4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d", "0x9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"),
  k224: new sjcl.ecc.curve(sjcl.bn.prime.p224k, "0x010000000000000000000000000001dce8d2ec6184caf0a971769fb1f7", 0, 5, "0xa1455b334df099df30fc28a169a467e9e47075a90f7e650eb6b7a45c", "0x7e089fed7fba344282cafbd6f7e319f7c0b0bd59e2ca4bdb556d61a5"),
  k256: new sjcl.ecc.curve(sjcl.bn.prime.p256k, "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 0, 7, "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};

sjcl.ecc.curveName = function (a) {
  for (var b in sjcl.ecc.curves) {
    if (sjcl.ecc.curves.hasOwnProperty(b) && sjcl.ecc.curves[b] === a) return b;
  }

  throw new sjcl.exception.invalid("no such curve");
};

sjcl.ecc.deserialize = function (a) {
  if (!a || !a.curve || !sjcl.ecc.curves[a.curve]) throw new sjcl.exception.invalid("invalid serialization");
  if (-1 === ["elGamal", "ecdsa"].indexOf(a.type)) throw new sjcl.exception.invalid("invalid type");
  var b = sjcl.ecc.curves[a.curve];

  if (a.secretKey) {
    if (!a.exponent) throw new sjcl.exception.invalid("invalid exponent");
    var d = new sjcl.bn(a.exponent);
    return new sjcl.ecc[a.type].secretKey(b, d);
  }

  if (!a.point) throw new sjcl.exception.invalid("invalid point");
  d = b.fromBits(sjcl.codec.hex.toBits(a.point));
  return new sjcl.ecc[a.type].publicKey(b, d);
};

sjcl.ecc.basicKey = {
  publicKey: function publicKey(a, b) {
    this.w = a;
    this.I = a.r.bitLength();
    b instanceof Array ? this.H = a.fromBits(b) : this.H = b;

    this.serialize = function () {
      var b = sjcl.ecc.curveName(a);
      return {
        type: this.getType(),
        secretKey: !1,
        point: sjcl.codec.hex.fromBits(this.H.toBits()),
        curve: b
      };
    };

    this.get = function () {
      var a = this.H.toBits(),
          b = sjcl.bitArray.bitLength(a),
          e = sjcl.bitArray.bitSlice(a, 0, b / 2),
          a = sjcl.bitArray.bitSlice(a, b / 2);
      return {
        x: e,
        y: a
      };
    };
  },
  secretKey: function secretKey(a, b) {
    this.w = a;
    this.I = a.r.bitLength();
    this.S = b;

    this.serialize = function () {
      var b = this.get(),
          c = sjcl.ecc.curveName(a);
      return {
        type: this.getType(),
        secretKey: !0,
        exponent: sjcl.codec.hex.fromBits(b),
        curve: c
      };
    };

    this.get = function () {
      return this.S.toBits();
    };
  }
};

sjcl.ecc.basicKey.generateKeys = function (a) {
  return function (b, d, c) {
    b = b || 0x100;
    if ("number" === typeof b && (b = sjcl.ecc.curves["c" + b], void 0 === b)) throw new sjcl.exception.invalid("no such curve");
    c = c || sjcl.bn.random(b.r, d);
    d = b.G.mult(c);
    return {
      pub: new sjcl.ecc[a].publicKey(b, d),
      sec: new sjcl.ecc[a].secretKey(b, c)
    };
  };
};

sjcl.ecc.elGamal = {
  generateKeys: sjcl.ecc.basicKey.generateKeys("elGamal"),
  publicKey: function publicKey(a, b) {
    sjcl.ecc.basicKey.publicKey.apply(this, arguments);
  },
  secretKey: function secretKey(a, b) {
    sjcl.ecc.basicKey.secretKey.apply(this, arguments);
  }
};
sjcl.ecc.elGamal.publicKey.prototype = {
  kem: function kem(a) {
    a = sjcl.bn.random(this.w.r, a);
    var b = this.w.G.mult(a).toBits();
    return {
      key: sjcl.hash.sha256.hash(this.H.mult(a).toBits()),
      tag: b
    };
  },
  getType: function getType() {
    return "elGamal";
  }
};
sjcl.ecc.elGamal.secretKey.prototype = {
  unkem: function unkem(a) {
    return sjcl.hash.sha256.hash(this.w.fromBits(a).mult(this.S).toBits());
  },
  dh: function dh(a) {
    return sjcl.hash.sha256.hash(a.H.mult(this.S).toBits());
  },
  dhJavaEc: function dhJavaEc(a) {
    return a.H.mult(this.S).x.toBits();
  },
  getType: function getType() {
    return "elGamal";
  }
};
sjcl.ecc.ecdsa = {
  generateKeys: sjcl.ecc.basicKey.generateKeys("ecdsa")
};

sjcl.ecc.ecdsa.publicKey = function (a, b) {
  sjcl.ecc.basicKey.publicKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.publicKey.prototype = {
  verify: function verify(a, b, d) {
    sjcl.bitArray.bitLength(a) > this.I && (a = sjcl.bitArray.clamp(a, this.I));
    var c = sjcl.bitArray,
        e = this.w.r,
        f = this.I,
        g = sjcl.bn.fromBits(c.bitSlice(b, 0, f)),
        c = sjcl.bn.fromBits(c.bitSlice(b, f, 2 * f)),
        h = d ? c : c.inverseMod(e),
        f = sjcl.bn.fromBits(a).mul(h).mod(e),
        h = g.mul(h).mod(e),
        f = this.w.G.mult2(f, h, this.H).x;

    if (g.equals(0) || c.equals(0) || g.greaterEquals(e) || c.greaterEquals(e) || !f.equals(g)) {
      if (void 0 === d) return this.verify(a, b, !0);
      throw new sjcl.exception.corrupt("signature didn't check out");
    }

    return !0;
  },
  getType: function getType() {
    return "ecdsa";
  }
};

sjcl.ecc.ecdsa.secretKey = function (a, b) {
  sjcl.ecc.basicKey.secretKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.secretKey.prototype = {
  sign: function sign(a, b, d, c) {
    sjcl.bitArray.bitLength(a) > this.I && (a = sjcl.bitArray.clamp(a, this.I));
    var e = this.w.r,
        f = e.bitLength();
    c = c || sjcl.bn.random(e.sub(1), b).add(1);
    b = this.w.G.mult(c).x.mod(e);
    a = sjcl.bn.fromBits(a).add(b.mul(this.S));
    d = d ? a.inverseMod(e).mul(c).mod(e) : a.mul(c.inverseMod(e)).mod(e);
    return sjcl.bitArray.concat(b.toBits(f), d.toBits(f));
  },
  getType: function getType() {
    return "ecdsa";
  }
};
sjcl.keyexchange.srp = {
  makeVerifier: function makeVerifier(a, b, d, c) {
    a = sjcl.keyexchange.srp.makeX(a, b, d);
    a = sjcl.bn.fromBits(a);
    return c.g.powermod(a, c.N);
  },
  makeX: function makeX(a, b, d) {
    a = sjcl.hash.sha1.hash(a + ":" + b);
    return sjcl.hash.sha1.hash(sjcl.bitArray.concat(d, a));
  },
  knownGroup: function knownGroup(a) {
    "string" !== typeof a && (a = a.toString());
    sjcl.keyexchange.srp.ja || sjcl.keyexchange.srp.Ea();
    return sjcl.keyexchange.srp.na[a];
  },
  ja: !1,
  Ea: function Ea() {
    var a, b;

    for (a = 0; a < sjcl.keyexchange.srp.ma.length; a++) {
      b = sjcl.keyexchange.srp.ma[a].toString(), b = sjcl.keyexchange.srp.na[b], b.N = new sjcl.bn(b.N), b.g = new sjcl.bn(b.g);
    }

    sjcl.keyexchange.srp.ja = !0;
  },
  ma: [1024, 1536, 2048, 3072, 0x1000, 6144, 8192],
  na: {
    1024: {
      N: "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3",
      g: 2
    },
    1536: {
      N: "9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA9614B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F84380B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0BE3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF56EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734AF7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB",
      g: 2
    },
    2048: {
      N: "AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73",
      g: 2
    },
    3072: {
      N: "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF",
      g: 5
    },
    0x1000: {
      N: "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199FFFFFFFFFFFFFFFF",
      g: 5
    },
    6144: {
      N: "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DCC4024FFFFFFFFFFFFFFFF",
      g: 5
    },
    8192: {
      N: "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD922222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC8862F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A66D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC50846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E7160C980DD98EDD3DFFFFFFFFFFFFFFFFF",
      g: 19
    }
  }
};
sjcl.arrayBuffer = sjcl.arrayBuffer || {};
"undefined" === typeof ArrayBuffer && function (a) {
  a.ArrayBuffer = function () {};

  a.DataView = function () {};
}(undefined);
sjcl.arrayBuffer.ccm = {
  mode: "ccm",
  defaults: {
    tlen: 128
  },
  compat_encrypt: function compat_encrypt(a, b, d, c, e) {
    var f = sjcl.codec.arrayBuffer.fromBits(b, !0, 16);
    b = sjcl.bitArray.bitLength(b) / 8;
    c = c || [];
    a = sjcl.arrayBuffer.ccm.encrypt(a, f, d, c, e || 64, b);
    d = sjcl.codec.arrayBuffer.toBits(a.ciphertext_buffer);
    d = sjcl.bitArray.clamp(d, 8 * b);
    return sjcl.bitArray.concat(d, a.tag);
  },
  compat_decrypt: function compat_decrypt(a, b, d, c, e) {
    e = e || 64;
    c = c || [];
    var f = sjcl.bitArray,
        g = f.bitLength(b),
        h = f.clamp(b, g - e);
    b = f.bitSlice(b, g - e);
    h = sjcl.codec.arrayBuffer.fromBits(h, !0, 16);
    a = sjcl.arrayBuffer.ccm.decrypt(a, h, d, b, c, e, (g - e) / 8);
    return sjcl.bitArray.clamp(sjcl.codec.arrayBuffer.toBits(a), g - e);
  },
  encrypt: function encrypt(a, b, d, c, e, f) {
    var g,
        h = sjcl.bitArray,
        k = h.bitLength(d) / 8;
    c = c || [];
    e = e || sjcl.arrayBuffer.ccm.defaults.tlen;
    f = f || b.byteLength;
    e = Math.ceil(e / 8);

    for (g = 2; 4 > g && f >>> 8 * g; g++) {
      ;
    }

    g < 15 - k && (g = 15 - k);
    d = h.clamp(d, 8 * (15 - g));
    c = sjcl.arrayBuffer.ccm.R(a, b, d, c, e, f, g);
    c = sjcl.arrayBuffer.ccm.u(a, b, d, c, e, g);
    return {
      ciphertext_buffer: b,
      tag: c
    };
  },
  decrypt: function decrypt(a, b, d, c, e, f, g) {
    var h,
        k = sjcl.bitArray,
        l = k.bitLength(d) / 8;
    e = e || [];
    f = f || sjcl.arrayBuffer.ccm.defaults.tlen;
    g = g || b.byteLength;
    f = Math.ceil(f / 8);

    for (h = 2; 4 > h && g >>> 8 * h; h++) {
      ;
    }

    h < 15 - l && (h = 15 - l);
    d = k.clamp(d, 8 * (15 - h));
    c = sjcl.arrayBuffer.ccm.u(a, b, d, c, f, h);
    a = sjcl.arrayBuffer.ccm.R(a, b, d, e, f, g, h);
    if (!sjcl.bitArray.equal(c, a)) throw new sjcl.exception.corrupt("ccm: tag doesn't match");
    return b;
  },
  R: function R(a, b, d, c, e, f, g) {
    d = sjcl.mode.ccm.oa(a, c, d, e, f, g);

    if (0 !== b.byteLength) {
      for (c = new DataView(b); f < b.byteLength; f++) {
        c.setUint8(f, 0);
      }

      for (f = 0; f < c.byteLength; f += 16) {
        d[0] ^= c.getUint32(f), d[1] ^= c.getUint32(f + 4), d[2] ^= c.getUint32(f + 8), d[3] ^= c.getUint32(f + 12), d = a.encrypt(d);
      }
    }

    return sjcl.bitArray.clamp(d, 8 * e);
  },
  u: function u(a, b, d, c, e, f) {
    var g, h, k, l, m;
    g = sjcl.bitArray;
    h = g.l;
    var n = b.byteLength / 50,
        p = n;
    new DataView(new ArrayBuffer(16));
    d = g.concat([g.partial(8, f - 1)], d).concat([0, 0, 0]).slice(0, 4);
    c = g.bitSlice(h(c, a.encrypt(d)), 0, 8 * e);
    d[3]++;
    0 === d[3] && d[2]++;
    if (0 !== b.byteLength) for (e = new DataView(b), m = 0; m < e.byteLength; m += 16) {
      m > n && (sjcl.mode.ccm.ha(m / b.byteLength), n += p), l = a.encrypt(d), g = e.getUint32(m), h = e.getUint32(m + 4), f = e.getUint32(m + 8), k = e.getUint32(m + 12), e.setUint32(m, g ^ l[0]), e.setUint32(m + 4, h ^ l[1]), e.setUint32(m + 8, f ^ l[2]), e.setUint32(m + 12, k ^ l[3]), d[3]++, 0 === d[3] && d[2]++;
    }
    return c;
  }
};
"undefined" === typeof ArrayBuffer && function (a) {
  a.ArrayBuffer = function () {};

  a.DataView = function () {};
}(undefined);
sjcl.codec.arrayBuffer = {
  fromBits: function fromBits(a, b, d) {
    var c;
    b = void 0 == b ? !0 : b;
    d = d || 8;
    if (0 === a.length) return new ArrayBuffer(0);
    c = sjcl.bitArray.bitLength(a) / 8;
    if (0 !== sjcl.bitArray.bitLength(a) % 8) throw new sjcl.exception.invalid("Invalid bit size, must be divisble by 8 to fit in an arraybuffer correctly");
    b && 0 !== c % d && (c += d - c % d);
    d = new DataView(new ArrayBuffer(4 * a.length));

    for (b = 0; b < a.length; b++) {
      d.setUint32(4 * b, a[b] << 32);
    }

    a = new DataView(new ArrayBuffer(c));
    if (a.byteLength === d.byteLength) return d.buffer;
    c = d.byteLength < a.byteLength ? d.byteLength : a.byteLength;

    for (b = 0; b < c; b++) {
      a.setUint8(b, d.getUint8(b));
    }

    return a.buffer;
  },
  toBits: function toBits(a) {
    var b = [],
        d,
        c,
        e;
    if (0 === a.byteLength) return [];
    c = new DataView(a);
    d = c.byteLength - c.byteLength % 4;

    for (a = 0; a < d; a += 4) {
      b.push(c.getUint32(a));
    }

    if (0 != c.byteLength % 4) {
      e = new DataView(new ArrayBuffer(4));
      a = 0;

      for (var f = c.byteLength % 4; a < f; a++) {
        e.setUint8(a + 4 - f, c.getUint8(d + a));
      }

      b.push(sjcl.bitArray.partial(c.byteLength % 4 * 8, e.getUint32(0)));
    }

    return b;
  },
  Oa: function Oa(a) {
    function b(a) {
      a = a + "";
      return 4 <= a.length ? a : Array(4 - a.length + 1).join("0") + a;
    }

    a = new DataView(a);

    for (var d = "", c = 0; c < a.byteLength; c += 2) {
      0 == c % 16 && (d += "\n" + c.toString(16) + "\t"), d += b(a.getUint16(c).toString(16)) + " ";
    }

    void 0 === (typeof console === "undefined" ? "undefined" : _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(console)) && (console = console || {
      log: function log() {}
    });
    console.log(d.toUpperCase());
  }
};

(function () {
  function a(a, b) {
    return a << b | a >>> 32 - b;
  }

  function b(a) {
    return (a & 255) << 24 | (a & 0xff00) << 8 | (a & 0xff0000) >>> 8 | (a & -0x1000000) >>> 24;
  }

  function d(b) {
    for (var d = this.c[0], c = this.c[1], g = this.c[2], h = this.c[3], x = this.c[4], B = this.c[0], A = this.c[1], y = this.c[2], u = this.c[3], v = this.c[4], q = 0, w; 16 > q; ++q) {
      w = a(d + (c ^ g ^ h) + b[k[q]] + e[q], m[q]) + x, d = x, x = h, h = a(g, 10), g = c, c = w, w = a(B + (A ^ (y | ~u)) + b[l[q]] + f[q], n[q]) + v, B = v, v = u, u = a(y, 10), y = A, A = w;
    }

    for (; 32 > q; ++q) {
      w = a(d + (c & g | ~c & h) + b[k[q]] + e[q], m[q]) + x, d = x, x = h, h = a(g, 10), g = c, c = w, w = a(B + (A & u | y & ~u) + b[l[q]] + f[q], n[q]) + v, B = v, v = u, u = a(y, 10), y = A, A = w;
    }

    for (; 48 > q; ++q) {
      w = a(d + ((c | ~g) ^ h) + b[k[q]] + e[q], m[q]) + x, d = x, x = h, h = a(g, 10), g = c, c = w, w = a(B + ((A | ~y) ^ u) + b[l[q]] + f[q], n[q]) + v, B = v, v = u, u = a(y, 10), y = A, A = w;
    }

    for (; 64 > q; ++q) {
      w = a(d + (c & h | g & ~h) + b[k[q]] + e[q], m[q]) + x, d = x, x = h, h = a(g, 10), g = c, c = w, w = a(B + (A & y | ~A & u) + b[l[q]] + f[q], n[q]) + v, B = v, v = u, u = a(y, 10), y = A, A = w;
    }

    for (; 80 > q; ++q) {
      w = a(d + (c ^ (g | ~h)) + b[k[q]] + e[q], m[q]) + x, d = x, x = h, h = a(g, 10), g = c, c = w, w = a(B + (A ^ y ^ u) + b[l[q]] + f[q], n[q]) + v, B = v, v = u, u = a(y, 10), y = A, A = w;
    }

    w = this.c[1] + g + u;
    this.c[1] = this.c[2] + h + v;
    this.c[2] = this.c[3] + x + B;
    this.c[3] = this.c[4] + d + A;
    this.c[4] = this.c[0] + c + y;
    this.c[0] = w;
  }

  sjcl.hash.ripemd160 = function (a) {
    a ? (this.c = a.c.slice(0), this.h = a.h.slice(0), this.f = a.f) : this.reset();
  };

  sjcl.hash.ripemd160.hash = function (a) {
    return new sjcl.hash.ripemd160().update(a).finalize();
  };

  sjcl.hash.ripemd160.prototype = {
    reset: function reset() {
      this.c = c.slice(0);
      this.h = [];
      this.f = 0;
      return this;
    },
    update: function update(a) {
      "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
      var c,
          e = this.h = sjcl.bitArray.concat(this.h, a);
      c = this.f;
      a = this.f = c + sjcl.bitArray.bitLength(a);
      if (0x1fffffffffffff < a) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");

      for (c = 512 + c - (512 + c & 0x1ff); c <= a; c += 512) {
        for (var f = e.splice(0, 16), g = 0; 16 > g; ++g) {
          f[g] = b(f[g]);
        }

        d.call(this, f);
      }

      return this;
    },
    finalize: function finalize() {
      var a = sjcl.bitArray.concat(this.h, [sjcl.bitArray.partial(1, 1)]),
          c = (this.f + 1) % 512,
          c = (448 < c ? 512 : 448) - c % 448,
          e = c % 32;

      for (0 < e && (a = sjcl.bitArray.concat(a, [sjcl.bitArray.partial(e, 0)])); 32 <= c; c -= 32) {
        a.push(0);
      }

      a.push(b(this.f | 0));

      for (a.push(b(Math.floor(this.f / 4294967296))); a.length;) {
        e = a.splice(0, 16);

        for (c = 0; 16 > c; ++c) {
          e[c] = b(e[c]);
        }

        d.call(this, e);
      }

      a = this.c;
      this.reset();

      for (c = 0; 5 > c; ++c) {
        a[c] = b(a[c]);
      }

      return a;
    }
  };

  for (var c = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], e = [0, 1518500249, 1859775393, 2400959708, 2840853838], f = [1352829926, 1548603684, 1836072691, 2053994217, 0], g = 4; 0 <= g; --g) {
    for (var h = 1; 16 > h; ++h) {
      e.splice(g, 0, e[g]), f.splice(g, 0, f[g]);
    }
  }

  var k = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13],
      l = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11],
      m = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6],
      n = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
})();

 true && module.exports && (module.exports = sjcl);
"function" === typeof define && define([], function () {
  return sjcl;
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(161)(module)))

/***/ }),

/***/ 164:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 166:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 200:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 201:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 265:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 268:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/typeof.js
var helpers_typeof = __webpack_require__(13);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(1);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(9);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(7);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(8);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// CONCATENATED MODULE: ./client/src/js/chat/AttachmentInfo.js



/**
 * Implements files attachments functionality
 * Constructor accepts a file element
 */
var AttachmentInfo_AttachmentInfo =
/*#__PURE__*/
function () {
  function AttachmentInfo(file, onion, pkfp, metaID, privKey, messageID, hashEncrypted, hashUnencrypted) {
    var hashAlgo = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : "sha256";

    classCallCheck_default()(this, AttachmentInfo);

    var self = this;
    self.name = file.name;
    self.size = file.size;
    self.type = file.type;
    self.lastModified = file.lastModified;
    self.pkfp = pkfp;
    self.metaID = metaID;
    self.hashAlgorithm = hashAlgo;
    self.messageID = messageID;
    self.hashEncrypted = hashEncrypted;
    self.hashUnencrypted = hashUnencrypted;
    self.link = self.buildLink(onion, pkfp, self.hashUnencrypted);
    self.signHashes(privKey);
  }

  createClass_default()(AttachmentInfo, [{
    key: "get",
    value: function get() {
      var self = this;
      return {
        name: self.name,
        size: self.size,
        type: self.type,
        lastModified: self.lastModified,
        pkfp: self.pkfp,
        hashEncrypted: self.hashEncrypted,
        hashUnencrypted: self.hashUnencrypted,
        signEncrypted: self.signEncrypted,
        signUnencrypted: self.signUnencrypted,
        metaID: self.metaID,
        messageID: self.messageID,
        link: self.link,
        hashAlgorithm: self.hashAlgorithm
      };
    }
  }, {
    key: "getLink",
    value: function getLink() {
      return this.link;
    }
  }, {
    key: "buildLink",
    value: function buildLink(onion, pkfp, hash) {
      if (!onion || !pkfp || !hash) {
        throw "Attachment buildLink: missing required parameters";
      }

      var rawLink = onion + "/" + pkfp + "/" + hash;
      var ic = new iCrypto();
      ic.addBlob("l", rawLink).base64Encode("l", "l64");
      return ic.get("l64");
    }
  }, {
    key: "signHashes",
    value: function signHashes(privKey) {
      if (!privKey) {
        throw "Attachment signAttachmentHash: privKey is undefined";
      }

      var self = this;
      var ic = new iCrypto();
      ic.addBlob("hu", self.hashUnencrypted).addBlob("he", self.hashEncrypted).asym.setKey("pk", privKey, "private").asym.sign("hu", "pk", "sign_u").asym.sign("he", "pk", "sign_e");
      self.signUnencrypted = ic.get("sign_u");
      self.signEncrypted = ic.get("sign_e");
    }
  }], [{
    key: "verifyFileInfo",
    value: function verifyFileInfo(info) {
      var required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];

      for (var _i = 0; _i < required.length; _i++) {
        var i = required[_i];

        if (!info.hasOwnProperty(i)) {
          throw "Attachment verifyFileInfo: Missing required property: " + i;
        }
      }
    }
  }, {
    key: "parseLink",
    value: function parseLink(link) {
      var ic = new iCrypto();
      ic.addBlob("l", link).base64Decode("l", "lres");
      var elements = ic.get("lres").split("/");
      return {
        residence: elements[0],
        pkfp: elements[1],
        name: elements[2]
      };
    }
  }]);

  return AttachmentInfo;
}();
AttachmentInfo_AttachmentInfo.properties = ["name", "size", "type", "lastModified", "hashUnencrypted", "signUnencrypted", "hashEncrytped", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];
// CONCATENATED MODULE: ./client/src/js/chat/ChatMessage.js



/**
 * Represents chat message
 * Signature hashes only header + body of the message
 *
 * Recipient:
 * */

var ChatMessage_ChatMessage =
/*#__PURE__*/
function () {
  function ChatMessage(blob) {
    classCallCheck_default()(this, ChatMessage);

    if (typeof blob === "string") {
      blob = JSON.parse(blob);
    }

    this.signature = blob ? blob.signature : "";
    this.header = blob ? blob.header : {
      id: this.generateNewID(),
      timestamp: new Date(),
      metadataID: "",
      author: "",
      nickname: "",
      //AUTHOR PKFP
      recipient: "all" //RCIPIENT PKFP

    };
    this.body = blob ? blob.body : "";
    this.attachments = blob ? blob.attachments : undefined;
  }
  /**
   * encrypts and replaces the body of the message with its cipher
   * @param key Should be SYM AES key in form of a string
   */


  createClass_default()(ChatMessage, [{
    key: "encryptMessage",
    value: function encryptMessage(key) {
      var self = this;
      var ic = new iCrypto();
      ic.setSYMKey("k", key).addBlob("body", self.body).AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');

      if (self.attachments) {
        ic.addBlob("attachments", JSON.stringify(self.attachments)).AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8");
        self.attachments = ic.get("attachmentscip");
      }

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "k", "nnamecip", true);
        self.header.nickname = ic.get("nnamecip");
      }

      self.body = ic.get("bodycip");
    }
  }, {
    key: "encryptPrivateMessage",
    value: function encryptPrivateMessage(keys) {
      var self = this;
      var ic = new iCrypto();
      ic.sym.createKey("sym").addBlob("body", self.body).AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "sym", "nnamecip", true);
        self.header.nickname = ic.get("nnamecip");
      }

      self.body = ic.get("bodycip");
      self.header.keys = {};
      self.header.private = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          var icn = new iCrypto();
          icn.asym.setKey("pubk", key, "public").addBlob("sym", ic.get("sym")).asym.encrypt("sym", "pubk", "symcip", "hex").getPublicKeyFingerprint("pubk", "pkfp");
          self.header.keys[icn.get("pkfp")] = icn.get("symcip");
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "decryptPrivateMessage",
    value: function decryptPrivateMessage(privateKey) {
      try {
        var ic = new iCrypto();
        ic.asym.setKey("priv", privateKey, "private").publicFromPrivate("priv", "pub").getPublicKeyFingerprint("pub", "pkfp").addBlob("symcip", this.header.keys[ic.get("pkfp")]).asym.decrypt("symcip", "priv", "sym", "hex").addBlob("bodycip", this.body).sym.decrypt("bodycip", "sym", "body", true);
        this.body = ic.get("body");

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "sym", "nname", true);
          this.header.nickname = ic.get("nname");
        }
      } catch (err) {
        console.log("Error decrypting private message: " + err);
      }
    }
    /**
     * Decrypts body and replaces the cipher with raw text
     * @param key
     */

  }, {
    key: "decryptMessage",
    value: function decryptMessage(key) {
      try {
        var ic = new iCrypto();
        ic.sym.setKey("k", key).addBlob("bodycip", this.body).sym.decrypt("bodycip", "k", "body", true);
        this.body = ic.get("body");

        if (this.attachments) {
          ic.addBlob("attachmentscip", this.attachments).AESDecrypt("attachmentscip", "k", "attachments", true);
          this.attachments = JSON.parse(ic.get("attachments"));
        }

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "k", "nname", true);
          this.header.nickname = ic.get("nname");
        }
      } catch (err) {
        console.log("Error decrypting message: " + err);
      }
    }
    /**
     * Adds attachment metadata to the message
     * @param {Attachment} attachment
     */

  }, {
    key: "addAttachmentInfo",
    value: function addAttachmentInfo(attachment) {
      var self = this;

      if (!self.attachments) {
        self.attachments = [];
      }

      AttachmentInfo_AttachmentInfo.verifyFileInfo(attachment);
      self.attachments.push(attachment);
    }
  }, {
    key: "sign",
    value: function sign(privateKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);

      if (this.attachments) {
        requestString += JSON.stringify(this.attachments);
      }

      ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
      this.signature = ic.get("sign");
    }
  }, {
    key: "verify",
    value: function verify(publicKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);

      if (this.attachments) {
        requestString += JSON.stringify(this.attachments);
      }

      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", this.signature).addBlob("b", requestString).publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
  }, {
    key: "getNonce",
    value: function getNonce(size) {
      var ic = new iCrypto();
      ic.createNonce("n", size ? parseInt(size) : 8).bytesToHex("n", "nh");
      return ic.get("nh");
    }
  }, {
    key: "generateNewID",
    value: function generateNewID() {
      return this.getNonce(8);
    }
  }, {
    key: "toBlob",
    value: function toBlob() {
      return JSON.stringify(this);
    }
  }]);

  return ChatMessage;
}();
// CONCATENATED MODULE: ./client/src/js/chat/ChatUtility.js


var ChatUtility_ChatUtility =
/*#__PURE__*/
function () {
  function ChatUtility() {
    classCallCheck_default()(this, ChatUtility);
  }

  createClass_default()(ChatUtility, null, [{
    key: "decryptStandardMessage",

    /**
     * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
     * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
     * Sym key generated randomly every time
     * @param blob - cipher blob
     * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
     * @param privateKey
     * @returns {}
     */
    value: function decryptStandardMessage() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var privateKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));
      var symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
      var payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
      var ic = new iCrypto();
      ic.addBlob("blobcip", payloadCipher).addBlob("symkcip", symKeyCipher).asym.setKey("privk", privateKey, "private").privateKeyDecrypt("symkcip", "privk", "symk", "hex").AESDecrypt("blobcip", "symk", "blob-raw", true, "CBC", "utf8");
      return ic.get("blob-raw");
    }
  }, {
    key: "encryptStandardMessage",
    value: function encryptStandardMessage() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var ic = new iCrypto();
      ic.sym.createKey("symk").addBlob("payload", blob).asym.setKey("pubk", publicKey, "public").sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8").asym.encrypt("symk", "pubk", "symcip", "hex").encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength").merge(["blobcip", "symcip", "symciplength"], "res");
      return ic.get("res");
    }
  }, {
    key: "publicKeyEncrypt",
    value: function publicKeyEncrypt() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var ic = new iCrypto();
      ic.addBlob("blob", blob).asym.setKey("pubk", publicKey, "public").publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
      return ic.get("blobcip");
    }
  }, {
    key: "privateKeyDecrypt",
    value: function privateKeyDecrypt(blob, privateKey) {
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "hex";
      var ic = new iCrypto();
      ic.addBlob("blobcip", blob).asym.setKey("priv", privateKey, "private").privateKeyDecrypt("blobcip", "priv", "blob", encoding);
      return ic.get("blob");
    }
  }, {
    key: "symKeyEncrypt",
    value: function symKeyEncrypt(blob, key) {
      var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto();
      ic.addBlob("b", blob).sym.setKey("sym", key).AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8");
      return ic.get("cip");
    }
  }, {
    key: "symKeyDecrypt",
    value: function symKeyDecrypt(cip, key) {
      var dehexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto();
      ic.addBlob("cip", cip).sym.setKey("sym", key).AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
      return ic.get("b");
    }
  }]);

  return ChatUtility;
}();
// CONCATENATED MODULE: ./client/src/js/chat/Invite.js


var Invite_Invite =
/*#__PURE__*/
function () {
  createClass_default()(Invite, null, [{
    key: "objectValid",
    value: function objectValid(obj) {
      if (typeof obj === "string") {
        return false;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Invite.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (!obj.hasOwnProperty(i)) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }, {
    key: "decryptInvite",
    value: function decryptInvite(cipher, privateKey) {
      var symLengthEncoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var ic = new iCrypto();
      var symlength = parseInt(cipher.substr(cipher.length - symLengthEncoding));
      var symkcip = cipher.substring(cipher.length - symlength - symLengthEncoding, cipher.length - symLengthEncoding);
      var payloadcip = cipher.substring(0, cipher.length - symlength - symLengthEncoding);
      ic.addBlob("symciphex", symkcip).hexToBytes("symciphex", "symcip").addBlob("plcip", payloadcip).setRSAKey("privk", privateKey, "private").privateKeyDecrypt("symcip", "privk", "sym").AESDecrypt("plcip", "sym", "pl", true);
      return JSON.parse(ic.get("pl"));
    }
  }, {
    key: "setInviteeName",
    value: function setInviteeName(invite, name) {
      invite.inviteeName = name;
    }
  }]);

  function Invite() {
    var onionAddress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.pRequired();
    var pubKeyFingerprint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.pRequired();
    var hsPrivateKey = arguments.length > 2 ? arguments[2] : undefined;

    classCallCheck_default()(this, Invite);

    var ic = new iCrypto();
    ic.createNonce("n").bytesToHex("n", "id");
    this.set('onionAddress', onionAddress);
    this.set('pkfp', pubKeyFingerprint);
    this.set('inviteID', ic.get('id'));

    if (hsPrivateKey) {
      var _ic = new iCrypto();

      _ic.setRSAKey("k", hsPrivateKey, "private");

      this.hsPrivateKey = _ic.get("k");
    }
  }

  createClass_default()(Invite, [{
    key: "toBlob",
    value: function toBlob(encoding) {
      var result = this.get("onionAddress") + "/" + this.get("pkfp") + "/" + this.get("inviteID");

      if (encoding) {
        var ic = new iCrypto();

        if (!ic.encoders.hasOwnProperty(encoding)) {
          throw "WRONG ENCODING";
        }

        ic.addBlob("b", result).encode("b", encoding, "bencoded");
        result = ic.get("bencoded");
      }

      return result;
    }
  }, {
    key: "stringifyAndEncrypt",
    value: function stringifyAndEncrypt(publicKey) {
      if (!publicKey || !Invite.objectValid(this)) {
        throw "Error at stringifyAndEncrypt: the object is invalid or public key is not provided";
      }

      var ic = new iCrypto();
      var invite = {
        inviteCode: this.toBlob("base64"),
        hsPrivateKey: this.hsPrivateKey
      };

      if (this.inviteeName) {
        invite.inviteeName = this.inviteeName;
      }

      ic.addBlob("invite", JSON.stringify(invite)).sym.createKey("sym").setRSAKey("pubk", publicKey, "public").AESEncrypt("invite", "sym", "invitecip", true).publicKeyEncrypt("sym", "pubk", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symlength").merge(["invitecip", "symcip", "symlength"], "res");
      return ic.get("res");
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Invite.properties.includes(name)) {
        throw 'Invite: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }, {
    key: "keyExists",
    value: function keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this).includes(key.toString());
    }
  }, {
    key: "pRequired",
    value: function pRequired() {
      var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Invite";
      throw functionName + ": missing required parameter!";
    }
  }], [{
    key: "constructFromExisting",
    value: function constructFromExisting(invite) {
      var ic = new iCrypto();
      ic.addBlob("i", invite.inviteCode).base64Decode("i", "ir");
      var onion = ic.get("ir").split("/")[0];
      var newInvite = new Invite(onion, chat.session.publicKeyFingerprint, invite.hsPrivateKey);
      newInvite.set('inviteID', invite.inviteID);
      return newInvite;
    }
  }]);

  return Invite;
}();
Invite_Invite.properties = ["onionAddress", "hsPrivateKey", "pkfp", "inviteID"];
// CONCATENATED MODULE: ./client/src/js/chat/Message.js



/**
 *
 *
 * Possible headers:
 *  command: used mainly between browser and island
 *  response: island response to browser. This is an arbitrary string by which
 *         sender identifies the outcome of the request. Can be an error code like login_error
 *  error: error message if something goes wrong it should be set. If it is set -
 *              the response treated as an error code
 *  pkfpSource: public key fingerprint of the sender
 *  pkfpDest: public key fingerprint of the recipient
 *
 *
 */
var Message_Message =
/*#__PURE__*/
function () {
  function Message(request) {
    classCallCheck_default()(this, Message);

    if (typeof request === "string") {
      request = JSON.parse(request);
    }

    this.headers = request ? this.copyHeaders(request.headers) : {
      command: "",
      response: ""
    };
    this.body = request ? request.body : {};
    this.signature = request ? request.signature : "";
  }

  createClass_default()(Message, [{
    key: "setError",
    value: function setError(error) {
      this.headers.error = error || "Unknown error";
    }
  }, {
    key: "setResponse",
    value: function setResponse(response) {
      this.headers.response = response;
    }
  }, {
    key: "copyHeaders",
    value: function copyHeaders(headers) {
      var result = {};
      var keys = Object.keys(headers);

      for (var i = 0; i < keys.length; ++i) {
        result[keys[i]] = headers[keys[i]];
      }

      return result;
    }
  }, {
    key: "signMessage",
    value: function signMessage(privateKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.headers) + JSON.stringify(this.body);
      ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
      this.signature = ic.get("sign");
    }
  }, {
    key: "setSource",
    value: function setSource(pkfp) {
      this.headers.pkfpSource = pkfp;
    }
  }, {
    key: "setDest",
    value: function setDest(pkfp) {
      this.headers.pkfpDest = pkfp;
    }
  }, {
    key: "setCommand",
    value: function setCommand(command) {
      this.headers.command = command;
    }
  }, {
    key: "addNonce",
    value: function addNonce() {
      var ic = new iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      this.headers.nonce = ic.get("nhex");
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Message.properties.includes(name)) {
        throw 'Invite: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }], [{
    key: "verifyMessage",
    value: function verifyMessage(publicKey, message) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", message.signature).hexToBytes('sign', "signraw").addBlob("b", requestString);
      ic.publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
  }]);

  return Message;
}();
Message_Message.properties = ["headers", "body", "signature"];
// CONCATENATED MODULE: ./client/src/js/chat/Metadata.js


var Metadata_Metadata =
/*#__PURE__*/
function () {
  function Metadata() {
    classCallCheck_default()(this, Metadata);
  }

  createClass_default()(Metadata, null, [{
    key: "parseMetadata",
    value: function parseMetadata(blob) {
      if (typeof blob === "string") {
        return JSON.parse(blob);
      } else {
        return blob;
      }
    }
  }, {
    key: "extractSharedKey",
    value: function extractSharedKey(pkfp, privateKey, metadata) {
      var keyCipher = metadata.body.participants[pkfp].key;
      var ic = new iCrypto();
      ic.addBlob("symcip", keyCipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex");
      return ic.get("sym");
    }
  }, {
    key: "isMetadataValid",
    value: function isMetadataValid(metadata, taPublicKey) {}
  }]);

  return Metadata;
}();
// CONCATENATED MODULE: ./client/src/js/chat/Participant.js


var Participant_Participant =
/*#__PURE__*/
function () {
  createClass_default()(Participant, null, [{
    key: "objectValid",
    value: function objectValid(obj) {
      if (typeof obj === "string") {
        return false;
      }

      for (var i = 0; i < Participant.properties.length; ++i) {
        if (!obj.hasOwnProperty(Participant.properties[i])) {
          return false;
        }
      }

      return Object.keys(obj).length === Participant.properties.length;
    }
  }]);

  function Participant(blob) {
    classCallCheck_default()(this, Participant);

    if (blob) {
      this.parseBlob(blob);
    }
  }

  createClass_default()(Participant, [{
    key: "toBlob",
    value: function toBlob() {
      var stringify = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!this.readyForExport()) {
        throw "Object participant has some properties uninitialized";
      }

      var result = {};

      for (var i = 0; i < Participant.properties.length; ++i) {
        var key = Participant.properties[i];
        var value = this[Participant.properties[i]];
        console.log("Key: " + key + "; Value: " + value);
        result[Participant.properties[i]] = this[Participant.properties[i]];
      }

      return stringify ? JSON.stringify(result) : result;
    }
  }, {
    key: "parseBlob",
    value: function parseBlob(blob) {
      if (!blob) {
        throw "missing required parameter";
      }

      if (typeof blob === "string") {
        blob = JSON.parse(blob);
      }

      if (!this.objectValid(blob)) {
        throw "Participant blob is invalid";
      }

      for (var i = 0; i < Participant.properties.length; ++i) {
        this[Participant.properties[i]] = blob[Participant.properties[i]];
      }
    }
  }, {
    key: "keyExists",
    value: function keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this).includes(key.toString());
    }
  }, {
    key: "readyForExport",
    value: function readyForExport() {
      for (var i = 0; i < Participant.properties; ++i) {
        if (!this[Participant.properties[i]]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Participant.properties.includes(name)) {
        throw 'Participant: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }]);

  return Participant;
}();
Participant_Participant.properties = ["nickname", "publicKey", "publicKeyFingerprint", "residence", "rights"];
// CONCATENATED MODULE: ./client/src/js/chat/ClientSettings.js

var ClientSettings_ClientSettings = function ClientSettings() {
  classCallCheck_default()(this, ClientSettings);

  this.nicknames = {};
  this.invites = {};
};
// EXTERNAL MODULE: ./client/src/js/lib/iCrypto.js
var lib_iCrypto = __webpack_require__(10);

// EXTERNAL MODULE: ./node_modules/socket.io-client/lib/index.js
var lib = __webpack_require__(76);

// EXTERNAL MODULE: ./client/src/js/chat/WildEmitter.js
var WildEmitter = __webpack_require__(74);

// CONCATENATED MODULE: ./client/src/js/chat/ChatClient.js

















var ChatClient_ChatClient =
/*#__PURE__*/
function () {
  function ChatClient(opts) {
    classCallCheck_default()(this, ChatClient);

    this.islandConnectionStatus = false;
    this.allMessagesLoaded = false;
    this.chatSocket = null;
    this.fileSocket = null;
    this.session = null; //can be "active", "off"

    this.newTopicPending = {};
    this.pendingTopicJoins = {};
    this.outgoingMessageQueue = {};
    this.attachmentsUploadQueue = {};
    this.setClientHandlers();
    WildEmitter["a" /* WildEmitter */].mixin(this);
  }
  /*************************************************************
   * =====  Request Response and Notidication processing ======*
   *************************************************************/


  createClass_default()(ChatClient, [{
    key: "setClientHandlers",
    value: function setClientHandlers() {
      this.responseHandlers = {
        init_topic_get_token_success: this.initTopicContinueAfterTokenReceived,
        init_topic_success: this.initTopicSuccess,
        login_decryption_required: this.loginDecryptData,
        join_topic_success: this.notifyJoinSuccess,
        login_success: this.finalizeLogin,
        update_settings_success: this.onSuccessfullSettingsUpdate,
        load_more_messages_success: this.loadMoreMessagesSuccess,
        request_invite_success: this.processInviteCreated,
        request_invite_error: this.requestInviteError,
        sync_invites_success: this.syncInvitesSuccess,
        save_invite_success: this.saveInviteSuccess,
        update_invite_success: this.updateInviteSuccess,
        send_success: this.messageSendSuccess,
        del_invite_success: this.delInviteSuccess,
        boot_participant_failed: this.bootParticipantFailed,
        send_fail: this.messageSendFail,
        default: this.processInvalidResponse
      };
      this.serviceMessageHandlers = {
        metadata_issue: this.processMetadataUpdate,
        meta_sync: this.processMetadataUpdate,
        u_booted: this.uWereBooted,
        whats_your_name: this.processNicknameRequest,
        my_name_response: this.processNicknameResponse,
        nickname_change_broadcast: this.processNicknameChangeNote,
        default: this.processUnknownNote
      };
      this.messageHandlers = {
        shout_message: this.processIncomingMessage,
        whisper_message: this.processIncomingMessage
      };
      this.requestHandlers = {
        new_member_joined: this.processNewMemberJoined
      };
      this.requestErrorHandlers = {
        login_error: this.loginFail,
        init_topic_error: this.initTopicFail,
        request_invite_error: this.requestInviteError,
        sync_invites_error: this.syncInvitesError,
        default: this.unknownError
      };
    }
  }, {
    key: "processServiceMessage",
    value: function processServiceMessage(message) {
      this.serviceMessageHandlers.hasOwnProperty(message.headers.command) ? this.serviceMessageHandlers[message.headers.command](message, this) : this.serviceMessageHandlers.default(message, this);
    }
  }, {
    key: "processServiceRecord",
    value: function processServiceRecord(record, self) {
      //TODO decrypt body
      console.log("New service record arrived!");
      record.body = ChatUtility_ChatUtility.decryptStandardMessage(record.body, self.session.privateKey);
      self.emit("service_record", record);
    }
  }, {
    key: "processResponse",
    value: function processResponse(response) {
      response = new Message_Message(response);

      if (response.headers.error) {
        this.requestErrorHandlers.hasOwnProperty(response.headers.response) ? this.requestErrorHandlers[response.headers.response](response, this) : this.requestErrorHandlers.default(response, this);
        return;
      }

      this.responseHandlers.hasOwnProperty(response.headers.response) ? this.responseHandlers[response.headers.response](response, this) : this.responseHandlers.default(response, this);
    }
  }, {
    key: "processRequest",
    value: function processRequest(request) {
      this.requestHandlers.hasOwnProperty(request.headers.command) ? this.requestHandlers[request.headers.command](request, this) : this.requestErrorHandlers.default(request, this);
    }
    /**
     * Processes unknown note
     * @param note
     * @param self
     */

  }, {
    key: "processUnknownNote",
    value: function processUnknownNote(note, self) {
      console.log("UNKNOWN NOTE RECEIVED!\n" + JSON.stringify(note));
      self.emit("unknown_note", note);
    }
    /**************************************************
     * ======  TOPIC LOGIN AND REGISTRATION ==========*
     **************************************************/

    /**
     * Called initially on topic creation
     * @param {String} nickname
     * @returns {Promise<any>}
     */

  }, {
    key: "initTopic",
    value: function initTopic(nickname, topicName) {
      var _this = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee(resolve, reject) {
          var _self, ic, newTopic, request, body;

          return regenerator_default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _self = _this;
                  nickname = String(nickname).trim();

                  if (!(!nickname || nickname.length < 3)) {
                    _context.next = 6;
                    break;
                  }

                  reject("Nickname entered is invalid");
                  return _context.abrupt("return");

                case 6:
                  //CREATE NEW TOPIC PENDING
                  ic = new lib_iCrypto["a" /* iCrypto */](); //Generate keypairs one for user, other for topic

                  _context.next = 9;
                  return ic.asym.asyncCreateKeyPair('owner-keys');

                case 9:
                  ic = _context.sent;
                  _context.next = 12;
                  return ic.asym.asyncCreateKeyPair('topic-keys');

                case 12:
                  ic = _context.sent;
                  ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                  ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                  newTopic = {
                    ownerKeyPair: ic.get("owner-keys"),
                    topicKeyPair: ic.get("topic-keys"),
                    ownerPkfp: ic.get("owner-pkfp"),
                    topicID: ic.get("topic-pkfp"),
                    ownerNickName: nickname,
                    topicName: topicName
                  }; //Request island to init topic creation and get one-time key.

                  request = new Message_Message();
                  request.headers.command = "new_topic_get_token";
                  body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                  };
                  request.set("body", body);
                  _self.newTopicPending[newTopic.topicID] = newTopic;
                  _context.next = 23;
                  return _this.establishIslandConnection();

                case 23:
                  _this.chatSocket.emit("request", request);

                  resolve();
                  _context.next = 30;
                  break;

                case 27:
                  _context.prev = 27;
                  _context.t0 = _context["catch"](0);
                  throw _context.t0;

                case 30:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[0, 27]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
    /**
     * New token on init topic received. Proceeding with topic creation
     * @param response
     * @param self
     */

  }, {
    key: "initTopicContinueAfterTokenReceived",
    value: function initTopicContinueAfterTokenReceived(response, self) {
      console.log("Token received, continuing creating topic");
      var pendingTopic = self.newTopicPending[response.body.topicID];
      var token = response.body.token; // Token is 1-time disposable public key generated by server
      //Forming request

      var newTopicData = {
        topicKeyPair: pendingTopic.topicKeyPair,
        ownerPublicKey: pendingTopic.ownerKeyPair.publicKey
      };
      var newTopicDataCipher = ChatUtility_ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token); //initializing topic settings

      var settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName, pendingTopic.topicName, pendingTopic.ownerKeyPair.publicKey); //Preparing request

      var request = new Message_Message();
      request.headers.command = "init_topic";
      request.headers.pkfpSource = pendingTopic.ownerPkfp;
      request.body.topicID = pendingTopic.topicID;
      request.body.settings = settings;
      request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
      request.body.newTopicData = newTopicDataCipher; //Sending request

      self.chatSocket.emit("request", request);
    }
  }, {
    key: "prepareNewTopicSettings",
    value: function prepareNewTopicSettings(nickname, topicName, publicKey) {
      var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      //Creating and encrypting topic settings:
      var settings = {
        membersData: {},
        soundsOn: true
      };

      if (nickname) {
        var ic = new lib_iCrypto["a" /* iCrypto */]();
        ic.asym.setKey("pubk", publicKey, "public").getPublicKeyFingerprint("pubk", "pkfp");
        settings.nickname = nickname;
        settings.membersData[ic.get("pkfp")] = {
          nickname: nickname
        };
      }

      if (topicName) {
        settings.topicName = topicName;
      }

      if (encrypt) {
        return ChatUtility_ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey);
      } else {
        return settings;
      }
    }
  }, {
    key: "initTopicSuccess",
    value: function initTopicSuccess(request, self) {
      var data = self.newTopicPending[request.body.topicID];
      var pkfp = data.pkfp;
      var privateKey = data.privateKey;
      var nickname = data.nickname;
      self.emit("init_topic_success", {
        pkfp: data.ownerPkfp,
        nickname: data.ownerNickName,
        privateKey: data.ownerKeyPair.privateKey
      });
      delete self.newTopicPending[request.body.topicID];
    }
  }, {
    key: "topicLogin",
    value: function () {
      var _topicLogin = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee2(privateKey) {
        var success, error, ic, body, request;
        return regenerator_default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                success = true;
                privateKey = String(privateKey).trim();

                if (!(this.session && this.session.status === "active" && this.islandConnectionStatus)) {
                  _context2.next = 5;
                  break;
                }

                this.emit("login_success");
                return _context2.abrupt("return");

              case 5:
                _context2.prev = 5;
                _context2.next = 8;
                return this.establishIslandConnection();

              case 8:
                ic = new lib_iCrypto["a" /* iCrypto */]();
                ic.setRSAKey('pk', privateKey, "private").publicFromPrivate('pk', 'pub').getPublicKeyFingerprint('pub', 'pkfp').createNonce('nonce').bytesToHex('nonce', "noncehex");
                this.session = {
                  sessionID: ic.get("noncehex"),
                  publicKey: ic.get("pub"),
                  privateKey: ic.get('pk'),
                  publicKeyFingerprint: ic.get("pkfp"),
                  status: 'off'
                };
                body = {
                  publicKey: ic.get("pub"),
                  sessionID: ic.get("noncehex")
                };
                request = new Message_Message();
                request.set("body", body);
                request.headers.command = "init_login";
                request.headers.pkfpSource = ic.get("pkfp");
                request.signMessage(ic.get("pk"));
                this.chatSocket.emit("request", request);
                _context2.next = 24;
                break;

              case 20:
                _context2.prev = 20;
                _context2.t0 = _context2["catch"](5);
                success = false;
                error = _context2.t0.message;

              case 24:
                if (success) {
                  _context2.next = 36;
                  break;
                }

                _context2.prev = 25;
                _context2.next = 28;
                return this.terminateIslandConnection();

              case 28:
                _context2.next = 33;
                break;

              case 30:
                _context2.prev = 30;
                _context2.t1 = _context2["catch"](25);
                console.log("ERROR terminating island connection: " + _context2.t1);

              case 33:
                _context2.prev = 33;
                this.emit("login_fail", error);
                return _context2.finish(33);

              case 36:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 20], [25, 30, 33, 36]]);
      }));

      function topicLogin(_x3) {
        return _topicLogin.apply(this, arguments);
      }

      return topicLogin;
    }()
    /**
     * Islnad request to decrypt data while logging in
     * data must be in request.body.loginData and it can contain
     *    clientHSPrivateKey,
     *    TAprivateKey
     *    TAHSPrivateKey
     *
     * @param response
     * @param self
     */

  }, {
    key: "loginDecryptData",
    value: function loginDecryptData(request, self) {
      var decryptBlob = function decryptBlob(privateKey, blob) {
        var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
        var icn = new lib_iCrypto["a" /* iCrypto */]();
        var symLength = parseInt(blob.substr(-lengthChars));
        var blobLength = blob.length;
        var symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
        var cipher = blob.substring(0, blobLength - symLength - lengthChars);
        icn.addBlob("symcip", symk).addBlob("cipher", cipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex").sym.decrypt("cipher", "sym", "blob-raw", true);
        return icn.get("blob-raw");
      };

      var encryptBlob = function encryptBlob(publicKey, blob) {
        var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
        var icn = new lib_iCrypto["a" /* iCrypto */]();
        icn.createSYMKey("sym").asym.setKey("pub", publicKey, "public").addBlob("blob-raw", blob).sym.encrypt("blob-raw", "sym", "blob-cip", true).asym.encrypt("sym", "pub", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symcipl").merge(["blob-cip", "symcip", "symcipl"], "res");
        return icn.get("res");
      };

      if (!self.session) {
        console.log("invalid island request");
        return;
      }

      var clientHSPrivateKey, taPrivateKey, taHSPrivateKey;
      var token = request.body.token;
      var loginData = request.body.dataForDecryption;
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.asym.setKey("priv", self.session.privateKey, "private"); //Decrypting client Hidden service key

      if (loginData.clientHSPrivateKey) {
        clientHSPrivateKey = decryptBlob(self.session.privateKey, loginData.clientHSPrivateKey);
      }

      if (loginData.topicAuthority && loginData.topicAuthority.taPrivateKey) {
        taPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taPrivateKey);
      }

      if (loginData.topicAuthority && loginData.topicAuthority.taHSPrivateKey) {
        taHSPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taHSPrivateKey);
      }

      var preDecrypted = {};

      if (clientHSPrivateKey) {
        preDecrypted.clientHSPrivateKey = encryptBlob(token, clientHSPrivateKey);
      }

      if (taPrivateKey || taHSPrivateKey) {
        preDecrypted.topicAuthority = {};
      }

      if (taPrivateKey) {
        preDecrypted.topicAuthority.taPrivateKey = encryptBlob(token, taPrivateKey);
      }

      if (taHSPrivateKey) {
        preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(token, taHSPrivateKey);
      }

      var decReq = new Message_Message();
      decReq.headers.pkfpSource = self.session.publicKeyFingerprint;
      decReq.body = request.body;
      decReq.body.preDecrypted = preDecrypted;
      decReq.headers.command = "login_decrypted_continue";
      decReq.signMessage(self.session.privateKey);
      console.log("Decryption successfull. Sending data back to Island");
      self.chatSocket.emit("request", decReq);
    }
  }, {
    key: "finalizeLogin",
    value: function finalizeLogin(response, self) {
      var metadata = Metadata_Metadata.parseMetadata(response.body.metadata);
      var sharedKey = Metadata_Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
      var messages = self.decryptMessagesOnMessageLoad(response.body.messages);
      var settings = metadata.body.settings ? metadata.body.settings : {};
      self.session.status = "active";
      self.session.metadata = metadata.body;
      self.session.metadata.sharedKey = sharedKey;
      self.session.metadataSignature = metadata.signature;
      self.session.settings = JSON.parse(ChatUtility_ChatUtility.decryptStandardMessage(settings, self.session.privateKey));
      self.emit("login_success", messages);
      self.checkNicknames();
    }
  }, {
    key: "checkNicknames",
    value: function checkNicknames() {
      var _arr = Object.keys(this.session.metadata.participants);

      for (var _i = 0; _i < _arr.length; _i++) {
        var pkfp = _arr[_i];

        if (!this.getMemberNickname(pkfp)) {
          this.requestNickname(pkfp);
        }
      }
    }
  }, {
    key: "getMemberNickname",
    value: function getMemberNickname(pkfp) {
      if (!this.session || !pkfp) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        return membersData[pkfp].nickname;
      }
    }
  }, {
    key: "getMemberAlias",
    value: function getMemberAlias(pkfp) {
      if (!this.session || !pkfp) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (membersData[pkfp] && membersData[pkfp].alias) {
        return membersData[pkfp].alias;
      } else {
        return pkfp.substring(0, 8);
      }
    }
  }, {
    key: "deleteMemberAlias",
    value: function deleteMemberAlias(pkfp) {
      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        delete membersData[pkfp].alias;
      }
    }
  }, {
    key: "getMemberRepr",
    value: function getMemberRepr(pkfp) {
      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        return this.getMemberAlias(pkfp) || this.getMemberNickname(pkfp) || "Anonymous";
      }
    }
  }, {
    key: "deleteMemberData",
    value: function deleteMemberData(pkfp) {
      var membersData = this.session.settings.membersData;
      delete membersData[pkfp];
    }
  }, {
    key: "setMemberNickname",
    value: function setMemberNickname(pkfp, nickname, settings) {
      if (settings) {
        settings.membersData[pkfp] = {
          joined: new Date(),
          nickname: nickname
        };
        return;
      }

      if (!pkfp) {
        throw "Missing required parameter";
      }

      var membersData = this.session.settings.membersData;

      if (!membersData[pkfp]) {
        this.addNewMemberToSettings(pkfp);
      }

      membersData[pkfp].nickname = nickname;
    }
  }, {
    key: "setMemberAlias",
    value: function setMemberAlias(pkfp, alias) {
      if (!pkfp) {
        throw "Missing required parameter";
      }

      if (!this.session) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (!membersData[pkfp]) {
        membersData[pkfp] = {};
      }

      if (!alias) {
        delete membersData[pkfp].alias;
      } else {
        membersData[pkfp].alias = alias;
      }
    }
  }, {
    key: "requestNickname",
    value: function requestNickname(pkfp) {
      if (!pkfp) {
        throw "Missing required parameter";
      }

      var request = new Message_Message();
      request.setCommand("whats_your_name");
      request.setSource(this.session.publicKeyFingerprint);
      request.setDest(pkfp);
      request.addNonce();
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "broadcastNameChange",
    value: function broadcastNameChange() {
      var self = this;
      var message = new Message_Message();
      message.setCommand("nickname_change_broadcast");
      message.setSource(this.session.publicKeyFingerprint);
      message.addNonce();
      message.body.nickname = ChatUtility_ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
      message.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", message);
    }
  }, {
    key: "processNicknameResponse",
    value: function processNicknameResponse(request, self) {
      self._processNicknameResponseHelper(request, self);
    }
  }, {
    key: "processNicknameChangeNote",
    value: function processNicknameChangeNote(request, self) {
      self._processNicknameResponseHelper(request, self, true);
    }
  }, {
    key: "_processNicknameResponseHelper",
    value: function _processNicknameResponseHelper(request, self) {
      var broadcast = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      console.log("Got nickname response");
      var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;

      if (!Message_Message.verifyMessage(publicKey, request)) {
        console.trace("Invalid signature");
        return;
      }

      var existingNickname = self.getMemberNickname(request.headers.pkfpSource);
      var memberRepr = self.getMemberRepr(request.headers.pkfpSource);
      var newNickname = broadcast ? ChatUtility_ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) : ChatUtility_ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);

      if (newNickname !== existingNickname) {
        self.setMemberNickname(request.headers.pkfpSource, newNickname);
        self.saveClientSettings();

        if (existingNickname && existingNickname !== "") {
          self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
        }
      }
    }
  }, {
    key: "createServiceRecordOnMemberNicknameChange",
    value: function createServiceRecordOnMemberNicknameChange(existingName, newNickname, pkfp) {
      existingName = existingName || "";
      var msg = "Member " + existingName + " (id: " + pkfp + ") changed nickname to: " + newNickname;
      this.createRegisterServiceRecord("member_nickname_change", msg);
    }
  }, {
    key: "createRegisterServiceRecord",
    value: function createRegisterServiceRecord(event, message) {
      var request = new Message_Message();
      request.addNonce();
      request.setSource(this.session.publicKeyFingerprint);
      request.setCommand("register_service_record");
      request.body.event = event;
      request.body.message = ChatUtility_ChatUtility.encryptStandardMessage(message, this.session.publicKey);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "processNicknameRequest",
    value: function processNicknameRequest(request, self) {
      var parsedRequest = new Message_Message(request);
      var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;

      if (!Message_Message.verifyMessage(publicKey, parsedRequest)) {
        console.trace("Invalid signature");
        return;
      }

      var response = new Message_Message();
      response.setCommand("my_name_response");
      response.setSource(self.session.publicKeyFingerprint);
      response.setDest(request.headers.pkfpSource);
      response.addNonce();
      response.body.nickname = ChatUtility_ChatUtility.encryptStandardMessage(self.session.settings.nickname, publicKey);
      response.signMessage(self.session.privateKey);
      self.chatSocket.emit("request", response);
    }
  }, {
    key: "addNewMemberToSettings",
    value: function addNewMemberToSettings(pkfp) {
      this.session.settings.membersData[pkfp] = {
        joined: new Date()
      };
    }
  }, {
    key: "attemptReconnection",
    value: function () {
      var _attemptReconnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee3() {
        return regenerator_default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.topicLogin(this.session.privateKey);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function attemptReconnection() {
        return _attemptReconnection.apply(this, arguments);
      }

      return attemptReconnection;
    }()
  }, {
    key: "loadMoreMessages",
    value: function loadMoreMessages(lastLoadedMessageID) {
      if (this.allMessagesLoaded) return;
      var request = new Message_Message();
      request.headers.command = "load_more_messages";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.body.lastLoadedMessageID = lastLoadedMessageID;
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "loadMoreMessagesSuccess",
    value: function loadMoreMessagesSuccess(response, self) {
      var messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages);
      self.allMessagesLoaded = response.body.lastMessages.allLoaded || self.allMessagesLoaded;
      self.emit("messages_loaded", messages);
    }
  }, {
    key: "decryptMessagesOnMessageLoad",
    value: function decryptMessagesOnMessageLoad(data) {
      var keys = data.keys;
      var metaIDs = Object.keys(keys);

      for (var i = 0; i < metaIDs.length; ++i) {
        var ic = new lib_iCrypto["a" /* iCrypto */]();
        ic.addBlob('k', keys[metaIDs[i]]).hexToBytes("k", "kraw").setRSAKey("priv", this.session.privateKey, "private").privateKeyDecrypt("kraw", "priv", "kdec");
        keys[metaIDs[i]] = ic.get("kdec");
      }

      var messages = data.messages;
      var result = [];

      for (var _i2 = 0; _i2 < messages.length; ++_i2) {
        var message = new ChatMessage_ChatMessage(messages[_i2]);

        if (message.header.service) {
          message.body = ChatUtility_ChatUtility.decryptStandardMessage(message.body, this.session.privateKey);
        } else if (message.header.private) {
          message.decryptPrivateMessage(this.session.privateKey);
        } else {
          message.decryptMessage(keys[message.header.metadataID]);
        }

        result.push(message);
      }

      return result;
    }
  }, {
    key: "logout",
    value: function logout() {
      this.chatSocket.disconnect();
      this.session = null;
      this.allMessagesLoaded = false;
    }
  }, {
    key: "haveIRightsToBoot",
    value: function haveIRightsToBoot() {
      return parseInt(this.session.metadata.participants[this.session.publicKeyFingerprint].rights) >= 3;
    }
  }, {
    key: "bootParticipant",
    value: function bootParticipant(pkfp) {
      var self = this;

      if (!self.haveIRightsToBoot()) {
        self.emit("boot_participant_fail", "Not enough rights to boot a member");
        return;
      }

      var request = new Message_Message();
      request.headers.command = "boot_participant";
      request.headers.pkfpSource = self.session.publicKeyFingerprint;
      request.headers.pkfpDest = self.session.metadata.topicAuthority.pkfp;
      request.body.pkfp = pkfp;
      request.signMessage(self.session.privateKey);
      self.chatSocket.emit("request", request);
    }
    /**
     * TODO implement method
     * Processes notification of a member deletion
     * If this note received - it is assumed, that the member was successfully deleted
     * Need to update current metadata
     * @param note
     * @param self
     */

  }, {
    key: "noteParticipantBooted",
    value: function noteParticipantBooted(note, self) {
      console.log("Note received: A member was booted. Processing");
      var newMeta = Metadata_Metadata.parseMetadata(note.body.metadata);

      self._updateMetadata(newMeta);

      var bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
      this.deleteMemberData(note.body.bootedPkfp);
      this.saveClientSettings();
      self.emit("participant_booted", "Participant " + bootedNickname + " was booted!");
    }
  }, {
    key: "bootParticipantFailed",
    value: function bootParticipantFailed(response, self) {
      console.log("Boot member failed!");
      self.emit("boot_participant_fail", response.error);
    }
    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */

  }, {
    key: "initTopicJoin",
    value: function () {
      var _initTopicJoin = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee4(nickname, inviteCode) {
        var clientSettings, ic, invite, inviterResidence, inviterID, inviteID, headers, body, request, topicData;
        return regenerator_default.a.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);
                clientSettings = new ClientSettings_ClientSettings();
                clientSettings;
                _context4.next = 5;
                return this.establishIslandConnection();

              case 5:
                ic = new lib_iCrypto["a" /* iCrypto */]();
                ic.asym.createKeyPair("rsa").getPublicKeyFingerprint('rsa', 'pkfp').addBlob("invite64", inviteCode.trim()).base64Decode("invite64", "invite");
                invite = ic.get("invite").split("/");
                inviterResidence = invite[0];
                inviterID = invite[1];
                inviteID = invite[2];

                if (this.inviteRequestValid(inviterResidence, inviterID, inviteID)) {
                  _context4.next = 14;
                  break;
                }

                this.emit("join_topic_fail");
                throw "Invite request is invalid";

              case 14:
                this.pendingTopicJoins[inviteID] = {
                  publicKey: ic.get('rsa').publicKey,
                  privateKey: ic.get('rsa').privateKey,
                  nickname: nickname,
                  inviterID: inviterID,
                  inviterResidence: inviterResidence
                };
                headers = {
                  command: "join_topic",
                  pkfpDest: inviterID,
                  pkfpSource: ic.get('pkfp')
                };
                body = {
                  inviteString: inviteCode.trim(),
                  inviteCode: inviteID,
                  destination: inviterResidence,
                  invitee: {
                    publicKey: ic.get('rsa').publicKey,
                    nickname: nickname,
                    pkfp: ic.get('pkfp')
                  }
                };
                request = new Message_Message();
                request.set('headers', headers);
                request.set("body", body);
                request.signMessage(ic.get('rsa').privateKey);
                this.chatSocket.emit("request", request);
                topicData = {
                  newPublicKey: ic.get('rsa').publicKey,
                  newPrivateKey: ic.get('rsa').privateKey
                };
                return _context4.abrupt("return", topicData);

              case 24:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function initTopicJoin(_x4, _x5) {
        return _initTopicJoin.apply(this, arguments);
      }

      return initTopicJoin;
    }()
  }, {
    key: "initSettingsOnTopicJoin",
    value: function initSettingsOnTopicJoin(topicInfo, request) {
      var privateKey = topicInfo.privateKey;
      var publicKey = topicInfo.publicKey;
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.asym.setKey("pub", publicKey, "public").getPublicKeyFingerprint("pub", "pkfp");
      var pkfp = ic.get("pkfp");
      var topicName = ChatUtility_ChatUtility.decryptStandardMessage(request.body.topicName, privateKey);
      var inviterNickname = ChatUtility_ChatUtility.decryptStandardMessage(request.body.inviterNickname, privateKey);
      var inviterPkfp = request.body.inviterPkfp;
      var settings = this.prepareNewTopicSettings(topicInfo.nickname, topicName, topicInfo.publicKey, false);
      this.setMemberNickname(inviterPkfp, inviterNickname, settings);
      this.saveClientSettings(settings, privateKey);
    }
  }, {
    key: "onSuccessfullSettingsUpdate",
    value: function onSuccessfullSettingsUpdate(response, self) {
      console.log("Settings successfully updated!");
      self.emit("settings_updated");
    }
  }, {
    key: "notifyJoinSuccess",
    value: function notifyJoinSuccess(request, self) {
      console.log("Join successfull received!");
      var topicInfo = self.pendingTopicJoins[request.body.inviteCode];
      self.initSettingsOnTopicJoin(topicInfo, request);
      self.emit("topic_join_success", {
        nickname: topicInfo.nickname,
        privateKey: topicInfo.privateKey
      });
    }
  }, {
    key: "saveClientSettings",
    value: function saveClientSettings(settingsRaw, privateKey) {
      if (!settingsRaw) {
        settingsRaw = this.session.settings;
      }

      if (!privateKey) {
        privateKey = this.session.privateKey;
      }

      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.asym.setKey("privk", privateKey, "private").publicFromPrivate("privk", "pub").getPublicKeyFingerprint("pub", "pkfp");
      var publicKey = ic.get("pub");
      var pkfp = ic.get("pkfp");

      if (typeof_default()(settingsRaw) === "object") {
        settingsRaw = JSON.stringify(settingsRaw);
      }

      var settingsEnc = ChatUtility_ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
      var headers = {
        command: "update_settings",
        pkfpSource: pkfp
      };
      var body = {
        settings: settingsEnc
      };
      var request = new Message_Message();
      request.set("headers", headers);
      request.set("body", body);
      request.signMessage(privateKey);
      console.log("Snding update settings request");
      this.chatSocket.emit("request", request);
    }
    /**
     * TODO implement method
     * Notifies a booted member
     * If received - it is assumed that this client was successfully booted
     * from the topic.
     * Need to conceal the topic
     * @param note
     * @param self
     */

  }, {
    key: "uWereBooted",
    value: function uWereBooted(note, self) {
      console.log("Looks like I am being booted. Checking..");

      if (!Message_Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, note)) {
        console.log("Probably it was a mistake");
        return;
      }

      self.session.metadata.status = "sealed";
      console.log("You have been booted");
      self.emit("u_booted", "You have been excluded from this channel.");
    }
  }, {
    key: "updateMetaOnNewMemberJoin",
    value: function updateMetaOnNewMemberJoin(message, self) {
      self.session.metadata = JSON.parse(message.body.metadata);
      self.emit("new_member_joined");
    }
  }, {
    key: "loginFail",
    value: function loginFail(response, self) {
      console.log("Emiting login fail... " + response.headers.error);
      self.emit("login_fail", response.headers.error);
    }
  }, {
    key: "initTopicFail",
    value: function initTopicFail(response, self) {
      console.log("Init topic fail: " + response.headers.error);
      self.emit("init_topic_error", response.headers.error);
    }
  }, {
    key: "unknownError",
    value: function unknownError(response, self) {
      console.log("Unknown request error: " + response.headers.response);
      self.emit("unknown_error", response.headers.error);
    }
  }, {
    key: "processInvalidResponse",
    value: function processInvalidResponse(response, self) {
      console.log("Received invalid server response");
      self.emit("invalid_response", response);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== PARTICIPANTS HANDLING   ============*
     **************************************************/

  }, {
    key: "addNewParticipant",
    value: function addNewParticipant(nickname, publicKey, residence, rights) {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.setRSAKey("pk", publicKey, "public").getPublicKeyFingerprint("pk", "fp");
      var participant = new Participant_Participant();
      participant.set('nickname', nickname);
      participant.set('publicKey', ic.get("pk"));
      participant.set('publicKeyFingerprint', ic.get("fp"));
      participant.set('residence', residence);
      participant.set('rights', rights);
      this.session.metadata.addParticipant(participant);
      this.broadcastMetadataUpdate();
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ FILE HANDLING  ================*
     **************************************************/

    /**
     * Takes list of files and uploads them
     * to the Island asynchronously.
     *
     * Resolves with list of fileInfo JSON objects.
     * @param filesAttached list of files each type of File
     * @return Promise
     */

  }, {
    key: "uploadAttachments",
    value: function uploadAttachments(filesAttached, messageID, metaID) {
      var _this2 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee5(resolve, reject) {
          var self, filesProcessed, pkfp, privk, symk, residence, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filesInfo;

          return regenerator_default.a.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  self = _this2;

                  if (!(Worker === undefined)) {
                    _context5.next = 4;
                    break;
                  }

                  reject(null, "Client does not support web workers.");
                  return _context5.abrupt("return");

                case 4:
                  filesProcessed = [];
                  pkfp = self.session.publicKeyFingerprint;
                  privk = self.session.privateKey;
                  symk = self.session.metadata.sharedKey;
                  residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context5.prev = 12;

                  for (_iterator = filesAttached[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    file = _step.value;
                    console.log("Calling worker function");
                    filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence));
                  }

                  _context5.next = 20;
                  break;

                case 16:
                  _context5.prev = 16;
                  _context5.t0 = _context5["catch"](12);
                  _didIteratorError = true;
                  _iteratorError = _context5.t0;

                case 20:
                  _context5.prev = 20;
                  _context5.prev = 21;

                  if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }

                case 23:
                  _context5.prev = 23;

                  if (!_didIteratorError) {
                    _context5.next = 26;
                    break;
                  }

                  throw _iteratorError;

                case 26:
                  return _context5.finish(23);

                case 27:
                  return _context5.finish(20);

                case 28:
                  _context5.prev = 28;
                  _context5.next = 31;
                  return Promise.all(filesProcessed);

                case 31:
                  filesInfo = _context5.sent;
                  resolve(filesInfo);
                  _context5.next = 39;
                  break;

                case 35:
                  _context5.prev = 35;
                  _context5.t1 = _context5["catch"](28);
                  console.log("ERROR DURING UPLOAD ATTACHMENTS: " + _context5.t1);
                  reject(_context5.t1);

                case 39:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this, [[12, 16, 20, 28], [21,, 23, 27], [28, 35]]);
        }));

        return function (_x6, _x7) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
    /**
     * Uploads a single attachment to the island
     * Calculates hash of unencrypted and encrypted file
     * signs both hashes
     * resolves with fileInfo object
     * @returns {Promise<any>}
     */

  }, {
    key: "uploadAttachmentWithWorker",
    value: function uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence) {
      return new Promise(function (resolve, reject) {
        console.log("!!!Initializing worker...");
        var uploader = new Worker("/js/uploaderWorker.js");

        var uploadComplete = function uploadComplete(msg) {
          var fileInfo = new AttachmentInfo_AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
          uploader.terminate();
          resolve(fileInfo);
        };

        var uploadProgress = function uploadProgress(msg) {//TODO implement event handling
        };

        var uploadError = function uploadError(msg) {
          uploader.terminate();
          self.emit("upload_error", msg.data);
          reject(data);
        };

        var messageHandlers = {
          "upload_complete": uploadComplete,
          "upload_progress": uploadProgress,
          "upload_error": uploadError
        };

        uploader.onmessage = function (ev) {
          var msg = ev.data;
          messageHandlers[msg.result](msg.data);
        };

        uploader.postMessage({
          command: "upload",
          attachment: file,
          pkfp: pkfp,
          privk: privk,
          symk: symk
        });
      });
    }
    /**
     * Downloads requested attachment
     *
     * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
     *          Must contain all required info including hashes, signatures, and link
     */

  }, {
    key: "downloadAttachment",
    value: function downloadAttachment(fileInfo) {
      var _this3 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref3 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee6(resolve, reject) {
          var self, privk, parsedFileInfo, fileOwnerPublicKey, err, myPkfp, fileData;
          return regenerator_default.a.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  self = _this3;
                  privk = self.session.privateKey; //To decrypt SYM key
                  //Getting public key of

                  parsedFileInfo = JSON.parse(fileInfo);
                  fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

                  if (Worker === undefined) {
                    err = "Worker is not defined.Cannot download file.";
                    console.log(err);
                    reject(err);
                  }

                  myPkfp = self.session.publicKeyFingerprint;
                  _context6.next = 8;
                  return self.downloadAttachmentWithWorker(fileInfo, myPkfp, privk, fileOwnerPublicKey);

                case 8:
                  fileData = _context6.sent;
                  self.emit("download_complete", {
                    fileInfo: fileInfo,
                    fileData: fileData
                  });

                case 10:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        return function (_x8, _x9) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "downloadAttachmentWithWorker",
    value: function downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk) {
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref4 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee7(resolve, reject) {
          var downloader, downloadComplete, messageHandlers, processMessage;
          return regenerator_default.a.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  downloader = new Worker("/js/downloaderWorker.js");

                  downloadComplete = function downloadComplete(fileBuffer) {
                    resolve(fileBuffer);
                    downloader.terminate();
                  };

                  messageHandlers = {
                    "download_complete": downloadComplete
                  };

                  processMessage = function processMessage(msg) {
                    messageHandlers[msg.result](msg.data);
                  };

                  downloader.onmessage = function (ev) {
                    processMessage(ev.data);
                  };

                  downloader.postMessage({
                    command: "download",
                    data: {
                      fileInfo: fileInfo,
                      myPkfp: myPkfp,
                      privk: privk,
                      pubk: ownerPubk
                    }
                  });

                case 6:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        return function (_x10, _x11) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ MESSAGE HANDLING  ============*
     **************************************************/

  }, {
    key: "prepareMessage",
    value: function prepareMessage(messageContent, recipientPkfp) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var self = _this4;
        console.log("Preparing message: " + messageContent);

        if (!self.isLoggedIn()) {
          self.emit("login_required");
          reject();
        } //Preparing chat message


        var chatMessage = new ChatMessage_ChatMessage();
        chatMessage.header.metadataID = _this4.session.metadata.id;
        chatMessage.header.author = _this4.session.publicKeyFingerprint;
        chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
        chatMessage.header.private = !!recipientPkfp;
        chatMessage.header.nickname = self.session.settings.nickname;
        chatMessage.body = messageContent;
        resolve(chatMessage);
      });
    }
    /**
     * Sends the message.
     *
     * @param {string} messageContent
     * @param {array} filesAttached Array of attached files. Should be taken straight from input field
     * @returns {Promise<any>}
     */

  }, {
    key: "shoutMessage",
    value: function shoutMessage(messageContent, filesAttached) {
      var _this5 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee8(resolve, reject) {
          var self, attachmentsInfo, metaID, chatMessage, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, att, message, userPrivateKey;

          return regenerator_default.a.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  self = _this5;
                  metaID = self.session.metadata.id;
                  _context8.next = 4;
                  return self.prepareMessage(messageContent);

                case 4:
                  chatMessage = _context8.sent;

                  if (!(filesAttached && filesAttached.length > 0)) {
                    _context8.next = 28;
                    break;
                  }

                  _context8.next = 8;
                  return self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);

                case 8:
                  attachmentsInfo = _context8.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _iteratorError2 = undefined;
                  _context8.prev = 12;

                  for (_iterator2 = attachmentsInfo[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    att = _step2.value;
                    chatMessage.addAttachmentInfo(att);
                  }

                  _context8.next = 20;
                  break;

                case 16:
                  _context8.prev = 16;
                  _context8.t0 = _context8["catch"](12);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context8.t0;

                case 20:
                  _context8.prev = 20;
                  _context8.prev = 21;

                  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                  }

                case 23:
                  _context8.prev = 23;

                  if (!_didIteratorError2) {
                    _context8.next = 26;
                    break;
                  }

                  throw _iteratorError2;

                case 26:
                  return _context8.finish(23);

                case 27:
                  return _context8.finish(20);

                case 28:
                  chatMessage.encryptMessage(_this5.session.metadata.sharedKey);
                  chatMessage.sign(_this5.session.privateKey); //Preparing request

                  message = new Message_Message();
                  message.headers.pkfpSource = _this5.session.publicKeyFingerprint;
                  message.headers.command = "broadcast_message";
                  message.body.message = chatMessage.toBlob();
                  userPrivateKey = _this5.session.privateKey;
                  message.signMessage(userPrivateKey); //console.log("Message ready: " + JSON.stringify(message));

                  _this5.chatSocket.emit("request", message);

                  resolve();

                case 38:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this, [[12, 16, 20, 28], [21,, 23, 27]]);
        }));

        return function (_x12, _x13) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "whisperMessage",
    value: function whisperMessage(pkfp, messageContent, filesAttached) {
      var _this6 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref6 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee9(resolve, reject) {
          var self, chatMessage, keys, message, userPrivateKey;
          return regenerator_default.a.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  self = _this6;
                  _context9.next = 3;
                  return self.prepareMessage(messageContent, pkfp);

                case 3:
                  chatMessage = _context9.sent;
                  //Will be enabled in the next version
                  keys = [self.session.publicKey];
                  keys.push(self.session.metadata.participants[pkfp].publicKey);
                  chatMessage.encryptPrivateMessage(keys);
                  chatMessage.sign(_this6.session.privateKey); //Preparing request

                  message = new Message_Message();
                  message.headers.pkfpSource = _this6.session.publicKeyFingerprint;
                  message.headers.pkfpDest = pkfp;
                  message.headers.command = "send_message";
                  message.headers.private = true;
                  message.body.message = chatMessage.toBlob();
                  userPrivateKey = _this6.session.privateKey;
                  message.signMessage(userPrivateKey);

                  _this6.chatSocket.emit("request", message);

                  resolve();

                case 18:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        return function (_x14, _x15) {
          return _ref6.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "processIncomingMessage",
    value: function processIncomingMessage(data, self) {
      console.log("Received incoming message! ");
      var message = data.message;
      var symKey = data.key ? ChatUtility_ChatUtility.privateKeyDecrypt(data.key, self.session.privateKey) : self.session.metadata.sharedKey;
      var chatMessage = new ChatMessage_ChatMessage(message.body.message);
      var author = self.session.metadata.participants[chatMessage.header.author];

      if (!author) {
        throw "Author is not found in the current version of metadata!";
      }

      if (!chatMessage.verify(author.publicKey)) {
        self.emit("error", "Received message with invalid signature!");
      }

      if (!chatMessage.header.private && !data.key && chatMessage.header.metadataID !== self.session.metadata.id) {
        throw "current metadata cannot decrypt this message";
      }

      if (chatMessage.header.private) {
        chatMessage.decryptPrivateMessage(self.session.privateKey);
      } else {
        chatMessage.decryptMessage(symKey);
      }

      var authorNickname = chatMessage.header.nickname;
      var authorPkfp = chatMessage.header.author;
      var authorExistingName = self.getMemberNickname(authorPkfp);

      if (!this.nicknameAssigned(authorPkfp) || authorNickname !== self.getMemberNickname(authorPkfp)) {
        self.setMemberNickname(authorPkfp, authorNickname);
        self.saveClientSettings();
        self.createServiceRecordOnMemberNicknameChange(authorExistingName, authorNickname, authorPkfp);
      }

      self.emit("chat_message", chatMessage);
    }
  }, {
    key: "nicknameAssigned",
    value: function nicknameAssigned(pkfp) {
      try {
        return this.session.settings.membersData[pkfp].hasOwnProperty("nickname");
      } catch (err) {
        return false;
      }
    }
  }, {
    key: "messageSendSuccess",
    value: function () {
      var _messageSendSuccess = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee10(response, self) {
        var chatMessage, author;
        return regenerator_default.a.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                chatMessage = new ChatMessage_ChatMessage(response.body.message);
                author = self.session.metadata.participants[chatMessage.header.author];

                if (author) {
                  _context10.next = 4;
                  break;
                }

                throw "Author is not found in the current version of metadata!";

              case 4:
                if (!chatMessage.verify(author.publicKey)) {
                  self.emit("error", "Received message with invalid signature!");
                }

                if (!(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id)) {
                  _context10.next = 7;
                  break;
                }

                throw "current metadata cannot decrypt this message";

              case 7:
                if (chatMessage.header.private) {
                  chatMessage.decryptPrivateMessage(self.session.privateKey);
                } else {
                  chatMessage.decryptMessage(self.session.metadata.sharedKey);
                }

                self.emit("send_success", chatMessage);

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function messageSendSuccess(_x16, _x17) {
        return _messageSendSuccess.apply(this, arguments);
      }

      return messageSendSuccess;
    }()
  }, {
    key: "messageSendFail",
    value: function messageSendFail(response, self) {
      var messageID = JSON.parse(response).body.message.header.id;
      self.emit("send_fail", self.outgoingMessageQueue[messageID]);
      delete self.outgoingMessageQueue[messageID];
    }
  }, {
    key: "isLoggedIn",
    value: function isLoggedIn() {
      return this.session && this.session.status === "active";
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ INVITES HANDLING  ============*
     **************************************************/

    /**
     * Sends request to topic authority to create an invite
     */

  }, {
    key: "requestInvite",
    value: function requestInvite() {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message();
      var myNickNameEncrypted = ChatUtility_ChatUtility.encryptStandardMessage(this.session.settings.nickname, this.session.metadata.topicAuthority.publicKey);
      var topicNameEncrypted = ChatUtility_ChatUtility.encryptStandardMessage(this.session.settings.topicName, this.session.metadata.topicAuthority.publicKey);
      request.headers.command = "request_invite";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      request.body.nickname = myNickNameEncrypted;
      request.body.topicName = topicNameEncrypted;
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "syncInvites",
    value: function syncInvites() {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message();
      request.headers.command = "sync_invites";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      request.headers.nonce = ic.get("nhex");
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "syncInvitesSuccess",
    value: function syncInvitesSuccess(response, self) {
      if (Message_Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, response)) {
        self.updatePendingInvites(response.body.invites);
        self.emit(response.headers.response);
      } else {
        throw "invalid message";
      }
    }
  }, {
    key: "generateInvite",
    value: function generateInvite() {
      if (!this.session || !(this.session.status === "active")) {
        this.emit("login_required");
        return;
      }

      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.createNonce("iid").bytesToHex('iid', "iidhex");
      var body = {
        requestID: ic.get("iidhex"),
        pkfp: this.session.publicKeyFingerprint
      };
      var request = new Message_Message();
      request.headers.command = "request_invite";
      request.set("body", body);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "requestInviteError",
    value: function requestInviteError(response, self) {
      console.log("Request invite error received: " + response.headers.error);
      self.emit("request_invite_error", response.headers.error);
    }
  }, {
    key: "syncInvitesError",
    value: function syncInvitesError(response, self) {
      console.log("Sync invites error received: " + response.headers.error);
      self.emit("sync_invites_error", response.headers.error);
    }
  }, {
    key: "processInviteCreated",
    value: function processInviteCreated(response, self) {
      self.updatePendingInvites(response.body.userInvites);
      self.emit("request_invite_success", response.body.inviteCode);
    }
  }, {
    key: "updateSetInviteeName",
    value: function updateSetInviteeName(inviteID, name) {
      this.session.settings.invites[inviteID].name = name;
      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "saveInviteSuccess",
    value: function saveInviteSuccess(response, self) {
      self.updatePendingInvites(response.body.userInvites);
      self.emit("invite_generated", self.session.pendingInvites[response.body.inviteID]);
    }
  }, {
    key: "updateInviteSuccess",
    value: function updateInviteSuccess(response, self) {
      self.updatePendingInvites(response.body.invites);
      self.emit("invite_updated");
    }
    /**
     * Given a dictionary of encrypted pending invites from history
     * decrypts them and adds to the current session
     * @param invitesUpdatedEncrypted
     */

  }, {
    key: "updatePendingInvites",
    value: function updatePendingInvites(userInvites) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = userInvites[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var i = _step3.value;

          if (!this.session.settings.invites.hasOwnProperty(i)) {
            this.session.settings.invites[i] = {};
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _arr2 = Object.keys(this.session.settings.invites);

      for (var _i3 = 0; _i3 < _arr2.length; _i3++) {
        var _i4 = _arr2[_i3];

        if (!userInvites.includes(_i4)) {
          delete this.session.settings.invites[_i4];
        }
      }

      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "settingsInitInvites",
    value: function settingsInitInvites() {
      this.session.settings.invites = {};
      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "deleteInvite",
    value: function deleteInvite(id) {
      console.log("About to delete invite: " + id);
      var request = new Message_Message();
      request.headers.command = "del_invite";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      var body = {
        invite: id
      };
      request.set("body", body);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "delInviteSuccess",
    value: function delInviteSuccess(response, self) {
      console.log("Del invite success! ");
      self.updatePendingInvites(response.body.invites);
      self.emit("del_invite_success");
    }
  }, {
    key: "getPendingInvites",
    value: function getPendingInvites() {
      console.log("Del invite fail! ");
      self.emit("del_invite_fail");
    }
  }, {
    key: "inviteRequestValid",
    value: function inviteRequestValid(inviterResidence, inviterID, inviteID) {
      return inviteID && inviteID && this.onionValid(inviterResidence);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ====== ISLAND CONNECTION HANDLING  ============*
     **************************************************/

  }, {
    key: "establishIslandConnection",
    value: function () {
      var _establishIslandConnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee11() {
        var _this7 = this;

        var option,
            _args11 = arguments;
        return regenerator_default.a.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                option = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : "chat";
                return _context11.abrupt("return", new Promise(function (resolve, reject) {
                  if (option === "chat") {
                    if (_this7.chatSocket && _this7.chatSocket.connected) {
                      resolve();
                      return;
                    }

                    _this7.chatSocket = lib('/chat', {
                      reconnection: false,
                      forceNew: true,
                      transports: ['websocket', "longpoll"],
                      pingInterval: 10000,
                      pingTimeout: 5000
                    });

                    _this7.chatSocket.on('connect', function () {
                      _this7.finishSocketSetup();

                      console.log("Island connection established");
                      _this7.islandConnectionStatus = true;

                      _this7.emit("connected_to_island");

                      resolve();
                    });

                    _this7.chatSocket.on("disconnect", function () {
                      console.log("Island disconnected.");
                      _this7.islandConnectionStatus = false;

                      _this7.emit("disconnected_from_island");
                    });

                    _this7.chatSocket.on('connect_error', function (err) {
                      console.log('Connection Failed');
                      reject(err);
                    });
                  } else if (option === "file") {
                    console.log("Connecting to file socket");

                    if (_this7.fileSocket && _this7.fileSocket.connected) {
                      console.log("File socket already connected! returning");
                      resolve();
                      return;
                    }

                    _this7.fileSocket = lib('/file', {
                      'reconnection': true,
                      'forceNew': true,
                      'reconnectionDelay': 1000,
                      'reconnectionDelayMax': 5000,
                      'reconnectionAttempts': 5
                    });

                    _this7.fileSocket.on("connect", function () {
                      _this7.setupFileTransferListeners();

                      console.log("File transfer connectiopn established");
                      resolve();
                    });

                    _this7.fileSocket.on("connect_error", function (err) {
                      console.log('Island connection failed: ' + err.message);
                      reject(err);
                    });
                  }
                }));

              case 2:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function establishIslandConnection() {
        return _establishIslandConnection.apply(this, arguments);
      }

      return establishIslandConnection;
    }()
  }, {
    key: "terminateIslandConnection",
    value: function () {
      var _terminateIslandConnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee12() {
        return regenerator_default.a.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.prev = 0;

                if (this.chatSocket && this.chatSocket.connected) {
                  this.chatSocket.disconnect();
                }

                _context12.next = 7;
                break;

              case 4:
                _context12.prev = 4;
                _context12.t0 = _context12["catch"](0);
                throw "Error terminating connection with island: " + _context12.t0;

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[0, 4]]);
      }));

      function terminateIslandConnection() {
        return _terminateIslandConnection.apply(this, arguments);
      }

      return terminateIslandConnection;
    }() //TODO implement method

  }, {
    key: "setupFileTransferListeners",
    value: function setupFileTransferListeners() {}
  }, {
    key: "finishSocketSetup",
    value: function finishSocketSetup() {
      this.initChatListeners();
    }
  }, {
    key: "initChatListeners",
    value: function initChatListeners() {
      var _this8 = this;

      this.chatSocket.on('message', function (message) {
        console.log(JSON.stringify(message));
      });
      this.chatSocket.on('request', function (request) {
        console.log("Received new incoming request");

        _this8.processRequest(request, _this8);
      });
      this.chatSocket.on("response", function (response) {
        _this8.processResponse(response, _this8);
      });
      this.chatSocket.on("service", function (message) {
        _this8.processServiceMessage(message, _this8);
      });
      this.chatSocket.on("service_record", function (message) {
        console.log("Got SERVICE RECORD!");

        _this8.processServiceRecord(message, _this8);
      });
      this.chatSocket.on("message", function (message) {
        _this8.processIncomingMessage(message, _this8);
      });
      this.chatSocket.on('reconnect', function (attemptNumber) {
        console.log("Successfull reconnect client");
      });
      this.chatSocket.on('metadata_update', function (meta) {
        _this8.processMetadataUpdate(meta);
      });
      /*
              this.chatSocket.on("chat_session_registered", (params)=>{
                  if (params.success){
                      this.session.status = "active";
                      this.emit("chat_session_registered");
                  }
              });
      */
      // this.chatSocket.on("last_metadata",(data)=>{
      //     this.processMetadataResponse(data);
      // })
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== METADATA MANIPULATION   ============*
     **************************************************/

    /**
     * Takes metadata from session variable,
     * prepares it and sends to all participants
     */

  }, {
    key: "broadcastMetadataUpdate",
    value: function broadcastMetadataUpdate(metadata) {
      var _this9 = this;

      var newMetadata = this.session.metadata.toBlob(true);
      var updateRequest = {
        myBlob: newMetadata,
        topicID: this.session.metadata.topicID,
        publicKeyFingerprint: this.session.publicKeyFingerprint,
        recipients: {}
      };
      Object.keys(this.session.metadata.participants).forEach(function (key) {
        //TODO encrypt
        var encryptedMeta = newMetadata;
        var fp = _this9.session.metadata.participants[key].publicKeyFingerprint;
        var residence = _this9.session.metadata.participants[key].residence;
        updateRequest.recipients[key] = {
          residence: residence,
          metadata: newMetadata
        };
      });
      this.chatSocket.emit("broadcast_metadata_update", updateRequest);
    } //SHIT CODE

  }, {
    key: "processMetadataUpdate",
    value: function processMetadataUpdate(message, self) {
      if (message.headers.event === "new_member_joined") {
        self.processNewMemberJoined(message, self);
      } else if (message.headers.event === "member_booted") {
        self.noteParticipantBooted(message, self);
      } else if (message.headers.event === "u_booted") {
        this.uWereBooted(message, self);
      } else if (message.headers.event === "meta_sync") {
        self.processMetaSync(message, self);
      }
    }
  }, {
    key: "processMetaSync",
    value: function processMetaSync(message, self) {
      if (!self.session) {
        return;
      }

      console.log("Processing metadata sync message");

      if (message.body.metadata) {
        self._updateMetadata(Metadata_Metadata.parseMetadata(message.body.metadata));

        self.emit("metadata_updated");
      }
    }
  }, {
    key: "processNewMemberJoined",
    value: function processNewMemberJoined(request, self) {
      if (!self.session) {
        return;
      }

      var newMemberPkfp = request.body.pkfp;
      var newMemberNickname = request.body.nickname;

      self._updateMetadata(Metadata_Metadata.parseMetadata(request.body.metadata));

      self.addNewMemberToSettings(newMemberPkfp);
      self.setMemberNickname(newMemberPkfp, newMemberNickname);
      self.saveClientSettings();
      self.emit("new_member_joined");
    }
  }, {
    key: "_updateMetadata",
    value: function _updateMetadata(metadata) {
      var self = this;
      var sharedKey = Metadata_Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
      self.session.metadata = metadata.body;
      self.session.metadata.sharedKey = sharedKey;
      self.session.metadataSignature = metadata.signature;
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== SETTINGS UPDATES ====================*
     **************************************************/

  }, {
    key: "myNicknameUpdate",
    value: function myNicknameUpdate(newNickName) {
      if (!newNickName) {
        return;
      }

      newNickName = newNickName.trim();
      var settings = this.session.settings;

      if (settings.nickname === newNickName) {
        return;
      }

      settings.nickname = newNickName;
      this.setMemberNickname(this.session.publicKeyFingerprint, newNickName);
      this.saveClientSettings(settings, this.session.privateKey);
      this.broadcastNameChange();
    }
  }, {
    key: "topicNameUpdate",
    value: function topicNameUpdate(newTopicName) {
      if (!newTopicName) {
        return;
      }

      newTopicName = newTopicName.trim();
      var settings = this.session.settings;

      if (settings.topicName === newTopicName) {
        return;
      }

      settings.topicName = newTopicName;
      this.saveClientSettings(settings, this.session.privateKey);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== UTILS   ============*
     **************************************************/

  }, {
    key: "signBlob",
    value: function signBlob(privateKey, blob) {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.setRSAKey("pk", privateKey, "private").addBlob("b", blob).privateKeySign("b", "pk", "sign");
      return ic.get("sign");
    }
  }, {
    key: "verifyBlob",
    value: function verifyBlob(publicKey, sign, blob) {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", sign).addBlob("b", blob).publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
    /**
     * Generates .onion address and RSA1024 private key for it
     */

  }, {
    key: "generateOnionService",
    value: function generateOnionService() {
      var pkraw = forge.rsa.generateKeyPair(1024);
      var pkfp = forge.pki.getPublicKeyFingerprint(pkraw.publicKey, {
        encoding: 'hex',
        md: forge.md.sha1.create()
      });
      var pem = forge.pki.privateKeyToPem(pkraw.privateKey);

      if (pkfp.length % 2 !== 0) {
        // odd number of characters
        pkfp = '0' + pkfp;
      }

      var bytes = [];

      for (var i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
      }

      var onion = base32.encode(bytes).toLowerCase() + ".onion";
      return {
        onion: onion,
        privateKey: pem
      };
    }
  }, {
    key: "onionAddressFromPrivateKey",
    value: function onionAddressFromPrivateKey(privateKey) {
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.setRSAKey("privk", privateKey, "private").publicFromPrivate("privk", "pubk");
      var pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"));
      var pkfp = forge.pki.getPublicKeyFingerprint(pkraw, {
        encoding: 'hex',
        md: forge.md.sha1.create()
      });

      if (pkfp.length % 2 !== 0) {
        pkfp = '0' + pkfp;
      }

      var bytes = [];

      for (var i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
      }

      return base32.encode(bytes).toLowerCase() + ".onion";
    }
  }, {
    key: "extractFromInvite",
    value: function extractFromInvite(inviteString64) {
      var thingToExtract = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "all";
      var ic = new lib_iCrypto["a" /* iCrypto */]();
      ic.addBlob("is64", inviteString64).base64Decode("is64", "is");
      var inviteParts = ic.get("is").split("/");
      var things = {
        "hsid": inviteParts[0],
        "pkfp": inviteParts[1],
        "inviteCode": inviteParts[2],
        "all": inviteParts
      };

      try {
        return things[thingToExtract];
      } catch (err) {
        throw "Invalid parameter thingToExtract";
      }
    }
  }, {
    key: "onionValid",
    value: function onionValid(candidate) {
      var pattern = /^[a-z2-7]{16}\.onion$/;
      return pattern.test(candidate);
    }
  }, {
    key: "getMyResidence",
    value: function getMyResidence() {
      return this.session.metadata.participants[this.session.publicKeyFingerprint].residence;
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

  }]);

  return ChatClient;
}();

/* harmony default export */ var chat_ChatClient = __webpack_exports__["default"] = (ChatClient_ChatClient);

/***/ }),

/***/ 74:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WildEmitter; });
function WildEmitter() {}

WildEmitter.mixin = function (constructor) {
  var prototype = constructor.prototype || constructor;
  prototype.isWildEmitter = true; // Listen on the given `event` with `fn`. Store a group name if present.

  prototype.on = function (event, groupName, fn) {
    this.callbacks = this.callbacks || {};
    var hasGroup = arguments.length === 3,
        group = hasGroup ? arguments[1] : undefined,
        func = hasGroup ? arguments[2] : arguments[1];
    func._groupName = group;
    (this.callbacks[event] = this.callbacks[event] || []).push(func);
    return this;
  }; // Adds an `event` listener that will be invoked a single
  // time then automatically removed.


  prototype.once = function (event, groupName, fn) {
    var self = this,
        hasGroup = arguments.length === 3,
        group = hasGroup ? arguments[1] : undefined,
        func = hasGroup ? arguments[2] : arguments[1];

    function on() {
      self.off(event, on);
      func.apply(this, arguments);
    }

    this.on(event, group, on);
    return this;
  }; // Unbinds an entire group


  prototype.releaseGroup = function (groupName) {
    this.callbacks = this.callbacks || {};
    var item, i, len, handlers;

    for (item in this.callbacks) {
      handlers = this.callbacks[item];

      for (i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i]._groupName === groupName) {
          //console.log('removing');
          // remove it and shorten the array we're looping through
          handlers.splice(i, 1);
          i--;
          len--;
        }
      }
    }

    return this;
  }; // Remove the given callback for `event` or all
  // registered callbacks.


  prototype.off = function (event, fn) {
    this.callbacks = this.callbacks || {};
    var callbacks = this.callbacks[event],
        i;
    if (!callbacks) return this; // remove all handlers

    if (arguments.length === 1) {
      delete this.callbacks[event];
      return this;
    } // remove specific handler


    i = callbacks.indexOf(fn);
    callbacks.splice(i, 1);

    if (callbacks.length === 0) {
      delete this.callbacks[event];
    }

    return this;
  }; /// Emit `event` with the given args.
  // also calls any `*` handlers


  prototype.emit = function (event) {
    this.callbacks = this.callbacks || {};
    var args = [].slice.call(arguments, 1),
        callbacks = this.callbacks[event],
        specialCallbacks = this.getWildcardCallbacks(event),
        i,
        len,
        item,
        listeners;

    if (callbacks) {
      listeners = callbacks.slice();

      for (i = 0, len = listeners.length; i < len; ++i) {
        if (!listeners[i]) {
          break;
        }

        listeners[i].apply(this, args);
      }
    }

    if (specialCallbacks) {
      len = specialCallbacks.length;
      listeners = specialCallbacks.slice();

      for (i = 0, len = listeners.length; i < len; ++i) {
        if (!listeners[i]) {
          break;
        }

        listeners[i].apply(this, [event].concat(args));
      }
    }

    return this;
  }; // Helper for for finding special wildcard event handlers that match the event


  prototype.getWildcardCallbacks = function (eventName) {
    this.callbacks = this.callbacks || {};
    var item,
        split,
        result = [];

    for (item in this.callbacks) {
      split = item.split('*');

      if (item === '*' || split.length === 2 && eventName.slice(0, split[0].length) === split[0]) {
        result = result.concat(this.callbacks[item]);
      }
    }

    return result;
  };
};

WildEmitter.mixin(WildEmitter);

/***/ }),

/***/ 82:
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

/******/ });