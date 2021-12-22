import * as UI from "../lib/ChatUIFactory";
import { IslandsVersion } from "../../../../common/Version"
import * as domUtil from "../lib/dom-util";
import * as Common from "./Common";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { AssetActivator } from "./AssetActivator";
import { BlockingSpinner } from "../lib/BlockingSpinner";
import { Events } from "../../../../common/Events"
import * as Scroll from "../ui/Scroll";
import "../../css/chat.sass"
import "../../css/vendor/loading.css";
import toastr from "../lib/toastr";
import { TopicUXData } from "./TopicUXData"
import { TopicEvents } from "../lib/Topic"
import { Context } from "../lib/Context";
import { VaultEvents } from "../lib/Vault"
import { TabAgent } from "../lib/TabAgent"
import { SessionEvents } from "../../../../common/GenericSession"
let spinner = new BlockingSpinner();

import { SoundPlayer } from "../lib/SoundPlayer";

// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760; // Width screen in pixels considered to be small
const XSMALL_WIDTH = 400;
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = [ "#3797b7", "#b137b7", "#b73737", "#b78837", "#37b739", ]
const INITIAL_MESSAGES_LOAD = 30

// modals
let topicCreateModal;
let topicJoinModal;
let setAliasModal;

let topicInFocus;

//Here we are going to keep all info about topic messages, whethe
let uxTopics = {}

//Counters for unread messages
const unreadCounters = {}

export function initialize(messageBus){
    let mainStateMachine = prepareUIStateMachine()
    let connectorStateMachine;

    console.log("Initializing UI");

    //events
    messageBus.on(Common.UXMessage.TO_LOGIN, ()=>{
        console.log("UI TO LOGIN");
        mainStateMachine.handle.toLogin(messageBus)
    })

    messageBus.on(Common.UXMessage.TO_REGISTRATION, ()=>{
        mainStateMachine.handle.toRegistration(messageBus)
    })

}


function loadingOn() {
    spinner.loadingOn()
}

function loadingOff() {
    console.log("Turning Spinner off");
    spinner.loadingOff()
}

// Builds registration page and prepares relevant event listeners
function initRegistration(args, stateMachine){

    console.log("Initializing UX registration");
    let uxBus = args[0];

    //Routing all the event through the state machine
    uxBus.on(Common.UXMessage.REGISTER_SUCCESS, stateMachine.handle.registrationSuccess)
    uxBus.on(Common.UXMessage.REGISTER_ERROR, stateMachine.handle.registrationError);
    uxBus.on(Common.UXMessage.REGISTER_PROGRESS, (subscriptionId)=>{
        domUtil.$("#register-vault-btn").setAttribute("disabled", true)
        stateMachine.handle.start()

    })
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        let password = domUtil.$("#new-passwd");
        let confirm = domUtil.$("#confirm-passwd");
        uxBus.emit(Common.UXMessage.REGISTER_CLICK, {password: password, confirm: confirm})
    })


    domUtil.appendChildren("#main-container", registrationBlock)
}


function initLogin(args, stateMachine){
    let uxBus = args[0]

    uxBus.on(Common.UXMessage.LOGIN_PROGRESS, stateMachine.handle.start)
    uxBus.on(Common.UXMessage.LOGIN_ERROR, stateMachine.handle.loginError)
    uxBus.on(Common.UXMessage.LOGIN_SUCCESS, stateMachine.handle.loginSuccess.bind(null, uxBus))

    let loginBlock = UI.bakeLoginBlock(()=>{
        let passwordEl = domUtil.$("#vault-password");
        uxBus.emit(Common.UXMessage.LOGIN_CLICK, { password: passwordEl.value})
    })

    domUtil.appendChildren("#main-container", loginBlock)

}


function handleLoginError(args){
    loadingOff()
    let passwordEl = domUtil.$("#vault-password");
    let loginBtn = domUtil.$("#vault-login-btn")
    loginBtn.removeAttribute("disabled");
    passwordEl.value = ""
    toastr.warning(`Login error: ${args[0] || ""}`)
}

function loggingIn(){
    loadingOn()
    let loginBtn = domUtil.$("#vault-login-btn")
    loginBtn.setAttribute("disabled", true);
}


function loadSounds(){
    let sounds = {}
    let sMap = {}
    sMap[SOUNDS.USER_ONLINE] =  "user_online.mp3"
    sMap[SOUNDS.INCOMING_MESSAGE] =  "message_incoming.mp3"
    sMap[SOUNDS.MESSAGE_SENT] =  "message_sent.mp3"

    for (let s in sMap) {
        sounds[s] = new Audio("/sounds/" + sMap[s]);
        sounds[s].load();
    }

    return sounds
}

