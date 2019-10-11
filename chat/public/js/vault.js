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
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
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
/******/
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
/******/ 	deferredModules.push([367,1]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ 157:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 260:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 262:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 296:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 297:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 361:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 366:
/***/ (function(module, exports) {

/*
waitMe - 1.19 [31.10.17]
Author: vadimsva
Github: https://github.com/vadimsva/waitMe
*/
(function (b) {
  b.fn.waitMe = function (p) {
    return this.each(function () {
      function y() {
        var a = f.attr("data-waitme_id");
        f.removeClass("waitMe_container").removeAttr("data-waitme_id");
        f.find('.waitMe[data-waitme_id="' + a + '"]').remove();
      }

      var f = b(this),
          z,
          g,
          e,
          r = !1,
          t = "background-color",
          u = "",
          q = "",
          v,
          a,
          w,
          n = {
        init: function init() {
          function n(a) {
            l.css({
              top: "auto",
              transform: "translateY(" + a + "px) translateZ(0)"
            });
          }

          a = b.extend({
            effect: "bounce",
            text: "",
            bg: "rgba(255,255,255,0.7)",
            color: "#000",
            maxSize: "",
            waitTime: -1,
            textPos: "vertical",
            fontSize: "",
            source: "",
            onClose: function onClose() {}
          }, p);
          w = new Date().getMilliseconds();
          v = b('<div class="waitMe" data-waitme_id="' + w + '"></div>');

          switch (a.effect) {
            case "none":
              e = 0;
              break;

            case "bounce":
              e = 3;
              break;

            case "rotateplane":
              e = 1;
              break;

            case "stretch":
              e = 5;
              break;

            case "orbit":
              e = 2;
              r = !0;
              break;

            case "roundBounce":
              e = 12;
              break;

            case "win8":
              e = 5;
              r = !0;
              break;

            case "win8_linear":
              e = 5;
              r = !0;
              break;

            case "ios":
              e = 12;
              break;

            case "facebook":
              e = 3;
              break;

            case "rotation":
              e = 1;
              t = "border-color";
              break;

            case "timer":
              e = 2;
              var c = b.isArray(a.color) ? a.color[0] : a.color;
              u = "border-color:" + c;
              break;

            case "pulse":
              e = 1;
              t = "border-color";
              break;

            case "progressBar":
              e = 1;
              break;

            case "bouncePulse":
              e = 3;
              break;

            case "img":
              e = 1;
          }

          "" !== u && (u += ";");

          if (0 < e) {
            if ("img" === a.effect) q = '<img src="' + a.source + '">';else for (var d = 1; d <= e; ++d) {
              b.isArray(a.color) ? (c = a.color[d], void 0 == c && (c = "#000")) : c = a.color, q = r ? q + ('<div class="waitMe_progress_elem' + d + '"><div style="' + t + ":" + c + '"></div></div>') : q + ('<div class="waitMe_progress_elem' + d + '" style="' + t + ":" + c + '"></div>');
            }
            g = b('<div class="waitMe_progress ' + a.effect + '" style="' + u + '">' + q + "</div>");
          }

          a.text && (c = b.isArray(a.color) ? a.color[0] : a.color, z = b('<div class="waitMe_text" style="color:' + c + ";" + ("" != a.fontSize ? "font-size:" + a.fontSize : "") + '">' + a.text + "</div>"));
          var k = f.find("> .waitMe");
          k && k.remove();
          c = b('<div class="waitMe_content ' + a.textPos + '"></div>');
          c.append(g, z);
          v.append(c);
          "HTML" == f[0].tagName && (f = b("body"));
          f.addClass("waitMe_container").attr("data-waitme_id", w).append(v);
          k = f.find("> .waitMe");
          var l = f.find(".waitMe_content");
          k.css({
            background: a.bg
          });
          "" !== a.maxSize && "none" != a.effect && (c = g.outerHeight(), g.outerWidth(), "img" === a.effect ? (g.css({
            height: a.maxSize + "px"
          }), g.find(">img").css({
            maxHeight: "100%"
          }), l.css({
            marginTop: -l.outerHeight() / 2 + "px"
          })) : a.maxSize < c && ("stretch" == a.effect ? (g.css({
            height: a.maxSize + "px",
            width: a.maxSize + "px"
          }), g.find("> div").css({
            margin: "0 5%"
          })) : (c = a.maxSize / c - .2, d = "-50%", "roundBounce" == a.effect ? (d = "-75%", a.text && (d = "75%")) : "win8" == a.effect || "timer" == a.effect || "orbit" == a.effect ? (d = "-20%", a.text && (d = "20%")) : "ios" == a.effect && (d = "-15%", a.text && (d = "15%")), "rotation" == a.effect && a.text && (d = "75%"), g.css({
            transform: "scale(" + c + ") translateX(" + d + ")",
            whiteSpace: "nowrap"
          }))));
          l.css({
            marginTop: -l.outerHeight() / 2 + "px"
          });

          if (f.outerHeight() > b(window).height()) {
            c = b(window).scrollTop();
            var h = l.outerHeight(),
                m = f.offset().top,
                x = f.outerHeight();
            d = c - m + b(window).height() / 2;
            0 > d && (d = Math.abs(d));
            0 <= d - h && d + h <= x ? m - c > b(window).height() / 2 && (d = h) : d = c > m + x - h ? c - m - h : c - m + h;
            n(d);
            b(document).scroll(function () {
              var a = b(window).scrollTop() - m + b(window).height() / 2;
              0 <= a - h && a + h <= x && n(a);
            });
          }

          0 < a.waitTime && setTimeout(function () {
            y();
          }, a.waitTime);
          k.on("destroyed", function () {
            if (a.onClose && b.isFunction(a.onClose)) a.onClose(f);
            k.trigger("close", {
              el: f
            });
          });
          b.event.special.destroyed = {
            remove: function remove(a) {
              a.handler && a.handler();
            }
          };
          return k;
        },
        hide: function hide() {
          y();
        }
      };
      if (n[p]) return n[p].apply(this, Array.prototype.slice.call(arguments, 1));
      if ("object" === typeof p || !p) return n.init.apply(this, arguments);
    });
  };

  b(window).on("load", function () {
    b("body.waitMe_body").addClass("hideMe");
    setTimeout(function () {
      b("body.waitMe_body").find(".waitMe_container:not([data-waitme_id])").remove();
      b("body.waitMe_body").removeClass("waitMe_body hideMe");
    }, 200);
  });
})(jQuery);

/***/ }),

/***/ 367:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.to-string.js
var es6_regexp_to_string = __webpack_require__(63);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(0);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);

// EXTERNAL MODULE: ./node_modules/regenerator-runtime/runtime.js
var runtime = __webpack_require__(129);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(8);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__(27);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.promise.js
var es6_promise = __webpack_require__(92);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.to-string.js
var es6_object_to_string = __webpack_require__(28);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.match.js
var es6_regexp_match = __webpack_require__(230);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.typed.uint8-array.js
var es6_typed_uint8_array = __webpack_require__(142);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.array.includes.js
var es7_array_includes = __webpack_require__(71);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.symbol.async-iterator.js
var es7_symbol_async_iterator = __webpack_require__(101);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.symbol.js
var es6_symbol = __webpack_require__(102);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.split.js
var es6_regexp_split = __webpack_require__(72);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(7);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(10);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.typed.uint16-array.js
var es6_typed_uint16_array = __webpack_require__(242);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.replace.js
var es6_regexp_replace = __webpack_require__(243);

// EXTERNAL MODULE: ./node_modules/js-chacha20/src/jschacha20.js
var jschacha20 = __webpack_require__(127);
var jschacha20_default = /*#__PURE__*/__webpack_require__.n(jschacha20);

// EXTERNAL MODULE: ./node_modules/node-forge/lib/index.js
var lib = __webpack_require__(1);

// CONCATENATED MODULE: ./client/src/js/lib/iCrypto.js
















var sjcl = __webpack_require__(257);

