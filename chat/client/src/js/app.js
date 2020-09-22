import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { ConnectorAbstractFactory } from "./../../../common/Connector"
import { IslandsVersion } from "../../../common/Version"
import { UIMessageBus } from "./lib/UIMessageBus"
import * as UX from "./ui/UX"

document.addEventListener('DOMContentLoaded', event => {
    IslandsVersion.setVersion(islandsVersion())
    console.log(`Islands version is ${IslandsVersion.getVersion()}`);
    let uxBus = new UIMessageBus();


    UX.initialize(uxBus);

    isRegistration() ? prepareRegistration(uxBus)
        : prepareLogin(uxBus)

});

function prepareRegistration(uxBus){
    uxBus.emit(UX.UXMessage.TO_REGISTRATION)
}

function prepareLogin(uxBus){
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
    uxBus.on(UX.UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
    uxBus.emit(UX.UXMessage.TO_LOGIN)
}

function initSession(loginAgent, uxBus, password) {
    uxBus.emit(UX.UXMessage.LOGIN_PROGRESS)
    console.log("Init session called");

    //Here we need a really small delay
    //in order for UI to work properly
    setTimeout(()=>{
        loginAgent.acceptPassword(password);
        loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, ()=>{
            uxBus.emit(UX.UXMessage.LOGIN_ERROR, "Invalid password.")
        })

        loginAgent.on(LoginAgentEvents.SUCCESS, (session, vault)=>{
            try{
                console.log("Login agent succeeded. continuing initialization");
                let postLoginInitializer = new PostLoginInitializer(session, vault)
                postLoginInitializer.run();
            }catch(err){

                uxBus.emit(UX.UXMessage.LOGIN_ERROR, err.message)
            }
        })
    }, 10)
}
