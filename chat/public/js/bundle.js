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
var domik_namespaceObject = {};
__webpack_require__.r(domik_namespaceObject);
__webpack_require__.d(domik_namespaceObject, "bake", function() { return bake; });
__webpack_require__.d(domik_namespaceObject, "addClass", function() { return addClass; });
__webpack_require__.d(domik_namespaceObject, "removeClass", function() { return removeClass; });
__webpack_require__.d(domik_namespaceObject, "html", function() { return html; });
__webpack_require__.d(domik_namespaceObject, "text", function() { return domik_text; });
__webpack_require__.d(domik_namespaceObject, "val", function() { return val; });
__webpack_require__.d(domik_namespaceObject, "appendChildren", function() { return appendChildren; });
__webpack_require__.d(domik_namespaceObject, "$", function() { return $; });
__webpack_require__.d(domik_namespaceObject, "$$", function() { return $$; });
__webpack_require__.d(domik_namespaceObject, "displayNone", function() { return displayNone; });
__webpack_require__.d(domik_namespaceObject, "hide", function() { return hide; });
__webpack_require__.d(domik_namespaceObject, "displayBlock", function() { return displayBlock; });
__webpack_require__.d(domik_namespaceObject, "show", function() { return show; });
__webpack_require__.d(domik_namespaceObject, "displayFlex", function() { return displayFlex; });
__webpack_require__.d(domik_namespaceObject, "flex", function() { return flex; });
__webpack_require__.d(domik_namespaceObject, "generateRandomId", function() { return generateRandomId; });

// CONCATENATED MODULE: ./node_modules/domik/src/domik.js
/**
 *
 *
 * Bakes DOM element as per request in data
 *
 * @param name - name of the element such as div, button etc
 *
 * @param recipe
    * recipe is a JSON object with following properties:
 *  * id - string id
 *  * classes - list of classes. Array or single entry
 *  * attributes - object of attributes key vaule pairs
 *  * html - inner html
 *  * text - inner text
 *  * val  - value
 *  * style - css string inline style for the element
 *  * children - single DOM element or array of DOM elements that will be appended as children
 *  * listeners - JSON object with keys - events types, vaules - event handlers
 */
function bake(name, recipe){
    let el = document.createElement(name);
    if(!recipe) return el;

    if(recipe.classes){
        if (typeof recipe.classes === "object"){
            for (let c of recipe.classes){
                el.classList.add(c);
            }
        }else if (typeof recipe.classes === "string"){
            el.classList.add(recipe.classes);
        }else {throw new Error("Bake parameters invalid");}
    }

    if(recipe.listeners){
        for(let ev of Object.keys(recipe.listeners)){
            el.addEventListener(ev, recipe.listeners[ev])
        }
    }
    
    if(recipe.id){
        el.setAttribute("id", recipe.id)
    }
    
    if (recipe.attributes){
        for (let key of Object.keys(recipe.attributes)){
            el.setAttribute(key, recipe.attributes[key])
        }
        
    }

    if (recipe.style){
        el.style = recipe.style;
    }

    if (recipe.html)
        el.innerHTML = recipe.html;

    if (recipe.text)
        el.innerText = recipe.text;

    if (recipe.val)
        el.value = recipe.val;

    if (recipe.children){
        appendChildren(el, recipe.children);
    }

    return el
}

// ---------------------------------------------------------------------------------------------------------------------------
// CSS classes wrapers
function addClass(element, _class){
    let node = verifyGetNode(element);
    node.classList.add(_class);
}

function removeClass(element, _class){
    let node = verifyGetNode(element);
    node.classList.remove(_class);
}
//end//////////////////////////////////////////////////////////////////////////


// ---------------------------------------------------------------------------------------------------------------------------
// Setting text and html
function html(element, html){
    let node = verifyGetNode(element);
    node.innerHTML = html;
}

function domik_text(element, text){
    let node = verifyGetNode(element);
    node.innerText = text;
}
//end//////////////////////////////////////////////////////////////////////////

/**
 * Less verbose wrapper for setting value;
 *
 */
function val(element, val){
    let node = verifyGetNode(element);
    node.value = val;
}

/**
 * Given parent node appends one or multiple children
 * @param parent DOM node
 * @param children can be array of nodes or a single node
 */
function appendChildren(parent, children){
    if (children instanceof  Array){
        for (let child of children){
            parent.appendChild(child)
        }
    } else {
        parent.appendChild(children)
    }
}

/**
 * Less verbose wrapper for document.querySelector
 */
function $(element){
    return verifyGetNode(element)
}

/**
 * Less verbose wrapper for document.querySelectorAll
 */
function $$(selector){
    return document.querySelectorAll(selector)
}


function displayNone(node){
    try{
        displayElement(node, "none")
    }catch(err){
        console.log("Display none fail: " + err)
    }
}

// Alias in jquery style for display: hide
function hide(node){
    try{
        displayElement(node, "none")
    }catch(err){
        console.log("Display none fail: " + err)
    }
}

function displayBlock(node){
    displayElement(node, "block")
}

// Alias in jquery style for display: block
function show(node){
    displayElement(node, "block")
}

function displayFlex(node){
    displayElement(node, "flex")
}

// Alias in jquery style for display: flex
function flex(node){
    displayElement(node, "flex")
}

/**
 * Internal. Sets node display property
 *
 */
function displayElement(element, display){
    let node = verifyGetNode(element);
    node.style.display = display;
}

function generateRandomId(length = 10, prefix="", postfix=""){
    let alphabet = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let symbols = [];
    for(let i=0; i<length; ++i){
        symbols.push(alphabet[Math.floor(Math.random() * alphabet.length)])
    }

    return `${prefix.length > 0 ? prefix + "-" : ""}${symbols.join("")}${postfix.length > 0 ? "-" + postfix : ""}`;
}

/**
 * Helper function. Given either DOM element or selector
 * makes sure it exists and valid, and returns it.
 */
function verifyGetNode(element){
    let node = element
    if (typeof node === "string"){
        node =  document.querySelector(element);
    }
    if (!node){
        throw `Element ${element} is undefined`;
    } else if(!node instanceof Element){
        throw new Error("Type of element is invalid");
    }
    return node;
}

// CONCATENATED MODULE: ./client/src/js/chat.js

window.util = domik_namespaceObject; // ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections

var loginBlock;
var registrationBlock;
var registrationCompletedBlock;
var chatBlock; // ---------------------------------------------------------------------------------------------------------------------------
// Objects

var vault;
var topics;
document.addEventListener('DOMContentLoaded', function (event) {
  console.log("Initializing page. Registration: ".concat(isRegistration()));
  var form = bakeLoginBlock();
  var container = $("#main-container");
  appendChildren(container, form);
}); // ---------------------------------------------------------------------------------------------------------------------------
// Page blocks management

function bakeLoginBlock() {
  return bake("div", {
    id: "vault-login--wrapper",
    style: 'display: flex;',
    children: bake("div", {
      classes: "form-border",
      children: [bake("h3", {
        html: "Vault login:"
      }), bake("div", {
        children: bake("input", {
          id: "vault-password",
          attributes: {
            type: "password",
            placeholder: "Password",
            maxlength: "50"
          }
        })
      }), bake("div", {
        children: bake("button", {
          classes: "btn",
          id: "vault-login-btn",
          text: "Login",
          listeners: {
            "click": function click() {
              alert("CLICKED!");
            }
          }
        })
      })]
    })
  });
} // ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blcoks management

/***/ })
/******/ ]);