var iCrypto_iCrypto =
/*#__PURE__*/
function () {
  function iCrypto() {
    classCallCheck_default()(this, iCrypto);

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


  createClass_default()(iCrypto, [{
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
      self.set(nameToSave, lib["util"].bytesToHex(key));
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
     * Given a password and a salt computes SYM key and saves it under given name in base64 format
     * @param nameToSave
     * @param password
     * @param salt Must be previously sotre within the current iCrypto instance
     *        Must be hex-encoded
     * @param numIterations
     * @param keyLength
     */

  }, {
    key: "createPasswordBasedSymKey",
    value: function createPasswordBasedSymKey() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createSYMKey");
      var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("createSYMKey");
      var salt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("createSYMKey");
      var numIterations = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 20000;
      var keyLength = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 32;
      var self = this;
      var sRaw = lib["util"].hexToBytes(this.get(salt));
      var key = lib["pkcs5"].pbkdf2(password, sRaw, numIterations, keyLength);
      var res = lib["util"].bytesToHex(key);
      self.set(nameToSave, res);
      return self;
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
      var AESkey = lib["util"].hexToBytes(self.get(key));
      var cipher = lib["cipher"].createCipher(mode, AESkey);
      cipher.start({
        iv: iv
      });
      cipher.update(lib["util"].createBuffer(this.get(target), encoding));
      cipher.finish();
      this.set(nameToSave, hexify ? lib["util"].bytesToHex(iv) + cipher.output.toHex() : iv + cipher.output);
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
        iv = lib["util"].hexToBytes(cipher.substring(0, 32));
        cipherWOIV = lib["util"].hexToBytes(cipher.substr(32));
      } else {
        //Assuming cipher is a binary string
        cipherWOIV = cipher.substr(16);
        iv = cipher.substring(0, 16);
      }

      var AESkey = lib["util"].hexToBytes(this.get(key));
      var decipher = lib["cipher"].createDecipher(mode, AESkey);
      decipher.start({
        iv: iv
      });
      decipher.update(lib["util"].createBuffer(cipherWOIV));
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
        cryptor = new jschacha20_default.a(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
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
              self.cryptor = new jschacha20_default.a(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
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
        throw "hash: invalid target type: " + typeof blob + "  Target must be string.";
      }

      algorithm = algorithm.toLowerCase();
      var hash = lib["md"].hasOwnProperty(algorithm) ? lib["md"][algorithm].create() : this.throwError("Wrong hash algorithm");
      hash.update(blob);
      this.set(nameToSave, hash.digest().toHex());
      return self;
    }
  }, {
    key: "createHash",
    value: function createHash() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createHash");
      var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sha256";
      console.log("Create hash called.");
      console.log("sjcl is ".concat(typeof sjcl));

      for (var _i = 0, _Object$keys = Object.keys(sjcl); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        console.log(key);
      }

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
        lib["rsa"].generateKeyPair({
          bits: length,
          workers: -1
        }, function (err, pair) {
          if (err) reject(err);else {
            try {
              var pubKey = lib["pki"].publicKeyToPem(pair.publicKey);
              var privKey = lib["pki"].privateKeyToPem(pair.privateKey);
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
      var pair = lib["pki"].rsa.generateKeyPair({
        bits: length,
        e: 0x10001
      });
      var pubKey = lib["pki"].publicKeyToPem(pair.publicKey);
      var privKey = lib["pki"].privateKeyToPem(pair.privateKey);
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
      var forgePrivateKey = lib["pki"].privateKeyFromPem(this.get(target));
      this.set(nameToSave, lib["pki"].publicKeyToPem(forgePrivateKey));
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

      type === "public" ? lib["pki"].publicKeyFromPem(keyData) : lib["pki"].privateKeyFromPem(keyData);
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
      var forgeKey = lib["pki"].publicKeyFromPem(key);
      var fingerprint = lib["pki"].getPublicKeyFingerprint(forgeKey, {
        encoding: 'hex',
        md: lib["md"][hashAlgorithm].create()
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
      var publicKey = lib["pki"].publicKeyFromPem(key);
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
      var privateKey = lib["pki"].privateKeyFromPem(key);
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
      var privateKey = lib["pki"].privateKeyFromPem(key);
      var md = lib["md"][hashAlgorithm].create();
      md.update(this.get(target));
      var signature = privateKey.sign(md);
      signature = hexifySign ? lib["util"].bytesToHex(signature) : signature;
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
      var publicKey = lib["pki"].publicKeyFromPem(key);
      var md = lib["md"].sha256.create();
      md.update(this.get(target));
      var sign = this.get(signature);
      sign = dehexifySignRequired ? lib["util"].hexToBytes(sign) : sign;
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

      if (typeof target !== "object") {
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
      if (typeof keys !== "object") throw "keysExist: unsupported type";
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
      return lib["random"].getBytesSync(length);
    }
  }, {
    key: "hexEncode",
    value: function hexEncode(blob) {
      return lib["util"].bytesToHex(blob);
    }
  }, {
    key: "hexDecode",
    value: function hexDecode(blob) {
      return lib["util"].hexToBytes(blob);
    }
  }, {
    key: "base64Encode",
    value: function base64Encode(blob) {
      return lib["util"].encode64(blob);
    }
  }, {
    key: "base64Decode",
    value: function base64Decode(blob) {
      return lib["util"].decode64(blob);
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
      ic.addBlob("hu", self.hashUnencrypted).addBlob("he", self.hashEncrypted).asym.setKey("pk", privKey, "private").asym.sign("hu", "pk", "sign_u").asym.sign("he", "pk", "sign_e");
      self.signUnencrypted = ic.get("sign_u");
      self.signEncrypted = ic.get("sign_e");
    }
  }], [{
    key: "verifyFileInfo",
    value: function verifyFileInfo(info) {
      var required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];

      for (var _i = 0, _required = required; _i < _required.length; _i++) {
        var i = _required[_i];

        if (!info.hasOwnProperty(i)) {
          throw "Attachment verifyFileInfo: Missing required property: " + i;
        }
      }
    }
  }, {
    key: "parseLink",
    value: function parseLink(link) {
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
      ic.setSYMKey("k", key).addBlob("body", self.body).AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');

      if (self.attachments) {
        ic.addBlob("attachments", JSON.stringify(self.attachments)).AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8");
        self.attachments = ic.get("attachmentscip");
      }

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "k", "nnamecip", true, "CBC", "utf8");
        self.header.nickname = ic.get("nnamecip");
      }

      self.body = ic.get("bodycip");
    }
  }, {
    key: "encryptPrivateMessage",
    value: function encryptPrivateMessage(keys) {
      var self = this;
      var ic = new iCrypto_iCrypto();
      ic.sym.createKey("sym").addBlob("body", self.body).AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "sym", "nnamecip", true, 'CBC', "utf8");
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
          var icn = new iCrypto_iCrypto();
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
        var ic = new iCrypto_iCrypto();
        ic.asym.setKey("priv", privateKey, "private").publicFromPrivate("priv", "pub").getPublicKeyFingerprint("pub", "pkfp").addBlob("symcip", this.header.keys[ic.get("pkfp")]).asym.decrypt("symcip", "priv", "sym", "hex").addBlob("bodycip", this.body).sym.decrypt("bodycip", "sym", "body", true, "CBC", "utf8");
        this.body = ic.get("body");

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "sym", "nname", true, "CBC", "utf8");
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
        var ic = new iCrypto_iCrypto();
        ic.sym.setKey("k", key).addBlob("bodycip", this.body).sym.decrypt("bodycip", "k", "body", true);
        this.body = ic.get("body");

        if (this.attachments) {
          ic.addBlob("attachmentscip", this.attachments).AESDecrypt("attachmentscip", "k", "attachments", true, "CBC", "utf8");
          this.attachments = JSON.parse(ic.get("attachments"));
        }

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "k", "nname", true, "CBC", "utf8");
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
      ic.addBlob("blobcip", payloadCipher).addBlob("symkcip", symKeyCipher).asym.setKey("privk", privateKey, "private").privateKeyDecrypt("symkcip", "privk", "symk", "hex").AESDecrypt("blobcip", "symk", "blob-raw", true, "CBC", "utf8");
      return ic.get("blob-raw");
    }
  }, {
    key: "encryptStandardMessage",
    value: function encryptStandardMessage() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var ic = new iCrypto_iCrypto();
      ic.sym.createKey("symk").addBlob("payload", blob).asym.setKey("pubk", publicKey, "public").AESEncrypt("payload", "symk", "blobcip", true, "CBC", "utf8").asym.encrypt("symk", "pubk", "symcip", "hex").encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength").merge(["blobcip", "symcip", "symciplength"], "res");
      return ic.get("res");
    }
  }, {
    key: "publicKeyEncrypt",
    value: function publicKeyEncrypt() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var ic = new iCrypto_iCrypto();
      ic.addBlob("blob", blob).asym.setKey("pubk", publicKey, "public").publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
      return ic.get("blobcip");
    }
  }, {
    key: "privateKeyDecrypt",
    value: function privateKeyDecrypt(blob, privateKey) {
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "hex";
      var ic = new iCrypto_iCrypto();
      ic.addBlob("blobcip", blob).asym.setKey("priv", privateKey, "private").privateKeyDecrypt("blobcip", "priv", "blob", encoding);
      return ic.get("blob");
    }
  }, {
    key: "symKeyEncrypt",
    value: function symKeyEncrypt(blob, key) {
      var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto_iCrypto();
      ic.addBlob("b", blob).sym.setKey("sym", key).AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8");
      return ic.get("cip");
    }
  }, {
    key: "symKeyDecrypt",
    value: function symKeyDecrypt(cip, key) {
      var dehexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto_iCrypto();
      ic.addBlob("cip", cip).sym.setKey("sym", key).AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
      return ic.get("b");
    }
  }]);

  return ChatUtility;
}();
// CONCATENATED MODULE: ./client/src/js/chat/Message.js






