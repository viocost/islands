import * as UI from "../lib/ChatUIFactory";
import { IslandsVersion } from "../../../../common/Version"
import * as util from "../lib/dom-util";
import { StateMachine } from "../../../../common/AdvStateMachine"
import { BlockingSpinner } from "../lib/BlockingSpinner";
import { Events } from "../../../../common/Events"
import "../../css/chat.sass"
import "../../css/vendor/loading.css";
import toastr from "../lib/toastr";
import { TopicUXData } from "./TopicUXData"
import { TopicEvents } from "../lib/Topic"
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
    messageBus.on(UXMessage.TO_LOGIN, ()=>{
        console.log("UI TO LOGIN");
        mainStateMachine.handle.toLogin(messageBus)
    })

    messageBus.on(UXMessage.TO_REGISTRATION, ()=>{
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
    uxBus.on(UXMessage.REGISTER_SUCCESS, stateMachine.handle.registrationSuccess)
    uxBus.on(UXMessage.REGISTER_ERROR, stateMachine.handle.registrationError);
    uxBus.on(UXMessage.REGISTER_PROGRESS, (subscriptionId)=>{
        util.$("#register-vault-btn").setAttribute("disabled", true)
        stateMachine.handle.start()

    })
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        let password = util.$("#new-passwd");
        let confirm = util.$("#confirm-passwd");
        uxBus.emit(UXMessage.REGISTER_CLICK, {password: password, confirm: confirm})
    })

    util.appendChildren("#main-container", registrationBlock)
}


function initLogin(args, stateMachine){
    let uxBus = args[0]

    uxBus.on(UXMessage.LOGIN_PROGRESS, stateMachine.handle.start)
    uxBus.on(UXMessage.LOGIN_ERROR, stateMachine.handle.loginError)
    uxBus.on(UXMessage.LOGIN_SUCCESS, stateMachine.handle.loginSuccess.bind(null, uxBus))

    let loginBlock = UI.bakeLoginBlock(()=>{
        let passwordEl = util.$("#vault-password");
        uxBus.emit(UXMessage.LOGIN_CLICK, { password: passwordEl.value})
    })

    util.appendChildren("#main-container", loginBlock)

}


function handleLoginError(args){
    loadingOff()
    let passwordEl = util.$("#vault-password");
    let loginBtn = util.$("#vault-login-btn")
    loginBtn.removeAttribute("disabled");
    passwordEl.value = ""
    toastr.warning(`Login error: ${args[0] || ""}`)
}

function loggingIn(){
    loadingOn()
    let loginBtn = util.$("#vault-login-btn")
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

    updateHeaderOnSuccessfulLogin(settings);
    createChatInterface(uxBus)

    //make modals
    topicCreateModal = UI.bakeTopicCreateModal(()=>{
        let nicknameEl = util.$("#new-topic-nickname");
        let topicNameEl = util.$("#new-topic-name");
        let nickname = nicknameEl.value
        let topicName = topicNameEl.value
        nicknameEl.value = "";
        topicNameEl.value = ""
        uxBus.emit(UXMessage.CREATE_TOPIC_REQUEST, {nickname: nickname, topicName: topicName})
        topicCreateModal.close();
    })


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
    //hook all buttons to the bus

    util.$$("button").forEach(button=>{
        button.addEventListener("click", ()=>{
            uxBus.emit(UXMessage.BUTTON_CLICK, button.id)
        })
    })


    setEventListeners(uxBus)

    //setupSidePanelListeners(uxBus,  stateMachine)
    //refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;


    renderLayout()
    // prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "main-panel-container");


    //util.$("#remove-private").addEventListener("click", removePrivate);
    //util.$("#messages-panel-container").onscroll = undefined //processChatScroll;
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

function updateHeaderOnSuccessfulLogin(settings, uxBus){

    let header = util.$("header")

    //////////////////////////////////////////////////////////
    // let isSoundOn = !vault.hasOwnProperty("settings") || //
    //     !vault.settings.hasOwnProperty("sound") ||       //
    //     vault.settings.sound;                            //
    //////////////////////////////////////////////////////////
    util.removeAllChildren(header);

    util.appendChildren(header, [
        UI.bakeHeaderLeftSection((menuButton) => {
        }),
        //UI.bakeHeaderRightSection(false, settings.soundOn , processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
        UI.bakeHeaderRightSection(settings.soundOn)
    ])
}


function createChatInterface(uxBus){
    let main = util.$("main")
    util.removeAllChildren(main);

    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, mainContainer)
    let sidePanel = UI.bakeSidePanel(IslandsVersion.getVersion());

    let newMessageBlock = UI.bakeNewMessageControl(uxBus);
    let messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);
}