/**
 * This is main initialization of the chat after successful login
 *
 */
function handleLoginSuccess(args) {

    console.log("Handling successful login");

    let uxBus = args[0]
    let settings = args[1]

    let player = new SoundPlayer(uxBus, loadSounds(), settings.sound)


    updateHeaderOnSuccessfulLogin(settings, uxBus);
    createChatInterface(uxBus)

    //make modals
    topicCreateModal = UI.bakeTopicCreateModal(()=>{
        let nicknameEl = domUtil.$("#new-topic-nickname");
        let topicNameEl = domUtil.$("#new-topic-name");
        let nickname = nicknameEl.value
        let topicName = topicNameEl.value
        nicknameEl.value = "";
        topicNameEl.value = ""
        uxBus.emit(Common.UXMessage.CREATE_TOPIC_REQUEST, {nickname: nickname, topicName: topicName})
        topicCreateModal.close();
    })


    topicJoinModal = UI.bakeTopicJoinModal(() => {

        let nickname = domUtil.$("#join-topic-nickname").value;
        let topicName = domUtil.$("#join-topic-name").value;
        let inviteCode = domUtil.$("#join-topic-invite-code").value;

        console.log("Joining topic")
        if (!nickname || !topicName || !inviteCode) {
            toastr.warning("All fields are required");
            return;
        }

        uxBus.emit(Common.UXMessage.TOPIC_JOIN_REQUEST, {
            nickname: nickname,
            topicName: topicName,
            inviteCode: inviteCode
        })

        toastr.info("Attempting to join topic");
        topicJoinModal.close();
    })


    setAliasModal = UI.bakeSetAliasModal(() => {
        console.log("Ok handler")
        let newAliasEl = domUtil.$("#modal-alias-input")
        let newAlias = newAliasEl.value
        let subject = JSON.parse(newAliasEl.getAttribute("rename-data"))
        switch (subject.type) {
            case "topic":
                console.log("Renaming topic")
                uxBus.emit(Common.UXMessage.RENAME_TOPIC, {
                    pkfp: subject.topicPkfp,
                    name: newAlias
                })
                break;
            case "participant":
                if (subject.participantPkfp === subject.topicPkfp) {
                    //change nickname
                    console.log("Setting my nickname")
                    uxBus.emit(subject.topicPkfp, {
                        message: Common.UXMessage.CHANGE_MY_NICKNAME,
                        nickname: newAlias,
                        pkfp: subject.participantPkfp
                    })
                } else {
                    console.log("Setting participant alias")
                    uxBus.emit(subject.topicPkfp, {
                        message: Common.UXMessage.SET_PARTICIPANT_ALIAS,
                        alias: newAlias,
                        pkfp: subject.participantPkfp
                    })
                }
                break
            case "invite":
                console.log("Renaming invite")
                uxBus.emit(subject.topicPkfp, {
                    message: Common.UXMessage.SET_INVITE_ALIAS,
                    inviteCode: subject.inviteCode,
                    alias: newAlias
                })
                break
            default:
                console.log(`Unknown subject ${subject.type}`);
        }

        setAliasModal.close();
    })

    let context = new Context(uxBus, {
        alias: setAliasModal,
        topicJoin: topicJoinModal,
        topicCreate: topicCreateModal
    })
    //hook all buttons to the bus

    let tabAgent = new TabAgent(uxBus)

    domUtil.$$("button").forEach(button=>{
        button.addEventListener("click", ()=>{
            uxBus.emit(Common.UXMessage.BUTTON_CLICK, button.id)
        })
    })


    setEventListeners(uxBus, context, player)

    //setupSidePanelListeners(uxBus,  stateMachine)
    //refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;

    uxBus.emit(SessionEvents.CONNECTION_STATUS_REQUEST)
    renderLayout()
    player.play(SOUNDS.USER_ONLINE)

}

function addEventListenersForMessagesWindow(uxBus, container){
        container.addEventListener("scroll", (ev)=>{
            uxBus.emit(Common.UXMessage.CHAT_SCROLL, {
                event: ev,
                pkfp: container.getAttribute("pkfp")
            })
        })
}


function toggleMute(uxBus){
    console.log("Mute button clicked. ");
    uxBus.emit(Common.UXMessage.TOGGLE_MUTE)
}


