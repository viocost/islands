const { Session } = require("./Session")


class Sessions{
    constructor(vault){
        this._vault = vault;
        this._sessions = [];
    }

    //Socket here is socket wrapper around socket.io
    add(socket){
        //If not reconnect possible
            // make new session
        //else
            // resume
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _getSession(socket){
        for (let session of this._sessions){

        }
    }
}
