const { ClientSession } = require("./Session")


//This object holds all active sessions that serve a particular vault
//There could be only one sessions object per vault
class Sessions{
    constructor(vault){
        this._vault = vault;
        this._sessions = [];
    }

    add(session){
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
