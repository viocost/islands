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
let spinner = new BlockingSpinner();
// ---------------------------------------------------------------------------------------------------------------------------
// Objects
let chat;

// Topic that is in the focused window
// New messages are sent in context of this topic
// Members and invites are displayed in context of this topic
// Its title displayed in the header
// Settings displayed in context of this topic
let topicInFocus;

// Topics that are in the split windows and display messages
let activeTopics

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
        topicsElements.push(UI.bakeTopicListItem(topics[key], processActivateTopicClick))
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

function processActivateTopicClick(ev){
    let element = ev.currentTarget;
    let pkfp = element.getAttribute("pkfp");
    if (!pkfp){
        console.log("False alarm!");
        return;
    }
    console.log(`Setting topic in focus: ${pkfp}`);

    setTopicInFocus(pkfp)
    // load messges in the new window
    chat.getMessages(pkfp);


    // Update participants list in side panel
    //chat.getParticipants(pkfp);
    // Update invites list in side panel

    //chat.getInvites(pkfp);
    // Update to: select in new message block
}

function setTopicInFocus(pkfp){
    topicInFocus = pkfp
    for(let el of util.$("#topics-list").children){
        if (el.getAttribute("pkfp") === pkfp){
            util.addClass(el, "topic-in-focus");
            //Here set the name for active topic in header
        } else {
            util.removeClass(el, "topic-in-focus");
        }
    }
}

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

function processMessagesLoaded(pkfp, messages){
    if (topicInFocus === pkfp){
        console.log("Appending messages to view")
        let windowInFocus = getChatWindowInFocus()
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

    } else {
        console.log("Topic is inactive. Ignoring")
    }
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

    chat.on(Events.MESSAGES_LOADED, (data)=>{
        processMessagesLoaded(data.pkfp, data.messages)
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



/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */
function appendMessageToChat(message, toHead = false) {
    let chatWindow = document.querySelector('#chat_window');
    let msg = document.createElement('div');
    let message_id = document.createElement('div');
    let message_body = document.createElement('div');

    message_body.classList.add('msg-body');
    let message_heading = buildMessageHeading(message);

    if (isMyMessage(message.pkfp)) {
        // My message
        msg.classList.add('my_message');
    } else if (message.service) {
        msg.classList.add('service-record');
    } else {
        //Not my Message
        msg.classList.add('message');
        let author = document.createElement('div');
        author.classList.add("m-author-id");
        author.innerHTML = message.pkfp;
        msg.style.backgroundColor = colors[participantsKeys.indexOf(message.pkfp) % colors.length];
        message_heading.appendChild(author);
    }
    if (message.private) {
        let privateMark = preparePrivateMark(message);
        message_heading.appendChild(privateMark);
        msg.classList.add('private-message');
    }

    message_id.classList.add("message-id");
    message_id.innerHTML = message.messageID;
    message_heading.appendChild(message_id);
    message_body.appendChild(processMessageBody(message.body));
    //msg.innerHTML = '<b>'+message.author +'</b><br>' + message.message;

    //processing attachments
    let attachments = processAttachments(message.attachments);
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
    let message_heading = document.createElement('div');
    message_heading.classList.add('msg-heading');

    let alias, aliasNicknameDevisor;
    if (message.alias) {
        alias = document.createElement("b");
        alias.classList.add("m-alias");
        alias.innerText = message.alias;
        aliasNicknameDevisor = document.createElement("span");
        aliasNicknameDevisor.innerText = "  --  ";
    }

    let nickname = document.createElement("b");
    nickname.innerText = message.nickname;
    nickname.classList.add("m-nickname");

    let time_stamp = document.createElement('span');
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
        let recipientId = document.createElement("div");
        recipientId.innerHTML = message.recipient;
        recipientId.classList.add("m-recipient-id");
        message_heading.appendChild(recipientId);
    }
    return message_heading;
}

function preparePrivateMark(message) {
    let privateMark = document.createElement("span");
    privateMark.classList.add("private-mark");
    if (isMyMessage(message.pkfp)) {
        privateMark.innerText = "(private to: ";
        let recipientName = chat.getMemberRepr(message.recipient);
        privateMark.innerText += recipientName + ")";
    } else {
        privateMark.innerText = "(private)";
    }
    return privateMark;
}

function getChatWindowInFocus(){

}

// ---------------------------------------------------------------------------------------------------------------------------
// ~END util
