import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { iCrypto } from "../../../../common/iCrypto";
import { createClientIslandEnvelope } from "../../../../common/Message"


export class Connector {
    constructor(connectionString = "", ) {
        WildEmitter.mixin(this);

        this.connectorStateMachine = this._prepareConnectorStateMachine()
        this.acceptorStateMachine = this._prepareAcceptorStateMachine()
        this.socket = this._createSocket(connectionString);
        this.socketInitialized = false;
        this.pingCount = 0;
        this.queue = [];
        this.maxUnrespondedPings = 10;
        this.reconnectionDelay = 4000;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 8;
        this.killSocket = false;
        this.keyAgent;
        this._challenge;
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS


    send(msg) {
        console.log("Sending message");
        this.acceptorStateMachine.handle.acceptMessage(msg);
    }

    setKeyAgent(keyAgent){
        this.connectorStateMachine.handle.acceptKeyAgent(keyAgent);
    }

    setConnectionQueryProperty(k, v) {

        if (!this.socket.io.opts.query) {
            this.socket.io.opts.query = {};
        }

        this.socket.io.opts.query[k] = typeof v !== "string" ? JSON.stringify(v) : v;
    }

    establishConnection() {
        this.connectorStateMachine.handle.connect();
    }

    getConnectionState(){
        return this.connectorStateMachine.state;
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS


    _acceptKeyAgent(stateMachine, evName, args){
        this.keyAgent = args[0];
    }

    _resetConnectionAttempts(){
        this.connectionAttempts = 0;
    }

    _emitState(stateMachine) {
        this.emit(Internal.CONNECTION_STATE_CHANGED, stateMachine.state);
    }

    _notifyError(err){
        this.emit(Internal.CONNECTION_ERROR, err)
    }

    _connect(){
        this.connectionAttempts++;
        this.socket.open();
    }

    _scheduleReconnect(){

        if (this.connectionAttempts >= this.maxConnectionAttempts){
            console.log("Reached max connection attempts, giving up...")
            return
        }

        setTimeout(this.establishConnection.bind(this), this.reconnectionDelay)
    }

    _performAcceptMessage(stateMachine, evName, args){
        let msg = args[0]
        this.queue.push(msg);
        this.connectorStateMachine.handle.processQueue()
    }


    _processQueue(){

        if(this.queue.length === 0){
            console.log("Nothing to send");
            return;
        }

        console.log("Processing queue");
        let outbound = this.queue
        this.queue = []
        let msg
        while(msg = outbound.shift(0)){
            console.log(`Sending message ${msg}`);
            this.socket.send(msg);
        }
    }

    _createSocket(connectionString) {
        let socketConfig = {
            reconnection: false,
            autoConnect: false,
            upgrade: false
        }

        let socket = io(`${connectionString}`, socketConfig);

        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet) {
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }
        //End

        socket.on("ping", () => {
            this.pingPongCount++;
            if (this.pingPongCount > this.maxUnrespondedPings) {
                console.log("socket pings are not responded. Resetting connection");
                socket.disconnect();
                attempted = 0
                setTimeout(attemptConnection, reconnectionDelay)
            }
        })

        socket.on("pong", () => {
            this.pingPongCount = 0;
        })

        socket.on('connect', () => {
            console.log("Island connection established");
            this.connectorStateMachine.handle.connected()
        });


        socket.on("message", (msg)=>{
            this.connectorStateMachine.handle.message(msg)
        })

        socket.on("auth", msg=>{
            this.connectorStateMachine.handle.authMessage(msg)
        })

        socket.on("*", (event, data) => {
            console.log(`Got event: ${event}`);
            this.emit(event, data);
        })

        socket.on('reconnecting', (attemptNumber) => {
            this.connectorStateMachine.handle.reconnecting()
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log(`Successfull reconnect client after ${attemptNumber} attempt`)
            this.connectorStateMachine.handle.connected();
        });

        socket.on('error', (err) => {
            this.connectorStateMachine.handle.error();           
        socket.on('reconnecting', (attemptNumber) => {
        })
            this.connectorStateMachine.handle.reconnecting()
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on("disconnect", () => {
            this.connectorStateMachine.handle.processDisconnect();
        });

        socket.on('connect_error', (err) => {
            this.connectorStateMachine.handle.error(err);
        });


        socket.on('connect_timeout', () => {
            console.log('Chat connection timeout');
            this.connectorStateMachine.handle.error();
        });


        return socket;
    }

    _processAuthMessage(stateMachine, evName, args){
        console.log("Auth message received");
        let message = args[0];
        switch(message.headers.command){
            case "challenge":
                this._solveChallenge.call(this, message)
                break
        }
    }

    _solveChallenge(message){
        this._challenge = message.body;
        this.connectorStateMachine.handle.gotSessionKey(message)
    }


    _decryptSessionKey(stateMachine, evName, args){
        try{
            const { privateKeyEncrypted, sessionKey } = this._challenge;
            this.keyAgent.initializeMasterKey(privateKeyEncrypted)
            this.sessionKey = this.keyAgent.masterKeyDecrypt(sessionKey)
            this.connectorStateMachine.handle.decryptionSuccess()
        }catch(err){
            console.log(`DECRYPTION ERROR: ${err}`);
            this.connectorStateMachine.handle.decryptionError();
        }
    }

    _retryDecryption(stateMachine, evName, args){
        this.keyAgent = args[0]
        this.connectorStateMachine.handle.decryptSessionKey()
    }

    _sessionKeyEncrypt(data){
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        const ic = new iCrypto();
        ic.addBlob("msg_raw", msg)
          .setSYMKey("key", this.sessionKey)
          .AESEncrypt("msg_raw", "key", "msg_enc", true)
        return ic.get("msg_enc");
    }

    _sessionKeyDecrypt(data){
        const ic = new iCrypto();
        ic.addBlob("msg_enc", data)
          .setSYMKey("key", this.sessionKey)
          .AESDecrypt("msg_enc", "key", "msg_raw", true)
        return ic.get("msg_raw");
    }

    _prepareAcceptorStateMachine(){
        return new StateMachine(this, {
            name: "Accept input from user SM",
            stateMap: {
                inactive: {
                    initial: true,
                    transitions: {
                        activate: {
                            state: "acceptingMessages",
                        },
                    }
                },

                acceptingMessages: {
                    entry: ()=>{ console.log("Now accepting messages") },
                    transitions: {
                        acceptMessage: {
                            actions: this._performAcceptMessage
                        },

                        deactivate: {
                            state: "inactive"
                        }
                    }
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    _prepareConnectorStateMachine() {
        return new StateMachine(this, {
            name: "Connector SM",
            stateMap: {
                disconnected: {
                    entry: this._emitState,
                    initial: true,
                    transitions: {
                        connect: {
                            state: ConnectionState.CONNECTING,
                            actions: this._connect
                        },

                        acceptKeyAgent: {
                            actions: this._acceptKeyAgent
                        },

                        reconnect: {

                        }
                    }
                },

                connecting: {
                    entry:  this._emitState,
                    transitions: {
                        connected: {
                            state: ConnectionState.AWATING_SESSION_KEY,
                        },
                        error: {
                            state: ConnectionState.DISCONNECTED,
                            actions: this._notifyError
                        },

                    }
                },

                awatingSessionKey: {
                    transitions: {
                        authMessage: {
                            actions: this._processAuthMessage
                        },

                        gotSessionKey: {
                            state: ConnectionState.DECRYPTING_SESSION_KEY,
                        }
                    }
                },

                decryptingSessionKey:{
                    entry: this._decryptSessionKey,
                    transitions: {
                        decryptionSuccess: {
                            state: ConnectionState.SESSION_ESTABLISHED
                        },

                        decryptionError: {
                            state: "invalidKey"
                        }

                    }
                },

                invalidKey: {
                    entry: this._emitState,
                    transitions: {
                        acceptKeyAgent: {
                            actions: this._retryDecryption
                        },

                        decryptSessionKey: {
                            state: "decryptingSessionKey"
                        }
                    }
                },

                reconnecting: {
                    entry: this._emitState,
                    transitions: {
                        connected: { state: ConnectionState.SESSION_ESTABLISHED },
                        error: { state: ConnectionState.ERROR }
                    }
                },



                sessionEstablished: {
                    entry: [this._resetConnectionAttempts, this._emitState, this._processQueue],

                    transitions: {
                        processDisconnect: {
                            state: ConnectionState.DISCONNECTED,
                            actions: this._scheduleReconnect
                        },

                        disconnectSocket: {
                            actions:  this.killSocket
                        },

                        processQueue: {
                            actions: this._processQueue
                        },
                        error: { state: ConnectionState.ERROR },
                    }
                },

                error: {
                    entry: [this._emitState, this._scheduleReconnect],
                    transitions: {
                        connect: {
                            state: ConnectionState.CONNECTING,
                            actions: this._connect
                        }
                    }
                },
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }


}

export const ConnectionState = {
    DISCONNECTED: "disconnected",
    CONNECTING: "connecting",
    AWATING_SESSION_KEY: "awatingSessionKey",
    DECRYPTING_SESSION_KEY: "decryptingSessionKey",
    INVALID_KEY: "invalidKey",
    AWATING_AUTH_RESULT: "awatingAuthResult",
    SESSION_ESTABLISHED: "sessionEstablished",
    RECONNECTING: "reconnecting"
}