function handleRegistrationSuccess(){
    console.log("registration success handler invoked");

    loadingOff()
    util.$("#register-vault-btn").removeAttribute("disabled");
    let mainContainer = util.$('#main-container');

    util.removeAllChildren(mainContainer);
    util.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(() => {
        document.location.reload()
    }))
}

function handleRegistrationError(args){
    loadingOff()

    util.$("#register-vault-btn").removeAttribute("disabled");
    toastr.warning(`Registration error: ${args[0] || ""}`)
}


function renderLayout() {
    console.log("Rendering layout")
    let isSidePanelOn = util.hasClass(`#${UI.BUTTON_IDS.MAIN_MENU}`, "menu-on");
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


function initHandlerBuilder(uxBus){
    return function(ev, ...args){
        uxBus.emit(ev, ...args);
    }
}


// ---------------------------------------------------------------------------------------------------------------------------
// SIDE PANEL HANDLERS


function setupSidePanelListeners(uxBus, stateMachine){

    util.$("#btn-new-topic").onclick = topicCreateModal.open;
    util.$("#btn-join-topic").onclick = topicJoinModal.open;

    util.$("#btn-ctx-invite").onclick = processNewInviteClick;
    util.$("#btn-ctx-delete").onclick = processCtxDeleteClick;
    util.$("#btn-ctx-alias").onclick = processCtxAliasClick.bind(null, uxBus);
    util.$("#btn-ctx-boot").onclick = processCtxBootClick;
}

function setupHotkeysHandlers(){

}

//Sets listeners and callbacks for
//all related message bus events
function setEventListeners(uxBus){
    console.log("Setting event listeners");
    let buttonClickHandlers = {}
    buttonClickHandlers[UI.BUTTON_IDS.JOIN_TOPIC] = topicJoinModal.open.bind(topicJoinModal)
    buttonClickHandlers[UI.BUTTON_IDS.NEW_TOPIC] =  topicCreateModal.open.bind(topicCreateModal)

    //Processing button clicks
    uxBus.on(UXMessage.BUTTON_CLICK, btnId=>{
        if(btnId in buttonClickHandlers){
            buttonClickHandlers[btnId]()
        }
    })

    uxBus.on(Events.TOPIC_CREATED, addNewTopicToUX.bind(null, uxBus))
    uxBus.on(UXMessage.TOPIC_LOADED, addNewTopicToUX.bind(null, uxBus))

    uxBus.on(UXMessage.TOPIC_CLICK, activateTopic)
    uxBus.on(UXMessage.TOPIC_DBLCLICK, [activateTopic, toggleTopicExpand])
    uxBus.on(UXMessage.TOPIC_EXPAND_ICON_CLICK, [activateTopic, toggleTopicExpand])

    uxBus.on(UXMessage.MAIN_MENU_CLICK, handleMainMenuClick);

    //Invite code click events
    uxBus.on(UXMessage.INVITE_DBLCLICK, copyInviteCodeToClipboard);
    uxBus.on(UXMessage.PARTICIPANT_CLICK, ()=>console.log("participant click"))

    //Attachment handlers
    uxBus.on(UXMessage.ATTACH_FILE_ICON_CLICK, selectFileAttachment);


    //Handle private message mode cancel click
    uxBus.on(UXMessage.CANCEL_PRIVATE_MESSAGE, cancelPrivateMessageSend);

    //Handling send message click
    uxBus.on(UXMessage.SEND_BUTTON_CLICK, sendMessage.bind(null, uxBus));

    //Handling key presses while in new message area
    uxBus.on(UXMessage.MESSAGE_AREA_KEY_PRESS, processMessageAreaKeyPress)

    uxBus.on(UXMessage.LAST_MESSAGES_RESPONSE, processLastMessagesResponse)


    uxBus.on(TopicEvents.NEW_CHAT_MESSAGE, processNewChatMessage)
}


function handleMainMenuClick(){
    let menuButton = util.$(`#${UI.BUTTON_IDS.MAIN_MENU}`)

    util.toggleClass(menuButton, "menu-on");
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
function sendMessage(uxBus){
    if(!topicInFocus){
        toastr.warning("Please first select a topic")
        return;
    }

    let inputElement = util.$("#new-msg")
    let message = inputElement.value

    console.log("SENDING MESSAGE!");

    uxBus.emit(UXMessage.SEND_CHAT_MESSAGE, {
        pkfp: topicInFocus,
        message: message
    })

    inputElement.value = "";
}


//TODO Implement
function processMessageAreaKeyPress(ev){
    console.log(`Key pressed: ${ev.keyCode}`);

}

function copyInviteCodeToClipboard(data){
    let { inviteCode } = data
    let textArea = document.createElement("textarea");
    textArea.value = inviteCode;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        console.log("Invite code has been copied");

        toastr.info("Invite code has been copied to the clipboard");
    } catch (err) {
        toastr.error("Error copying invite code to the clipboard");
    }
    textArea.remove();
}



//Shows or hids the details of a given topic
function toggleTopicExpand(pkfp){

    console.log("Expanding topic");
    let topicsList = util.$("#topics-list")
    let topicEl = Array.from(util.$$(".side-block-data-list-item", topicsList)).filter(el=>el.getAttribute("pkfp") === pkfp)[0]
    let topicAssets = Array.from(util.$$(".topic-assets", topicsList)).filter(el=>el.getAttribute("pkfp") === pkfp)[0]

    // adding topic-assets-expanded makes topic assets visible
    util.toggleClass(topicAssets, "topic-assets-expanded")

    util.toggleDisplay(topicEl.firstElementChild.children[0])
    util.toggleDisplay(topicEl.firstElementChild.children[1])
    //here we are replacing + icon to minus if expanding


}


function processNewChatMessage(data){
    const { topicPkfp, message, authorAlias } = data;

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
    }, topicInFocus, util.$(".messages-window", container));

   
}

