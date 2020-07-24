const SocketIO = require('socket.io');
const EventEmitter = require('events');
const ID_SIZE = 6
const Err = require("./IError.js");
const Logger = require("./Logger.js");

/**
 * Manages client->island connections
 * adds and removes listeners
 * keeps track of active sockets
 */
class ClientConnector extends EventEmitter{

    constructor(server = Err.required("Missing required parameter.")){
        super();
        this.io = SocketIO.listen(server);
        this.socketHub = this.io.of("/chat");
        this.socketHub.on('connection', this.setSocketListenersOnNewChatConnection.bind(this))
        this.dataSocketHub = this.io.of("/file");

        this.dataSocketHub.on('connection', this.setSocketListenersOnNewDataConnection.bind(this))
    }


    /**
     *
     * @param message
     * @param data: arbitrary object
     * @param connectionId - translates to socketID
     */
    send(connectionId = Err.required("Missing required parameter connectionId"),
         message = Err.required("Missing required parameter message"),
         data = Err.required("Missing required parameter data")){
        let client = this.getSocketById(connectionId);
        if(!client || !client.connected){
            throw new Error("Error sending message: client is not connected.");
        }

        client.emit(message, data);
    }


    setSocketListenersOnNewChatConnection(socket){
        console.log(`SOCKET HUB CONNECTION: socket id: ${socket.id}`)
        this.emit("client_connected", socket.id);
        socket.on("disconnect", (reason)=>{
            Logger.verbose("Client disconnected: " + socket.id)
            this.emit(socket.id,  "client_disconnected")
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log(`Client reconnected: ${socket.id}`);
            this.emit(socket.id,  "client_reconnected")
        });

        socket.on("error", (err)=>{
            Logger.error(`Client socket error: ${err.message}`, {stack: err.stack});

            this.emit(socket.id, "error", err)
        })

        socket.on("message", msg =>{
            this.emit(socket.id, "message", msg)
        })

    }

    setSocketListenersOnNewDataConnection(socket){

        console.log("File socket connected");
        this.emit("data_channel_opened", socket);
        console.log("After data_channel_opened emit")
        socket.on("disconnect", (reason)=>{
            this.emit("data_channel_closed", socket.id);
        });

        socket.on("reconnect",  (attemptNumber) => {
            this.emit("data_channel_reconnection", socket.id);
        })

        socket.on("error", (err)=>{
            Logger.error("Data socket error: " + err)
        })

    }

    getHost(connectionId){
        if(this.socketHub.sockets[connectionId]){
            const socket = this.socketHub.sockets[connectionId];
            const host = socket.handshake.headers.host
            console.log(`Get host called. Host: ${host}`);
            return host;
        }

        return null;
    }

    isAlive(socketId){
        return (this.socketHub.sockets[socketId] && this.socketHub.sockets[socketId].connected);
    }

    getSocketById(id){
        if(!this.socketHub.sockets[id]){
            Logger.error(`Socket not found: ${id}, \nExisting sockets: ${JSON.stringify(Object.keys(this.socketHub.sockets))}`, {cat: "connection"})
            throw new Error("Socket does not exist: " + id);
        }
        return this.socketHub.sockets[id];
    }

    getDataSocketById(id){
        if(!this.dataSocketHub.sockets[id]){
            throw new Error("Socket does not exist: " + id);
        }
        return this.dataSocketHub.sockets[id];
    }
}


module.exports = ClientConnector;