function updateHeaderOnSuccessfulLogin(settings, uxBus){

    let header = domUtil.$("header")

    //////////////////////////////////////////////////////////
    // let isSoundOn = !vault.hasOwnProperty("settings") || //
    //     !vault.settings.hasOwnProperty("sound") ||       //
    //     vault.settings.sound;                            //
    //////////////////////////////////////////////////////////
    domUtil.removeAllChildren(header);

    domUtil.appendChildren(header, [
        UI.bakeHeaderLeftSection(uxBus),
        //UI.bakeHeaderRightSection(false, settings.soundOn , processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
        UI.bakeHeaderRightSection(settings.sound)
    ])
}


function createChatInterface(uxBus){
    let main = domUtil.$("main")
    domUtil.removeAllChildren(main);

    let mainContainer = UI.bakeMainContainer()
    domUtil.appendChildren(main, mainContainer)
    let sidePanel = UI.bakeSidePanel(IslandsVersion.getVersion());

    let newMessageBlock = UI.bakeNewMessageControl(uxBus);
    let messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    domUtil.appendChildren(mainContainer, [sidePanel, messagesPanel]);
}

function handleRegistrationSuccess(){
    console.log("registration success handler invoked");

    loadingOff()
    domUtil.$("#register-vault-btn").removeAttribute("disabled");
    let mainContainer = domUtil.$('#main-container');

    domUtil.removeAllChildren(mainContainer);
    domUtil.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(() => {
        document.location.reload()
    }))
}

function handleRegistrationError(args){
    loadingOff()

    domUtil.$("#register-vault-btn").removeAttribute("disabled");
    toastr.warning(`Registration error: ${args[0] || ""}`)
}

function addNewParticipantToUX(uxBus, topicPkfp, pkfp){
    let participantEl = UI.bakeParticipantListItem({
        participantPkfp: pkfp,
        topicPkfp: topicPkfp,
        uxBus: uxBus
    })

    let container = Array.from(domUtil.$$(".topic-assets")).filter(el=>el.getAttribute("pkfp") === topicPkfp)[0]

    if(!container) {
        console.warn("Topic asset not found")
    }
    domUtil.appendChildren(container, participantEl)
}

function renderLayout() {
    console.log("Rendering layout")
    let isSidePanelOn = domUtil.hasClass(`#${UI.BUTTON_IDS.MAIN_MENU}`, "menu-on");
    let sidePanel = domUtil.$(".side-panel-container");
    let messagesPanel = domUtil.$(".main-panel-container");
    let connectionIndicatorLabel = domUtil.$("#connection-indicator-label")


    if (isSidePanelOn) {
        if (window.innerWidth <= SMALL_WIDTH) {
            domUtil.flex(sidePanel);
            domUtil.hide(messagesPanel);

        } else {
            domUtil.flex(sidePanel);
            domUtil.flex(messagesPanel);
        }

    } else {
        domUtil.hide(sidePanel);
        domUtil.flex(messagesPanel);
    }

    ///////////////////////////////////////////////
    // window.innerWidth <= XSMALL_WIDTH ?       //
    //     domUtil.hide(connectionIndicatorLabel) : //
    //     domUtil.flex(connectionIndicatorLabel)   //
    ///////////////////////////////////////////////


}


function processVaultSettingsUpdate(settings){
    let soundOn = domUtil.$(".sound-on-img")
    let soundOff = domUtil.$(".sound-off-img")

    if(settings.sound){
        domUtil.displayBlock(soundOn)
        domUtil.hide(soundOff)
    } else {
        domUtil.displayBlock(soundOff)
        domUtil.hide(soundOn)
    }

}

//This function is responsible for checking
// all vault updates, including topic rename, password change...
//I need to check each topic and update its name in the UX.
function processVaultUpdated(data){
    let { topics } = data
    for(let topic of topics){
        renameTopicInUX(topic.pkfp, topic.name)
    }
}

//The same story here. This function is responsible for
// updating all participant aliases, invite aliases,
// and the only way to do it for now is to update them all.
// There is no knowledge of what exactly has been updated
function processTopicSettingsUpdated(topic){
    console.log("Processing topic settings updated");
    for(let participant of topic.participants){
        let nickname = participant.getNickname();
        let alias = participant.getAlias()
        Common.setParticipantAlias(topic, participant, alias)
        Common.setParticipantNickname(topic, participant, nickname)
    }

    for (let invite of topic.getInvites()){
        Common.setInviteAlias(invite)
    }

}



