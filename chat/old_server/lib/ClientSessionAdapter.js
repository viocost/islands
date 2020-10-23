const Logger = require("../classes/libs/Logger");
const CuteSet = require("cute-set");
const { ClientSession } = require("../lib/ClientSession");

/**
 * this class needed to adapt new sessions to assistants.
 * It replaces multiple connection sessions.
 * Responsibilities of this class are
 * - provide compatable API for managers
 * - maintain a map of sessions to vault and session to topic
 *
 */
class ClientSessionAdapter{
    constructor({ vaultId,  vaultManager,  sessionManager, clientConnector, requestEmitter  }){
        this.id = vaultId;
        this.sessions = {}
        this.clientConnector = clientConnector;
        this.sessionManager = sessionManager;
        this.requestEmitter = requestEmitter;
        this.vaultManager = vaultManager;
        this.topics = new CuteSet();
        this.vaultPublicKey = this.vaultManager.getVaultPublicKey(vaultId)
        this._subscribe(this.sessionManager);
        this._loadTopicIds()
    }


    addSession(session){
        this.sessions[session.connectionId] = session;
    }

    hasSession(sessionId){
        return this.sessions.hasOwnProperty(sessionId)
    }


    send(message, connectionId){
        console.log("CLIENT SESSION ADAPTER SEND CALLED");
        let session = this._getSession(connectionId)
        console.dir(this.sessions)
        if(session){

            session.send(message)
        } else {
            Logger.warn(`Attempt to send message to non-existant session`, {cat: "session"})
        }
    }

    broadcast(message){
        console.log(`Broadcast called on Client sesion adapter. Sessions: ${Object.keys(this.sessions).length}`);
        for(let connectionId in this.sessions){
            this.send(message, connectionId)
        }
    }

    addTopic(topicPkfp){
    }

    deleteTopic(pkfp){
        this.topics.remove(pkfp);
    }


    doesServeTopic(pkfp){
        return this.topics.has(pkfp);
    }

    getPublicKey(){
        return this.vaultPublicKey;
    }

    _subscribe(sessionManager){
        sessionManager.on(this.id, this._processSessionManagerEvent.bind(this))
    }

    _processSessionManagerEvent(eventName, data){
        switch(eventName){
            case "client_connected":
                this._processNewClientConnection(data)
                break
        }
    }


    _processNewClientConnection(connectionId){
        let secret = this.clientConnector.getConnectionQueryParameter(connectionId, "secret");

        if(secret){
            for(let sessionId in this.sessions){
                if(this.sessions[sessionId].isSecretIdentified(secret)){
                    this._resetSessionSocket(this.sessions[sessionId], connectionId);
                    return;
                }
            }
        }

        this._createNewSession(connectionId);

    }

    _createNewSession(connectionId){
        let publicKey = this.vaultManager.getVaultPublicKey(this.id)
        let vault = this.vaultManager.getVault(this.id)
        console.log(`Client connected. Connection id: ${connectionId}`);
        if(connectionId in this.sessions){
            console.log(`Client session ${connectionId} already exist.`);
            return
        }

        let session  = new ClientSession(this.clientConnector, connectionId, this.requestEmitter)
        this.addSession(session);
        session.acceptAsymKey(publicKey, vault)
    }

    _resetSessionSocket(session, connectionId){
        console.log("Resetting socket for session");
    }

    _loadTopicIds(){

        let topicIds = this.vaultManager.getTopicsIds(this.id)
        for(let topicId of topicIds){
            this.addTopic(topicId)
        }
    }

    _getSession(connectionId){
        console.log("getSession called");
        if(connectionId){
            console.log("No connection id passed");
            return this.sessions[connectionId];
        }

        for(connId in this.sessions){
            if ( this.sessions[connId].isActive() ){
                console.log(`Found active session ${connId}`);
                console.log(`Sessions`);
                console.dir(Object.keys(this.sessions))

                return this.sessions[connId];
            }
        }


    }
}


module.exports = {
    ClientSessionAdapter: ClientSessionAdapter
}
