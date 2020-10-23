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
let spinner = new BlockingSpinner();


// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760; // Width screen in pixels considered to be small
const XSMALL_WIDTH = 400;
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = ["#cfeeff", "#ffcc7f", "#b5ffc0", "#ccfffb", "#67fcf0", "#f8e6ff", "#ffe6f1", "#ccefff", "#ccf1ff"]
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

/**
 * This is main initialization of the chat after successful login
 *
 */
function handleLoginSuccess(args) {


    console.log("Handling successful login");
    let settings = args[1]
    let uxBus = args[0]
    //let vault = vaultHolder.getVault();

    let context = new Context(uxBus)
    updateHeaderOnSuccessfulLogin(settings);
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
    //hook all buttons to the bus

    domUtil.$$("button").forEach(button=>{
        button.addEventListener("click", ()=>{
            uxBus.emit(Common.UXMessage.BUTTON_CLICK, button.id)
        })
    })

    domUtil.$$(".messages-panel-container").forEach(container=>{
        addEventListenersForMessagesWindow(container)
    })

    setEventListeners(uxBus, context)

    //setupSidePanelListeners(uxBus,  stateMachine)
    //refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;


    renderLayout()
    // prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = domUtil.wrap([messagesPanel, newMessagePanel], "main-panel-container");


    //domUtil.$("#remove-private").addEventListener("click", removePrivate);
    //domUtil.$("#messages-panel-container").onscroll = undefined //processChatScroll;
    //UIInitialized = true;
    ///////////////////////////////////////////////
    // let loginAgent = args[0]                  //
    // let vaultRaw = loginAgent.vaultRaw        //
    //                                           //
    // console.log("Login success handler");     //
    //                                           //
    // let vaultRetriever = new VaultRetriever() //
    // vaultRetriever.run(handleVaultReceived)   //
    ///////////////////////////////////////////////


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

function addEventListenersForMessagesWindow(container){
        container.addEventListener("scroll", ()=>{
            uxBus.emit(Common.UXMessage.CHAT_SCROLL, container.getAttribute("pkfp"))
        })
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
        UI.bakeHeaderLeftSection((menuButton) => {
        }),
        //UI.bakeHeaderRightSection(false, settings.soundOn , processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
        UI.bakeHeaderRightSection(settings.soundOn)
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
    console.log(`Key pressed: ${ev.keyCode}`);
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

function processNewChatMessage(context, data){
    const { topicPkfp, message, authorAlias } = data;

    let topicInFocus = context.getSelectedTopic()

    console.log(`New incoming chat message received for ${topicPkfp}`)

    if (!message.header.service) {
        if (message.header.author === topicPkfp) {
//            playSound("message_sent")
        } else {

 //           playSound("incoming_message")
        }
    }

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
    let container = getTopicMessagesContainer(topicInFocus);

    let willScroll = isScrollingRequired(container);

    console.log("Appending message");
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
    }, topicInFocus, domUtil.$(".messages-window", container));

    if(willScroll){
        Scroll.scrollDown(container)
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


function processChatScroll(uxBus, pkfp, event) {
    let chatWindow = event.target;

    if (!chatWindow.firstChild) return;



    if (event.target.scrollTop <= 1 && topicInFocus) {
        //load more messages

        let data = uxTopics[pkfp];
        uxBus.emit(pkfp, {
            before: data.earliesLoadedMessage,
            howMany: 10,
            message: Common.UXMessage.GET_LAST_MESSAGES
        })
        console.log("loading more messages");
        chat.loadMoreMessages(topicInFocus);
    }
}


//This function processes MESSGES_LOADED event
function processLastMessagesResponse(data){
    let { pkfp, messages, before } = data;
    let topicUXData = uxTopics[pkfp]
    console.log("PROCESSING LAST MESSAGES LOADED RESPONSE");

    let container = getTopicMessagesContainer(pkfp);

    if(!messages || messages.length === 0) return;


    //Here dumping all messages that have been already appended
    while(topicUXData.messagesLoadedIds.has(messages[0].header.id)){
        messages.splice(0, 1)
        if(messages.length ===0) return
    }



    for(let message of messages){

        console.log("Appending message");

        topicUXData.messagesLoadedIds.add(message.header.id)
        appendMessageToChat({
            nickname: message.header.nickname,
            alias: "alias",
            body: message.body,
            timestamp: message.header.timestamp,
            pkfp: message.header.author,
            messageID: message.header.id,
            service: message.header.service,
            private: message.header.private,
            recipient: message.header.recipient,
            attachments: message.attachments
        }, pkfp, domUtil.$(".messages-window", container), true);
    }

    uxTopics[pkfp].earliesLoadedMessage = messages[messages.length - 1].header.id;

}


////////////////////////////////////////////////////////////////////////////////////
// //This function checks if messages were initially loaded                       //
// //and writes GET_LAST_MESSAGES request to bus if messages count                //
// // is less than 30                                                             //
// //                                                                             //
// function updateTopicMessages(pkfp, uxBus){                                     //
//     let topicUXData = uxTopics[pkfp]                                           //
//     if(!topicUXData.isInitialized || messagesLoaded <  INITIAL_MESSAGES_LOAD){ //
//         uxBus.emit(Common.UXMessage.GET_LAST_MESSAGES, {                       //
//             pkfp: pkfp,                                                        //
//             before: topicUXData.earliesLoadedMessage,                          //
//         })                                                                     //
//     }                                                                          //
// }                                                                              //
////////////////////////////////////////////////////////////////////////////////////


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
        let participantIndex = 4 //Object.keys(topics[topicPkfp].participants).indexOf(message.pkfp)
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



//Sets listeners and callbacks for
//all related message bus events
function setEventListeners(uxBus, context){
    console.log("Setting event listeners");
    let buttonClickHandlers = {}
    buttonClickHandlers[UI.BUTTON_IDS.JOIN_TOPIC] = topicJoinModal.open.bind(topicJoinModal)
    buttonClickHandlers[UI.BUTTON_IDS.NEW_TOPIC] =  topicCreateModal.open.bind(topicCreateModal)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_INVITE] = context.invite.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_ALIAS] = context.alias.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_BOOT] = context.boot.bind(context, uxBus)
    buttonClickHandlers[UI.BUTTON_IDS.CTX_DELETE] = context.delete.bind(context, uxBus)



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

    uxBus.on(TopicEvents.NEW_CHAT_MESSAGE, processNewChatMessage.bind(null, context))
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
}
