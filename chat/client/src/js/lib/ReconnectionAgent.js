import { ConnectorEvents } from "../../../../common/Connector";

//The purpose of reconnection agent is
//to re-establish lost connection, re-authenticate and hand the connector
//to the invoker.
class ReconnectionAgent{
    constructor({ onSuccess, onTimeout, timeLimit, runTimeout, connectorFactory }){
        this.onSuccess = onSuccess;
        this.onTimeout = onTimeout;
        this.timeLimit = timeLimit;
        this.runTimeout = runTimeout;
        this.connectorFactory = connectorFactory;
    }

    run(){
        let connector = this.connectorFactory.make()
        connector.once(ConnectorEvents.CONNECTED, ()=>this.onSuccess(connector))
    }

}
