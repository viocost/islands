import * as util  from "./lib/dom-util";
import * as UI from "./lib/ChatUIFactory";
import { BlockingSpinner } from "./lib/BlockingSpinner";
import toastr from "./lib/toastr";
import { ChatClient as Chat } from "./lib/ChatClient";
import { Events } from "../../../common/Events";
import "../css/chat.sass"
import "../css/vendor/loading.css"
import { Vault } from "./lib/Vault";
//import "../css/vendor/toastr.min.css"


// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760;
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = ["#cfeeff", "#ffebcc", "#ccffd4", "#ccfffb", "#e6e6ff", "#f8e6ff", "#ffe6f1", "#ccefff", "#ccf1ff"]
// ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections and modal forms
let spinner = new BlockingSpinner();
let topicCreateModal;
let topicJoinModal;
// ---------------------------------------------------------------------------------------------------------------------------
// Objects

//Chast client instance
let chat;

//Opened views stack for navigation
const viewStack = []
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
    let mainContainer = util.$('#main-container');
    util.removeAllChildren(mainContainer);

    if (isRegistration()){

        let registrationBlock = UI.bakeRegistrationBlock(()=>{
            console.log("New vault registration..")
            loadingOn()
            registerVault()
                .then(()=>{
                    util.removeAllChildren(mainContainer);
                    util.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(()=>{
                        document.location.reload()
                    }))
                })
                .catch(err=>{
                    toastr.error(err.message)
                })
                .finally(()=>{
                    loadingOff();
                })
        })
        util.appendChildren("#main-container", registrationBlock)
    } else {
        let loginBlock = UI.bakeLoginBlock(initSession)
        util.appendChildren("#main-container", loginBlock)
    }
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

    //modals
    topicCreateModal = UI.bakeTopicCreateModal(()=>{
        console.log("Creating topic")
        let nickname = util.$("#new-topic-nickname").value;
        let topicName = util.$("#new-topic-name").value;
        chat.initTopic(nickname, topicName);
        toastr.info("Topic is being created")
        topicCreateModal.close()
    })


    topicJoinModal = UI.bakeTopicJoinModal(()=>{
        console.log("Joining topic")
        let nickname = util.$("#join-topic-nickname").value;
        let topicName = util.$("#join-topic-name").value;
        let inviteCode = util.$("#join-topic-invite-code").value;
        chat.joinTopic(nickname, topicName, inviteCode);
        toastr.info("Attempting to join topic");
        topicJoinModal.close();
    })

    // prepare side panel
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

function createTopic(){
    let nickname = util.$("new-topic-nickname");
    let topicName = util.$("new-topic-name");
    let form = UI.bakeTopicCreateModal()
}

function registerVault() {
    let password = util.$("#new-passwd");
    let confirm =  util.$("#confirm-passwd");
    return Vault.registerVault(password, confirm)
}


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
    topicCreateModal.open()
}

function processJoinTopicClick() {
    topicJoinModal.open()
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
        let windowInFocus = getChatWindowInFocus();
        clearMessagesWindow(windowInFocus)
        for (let message of messages){
            let alias  = chat.getParticipantAlias(pkfp, message.header.author)
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
            }, pkfp, windowInFocus);
        }

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


// ---------------------------------------------------------------------------------------------------------------------------
// MESSAGES RENDERING AND APPENDING