/**
 * Message is the major data type used for client-server-client communication
 * 
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
  function Message(version, request) {
    classCallCheck_default()(this, Message);

    if (version === undefined || version === "") throw "Message init error: Software version is required!";

    if (typeof request === "string") {
      request = JSON.parse(request);
    }

    this.headers = request ? this.copyHeaders(request.headers) : {
      command: "",
      response: "",
      version: version
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
    key: "setVersion",
    value: function setVersion(version) {
      if (version === undefined || version === "") throw "Error setting message version: version undefined";
      this.headers.version = version;
    }
  }, {
    key: "signMessage",
    value: function signMessage(privateKey) {
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
// EXTERNAL MODULE: ./node_modules/socket.io-client/lib/index.js
var socket_io_client_lib = __webpack_require__(85);

// CONCATENATED MODULE: ./client/src/js/chat/WildEmitter.js

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
// CONCATENATED MODULE: ./client/src/js/chat/ChatClient.js
























var ChatClient_ChatClient =
/*#__PURE__*/
function () {
  function ChatClient(opts) {
    classCallCheck_default()(this, ChatClient);

    if (!opts.version) {
      throw "Version required!";
    }

    this.version = opts.version;
    this.islandConnectionStatus = false;
    this.allMessagesLoaded = false;
    this.loadingMessages = false;
    this.chatSocket = null;
    this.fileSocket = null; // ---------------------------------------------------------------------------------------------------------------------------
    // Transport defines socket.io transport
    // can be 0: xhr, 1: websocket

    this.transport = opts.transport || 0;
    this.session = null; //can be "active", "off"

    this.newTopicPending = {};
    this.pendingTopicJoins = {};
    this.outgoingMessageQueue = {};
    this.attachmentsUploadQueue = {};
    this.setClientHandlers();
    WildEmitter.mixin(this);
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
        delete_topic_success: this.deleteTopicSuccess,
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
        delete_topic_error: this.deleteTopicError,
        join_topic_error: this.joinTopicError,
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
      response = new Message_Message(self.version, response);

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
     * @param {String} topicName
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
                  ic = new iCrypto_iCrypto(); //Generate keypairs one for user, other for topic

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

                  request = new Message_Message(_self.version);
                  request.headers.command = "new_topic_get_token";
                  body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                  };
                  request.set("body", body);
                  _self.newTopicPending[newTopic.topicID] = newTopic;
                  console.log("Establishing connection");
                  _context.next = 24;
                  return _this.establishIslandConnection();

                case 24:
                  _this.chatSocket.emit("request", request);

                  resolve();
                  _context.next = 31;
                  break;

                case 28:
                  _context.prev = 28;
                  _context.t0 = _context["catch"](0);
                  throw _context.t0;

                case 31:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[0, 28]]);
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

      var request = new Message_Message(self.version);
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
        version: version,
        membersData: {},
        soundsOn: true
      };

      if (nickname) {
        var ic = new iCrypto_iCrypto();
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
                ic = new iCrypto_iCrypto();
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
                request = new Message_Message(self.version);
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
        var icn = new iCrypto_iCrypto();
        var symLength = parseInt(blob.substr(-lengthChars));
        var blobLength = blob.length;
        var symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
        var cipher = blob.substring(0, blobLength - symLength - lengthChars);
        icn.addBlob("symcip", symk).addBlob("cipher", cipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex").sym.decrypt("cipher", "sym", "blob-raw", true);
        return icn.get("blob-raw");
      };

      var encryptBlob = function encryptBlob(publicKey, blob) {
        var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
        var icn = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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

      var decReq = new Message_Message(self.version);
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
      for (var _i = 0, _Object$keys = Object.keys(this.session.metadata.participants); _i < _Object$keys.length; _i++) {
        var pkfp = _Object$keys[_i];

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

      var request = new Message_Message(self.version);
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
      var message = new Message_Message(self.version);
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
      newNickname = newNickname.toString("utf8");

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
      var request = new Message_Message(self.version);
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
      var parsedRequest = new Message_Message(self.version, request);
      var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;

      if (!Message_Message.verifyMessage(publicKey, parsedRequest)) {
        console.trace("Invalid signature");
        return;
      }

      var response = new Message_Message(self.version);
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
                console.log("Attempt reconnection called in Chat");
                _context3.next = 3;
                return this.topicLogin(this.session.privateKey);

              case 3:
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
      var request = new Message_Message(self.version);
      request.headers.command = "load_more_messages";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.body.lastLoadedMessageID = lastLoadedMessageID;
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "loadMoreMessagesSuccess",
    value: function loadMoreMessagesSuccess(response, self) {
      var messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages); //self.allMessagesLoaded = response.body.lastMessages.allLoaded ||  self.allMessagesLoaded;

      self.emit("messages_loaded", messages);
      self.loadingMessages = true;
    }
  }, {
    key: "decryptMessagesOnMessageLoad",
    value: function decryptMessagesOnMessageLoad(data) {
      var keys = data.keys;
      var metaIDs = Object.keys(keys);

      for (var i = 0; i < metaIDs.length; ++i) {
        var ic = new iCrypto_iCrypto();
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
      this.chatSocket.off();
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

      var request = new Message_Message(self.version);
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
      console.log("Note received: A member has been booted. Processing");
      var newMeta = Metadata_Metadata.parseMetadata(note.body.metadata);

      self._updateMetadata(newMeta);

      var bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
      this.deleteMemberData(note.body.bootedPkfp);
      this.saveClientSettings();
      self.emit("participant_booted", "Participant " + bootedNickname + " has been booted!");
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
        var start, clientSettings, cryptoStart, ic, now, invite, inviterResidence, inviterID, inviteID, headers, body, request, sendStart, topicData;
        return regenerator_default.a.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                start = new Date();
                console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);
                clientSettings = new ClientSettings_ClientSettings();
                _context4.next = 5;
                return this.establishIslandConnection();

              case 5:
                console.log("Connection with island is established. ".concat((new Date() - start) / 1000, " Elapsed since beginning. Working crypto."));
                cryptoStart = new Date();
                ic = new iCrypto_iCrypto();
                ic.asym.createKeyPair("rsa").getPublicKeyFingerprint('rsa', 'pkfp').addBlob("invite64", inviteCode.trim()).base64Decode("invite64", "invite");
                now = new Date();
                console.log("Keys generated in ".concat((now - cryptoStart) / 1000, "sec. ").concat((now - start) / 1000, " elapsed since beginning."));
                invite = ic.get("invite").split("/");
                inviterResidence = invite[0];
                inviterID = invite[1];
                inviteID = invite[2];

                if (this.inviteRequestValid(inviterResidence, inviterID, inviteID)) {
                  _context4.next = 18;
                  break;
                }

                this.emit("join_topic_fail");
                throw "Invite request is invalid";

              case 18:
                this.pendingTopicJoins[inviteID] = {
                  pkfp: ic.get('pkfp'),
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
                request = new Message_Message(self.version);
                request.set('headers', headers);
                request.set("body", body);
                request.signMessage(ic.get('rsa').privateKey);
                console.log("Sending topic join request");
                sendStart = new Date();
                this.chatSocket.emit("request", request);
                now = new Date();
                console.log("Request sent to island in  ".concat((now - sendStart) / 1000, "sec. ").concat((now - start) / 1000, " elapsed since beginning."));
                topicData = {
                  newPublicKey: ic.get('rsa').publicKey,
                  newPrivateKey: ic.get('rsa').privateKey
                };
                return _context4.abrupt("return", topicData);

              case 32:
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
      var ic = new iCrypto_iCrypto();
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
      console.log("new topic pkfp: " + JSON.stringify(topicInfo));
      self.emit("topic_join_success", {
        pkfp: topicInfo.pkfp,
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

      var ic = new iCrypto_iCrypto();
      ic.asym.setKey("privk", privateKey, "private").publicFromPrivate("privk", "pub").getPublicKeyFingerprint("pub", "pkfp");
      var publicKey = ic.get("pub");
      var pkfp = ic.get("pkfp");

      if (typeof settingsRaw === "object") {
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
      var request = new Message_Message(self.version);
      request.set("headers", headers);
      request.set("body", body);
      request.signMessage(privateKey);
      console.log("Sending update settings request");
      this.chatSocket.emit("request", request);
    }
    /**
     * Deletes entire history and metadata and logs out
     * After this operation the topic is no longer accessible
     *
     * @returns {Promise<void>}
     */

  }, {
    key: "deleteTopic",
    value: function () {
      var _deleteTopic = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee5() {
        var privateKey, ic, headers, request;
        return regenerator_default.a.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.session) {
                  _context5.next = 2;
                  break;
                }

                throw "User must be logged in";

              case 2:
                privateKey = this.session.privateKey;
                ic = new iCrypto_iCrypto();
                ic.createNonce("n").bytesToHex("n", "nhex");
                headers = {
                  command: "delete_topic",
                  pkfpSource: this.session.publicKeyFingerprint,
                  nonce: ic.get("nhex")
                };
                request = new Message_Message(self.version);
                request.set("headers", headers);
                request.signMessage(privateKey);
                this.chatSocket.emit("request", request);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function deleteTopic() {
        return _deleteTopic.apply(this, arguments);
      }

      return deleteTopic;
    }()
  }, {
    key: "deleteTopicSuccess",
    value: function deleteTopicSuccess(response, self) {
      console.log("Delete topic successful");
      self.logout();
      self.emit("delete_topic_success");
    }
  }, {
    key: "deleteTopicError",
    value: function deleteTopicError(response, self) {
      console.log("Delete topic error");
      self.emit("delete_topic_error");
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
      var ic = new iCrypto_iCrypto();
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
        regenerator_default.a.mark(function _callee6(resolve, reject) {
          var self, filesProcessed, pkfp, privk, symk, residence, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filesInfo;

          return regenerator_default.a.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  self = _this2;

                  if (!(Worker === undefined)) {
                    _context6.next = 4;
                    break;
                  }

                  reject(null, "Client does not support web workers.");
                  return _context6.abrupt("return");

                case 4:
                  filesProcessed = [];
                  pkfp = self.session.publicKeyFingerprint;
                  privk = self.session.privateKey;
                  symk = self.session.metadata.sharedKey;
                  residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context6.prev = 12;

                  for (_iterator = filesAttached[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    file = _step.value;
                    console.log("Calling worker function");
                    filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence));
                  }

                  _context6.next = 20;
                  break;

                case 16:
                  _context6.prev = 16;
                  _context6.t0 = _context6["catch"](12);
                  _didIteratorError = true;
                  _iteratorError = _context6.t0;

                case 20:
                  _context6.prev = 20;
                  _context6.prev = 21;

                  if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }

                case 23:
                  _context6.prev = 23;

                  if (!_didIteratorError) {
                    _context6.next = 26;
                    break;
                  }

                  throw _iteratorError;

                case 26:
                  return _context6.finish(23);

                case 27:
                  return _context6.finish(20);

                case 28:
                  _context6.prev = 28;
                  _context6.next = 31;
                  return Promise.all(filesProcessed);

                case 31:
                  filesInfo = _context6.sent;
                  resolve(filesInfo);
                  _context6.next = 39;
                  break;

                case 35:
                  _context6.prev = 35;
                  _context6.t1 = _context6["catch"](28);
                  console.log("ERROR DURING UPLOAD ATTACHMENTS: " + _context6.t1);
                  reject(_context6.t1);

                case 39:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, null, [[12, 16, 20, 28], [21,, 23, 27], [28, 35]]);
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

        var logMessage = function logMessage(msg) {
          console.log("WORKER LOG: " + msg);
        };

        var uploadError = function uploadError(msg) {
          uploader.terminate();
          self.emit("upload_error", msg.data);
          reject(data);
        };

        var messageHandlers = {
          "upload_complete": uploadComplete,
          "upload_progress": uploadProgress,
          "upload_error": uploadError,
          "log": logMessage
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
        regenerator_default.a.mark(function _callee7(resolve, reject) {
          var _self2, privk, parsedFileInfo, fileOwnerPublicKey, err, myPkfp, fileData;

          return regenerator_default.a.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  console.log("About to download the attachment");
                  _context7.prev = 1;
                  _self2 = _this3;
                  privk = _self2.session.privateKey; //To decrypt SYM key
                  //Getting public key of

                  parsedFileInfo = JSON.parse(fileInfo);
                  fileOwnerPublicKey = _self2.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

                  if (!(Worker === undefined)) {
                    _context7.next = 12;
                    break;
                  }

                  err = "Worker is not defined.Cannot download file.";
                  console.log(err);
                  reject(err);
                  _context7.next = 19;
                  break;

                case 12:
                  console.log("Downloading with worker or sync");
                  myPkfp = _self2.session.publicKeyFingerprint;
                  _context7.next = 16;
                  return _self2.downloadAttachmentSync(fileInfo, myPkfp, privk, fileOwnerPublicKey, parsedFileInfo.name);

                case 16:
                  fileData = _context7.sent;

                  _self2.emit("download_complete", {
                    fileInfo: fileInfo,
                    fileData: fileData
                  });

                  resolve();

                case 19:
                  _context7.next = 24;
                  break;

                case 21:
                  _context7.prev = 21;
                  _context7.t0 = _context7["catch"](1);
                  reject(_context7.t0);

                case 24:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, null, [[1, 21]]);
        }));

        return function (_x8, _x9) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "downloadAttachmentWithWorker",
    value: function downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk, fileName) {
      var self = this;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref4 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee8(resolve, reject) {
          var downloader, downloadComplete, downloadFailed, processLog, messageHandlers, notify, processMessage;
          return regenerator_default.a.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  try {
                    downloader = new Worker("/js/fileWorker.js");

                    downloadComplete = function downloadComplete(fileBuffer) {
                      console.log("RECEIVED FILE BUFFER FROM THE WORKER: length: " + fileBuffer.length);
                      resolve(fileBuffer);
                      downloader.terminate();
                    };

                    downloadFailed = function downloadFailed(err) {
                      console.log("Download failed with error: " + err);
                      reject(err);
                      downloader.terminate();
                    };

                    processLog = function processLog(msg) {
                      console.log("WORKER LOG: " + msg);
                    };

                    messageHandlers = {
                      "download_complete": downloadComplete,
                      "download_failed": downloadFailed,
                      "log": processLog,
                      "file_available_locally": function file_available_locally() {
                        self.emit("file_available_locally", fileName);
                        notify("File found locally.");
                      },
                      "requesting_peer": function requesting_peer() {
                        self.emit("requesting_peer", fileName);
                        notify("Requesting peer to hand the file...");
                      }
                    };

                    notify = function notify(msg) {
                      console.log("FILE TRANSFER EVENT NOTIFICATION: " + msg);
                    };

                    processMessage = function processMessage(msg) {
                      messageHandlers[msg.message](msg.data);
                    };

                    downloader.onmessage = function (ev) {
                      processMessage(ev.data);
                    };

                    downloader.onerror = function (ev) {
                      console.log(ev);
                      reject("Downloader worker error");
                      downloader.terminate();
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
                  } catch (e) {
                    reject(e);
                  }

                case 1:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8);
        }));

        return function (_x10, _x11) {
          return _ref4.apply(this, arguments);
        };
      }());
    } // ---------------------------------------------------------------------------------------------------------------------------
    // This is for test purposes only!

  }, {
    key: "downloadAttachmentSync",
    value: function downloadAttachmentSync(fileInfo, myPkfp, privk, ownerPubk, fileName) {
      console.log("Downloading attachment sync");
      var self = this;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee9(resolve, reject) {
          var _downloader, downloadComplete, downloadFailed, processLog, _messageHandlers, notify, processMessage;

          return regenerator_default.a.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.prev = 0;
                  _downloader = new ChatClient_Downloader();

                  downloadComplete = function downloadComplete(fileBuffer) {
                    console.log("RECEIVED FILE BUFFER FROM THE WORKER: length: " + fileBuffer.length);
                    resolve(fileBuffer);

                    _downloader.terminate();
                  };

                  downloadFailed = function downloadFailed(err) {
                    console.log("Download failed with error: " + err);
                    reject(err);

                    _downloader.terminate();
                  };

                  processLog = function processLog(msg) {
                    console.log("WORKER LOG: " + msg);
                  };

                  _messageHandlers = {
                    "download_complete": downloadComplete,
                    "download_failed": downloadFailed,
                    "log": processLog,
                    "file_available_locally": function file_available_locally() {
                      self.emit("file_available_locally", fileName);
                      notify("File found locally.");
                    },
                    "requesting_peer": function requesting_peer() {
                      self.emit("requesting_peer", fileName);
                      notify("Requesting peer to hand the file...");
                    }
                  };

                  notify = function notify(msg) {
                    console.log("FILE TRANSFER EVENT NOTIFICATION: " + msg);
                  };

                  processMessage = function processMessage(msg) {
                    _messageHandlers[msg.message](msg.data);
                  };

                  _downloader.on("message", function (ev) {
                    processMessage(ev.data);
                  });

                  _downloader.on("error", function (ev) {
                    console.log(ev);
                    reject("Downloader worker error");

                    _downloader.terminate();
                  });

                  _context9.prev = 10;

                  _downloader.downloadFile({
                    fileInfo: fileInfo,
                    myPkfp: myPkfp,
                    privk: privk,
                    pubk: ownerPubk
                  });

                  _context9.next = 18;
                  break;

                case 14:
                  _context9.prev = 14;
                  _context9.t0 = _context9["catch"](10);
                  console.log("Error downloading file: ".concat(_context9.t0));
                  throw _context9.t0;

                case 18:
                  _context9.next = 23;
                  break;

                case 20:
                  _context9.prev = 20;
                  _context9.t1 = _context9["catch"](0);
                  reject(_context9.t1);

                case 23:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, null, [[0, 20], [10, 14]]);
        }));

        return function (_x12, _x13) {
          return _ref5.apply(this, arguments);
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
    value: function prepareMessage(version, messageContent, recipientPkfp) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        if (version === undefined || version === "") throw "Chat message initialization error: Version is required";
        var self = _this4;
        console.log("Preparing message: " + messageContent);

        if (!self.isLoggedIn()) {
          self.emit("login_required");
          reject();
        } //Preparing chat message


        var chatMessage = new ChatMessage_ChatMessage();
        chatMessage.version = version;
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
     * Sends the message. Message will be visible to all topic members.
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
        var _ref6 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee10(resolve, reject) {
          var _self3, attachmentsInfo, metaID, chatMessage, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, att, message, currentTime, userPrivateKey;

          return regenerator_default.a.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _context10.prev = 0;
                  _self3 = _this5;
                  metaID = _self3.session.metadata.id;
                  _context10.next = 5;
                  return _self3.prepareMessage(_this5.version, messageContent);

                case 5:
                  chatMessage = _context10.sent;

                  if (!(filesAttached && filesAttached.length > 0)) {
                    _context10.next = 29;
                    break;
                  }

                  _context10.next = 9;
                  return _self3.uploadAttachments(filesAttached, chatMessage.header.id, metaID);

                case 9:
                  attachmentsInfo = _context10.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _iteratorError2 = undefined;
                  _context10.prev = 13;

                  for (_iterator2 = attachmentsInfo[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    att = _step2.value;
                    chatMessage.addAttachmentInfo(att);
                  }

                  _context10.next = 21;
                  break;

                case 17:
                  _context10.prev = 17;
                  _context10.t0 = _context10["catch"](13);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context10.t0;

                case 21:
                  _context10.prev = 21;
                  _context10.prev = 22;

                  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                  }

                case 24:
                  _context10.prev = 24;

                  if (!_didIteratorError2) {
                    _context10.next = 27;
                    break;
                  }

                  throw _iteratorError2;

                case 27:
                  return _context10.finish(24);

                case 28:
                  return _context10.finish(21);

                case 29:
                  chatMessage.encryptMessage(_this5.session.metadata.sharedKey);
                  chatMessage.sign(_this5.session.privateKey); //Preparing request

                  message = new Message_Message(_self3.version);
                  message.headers.pkfpSource = _this5.session.publicKeyFingerprint;
                  message.headers.command = "broadcast_message";
                  message.body.message = chatMessage.toBlob();
                  currentTime = new Date().getTime();
                  message.travelLog = {};
                  message.travelLog[currentTime] = "Outgoing processed on client.";
                  userPrivateKey = _this5.session.privateKey;
                  message.signMessage(userPrivateKey);

                  _this5.chatSocket.emit("request", message);

                  resolve();
                  _context10.next = 47;
                  break;

                case 44:
                  _context10.prev = 44;
                  _context10.t1 = _context10["catch"](0);
                  reject(_context10.t1);

                case 47:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10, null, [[0, 44], [13, 17, 21, 29], [22,, 24, 28]]);
        }));

        return function (_x14, _x15) {
          return _ref6.apply(this, arguments);
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
        var _ref7 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee11(resolve, reject) {
          var _self4, chatMessage, keys, message, userPrivateKey;

          return regenerator_default.a.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.prev = 0;
                  _self4 = _this6;
                  _context11.next = 4;
                  return _self4.prepareMessage(_this6.version, messageContent, pkfp);

                case 4:
                  chatMessage = _context11.sent;
                  keys = [_self4.session.publicKey];
                  keys.push(_self4.session.metadata.participants[pkfp].publicKey);
                  chatMessage.encryptPrivateMessage(keys);
                  chatMessage.sign(_this6.session.privateKey); //Preparing request

                  message = new Message_Message(_self4.version);
                  message.headers.pkfpSource = _this6.session.publicKeyFingerprint;
                  message.headers.pkfpDest = pkfp;
                  message.headers.command = "send_message";
                  message.headers.private = true;
                  message.body.message = chatMessage.toBlob();
                  userPrivateKey = _this6.session.privateKey;
                  message.signMessage(userPrivateKey);

                  _this6.chatSocket.emit("request", message);

                  resolve();
                  _context11.next = 24;
                  break;

                case 21:
                  _context11.prev = 21;
                  _context11.t0 = _context11["catch"](0);
                  reject(_context11.t0);

                case 24:
                case "end":
                  return _context11.stop();
              }
            }
          }, _callee11, null, [[0, 21]]);
        }));

        return function (_x16, _x17) {
          return _ref7.apply(this, arguments);
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
      regenerator_default.a.mark(function _callee12(response, self) {
        var chatMessage, author;
        return regenerator_default.a.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                chatMessage = new ChatMessage_ChatMessage(response.body.message);
                author = self.session.metadata.participants[chatMessage.header.author];

                if (author) {
                  _context12.next = 4;
                  break;
                }

                throw "Author is not found in the current version of metadata!";

              case 4:
                if (!chatMessage.verify(author.publicKey)) {
                  self.emit("error", "Received message with invalid signature!");
                }

                if (!(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id)) {
                  _context12.next = 7;
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
                return _context12.stop();
            }
          }
        }, _callee12);
      }));

      function messageSendSuccess(_x18, _x19) {
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
      var ic = new iCrypto_iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message(self.version);
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
      var ic = new iCrypto_iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message(self.version);
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

      var ic = new iCrypto_iCrypto();
      ic.createNonce("iid").bytesToHex('iid', "iidhex");
      var body = {
        requestID: ic.get("iidhex"),
        pkfp: this.session.publicKeyFingerprint
      };
      var request = new Message_Message(self.version);
      request.headers.command = "request_invite";
      request.set("body", body);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "joinTopicError",
    value: function joinTopicError(response, self) {
      console.log("Topic join error: " + response.headers.error);
      self.emit("topic_join_error", response.headers.error);
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

      for (var _i3 = 0, _Object$keys2 = Object.keys(this.session.settings.invites); _i3 < _Object$keys2.length; _i3++) {
        var _i4 = _Object$keys2[_i3];

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
      var request = new Message_Message(self.version);
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
    key: "_establishChatConnection",
    value: function () {
      var _establishChatConnection2 = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee13() {
        var _this7 = this;

        var connectionAttempts,
            reconnectionDelay,
            _args13 = arguments;
        return regenerator_default.a.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                connectionAttempts = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : 7;
                reconnectionDelay = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : 8000;
                return _context13.abrupt("return", new Promise(function (resolve, reject) {
                  var self = _this7;
                  var upgrade = _this7.transport === 1;

                  if (self.chatSocket && self.chatSocket.connected) {
                    resolve();
                    return;
                  }

                  var attempted = 0;

                  function attemptConnection() {
                    console.log("Attempting island connection: " + attempted);
                    self.chatSocket.open();
                  }

                  self.chatSocket = socket_io_client_lib('/chat', {
                    reconnection: false,
                    forceNew: true,
                    autoConnect: false,
                    upgrade: upgrade,
                    pingInterval: 10000,
                    pingTimeout: 5000
                  });
                  self.chatSocket.on('connect', function () {
                    _this7.finishSocketSetup();

                    console.log("Island connection established");
                    _this7.islandConnectionStatus = true;

                    _this7.emit("connected_to_island");

                    resolve();
                  });
                  self.chatSocket.on("disconnect", function () {
                    console.log("Island disconnected.");
                    _this7.islandConnectionStatus = false;

                    _this7.emit("disconnected_from_island");
                  });
                  self.chatSocket.on('connect_error', function (err) {
                    if (attempted < connectionAttempts) {
                      console.log("Connection error on attempt: " + attempted + err);
                      attempted += 1;
                      setTimeout(attemptConnection, reconnectionDelay);
                    } else {
                      console.log('Connection Failed');
                      reject(err);
                    }
                  });
                  self.chatSocket.on('connect_timeout', function (err) {
                    console.log('Chat connection timeout');
                    reject(err);
                  });
                  attemptConnection();
                }));

              case 3:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13);
      }));

      function _establishChatConnection() {
        return _establishChatConnection2.apply(this, arguments);
      }

      return _establishChatConnection;
    }()
  }, {
    key: "_establishFileConnection",
    value: function _establishFileConnection() {
      var _this8 = this;

      var connectionAttempts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 7;
      var reconnectionDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8000;
      return new Promise(function (resolve, reject) {
        var self = _this8;
        var upgrade = _this8.transport === 1;
        console.log("Connecting to file socket");

        if (self.fileSocket && self.fileSocket.connected) {
          console.log("File socket already connected! returning");
          resolve();
          return;
        }

        var attempted = 0;

        function attemptConnection() {
          console.log("Attempting island connection: " + attempted);
          self.fileSocket.open();
        }

        self.fileSocket = socket_io_client_lib('/file', {
          reconnection: false,
          forceNew: true,
          autoConnect: false,
          upgrade: upgrade,
          pingInterval: 10000,
          pingTimeout: 5000
        });
        self.fileSocket.on("connect", function () {
          _this8.setupFileTransferListeners();

          console.log("File transfer connectiopn established");
          resolve();
        });
        self.fileSocket.on("connect_error", function (err) {
          if (attempted < connectionAttempts) {
            console.log("Connection error on attempt: " + attempted + err);
            attempted += 1;
            setTimeout(attemptConnection, reconnectionDelay);
          } else {
            console.log('Connection Failed');
            reject(err);
          }
        });
        self.fileSocket.on('connect_timeout', function (err) {
          console.log('File connection timeout');
          reject(err);
        });
        attemptConnection();
      });
    }
  }, {
    key: "establishIslandConnection",
    value: function () {
      var _establishIslandConnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee14() {
        var option,
            _args14 = arguments;
        return regenerator_default.a.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                option = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : "chat";
                console.log("Establishing connection with: " + option);

                if (!(option === "chat")) {
                  _context14.next = 6;
                  break;
                }

                return _context14.abrupt("return", this._establishChatConnection());

              case 6:
                if (!(option === "file")) {
                  _context14.next = 8;
                  break;
                }

                return _context14.abrupt("return", this._establishFileConnection());

              case 8:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
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
      regenerator_default.a.mark(function _callee15() {
        return regenerator_default.a.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.prev = 0;

                if (this.chatSocket && this.chatSocket.connected) {
                  this.chatSocket.disconnect();
                }

                _context15.next = 7;
                break;

              case 4:
                _context15.prev = 4;
                _context15.t0 = _context15["catch"](0);
                throw "Error terminating connection with island: " + _context15.t0;

              case 7:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this, [[0, 4]]);
      }));

      function terminateIslandConnection() {
        return _terminateIslandConnection.apply(this, arguments);
      }

      return terminateIslandConnection;
    }()
  }, {
    key: "finishSocketSetup",
    value: function finishSocketSetup() {
      this.initChatListeners();
    }
  }, {
    key: "initChatListeners",
    value: function initChatListeners() {
      var _this9 = this;

      this.chatSocket.on('message', function (message) {
        console.log(JSON.stringify(message));
      });
      this.chatSocket.on('request', function (request) {
        console.log("Received new incoming request");

        _this9.processRequest(request, _this9);
      });
      this.chatSocket.on("response", function (response) {
        _this9.processResponse(response, _this9);
      });
      this.chatSocket.on("service", function (message) {
        _this9.processServiceMessage(message, _this9);
      });
      this.chatSocket.on("service_record", function (message) {
        console.log("Got SERVICE RECORD!");

        _this9.processServiceRecord(message, _this9);
      });
      this.chatSocket.on("message", function (message) {
        _this9.processIncomingMessage(message, _this9);
      });
      this.chatSocket.on('reconnect', function (attemptNumber) {
        console.log("Successfull reconnect client");
      });
      this.chatSocket.on('metadata_update', function (meta) {
        _this9.processMetadataUpdate(meta);
      });
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
      var _this10 = this;

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
        var fp = _this10.session.metadata.participants[key].publicKeyFingerprint;
        var residence = _this10.session.metadata.participants[key].residence;
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

      newNickName = newNickName.trim().toString("utf8");
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

      newTopicName = newTopicName.trim().toString("utf8");
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
      var ic = new iCrypto_iCrypto();
      ic.setRSAKey("pk", privateKey, "private").addBlob("b", blob).privateKeySign("b", "pk", "sign");
      return ic.get("sign");
    }
  }, {
    key: "verifyBlob",
    value: function verifyBlob(publicKey, sign, blob) {
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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
      var ic = new iCrypto_iCrypto();
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

var ChatClient_Downloader =
/*#__PURE__*/
function () {
  function Downloader() {
    classCallCheck_default()(this, Downloader);

    console.log("Downloader initialized non-worker");
    WildEmitter.mixin(this);
  }

  createClass_default()(Downloader, [{
    key: "processMessage",
    value: function processMessage(msg) {
      console.log("Processing message from main thread..");
      commandHandlers[msg.command](msg.data);
    }
  }, {
    key: "parseFileLink",
    value: function parseFileLink(link) {
      var ic = new iCrypto_iCrypto();
      ic.addBlob('l', link).base64Decode("l", "ls");
      var parsed = ic.get("ls");
      var splitted = parsed.split("/");
      return {
        onion: splitted[0],
        pkfp: splitted[1],
        name: splitted[2]
      };
    }
  }, {
    key: "postMessage",
    value: function postMessage(data) {
      this.emit("message", {
        data: data
      });
    }
    /**
    * Concatenates 2 buffers
    * @param buffer1
    * @param buffer2
    * @returns {ArrayBufferLike}
    */

  }, {
    key: "appendBuffer",
    value: function appendBuffer(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    }
  }, {
    key: "downloadFile",
    value: function downloadFile(data) {
      var _this11 = this;

      this.processDownload(data).then(function (dataBuffer) {
        _this11.postMessage({
          message: "download_complete",
          data: dataBuffer
        });

        console.log("Stream finished");
      }).catch(function (err) {
        console.log("Error downloading file: " + err);

        _this11.postMessage({
          message: "download_failed",
          data: err
        });
      });
    }
  }, {
    key: "processDownload",
    value: function processDownload(data) {
      var _this12 = this;

      var self = this;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref8 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee16(resolve, reject) {
          var fileInfo, link, myPkfp, privk, ownerPubk, metaID, fileSocket;
          return regenerator_default.a.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  console.log("Initializing file download");
                  fileInfo = JSON.parse(data.fileInfo);
                  link = self.parseFileLink(fileInfo.link);
                  myPkfp = data.myPkfp;
                  privk = data.privk;
                  ownerPubk = data.pubk;
                  metaID = fileInfo.metaID;
                  _context16.prev = 7;
                  _context16.next = 10;
                  return _this12.establishConnection();

                case 10:
                  fileSocket = _context16.sent;
                  _context16.next = 16;
                  break;

                case 13:
                  _context16.prev = 13;
                  _context16.t0 = _context16["catch"](7);
                  reject("Connection error: " + _context16.t0);

                case 16:
                  /**
                  * event triggered by Island when file is ready to be transferred to the client
                  * key is encrypted shared SYM key to decrypt file
                  */
                  fileSocket.on("download_ready", function (key) {
                    //prepare file
                    self.postMessage({
                      message: "file_available_locally"
                    });
                    var symk = key[metaID];
                    var dataBuffer = new ArrayBuffer(0);
                    ss(fileSocket).on("file", function (stream) {
                      console.log("File download in progress!");
                      var ic = new iCrypto_iCrypto();
                      ic.addBlob("k", symk).asym.setKey("privk", privk, "private").asym.decrypt("k", "privk", "symk", "hex");
                      ic.createHash("h");
                      ic.ssym.init("stc", ic.get("symk"), false);
                      stream.on('data', function (data) {
                        self.postMessage({
                          message: "log",
                          data: "Received data chunk"
                        });
                        var chunk = ic.ssym.decrypt("stc", data.buffer);
                        ic.updateHash("h", new Uint8Array(chunk));
                        dataBuffer = iCrypto_iCrypto.concatArrayBuffers(dataBuffer, chunk);
                      });
                      stream.on('end', function () {
                        self.postMessage({
                          message: "log",
                          data: "Received end of data message"
                        });
                        ic.digestHash("h", "hres").addBlob("sign", fileInfo.signUnencrypted).asym.setKey("pubk", ownerPubk, "public").asym.verify("hres", "sign", "pubk", "vres");

                        if (!ic.get("vres")) {
                          reject("File validation error!");
                        } else {
                          self.postMessage({
                            message: "log",
                            data: "Resolving data..."
                          });
                          resolve(dataBuffer);
                        }
                      });
                    }); //create stream
                    //emit

                    console.log("About to emit process_download");
                    fileSocket.emit("proceed_download", {
                      link: link,
                      pkfp: myPkfp
                    });
                  });
                  fileSocket.on("requesting_peer", function () {
                    console.log("File not found locally, requesting hidden peer");
                    self.postMessage({
                      message: "requesting_peer"
                    });
                  });
                  fileSocket.on("download_failed", function (err) {
                    console.log("File download fail: " + err);
                    self.postMessage({
                      message: "download_failed",
                      data: err
                    });
                  });
                  fileSocket.emit("download_attachment", {
                    link: link,
                    myPkfp: myPkfp,
                    metaID: fileInfo.metaID,
                    hashEncrypted: fileInfo.hashEncrypted,
                    signEncrypted: fileInfo.signEncrypted
                  });

                case 20:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee16, null, [[7, 13]]);
        }));

        return function (_x20, _x21) {
          return _ref8.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "establishConnection",
    value: function establishConnection() {
      var self = this;
      return new Promise(function (resolve, reject) {
        console.log("Connecting to file socket...");
        var maxAttempts = 5;
        var reconnectionDelay = 5000; //ms

        var attempted = 0;
        self.postMessage({
          message: "log",
          data: "Connecting to file socket..."
        });
        var fileSocket = socket_io_client_lib('/file', {
          autoConnect: false,
          reconnection: false,
          upgrade: false,
          pingInterval: 10000,
          pingTimeout: 5000
        });

        var attemptConnection = function attemptConnection() {
          self.postMessage({
            message: "log",
            data: "Attempting connection: " + attempted
          });
          fileSocket.open();
        };

        var connectionFailHandler = function connectionFailHandler(err) {
          if (attempted < maxAttempts) {
            var msg = "Connection error on attempt ".concat(attempted, ": ").concat(err);
            self.postMessage({
              message: "log",
              data: msg
            });
            attempted++;
            setTimeout(attemptConnection, reconnectionDelay);
          } else {
            var _msg = "Connection error on attempt ".concat(attempted, ": ").concat(err, "\nRejecting!");

            self.postMessage({
              message: "log",
              data: _msg
            });
            reject(err);
          }
        };

        fileSocket.on("connect", function () {
          self.postMessage({
            message: "log",
            data: "File transfer connection established"
          });
          resolve(fileSocket);
        });
        fileSocket.on("connect_error", function (err) {
          connectionFailHandler(err);
        });
        fileSocket.on("connect_timeout", function () {
          connectionFailHandler("Connection timeout.");
        });
        attemptConnection();
      });
    }
  }]);

  return Downloader;
}();
// EXTERNAL MODULE: ./node_modules/toastr/toastr.js
var toastr = __webpack_require__(5);

// CONCATENATED MODULE: ./common/IError.js


var IError_IError =
/*#__PURE__*/
function () {
  function IError() {
    classCallCheck_default()(this, IError);
  }

  createClass_default()(IError, null, [{
    key: "required",
    value: function required(msg) {
      if (!msg) {
        msg = "Missing required parameter";
      }

      throw new Error(msg);
    }
  }]);

  return IError;
}();
// CONCATENATED MODULE: ./client/src/js/lib/Topic.js


var Topic_Topic =
/*#__PURE__*/
function () {
  function Topic(pkfp, name, key, comment) {
    classCallCheck_default()(this, Topic);

    this.pkfp = pkfp;
    this.name = name;
    this.key = key;
    this.comment = comment;
  }

  createClass_default()(Topic, [{
    key: "setName",
    value: function setName(name) {
      this.name = name;
    }
  }]);

  return Topic;
}();
// CONCATENATED MODULE: ./client/src/js/lib/Vault.js







/**
 * Represents key vault
 *
 *
 */

var Vault_Vault =
/*#__PURE__*/
function () {
  function Vault() {
    classCallCheck_default()(this, Vault);

    this.initialized = false;
    this.admin = null;
    this.adminKey = null;
    this.topics = {};
    this.password = null;
    this.publicKey = null;
    this.privateKey = null;
  }
  /**
   * Given a password creates an empty vault
   * with generated update private key inside
   * @param password
   * @returns {Vault}
   */


  createClass_default()(Vault, [{
    key: "init",
    value: function init(password) {
      if (!password || password.trim === "") {
        throw "Password required";
      } //CHECK password strength and reject if not strong enough


      var ic = new iCrypto_iCrypto();
      ic.generateRSAKeyPair("kp"); //Create new Vault object

      this.password = password;
      this.topics = {};
      this.privateKey = ic.get("kp").privateKey;
      this.publicKey = ic.get("kp").publicKey;
      this.initialized = true;
    }
    /**
     * Given a password and a key
     * initializes a vault, creates update key
     * sets it to admin vault and sets admin private key
     *
     * @param password
     * @param adminKey
     * @returns {Vault}
     */

  }, {
    key: "initAdmin",
    value: function initAdmin(password, adminKey) {
      this.init(password);
      this.admin = true;
      this.adminKey = adminKey;
    }
  }, {
    key: "initSaved",
    value: function initSaved() {
      var _this = this;

      var vault_encrypted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : IError_IError.required("Vault parse: data parameter missing");
      var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : IError_IError.required("Vault parse: password parameter missing");
      var ic = new iCrypto_iCrypto();
      ic.addBlob("s16", vault_encrypted.substring(0, 256)).addBlob("v_cip", vault_encrypted.substr(256)).hexToBytes("s16", "salt").createPasswordBasedSymKey("sym", password, "s16").AESDecrypt("v_cip", "sym", "vault_raw", true); //Populating new object

      var data = JSON.parse(ic.get("vault_raw"));
      this.adminKey = data.adminKey;
      this.admin = data.admin;
      this.publicKey = data.publicKey;
      this.privateKey = data.privateKey;
      this.password = password;
      Object.keys(data.topics).forEach(function (k, v) {
        _this.topics[k] = new Topic_Topic(k, data.topics[k].name, data.topics[k].key, data.topics[k].comment);
      });
      this.initialized = true;
    } //This has to be moved outside

  }, {
    key: "save",
    value: function save() {
      if (!this.password || this.privateKey || this.topics) {
        throw "Vault object structure is not valid";
      } //Check if vault exists decrypted and loaded
      //If not
      // Throw error
      //Encrypt vault data with given password


      var vault = JSON.stringify({
        privateKey: this.privateKey,
        topics: JSON.parse(JSON.stringify(this.topics))
      });
      var ic = new iCrypto_iCrypto();
      ic.createNonce("salt", 128).base64Encode("salt", "s64").createPasswordBasedSymKey("key", this.password, "s64").addBlob("vault", vault).AESEncrypt("vault", "key", "cipher").base64Encode("cipher", "cip64").merge(["cip64", "s64"], "res").setRSAKey("asymkey", this.privateKey, "private").privateKeySign("res", "asymkey", "sign"); //Sign encrypted vault with private key

      var body = {
        vault: ic.get("res"),
        sign: ic.get("sign")
      };
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/update", true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = function () {
        console.log("Server said that vault is saved!");
      };

      xhr.send(body); //Send vault to the server
      //Display result of save request
    }
  }, {
    key: "changePassword",
    value: function changePassword(newPassword) {
      if (!this.initialized) {
        throw "The vault hasn't been initialized";
      }

      if (!newPassword || newPassword.trim === "") {
        throw "Password required";
      }

      this.password = newPassword;
    }
    /**
     * Stringifies and encrypts this object
     */

  }, {
    key: "pack",
    value: function pack() {
      if (!this.initialized) {
        throw "The vault hasn't been initialized";
      }

      var res = JSON.stringify({
        topics: this.topics,
        publicKey: this.publicKey,
        privateKey: this.privateKey,
        admin: this.admin,
        adminKey: this.adminKey
      });
      console.log(this.topics);
      var ic = new iCrypto_iCrypto();
      ic.createNonce("salt", 128).bytesToHex("salt", "s16").createPasswordBasedSymKey("key", this.password, "s16").addBlob("vault", res).AESEncrypt("vault", "key", "v_cip", true, "CBC", "utf8").merge(["s16", "v_cip"], "reshex").setRSAKey("priv", this.privateKey, "private").hexToBytes("reshex", "res").privateKeySign("res", "priv", "sign");
      return {
        vault: ic.get("reshex"),
        sign: ic.get("sign")
      };
    }
  }, {
    key: "addTopic",
    value: function addTopic(pkfp, name, privateKey, comment) {
      if (this.topics.hasOwnProperty(pkfp)) throw "Topic with such id already exists";
      this.topics[pkfp] = new Topic_Topic(pkfp, name, privateKey, comment);
    }
  }, {
    key: "removeTopic",
    value: function removeTopic() {}
  }]);

  return Vault;
}(); // a = {
//
//
//     encrypted: "some-bytes",
//
//     privateKey: "key",
//     publicKey: "key",
//     password: passwordRaw
//
//     topics: {
//         topicName1: {
//             key: "key",
//             comment: "comment"
//         },
//         topicName2: {
//             key: "key",
//             comment: "comment"
//         }
//
//         //...
//     }
//
// };
// EXTERNAL MODULE: ./client/src/js/lib/waitMe.min.js
var waitMe_min = __webpack_require__(366);

