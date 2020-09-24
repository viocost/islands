import * as UI from "../lib/ChatUIFactory";
import * as util from "../lib/dom-util";
import { StateMachine } from "../../../../common/AdvStateMachine"
import { BlockingSpinner } from "../lib/BlockingSpinner";
import toastr from "../lib/toastr";
import "../../css/chat.sass"
import "../../css/vendor/loading.css";

let spinner = new BlockingSpinner();
let handlerBuilder;

export function initialize(messageBus){
    let sm = prepareUIStateMachine()
    handlerBuilder = initHandlerBuilder(messageBus)

    //events
    messageBus.register(()=>{
        sm.handle.toLogin(messageBus)
    }, UXMessage.TO_LOGIN)

    messageBus.on(()=>{
        sm.handle.toRegistration(messageBus)
    }, UXMessage.TO_REGISTRATION)

}


function loadingOn() {
    spinner.loadingOn()
}

function loadingOff() {
    spinner.loadingOff()
}

function initRegistration(stateMachine, eventName, args){
    let uxBus = args[0];
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        let password = util.$("#new-passwd");
        let confirm = util.$("#confirm-passwd");
        uxBus.deliver(UXMessage.REGISTER_CLICK, {password: password, confirm: confirm})
    })

    util.appendChildren("#main-container", registrationBlock)
}

function initLogin(stateMachine, eventName, args){
    let uxBus = args[0]
    uxBus.register(stateMachine.handle.start, UXMessage.LOGIN_PROGRESS)
    uxBus.register(stateMachine.handle.loginError, UXMessage.LOGIN_ERROR)
    uxBus.register(stateMachine.handle.loginSuccess, UXMessage.LOGIN_SUCCESS)
    let loginBlock = UI.bakeLoginBlock(()=>{
        let passwordEl = util.$("#vault-password");
        uxBus.deliver(UXMessage.LOGIN_CLICK, { password: passwordEl.value})
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

function handleLoginSuccess(stateMachine, eventName, args) {
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
    let mainContainer = util.$('#main-container');
    util.removeAllChildren(mainContainer);
    util.appendChildren(mainContainer, UI.bakeRegistrationSuccessBlock(() => {
        document.location.reload()
    }))
}

function handleRegistrationError(stateMachine, eventName, args){
    loadingOff()

    toastr.warning(`Registration error: ${args[0] || ""}`)

}


function initMainInterface(uxBus, settings){

    //let vault = vaultHolder.getVault();
    let header = util.$("header")

    //let isSoundOn = !vault.hasOwnProperty("settings") ||
    //    !vault.settings.hasOwnProperty("sound") ||
    //    vault.settings.sound;
    util.removeAllChildren(header);

    util.appendChildren(header, [
        UI.bakeHeaderLeftSection((menuButton) => {
            util.toggleClass(menuButton, "menu-on");
            //renderLayout()
        }),
        //TODO
        //UI.bakeHeaderRightSection(false, isSoundOn, processInfoClick, processMuteClick, processSettingsClick, processLogoutClick)
        UI.bakeHeaderRightSection(false, true, ()=>{}, ()=>{}, ()=>{}, ()=>{})
    ])

    let main = util.$("main")
    util.removeAllChildren(main);

    let mainContainer = UI.bakeMainContainer()
    util.appendChildren(main, mainContainer)
    //sidePanel = UI.bakeSidePanel(chat.version);
    let sidePanel = UI.bakeSidePanel("VERSION");
    //newMessageBlock = UI.bakeNewMessageControl(sendMessage, processAttachmentChosen);
    let newMessageBlock = UI.bakeNewMessageControl(()=>{}, ()=>{});
    //messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    let messagesPanel = UI.bakeMessagesPanel(newMessageBlock)
    util.appendChildren(mainContainer, [sidePanel, messagesPanel]);
    //setupSidePanelListeners()
    //setupHotkeysHandlers()
    //refreshTopics();
    // add listener to the menu button
    window.onresize = renderLayout;
    //renderLayout()

    // modals
    //topicCreateModal = UI.bakeTopicCreateModal(createTopic)
    let topicCreateModal = UI.bakeTopicCreateModal(()=>{})


    ///////////////////////////////////////////////////////////////////
    // topicJoinModal = UI.bakeTopicJoinModal(() => {                //
    //     console.log("Joining topic")                              //
    //     let nickname = util.$("#join-topic-nickname").value;      //
    //     let topicName = util.$("#join-topic-name").value;         //
    //     let inviteCode = util.$("#join-topic-invite-code").value; //
    //     if (!nickname || !topicName || !inviteCode) {             //
    //         toastr.warning("All fields are required");            //
    //         return;                                               //
    //     }                                                         //
    //     joinTopic(nickname, topicName, inviteCode);               //
    //     toastr.info("Attempting to join topic");                  //
    //     topicJoinModal.close();                                   //
    // })                                                            //
    ///////////////////////////////////////////////////////////////////
    let topicJoinModal = UI.bakeTopicJoinModal(()=>{})

    //////////////////////////////////////////////////////////////////////////////////////////
    // setAliasModal = UI.bakeSetAliasModal(() => {                                         //
    //     console.log("Ok handler")                                                        //
    //     let newAliasEl = util.$("#modal-alias-input")                                    //
    //     let newAlias = newAliasEl.value                                                  //
    //     let subject = JSON.parse(newAliasEl.getAttribute("rename-data"))                 //
    //     switch (subject.type) {                                                          //
    //         case "topic":                                                                //
    //             console.log("Renaming topic")                                            //
    //             chat.renameTopic(subject.topicPkfp, newAlias)                            //
    //             break                                                                    //
    //         case "participant":                                                          //
    //             console.log("Renaming participant")                                      //
    //             if (subject.pkfp === subject.topicPkfp) {                                //
    //                 //change nickname                                                    //
    //                 chat.changeNickname(subject.topicPkfp, newAlias)                     //
    //             } else {                                                                 //
    //                 //change alias of another member                                     //
    //                 chat.setParticipantAlias(subject.topicPkfp, subject.pkfp, newAlias); //
    //             }                                                                        //
    //             break                                                                    //
    //         case "invite":                                                               //
    //             console.log("Renaming invite")                                           //
    //             chat.setInviteAlias(subject.topicPkfp, subject.code, newAlias);          //
    //             break                                                                    //
    //     }                                                                                //
    //     setAliasModal.close();                                                           //
    // })                                                                                   //
    //////////////////////////////////////////////////////////////////////////////////////////

    let setAliasModal = UI.bakeSetAliasModal(()=>{})
    // prepare side panel
    //let sidePanel = bakeSidePanel();
    //let messagesPanel = bakeMessagesPanel();
    //let newMessagePanel = bakeNewMessageControl();
    //let messagesWrapper = util.wrap([messagesPanel, newMessagePanel], "main-panel-container");


    //util.$("#remove-private").addEventListener("click", removePrivate);
    //util.$("#messages-panel-container").onscroll = processChatScroll;
    //UIInitialized = true;
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
                entry: [ loadingOff, initMainInterface,  ],
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


function initHandlerBuilder(uxBus){
    return function(ev, ...args){
        //uxBus.emit(ev, ...args);
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
    REGISTER_ERROR: Symbol("reg_err")
}
