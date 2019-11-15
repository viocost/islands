import * as util  from "./lib/dom-util";
import * as UI from "./lib/ChatUIFactory";
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
    initLoginUI();
    //util.$("#print-dpi").onclick = ()=>{alert(window.devicePixelRatio)}
    //util.$("#print-max").onclick = ()=>{alert(window.innerWidth)}
});


function initLoginUI(){
    let loginBlock = UI.bakeLoginBlock(initSession)
    util.appendChildren("#main-container", loginBlock)
}


//Called after successful login
function initUI(){

    // let form = isRegistration() ? bakeRegistrationBlock() : bakeLoginBlock();
    let header = util.$("header")
    util.removeAllChildren(header);
    util.appendChildren(header, [
        UI.bakeHeaderLeftSection((menuButton)=>{
            util.toggleClass(menuButton, "menu-on");
            renderLayout()
        }),
        UI.bakeHeaderRightSection(false, false, processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
    ])

    let main = util.$("main")
    util.removeAllChildren(main);
    let settingsContainer = UI.bakeSettingsContainer()
    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, [settingsContainer, mainContainer])
   


    let sidePanel = UI.bakeSidePanel(
        processNewTopicClick,
        processJoinTopicClick,
        processNewInviteClick,
        processRefreshInvitesClick
    );

    let newMessageBlock = UI.bakeNewMessageControl();
    let messagesPanel = UI.bakeMessagesPanel(newMessageBlock)

    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);

    refreshTopics();
    // add listener to the menu button

    window.onresize = renderLayout;
    renderLayout()
    //prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "messages-panel-wrapper");


    // util.appendChildren(container, [sidePanel, messagesWrapper]);
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


function refreshTopics(){
    let topics = chat.getTopics();
    let topicsList = util.$("#topics-list")
    util.removeAllChildren(topicsList)
    let topicsElements = []
    Object.keys(topics).forEach(key=>{
        topicsElements.push(UI.bakeTopicListItem(topics[key]))
    })
    topicsElements.sort((el)=>{ return el.innerText })
    util.appendChildren(topicsList, topicsElements)

}

// ---------------------------------------------------------------------------------------------------------------------------
//
// Page blocks creation
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blocks creation


// ---------------------------------------------------------------------------------------------------------------------------
// UI handlers

function processMuteClick(){

    console.log("Mute clicked");
}

function processSettingsClick(){
    console.log("Settings clicked");
    if (util.isShown("#main-container")){
        util.hide("#main-container")
        util.flex("#settings-container")
    } else {
        util.flex("#main-container")
        util.hide("#settings-container")
    }
}

function processLogoutClick(){
    console.log("Logout clicked");
    document.location.reload(true);
}

function processAdminLoginClick(){
    console.log("admin login clicked");
}

function processInfoClick(){
    alert("Islands v2.0.0")
}

function processNewTopicClick(){
    console.log("New topic");
}

function processJoinTopicClick() {
    console.log("Join topic");
}

function processNewInviteClick() {

    console.log("New Invite");
}

function processRefreshInvitesClick() {
    console.log("Refresh invites");
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END UI handlers


// ---------------------------------------------------------------------------------------------------------------------------
// Chat Event handlers
function processLoginResult(err){
    if (err){
        toastr.warning(`Login error: ${err.message}`)
    } else {
        initUI();
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