// EXTERNAL MODULE: ./node_modules/tingle.js/dist/tingle.min.js
var tingle_min = __webpack_require__(215);

// CONCATENATED MODULE: ./client/src/js/lib/DynmaicModal.js

function prepareModal(content) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var modal = new tingle_min["modal"]({
    footer: true,
    stickyFooter: false,
    closeMethods: options.closeMethods || ['overlay', 'button', 'escape'],
    closeLabel: "Close",
    onOpen: options.onOpen,
    onClose: options.onClose,
    beforeClose: options.beforeClose || function () {
      return true;
    }
  });
  modal.setContent(content);
  return modal;
}
// CONCATENATED MODULE: ./client/src/js/lib/PasswordVerify.js
function verifyPassword(password, confirm) {
  if (!password || !password.trim() || !/^[a-zA-Z0-9!@#$%^&*]{9,}$/.test(password)) {
    return "Password or passphrase must be at least 9 characters long and can contain only lowercase a-z, uppercase A-Z and symbols !@#$%^&*";
  }

  if (password !== confirm) {
    return "Password and confirmation do not match.";
  }
}
// CONCATENATED MODULE: ./client/src/js/lib/dom-util.js





/**
 *
 *
 * Bakes DOM element as per request in data
 *
 * @param name - name of the element such as div, button etc
 * recipe is a JSON object with following properties:
 *  * id - string id
 *  * classes - list of classes. Array or single entry
 *  * attributes - object of attributes key vaule pairs
 *  * html - inner html
 *  * text - inner text
 *  * val  - value
 *  
 *  
 * @param recipe
 */
function bake(name, recipe) {
  var el = document.createElement(name);
  if (!recipe) return el;

  if (recipe.classes) {
    if (typeof recipe.classes === "object") {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = recipe.classes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var c = _step.value;
          el.classList.add(c);
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
    } else if (typeof recipe.classes === "string") {
      el.classList.add(recipe.classes);
    } else {
      throw "Bake parameters invalid";
    }
  }

  if (recipe.listeners) {
    for (var _i = 0, _Object$keys = Object.keys(recipe.listeners); _i < _Object$keys.length; _i++) {
      var ev = _Object$keys[_i];
      el.addEventListener(ev, recipe.listeners[ev]);
    }
  }

  if (recipe.id) {
    el.setAttribute("id", recipe.id);
  }

  if (recipe.attributes) {
    for (var _i2 = 0, _Object$keys2 = Object.keys(recipe.attributes); _i2 < _Object$keys2.length; _i2++) {
      var key = _Object$keys2[_i2];
      el.setAttribute(key, recipe.attributes[key]);
    }
  }

  if (recipe.html) el.innerHTML = recipe.html;
  if (recipe.text) el.innerText = recipe.text;
  if (recipe.val) el.value = recipe.val;
  return el;
}
function appendChildren(parent, children) {
  if (children instanceof Array) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var child = _step2.value;
        parent.appendChild(child);
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
  } else {
    parent.appendChild(children);
  }
}
function dom_util_$(selector) {
  return document.querySelector(selector);
}
function $$(selector) {
  return document.querySelectorAll(selector);
}
function displayNone(selector) {
  dom_util_$(selector).style.display = "none";
}
function displayBlock(selector) {
  dom_util_$(selector).style.display = "block";
}
function displayFlex(selector) {
  dom_util_$(selector).style.display = "flex";
}
// CONCATENATED MODULE: ./client/src/js/lib/dropdown.js



