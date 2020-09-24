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

    let app = new App(isRegistration())
});




class App {

    static messages = [
        UX.UXMessage.REGISTER_CLICK,
        UX.UXMessage.LOGIN_CLICK,
    ]

    constructor(isRegistration){
        let uxBus = new MessageBus();
        this.uxBus = uxBus
        UX.initialize(uxBus);

        isRegistration ? this.prepareRegistration(uxBus)
            : this.prepareLogin(uxBus)


        uxBus.register(this, App.messages, this._handleBusEvent.bind(this))
    }



    prepareRegistration(uxBus) {
        //uxBus.on(UX.UXMessage.REGISTER_CLICK, register.bind(null, uxBus))
        uxBus.deleiver(this, UX.UXMessage.TO_REGISTRATION)
    }

    prepareLogin(uxBus) {
        let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory())
        uxBus.on(UX.UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
        uxBus.deliver(this, UX.UXMessage.TO_LOGIN)
    }

    initSession(loginAgent, uxBus, password) {
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
                    wireAllTogether(vault, topics, uxBus)
                })

                postLoginInitializer.on(PostLoginInitializer.Fail, err => {
                    uxBus.deliver(UX.UXMessage.LOGIN_ERROR, err.message)
                })

                postLoginInitializer.run();

            })
        }, 200)
    }


    register(uxBus, password, confirm) {
        Vault.registerAdminVault(password, confirm, IslandsVersion.getVersion())
            .then(() => {
                uxBus.deliver(UX.UXMessage.REGISTER_SUCCESS)
            })
            .catch(err => {
                uxBus.deliver(UX.UXMessage.REGISTER_ERROR, err)
            })
    }



    /**
     * Given initialized topics and vault sets up events and messages for the UX bus
     */
    wireAllTogether(vault, topics, uxBus) {
        uxBus.deliver(UX.UXMessage.LOGIN_SUCCESS);

    }


    _handleBusEvent(sender, message, data){
        let handlers = {}
        handlers[UX.UXMessage.REGISTER_CLICK] = this.register.bind(this)
        handlers[UX.UXMessage.LOGIN_CLICK] = this.initSession.bind(this)

        if(message in handlers){
            handlers[message](data)
        }
    }
}
