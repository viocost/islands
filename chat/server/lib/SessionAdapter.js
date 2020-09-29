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

}

module.exports = {
    SessionAdapter: SessionAdapter
}
