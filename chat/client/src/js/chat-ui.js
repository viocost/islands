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
const SMALL_WIDTH = 760; // Width screen in pixels considered to be small
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = ["#cfeeff", "#ffebcc", "#ccffd4", "#ccfffb", "#e6e6ff", "#f8e6ff", "#ffe6f1", "#ccefff", "#ccf1ff"]
// ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections and modal forms
let spinner = new BlockingSpinner();
let topicCreateModal;
let topicJoinModal;
let setAliasModal;
let newMessageBlock; // container with new message inputs and elements
let messagesPanel;   // messages container
let sidePanel;
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
window.getTopicInFocus = ()=>{console.log(topicInFocus)};

// Topics that are in the split windows and display messages
let activeTopics

// ---------------------------------------------------------------------------------------------------------------------------
// TEST ONLY!
// Comment out for production!
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

    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, mainContainer)



    sidePanel = UI.bakeSidePanel();

    newMessageBlock = UI.bakeNewMessageControl(sendMessage, processAttachmentChosen);
    messagesPanel = UI.bakeMessagesPanel(newMessageBlock)

    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);

    setupSidePanelListeners()


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


    setAliasModal = UI.bakeSetAliasModal(()=>{
        console.log("Ok handler")
        setAliasModal.close();
    })
    // prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "main-panel-container");


    // util.appendChildren(container, [sidePanel, messagesWrapper]);
}

function setupSidePanelListeners(){

    util.$("#btn-new-topic").onclick = processNewTopicClick;
    util.$("#btn-join-topic").onclick = processJoinTopicClick;

    util.$("#btn-ctx-invite").onclick = processNewInviteClick;
    util.$("#btn-ctx-delete").onclick = processCtxDeleteClick;
    util.$("#btn-ctx-alias").onclick = processCtxAliasClick;

    //util.$("#btn-mng-delete-topic").onclick = processDeleteTopicClick;
    //util.$("#btn-mng-topics-go-back").onclick = backToChat;

    //util.$("#top-btn-join").onclick = processJoinTopicClick;
    //util.$("#bottom-btn-join").onclick = joinTopic;
    //util.$("#top-btn-manage-topics").onclick = processManageTopicsClick;
    //util.$("#bottom-btn-manage-topics").onclick = undefined;
    //util.$("#top-btn-refresh-invites").onclick = undefined;
    //util.$("#bottom-btn-refresh-invites").onclick = undefined;
    //util.$("#bottom-btn-new-invite").onclick = processNewInviteClick;
    //util.$("#top-btn-manage-invites").onclick = undefined;
    //util.$("#bottom-btn-manage-invites").onclick = undefined;
    //util.$("#top-btn-manage-participants").onclick = undefined;
    //util.$("#bottom-btn-manage-participants").onclick = undefined;
    //util.$("#top-btn-rotate").onclick = rotateCarousel
    //util.$("#bottom-btn-rotate").onclick = rotateCarousel
}


function rotateCarousel(ev){
    let select = ev.target.previousSibling;
    let numChildren = select.children.length;
    let blockWrap = select.parentElement.nextSibling;

    //if topic is in-focus
    if (topicInFocus){
        // rotate
        select.selectedIndex = (select.selectedIndex + 1) % numChildren
    }else{
        select.selectedIndex = 0;
    }
    for(let i=0; i< blockWrap.children.length; i++){
        if (i == select.selectedIndex){
            util.flex(blockWrap.children[i]);
        } else {
            util.hide(blockWrap.children[i]);
        }
    }
}

