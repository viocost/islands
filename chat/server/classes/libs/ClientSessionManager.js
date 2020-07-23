const { ClientSession } = require("../../lib/ClientSession");
const Err = require("./IError.js");
const Logger = require("../libs/Logger.js");
const { Internal, Events } = require("../../../common/Events")
const { EventEmitter } = require("events")
const { ClientSessionAdapter } = require("../../lib/ClientSessionAdapter");



class ClientSessionManager extends EventEmitter{
    constructor(clientConnector = Err.required(),
                vaultManager = Err.required(),
                clientRequestEmitter = Err.required()){
        super()

        // sessions used to be collection of connections groupped per vault id
        // now, however sessions are responsible for a single connection
        // Session adapters now serve as vault to session mappers
        // session keys are socket IDs
        this.sessions = {};

        // Session adapters hold sessions
        // keys are vault IDs
        this.sessionAdapters = {}
        this.clientConnector = clientConnector;
        this.topicToSessionMap = {};
        this.clientRequestEmitter = clientRequestEmitter;
        this.vaultManager = vaultManager;
        this.clientConnector.on("client_connected", this._processClientConnected.bind(this))
    }

    //adapter function used in many managers
    broadcastMessage(vaultId, message){
        if(vaultId in this.sessionAdapters){
            this.sessionAdapters.broadcastMessage(message);
        }
    }

    _processClientConnected(connectionId){

        //Executed when new client connects
        if(this.sessions.hasOwnProperty(connectionId)) return

        //let socket = clientConnector.getSocketById(connectionId);
        console.log("Client connected!");
        const session = new ClientSession(this.clientConnector, connectionId, this.clientRequestEmitter);
        this.sessions[connectionId] = session;

        //get host
        let host = this.clientConnector.getHost(connectionId)
        let vaultId = this.vaultManager.getVaultId(host);
        this.sessionAdapters
        let publicKey = this.vaultManager.getVaultPublicKey(vaultId);
        let vault = this.vaultManager.getVault(vaultId);

        if(!this.sessionAdapters.hasOwnProperty(vaultId)){
            this.sessionAdapters[vaultId] = this._initializeSessionAdapter(vaultId)
        }

        this.sessionAdapters[vaultId].addSession(session)

        session.acceptAsymKey(publicKey, vault)
        console.log("Session created");
    }

    _initializeSessionAdapter(vaultId){
        let vaultPublicKey = this.vaultManager.getVaultPublicKey(vaultId)
        let adapter = new ClientSessionAdapter({vaultId: vaultId, publicKey: vaultPublicKey});
        let topicIds = this.vaultManager.getTopicsIds(vaultId)
        for(let topicId of topicIds){
            adapter.addTopic(topicId)
        }

        return adapter
    }

    _associateVaultWithSession(socket){

        // this must be provided to indentify session
        // Session is identified by Vault id

        let host = socket.handshake.headers.host;
        let vaultId = this.vaultManager.getVaultId(host)

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


    //Given participant's pkfp returns active session if exists
    getSession(pkfp){
        return this.getSessionByTopicPkfp(pkfp);
    }

    getSessionByConnectionId(connectionId = Err.required()){
        for(let adapterId in this.sessionAdapters){
            if (this.sessionAdapters[adapterId].hasSession(connectionId)){
                return this.sessionAdapters[adapterId];
            }
        }
    }

    getSessionBySessionID(adapterId){
        return this.sessionAdapters[adapterId];
    }

    getSessionByTopicPkfp(pkfp){
        for(let adapterId in this.sessionAdapters){
            if (this.sessionAdapters[adapterId].doesServeTopic(pkfp)){
                return this.sessionAdapters[adapterId];
            }
        }
    }







}

module.exports = ClientSessionManager;