function dropdown_reset() {
  document.querySelectorAll(".menu-dropdown").forEach(function (el) {
    el.addEventListener("click", function () {
      console.log("Dropdown menu clicked!");
    });
  });
}
/**
 * Creates button-based dropdown menu
 * Menu items will be unordered list
 * @param menuTitle - string this will appear on the button
 * @param items
 */

function bakeDropdownMenu(menuTitle, items) {
  var dropdownContainer = bake("div", {
    classes: ["dropdown-wrap"]
  });
  var button = bake("button", {
    classes: "dropdown-button",
    text: menuTitle
  });
  var menuOptions = bake("ul", {
    classes: "dropdown"
  });
  Object.keys(items).forEach(function (key) {
    var option = bake("li", {
      classes: "dropdown-item",
      text: key
    });
    option.addEventListener("click", function (ev) {
      items[key](ev);
    });
    menuOptions.appendChild(option);
  });
  appendChildren(dropdownContainer, [button, menuOptions]);
  return dropdownContainer;
}
// CONCATENATED MODULE: ./client/src/js/lib/editable_field.js

function bakeEditableField(placeholder, userClasses) {
  var classes = ["editable-field"];

  if (userClasses !== undefined) {
    classes = classes.concat(userClasses);
  }

  return bake("input", {
    classes: classes,
    attributes: {
      type: "text",
      placeholder: placeholder ? placeholder : ""
    }
  });
}
// CONCATENATED MODULE: ./client/src/js/vault.js


















