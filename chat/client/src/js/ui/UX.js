import * as UI from "../lib/ChatUIFactory";
import { IslandsVersion } from "../../../../common/Version"
import * as util from "../lib/dom-util";
import { StateMachine } from "../../../../common/AdvStateMachine"
import { BlockingSpinner } from "../lib/BlockingSpinner";
import toastr from "../lib/toastr";
import "../../css/chat.sass"
import "../../css/vendor/loading.css";

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


export function initialize(messageBus){
    let sm = prepareUIStateMachine()
    console.log("Initializing UI");

    //events
    messageBus.on(UXMessage.TO_LOGIN, ()=>{
        console.log("UI TO LOGIN");
        sm.handle.toLogin(messageBus)
    })

    messageBus.on(UXMessage.TO_REGISTRATION, ()=>{
        sm.handle.toRegistration(messageBus)
    })

}


function loadingOn() {
    spinner.loadingOn()
}

function loadingOff() {
    spinner.loadingOff()
}

function initRegistration(stateMachine, eventName, args){
    console.log("Initializing UX registration");
    let uxBus = args[0];

    uxBus.on(UXMessage.REGISTER_PROGRESS, (subscriptionId)=>{
        util.$("#register-vault-btn").setAttribute("disabled", true)
        uxBus.on(UXMessage.REGISTER_SUCCESS, stateMachine.handle.registrationSuccess);
        uxBus.on(UXMessage.REGISTER_ERROR, stateMachine.handle.registrationError );
        stateMachine.handle.start()

    })
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        let password = util.$("#new-passwd");
        let confirm = util.$("#confirm-passwd");
        uxBus.emit(UXMessage.REGISTER_CLICK, {password: password, confirm: confirm})
    })

    util.appendChildren("#main-container", registrationBlock)
}


function initLogin(stateMachine, eventName, args){
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


function handleLoginError(stateMachine, eventName, args){
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
 * Preparing main interface and other handlers
 */
function handleLoginSuccess(stateMachine, eventName, args) {

    let settings = args[1]
    let uxBus = args[0]
    //let vault = vaultHolder.getVault();
    let header = util.$("header")

    //////////////////////////////////////////////////////////
    // let isSoundOn = !vault.hasOwnProperty("settings") || //
    //     !vault.settings.hasOwnProperty("sound") ||       //
    //     vault.settings.sound;                            //
    //////////////////////////////////////////////////////////
    util.removeAllChildren(header);

    util.appendChildren(header, [
        UI.bakeHeaderLeftSection((menuButton) => {
            util.toggleClass(menuButton, "menu-on");
            renderLayout()
        }),
        //UI.bakeHeaderRightSection(false, settings.soundOn , processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
        UI.bakeHeaderRightSection(false, settings.soundOn , ()=>{}, ()=>{}, ()=>{}, ()=>{})
    ])

    let main = util.$("main")
    util.removeAllChildren(main);

    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, mainContainer)
    let sidePanel = UI.bakeSidePanel(IslandsVersion.getVersion());
    //newMessageBlock = UI.bakeNewMessageControl(sendMessage, processAttachmentChosen);
    let newMessageBlock = UI.bakeNewMessageControl(()=>{}, ()=>{});
    let messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);
    setupSidePanelListeners(uxBus,  stateMachine)
    setupHotkeysHandlers()
    refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;
    renderLayout()

    // modals
    //topicCreateModal = UI.bakeTopicCreateModal(createTopic)
    topicCreateModal = UI.bakeTopicCreateModal()


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


    //util.$("#remove-private").addEventListener("click", removePrivate);
    util.$("#remove-private").addEventListener("click", undefined);
    util.$("#messages-panel-container").onscroll = undefined //processChatScroll;
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

function handleRegistrationSuccess(){
    loadingOff()
    util.$("#register-vault-btn").removeAttribute("disabled");
    let mainContainer = util.$('#main-container');

    util.removeAllChildren(mainContainer);
    util.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(() => {
        document.location.reload()
    }))
}

function handleRegistrationError(stateMachine, eventName, args){
    loadingOff()

    util.$("#register-vault-btn").removeAttribute("disabled");
    toastr.warning(`Registration error: ${args[0] || ""}`)
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

function refreshTopics(){

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
    uxBus.emit(UXMessage.ALIAS_BUTTON_CLICK, topicInFocus);
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
                transition: {
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
                        state: "registrationSuccess"
                    }
                }

            },


            registrationSuccess: {
                entry: handleRegistrationSuccess,
                final: true
            },

            loggedIn: {
                entry: [ loadingOff ],
                transitions: {
                    disconnect: {

                    },

                    newMessage: {

                    },

                    messageSent: {

                    },

                    createTopic: {
                        state: "creatingTopic"
                    }

                }

            },

            creatingTopic: {
                transitions: {
                    cancel: {

                    },

                    create: {

                    },

                    topicCreated: {

                    },

                    error: {

                    }
                }
               
            },

            joiningTopic: {

            }

        }
    })
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

    ALIAS_BUTTON_CLICK: Symbol("alias_click"),
}
