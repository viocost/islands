import { ConnectorEvents, ConnectorAbstractFactory } from "../../../../common/Connector";
import { Message } from "../../../../common/Message"
import { AuthMessage } from "../../../../common/AuthMessage"

//The purpose of reconnection agent is
//to re-establish lost connection, re-authenticate and hand the connector
//to the invoker.
//
class ReconnectionAgent{
    //This properties are set by factory
    onSuccess;
    onStart; //optional function that runs first thing when run is invoked
    onTimeout;
    timeLimit;
    runTimeout = 2000; //timeout before first attempt to reconnect
    secret

    constructor(secret){
        this.secret = secret
        console.log(`Reconnection agent initialized! Secret: ${secret}`);
        if(this.timeLimit){
            this.deadline = new Date() + this.timeLimit
        }

    }


    run(){

        console.log(`Reconnection agent running! Secret: ${this.secret}`);
        if(typeof this.onStart === "function") this.onStart();
        let connector = this._prepareConnector(this.secret)
        setTimeout(()=>{
            if(new Date() >= this.deadline){
                console.log("TIMEOUT reached");
                this.onTimeout()
                return;
            }
            connector.connect()
        }, this.runTimeout)
    }

    _prepareConnector(secret){
        let connectorFactory = ConnectorAbstractFactory.getChatConnectorFactory()
        let connector = connectorFactory.make(secret)

        connector.on(ConnectorEvents.CONNECTING, ()=>{
            console.log("connector connecting");
        })

        connector.once(ConnectorEvents.CONNECTED, ()=>{
            console.log("Reconnection successful Awaiting auth OK message");
        })

        connector.on(ConnectorEvents.DEAD, this.onTimeout)


        connector.on("*", (event, data)=>{
            console.log(`message received: ${event.toString()}, ${data}`);
        })


        connector.on("auth", msg=>{
            console.log(`Auth message received ${msg.headers.command}`);
            msg = Message.from(msg)
            switch(msg.command){
                case(AuthMessage.AUTH_OK): {
                    console.log("AUTH OK");
                    this.onSuccess(connector)
                }
            }
        })

        return connector
    }
}


export class ClientReconnectionAgentFactory{
    make({ onStart, onSuccess, onTimeout, timeLimit, runTimeout, secret }){
        let agent = new ReconnectionAgent(secret)
        agent.onSuccess = onSuccess;
        agent.onTimeout = onTimeout;
        agent.timeLimit = timeLimit;
        agent.runTimeout = runTimeout;
        agent.onStart = onStart;
        return agent
    }
}