/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */
function appendMessageToChat(message, topicPkfp, chatWindow,  toHead = false) {
    let msg = document.createElement('div');
    let message_id = document.createElement('div');
    let message_body = document.createElement('div');

    message_body.classList.add('msg-body');
    let message_heading = buildMessageHeading(message, topicPkfp);

    if (message.pkfp === topicPkfp) {
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
        let participantIndex = Object.keys(chat.topics[topicPkfp].participants).indexOf(message.pkfp)
        msg.style.backgroundColor = colors[participantIndex % colors.length];
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

function buildMessageHeading(message, topicPkfp) {
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

    if (message.pkfp === topicPkfp) {
        // My messages
        message_heading.appendChild(time_stamp);
        message_heading.appendChild(nickname);
    } else if (message.service) {
        // Service message
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

/**
 * Processes all the attachments and returns
 * attachments wrapper which can be appended to a message
 * If no attachments are passed - returns undefined
 * @param attachments
 * @returns {*}
 */
function processAttachments(attachments) {
    if (attachments === undefined) {
        return undefined;
    }

    let getAttachmentSize = function (size) {
        let res = "";
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

    let attachmentsWrapper = document.createElement("div");
    attachmentsWrapper.classList.add("msg-attachments");

    for (let att of attachments) {
        let attachment = document.createElement("div");
        let attView = document.createElement("div");
        let attInfo = document.createElement("div");
        let attSize = document.createElement("span");
        let attName = document.createElement("span");
        let attIcon = document.createElement("span");
        let iconImage = document.createElement("img");

        // //State icons
        let attState = document.createElement("div");
        attState.classList.add("att-state");

        let spinner = document.createElement("img");
        spinner.classList.add("spinner");
        spinner.src = "/img/spinner.gif";
        spinner.display = "flex";

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
        attSize.innerHTML = getAttachmentSize(att.size);

        //Appending elements to attachment view
        attView.appendChild(attState);
        attView.appendChild(attIcon);
        attView.appendChild(attName);
        attView.appendChild(attSize);
        attView.addEventListener("click", downloadOnClick);
        attachment.appendChild(attView);
        attachment.appendChild(attInfo);
        attachmentsWrapper.appendChild(attachment);
    }
    return attachmentsWrapper;
}

function processMessageBody(text) {
    text = text.trim();
    let result = document.createElement("div");
    let startPattern = /__code/;
    let endPattern = /__end/;

    //no code
    if (text.search(startPattern) === -1) {
        result.appendChild(document.createTextNode(text));
        return result;
    }
    //first occurrence of the code
    let firstOccurrence = text.search(startPattern);
    if (text.substring(0, firstOccurrence).length > 0) {
        result.appendChild(document.createTextNode(text.substring(0, firstOccurrence)));
        text = text.substr(firstOccurrence);
    }
    let substrings = text.split(startPattern).filter(el => {
        return el.length !== 0;
    });
    for (let i = 0; i < substrings.length; ++i) {
        let pre = document.createElement("pre");
        let code = document.createElement("code");
        let afterText = null;
        let endCode = substrings[i].search(endPattern);
        if (endCode === -1) {
            code.innerText = processCodeBlock(substrings[i]);
        } else {
            code.innerText = processCodeBlock(substrings[i].substring(0, endCode));
            let rawAfterText = substrings[i].substr(endCode + 5).trim();
            if (rawAfterText.length > 0) afterText = document.createTextNode(rawAfterText);
        }
        //highliter:
        hljs.highlightBlock(code);
        ///////////

        pre.appendChild(code);
        result.appendChild(pre);
        pre.ondblclick = showCodeView;
        if (afterText) result.appendChild(afterText);
    }
    return result;
}



/**
 * Click handler when user clicks on attached file
 * @param ev
 * @returns {Promise<void>}
 */

async function downloadOnClick(ev) {
    console.log("Download event triggered!");
    let target = ev.target;
    while (target && !target.classList.contains("att-view")) {
        target = target.parentNode;
    }

    if (!target) {
        throw new Error("att-view container not found...");
    }
    let fileInfo = target.nextSibling.innerHTML; //Extract fileInfo from message

    let fileName = JSON.parse(fileInfo).name;
    target.childNodes[0].style.display = "inline-block";
    try {
        await chat.downloadAttachment(fileInfo); //download file
        console.log("Download complete!");
    } catch(err){
        toastr.warning("file download unsuccessfull: " + err)
        appendEphemeralMessage(fileName + " Download finished with error: " + err)
    }finally {
        target.childNodes[0].style.display = "none";
    }
}

function showCodeView(event) {
    let pre = document.createElement("pre");
    pre.innerHTML = event.target.innerHTML;
    let div = document.createElement("div");
    div.appendChild(pre);
    showModalNotification("Code:", div.innerHTML);
}
//~END MESSAGES RENDERING///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function getChatWindowInFocus(){
    return util.$("#messages-window-1");
}

function clearMessagesWindow(msgWindow){
    msgWindow.innerHTML = "";
}


function getChatFormatedDate(timestamp) {
    let d = new Date(timestamp);
    let today = new Date();
    if (Math.floor((today - d) / 1000) <= 64000) {
        return d.getHours() + ':' + padWithZeroes(2, d.getMinutes());
    } else {
        return DAYSOFWEEK[d.getDay()] + ", " + d.getMonth() + "/" + padWithZeroes(2, d.getDate()) + " " + padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
    }
}

function padWithZeroes(requiredLength, value) {
    let res = "0".repeat(requiredLength) + String(value).trim();
    return res.substr(res.length - requiredLength);
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END util
