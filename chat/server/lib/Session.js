const { EventEmitter } = require('events');

class Session extends EventEmitter{
    constructor(webService){
        super()
        this.webService = webService

        this.webService.on("message", msg=>{
            this.emit("message" ,msg);
        })


        this.webService.on("disconnect", msg=>{
            this.emit("disconnect")
        })
    }
}

module.exports = Session;