var vault_vault;
var reg = isRegistration();
var topicCreateForm;
var topicJoinForm;
var passwordChangeForm; ///Functions closures

var vault_reloadVault;
var adminLogin;
/**Set main listeneres when document loaded**/

document.addEventListener('DOMContentLoaded', function (event) {
  document.title = "Login | Islands";
  dom_util_$("#register-vault").addEventListener("click", registerVault);
  dom_util_$("#vault-login-btn").addEventListener("click", vaultLoginGetVault);
  dom_util_$("#create").addEventListener("click", showTopicCreateForm);
  dom_util_$("#join").addEventListener("click", showTopicJopinForm);
  dom_util_$("#change-pass").addEventListener("click", showChangPasswordForm);

  if (reg) {
    setView("register");
    $('#vault-new-password-confirm').keyup(function (e) {
      if (e.keyCode === 13) {
        registerVault();
      }
    });
  } else {
    //regular login
    setView("login");
    $('#vault-password').keyup(function (e) {
      if (e.keyCode === 13) {
        vaultLoginGetVault();
      }
    });
  }

  document.querySelector("#vault-login-btn").addEventListener("click", vaultLoginGetVault);
  prepareTopicJoinModal();
  prepareTopicCreateModal();
  prepareChangePasswordModal();
});

