import * as UI from "../lib/ChatUIFactory";
import * as util from "../lib/dom-util";
import { StateMachine } from "../../../../common/AdvStateMachine"
import { LoginAgent, LoginAgentEvents } from "../lib/LoginAgent";
import { ConnectorAbstractFactory } from "../../../../common/Connector"
import { BlockingSpinner } from "../lib/BlockingSpinner";

let spinner = new BlockingSpinner();

export function initialize(messageBus){
    let sm = prepareUIStateMachine()

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
    console.log("Initializing login agent");
    let messageBus = args[0]
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
    let loginBlock = UI.bakeLoginBlock(initSession.bind(null, loginAgent))
    util.appendChildren("#main-container", loginBlock)
}


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


function handleRegistrationError(){

}



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


export const UXMessage = {
    TO_LOGIN: Symbol("to_login"),
    TO_REGISTRATION: Symbol("to_registration"),
    LOGIN_ERROR: Symbol("login_error"),
    REGISTRATION_ERROR: Symbol("reg_error"),
    OUTGOING_MESSAGE: Symbol("out_msg"),
    CONNECTION_LOST: Symbol("conn_lost"),
}
