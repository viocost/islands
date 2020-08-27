const { Session } = require("./Session")


//This object holds all active sessions that serve a particular vault
//There could be only one sessions object per vault
class Sessions{
    constructor(vault){
        this._vault = vault;
        this._sessions = [];
    }

    //Socket here is socket wrapper around socket.io
    add(socket){
        if(socket.handshake.query){
            for(let session of this._sessions){
                if(session.challengeDecrypted(session.handshake.query.challenge)){
                    session.replaceSocket(socket)
                    return
                }
            }
        }

        let session = new Session(socket);
        session.on("kill_me", ()=>{

        })
        this._sessions.push(session);
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _getSession(socket){
        for (let session of this._sessions){

        }
    }
}

module.exports.Sessions = Sessions;
