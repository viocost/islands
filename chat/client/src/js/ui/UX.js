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
    messageBus.on(UXMessage.TO_LOGIN, ()=>{
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

function initRegistration(){
    let registrationBlock = UI.bakeRegistrationBlock(()=>{
        console.log("Registration handler");
    })

    util.appendChildren("#main-container", registrationBlock)
}

function initLogin(stateMachine, eventName, args){
    let uxBus = args[0]
    uxBus.on(UXMessage.LOGIN_PROGRESS, stateMachine.handle.start)
    uxBus.on(UXMessage.LOGIN_ERROR, stateMachine.handle.loginError)
    uxBus.on(UXMessage.LOGIN_SUCCESS, stateMachine.handle.loginSuccess)
    let loginBlock = UI.bakeLoginBlock(()=>{
        let passwordEl = util.$("#vault-password");
        uxBus.emit(UXMessage.LOGIN_CLICK, passwordEl.value)
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
    setImmediate(()=>{
        loadingOn()
        let loginBtn = util.$("#vault-login-btn")
        loginBtn.setAttribute("disabled", true);
    })
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


function handleRegistrationError(){

}


function initMainInterface(){

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
                final: true
            },

            loggedIn: {
                entry: initMainInterface,
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
        uxBus.emit(ev, ...args);
    }
}

export const UXMessage = {
    TO_LOGIN: Symbol("to_login"),
    TO_REGISTRATION: Symbol("to_registration"),
    LOGIN_ERROR: Symbol("login_error"),
    CONNECTION_LOST: Symbol("conn_lost"),
    LOGIN_CLICK: Symbol("login_click"),
    LOGIN_PROGRESS: Symbol("login_progress"),
    LOGIN_SUCCESS: Symbol("login_success")
}
