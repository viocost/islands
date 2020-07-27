const { EventEmitter } = require("events")
const err = require("../common/Error")


class ClientConnection extends EventEmitter{
    constructor(){
        super()
        if(this.constructor === ClientConnection){
            throw new err.AttemptToInstatiateBaseClass()
        }
    }

    getReconnectInfo(){
        throw new err.NotImplemented()
    }

    send(){
        throw new err.NotImplemented()
    }


}


class SocketIOClientConnection extends ClientConnection{

    constructor(socket){
        super()
        this._socket = socket;
        this._socket.on()

    }

    getReconnectInfo(){
        return this._socket.handshake.query...
    }

    send(){
        try{
            //send
        }catch(err){

            this.emit("error", error)
            // On error shutdown, close socket, emit error
        }
    }

}


module.exports = {
    SocketIOClientConnection: SocketIOClientConnection
}
