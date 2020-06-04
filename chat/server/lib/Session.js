const { EventEmitter } = require('events');

class Session extends EventEmitter{
    constructor(socket){
        super()
        this.socket = socket

        this.socket.on("message", msg=>{
            this.emit("message" ,msg);
        })

        this.socket.on("disconnect", ()=>{
            this.emit("disconnect");
        })

    }
}

module.exports = Session;
