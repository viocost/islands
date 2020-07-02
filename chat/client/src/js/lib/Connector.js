import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import * as CuteSet from "cute-set";
import { StateMachine } from "./AdvStateMachine";

export class Connector {


    constructor(connectionString = "") {
        WildEmitter.mixin(this);
        this.socket = this.createSocket(connectionString);
        this.socketInitialized = false;
        this.connectorStateMachine = this.prepareConnectorStateMachine()
        this.acceptorStateMachine = this.prepareAcceptorStateMachine()


        this.pingCount = 0;
        this.queue = [];

        this.maxUnrespondedPings = 10;
        this.reconnectionDelay = 4000;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 8;
        this.killSocket = false;

    }


    createSocket(connectionString) {
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
            console.error(`Socket error: ${err}`)
            this.connectionAttempts = 0;
            console.log("Resetting connection...")
        })

        socket.on("disconnect", () => {
            this.connectorStateMachine.handle.processDisconnect();
        });

        socket.on('connect_error', (err) => {

            this.connectorStateMachine.handle.error();
            if (this.connectionAttempts < this.maxConnectionAttempts) {
                console.log("Connection error on attempt: " + this.connectionAttempts + err);
                this.connectionAttempts += 1;
                setTimeout(this.attemptConnection, reconnectionDelay);
            } else {
                console.log('Connection Failed');
            }

        });


        socket.on('connect_timeout', (err) => {
            this.connectorStateMachine.handle.error();
            console.log('Chat connection timeout');
        });


        return socket;
    }

    prepareAcceptorStateMachine(){
        return new StateMachine(this, {
            name: "Acceptor SM",
            stateMap: {
                inactive: {
                    transitions: {
                        activate: {
                            state: "acceptingMessages",
                        }
                    }
                },

                acceptingMessages: {
                    entry: ()=>{ console.log("Now accepting messages") },
                    initial: true,
                    transitions: {
                        acceptMessage: {
                            actions: this.performAcceptMessage
                        },

                        deactivate: {
                            state: "inactive"
                        }
                    }
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    prepareConnectorStateMachine() {
        return new StateMachine(this, {
            name: "Connector SM",
            stateMap: {
                disconnected: {
                    entry: ()=>{ console.log("Connector disconnected")},
                    initial: true,

                    transitions: {
                        connect: {
                            state: ConnectionState.CONNECTING,
                            actions: this.connect
                        },
                    }
                },

                connecting: {
                    entry:  this.emitState,
                    transitions: {
                        connected: {
                            state: ConnectionState.CONNECTED,
                        },
                        error: {
                            state: ConnectionState.ERROR
                        },

                    }
                },

                reconnecting: {
                    entry: this.emitState,
                    transitions: {
                        connected: { state: ConnectionState.CONNECTED },
                        error: { state: ConnectionState.ERROR }
                    }
                },

                connected: {
                    entry: [this.emitState, this.processQueue],

                    transitions: {
                        processDisconnect: {
                            state: ConnectionState.DISCONNECTED,
                            actions: this.scheduleReconnect
                        },

                        disconnectSocket: {
                            actions:  this.killSocket
                        },

                        processQueue: {
                            actions: this.processQueue
                        },
                        error: { state: ConnectionState.ERROR },
                    }
                },

                error: {
                    transitions: {
                        connect: {
                            state: ConnectionState.CONNECTING,
                            actions: this.connect
                        }
                    }
                },

            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }



    emitState() {
        console.log(`Emitting state ${this.connectorStateMachine.state}`);
        this.emit(Internal.CONNECTION_STATE_CHANGED, this.connectorStateMachine.state);
    }

    setConnectionQueryProperty(k, v) {
        if (!this.socket.io.opts.query) this.socket.io.opts.query = {};
        this.socket.io.opts.query[k] = typeof v !== "string" ? JSON.stringify(v) : v;
    }



    connect(){
        this.connectionAttempts++;
        this.socket.open();
    }

    scheduleReconnect(){
        setTimeout(this.connect, this.reconnectionDelay)
    }

    establishConnection() {
        this.connectorStateMachine.handle.connect();
    }

    isConnected() {
        return this.socket.connected;
    }

    send(msg) {
        console.log("Sending message");
        this.acceptorStateMachine.handle.acceptMessage(msg);
    }

    performAcceptMessage(stateMachine, evName, args){
        let msg = args[0]
        this.queue.push(msg);
        this.connectorStateMachine.handle.processQueue()
    }

    processQueue(){

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

    //TODO Refactor
    async establishConnectionBAK(connectionAttempts = 7, reconnectionDelay = 5000) {
        return new Promise((resolve, reject) => {
            let self = this;

            let upgrade = !!this.upgradeToWebsocket;
            if (self.socket && self.socket.connected) {
                resolve();
                return;
            }

            let attempted = 0;
            let pingPongCount = 0;
            let maxUnrespondedPings = 10;
            function attemptConnection() {
                console.log("Attempting island connection: " + attempted);


                self.socket.open()

            }

            const socketConfig = {
                query: {
                    vaultId: vaultId
                },
                reconnection: false,
                //                forceNew: true,
                autoConnect: false,
                //pingInterval: 10000,
                //pingTimeout: 5000,
                upgrade: upgrade
            }


            socketConfig.upgrade = self.transport > 0;

            self.socket = io(`${this.connectionString}/chat`, socketConfig);


            attemptConnection();
        })

    }

}

export const ConnectionState = {
    DISCONNECTED: "disconnected",
    CONNECTED: "connected",
    CONNECTING: "connecting",
    RECONNECTING: "reconnecting",
    ERROR: "error",
    TIMEOUT: "timeout"
}