function isMobileBrowser() {
  return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i);
}

function prepareChangePasswordModal() {
  var wrapper = bake("div");
  var oldPass = bake("input", {
    id: "pass-change-old",
    classes: "left-align",
    attributes: {
      maxlength: "50",
      type: "password",
      placeholder: "Enter old password",
      required: true
    }
  });
  var newPass = bake("input", {
    id: "pass-change-new",
    classes: "left-align",
    attributes: {
      type: "password",
      maxlength: "50",
      placeholder: "Enter new password",
      required: true
    }
  });
  var confirm = bake("input", {
    id: "pass-change-confirm",
    classes: "left-align",
    attributes: {
      type: "password",
      maxlength: "50",
      placeholder: "Confirm new password",
      required: true
    }
  });

  var clearFields = function clearFields() {
    oldPass.value = "";
    newPass.value = "";
    confirm.value = "";
  };

  wrapper.addEventListener("keyup", function (ev) {
    if (ev.which === 13 || ev.keyCode === 13) {
      changePassword();
    }
  });
  appendChildren(wrapper, [oldPass, newPass, confirm]);
  passwordChangeForm = prepareModal(wrapper, {
    closeMethods: ["button"],
    onOpen: clearFields,
    onClose: clearFields
  });
  passwordChangeForm.addFooterBtn('Change password!', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', changePassword);
}

function prepareTopicCreateModal() {
  var wrapper = bake("div");
  var topicName = bake("input", {
    id: "new-topic-name",
    classes: "left-align",
    attributes: {
      placeholder: "Enter topic name",
      maxlength: "255",
      required: true
    }
  });
  var nickname = bake("input", {
    id: "new-topic-nickname",
    classes: "left-align",
    attributes: {
      placeholder: "Enter nickname",
      maxlength: "255",
      required: true
    }
  });

  var clearFields = function clearFields() {
    nickname.value = "";
    topicName.value = "";
  };

  var start = function start() {
    if (topicName.value.trim() === "") {
      toastr["warning"]("Topic name is required!");
    } else if (nickname.value.trim() === "") {
      toastr["warning"]("Nickname is required!");
    } else {
      topicCreate();
    }
  };

  wrapper.addEventListener("keyup", function (ev) {
    if (ev.which === 13 || ev.keyCode === 13) {
      start();
    }
  });
  appendChildren(wrapper, [topicName, nickname]);
  topicCreateForm = prepareModal(wrapper, {
    closeMethods: ["button"],
    onOpen: clearFields,
    onClose: clearFields
  });
  topicCreateForm.addFooterBtn('Create topic!', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', start);
}

function prepareTopicJoinModal() {
  var wrapper = bake("div");
  var title = bake("h3", {
    text: "Join existing topic"
  });
  var nickname = bake("input", {
    id: "join-nickname",
    classes: "left-align",
    attributes: {
      placeholder: "Enter your nickname",
      maxlength: "255",
      required: true
    }
  });
  var inviteCode = bake("input", {
    id: "join-topic-invite",
    classes: "left-align",
    attributes: {
      placeholder: "Paste invite code",
      maxlength: "255",
      required: true
    }
  });

  var clearFields = function clearFields() {
    nickname.value = "";
    inviteCode.value = "";
    topicName.value = "";
  };

  var topicName = bake("input", {
    id: "join-topic-name",
    classes: "left-align",
    attributes: {
      placeholder: "Enter topic name",
      maxlength: "255",
      required: true
    }
  });
  appendChildren(wrapper, [title, nickname, inviteCode, topicName]);
  topicJoinForm = prepareModal(wrapper, {
    closeMethods: ["button"],
    onOpen: clearFields,
    onClose: clearFields
  });

  var start = function start() {
    //Checking if all required fields are filled
    if (inviteCode.value.trim() === "") {
      toastr["warning"]("Invite code is required!");
    } else if (nickname.value.trim() === "") {
      toastr["warning"]("Nickname is required!");
    } else if (topicName.value.trim() === "") {
      toastr["warning"]("Topic name is required!");
    } else {
      topicJoin();
    }
  };

  wrapper.addEventListener("keyup", function (ev) {
    if (ev.which === 13 || ev.keyCode === 13) {
      start();
    }
  });
  topicJoinForm.addFooterBtn('Join topic!', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', start);
}
/**Handlers **/


function registerVault() {
  return new Promise(function (resolve, reject) {
    try {
      loadingOn();
      var password = dom_util_$("#vault-new-password");

      var _confirm = dom_util_$("#vault-new-password-confirm");

      var result = verifyPassword(password.value.trim(), _confirm.value.trim());

      if (result !== undefined) {
        toastr["warning"](result);
        loadingOff();
        return;
      }

      var ic = new iCrypto_iCrypto();
      ic.generateRSAKeyPair("adminkp").createNonce("n").privateKeySign("n", "adminkp", "sign").bytesToHex("n", "nhex");

      var _vault = new Vault_Vault();

      _vault.init(password.value.trim());

      var vaultEncData = _vault.pack();

      var vaultPublicKey = _vault.publicKey;
      $.ajax({
        type: "POST",
        url: "/register",
        dataType: "json",
        data: {
          nonce: ic.get('nhex'),
          sign: ic.get("sign"),
          vault: vaultEncData.vault,
          vaultPublicKey: vaultPublicKey,
          vaultSign: vaultEncData.sign
        },
        success: function success() {
          displayNone(" #vault-register--wrapper");
          displayFlex(" #registration-complete--wrapper");
          password.value = "";
          _confirm.value = "";
          loadingOff();
          toastr["success"]("Registration complete!");
          resolve();
        },
        error: function error(err) {
          loadingOff();
          toastr["error"]("error registring");
          reject("Fail!" + err);
        }
      });
    } catch (err) {
      toastr["warning"](err);
      loadingOff();
      reject(err);
    }
  });
}

function fillIDFromParameters() {
  console.log("Filling id from parameters");
  var url = new URL(document.location.href);
  console.log("Got url: " + url);
  var vaultID = url.searchParams.get("vault_id");
  console.log("Vault id: " + vaultID);

  if (vaultID) {
    document.querySelector("#vault-id-login").value = vaultID;
  }
}
/** Vault login sequence */


function vaultLoginGetVault(ev) {
  //give vault id
  try {
    var passwordEl = document.querySelector("#vault-password");
    var password = passwordEl.value;

    if (!password) {
      toastr["warning"]("Error: missing password!");
      return;
    }

    loadingOn();
    $.ajax({
      type: "post",
      url: "/",
      success: function success(data) {
        console.log("Got data: " + JSON.stringify(data));
        vaultLoginProcessVault(data, password, passwordEl);
      },
      error: function error(err) {
        loadingOff();
        toastr["warning"](err.responseText);
        console.log("Vault login error: " + err.responseText);
      }
    });
  } catch (err) {
    loadingOff();
    toastr["warning"]("Login failed. Check the password and try again.");
    console.log(err);
  }
}

function vaultLoginProcessVault(data, password, passwordEl) {
  try {
    console.log("Vault obtained. Continuing login...");
    vault_vault = new Vault_Vault();

    if (typeof data === "string") {
      console.log("Data seems to be string. Parsing...");
      data = JSON.parse(data);
    }

    console.log(JSON.stringify(data));
    console.log(JSON.stringify(Object.keys(data)));
    vault_vault.initSaved(data.vault, password);
    initPasswordBasedHandlers(password);
    passwordEl.value = "";
    vaultLoginFinalize();
    document.title = "Vault | Islands";
  } catch (err) {
    loadingOff();
    toastr["warning"]("Login failed. Check the password and try again.");
    console.log(err);
  }
}

function vaultLoginFinalize() {
  loadingOff();
  setView("online");
  renderVault();
  toastr["success"]("Login successful");
}
/** END */


function showTopicJopinForm() {
  topicJoinForm.open();
}

function topicJoin() {
  try {
    loadingOn();
    var nickname = document.querySelector("#join-nickname").value;
    var inviteCode = document.querySelector("#join-topic-invite").value;
    var topicName = document.querySelector("#join-topic-name").value;
    var transport = isMobileBrowser() ? 0 : 1;
    var chat = new ChatClient_ChatClient({
      version: version,
      transport: transport
    });
    chat.on("topic_join_success",
    /*#__PURE__*/
    function () {
      var _ref = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee(data) {
        return regenerator_default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("Topic join successful!");
                vault_vault.addTopic(data.pkfp, topicName, data.privateKey);
                _context.next = 4;
                return saveVault();

              case 4:
                renderVault();
                loadingOff();
                toastr["info"]("Topic has been created!");

                _destroyChat(chat);

                topicJoinForm.close();

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    chat.on("topic_join_error", function (err) {
      console.log("Topic join finished with error: " + err);
      loadingOff();
      toastr["warning"]("Topic join finished with error: " + err);

      _destroyChat(chat);
    });
    chat.initTopicJoin(nickname, inviteCode).then(function () {
      console.log("Topic creation initiated!: ");
    }).catch(function (err) {
      console.log("Error creating topic: " + err);
      loadingOff();
      topicJoinForm.close();
    });
  } catch (err) {
    loadingOff();
    toastr["warning"]("Error joining topic: " + err);
  }
}

function showTopicCreateForm() {
  topicCreateForm.open();
}

function showChangPasswordForm() {
  passwordChangeForm.open();
}
/**Change topic alias*/


function setTopicAlias(ev) {
  var newAlias = ev.target.value;
}
/**Change passsword sequence */


function changePassword() {
  loadingOn();
  var old = dom_util_$("#pass-change-old");
  var newPass = dom_util_$("#pass-change-new");
  var passConfirm = dom_util_$("#pass-change-confirm");
  var result = verifyPassword(newPass.value.trim(), passConfirm.value.trim());

  if (result !== undefined) {
    toastr["warning"](result);
    loadingOff();
    return;
  } else if (old.value === newPass.value) {
    toastr["warning"]("New password and old password are the same");
    loadingOff();
    return;
  }

  try {
    $.ajax({
      type: "post",
      url: "/",
      success: function () {
        var _success = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee2(data) {
          return regenerator_default.a.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return changePasswordProcess(data, old, newPass);

                case 2:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function success(_x2) {
          return _success.apply(this, arguments);
        }

        return success;
      }(),
      error: function error(err) {
        loadingOff();
        toastr["warning"](err.responseText);
        console.log("Vault login error: " + err.responseText);
      }
    });
  } catch (err) {
    loadingOff();
    toastr["warning"]("Login failed. Check the password and try again.");
    console.log(err);
  }
}

function changePasswordProcess(_x3, _x4, _x5) {
  return _changePasswordProcess.apply(this, arguments);
}
/** END */


function _changePasswordProcess() {
  _changePasswordProcess = asyncToGenerator_default()(
  /*#__PURE__*/
  regenerator_default.a.mark(function _callee7(data, old, newPass) {
    return regenerator_default.a.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            vault_vault = new Vault_Vault();
            console.log("Vault obtained");
            vault_vault.initSaved(data.vault, old.value);
            console.log("Vault decrypted");
            vault_vault.changePassword(newPass.value);
            initPasswordBasedHandlers(newPass.value);
            _context7.next = 9;
            return saveVault();

          case 9:
            renderVault();
            toastr["success"]("Password has been changed");
            passwordChangeForm.close();
            loadingOff();
            _context7.next = 20;
            break;

          case 15:
            _context7.prev = 15;
            _context7.t0 = _context7["catch"](0);
            loadingOff();
            toastr["warning"]("Password change failed: " + _context7.t0.message);
            console.log(_context7.t0.message);

          case 20:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 15]]);
  }));
  return _changePasswordProcess.apply(this, arguments);
}

function topicCreate() {
  loadingOn();
  var nickname = document.querySelector("#new-topic-nickname").value;
  var topicName = document.querySelector("#new-topic-name").value;
  var transport = isMobileBrowser() ? 0 : 1;
  var chat = new ChatClient_ChatClient({
    version: version,
    transport: transport
  });
  chat.on("init_topic_success",
  /*#__PURE__*/
  function () {
    var _ref2 = asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee3(data) {
      return regenerator_default.a.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              console.log("Topic Created!");
              vault_vault.addTopic(data.pkfp, topicName, data.privateKey);
              _context3.next = 4;
              return saveVault();

            case 4:
              renderVault();
              loadingOff();
              topicCreateForm.close();

              _destroyChat(chat);

              toastr["info"]("Topic has been created!");

            case 9:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x6) {
      return _ref2.apply(this, arguments);
    };
  }());
  chat.initTopic(nickname, topicName).then(function () {
    console.log("Topic creation initiated!: ");
  }).catch(function (err) {
    console.log("Error creating topic: " + err);
    topicCreateForm.close();
  });
}

function _destroyChat(chat) {
  chat.logout();
  chat.off();
  chat = null;
}
/**
 *
 * @param options
 *  privateKey - topic private key
 *  currentWindow - boolean Option to login in current window
 * @returns {result}
 */


function prepareLogin(options) {
  var privateKey = options.privateKey;
  var isMobile = options.isMobile;
  return function () {
    var ic = new iCrypto_iCrypto();
    ic.addBlob("privk", privateKey).createSYMKey("sym").AESEncrypt("privk", "sym", "privkcipher").createNonce("id", 16).bytesToHex("id", "idhex");
    localStorage.setItem(ic.get("idhex"), ic.get("privkcipher"));
    var params = "?id=" + ic.get("idhex") + "&token=" + ic.get("sym");

    if (options.currentWindow) {
      window.open(document.location.href + "chat" + params, "_self");
    } else {
      window.open(document.location.href + "chat" + params, isMobile ? "_self" : "_blank");
    }
  };
}
/*VIEWS SETTINGS*/


function setView(view) {
  console.log("Vault: setting view: " + view);
  var setters = {
    login: setViewLogin,
    register: setViewRegister,
    online: setViewOnline
  };

  if (!setters.hasOwnProperty(view)) {
    throw "Invalid view";
  }

  setters[view]();
}

function setViewLogin() {
  document.querySelector("#vault-content--wrapper").style.display = "none";
  document.querySelector("#vault-login--wrapper").style.display = "flex";
  document.querySelector("#vault-register--wrapper").style.display = "none";
}

function setViewRegister() {
  document.querySelector("#vault-content--wrapper").style.display = "none";
  document.querySelector("#vault-login--wrapper").style.display = "none";
  document.querySelector("#vault-register--wrapper").style.display = "flex";
}

function setViewOnline() {
  document.querySelector("#vault-content--wrapper").style.display = "flex";
  document.querySelector("#vault-login--wrapper").style.display = "none";
  document.querySelector("#vault-register--wrapper").style.display = "none";
}

function saveVault() {
  return new Promise(function (resolve, reject) {
    var vaultEncData = vault_vault.pack();
    $.ajax({
      type: "POST",
      url: "/update",
      dataType: "json",
      data: vaultEncData,
      success: function success(data) {
        console.log("Vault updated");
        vault_reloadVault(data);
        resolve(data);
      },
      error: function error(err) {
        toastr["warning"](err.responseText);
        console.log("Vault update error: " + err.responseText);
        reject(err);
      }
    });
  });
}

function renderVault() {
  var topics = document.querySelector("#user-topics");
  topics.innerHTML = "";

  var _loop = function _loop(k) {
    if (!vault_vault.topics.hasOwnProperty(k)) {
      console.log("Invalid topic record");
      return "continue";
    }

    var topicContainer = bake("div", {
      classes: "topic-container"
    });
    var nameElement = bakeEditableField("Topic alias", "topic-title");
    nameElement.value = vault_vault.topics[k].name;
    addNameChangeHandlers(nameElement);
    var idWrap = bake("div", {
      classes: "topic-id-wrap"
    });
    var idHeading = bake("span", {
      text: "ID: "
    });
    var topicId = bake("span", {
      text: vault_vault.topics[k].pkfp,
      classes: "topic-id"
    });
    idWrap.addEventListener("click", function () {
      copyTextToBuffer(topicId.innerText, "Topic ID has been copied to clipboard");
    });
    appendChildren(idWrap, [idHeading, topicId]);
    var buttons = bake("div", {
      classes: "topic-buttons"
    });
    var loginButton = bake("button", {
      classes: "login-button",
      text: "Login"
    });
    loginButton.addEventListener("click", prepareLogin({
      privateKey: vault_vault.topics[k].key,
      isMobile: isMobileBrowser()
    }));
    var options = bakeTopicDropdownMenu(vault_vault.topics[k].key, vault_vault.topics[k].pkfp);
    appendChildren(buttons, [loginButton, options]);
    appendChildren(topicContainer, [nameElement, idWrap, buttons]);
    appendChildren(topics, topicContainer);
  };

  for (var k in vault_vault.topics) {
    var _ret = _loop(k);

    if (_ret === "continue") continue;
  }

  if (vault_vault.admin) {
    adminLogin = prepareAdminLogin(vault_vault.adminKey);
    var oldButton = document.querySelector("#admin");
    var newButton = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton, oldButton);
    newButton.addEventListener("click", adminLogin);
    newButton.style.display = "block";
  } else {
    document.querySelector("#admin").style.display = "none";
  }

  console.log("Checking if topics exist...");
  console.log(vault_vault.topics.toString());

  if (Object.keys(vault_vault.topics).length == 0) {
    console.log("No topics found. Showing welcome message.");
    dom_util_$("#welcome-msg-wrap").style.display = "block";
  } else {
    console.log("Topics exist");
    dom_util_$("#welcome-msg-wrap").style.display = "none";
  }
}

function addNameChangeHandlers(el) {
  el.addEventListener("change", processTopicNameChange);
  el.addEventListener("keyup", function (ev) {
    if (ev.which === 13 || ev.keyCode === 13) {
      document.activeElement.blur();
    }
  });
}

function bakeTopicDropdownMenu(key, pkfp) {
  return bakeDropdownMenu("Options", {
    "Login in this window": prepareLogin({
      privateKey: key,
      currentWindow: true
    }),
    "Delete permanently": prepareTopicDelete(key, pkfp),
    "Delete topic record": function DeleteTopicRecord() {
      var _deleteRecord = prepareTopicRecordDelete(pkfp);

      _deleteRecord().then(function () {
        renderVault();
      }).catch(function (err) {
        throw err;
      });
    }
  });
}

function prepareTopicRecordDelete(pkfp) {
  return function () {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref3 = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee4(resolve, reject) {
        return regenerator_default.a.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                delete vault_vault.topics[pkfp];
                _context4.next = 4;
                return saveVault();

              case 4:
                resolve();
                _context4.next = 10;
                break;

              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4["catch"](0);
                reject(_context4.t0);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[0, 7]]);
      }));

      return function (_x7, _x8) {
        return _ref3.apply(this, arguments);
      };
    }());
  };
}

