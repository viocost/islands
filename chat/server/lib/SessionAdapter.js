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
        for(let session of this._sessions){
            if (session.getId() === connectionId){
                session.acceptMessage(msg)
                break;
            }
        }
    }

    addTopic(){
        //Sessions used to track served topics but they don't do it anymore
        //Thus doing nothing here.
    }

    deleteTopic(){
        //Sessions used to track served topics but they don't do it anymore
        //Thus doing nothing here.
    }

}

module.exports = {
    SessionAdapter: SessionAdapter
}
