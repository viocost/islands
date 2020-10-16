import * as UI from "../lib/ChatUIFactory";
import { IslandsVersion } from "../../../../common/Version"
import * as util from "../lib/dom-util";
import { StateMachine } from "../../../../common/AdvStateMachine"
import { BlockingSpinner } from "../lib/BlockingSpinner";
import { Events } from "../../../../common/Events"
import "../../css/chat.sass"
import "../../css/vendor/loading.css";
import toastr from "../lib/toastr";
let spinner = new BlockingSpinner();


// ---------------------------------------------------------------------------------------------------------------------------
// CONSTANTS
const SMALL_WIDTH = 760; // Width screen in pixels considered to be small
const XSMALL_WIDTH = 400;
const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let colors = ["#cfeeff", "#ffcc7f", "#b5ffc0", "#ccfffb", "#67fcf0", "#f8e6ff", "#ffe6f1", "#ccefff", "#ccf1ff"]

// modals
let topicCreateModal;
let topicJoinModal;
let setAliasModal;

let topicInFocus;

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
<<<<<<< HEAD
    createChatInterface()
=======
    createChatInterface(uxBus)
>>>>>>> ux-refactoring

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
    uxBus.on(UXMessage.SEND_BUTTON_CLICK, sendMessage);

    //Handling key presses while in new message area
    uxBus.on(UXMessage.MESSAGE_AREA_KEY_PRESS, processMessageAreaKeyPress)
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
function sendMessage(){
    console.log("SENDING MESSAGE!");
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
    console.log("Adding topic to UX");
    let topicsList = util.$("#topics-list")

    let topics = Array.from(util.$$(".side-block-data-list-item", topicsList)).filter(item=>item.getAttribute("pkfp") === topic.pkfp)
    if(topics.length > 0) return


    let messageBlocksContainer = util.$("#topic-message-blocks-container")

    console.log("Baking UX elements");
    let topicListItem = UI.bakeTopicListItem(topic, uxBus);
    let topicAssets = UI.bakeTopicAssets(topic, uxBus);
    console.log("Baked");
    util.appendChildren(topicsList, [topicListItem, topicAssets])
    let topicMessageBlock = UI.bakeTopicMessagesBlock(topic.pkfp, topic.name)
    util.appendChildren(messageBlocksContainer, topicMessageBlock)
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
    switch(data.subject){

    }
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

}
