const ClientSession = require("../objects/ClientSession.js");
const Err = require("./IError.js");
const Logger = require("../libs/Logger.js");
const Internal = require("../../../common/Events").Internal



class ClientSessionManager{
    constructor(connectionManager = Err.required(),
                requestEmitter = Err.required()){

        // Sessions are stored by vaultID
        this.sessions = {};
        this.connectionManager = connectionManager;
        this.requestEmitter = requestEmitter;
        this.registerConnectionManager(connectionManager);
    }

    registerConnectionManager(connectionManager){
        let self = this;
        connectionManager.on("client_connected", connectionId=>{

            let socket = connectionManager.getSocketById(connectionId);
            let vaultId = socket.handshake.query.vaultId;
            if(!vaultId){
                Logger.warn("Warning: no vaultID provided at the connection.", {cat: "connection"})
                return;
            }
            if(this.sessions.hasOwnProperty(vaultId)){
                console.log(`Session exists. Adding connection...`);
                self.sessions[vaultId].addConnection(connectionId);
            } else {
                console.log(`Session does not exist. Creating...`);
                let newSession = new ClientSession(vaultId, connectionId, connectionManager, requestEmitter);
                this.sessions[vaultId] = newSession;

                newSession.on(Internal.KILL_SESSION, (session)=>{
                    Logger.debug(`Killing session ${session.id} on timeout`)
                    delete this.sessions[session.id]
                })
            }
        })

        connectionManager.on("client_disconnected", connectionId=>{
            let session = self.getSessionByConnectionId(connectionId)
            if(session === undefined) return;
            session.removeConnection(connectionId);

        });

    }

    getActiveUserSessions(pkfp){
        return Object.values(this.sessions).filter(val =>{
            return val.pkfp === pkfp;
        });
    }

    getSessionByConnectionId(connectionId = Err.required()){
        for(let session of Object.keys(this.sessions)){
            if (this.sessions[session].hasConnection(connectionId)){
                return this.sessions[session];
            }
        }
    }

    getSessionBySessionID(sessionID){
        return this.sessions[sessionID];
    }

    getSessionByTopicPkfp(pkfp){
        for (let session of Object.values(this.sessions)){
            if (session.hasTopic(pkfp)){
                return session;
            } else {
                console.log(`topic not found. topics:`);
                console.log(JSON.stringify(session.topics.toArray()))
            }
        }
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
            activeConnections: JSON.stringify(activeConnections),
            cat: "chat"
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
