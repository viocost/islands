const Logger = require("../classes/libs/Logger");
const CuteSet = require("cute-set");

/**
 * this class needed to adapt new sessions to assistants.
 * It replaces multiple connection sessions.
 * Responsibilities of this class are
 * - provide compatable API for managers
 * - maintain a map of sessions to vault and session to topic
 *
 */
class ClientSessionAdapter{
    constructor({ vaultId, publicKey   }){
        this.id = vaultId;
        this.sessions = {}
        this.vaultPublicKey;
        this.toipcs = new CuteSet();

    }

    addSession(session){
        this.sessions[session.connectionId] = session;
    }

    hasSession(sessionId){
        return this.sessions.hasOwnProperty(sessionId)
    }


    send(message, connectionId){
        let session = this.sessions[connectionId]
        if(session){
            session.send(message)
        } else {
            Logger.warn(`Attempt to send message to non-existant session`, {cat: "session"})
        }
    }

    broadcast(message){
        for(connectionId in this.sessions){
            this.send(message, connectionId)
        }

    }

    addTopic(topicPkfp){
        this.topics.add(topicPkfp);
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

}


module.exports = {
    ClientSessionAdapter: ClientSessionAdapter
}
