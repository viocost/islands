import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { ConnectorAbstractFactory } from "./../../../common/Connector"
import { IslandsVersion } from "../../../common/Version"
import { PostLoginInitializer } from "./lib/PostLoginInitializer"
import { MessageBus } from "../../../common/MessageBus"
import { Vault } from "./lib/Vault";
import { TopicCreator } from "./lib/TopicCreator"
import { SendMessageAgent } from "./lib/SendMessageAgent"
import * as UX from "./ui/UX"


document.addEventListener('DOMContentLoaded', event => {
    IslandsVersion.setVersion(islandsVersion())
    console.log(`Islands version is ${IslandsVersion.getVersion()}`);

    let uxBus = new MessageBus();

    isDebug() && enableDebug(uxBus)

    UX.initialize(uxBus);
    isRegistration() ? prepareRegistration(uxBus)
        : prepareLogin(uxBus)

});


function prepareRegistration(uxBus) {
    uxBus.on(UX.UXMessage.REGISTER_CLICK, register.bind(null, uxBus))
    uxBus.emit(UX.UXMessage.TO_REGISTRATION)
}

function prepareLogin(uxBus) {
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
    uxBus.on(UX.UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
    uxBus.emit(UX.UXMessage.TO_LOGIN)
}

function initSession(loginAgent, uxBus, data) {
    let password = data.password;

    uxBus.emit(UX.UXMessage.LOGIN_PROGRESS)
    console.log("Init session called");

    //Here we need a really small delay
    //in order for UI to work properly
    setTimeout(() => {
        loginAgent.acceptPassword(password);
        loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, () => {
            uxBus.emit(UX.UXMessage.LOGIN_ERROR, "Invalid password.")
        })

        loginAgent.on(LoginAgentEvents.SUCCESS, (session, vault) => {
            console.log("Login agent succeeded. continuing initialization");

            /**
             * PostLoginInitiazlier should initialize vault, topics and
             * Ask server to initialize hidden services for active topcis
             * Once succeed, it should return a hashmap of topics and the vault
             */
            let postLoginInitializer = new PostLoginInitializer(session, vault)
            postLoginInitializer.on(PostLoginInitializer.Success, (vault, topics) => {
                console.log("Post login succeeded. Continuing...");

                // TODO put settings
                uxBus.emit(UX.UXMessage.LOGIN_SUCCESS, {soundOn: true})

                if(isDebug()){
                    //TEST only
                    window.vault = vault;
                    window.session = session;
                }

            })

            postLoginInitializer.on(PostLoginInitializer.Fail, err => {
                uxBus.emit(UX.UXMessage.LOGIN_ERROR, err.message)
            })

            postLoginInitializer.run();

        })
    }, 200)
}


function register(uxBus,  data ) {
    uxBus.emit(UX.UXMessage.REGISTER_PROGRESS)


    setTimeout(()=>{
        Vault.registerAdminVault(data.password, data.confirm, IslandsVersion.getVersion())
            .then(() => {
                uxBus.emit(UX.UXMessage.REGISTER_SUCCESS)
            })
            .catch(err => {
                uxBus.emit(UX.UXMessage.REGISTER_ERROR, err)
            })

    }, 200)

}



/**
 * Given initialized topics and vault sets up events and messages for the UX bus
 */
function wireAllTogether(vault, topics, uxBus) {
    uxBus.emit(UX.UXMessage.LOGIN_SUCCESS);

}



function enableDebug(uxBus){
    console.log("Enabling debug mode!");
    window.uxBus = uxBus

    window.createTopic = function(nickname, topicName){

        let tc = new TopicCreator(nickname, topicName, window.session, window.vault)
        tc.run()
    }


    window.sendMessageTest =  function (msg, topic){
        let sendMessageAgent = new SendMessageAgent(topic, msg)
        return sendMessageAgent.send();
    }

    window.deleteTopic = function(pkfp){
        vault.deleteTopic(pkfp)
    }
}

