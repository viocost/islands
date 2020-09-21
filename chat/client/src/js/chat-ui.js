import * as util from "./lib/dom-util";
import * as UI from "./lib/ChatUIFactory";
import { BlockingSpinner } from "./lib/BlockingSpinner";
import toastr from "./lib/toastr";
import { ChatClient as Chat, ChatClient } from "./lib/ChatClient";
import { Events, Internal } from "../../../common/Events";
import "../css/chat.sass"
import "../css/vendor/loading.css";
import * as CuteSet from "cute-set";
import { Topic } from "./lib/Topic";
import { TopicRetriever } from "./lib/TopicRetriever";
import { TopicCreator } from "./lib/TopicCreator";
import { ChatUtility } from "./lib/ChatUtility";
import { Vault } from "./lib/Vault";
import { VaultRetriever } from "./lib/VaultRetriever"
import { TopicJoinAgent } from "./lib/TopicJoinAgent";
import { ConnectionIndicator } from  "./ui/ConnectionIndicator";
import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { PostLoginInitializer } from "./lib/PostLoginInitializer"
import { ConnectorAbstractFactory } from "../../../common/Connector"
import { IslandsVersion } from "../../../common/Version";
//import { runConnectorTest } from "./test/connector"
// TEMP IMPORTS FOR FURTHER REFACTORING
import { iCrypto } from "../../../common/iCrypto";
import * as MainView from "./MainView";
import { StateMachine } from "../../../common/AdvStateMachine";


// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760; // Width screen in pixels considered to be small
const XSMALL_WIDTH = 400;
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = ["#cfeeff", "#ffcc7f", "#b5ffc0", "#ccfffb", "#67fcf0", "#f8e6ff", "#ffe6f1", "#ccefff", "#ccf1ff"]
// ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections and modal forms
let spinner = new BlockingSpinner();
let topicCreateModal;
let topicJoinModal;
let setAliasModal;
let newMessageBlock; // container with new message inputs and elements
let messagesPanel;   // messages container
let sidePanel;
let connectionIndicator;
// ---------------------------------------------------------------------------------------------------------------------------
// Objects

//Top tier objects
let connector;
let arrivalHub;
let chat = null//new ChatClient();
let vaultHolder = null;
let topics = {};
let metadata = {};


// Sounds will be loaded here
let sounds = {}

//version
let version;

//Opened views stack for navigation
const viewStack = []
// Topic that is in the focused window
// New messages are sent in context of this topic
// Members and invites are displayed in context of this topic
// Its title displayed in the header
// Settings displayed in context of this topic
let topicInFocus;
window.getTopicInFocus = () => { console.log(topicInFocus) };

// Topics that are in the split windows and display messages
let activeTopics;

//uploading state to handle concurrent messages sending
let uploadingState = false;

//Counters for unread messages
const unreadCounters = {}

let UIInitialized = false;

let UISM = prepareUIStateMachine()

// ---------------------------------------------------------------------------------------------------------------------------
// TEST ONLY!
// Comment out for production!
window.util = util;
window.toastr = toastr;
window.chat = chat;
window.spinner = spinner;
window.chatutil = ChatUtility;
window.vaultHolder = vaultHolder;
window.topics = topics;
// ---------------------------------------------------------------------------------------------------------------------------
// 
// ~END TEST

document.addEventListener('DOMContentLoaded', event => {
    IslandsVersion.setVersion(islandsVersion())
    console.log(`Islands version is ${IslandsVersion.getVersion()}`);
    isRegistration() ? UISM.handle.toRegistration() : UISM.handle.toLogin()
    return;
//    initChat();
//    initLoginUI();
});

function initRegistration(){
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        console.log("Registration handler");
    })

    util.appendChildren("#main-container", registrationBlock)

}

function initLogin(){
    console.log("Initializing login agent");
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
    let loginBlock = UI.bakeLoginBlock(initSession.bind(null, loginAgent))
    util.appendChildren("#main-container", loginBlock)
    version = islandsVersion()
}



//Called after successful login
function initUI(vaultHolder) {
    let vault = vaultHolder.getVault();
    let header = util.$("header")

    let isSoundOn = !vault.hasOwnProperty("settings") ||
        !vault.settings.hasOwnProperty("sound") ||
        vault.settings.sound;
    util.removeAllChildren(header);

    util.appendChildren(header, [
        UI.bakeHeaderLeftSection((menuButton) => {
            util.toggleClass(menuButton, "menu-on");
            renderLayout()
        }),
        UI.bakeHeaderRightSection(false, isSoundOn, processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
    ])

    let main = util.$("main")
    util.removeAllChildren(main);

    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, mainContainer)
    sidePanel = UI.bakeSidePanel(chat.version);
    newMessageBlock = UI.bakeNewMessageControl(sendMessage, processAttachmentChosen);
    messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);
    setupSidePanelListeners()
    setupHotkeysHandlers()
    refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;
    renderLayout()

    // modals
    topicCreateModal = UI.bakeTopicCreateModal(createTopic)


    topicJoinModal = UI.bakeTopicJoinModal(() => {
        console.log("Joining topic")
        let nickname = util.$("#join-topic-nickname").value;
        let topicName = util.$("#join-topic-name").value;
        let inviteCode = util.$("#join-topic-invite-code").value;
        if (!nickname || !topicName || !inviteCode) {
            toastr.warning("All fields are required");
            return;
        }
        joinTopic(nickname, topicName, inviteCode);
        toastr.info("Attempting to join topic");
        topicJoinModal.close();
    })


    setAliasModal = UI.bakeSetAliasModal(() => {
        console.log("Ok handler")
        let newAliasEl = util.$("#modal-alias-input")
        let newAlias = newAliasEl.value
        let subject = JSON.parse(newAliasEl.getAttribute("rename-data"))
        switch (subject.type) {
            case "topic":
                console.log("Renaming topic")
                chat.renameTopic(subject.topicPkfp, newAlias)
                break
            case "participant":
                console.log("Renaming participant")
                if (subject.pkfp === subject.topicPkfp) {
                    //change nickname
                    chat.changeNickname(subject.topicPkfp, newAlias)
                } else {
                    //change alias of another member
                    chat.setParticipantAlias(subject.topicPkfp, subject.pkfp, newAlias);
                }
                break
            case "invite":
                console.log("Renaming invite")
                chat.setInviteAlias(subject.topicPkfp, subject.code, newAlias);
                break
        }
        setAliasModal.close();
    })
    // prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "main-panel-container");


    util.$("#remove-private").addEventListener("click", removePrivate);
    util.$("#messages-panel-container").onscroll = processChatScroll;
    UIInitialized = true;
}

