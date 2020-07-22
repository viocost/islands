import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { iCrypto } from "../../../../common/iCrypto";


export class Connector {
    constructor(connectionString = "", ) {
        WildEmitter.mixin(this);
        this.socket = this._createSocket(connectionString);
        this.socketInitialized = false;
        this.connectorStateMachine = this._prepareConnectorStateMachine()
        this.acceptorStateMachine = this._prepareAcceptorStateMachine()
        this.pingCount = 0;
        this.queue = [];
        this.maxUnrespondedPings = 10;
        this.reconnectionDelay = 4000;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 8;
        this.killSocket = false;
        this.keyAgent;
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
        console.trace()
        this.connectorStateMachine.handle.connect();
    }

    getConnectionState(){
        return this.connectorStateMachine.state;
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _decryptSessionKey(stateMachine, evName, args){
        let sessionKey = args[0];
    }

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
            console.log(`Socket error: ${err}`)
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

    _prepareAcceptorStateMachine(){
        return new StateMachine(this, {
            name: "Accept input from user SM",
            stateMap: {
                inactive: {
                    transitions: {
                        activate: {
                            state: "acceptingMessages",
                        },
                    }
                },

                acceptingMessages: {
                    entry: ()=>{ console.log("Now accepting messages") },
                    initial: true,
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
                        gotSessionKey: {
                            entry: ()=>{ console.log("AWATING SESSION KEY") },
                            state: ConnectionState.DECRYPTING_SESSION_KEY,
                            actions: this._decryptSessionKey
                        }
                    }

                },

                decryptingSessionKey: {
                    transitions: {
                        decryptionSuccess: {
                            state: ConnectionState.AWATING_AUTH_RESULT
                        }

                    }
                },

                awatingAuthResult: {
                    transitions: {
                        sessionEstablished: {

                        },

                        error: {

                            state: ConnectionState.DISCONNECTED,
                            actions: this._notifyError
                        }
                    }

                },

                decryptionError: {

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
    DECRYPTION_ERROR: "decryptionError",
    AWATING_AUTH_RESULT: "awatingAuthResult",
    SESSION_ESTABLISHED: "session_established",
    RECONNECTING: "reconnecting"
}