function renderLayout(){
    console.log("Rendering layout")
    let isSidePanelOn = util.hasClass("#menu-button", "menu-on");
    let sidePanel = util.$(".side-panel-container");
    let messagesPanel = util.$(".main-panel-container");

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
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blocks creation


// ---------------------------------------------------------------------------------------------------------------------------
// UI handlers

function newMessageBlockSetVisible(visible){
    let display = !!visible ? "flex" : "none";
    util.$("#new-message-container").style.display = display
}

function sendMessage(){
    console.log("Sending message...");
    let msg = util.$("#new-msg").value;
    let files = util.$('#attach-file').files;
    if (msg.length === 0 && files.length === 0){
        console.log("Empty message");
        return;
    }
    let recipient = util.$("#select-member").value;

    // pass files later
    if (!topicInFocus){
        console.error("No topic selected to write to.")
        return;
    }
    chat.sendMessage(msg, topicInFocus, recipient, files);
}


function processAttachmentChosen(ev) {
    console.log("Processing attachment chosen");
    let attachemtsWrapper = document.querySelector("#chosen-files");
    let fileData = ev.target.files[0];
    attachemtsWrapper.innerHTML = "";
    if (!fileData) {
        return;
    }

    let attachmentEl = UI.bakeFileAttachmentElement(fileData.name, clearAttachments)
    util.appendChildren(attachemtsWrapper, attachmentEl);
}


function clearAttachments() {
    let attachemtsInput = util.$("#attach-file");
    attachemtsInput.value = "";
    let attachemtsWrapper = util.$("#chosen-files");
    attachemtsWrapper.innerHTML = "";
}

function registerVault() {
    let password = util.$("#new-passwd");
    let confirm =  util.$("#confirm-passwd");
    return Vault.registerVault(password, confirm, chat.version)
}


function processActivateTopicClick(ev){
    console.error("PROCESSING activate topic click");
    let element = ev.currentTarget;
    let pkfp = element.getAttribute("pkfp");
    if (!pkfp){
        console.log("No topic in focus")
        return;
    } else if (pkfp === topicInFocus){
        deactivateTopicAsset(pkfp);
        return
    }
    console.log(`Setting topic in focus: ${pkfp}`);

    setTopicInFocus(pkfp)
    // load messges in the new window

    refreshMessages()
    if(isExpanded(pkfp)){
        refreshInvites();
        refreshParticipants();
    }

    displayTopicContextButtons("topic")
    newMessageBlockSetVisible(true);
}

function processExpandTopicClick(ev){
    ev.stopPropagation();


    console.error("PROCESSING expand topic click")
    let expandButton = ev.target;
    let topicListItem = expandButton.parentNode.parentNode
    let pkfp = topicListItem.getAttribute("pkfp")

    if(!pkfp) throw new Error(`Pkfp is not found`)
    if(pkfp !== topicInFocus){
        setTopicInFocus(pkfp);
        refreshMessages();
    }

    if(!isExpanded(pkfp)){
        // item is not expanded already
        let topicAssets = util.bake("div", {class: "topic-assets"})
        util.addAfter(topicListItem, topicAssets);
        refreshParticipants();
        refreshInvites();
    } else {
        collapseTopicAssets(pkfp);
    }

    util.toggleClass(expandButton, "btn-collapse-topic")

}


function processParticipantListItemClick(ev){
    activateTopicAsset(ev);
   
    console.log("participant list item clicked");

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
    console.log("New topic click");
    topicCreateModal.open()
}

function processDeleteTopicClick(){
    console.log("Delete topic click");
    let mngTopicList = util.$("#manage-topics-list");
    let pkfp = null;
    for(let el of mngTopicList.children){
        if (util.hasClass(el, "selected")){
            pkfp = el.getAttribute("pkfp");
            break;
        }
    }

    if(!pkfp){
        toastr.warning("Please select topic to delete.")
        return;
    }

    if (confirm(`All topic data will be deleted beyond recover for ${chat.topics[pkfp].name}!\n\nProceed?`)){
        chat.deleteTopic(pkfp);
    }
}

function processRenameTopciClick(){
    console.log("Rename topic click");
}

function processLeaveTopicClick(){
    console.log("Rename topic click");

}

function processJoinTopicClick() {
    topicJoinModal.open()
}

function processNewInviteClick() {
    if(topicInFocus){
        chat.requestInvite(topicInFocus);
    } else {
        console.log("No toipc in focus");
    }
}


function processRefreshInvitesClick() {
    console.log("Refresh invites");
}

function processCtxAliasClick(){
    console.log("Alias button clicked");
    setAliasModal.open();
}

function processCtxDeleteClick(){
    console.log("Delete click. Processing...");
    let inFocus = topicInFocus;
    let topicAsset = getActiveTopicAsset()

    if (!topicAsset){
        //delete topic
        let confirmMsg = `Topic ${inFocus} hisrory and all hidden services will be deleted. This action is irreversable. \n\nProceed?`
        if(confirm(confirmMsg)){
            chat.deleteTopic(inFocus)
            return;
        }
    }

    if(util.hasClass(topicAsset, "invite-list-item")){
        let inviteCode = topicAsset.getAttribute("code")
        console.log(`Deleting invite ${inviteCode}`)
        chat.deleteInvite(inFocus, inviteCode)
    }
}

//this is generic function for selecting active item on click from list
// idAttr is id attribute that is set during list creation
// listId is id of a list element
function createSelectorFunction(idAttr, listId){
    return function(ev){
        let list = util.$(`#${listId}`);
        for (let child of list.children){
            if (child.getAttribute(idAttr) === ev.target.getAttribute(idAttr)){
                util.addClass(child, "selected");
            } else {
                util.removeClass(child, "selected");
            }
        }
    }
}

function backToChat(){
    let topicsList = util.$("#manage-topics-view")
    //let topicsList = util.$("#manage-topics-list")
    //let topicsList = util.$("#manage-topics-list")
    //util.hide(topicsList)
    //util.hide(topicsList)
    util.hide(topicsList)
    util.flex("#main-container")
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
        appendEphemeralMessage("Login successful. Loading data...")
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
            }, pkfp, windowInFocus, true);
        }

    } else {
        console.log("Topic is inactive. Ignoring")
    }
}

