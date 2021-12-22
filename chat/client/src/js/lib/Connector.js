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

class ConnectorSocketIO extends Connector{
    constructor(connectionString, query){
        super();
        this._sm = this._prepareStateMachine()
        this._socket = this._prepareSocket(connectionString, query)
    }

    send(event, data){
        this._sm.handle.send({event: event, data: data})
    }


    connect(attempts, timeout){
        console.log("Connector connecting");
        this._sm.handle.connect(attempts, timeout)
    }

    destroy(){
        throw new err.notImplemented()
    }

    hasConnectionQuery(){
        return this._socket.handshake && this._socket.handshake.query
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // State machine handlers

    _handleConnect(args){
        this._socket.open();
    }

    _handleConnectError(args){
        let { reconnectAttempts, reconnectTimeout } = args[0]
        if(reconnectAttempts){
            setTimeout(()=>{
                this._sm.handle.connect()
            }, reconnectTimeout)
        } else {
            this._sm.handle.expired();
        }
    }

    _handleConnecting(args){
        this.emit(ConnectorEvents.CONNECTING)
    }

    _handleConnected(args){

        this.emit(ConnectorEvents.CONNECTED)
    }



    _handleSend(args){
        let { event, data } = args[0]
        this._socket.emit(event, data);
    }

    _handleIncomingMessage(args){
        let { event, data } = args[0]
        this.emit(event, data)
       
    }
   
    _handleDead(args){
        this.emit(ConnectorEvents.DEAD)

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

                    }
                },

                connecting: {
                    entry: this._handleConnecting.bind(this),
                    transitions: {
                        connected: {
                            state: "connected",
                        },

                        connect: {
                            state: "connecting",
                            actions: this._handleConnect.bind(this)
                        },

                        error: {
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
                    entry: this._handleDead.bind(this),
                    final: true
                }


            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }


    _prepareSocket(connectionString, query){

        let socketOptions = {
            reconnection: false,
            autoConnect: false,
            upgrade: false
        }

        if(query){
            socketOptions.query = query
        }

        let socket = io(connectionString, socketOptions);


        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet) {
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }

        socket.on('connect', () => {
            this._sm.handle.connected();
        });


        socket.on('disconnect', ()=>{
            this._sm.handle.expired()
            this.emit("disconnect")
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

class ConnectorSocketIOFactory{
    constructor(connectPath){
        this.connectPath = connectPath;
    }

    make(){
        return new ConnectorSocketIO(this.connectPath)
    }
}

export class ConnectorAbstractFactory{
    static getChatConnectorFactory(){
        return new ConnectorSocketIOFactory("/chat")
    }

    static getDataConnectorFactory(){
        return new ConnectorSocketIOFactory("/data")
    }

}


export const ConnectorEvents = {
    CONNECTING: Symbol("dead"),
    CONNECTED: Symbol("connect"),
    DEAD: Symbol("dead"),
}
