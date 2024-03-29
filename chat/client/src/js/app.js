import { LoginAgent, LoginAgentEvents } from "./lib/LoginAgent";
import { ConnectorAbstractFactory } from "./../../../common/Connector"
import { IslandsVersion } from "../../../common/Version"
import { PostLoginInitializer } from "./lib/PostLoginInitializer"
import { MessageBus } from "../../../common/MessageBusDep"
import { TopicCreator } from "./lib/Topic"
import { SendMessageAgent } from "./lib/SendMessageAgent"
import { TopicJoinAgent } from "./lib/TopicJoinAgent"
import { Internal } from "../../../common/Events"
import { PasswordChangeAgent } from "./lib/PasswordChangeAgent"
import { BootParticipantAgent } from "./lib/BootParticipantAgent";
import { register } from "./lib/Registration";
import * as UX from "./ui/UX"
import { UXMessage } from "./ui/Common"
import * as Common from "./ui/Common"



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
    uxBus.on(UXMessage.REGISTER_CLICK, register.bind(null, uxBus))
    uxBus.emit(UXMessage.TO_REGISTRATION)
}

function prepareLogin(uxBus) {
    let loginAgent = new LoginAgent(ConnectorAbstractFactory.getChatConnectorFactory(), uxBus)

    loginAgent.on(LoginAgentEvents.DECRYPTION_ERROR, () => {
        uxBus.emit(UXMessage.LOGIN_ERROR, "Invalid password.")
    })

    //Setting handler for correct password
    loginAgent.on(LoginAgentEvents.SUCCESS, (session, vault) => {
        console.log("Login agent succeeded. continuing initialization");

        // TODO put settings
        uxBus.emit(UXMessage.LOGIN_SUCCESS, vault.settings)
        /**
            * PostLoginInitiazlier should initialize vault, topics and
            * Ask server to initialize hidden services for active topcis
            * Once succeed, it should return a hashmap of topics and the vault
            */
        let postLoginInitializer = new PostLoginInitializer(session, vault, uxBus)
        postLoginInitializer.on(PostLoginInitializer.Success, (vault, topics) => {
            console.log("Post login succeeded. Continuing...");

            // Subscribing each topic to uxBus and
            // notifying UX about each topic loaded
            for(let topic in vault.topics){
                setTimeout(()=>{
                    uxBus.emit(UXMessage.TOPIC_LOADED, vault.topics[topic])
                }, 100)
            }



            if(isDebug()){
                //TEST only
                window.vault = vault;
                window.session = session;
            }

            // This handles create topic request
            uxBus.on(UXMessage.CREATE_TOPIC_REQUEST, data=>{
                let { nickname, topicName } = data
                let tc = new TopicCreator(nickname, topicName, session, vault, uxBus)
                tc.run()
            })


        })

        postLoginInitializer.on(PostLoginInitializer.Fail, err => {
            uxBus.emit(UXMessage.LOGIN_ERROR, err.message)
        })

        postLoginInitializer.run();
    })

    uxBus.on(UXMessage.LOGIN_CLICK, initSession.bind(null, loginAgent, uxBus))
    uxBus.emit(UXMessage.TO_LOGIN)
}


function initSession(loginAgent, uxBus, data) {
    let password = data.password;

    uxBus.emit(UXMessage.LOGIN_PROGRESS)
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
    window.Common = Common;
    window.sendNMessages = function(topic, interval=50, n=10, str = `TEST MESSAGE`){

        let i=0;

        function _sendMsg(){
            console.log(`Sending message ${i}`);
            uxBus.emit(topic, {
                pkfp: topic,
                message: Common.UXMessage.SEND_CHAT_MESSAGE,
                chatMessage: `${str} ${i}`
            })

            if(i<n){
                i++;
                setTimeout(_sendMsg, interval)
            }
        }

        _sendMsg()

    }


    window.sendNMessagesSync = function(topic,  n=10, str = `TEST MESSAGE`){
        for(let i=0; i<n; i++){

            let message = `${str} ${i}`;

            uxBus.emit(topic, {
                pkfp: topic,
                message: Common.UXMessage.SEND_CHAT_MESSAGE,
                chatMessage: message
            })
        }
    }

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

