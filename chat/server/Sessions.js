const { MessageTypes, SessionEvents } = require("../common/Session")


//This object holds all active sessions that serve a particular vault
//There could be only one sessions object per vault
class Sessions{
    constructor(vault, requestEmitter){
        this._vault = vault;
        this._sessions = [];
        this._requestEmitter = requestEmitter
    }

    add(session){
        session.on(SessionEvents.MESSAGE, (msg)=>{
            this._requestEmitter.acceptMessage(msg, session.getId())
        })
        this._sessions.push(session)
    }

    get pausedSessions(){
        return this._sessions.filter(session =>{
            return session.isPaused()
        })
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods



    _subscribeToSessionEvents(session){
        session.on("kill_me", ()=>{

        })

    }

    _getSession(socket){
        for (let session of this._sessions){

        }
    }
}

module.exports.Sessions = Sessions;