function prepareTopicDelete(privateKey, pkfp) {
  return function (ev) {
    if (!confirm("Topic will be permanently deleted. \n\nProceed?")) {
      return;
    }

    var onError = function onError(err) {
      loadingOff();
      toastr["warning"](err.responseText);
      console.log("Vault login error: " + err.responseText);
    };

    var transport = isMobileBrowser() ? 0 : 1;
    var chat = new ChatClient_ChatClient({
      version: version,
      tranport: transport
    });
    var deleteTopicRecord = prepareTopicRecordDelete(pkfp);
    chat.on("login_success",
    /*#__PURE__*/
    asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee5() {
      return regenerator_default.a.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              console.log("Deleting topic in chat");
              _context5.next = 3;
              return chat.deleteTopic();

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));
    chat.on("delete_topic_success",
    /*#__PURE__*/
    asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee6() {
      return regenerator_default.a.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return deleteTopicRecord();

            case 3:
              renderVault();

              _destroyChat(chat);

              toastr["success"]("Topic has been deleted!");
              loadingOff();
              _context6.next = 12;
              break;

            case 9:
              _context6.prev = 9;
              _context6.t0 = _context6["catch"](0);
              onError(_context6.t0);

            case 12:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, null, [[0, 9]]);
    })));
    chat.on("login_error", onError);
    chat.on("delete_topic_error", onError);
    console.log("Logging into chat");
    chat.topicLogin(privateKey).then(function () {
      console.log("Topic login successfull for deleteion");
    }).catch(onError);
  };
}

function processTopicNameChange(ev) {
  try {
    var pkfp = ev.target.parentElement.children[1].children[1].innerText;
    vault_vault.topics[pkfp].setName(ev.target.value);
    saveVault().then(function () {
      toastr["info"]("Topic alias updated");
    }).catch(function (err) {
      toastr["warning"]("Error updating topic alias: " + err);
    });
  } catch (err) {
    toastr["warning"]("Error updating topic alias: " + err);
  }
}

function prepareAdminLogin(privateKey) {
  var isMobile = isMobileBrowser();
  return function () {
    var ic = new iCrypto_iCrypto();
    ic.addBlob("privk", privateKey).createSYMKey("sym").AESEncrypt("privk", "sym", "privkcipher").createNonce("id", 16).bytesToHex("id", "idhex"); //Save it in a local storage

    localStorage.setItem(ic.get("idhex"), ic.get("privkcipher"));
    var params = "?id=" + ic.get("idhex") + "&token=" + ic.get("sym");
    window.open(document.location.href + "admin" + params, isMobile ? undefined : "_blank");
  };
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

function initPasswordBasedHandlers(password) {
  vault_reloadVault = function reloadVault(data) {
    if (!password) {
      toastr["warning"]("Error: missing password!");
      return;
    }

    vault_vault = new Vault_Vault();
    vault_vault.initSaved(data.vault, password);
  };
}
/**
 * Copies passed text to clipboard
 * @param text - text to copy
 * @param message - message to display
 */


function copyTextToBuffer(text, message) {
  var textArea = bake("textarea");
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    toastr["info"](message);
  } catch (err) {
    toastr["error"]("Error copying invite code to the clipboard");
  }

  textArea.remove();
}

/***/ })

/******/ });