function getTopicMessagesContainer(pkfp){
    console.log("Get messages container");
    return Array.from(util.$$(".messages-panel-container")).filter(el=> el.getAttribute("pkfp") === pkfp)[0]

}

function activateTopic(pkfp){
    console.log("Activating topic");

    //setting active topic
    topicInFocus = pkfp;

    //show topic messages panel
    for(let panel of util.$$(".messages-panel-container")){
        if (panel.getAttribute("pkfp") === pkfp){
            util.flex(panel)
        } else {
            util.hide(panel)
        }
    }

    //mark active topic on the side panel
    for (let el of util.$("#topics-list").children) {
        if (el.getAttribute("pkfp") === pkfp) {
            util.addClass(el, "topic-in-focus");
            //Here set the name for active topic in header

        } else {
            util.removeClass(el, "topic-in-focus");
        }
    }


    //make sure new message input block is visible
    newMessageBlockSetVisible(topicInFocus);

    //reset unread messages counter
    resetUnreadCounter(pkfp);

    //If no messages have been appended, request messages
    if(!uxTopics[pkfp].isInitialized){
        //update messages
        //load messages
        uxBus.emit(UXMessage.GET_LAST_MESSAGES, {
            pkfp: pkfp,
            howMany: INITIAL_MESSAGES_LOAD

        })
    }


}


//This function processes MESSGES_LOADED event
function processLastMessagesResponse(data){
    let { pkfp, messages, before } = data;
    let topicUXData = uxTopics[pkfp]
    console.log("PROCESSING LAST MESSAGES LOADED RESPONSE");

    let container = getTopicMessagesContainer(pkfp);

    if(!messages) return;
    for(let message of messages){

        console.log("Appending message");
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
        }, pkfp, util.$(".messages-window", container));
    }


}

//This function checks if messages were initially loaded
//and writes GET_LAST_MESSAGES request to bus if messages count
// is less than 30
//
function updateTopicMessages(pkfp, uxBus){
    let topicUXData = uxTopics[pkfp]
    if(!topicUXData.isInitialized || messagesLoaded <  INITIAL_MESSAGES_LOAD){
        uxBus.emit(UXMessage.GET_LAST_MESSAGES, {
            pkfp: pkfp,
            before: topicUXData.earliesLoadedMessage,
        })
    }
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
    uxTopics[pkfp].unreadMessagesCount = 0
    setUnreadMessagesIndicator(pkfp, uxTopics[pkfp].unreadMessagesCount)
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

    let unreadCounterLabel = topicEl.firstElementChild.children[3]

    util.html(unreadCounterLabel, "");
    num ? unreadCounterLabel.appendChild(UI.bakeUnreadMessagesElement(num)) : 1 === 1;
}