// ---------------------------------------------------------------------------------------------------------------------------
// ~END Chat Event handlers


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
        chat.downloadAttachment(fileInfo, topicInFocus); //download file
        console.log("Download started");
    } catch(err){
        toastr.warning("file download unsuccessfull: " + err)
        appendEphemeralMessage(fileName + " Download finished with error: " + err)
    }finally {
        target.childNodes[0].style.display = "none";
    }
}


function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

///Testing blob download
function downloadBuffer(data, fileName) {
    appendEphemeralMessage(fileName + " Download successfull.")
    let arr = new Uint8Array(data);
    let fileURL = URL.createObjectURL(new Blob([arr]));
    downloadURI(fileURL, fileName);
}


function showCodeView(event) {
    let pre = document.createElement("pre");
    pre.innerHTML = event.target.innerHTML;
    let div = document.createElement("div");
    div.appendChild(pre);
    showModalNotification("Code:", div.innerHTML);
}



function appendEphemeralMessage(msg){
    if (!msg){
        console.log("Message is empty.")
        return
    }
    try{
        let msgEl = UI.bakeEphemeralMessage(getChatFormatedDate(new Date()), msg);
        util.$("#messages-window-1").appendChild(msgEl);
    }catch(err){
        console.log("EPHEMERAL ERROR: " + err)
    }
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

// ---------------------------------------------------------------------------------------------------------------------------
// Side panel handlers

function refreshSidePanel(){
    //get active topic
    //

}


function refreshTopics(){

    let topics = chat.getTopics();
    let topicsList = util.$("#topics-list")
    util.removeAllChildren(topicsList)
    let topicsElements = []
    Object.keys(topics).forEach(key=>{
        topicsElements.push(UI.bakeTopicListItem(topics[key], processActivateTopicClick, processExpandTopicClick))
    })
    topicsElements.sort((el)=>{ return el.innerText })
    util.appendChildren(topicsList, topicsElements)
}



function refreshInvites(){

    if (!topicInFocus && !isExpanded(topicInFocus)){
        return;
    }

    clearExpandedInvites(topicInFocus);

    let topicAssets = getTopicAssets(topicInFocus)

    let invites = chat.getInvites(topicInFocus);

    Object.keys(invites).forEach((i)=>{
        topicAssets.appendChild(UI.bakeInviteListItem(i, activateTopicAsset, copyInviteCode))
    })

}

function activateTopicAsset(ev){
    console.error("Activating topic asset");
    let activeItem = ev.currentTarget
    let assets = activeItem.parentElement;
    for(let child of assets.children){
        util.removeClass(child, "active-asset")
    }

    util.addClass(activeItem, "active-asset")
    if (util.hasClass(activeItem, "invite-list-item")){
        displayTopicContextButtons("invite")
    } else if (util.hasClass(activeItem, "participant-list-item")){
        displayTopicContextButtons("participant")
    }
}



function refreshParticipants(){
    //refresh side panel and to list
    if (!topicInFocus || !isExpanded(topicInFocus)){
        return;
    }
    clearExpandedParticipants(topicInFocus);
    let topicAssets = getTopicAssets(topicInFocus)
    let participants = chat.getParticipants(topicInFocus);

    let elements = []
    for (let pkfp of Object.keys(participants)){
        let participant = participants[pkfp]

        elements.push(UI.bakeParticipantListItem(participant.nickname,
                                                            pkfp,
                                                            participant.alias,
                                                            processParticipantListItemClick))
    }
    util.prependChildren(topicAssets, elements)
}


function refreshMessages(){
    util.removeAllChildren('#messages-window-1');

    if (!topicInFocus){
        return
    }
    chat.getMessages(topicInFocus);
}

// ---------------------------------------------------------------------------------------------------------------------------
// Topic expanded asset management

// retruns whether topic assets are expanded
function isExpanded(pkfp){
    console.log(`Checking if expanded ${pkfp}`);
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    if(selected.length === 0){
        return false
    }

    let next = util.$nextEl(selected[0]);
    return next && util.hasClass(next, "topic-assets");

}

function clearExpandedInvites(pkfp){
    if(!isExpanded(pkfp)) return;
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let assets = util.$nextEl(selected[0])
    if (!assets.firstElementChild) return
    while(util.hasClass(assets.lastElementChild, "invite-list-item")){
        util.remove(assets.lastElementChild);
    }
}

function clearExpandedParticipants(pkfp){
    if(!isExpanded(pkfp)) return;
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let assets = util.$nextEl(selected[0])
    if (!assets.firstElementChild) return
    while(util.hasClass(assets.firstElementChild, "participant-list-item")){
        util.remove(assets.firstElementChild);
    }
}


function collapseTopicAssets(pkfp){
    if(isExpanded(pkfp)){
        console.log(`Collapsing ${pkfp}`);
        let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
        util.remove(util.$nextEl(selected[0]))
    }
}

function getTopicAssets(pkfp){
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let next =  util.$nextEl(selected[0])

    if (next && util.hasClass(next, "topic-assets")){
       return next;
    }
}

function getActiveTopicAsset(){
    if (!topicInFocus || !isExpanded(topicInFocus)){
        console.log("No active assets found");
        return;
    }

    let assets = getTopicAssets(topicInFocus);
    for(let asset of assets.children){
        if (util.hasClass(asset, "active-asset")){
            return asset;
        }
    }
}

function deactivateTopicAsset(pkfp){
    let topicAssets = getTopicAssets(pkfp);
    for(let asset of topicAssets.children){
        util.removeClass(asset, "active-asset")
    }
    displayTopicContextButtons("topic")
}

// ---------------------------------------------------------------------------------------------------------------------------
// TOPIC CONTEXT BUTTONS

/**
 * displays certain context buttons on the topicsPanel.
 * state must be a string, and must have following values:
 *    "none" - hide all buttons
 *    "topic" - show Alias, Invite, Mute, Leave, Delete
 *    "invite" - show Alias, Delete
 *    "participant" - show Alias, Mute, Boot only if user has rights to boot
 * displayBoot - boolean whether user has rights to boot
 */
function displayTopicContextButtons(state, displayBoot = false){
    let alias = util.$("#btn-ctx-alias");
    let invite = util.$("#btn-ctx-invite");
    let mute = util.$("#btn-ctx-mute");
    let boot = util.$("#btn-ctx-boot");
    let _delete = util.$("#btn-ctx-delete");
    let leave = util.$("#btn-ctx-leave");

    switch(state){
        case "none":
            util.hide(alias);
            util.hide(invite);
            util.hide(mute);
            util.hide(boot);
            util.hide(_delete);
            util.hide(leave);
            break;
        case "topic":
            util.flex(alias);
            util.flex(invite);
            util.flex(mute);
            util.hide(boot);
            util.flex(_delete);
            util.flex(leave);
            break;

        case "invite":
            util.flex(alias);
            util.hide(invite);
            util.hide(mute);
            util.hide(boot);
            util.flex(_delete);
            util.hide(leave);
            break;

        case "participant":
            util.flex(alias);
            util.hide(invite);
            util.flex(mute);
            displayBoot ? util.flex(boot) : util.hide(boot)
            util.hide(_delete);
            util.hide(leave);
            break;
        default:
            throw new Error(`Invalid state: ${state}`)
    }
}



//~END SIDE PANEL HANDLERS/////////////////////////////////////////////////////


// ---------------------------------------------------------------------------------------------------------------------------
// Util

function initChat(){
    //chat = new Chat({version: version})
    chat = new Chat({version: "2.0.0"})
    chat.on(Events.LOGIN_ERROR, processLoginResult)
    chat.on(Events.LOGIN_SUCCESS, processLoginResult)
    chat.on(Events.POST_LOGIN_SUCCESS, ()=>{
        appendEphemeralMessage("Topics have been loaded and decrypted successfully.")
    })
    chat.on(Events.TOPIC_CREATED, ()=>{
        refreshTopics()
        toastr.success("New topic has been initialized!")
    })

    chat.on(Events.TOPIC_JOINED, (data)=>{
        console.log(`Topic joined: ${data}`)
        refreshTopics()
    })

    chat.on(Events.TOPIC_DELETED, (pkfp)=>{
        refreshTopics()
        toastr.info(`Topic ${pkfp.substring(0, 5)}... has been deleted.`)
    })

    chat.on(Events.INIT_TOPIC_ERROR, (err)=>{
        toastr.warning(`Init topic error: ${err.message}`);
    })

    chat.on(Events.MESSAGES_LOADED, (data)=>{
        processMessagesLoaded(data.pkfp, data.messages)
    })

    chat.on(Events.INVITE_CREATED, (data)=>{
        console.log("Invite created event from chat");
        if (data.pkfp === topicInFocus){
            refreshInvites();
        }
    })

    chat.on(Events.METADATA_UPDATED, (pkfp)=>{
        console.log("Metadata updated event from chat");
        refreshTopics();
    })

    chat.on(Events.NEW_CHAT_MESSAGE, (message, topicPkfp)=>{
        console.log(`New incoming chat message received for ${topicPkfp}`)

        if (topicInFocus !== topicPkfp){
            console.log("Topic not in focus")
            return
        }

        console.log("Appending message");
        appendMessageToChat({
            nickname: message.header.nickname,
            alias: "alias",//alias,
            body: message.body,
            timestamp: message.header.timestamp,
            pkfp: message.header.author,
            messageID: message.header.id,
            service: message.header.service,
            private: message.header.private,
            recipient: message.header.recipient,
            attachments: message.attachments
        }, topicInFocus, util.$("#messages-window-1"));
    })

    chat.on(Events.DOWNLOAD_SUCCESS, (data, fileName)=>{
        downloadBuffer(data, fileName);
    })

    chat.on(Events.DOWNLOAD_FAIL, (err)=>{
        console.log(`Download error received from chat: ${err}`);
        appendEphemeralMessage(`Download error: ${err}`);
    })

    //DEBUGGING! Comment out for production;
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

function padWithZeroes(requiredLength, value) {
    let res = "0".repeat(requiredLength) + String(value).trim();
    return res.substr(res.length - requiredLength);
}


function copyInviteCode(event) {
    let inviteElement = event.currentTarget;
    let inviteID = inviteElement.getAttribute("code");
    let textArea = document.createElement("textarea");
    textArea.value = inviteID;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        toastr.info("Invite code was copied to the clipboard");
    } catch (err) {
        toastr.error("Error copying invite code to the clipboard");
    }
    textArea.remove();
}

// ---------------------------------------------------------------------------------------------------------------------------
// ~END util
