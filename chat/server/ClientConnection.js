const { EventEmitter }


class ClientConnection extends EventEmitter{

    constructor(){
        super()
    }

    getReconnectInfo(){
        throw new Error()
    }

    send(){
        throw new Error()
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
