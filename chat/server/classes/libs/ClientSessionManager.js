const ClientSession = require("../objects/ClientSession.js");
const Err = require("./IError.js");
const Logger = require("../libs/Logger.js");
const { Internal, Events } = require("../../../common/Events")
const { EventEmitter } = require("events")



class ClientSessionManager extends EventEmitter{
    constructor(clientConnector = Err.required(),
                vaultManager = Err.required()){
        super()
        // Sessions are stored by vaultID
        this.sessions = {};
        this.clientConnector = clientConnector;
        this.topicToSessionMap = {};
        this.vaultManager = vaultManager;
        this.clientConnector.on("client_connected", this._processClientConnected.bind(this))
    }


    _processClientConnected(connectionId){

        //Executed when new client connects
        if(this.sessions.hasOwnProperty(connectionId)) return

        //let socket = clientConnector.getSocketById(connectionId);
        console.log("Client connected!");
        const session = new ClientSession(this.clientConnector, connectionId);
        this.sessions[connectionId] = session;

        //get host


        //obtain public key and private encrypted key

        //supply it to session

        console.log("Session created");
    }

    _associateVaultWithSession(socket){

        // this must be provided to indentify session
        // Session is identified by Vault id
        let vaultId = socket.handshake.query.vaultn
        let host = socket.handshake.headers.host;

        console.log(`Vault id on client_connected: ${vaultId}, `, socket.handshake.query);


        if(!vaultId){
            console.log("NO VAULT ID");
            Logger.warn("Warning: no vaultID provided at the connection.", {cat: "session"})
            return;
        }
        if(this.sessions.hasOwnProperty(vaultId)){
            console.log(`Session exists. Adding connection...`);
            self.sessions[vaultId].addConnection(connectionId);
        } else {
            console.log(`Session does not exist. Creating...`);
            let topicsIds = self.vaultManager.getTopicsIds(vaultId);
            let newSession = new ClientSession(vaultId, connectionId, clientConnector, topicsIds);
            this.sessions[vaultId] = newSession;

            //Adding topic to session mapping
            for(let pkfp of newSession.topics){
                self.topicToSessionMap[pkfp] = newSession;
            }

            newSession.on(Internal.KILL_SESSION, (session)=>{
                Logger.debug(`Killing session ${session.id} on timeout`)
                //Clearing topic to session mapping
                for(let pkfp of Object.keys(session.topics)){
                    delete self.topicToSessionMap[pkfp];
                }
                delete this.sessions[session.id]
            })

            newSession.on(Internal.TOPIC_ADDED, (pkfp)=>{
                Logger.debug(`Topic ${pkfp} added for session ${newSession.id}`, {
                    cat: "session"
                })
                self.topicToSessionMap[pkfp] = newSession;
            })

            newSession.on(Internal.TOPIC_DELETED, (pkfp)=>{
                Logger.debug(`Topic ${pkfp} deleted for session ${newSession.id}`, {
                    cat: "session"
                })
                delete self.topicToSessionMap[pkfp];
            })
        }

        // Checking if reconnect. If last seen messages Ids provided, assuming reconnect
        let lastMsgIds = socket.handshake.query.lastMessagesIds;

        if(lastMsgIds){
            //And emiting it for service manager
            console.log("Assuming reconnect");
            this.emit(Internal.MESSAGES_SYNC, lastMsgIds, connectionId)
        }
    }

    _provideVaultToSession(session){

    }

    //Given participant's pkfp returns active session if exists
    getSession(pkfp){
        return this.topicToSessionMap[pkfp];
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
        if (this.topicToSessionMap.hasOwnProperty(pkfp)){
            return this.topicToSessionMap[pkfp]
        } else {
            console.log(`No active sessions found for ${pkfp}` );
        }
    }







}

module.exports = ClientSessionManager;
