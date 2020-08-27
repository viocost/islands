const { ClientSession } = require("./Session")


//This object holds all active sessions that serve a particular vault
//There could be only one sessions object per vault
class Sessions{
    constructor(vault){
        this._vault = vault;
        this._sessions = [];
    }

    //Socket here is socket wrapper around socket.io
    add({socket, publicKey, encryptedPrivateKey}){
        if(socket.handshake.query){
            for(let session of this._sessions){
                if(session.doesDecrypt(socket.handshake.query)){
                    session.replaceSocket(socket)
                    return
                }
            }
        }

        console.log("No existing session was able to decrypt challenge. Creating new session");
        let session = new ClientSession(socket, publicKey, encryptedPrivateKey);
        this._sessions.push(session);
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
