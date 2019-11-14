import * as util  from "./lib/dom-util";
import { BlockingSpinner } from "./lib/BlockingSpinner";
import toastr from "./lib/toastr";
import { ChatClient as Chat } from "./lib/ChatClient";
import { Events } from "../../../common/Events";
import "../css/chat.sass"
import "../css/vendor/loading.css"


// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760;

// ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections
let loginBlock;
let registrationBlock;
let registrationCompletedBlock;
let chatBlock;
let spinner = new BlockingSpinner();
// ---------------------------------------------------------------------------------------------------------------------------
// Objects
let chat;

// ---------------------------------------------------------------------------------------------------------------------------
// TEST ONLY!
window.util = util;
window.toastr = toastr;
window.chat = chat;
window.spinner = spinner;
// ---------------------------------------------------------------------------------------------------------------------------
// ~END TEST

document.addEventListener('DOMContentLoaded', event =>{
    //console.log(`Initializing page. Registration: ${isRegistration()}, Version: ${version}`);
    initChat();
    initUI();
    renderLayout();
    util.$("#print-dpi").onclick = ()=>{alert(window.devicePixelRatio)}
    util.$("#print-max").onclick = ()=>{alert(window.innerWidth)}
});


function initUI(){
    // let form = isRegistration() ? bakeRegistrationBlock() : bakeLoginBlock();

    // add listener to the menu button
    let menuButton = util.$("#menu-button")
    menuButton.onclick = ()=>{
        util.toggleClass(menuButton, "menu-on");
        renderLayout()
    }

    window.onresize = renderLayout;

    //prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "messages-panel-wrapper");


    let container = util.$("#main-container")
    util.appendChildren(container, [sidePanel, messagesWrapper]);
}

function renderLayout(){
    console.log("Rendering layout")
    let isSidePanelOn = util.hasClass("#menu-button", "menu-on");
    let sidePanel = util.$(".side-panel-container");
    let messagesPanel = util.$(".messages-panel-wrapper");

    if (isSidePanelOn) {

        if(window.innerWidth <= SMALL_WIDTH){
            util.flex(sidePanel);
            util.hide(messagesPanel);
        } else {
            util.flex(sidePanel);
            util.flex(messagesPanel);
        }

    } else {
        util.hide(sidePanel);
        util.flex(messagesPanel);
    }

    //messagesPanel.appendChild(util.bake("div", {
    //    html: `width ${window.innerWidth}`
    //}))

}

// ---------------------------------------------------------------------------------------------------------------------------
//
// Page blocks creation

function bakeMessagesPanel(){
    return util.bake("div", {
        classes: "messages-panel-container"
    })
}

function bakeSidePanel(){
    return util.bake("div", {
        classes: "side-panel-container"
    })
}


function bakeNewMessageControl(){
    return util.bake("div", {
        classes: "new-message-container"
    })
}

function bakeLoginBlock(){
     return  util.bake("div", {
        id: "vault-login--wrapper",
        style: 'display: flex;',
        children: util.bake("div", {
            classes: "form-border",
            children: [
                util.bake("h3", {html: "Vault login:"}),
                util.bake("div",  {
                    children:  util.bake("input", {
                        id: "vault-password",
                        attributes: {
                            type: "password",
                            placeholder: "Password",
                            maxlength: "50"
                        }
                    })
                }),
                util.bake("div", {
                    children: util.bake("button", {
                        classes: "btn",
                        id: "vault-login-btn",
                        text: "Login",
                        listeners: {
                            "click": initSession
                        }
                    }),
                })
            ]
        })
    })
}

function bakeRegistrationBlock(){

}

function bakeRegistrationSuccessBlock(){

}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blocks creation


// ---------------------------------------------------------------------------------------------------------------------------
// UI handlers
// ---------------------------------------------------------------------------------------------------------------------------
// ~END UI handlers


// ---------------------------------------------------------------------------------------------------------------------------
// Chat Event handlers
function processLoginResult(err){
    if (err){
        toastr.warning(`Login error: ${err.message}`)
    } else {
        toastr.success("Login successful");
    }
    loadingOff()
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Chat Event handlers

// ---------------------------------------------------------------------------------------------------------------------------
// Util

function initChat(){
    //chat = new Chat({version: version})
    chat = new Chat({version: "2.0.0"})
    chat.on(Events.LOGIN_ERROR, processLoginResult)
    chat.on(Events.LOGIN_SUCCESS, processLoginResult)
    chat.on(Events.INIT_TOPIC_SUCCESS, ()=>{
        toastr.success("Init topic success")
    })
    chat.on(Events.INIT_TOPIC_ERROR, (err)=>{

        toastr.warning(`Init topic error: ${err.message}`);
    })
    window.chat = chat;
}



function initSession(){
    let passwordEl = util.$("#vault-password");
    if (!passwordEl){
        throw new Error("Vault password element is not found.");
    }
    console.log("Chat created. Starting session...");
    loadingOn();
    chat.initSession(passwordEl.value)
}

function loadingOn() {
    spinner.loadingOn()
}

function loadingOff() {
    spinner.loadingOff()
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END util
