import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { ConnectorAbstractFactory } from "./../../../common/Connector"
import { IslandsVersion } from "../../../common/Version"
import { PostLoginInitializer } from "./lib/PostLoginInitializer"
import { MessageBus } from "../../../common/MessageBus"
import { Vault } from "./lib/Vault";
import * as UX from "./ui/UX"


document.addEventListener('DOMContentLoaded', event => {
    IslandsVersion.setVersion(islandsVersion())
    console.log(`Islands version is ${IslandsVersion.getVersion()}`);

    let uxBus = new MessageBus();
    UX.initialize(uxBus);
    isRegistration() ? prepareRegistration(uxBus)
        : prepareLogin(uxBus)

});


function prepareRegistration(uxBus) {
    //uxBus.on(UX.UXMessage.REGISTER_CLICK, register.bind(null, uxBus))
    uxBus.register(UX.UXMessage.REGISTER_CLICK, register.bind(null, uxBus))
    uxBus.deliver(UX.UXMessage.TO_REGISTRATION)
}

function prepareLogin(uxBus) {
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
    uxBus.register(UX.UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
    uxBus.deliver(UX.UXMessage.TO_LOGIN)
}

function initSession(loginAgent, uxBus, subscriptionId, args) {
    let password = args.data.password;

    uxBus.deliver(UX.UXMessage.LOGIN_PROGRESS)
    console.log("Init session called");

    //Here we need a really small delay
    //in order for UI to work properly
    setTimeout(() => {
        loginAgent.acceptPassword(password);
        loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, () => {
            uxBus.deliver(UX.UXMessage.LOGIN_ERROR, "Invalid password.")
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
         //       wireAllTogether(vault, topics, uxBus)
            })

            postLoginInitializer.on(PostLoginInitializer.Fail, err => {
                uxBus.deliver(UX.UXMessage.LOGIN_ERROR, err.message)
            })

            postLoginInitializer.run();

        })
    }, 200)
}


function register(uxBus, subscriptionId, { data }) {
    uxBus.deliver(UX.UXMessage.REGISTER_PROGRESS)


    setTimeout(()=>{
        Vault.registerAdminVault(data.password, data.confirm, IslandsVersion.getVersion())
            .then(() => {
                uxBus.deliver(UX.UXMessage.REGISTER_SUCCESS)
            })
            .catch(err => {
                uxBus.deliver(UX.UXMessage.REGISTER_ERROR, err)
            })

    }, 200)

}



/**
 * Given initialized topics and vault sets up events and messages for the UX bus
 */
function wireAllTogether(vault, topics, uxBus) {
    uxBus.deliver(UX.UXMessage.LOGIN_SUCCESS);

}