function renameTopicInUX(pkfp, name){
    try{
        let topicElSide = domUtil.$(`.topic-list-item[pkfp="${pkfp}"]`)
        let messagesPanelEl = domUtil.$(`.messages-panel-container[pkfp="${pkfp}"]`)
        domUtil.$(".topic-name", topicElSide).innerText = name;
        domUtil.$(".topic-in-focus-label", messagesPanelEl).innerText = `Topic: ${name}`
    }catch(err){
        console.log(`Unable to rename topic in the UX: ${err}`);
    }
}


function initHandlerBuilder(uxBus){
    return function(ev, ...args){
        uxBus.emit(ev, ...args);
    }
}


// ---------------------------------------------------------------------------------------------------------------------------
// SIDE PANEL HANDLERS


//////////////////////////////////////////////////////////////////////////////////////////
// function setupSidePanelListeners(uxBus, stateMachine){                               //
//                                                                                      //
//     domUtil.$("#btn-new-topic").onclick = topicCreateModal.open;                        //
//     domUtil.$("#btn-join-topic").onclick = topicJoinModal.open;                         //
//                                                                                      //
//     domUtil.$("#btn-ctx-invite").onclick = processInviteButtonClick;                    //
//     domUtil.$("#btn-ctx-delete").onclick = processCtxDeleteButtonClick;                 //
//     domUtil.$("#btn-ctx-alias").onclick = processCtxAliasButtonClick.bind(null, uxBus); //
//     domUtil.$("#btn-ctx-boot").onclick = processCtxBootButtonClick;                     //
// }                                                                                    //
//////////////////////////////////////////////////////////////////////////////////////////


function handleMainMenuClick(){
    let menuButton = domUtil.$(`#${UI.BUTTON_IDS.MAIN_MENU}`)

    domUtil.toggleClass(menuButton, "menu-on");
    renderLayout()
}

//TODO Implement
function selectFileAttachment(){
    console.log("Selecting file to attach");
}

//TODO Implement
function cancelPrivateMessageSend(){
    console.log("Cancelling private message send");

}

//TODO Implement
function sendMessage(uxBus, context){
    let topicInFocus = context.getSelectedTopic()
    if(!topicInFocus){
        toastr.warning("Please first select a topic")
        return;
    }

    let inputElement = domUtil.$("#new-msg")
    let message = inputElement.value

    console.log("SENDING MESSAGE!");

    uxBus.emit(topicInFocus, {
        pkfp: topicInFocus,
        message: Common.UXMessage.SEND_CHAT_MESSAGE,
        chatMessage: message
    })

    inputElement.value = "";
}


//TODO Implement
function processMessageAreaKeyPress(uxBus, context, ev){
    if(ev.keyCode === 13 || ev.keyCode === 10){
        if(ev.ctrlKey){
            ev.target.value += "\n";
            moveCursor(ev.target, "end");
        } else {
            ev.preventDefault()
            sendMessage(uxBus, context)
        }
    }

}


function moveCursor(el, pos) {
    if (pos === "end") {
        moveCursorToEnd(el);
    } else if (pos === "start") {
        moveCursorToStart(el);
    }
}


//Shows or hids the details of a given topic

function addNewInvite(uxBus, message){
    let { pkfp, invite } = message
    console.log(`New invite received adding to UX`);
    console.dir(invite)
    let inviteListItem = UI.bakeInviteListItem(uxBus, pkfp, invite, invite)

    let topicAssets = Array.from(domUtil.$$(".topic-assets")).filter(el=>el.getAttribute("pkfp") === pkfp)[0]
    if(!Array.from(domUtil.$$(".invite-list-item")).filter(el=>el.getAttribute("pkfp") === invite)[0]){
        topicAssets.appendChild(inviteListItem)
    }
}

function processNewChatMessage(context, player, data){
    const { topicPkfp, message, authorAlias } = data;

    let topicInFocus = context.getSelectedTopic()

    console.log(`New incoming chat message received for ${topicPkfp}`)

    if (!message.header.service) {
        if (message.header.author === topicPkfp) {
            player.play(SOUNDS.MESSAGE_SENT)
        } else {
            player.play(SOUNDS.INCOMING_MESSAGE)
        }
    }

    let willScroll = false;

    if (topicInFocus !== topicPkfp) {
        incrementUnreadCounter(topicPkfp)
    }

    /////////////////////////////////////////////////////////////////////
    // let alias = "";                                                 //
    // if (message.header.author) {                                    //
    //     alias = topic.getParticipantAlias(message.header.author) || //
    //         message.header.author.substring(0, 8)                   //
    // }                                                               //
    /////////////////////////////////////////////////////////////////////
    let container = getTopicMessagesContainer(topicPkfp);

    willScroll = isScrollingRequired(container);

    appendMessageToChat({
        nickname: message.header.nickname,
        alias: authorAlias,
        body: message.body,
        timestamp: message.header.timestamp,
        pkfp: message.header.author,
        messageID: message.header.id,
        service: message.header.service,
        private: message.header.private,
        recipient: message.header.recipient,
        attachments: message.attachments
    }, topicPkfp, domUtil.$(".messages-window", container));

    if(willScroll){
        Scroll.scrollDown(container)
    }

}