function setupHotkeysHandlers() {

    util.$('#new-msg').onkeypress = function(e) {
        if (!e.ctrlKey && e.keyCode === 13) {
            event.preventDefault();
            sendMessage();
            //moveCursor(e.target, "start");
            return false;
        } else if (e.ctrlKey && (e.keyCode === 10 || e.keyCode === 13)) {
            e.target.value += "\n";
            moveCursor(e.target, "end");
        }
    };
}

function setupSidePanelListeners() {

    util.$("#btn-new-topic").onclick = processNewTopicClick;
    util.$("#btn-join-topic").onclick = processJoinTopicClick;

    util.$("#btn-ctx-invite").onclick = processNewInviteClick;
    util.$("#btn-ctx-delete").onclick = processCtxDeleteClick;
    util.$("#btn-ctx-alias").onclick = processCtxAliasClick;
    util.$("#btn-ctx-boot").onclick = processCtxBootClick;

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


function rotateCarousel(ev) {
    let select = ev.target.previousSibling;
    let numChildren = select.children.length;
    let blockWrap = select.parentElement.nextSibling;

    //if topic is in-focus
    if (topicInFocus) {
        // rotate
        select.selectedIndex = (select.selectedIndex + 1) % numChildren
    } else {
        select.selectedIndex = 0;
    }
    for (let i = 0; i < blockWrap.children.length; i++) {
        if (i == select.selectedIndex) {
            util.flex(blockWrap.children[i]);
        } else {
            util.hide(blockWrap.children[i]);
        }
    }
}

function createTopic() {
        console.log("Creating topic")
        let nickname = util.$("#new-topic-nickname").value;
        let topicName = util.$("#new-topic-name").value;
        if (!nickname || !topicName) {
            toastr.warning("All fields are required");
            return;
        }
        let topicCreator = new TopicCreator(nickname, topicName, connector, vaultHolder);
        topicCreator.run()

        toastr.info("Topic is being created")
        topicCreateModal.close()
}


function renderLayout() {
    console.log("Rendering layout")
    let isSidePanelOn = util.hasClass("#menu-button", "menu-on");
    let sidePanel = util.$(".side-panel-container");
    let messagesPanel = util.$(".main-panel-container");
    let connectionIndicatorLabel = util.$("#connection-indicator-label")


    if (isSidePanelOn) {
        if (window.innerWidth <= SMALL_WIDTH) {
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

    ///////////////////////////////////////////////
    // window.innerWidth <= XSMALL_WIDTH ?       //
    //     util.hide(connectionIndicatorLabel) : //
    //     util.flex(connectionIndicatorLabel)   //
    ///////////////////////////////////////////////


}


// ---------------------------------------------------------------------------------------------------------------------------
//
// Page blocks creation
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blocks creation


// ---------------------------------------------------------------------------------------------------------------------------
// UI handlers

function newMessageBlockSetVisible(visible) {
    let display = !!visible ? "flex" : "none";
    util.$("#new-message-container").style.display = display
}

function sendMessage() {
    console.log("Sending message...");
    // pass files later
    if (!topicInFocus) {
        console.error("No topic selected to write to.")
        return;
    }

    let topic = topics[topicInFocus]

    let msgEl = util.$("#new-msg");
    let msg = msgEl.value
    let filesEl = util.$('#attach-file')
    if (msg.length === 0 && filesEl.files.length === 0) {
        console.log("Empty message");
        return;
    }

    let recipient = util.$("#private-label").children[2].getAttribute("pkfp");


    if (!uploadingState && filesEl.files.length > 0) {
        //sending with files
        console.log("Sending with files");
        setUploadingState(true)
        chat.sendMessage(msg,
            topicInFocus,
            recipient,
            filesEl.files,
            clearAttachments);
    } else {
        //sending text only

        console.log("Sending just text");
        chat.sendMessage(msg, topicInFocus, recipient)
    }
    msgEl.value = ""
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
    console.log("Clearing attachments");
    let attachemtsInput = util.$("#attach-file");
    attachemtsInput.value = "";
    let attachemtsWrapper = util.$("#chosen-files");
    attachemtsWrapper.innerHTML = "";
    setUploadingState(false);
}

function setUploadingState(uploading) {
    let anim = util.$("#uploading-animation");
    let attachButton = util.$("#attach-file-button");
    uploading ? util.flex(anim) : util.hide(anim)
    uploading ? util.hide(attachButton) : util.flex(attachButton)
    uploadingState = uploading;
}


//registration
function registerVault() {
    let password = util.$("#new-passwd");
    let confirm = util.$("#confirm-passwd");
    if (/^((?:[0-9]{1,3}\.){3}[0-9]{1,3}|localhost)(\:[0-9]{1,5})?$/.test(document.location.host)) {
        console.log("Registering admin vault");
        Vault.registerAdminVault(password, confirm, chat.version)
            .then(afterVaultRegistration)
            .catch(err => {
                toastr.error(err.message)
            })
            .finally(loadingOff)

    } else if (ChatUtility.isOnion(document.location.host)) {
        console.log("Registering guest vault");
        return Vault.registerVault(password, confirm, chat.version)
        
    } else {
        throw new Error("Unrecognized host!")
    }
}

function afterVaultRegistration(){
    let mainContainer = util.$('#main-container');
    util.removeAllChildren(mainContainer);
    util.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(() => {
        document.location.reload()
    }))
}


function processActivateTopicClick(ev) {
    removePrivate();
    let element = ev.currentTarget;
    let pkfp = element.getAttribute("pkfp");
    if (!pkfp) {
        console.log("No topic in focus")
        return;
    } else if (pkfp === topicInFocus) {
        deactivateTopicAsset(pkfp);
        return
    }
    console.log(`Setting topic in focus: ${pkfp}`);

    setTopicInFocus(pkfp)
    let topic = topics[pkfp]
    let privatePkfp = topic.getPrivate()
    if (privatePkfp) {
        enablePrivate(pkfp, privatePkfp, `${topic.getParticipantNickname(privatePkfp)}`);
    } else {
        removePrivate()
    }
    // load messges in the new window

    refreshMessagesWithCb(pkfp, (messages) => {
        if (!messages) {
            console.log(`No messages in the topics: ${pkfp}`);
            chat.once(Events.MESSAGES_LOADED, () => {
                console.log("ONCE HANDLER FIRED");
                setTimeout(() => {
                    scrollChatDown(true)
                }, 500);
            })
            return;
        }
        processMessagesLoaded(pkfp, messages, () => {
            scrollChatDown(true)
        })
    })
    if (isExpanded(pkfp)) {
        refreshInvites(pkfp);
        refreshParticipants(pkfp);
    }

    displayTopicContextButtons("topic")

}

function processExpandTopicClick(ev) {
    ev.stopPropagation();

    let expandButton = ev.target;
    let topicListItem = expandButton.parentNode.parentNode
    let pkfp = topicListItem.getAttribute("pkfp")

    if (!pkfp) throw new Error(`Pkfp is not found`)
    if (pkfp !== topicInFocus) {
        setTopicInFocus(pkfp);
        refreshMessages();
    }

    if (!isExpanded(pkfp)) {
        // item is not expanded already
        expandTopic(topicListItem)
    } else {
        collapseTopic(topicListItem);
    }

    refreshParticipants(pkfp);
    refreshInvites(pkfp);
}


function collapseTopic(topicListItem) {
    let pkfp = topicListItem.getAttribute("pkfp");
    let expandCollapseButton = topicListItem.firstChild.firstChild;
    if (isExpanded(pkfp)) {
        console.log(`Collapsing ${pkfp}`);
        let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
        util.remove(util.$nextEl(selected[0]))
    }

    util.removeClass(expandCollapseButton, "btn-collapse-topic")

}

function expandTopic(topicListItem) {
    let expandCollapseButton = topicListItem.firstChild.firstChild;
    let topicAssets = util.bake("div", { class: "topic-assets" })
    util.addAfter(topicListItem, topicAssets);
    util.addClass(expandCollapseButton, "btn-collapse-topic")
}


function processParticipantListItemClick(ev) {
    activateTopicAsset(ev);
    console.log("participant list item clicked");
}

function processParticipantListItemDoubleClick(ev) {

    let el = ev.currentTarget;
    let topicPkfp = el.parentNode.previousSibling.getAttribute("pkfp")
    console.log("Double click participant event fired!");
    enablePrivate(topicPkfp, el.getAttribute("pkfp"), el.children[1].innerHTML)

}

function enablePrivate(topicPkfp, pkfp, name) {
    if (topicPkfp !== topicInFocus) {
        setTopicInFocus(topicPkfp);
        refreshMessages();
    }
    let privateBlock = util.$("#private-label")
    privateBlock.children[2].setAttribute("pkfp", pkfp)
    privateBlock.children[2].innerHTML = name;
    util.flex(privateBlock);
}

function removePrivate() {
    console.log("Removing private");
    let privateBlock = util.$("#private-label")
    privateBlock.children[2].removeAttribute("pkfp")
    privateBlock.children[2].innerText = ""
    util.hide(privateBlock);
}

function setTopicInFocus(pkfp) {
    topicInFocus = pkfp
    for (let el of util.$("#topics-list").children) {
        if (el.getAttribute("pkfp") === pkfp) {
            util.addClass(el, "topic-in-focus");
            //Here set the name for active topic in header

        } else {
            util.removeClass(el, "topic-in-focus");
        }
    }


    util.text("#topic-in-focus-label", `Topic: ${topics[pkfp].name}`)
    newMessageBlockSetVisible(topicInFocus);
    resetUnreadCounter(pkfp);
}

function processMuteClick() {
    console.log("Mute clicked");
    chat.toggleSound();
}

function processSettingsClick() {
    console.log("Settings clicked");
    if (util.isShown("#main-container")) {
        util.hide("#main-container")
        util.flex("#settings-container")
    } else {
        util.flex("#main-container")
        util.hide("#settings-container")
    }
}

function processLogoutClick() {
    console.log("Logout clicked");
    document.location.reload(true);
}

function processAdminLoginClick() {
    console.log("admin login clicked");
}

function processInfoClick() {
    alert("Islands v2.0.0")
}

function processNewTopicClick() {
    console.log("New topic click");
    topicCreateModal.open()
}

function processDeleteTopicClick() {
    console.log("Delete topic click");
    let mngTopicList = util.$("#manage-topics-list");
    let pkfp = null;
    for (let el of mngTopicList.children) {
        if (util.hasClass(el, "selected")) {
            pkfp = el.getAttribute("pkfp");
            break;
        }
    }

    if (!pkfp) {
        toastr.warning("Please select topic to delete.")
        return;
    }

    if (confirm(`All topic data will be deleted beyond recover for ${topics[pkfp].name}!\n\nProceed?`)) {
        chat.deleteTopic(pkfp);
    }
}

function processRenameTopciClick() {
    console.log("Rename topic click");
}

function processLeaveTopicClick() {
    console.log("Rename topic click");

}

function processJoinTopicClick() {
    topicJoinModal.open()
}

function processNewInviteClick() {
    if (topicInFocus) {
        chat.requestInvite(topicInFocus);
    } else {
        console.log("No toipc in focus");
    }
}


function processRefreshInvitesClick() {
    console.log("Refresh invites");
}

function processCtxAliasClick() {
    console.log("Alias button clicked");
    //Rename topc, or member or invite

    if (!topicInFocus) {
        console.log("Nothing to rename")
        return;
    }

    let title = util.$("#modal-alias-title")
    let forLabel = util.$("#modal-alias-for-label")
    let aliasInput = util.$("#modal-alias-input")

    let subject = {}

    subject.topicPkfp = topicInFocus;
    let asset = getActiveTopicAsset()
    if (asset) {
        // Setting alias either for participant or invite
        if (util.hasClass(asset, "invite-list-item")) {
            // For invite
            subject.type = "invite"
            subject.code = asset.getAttribute("code")
            util.text(title, "New alias")
            util.text(forLabel, `For invite: ${asset.getAttribute("code").substring(117, 140)}...`)
            aliasInput.setAttribute("placeholder", "Enter new alias")
        } else if (util.hasClass(asset, "participant-list-item")) {
            // For participant
            let pkfp = asset.getAttribute("pkfp");

            subject.type = "participant"
            subject.pkfp = pkfp
            if (pkfp === topicInFocus) {
                //Changing my nickname
                util.text(title, "Change my nickname")
                util.text(forLabel, "")
                aliasInput.setAttribute("placeholder", "Enter new nickname")
            } else {
                //Alias for another participant
                util.text(title, "New alias")
                util.text(forLabel, `For ${topics[topicInFocus].getParticipantNickname(pkfp)}(${pkfp.substring(0, 32)}...)`)
                aliasInput.setAttribute("placeholder", "Enter new alias")
            }
        } else {
            //error
            console.log("Unknown topic asset!")
            return;
        }
    } else {
        //Renaming topic in vault
        subject.type = "topic"
        util.text(title, `Rename topic "${chat.getTopicName(topicInFocus)}"`)
        util.text(forLabel, `(${topicInFocus.substring(0, 32)}...)`)
        aliasInput.setAttribute("placeholder", "Enter new topic name")
    }

    aliasInput.setAttribute("rename-data", JSON.stringify(subject));
    setAliasModal.open();
}

function processCtxBootClick() {
    console.log("booting participant")
    let topicPkfp = topicInFocus;
    let asset = getActiveTopicAsset()
    let participantPkfp = asset.getAttribute("pkfp")
    chat.bootParticipant(topicPkfp, participantPkfp)

}

function processCtxDeleteClick() {
    console.log("Delete click. Processing...");
    let inFocus = topicInFocus;
    let topicAsset = getActiveTopicAsset()

    if (!topicAsset) {
        //delete topic
        let confirmMsg = `Topic ${inFocus} hisrory and all hidden services will be deleted. This action is irreversable. \n\nProceed?`
        if (confirm(confirmMsg)) {
            chat.deleteTopic(inFocus)
            return;
        }
    }

    if (util.hasClass(topicAsset, "invite-list-item")) {
        let inviteCode = topicAsset.getAttribute("code")
        console.log(`Deleting invite ${inviteCode}`)
        chat.deleteInvite(inFocus, inviteCode)
    }
}

//this is generic function for selecting active item on click from list
// idAttr is id attribute that is set during list creation
// listId is id of a list element
function createSelectorFunction(idAttr, listId) {
    return function(ev) {
        let list = util.$(`#${listId}`);
        for (let child of list.children) {
            if (child.getAttribute(idAttr) === ev.target.getAttribute(idAttr)) {
                util.addClass(child, "selected");
            } else {
                util.removeClass(child, "selected");
            }
        }
    }
}

function backToChat() {
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
function handleLoginError(stateMachine, eventName, args){
    let loginBtn = util.$("#vault-login-btn")
    loginBtn.removeAttribute("disabled");
    toastr.warning(`Login error: ${err}`)
    loadingOff()
}

function handleLoginSuccess(stateMachine, eventName, args) {
    let loginAgent = args[0]
    let vaultRaw = loginAgent.vaultRaw

    console.log("Login success handler");

    let vaultRetriever = new VaultRetriever()
    vaultRetriever.run(handleVaultReceived)


    ////
    ////settings                                //
    //vault.initializeSettings(data.settings)   //
    //this.vaultHolder = new VaultHolder(vault) //
    //console.log('decrypt success');           //
    //TODO REFACTORING REQUIRED!
    /////////////////////////////////////////////////////////////////////////////
    // chat = new ChatClient({ version: version });                            //
    // chat.vault = resVaultHolder.getVault();                                 //
    // chat.connector = connector;                                             //
    // chat.arrivalHub = arrivalHub;                                           //
    // chat.topics = topics;                                                   //
    // //end////////////////////////////////////////////////////////////////// //
    //                                                                         //
    // vaultHolder = resVaultHolder;                                           //
    //                                                                         //
    // //Load topics V1 here                                                   //
    // loadTopics(vaultHolder.getVault())                                      //
    /////////////////////////////////////////////////////////////////////////////
    //toastr.success(`You have logged in!`)
    //loadingOff()
    //return
    //vaultHolder = newVaultHolder;
    //window.vaultHolder = vaultHolder;
    //initUI(vaultHolder);
    //connectionIndicator = new ConnectionIndicator(connector)
    //appendEphemeralMessage("Topics has been loaded and decrypted successfully. ")
    //playSound("user_online");
    //loadingOff()
}

function handleVaultReceived(error, vault){
    console.log("Vault received");
    console.dir(vault);
}

function handleRegistrationError(){
   
}

function processMessagesLoaded(pkfp, messages, cb) {

    if (topicInFocus !== pkfp) {
        console.log("Topic is inactive. Ignoring")
        return;
    }

    console.log("Appending messages to view")
    let windowInFocus = getChatWindowInFocus();
    clearMessagesWindow(windowInFocus)
    for (let message of messages) {
        let alias = "";
        if (message.header.author) {
            alias = topics[pkfp].getParticipantAlias(message.header.author) ||
                message.header.author.substring(0, 8)
        }
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
    scrollChatDown()
    if (cb) cb();

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
function appendMessageToChat(message, topicPkfp, chatWindow, toHead = false) {
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
        let participantIndex = Object.keys(topics[topicPkfp].participants).indexOf(message.pkfp)
        msg.style.color = colors[participantIndex % colors.length];
        message_heading.appendChild(author);
    }

    if (message.private) {
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
        nickname.innerText = `${nickname.innerText} (me)`
        message_heading.appendChild(nickname);
        message_heading.appendChild(time_stamp);
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

    if (message.private) {
        let privateMark = preparePrivateMark(message, topics[topicPkfp]);
        message_heading.appendChild(privateMark);
    }

    return message_heading;
}

function preparePrivateMark(message, topic) {
    let text = "(private)"
    if (message.pkfp === topic.pkfp) {
        let nickname = topics[topic.pkfp].getParticipantNickname(message.recipient);
        let alias = topics[topic.pkfp].getParticipantAlias(message.recipient) || message.recipient.substring(0, 8);
        text = `(private to: ${alias} -- ${nickname})`;
    }

    return util.bake("span", {
        class: "private-mark",
        text: text
    })
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

    let getAttachmentSize = function(size) {
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

        iconImage.src = "/img/file.svg";
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
        let pars = []
        for (let p of text.split("\n")) {
            result.appendChild(util.bake("p", {
                children: document.createTextNode(p)
            }));
        }
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
 * Processes and styles code block
 *
 */
function processCodeBlock(code) {
    code = code.trim();
    let separator = code.match(/\r?\n/) ? code.match(/\r?\n/)[0] : "\r\n";
    let lines = code.split(/\r?\n/);
    let min = Infinity;
    for (let i = 1; i < lines.length; ++i) {
        if (lines[i] === "") continue;
        try {
            min = Math.min(lines[i].match(/^\s+/)[0].length, min);
        } catch (err) {
            //found a line with no spaces, therefore returning the entire block as is
            return lines.join(separator);
        }
    }
    for (let i = 1; i < lines.length; ++i) {
        lines[i] = lines[i].substr(min);
    }
    return lines.join(separator);
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
    } catch (err) {
        toastr.warning("file download unsuccessfull: " + err)
        appendEphemeralMessage(fileName + " Download finished with error: " + err)
    } finally {
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



function appendEphemeralMessage(msg) {
    let messagesWindow = util.$("#messages-window-1")
    if (!msg) {
        console.log("Message is empty.")
        return
    }
    try {
        let msgEl = UI.bakeEphemeralMessage(getChatFormatedDate(new Date()), msg);
        messagesWindow.appendChild(msgEl);
    } catch (err) {
        console.log("EPHEMERAL ERROR: " + err)
    }
    scrollChatDown()
}
//~END MESSAGES RENDERING///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


function processChatScroll(event) {
    let chatWindow = event.target;
    if (!chatWindow.firstChild) return;
    if (event.target.scrollTop <= 1 && topicInFocus) {
        //load more messages
        console.log("loading more messages");
        chat.loadMoreMessages(topicInFocus);
    }
}

function getChatWindowInFocus() {
    return util.$("#messages-window-1");
}

function scrollChatDown(force) {

    let el = util.$('#messages-panel-container')
    if (force || el.scrollHeight - el.scrollTop - el.offsetHeight <= Math.floor(el.offsetHeight / 2)) {
        console.log("Scrolling down");
        el.scrollTop = el.scrollHeight;
    }
}

function clearMessagesWindow(msgWindow) {
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

function refreshSidePanel() {
    //get active topic
    //

}


function refreshTopics() {
    let topicsList = util.$("#topics-list")
    let topicsListItems = topicsList.querySelector("li");
    let expandedTopics = topicsListItems ? new CuteSet(Array.prototype.map.call(topicsListItems,
        el => { return el.getAttribute("pkfp") }).filter(pkfp => {
            return isExpanded(pkfp);
        })) : new CuteSet()

    util.removeAllChildren(topicsList)
    let topicsElements = []
    Object.keys(topics).forEach(key => {
        topicsElements.push(UI.bakeTopicListItem(topics[key], processActivateTopicClick, processExpandTopicClick))
    })
    topicsElements.sort((el) => { return el.innerText })
    util.appendChildren(topicsList, topicsElements)

    topicsListItems = topicsList.querySelector("li");
    if (topicsListItems) {
        Array.prototype.map.call(topicsList.querySelector("li"), el => {
            let pkfp = el.getAttribute("pkfp")
            if (expandedTopics.has(pkfp)) {
                console.log("Topic was expanded. Expanding...");
                expandTopic(el);
            }
        })
    }
}

function updateMessagesAliases(topicPkfp) {
    if (topicPkfp !== topicInFocus) {
        return
    }

    for (let message of util.$("#messages-window-1").children) {

        let authorIdEl = message.firstChild.querySelector(".m-author-id")
        let privateMarkEl = message.firstChild.querySelector(".private-mark");
        if (privateMarkEl && !authorIdEl) {
            let recipientPkfp = message.firstChild.querySelector(".m-recipient-id").innerText;
            let pAlias = topics[topicPkfp].getParticipantAlias(recipientPkfp);
            let pNickname = topics[topicPkfp].getParticipantNickname(recipientPkfp);
            privateMarkEl.innerText = `(private to: ${pAlias ? pAlias : recipientPkfp.substring(0, 8)} -- ${pNickname})`
        };

        if (!authorIdEl) continue;

        let aliasEl = message.firstChild.querySelector(".m-alias");
        let authorPkfp = authorIdEl.innerText;
        if (aliasEl) {
            let alias = topics[topicPkfp].getParticipantAlias(authorPkfp);
            aliasEl.innerText = alias ? alias : authorPkfp.substring(0, 8)
        }


    }

}

function refreshInvites(pkfp) {
    if (!isExpanded(pkfp)) {
        return
    }
    clearExpandedInvites(pkfp);

    let topicAssets = getTopicAssets(pkfp)

    let invites = topics[pkfp].getInvites();

    Object.keys(invites).forEach((i) => {
        topicAssets.appendChild(UI.bakeInviteListItem(i, activateTopicAsset, copyInviteCode, invites[i].name))
    })
}

function activateTopicAsset(ev) {
    let activeItem = ev.currentTarget
    let assets = activeItem.parentElement;
    for (let child of assets.children) {
        util.removeClass(child, "active-asset")
    }

    util.addClass(activeItem, "active-asset")
    if (util.hasClass(activeItem, "invite-list-item")) {
        displayTopicContextButtons("invite")
    } else if (util.hasClass(activeItem, "participant-list-item")) {
        displayTopicContextButtons("participant")
    }
}



function refreshParticipants(pkfp) {
    //refresh side panel and to list
    if (!isExpanded(pkfp)) {
        console.log("Topic not expanded. ");
        return;
    }
    clearExpandedParticipants(pkfp);
    let topicAssets = getTopicAssets(pkfp)
    let participants = topics[pkfp].getParticipants(pkfp);

    let elements = []
    for (let pPkfp of Object.keys(participants)) {
        let participant = participants[pPkfp]

        elements.push(UI.bakeParticipantListItem({
            nickname: participant.nickname,
            pkfp: pPkfp,
            alias: participant.alias,
            onClick: processParticipantListItemClick,
            onDClick: processParticipantListItemDoubleClick,
            isSelf: pkfp === pPkfp
        }))
    }
    util.prependChildren(topicAssets, elements)
}


function refreshMessages() {
    util.removeAllChildren('#messages-window-1');

    if (!topicInFocus) {
        return
    }

    topics[topicInFocus].getMessages(processMessagesLoaded.bind(null, topicInFocus))
}

function refreshMessagesWithCb(topicPkfp, cb) {
    topics[topicPkfp].getMessages(cb)
}
// ---------------------------------------------------------------------------------------------------------------------------
// Topic expanded asset management

// retruns whether topic assets are expanded
function isExpanded(pkfp) {
    console.log(`Checking if expanded ${pkfp}`);
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    if (selected.length === 0) {
        return false
    }

    let next = util.$nextEl(selected[0]);
    return next && util.hasClass(next, "topic-assets");

}

function clearExpandedInvites(pkfp) {
    if (!isExpanded(pkfp)) return;
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let assets = util.$nextEl(selected[0])
    if (!assets.firstElementChild) return
    while (util.hasClass(assets.lastElementChild, "invite-list-item")) {
        util.remove(assets.lastElementChild);
    }
}

function clearExpandedParticipants(pkfp) {
    if (!isExpanded(pkfp)) return;
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let assets = util.$nextEl(selected[0])
    while (assets.firstElementChild && util.hasClass(assets.firstElementChild, "participant-list-item")) {
        util.remove(assets.firstElementChild);
    }
}



function getTopicAssets(pkfp) {
    let selected = util.$$(`.side-block-data-list-item[pkfp="${pkfp}"]`)
    let next = util.$nextEl(selected[0])

    if (next && util.hasClass(next, "topic-assets")) {
        return next;
    }
}

function getActiveTopicAsset() {
    if (!topicInFocus || !isExpanded(topicInFocus)) {
        console.log("No active assets found");
        return;
    }

    let assets = getTopicAssets(topicInFocus);
    for (let asset of assets.children) {
        if (util.hasClass(asset, "active-asset")) {
            return asset;
        }
    }
}

function deactivateTopicAsset(pkfp) {
    let topicAssets = getTopicAssets(pkfp);
    if (topicAssets) {
        for (let asset of topicAssets.children) {
            util.removeClass(asset, "active-asset")
        }
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
function displayTopicContextButtons(state, displayBoot = false) {
    let alias = util.$("#btn-ctx-alias");
    let invite = util.$("#btn-ctx-invite");
    let mute = util.$("#btn-ctx-mute");
    let boot = util.$("#btn-ctx-boot");
    let _delete = util.$("#btn-ctx-delete");
    let leave = util.$("#btn-ctx-leave");

    switch (state) {
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
            util.hide(mute);
            util.hide(boot);
            util.flex(_delete);
            util.hide(leave);
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
            util.flex(boot);
            util.hide(_delete);
            util.hide(leave);
            break;
        default:
            throw new Error(`Invalid state: ${state}`)
    }
}



//~END SIDE PANEL HANDLERS/////////////////////////////////////////////////////


// ---------------------------------------------------------------------------------------------------------------------------
// SOUNDS


function loadSounds() {
    let sMap = {
        "incoming_message": "message_incoming.mp3",
        "message_sent": "message_sent.mp3",
        "user_online": "user_online.mp3"
    };

    for (let s of Object.keys(sMap)) {
        sounds[s] = new Audio("/sounds/" + sMap[s]);
        sounds[s].load();
    }
}

function playSound(sound) {
    let vault = vaultHolder.getVault();
    let soundOn = !vault.hasOwnProperty("settings") ||
        !vault.settings.hasOwnProperty("sound") ||
        vault.settings.sound

    if (soundOn) {
        sounds[sound].play();
    }
}

//END SOUNDS///////////////////////////////////////////////////////////////////

// ---------------------------------------------------------------------------------------------------------------------------
// Util

function initChat() {
    //chat = new Chat({version: version})

    chat = new Chat({ version: util.$("#islands-version").value })
    //chat = new Chat({version: "2.0.28"})

    chat.on(Events.LOGIN_ERROR, err=> processLoginResult(null, err))
    chat.on(Events.LOGIN_SUCCESS, processLoginResult)
    chat.on(Events.POST_LOGIN_SUCCESS, () => {
    })

    chat.on(Events.SOUND_STATUS, (status) => {
    })

    chat.on(Events.TOPIC_JOINED, (data) => {
        console.log(`%c YOU JOINED TOPIC: ${data.pkfp}`, "color: green; font-size: 20px");
        setTopicListeners(data.pkfp)
        appendEphemeralMessage(`You have joined topic ${data.pkfp}`)
        refreshTopics()
    })

    chat.on(Events.TOPIC_DELETED, (pkfp) => {
        refreshTopics()
        toastr.info(`Topic ${pkfp.substring(0, 5)}... has been deleted.`)
    })


    chat.on(Events.VAULT_UPDATED, () => {
        console.log("Vault updated in UI");
        refreshTopics()
        if (topicInFocus) setTopicInFocus(topicInFocus)
    })

    chat.on(Events.INIT_TOPIC_ERROR, (err) => {
        toastr.warning(`Init topic error: ${err.message}`);
    })




    chat.on(Events.DOWNLOAD_SUCCESS, (data, fileName) => {
        downloadBuffer(data, fileName);
    })

    chat.on(Events.DOWNLOAD_FAIL, (err) => {
        console.log(`Download error received from chat: ${err}`);
        appendEphemeralMessage(`Download error: ${err}`);
    })



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // chat.on(Events.NICKNAME_CHANGED, (data)=>{                                                                                             //
    //     appendEphemeralMessage(`Participant ${data.participantPkfp} changed his nickname from ${data.oldNickname} to ${data.newNickname}`) //
    // })                                                                                                                                     //
    //                                                                                                                                        //
    // chat.on(Events.PARTICIPANT_ALIAS_CHANGED, (data)=>{                                                                                    //
    //                                                                                                                                        //
    //     appendEphemeralMessage(`Alias changed for participant ${data.participantPkfp} from ${data.oldAlias} to ${data.newAlias}`)          //
    // })                                                                                                                                     //
    //                                                                                                                                        //
    // chat.on(Events.INVITE_ALIAS_CHANGED, (data)=>{                                                                                         //
    //                                                                                                                                        //
    //     appendEphemeralMessage(`Alias changed for invite ${data.invite} from ${data.oldAlias} to ${data.newAlias}`)                        //
    // })                                                                                                                                     //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //DEBUGGING! Comment out for production;
    window.chat = chat;
}


// ---------------------------------------------------------------------------------------------------------------------------
// REFACTORING LOGIN

function initSession(loginAgent) {
    console.log("Init session called");
    loadingOn()
    let loginBtn = util.$("#vault-login-btn")
    loginBtn.setAttribute("disabled", true);
    let passwordEl = util.$("#vault-password");

    loginAgent.acceptPassword(passwordEl.value);
    loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, ()=>{
        loadingOff()
        loginBtn.removeAttribute("disabled");
        passwordEl.value = ""
        toastr.warning("Invalid password. Try again.")


    })

    loginAgent.on(LoginAgentEvents.SUCCESS, (session, vault)=>{
        console.log("Login agent succeeded. continuing initialization");
        let postLoginInitializer = new PostLoginInitializer(session, vault)
        postLoginInitializer.run();
        //init vault
    })

}

function joinTopic(nickname, topicName, inviteString) {
    let vault = vaultHolder.getVault()
    let topicJoinAgent = new TopicJoinAgent(nickname, topicName, inviteString, arrivalHub, connector, vault);

    topicJoinAgent.on(Internal.JOIN_TOPIC_SUCCESS, (data)=>{
        // data is object: { pkfp: pkfp, nickname: nickname }
        console.log("Topic join successful");
        let topic = vault.topics[data.pkfp]
        topics[data.pkfp] = topic
        setTopicListeners(topic)
        refreshTopics();
    })
    topicJoinAgent.on(Internal.JOIN_TOPIC_FAIL, ()=>{ console.log("Join topic fail received from the agent")})
    topicJoinAgent.start()
}




function setVaultListeners(vault) {
    vault.on(Events.TOPIC_CREATED, (pkfp) => {

        if(!(pkfp in vault.topics)){
            console.error("%c NEW TOPIC NOT ADDED!", "color: red; font-size: 20px")
        }

        topics[pkfp] = vault.topics[pkfp];
        setTopicListeners(topics[pkfp]);
        refreshTopics()
        toastr.success("New topic has been initialized!")
    })

    vault.on(Internal.TOPIC_DELETED, (pkfp) => {
        refreshTopics()
        toastr.info(`Topic ${pkfp.substring(0, 5)}... has been deleted.`)
    })


    vault.on(Events.VAULT_UPDATED, () => {
        console.log("Vault updated in chat client");
        refreshTopics()
        if (topicInFocus) setTopicInFocus(topicInFocus)
        processVaultSettingsUpdate(vault)
    })

    vault.on(Internal.VAULT_SETTINGS_UPDATED, ()=>processVaultSettingsUpdate(vault))

    vault.on(Internal.VAULT_FORMAT_UPDATED, ()=>processVaultFormatUpdated(vault))
}

function processVaultFormatUpdated(vault){
    toastr.success("Vault format has been updated.")
}

function processVaultSettingsUpdate(vault){
    let src = vault.isSoundOn() ? "/img/sound-on.svg" : "/img/sound-off.svg";
    util.$("#sound-control").setAttribute("src", src)
}

function setTopicListeners(topic) {
    topic.on(Events.MESSAGES_LOADED, (messages) => {
        processMessagesLoaded(topic.pkfp, messages)
    })

    topic.on(Events.INVITE_CREATED, (inviteCode) => {

        console.log("Invite created event from chat");
        if (topic.pkfp === topicInFocus) {
            refreshInvites(topic.pkfp);
            appendEphemeralMessage(`New Invite Code: ${inviteCode}`)
        }
    })

    topic.on(Events.NEW_CHAT_MESSAGE, (message) => {

        console.log(`New incoming chat message received for ${topic.pkfp}`)

        if (!message.header.service) {
            if (message.header.author === topic.pkfp) {
                playSound("message_sent")
            } else {

                playSound("incoming_message")
            }
        }

        if (topicInFocus !== topic.pkfp) {
            console.log("Topic not in focus")
            incrementUnreadCounter(topic.pkfp)
            return
        }

        let alias = "";
        if (message.header.author) {
            alias = topic.getParticipantAlias(message.header.author) ||
                message.header.author.substring(0, 8)
        }
        console.log("Appending message");
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
        }, topicInFocus, util.$("#messages-window-1"));

        scrollChatDown()
    })

    topic.on(Events.METADATA_UPDATED, () => {
        refreshTopics();
    })

    topic.on(Events.SETTINGS_UPDATED, () => {
        console.log("Settings updated event from chat");
        refreshParticipants(topic.pkfp);
        refreshInvites(topic.pkfp);
        updateMessagesAliases(topic.pkfp)
    })

}

/**
 * Moved to PostLoginInitializer
 */
////////////////////////////////////////////////////////////
// function postLogin(vault) {                            //
//     //sending post_login request                       //
//                                                        //
//     const message = createClientIslandEnvelope({       //
//         command: Internal.POST_LOGIN,                  //
//         pkfpSource: vault.id,                          //
//         privateKey: vault.privateKey,                  //
//         body: {                                        //
//             topics: Object.keys(topics)                //
//         }                                              //
//     })                                                 //
//                                                        //
//     vault.once(Internal.POST_LOGIN_DECRYPT, (msg) => { //
//         postLoginDecrypt(msg, vault);                  //
//     })                                                 //
//     connector.send(message);                           //
// }                                                      //
////////////////////////////////////////////////////////////


// Decrypts topic authorities' and hidden services keys
// and re-encrypts them with session key, so island can poke all services
function postLoginDecrypt(msg, vault) {
    console.log(`Got decrypt command from server.`)
    //decrypting and sending data back

    let decryptBlob = (privateKey, blob, lengthChars = 4) => {
        let icn = new iCrypto();
        let symLength = parseInt(blob.substr(-lengthChars))
        let blobLength = blob.length;
        let symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
        let cipher = blob.substring(0, blobLength - symLength - lengthChars);
        icn.addBlob("symcip", symk)
            .addBlob("cipher", cipher)
            .asym.setKey("priv", privateKey, "private")
            .asym.decrypt("symcip", "priv", "sym", "hex")
            .sym.decrypt("cipher", "sym", "blob-raw", true)
        return icn.get("blob-raw")
    };

    let encryptBlob = (publicKey, blob, lengthChars = 4) => {
        let icn = new iCrypto();
        icn.createSYMKey("sym")
            .asym.setKey("pub", publicKey, "public")
            .addBlob("blob-raw", blob)
            .sym.encrypt("blob-raw", "sym", "blob-cip", true)
            .asym.encrypt("sym", "pub", "symcip", "hex")
            .encodeBlobLength("symcip", 4, "0", "symcipl")
            .merge(["blob-cip", "symcip", "symcipl"], "res")
        return icn.get("res");
    };

    let services = msg.body.services;
    let sessionKey = msg.body.sessionKey;
    let res = {}
    for (let pkfp of Object.keys(services)) {
        let topicData = services[pkfp];
        let topicPrivateKey = topics[pkfp].privateKey;

        let clientHSPrivateKey, taHSPrivateKey, taPrivateKey;

        if (topicData.clientHSPrivateKey) {
            clientHSPrivateKey = decryptBlob(topicPrivateKey, topicData.clientHSPrivateKey)
        }

        if (topicData.topicAuthority && topicData.topicAuthority.taPrivateKey) {
            taPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taPrivateKey)
        }

        if (topicData.topicAuthority && topicData.topicAuthority.taHSPrivateKey) {
            taHSPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taHSPrivateKey)
        }

        topics[pkfp].loadMetadata(topicData.metadata);

        let preDecrypted = {};

        if (clientHSPrivateKey) {
            preDecrypted.clientHSPrivateKey =  clientHSPrivateKey
        }
        if (taPrivateKey || taHSPrivateKey) {
            preDecrypted.topicAuthority = {}
        }
        if (taPrivateKey) {
            preDecrypted.topicAuthority.taPrivateKey = taPrivateKey
        }
        if (taHSPrivateKey) {
            preDecrypted.topicAuthority.taHSPrivateKey = taHSPrivateKey
        }

        res[pkfp] = preDecrypted
    }

    console.log("Decryption is successfull.");
    let message = new Message(chat.version);
    message.setCommand(Internal.POST_LOGIN_CHECK_SERVICES)
    message.setSource(vault.getId());
    message.body.services = res;
    message.signMessage(vault.privateKey);
    vault.once(Events.POST_LOGIN_SUCCESS, processLoginResult.bind(null, vaultHolder));
    vault.once(Events.POST_LOGIN_ERROR, processLoginResult.bind(null, vaultHolder));
    vault.once(Events.LOGIN_ERROR, processLoginResult.bind(null, vaultHolder));

    connector.send(message);

}


//END REFACTORING CODE/////////////////////////////////////////////////////////


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
        toastr.info("Invite code has been copied to the clipboard");
    } catch (err) {
        toastr.error("Error copying invite code to the clipboard");
    }
    textArea.remove();
}


function incrementUnreadCounter(pkfp) {
    console.log("Incrementing unread messages counter");
    if (!unreadCounters.hasOwnProperty(pkfp)) {
        unreadCounters[pkfp] = 1
    } else {
        unreadCounters[pkfp]++;
    }
    setUnreadMessagesIndicator(pkfp, unreadCounters[pkfp])
}

function resetUnreadCounter(pkfp) {
    console.log("Resetting unread messages counter");
    unreadCounters[pkfp] = 0
    setUnreadMessagesIndicator(pkfp, unreadCounters[pkfp])
}


function setUnreadMessagesIndicator(pkfp, num) {
    console.log("Setting unread messages indicator");
    let topicEl

    for (let topic of util.$("#topics-list").children) {
        if (topic.getAttribute("pkfp") === pkfp) {
            topicEl = topic;
            break;
        }
    }
    if (!topicEl) {
        console.log(`Error: topic element with pkfp ${pkfp} is not found`);
        return
    }

    let unreadCounterLabel = topicEl.firstElementChild.children[2]

    util.html(unreadCounterLabel, "");
    num ? unreadCounterLabel.appendChild(UI.bakeUnreadMessagesElement(num)) : 1 === 1;
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
        let range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function moveCursorToStart(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = 0;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        let range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END util


function prepareUIStateMachine(){
    return new StateMachine(null, {
        name: "UI State Machine",
        stateMap: {
            start: {
                initial: true,
                transitions:{
                    toLogin: {
                        state: "login"
                    },

                    toRegistration: {
                        state: "registration"
                    }
                }
            },

            login: {
                entry: initLogin,
                transitions: {
                    loginError: {
                        actions: handleLoginError
                    },

                    loginSuccess: {
                        actions: handleLoginSuccess,
                        state: "loggedIn"
                    }


                }
            },

            registration: {
                entry: initRegistration,
                transitions: {
                    registrationError: {
                        actions: handleRegistrationError
                    },

                    registrationSuccess: {
                        state: "registrationSuccess"
                    }

                }

            },

            registrationSuccess: {
                final: true
            },

            loggedIn: {
                entry: initSession,
                transitions: {
                    disconnect: {

                    },

                    newMessage: {

                    },

                    messageSent: {

                    }

                }

            }
        }
    })
}