function newMessageBlockSetVisible(visible) {
    let display = !!visible ? "flex" : "none";
    util.$("#new-message-container").style.display = display
}



/**
 * This function creates all UX elements for newly added topic
 */
function addNewTopicToUX(uxBus, topic){
    //Make sure topic with such pkfp does not exist
    let topicsList = util.$("#topics-list")
    let topics = Array.from(util.$$(".side-block-data-list-item", topicsList)).filter(item=>item.getAttribute("pkfp") === topic.pkfp)
    if(topics.length > 0) return

    //Creating messages area
    let messageBlocksContainer = util.$("#topic-message-blocks-container")
    //Creating side panel elements
    let topicListItem = UI.bakeTopicListItem(topic, uxBus);
    let topicAssets = UI.bakeTopicAssets(topic, uxBus);
    console.log("Baked");

    //Adding new elements to view
    util.appendChildren(topicsList, [topicListItem, topicAssets])
    let topicMessageBlock = UI.bakeTopicMessagesBlock(topic.pkfp, topic.name)
    util.appendChildren(messageBlocksContainer, topicMessageBlock)

    uxTopics[topic.pkfp] = new TopicUXData()
}





function processNewInviteClick() {
    if (topicInFocus) {
        chat.requestInvite(topicInFocus);
    } else {
        console.log("No topic in focus");
    }
}




function processCtxBootClick() {
    console.log("booting participant")
    let topicPkfp = topicInFocus;
    let asset = getActiveTopicAsset()
    let participantPkfp = asset.getAttribute("pkfp")
    chat.bootParticipant(topicPkfp, participantPkfp)

}

function processCtxAliasClick(uxBus) {

    //console.log("Alias button clicked");
    //Rename topc, or member or invite

    let topicInFocus = getTopicInFocusData()
    return


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

function getTopicInFocusData(){

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


function processCtxDeleteClick(uxBus) {
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

    if (util.hasClass(topicAsset, "invite-list-item")) {
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

export const UXMessage = {
    TO_LOGIN: Symbol("to_login"),
    TO_REGISTRATION: Symbol("to_registration"),
    CONNECTION_LOST: Symbol("conn_lost"),
    LOGIN_CLICK: Symbol("login_click"),
    LOGIN_PROGRESS: Symbol("login_progress"),
    LOGIN_SUCCESS: Symbol("login_success"),
    LOGIN_ERROR: Symbol("login_error"),
    REGISTER_CLICK: Symbol("reg_click"),
    REGISTER_PROGRESS: Symbol("reg_prog"),
    REGISTER_SUCCESS: Symbol("reg_succ"),
    REGISTER_ERROR: Symbol("reg_err"),
    BUTTON_CLICK: Symbol("btn_click"),
    BUTTON_DBL_CLICK: Symbol("btndbl_click"),
    CREATE_TOPIC_REQUEST: Symbol("create_topic_request"),
    TOPIC_JOIN_REQUEST: Symbol("topic_join_request"),
    TOPIC_LOADED: Symbol("topic_loaded"),

    // Main menu click message
    MAIN_MENU_CLICK: Symbol("main_menu_click"),

    // Event fired when user clicks on topic list item on the side panel
    TOPIC_CLICK: Symbol("topic_click"),
    // Double click on toipc list item on the side panel
    TOPIC_DBLCLICK: Symbol("topic_double_click"),

    //User clicks on expand/collapse icon on topic list item
    TOPIC_EXPAND_ICON_CLICK: Symbol("topic_expand_icon_click"),

    PARTICIPANT_CLICK: Symbol("participant_click"),
    PARTICIPANT_DBLCLICK: Symbol("participant_dblclick"),
    INVITE_CLICK: Symbol("invite_click"),
    INVITE_DBLCLICK: Symbol("invite_dblclick"),
    CONTEXT_MENU: Symbol("context_menu"),
    SEND_BUTTON_CLICK: Symbol("send_button_click"),
    ATTACH_FILE_ICON_CLICK: Symbol("attach_file"),
    CANCEL_PRIVATE_MESSAGE: Symbol("private_cancel"),
    MESSAGE_AREA_KEY_PRESS: Symbol("msg_key_press"),

    //UX Requests for messages
    GET_LAST_MESSAGES: Symbol("get_last_messages"),
    LAST_MESSAGES_RESPONSE: Symbol("get_last_messages"),
    NEW_MESSAGE: Symbol("new_message"),


    SEND_CHAT_MESSAGE: Symbol("send_chat_message")

}
