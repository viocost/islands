const { MessageTypes, SessionEvents } = require("../common/Session")


//This object holds all active sessions that serve a particular vault
//There could be only one sessions object per vault
class Sessions{
    constructor(requestEmitter){
        this._sessions = [];
        this._requestEmitter = requestEmitter

        this[Symbol.iterator] = function * (){
            for(let session of this._sessions){
                yield session;
            }
        }
    }

    add(session){
        session.on(SessionEvents.MESSAGE, (msg)=>{
            this._requestEmitter.acceptMessage(msg, session.getId())
        })
        this._sessions.push(session)
    }

    getActive(){
        return this._sessions.filter(session=> !session.isPaused())[0]
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
