const ClientSession = require("../objects/ClientSession.js");
const Err = require("./IError.js");
const Logger = require("../libs/Logger.js");



class ClientSessionManager{
    constructor(connectionManager = Err.required()){
        this.sessions = {};
        this.connectionManager = connectionManager;
        this.registerConnectionManager(connectionManager);
    }

    registerConnectionManager(connectionManager){

        connectionManager.on("client_disconnected", connectionId=>{
            console.log("processing client disconnect!");
            this.processSocketDisconnected(connectionId);
        });
    }

    getActiveUserSessions(pkfp){
        return Object.values(this.sessions).filter(val =>{
            return val.getClientPkfp() === pkfp;
        });
    }

    getSessionByConnectionId(connectionID = Err.required()){
        return this.sessions[connectionID];
    }

    getSessionBySessionID(sessionID){
        return Object.values(this.sessions).filter((val)=>{
            return val.sessionID === sessionID;
        });
    }


    createSession(pkfp, connectionId, sessionID){
        const sessions = this.getSessionBySessionID(sessionID);
        if (sessions.length > 0){
            this.cleanupZombieSessions(sessions);
        }

        this.registerSession(new ClientSession(pkfp, connectionId, sessionID));
        console.log("\nCreated new session. ConnectionId: " + connectionId);
        console.log("Sessions: " );
        Object.keys(this.connectionManager.socketHub.sockets).forEach(socketId=>{
            console.log("Key: "+ socketId + " Val: " + this.connectionManager.socketHub.sockets[socketId].id);
        })
        console.log("\n")
    }


    cleanupZombieSessions(sessions = Err.required()){
        sessions.forEach((session)=>{
            delete this.sessions[session.getConnectionID()];
        })
    }

    registerSession(session){
        if (!(session instanceof ClientSession)){
            throw new Error("Invalid session type");
        }
        this.sessions[session.getConnectionID()] = session;
    }

    processSocketDisconnected(connectionId){
        if (this.sessions.hasOwnProperty(connectionId)){
            delete this.sessions[connectionId];
        }
        console.log("\nProcessing disconnect. ConnectionId: " + connectionId)
        console.log("Sockets: " )
        Object.keys(this.connectionManager.socketHub.sockets).forEach(socketId=>{
            console.log("Key: "+ socketId + " Val: " + this.connectionManager.socketHub.sockets[socketId].id);
        })
        console.log("\n")
    }


    broadcastUserResponse(pkfp, response){
        const activeConnections = this.getActiveUserSessions(pkfp);
        activeConnections.forEach((session)=>{
            this.connectionManager.sendResponse(session.getConnectionID(), response)
        })
    }

    broadcastServiceMessage(pkfp, message){
        const activeConnections = this.getActiveUserSessions(pkfp);
        activeConnections.forEach((session)=>{
            this.connectionManager.sendServiceMessage(session.getConnectionID(), message)
        })
    }

    sendServiceMessage(connectionId, message){
        this.connectionManager.sendServiceMessage(connectionId, message)
    }

    broadcastServiceRecord(pkfp, record){
        const activeConnections = this.getActiveUserSessions(pkfp);
        activeConnections.forEach((session)=>{
            this.connectionManager.sendServiceRecord(session.getConnectionID(), record)
        })
    }

    broadcastChatMessage(pkfp, message){
        const activeConnections = this.getActiveUserSessions(pkfp);
        Logger.verbose("Broadcasting chat message",{
            pkfp: pkfp,
            activeConnections: JSON.stringify(activeConnections)
        });
        activeConnections.forEach((session)=>{
            this.connectionManager.sendChatMessage(session.getConnectionID(), message)
        })
    }

    isSessionActive(pkfp){
        const sessions = this.getActiveUserSessions(pkfp);
        return sessions.length > 0;
    }

}

module.exports = ClientSessionManager;
