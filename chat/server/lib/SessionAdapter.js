class SessionAdapter{
    constructor(sessions){
        this._sessions = sessions;
    }

    broadcast(msg){
        for(let session of this._sessions){
            session.acceptMessage(msg);
        }

    }

    send(msg, connectionId){
        connectionId ? this._sendWithConnectionId(msg, connectionId) :
            this._sendWithoutConnectionId(msg)

    }



    addTopic(){
        //Sessions used to track served topics but they don't do it anymore
        //Thus doing nothing here.
    }

    deleteTopic(){
        //Sessions used to track served topics but they don't do it anymore
        //Thus doing nothing here.
    }

    _sendWithoutConnectionId(msg){

        console.log("Connection id not passed. Getting any active session");
        let session = this._sessions.getActive()
        if(!session){
            console.log('Active session not found');
            return
        } else {
            console.log("Session found. Sending message");
            session.acceptMessage(msg)
        }
    }

    _sendWithConnectionId(msg, connectionId){
        console.log("Connection id passed.");
        for(let session of this._sessions){
            if (session.getId() === connectionId){
                session.acceptMessage(msg)
                return;
            }
        }

        console.log("Session with such id doesn't exist");
    }
}

module.exports = {
    SessionAdapter: SessionAdapter
}