function appendEphemeralMessage(msg, pkfp) {
    if (!msg) {
        console.log("Message is empty.")
        return
    }

    let messagesWindow = getTopicMessagesContainer(pkfp);
    willScroll = isScrollingRequired(container);

    try {
        let msgEl = UI.bakeEphemeralMessage(getChatFormatedDate(new Date()), msg);
        messagesWindow.appendChild(msgEl);
    } catch (err) {
        console.log("EPHEMERAL ERROR: " + err)
    }

    if(willScroll){
        Scroll.scrollDown(messagesWindow)
    }
}

function isScrollingRequired(el){
    return el.scrollHeight - el.scrollTop - el.offsetHeight <= Math.floor(el.offsetHeight / 2)
}

function getTopicMessagesContainer(pkfp){
    console.log("Get messages container");
    return Array.from(domUtil.$$(".messages-panel-container")).filter(el=> el.getAttribute("pkfp") === pkfp)[0]

}


//Select invite
function processInviteClick(data){
    console.log("Processing invite click");
    let {pkfp, inviteCode} = data;
    let activator = new AssetActivator({
        pkfp: pkfp,
        code: inviteCode
    })

    activator.activate();

    displayTopicContextButtons("invite")
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


//We want request for more messages to fire
//when user scrolls up and approaches the top
//
// We don't want it to fire when user scrolls down
function processChatScroll(uxBus, data) {
    let { pkfp, event } = data
    let chatWindow = event.target;

    if (!chatWindow.firstChild) return;

    //If last scroll has not been set yet - setting it to current value
    if(!chatWindow.lastScroll){
        chatWindow.lastScroll = event.target.scrollTop;
    }

    //Checking if we are at the top and the scroll direction is up
    if (event.target.scrollTop <= 5 && event.target.scrollTop < chatWindow.lastScroll) {
        //load more messages
        console.log("loading more messages");
        let data = uxTopics[pkfp];
        uxBus.emit(pkfp, {
            before: data.earliesLoadedMessage,
            howMany: 10,
            message: Common.UXMessage.GET_LAST_MESSAGES
        })
    }

    //Setting last scroll to the current element
    chatWindow.lastScroll = event.target.scrollTop;
}


//This function processes MESSGES_LOADED event
function processLastMessagesResponse(data){
    let { pkfp, topic, messages, before } = data;
    let topicUXData = uxTopics[pkfp]
    console.log("PROCESSING LAST MESSAGES LOADED RESPONSE");

    let container = getTopicMessagesContainer(pkfp);
    let messagesWindow = domUtil.$(".messages-window", container)

    if(!messages || messages.length === 0) return;


    //Here excluding all messages that have been already appended
    messages = messages.filter(message=> !topicUXData.messagesLoadedIds.has(message.header.id))

    if(messages.length ===0) {
        //nothing to append.
        return
    }

    let willScroll = isScrollingRequired(messagesWindow)

    for(let message of messages){


        let authorAlias = topic.getParticipantAlias(message.header.author)
        appendMessageToChat({
            nickname: message.header.nickname,
            alias: Common.formatParticipantAlias(topic.pkfp, message.header.author, authorAlias),
            body: message.body,
            timestamp: message.header.timestamp,
            pkfp: message.header.author,
            messageID: message.header.id,
            service: message.header.service,
            private: message.header.private,
            recipient: message.header.recipient,
            attachments: message.attachments
        }, pkfp, messagesWindow, true);
    }

    uxTopics[pkfp].earliesLoadedMessage = messages[messages.length - 1].header.id;

    if(willScroll){
        Scroll.scrollDown(messagesWindow)
    }

}



function incrementUnreadCounter(pkfp) {
    console.log("Incrementing unread messages counter");
    if (!unreadCounters.hasOwnProperty(pkfp)) {
        unreadCounters[pkfp] = 1
    } else {
        unreadCounters[pkfp]++;
    }
    Common.setUnreadMessagesIndicator(pkfp, unreadCounters[pkfp])
}






/**
 * This function creates all UX elements for newly added topic
 */
function addNewTopicToUX(uxBus, topic){
    //Make sure topic with such pkfp does not exist
    let topicsList = domUtil.$("#topics-list")
    let topics = Array.from(domUtil.$$(".side-block-data-list-item", topicsList)).filter(item=>item.getAttribute("pkfp") === topic.pkfp)
    if(topics.length > 0) return

    //Creating messages area
    let messageBlocksContainer = domUtil.$("#topic-message-blocks-container")
    //Creating side panel elements
    let topicListItem = UI.bakeTopicListItem(topic, uxBus);
    let topicAssets = UI.bakeTopicAssets(topic, uxBus);
    console.log("Baked");

    //Adding new elements to view
    domUtil.appendChildren(topicsList, [topicListItem, topicAssets])
    let topicMessageBlock = UI.bakeTopicMessagesBlock(topic.pkfp, topic.name)
    domUtil.appendChildren(messageBlocksContainer, topicMessageBlock)

    addEventListenersForMessagesWindow(uxBus, topicMessageBlock)
    uxTopics[topic.pkfp] = new TopicUXData()
}





function processNewInviteClick() {
    if (topicInFocus) {
        chat.requestInvite(topicInFocus);
    } else {
        console.log("No topic in focus");
    }
}




function processCtxBootButtonClick() {
    console.log("booting participant")
    let topicPkfp = topicInFocus;
    let asset = getActiveTopicAsset()
    let participantPkfp = asset.getAttribute("pkfp")
    chat.bootParticipant(topicPkfp, participantPkfp)

}

function processCtxAliasButtonClick(uxBus) {

    //console.log("Alias button clicked");
    //Rename topc, or member or invite

    let topicInFocus = getTopicInFocusData()
    return


    if (!topicInFocus) {
        console.log("Nothing to rename")
        return;
    }

    let title = domUtil.$("#modal-alias-title")
    let forLabel = domUtil.$("#modal-alias-for-label")
    let aliasInput = domUtil.$("#modal-alias-input")

    let subject = {}

    subject.topicPkfp = topicInFocus;
    let asset = getActiveTopicAsset()
    if (asset) {
        // Setting alias either for participant or invite
        if (domUtil.hasClass(asset, "invite-list-item")) {
            // For invite
            subject.type = "invite"
            subject.code = asset.getAttribute("code")
            domUtil.text(title, "New alias")
            domUtil.text(forLabel, `For invite: ${asset.getAttribute("code").substring(117, 140)}...`)
            aliasInput.setAttribute("placeholder", "Enter new alias")
        } else if (domUtil.hasClass(asset, "participant-list-item")) {
            // For participant
            let pkfp = asset.getAttribute("pkfp");

            subject.type = "participant"
            subject.pkfp = pkfp
            if (pkfp === topicInFocus) {
                //Changing my nickname
                domUtil.text(title, "Change my nickname")
                domUtil.text(forLabel, "")
                aliasInput.setAttribute("placeholder", "Enter new nickname")
            } else {
                //Alias for another participant
                domUtil.text(title, "New alias")
                domUtil.text(forLabel, `For ${topics[topicInFocus].getParticipantNickname(pkfp)}(${pkfp.substring(0, 32)}...)`)
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
        domUtil.text(title, `Rename topic "${chat.getTopicName(topicInFocus)}"`)
        domUtil.text(forLabel, `(${topicInFocus.substring(0, 32)}...)`)
        aliasInput.setAttribute("placeholder", "Enter new topic name")
    }

    aliasInput.setAttribute("rename-data", JSON.stringify(subject));
    setAliasModal.open();
}

function getTopicInFocusData(){

}




function processCtxDeleteButtonClick(uxBus) {
    console.log("Delete click. Processing...");
    let topicInFocus = getTopicInFocusData()
    let topicAsset = getActiveTopicAsset()

    if (!topicAsset) {
        //delete topic
        let confirmMsg = `Topic ${inFocus} hisrory and all hidden services will be deleted. This action is irreversable. \n\nProceed?`
        if (confirm(confirmMsg)) {
            chat.deleteTopic(inFocus)
            return;
        }
    }

    if (domUtil.hasClass(topicAsset, "invite-list-item")) {
        let inviteCode = topicAsset.getAttribute("code")
        console.log(`Deleting invite ${inviteCode}`)
        chat.deleteInvite(inFocus, inviteCode)
    }
}
//END//////////////////////////////////////////////////////////////////////////

function prepareUIStateMachine(){
    return new StateMachine(null, {
        name: "UI State Machine",
        stateMap: {
            start: {
                initial: true,
                transitions:{
                    toLogin: {
                        actions: initLogin,
                        state: "login"
                    },

                    toRegistration: {
                        actions: initRegistration,
                        state: "registration"
                    }
                }
            },

            login: {
                entry: loadingOff,
                transitions: {
                    start: {
                        state: "loggingIn",
                        actions: loggingIn
                    }
                }
            },

            loggingIn: {
                transitions: {
                    loginError: {
                        state: "login",
                        actions: handleLoginError
                    },

                    loginSuccess: {
                        actions: handleLoginSuccess,
                        state: "loggedIn"
                    }
                }
            },

            registration: {
                transitions: {
                    start: {
                        state: "registering"

                    }
                }
            },

            registering: {
                entry: loadingOn,
                transitions: {
                    registrationError: {
                        state: "registration",
                        actions: handleRegistrationError
                    },

                    registrationSuccess: {
                        state: "registrationSuccess",
                        actions: handleRegistrationSuccess
                    }
                }

            },

            registrationSuccess: {
                final: true
            },

            loggedIn: {
                entry: [ loadingOff ],
                transitions: {
                    disconnect: {

                    },
                }
            },
        }
    }, { traceLevel: StateMachine.TraceLevel.DEBUG, msgNotExistMode: StateMachine.Warn })
}


function getParticipantColor(topicPkfp, participantPkfp){
    let topicData = uxTopics[topicPkfp]
    topicData.participants.add(participantPkfp)
    let index = Array.from(topicData.participants).indexOf(participantPkfp)
    return colors[index % colors.length]

}


function handleContextMenuClick(data){
    console.log("Context menu click");
}


//Appending messages
/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */
function appendMessageToChat(message, topicPkfp, chatWindow, toHead = false) {

    let topicUXData = uxTopics[topicPkfp]
    topicUXData.messagesLoadedIds.add(message.messageID)

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
        msg.style.color = getParticipantColor(topicPkfp, message.pkfp)
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

    return domUtil.bake("span", {
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
            result.appendChild(domUtil.bake("p", {
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

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




function showCodeView(event) {
    let pre = document.createElement("pre");
    pre.innerHTML = event.target.innerHTML;
    let div = document.createElement("div");
    div.appendChild(pre);
    showModalNotification("Code:", div.innerHTML);
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

function setConnectionIndicatorStatus(status){

    let indicator = domUtil.$("#connection-indicator")
    let indicatorLabel = domUtil.$("#connection-indicator-label")
    let spinner = domUtil.$("#reconnect-spinner")
    domUtil.hide(spinner)
    domUtil.removeClass(indicator, ["connected", "disconnected", "connecting", "unknown"])

    switch(status){

        case ConnectionIndicatorStatus.CONNECTED:{
            domUtil.addClass(indicator, "connected")
            indicatorLabel.innerText = "Connected to island"
            break;

        }
        case ConnectionIndicatorStatus.DISCONNECTED:{
            domUtil.addClass(indicator, "disconnected")
            indicatorLabel.innerText = "Disconnected"
            break;
        }
        case ConnectionIndicatorStatus.CONNECTING:{
            domUtil.addClass(indicator, "connecting")
            indicatorLabel.innerText = "Connecting..."
            domUtil.displayFlex(spinner);
            break;
        }

        default: {
            domUtil.addClass(indicator, "unknown")
            indicatorLabel.innerText = "Connection status unknown"
            break;
        }

    }
}

//Sets listeners and callbacks for
//all related message bus events
function setEventListeners(uxBus, context, player){
    console.log("Setting event listeners");
    let buttonClickHandlers = {}
    buttonClickHandlers[UI.BUTTON_IDS.JOIN_TOPIC] = topicJoinModal.open.bind(topicJoinModal)
    buttonClickHandlers[UI.BUTTON_IDS.NEW_TOPIC] =  topicCreateModal.open.bind(topicCreateModal)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_INVITE] = context.invite.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_ALIAS] = context.alias.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_BOOT] = context.boot.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_DELETE] = context.delete.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.MUTE_SOUND] = toggleMute.bind(null, uxBus)



    //Processing button clicks
    uxBus.on(Common.UXMessage.BUTTON_CLICK, btnId=>{
        if(btnId in buttonClickHandlers){
            buttonClickHandlers[btnId]()
        }
    })

    uxBus.on(Events.TOPIC_CREATED, addNewTopicToUX.bind(null, uxBus))
    uxBus.on(Common.UXMessage.TOPIC_LOADED, addNewTopicToUX.bind(null, uxBus))

    uxBus.on(Common.UXMessage.TOPIC_CLICK, context.selectTopic.bind(context, uxBus, uxTopics))
    uxBus.on(Common.UXMessage.TOPIC_DBLCLICK, context.expandTopic.bind(context, uxBus, uxTopics))
    uxBus.on(Common.UXMessage.TOPIC_EXPAND_ICON_CLICK, context.expandTopic.bind(context, uxBus, uxTopics))

    uxBus.on(Common.UXMessage.MAIN_MENU_CLICK, handleMainMenuClick);

    //Invite code click events
    uxBus.on(Common.UXMessage.INVITE_DBLCLICK, context.doubleSelectInvite.bind(context, uxBus, uxTopics));
    uxBus.on(Common.UXMessage.INVITE_CLICK, context.selectInvite.bind(context, uxBus, uxTopics));

    //emitet at chatuifactory.js
    uxBus.on(Common.UXMessage.PARTICIPANT_CLICK, context.selectParticipant.bind(context, uxBus, uxTopics));

    //Attachment handlers
    uxBus.on(Common.UXMessage.ATTACH_FILE_ICON_CLICK, selectFileAttachment);


    //Handle private message mode cancel click
    uxBus.on(Common.UXMessage.CANCEL_PRIVATE_MESSAGE, cancelPrivateMessageSend);

    //Handling send message click
    uxBus.on(Common.UXMessage.SEND_BUTTON_CLICK, sendMessage.bind(null, uxBus, context));

    //Handling key presses while in new message area
    uxBus.on(Common.UXMessage.MESSAGE_AREA_KEY_PRESS, processMessageAreaKeyPress.bind(null, uxBus, context))

    uxBus.on(Common.UXMessage.LAST_MESSAGES_RESPONSE, processLastMessagesResponse)


    uxBus.on(Common.UXMessage.CHAT_SCROLL, processChatScroll.bind(null, uxBus))

    uxBus.on(TopicEvents.NEW_CHAT_MESSAGE, processNewChatMessage.bind(null, context, player))
    uxBus.on(TopicEvents.INVITE_CREATED, addNewInvite.bind(null, uxBus))

    uxBus.on(VaultEvents.TOPIC_DELETED, context.topicDeleted.bind(context))
    uxBus.on(Common.UXMessage.TOPIC_JOIN_SUCCESS, (data)=>{
        console.log("Topic join success adding to UX");
        addNewTopicToUX(uxBus, data.topic)
    })

    uxBus.on(TopicEvents.NEW_PARTICIPANT_JOINED, data=>{

        console.log("NEW PARTICIPANT JOINED PROCESSING UX");
        addNewParticipantToUX(uxBus, data.topicPkfp, data.pkfp)

    })

    uxBus.on(VaultEvents.VAULT_UPDATED, processVaultUpdated)
    uxBus.on(VaultEvents.VAULT_FORMAT_UPDATED, ()=>{
        toastr.success("Vault has been updated to the newest format")
    })
    uxBus.on(TopicEvents.SETTINGS_UPDATED, processTopicSettingsUpdated)



    uxBus.on(SessionEvents.CONNECTION_LOST, setConnectionIndicatorStatus.bind(null, ConnectionIndicatorStatus.DISCONNECTED))
    uxBus.on(SessionEvents.CONNECTED, setConnectionIndicatorStatus.bind(null, ConnectionIndicatorStatus.CONNECTED))
    uxBus.on(SessionEvents.RECONNECTING, setConnectionIndicatorStatus.bind(null, ConnectionIndicatorStatus.CONNECTING))

    uxBus.on(VaultEvents.VAULT_SETTINGS_UPDATED, processVaultSettingsUpdate)
    uxBus.on(TopicEvents.ERROR, errorMessage=>{
        console.log(`Topic error received: ${errorMessage}`);
        toastr.warning(errorMessage)
    })
}


const ConnectionIndicatorStatus = {
    CONNECTED: Symbol("connected"),
    DISCONNECTED: Symbol("disconnected"),
    CONNECTING: Symbol("connecting"),
    UNKNOWN: Symbol("unknown")
}

const SOUNDS = {
    USER_ONLINE: "user_online",
    INCOMING_MESSAGE: "incoming_message",
    MESSAGE_SENT: "message_sent"
}
