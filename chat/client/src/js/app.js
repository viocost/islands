import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { ConnectorAbstractFactory } from "./../../../common/Connector"
import { IslandsVersion } from "../../../common/Version"
import { PostLoginInitializer } from "./lib/PostLoginInitializer"
import { MessageBus } from "../../../common/MessageBus"
import { TopicCreator } from "./lib/TopicCreator"
import { SendMessageAgent } from "./lib/SendMessageAgent"
import { TopicJoinAgent } from "./lib/TopicJoinAgent"
import { Internal } from "../../../common/Events"
import { PasswordChangeAgent } from "./lib/PasswordChangeAgent"
import { BootParticipantAgent } from "./lib/BootParticipantAgent";
import { register } from "./lib/Registration";
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

    loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, () => {
        uxBus.emit(UX.UXMessage.LOGIN_ERROR, "Invalid password.")
    })

    //Setting handler for correct password
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

            // This handles create topic request
            uxBus.on(UX.UXMessage.CREATE_TOPIC_REQUEST, data=>{
                let { nickname, topicName } = data
                let tc = new TopicCreator(nickname, topicName, session, vault)
                tc.run()
            })

        })

        postLoginInitializer.on(PostLoginInitializer.Fail, err => {
            uxBus.emit(UX.UXMessage.LOGIN_ERROR, err.message)
        })

        postLoginInitializer.run();
    })

    uxBus.on(UX.UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
    uxBus.emit(UX.UXMessage.TO_LOGIN)
}

function initSession(loginAgent, uxBus, data) {
    let password = data.password;

    uxBus.emit(UX.UXMessage.LOGIN_PROGRESS)
    console.log("Init session called");



    //Setting handler for wrong password

    //Here we need a really small delay
    //in order for UI to work properly

    setTimeout(() => {
        loginAgent.acceptPassword(password);

    }, 200)
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

    window.joinTopic = function(nickname, topicName, inviteString){
       
        let vault = window.vault;
        let arrivalHub = vault.arrivalHub;
        let connector = vault.connector;
        let topicJoinAgent = new TopicJoinAgent(nickname, topicName, inviteString, arrivalHub, connector, vault);

        topicJoinAgent.on(Internal.JOIN_TOPIC_SUCCESS, (data)=>{
            // data is object: { pkfp: pkfp, nickname: nickname }
            console.log("Topic join successful");
        })
        topicJoinAgent.on(Internal.JOIN_TOPIC_FAIL, ()=>{ console.log("Join topic fail received from the agent")})
        topicJoinAgent.start()

    }


    window.changePassword = (passwd)=>{
        let passwordChangeAgent = new PasswordChangeAgent(passwd, passwd, window.vault);
        passwordChangeAgent.run()
    }


    window.bootParticipant = (topic, participantPkfp)=>{
        let agent = new BootParticipantAgent(topic, participantPkfp, vault.connector)
        agent.boot()

    }

}

