import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { createDerivedErrorClasses } from "../../../../common/DynamicError"

class ConnectorError extends Error{ constructor(data){ super(data); this.name = "ConnectorError" } }

const err = createDerivedErrorClasses(ConnectorError, {
    notImplemented: "NotImplemented"
})


/**
 * Wrapper around whatever socket library
 */
class Connector{
    constructor(){
        WildEmitter.mixin(this);
    }

    send(){
        throw new err.notImplemented()
    }


    connect(query){
        throw new err.notImplemented()
    }

    destroy(){
        throw new err.notImplemented()
    }


}

export class ConnectorSocketIO extends Connector{
    constructor(connectionString){
        super();
        this._sm = this._prepareStateMachine()
        this._socket = this._prepareSocket(connectionString)
    }

    send(event, data){
        this._sm.handle.send({event: event, data: data})
    }


    connect(query, attempts, timeout){
        this._sm.handle.connect(attempts, timeout)
    }

    destroy(){
        throw new err.notImplemented()
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // State machine handlers

    _handleConnect(stateMachine, evName, args){
        this._socket.open();
    }

    _handleConnectError(stateMachine, evName, args){
        let { reconnectAttempts, reconnectTimeout } = args[0]
        if(reconnectAttempts){
            setTimeout(()=>{
                this._sm.handle.connect()
            }, reconnectTimeout)
        } else {
            this._sm.handle.expired();
        }


    }

    _handleSend(stateMachine, evName, args){
        let { event, data } = args[0]
        this._socket.emit(event, data);
    }

    _handleIncomingMessage(stateMachine, evName, args){
       
    }

    //End//////////////////////////////////////////////////////////////////////

    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Connector SM",
            stateMap: {
                disconnected: {
                    initial: true,
                    transitions: {
                        connect: {
                            state: "connecting",
                            actions: this._handleConnect.bind(this)
                        },

                        expired: {
                            state: "dead"
                        }
                    }
                },

                connecting: {
                    transitions: {
                        connected: {
                            state: "connected",
                        },

                        error: {
                            state: "disconnected",
                            actions: this._handleConnectError.bind(this)
                        }

                    }
                },

                connected: {
                    entry: this._handleConnected.bind(this),
                    transitions: {
                        send: {
                            actions: this._handleSend.bind(this)
                        },

                        receive: {
                            actions: this._handleIncomingMessage.bind(this)
                        },

                        expired: {
                            state: "dead"
                        }

                    }

                },

                dead: {
                    entry: this._handleDead.bind(this)
                    final: true
                }


            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    _prepareSocket(connectionString, reconnectAttempts = 5, reconnectTimeout = 4000){


        let socket = io(connectionString, {
            reconnection: false,
            autoConnect: false,
            upgrade: false
        });

        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet) {
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }

        socket.on('connect', () => {
            this.emit("connected")
        });


        socket.on('disconnect', ()=>{
            this._sm.handle.expired()

        });

        socket.on('connect_timeout', ()=>{
            this._sm.handle.error({
                reconnectAttempts: reconnectAttempts,
                reconnectTimeout: reconnectTimeout
            })
        })

        socket.on('connect_error', (err) => {
            this._sm.handle.error({
                reconnectAttempts: reconnectAttempts,
                reconnectTimeout: reconnectTimeout
            })
        });



        return socket;
    }
}
