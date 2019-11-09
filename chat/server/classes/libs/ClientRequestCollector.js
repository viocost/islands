const EventEmitter = require('events');
const Err = require("./IError.js");
const Logger = require("./Logger");

class ClientRequestCollector extends EventEmitter{

    constructor(connectionManager = Err.required()){
        super();
        this.registerConnectionManager(connectionManager);

    }

    registerConnectionManager(connectionManager){
        this.conncectionManager = connectionManager;
        this.setConnectionManagerListeners(this.conncectionManager);
    }

    setConnectionManagerListeners(connectionManager){
        connectionManager.on("client_connected", connectionId =>{
            console.log("Client connected");
            let socket = connectionManager.getSocketById(connectionId);
            socket.on("message", (request)=>{
                Logger.debug(`Got message from client: ${request.headers.command}`, {cat: "chat"})
                this.emit(request.headers.command, request, connectionId);
            });
        });
    }
}

module.exports = ClientRequestCollector;
