const { WildEmitter } = require("./WildEmitter");
const io = require("socket.io-client");
const { StateMachine } = require("./AdvStateMachine");
const { createDerivedErrorClasses } = require("./DynamicError");

class ConnectorError extends Error{ constructor(data){ super(data); this.name = "ConnectorError" } }

const err = createDerivedErrorClasses(ConnectorError, {
    notImplemented: "NotImplemented",
    notSupported: "NotSupported"
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

    disconnect(){
        throw new err.notImplemented()
    }

    destroy(){
        throw new err.notImplemented()
    }

    hasConnectionQuery(){
        throw new err.notImplemented()
    }
}

class ConnectorSocketIO extends Connector{
    constructor(connectionString, secret, reconnectAttepmts, reconnectTimeout){
        super();
        this._sm = this._prepareStateMachine()
        this._socket = this._prepareSocket(connectionString, secret, reconnectAttepmts, reconnectTimeout)
    }

    send(event, data){
        this._sm.handle.send({event: event, data: data})
    }



    connect(query, attempts, timeout){
        console.log("Connector connecting");
        this._sm.handle.connect(attempts, timeout)
    }

    disconntct(){
        this._socket.disconnect();
    }

    destroy(){
        throw new err.notImplemented()
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
        }, { msgNotExistMode: StateMachine.Warn  })
    }

    _prepareSocket(connectionString, query, reconnectAttempts, reconnectTimeout){

        console.log(`PREPARING SOCKET! ${query}, ${connectionString}`);
        let parameters = {
            reconnection: false,
            autoConnect: false,
            upgrade: false
        }

        if(query){
            console.log(`Setting query to ${query}`);
            parameters.query = {
                params: query
            }
        }

        let socket = io(connectionString, parameters);

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
        });

        socket.on('connect_timeout', ()=>{
            this._sm.handle.error({
                reconnectAttempts: reconnectAttempts,
                reconnectTimeout: reconnectTimeout
            })
        })

        socket.on('connect_error', (err) => {
            console.log(`Connection error: ${err}`);
            this._sm.handle.error({
                reconnectAttempts: reconnectAttempts,
                reconnectTimeout: reconnectTimeout
            })
        });


        socket.on("*", (event, data)=>{
            this.emit(event, data)
        })

        return socket;
    }
}

class ConnectorSocketIOPassive extends Connector{
    constructor(socket){
        super()
        this.sm = this._prepareStateMachine()
        this._socket = socket

        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet) {
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }

        socket.on("disconnect", ()=>{
            this.sm.handle.disconnect()
            console.log("Session socket has disconnected");

        }),



        socket.on("*", (ev, data)=>{
            this.emit(ev, data)
        })

    }

    send(event, data){
        this._socket.emit(event, data);
    }

    connect(){
        throw new err.notSupported()
    }

    hasConnectionQuery(){
        console.log(`Connection query is ${JSON.stringify(this._socket.handshake.query.params)}`);
        return this._socket.handshake.query.params !== undefined
    }

    getConnectionQuery(){
        return this._socket.handshake.query.params
    }

    _handleSend(args){
        this.socket.emit(...args)
    }

    _handleReceived(){

    }

    _handleDisconnect(){
        this.emit(ConnectorEvents.DEAD)
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "SocketIO Passive Connector SM",
            stateMap: {
                active: {
                    initial: true,
                    transitions: {
                        send: {
                            actions: this._handleSend.bind(this)
                        },

                        handleReceived: {
                            actions: this._handleReceived.bind(this)
                        },

                        disconnect: {
                            actions: this._handleDisconnect.bind(this),
                            state: "dead"

                        }


                    }
                },

                dead: {
                    final: true
                }
            }
        })
    }

}

class ConnectorSocketIOFactory{
    constructor(connectPath){
        this.connectPath = connectPath;
    }


    make(secret){
        return new ConnectorSocketIO(this.connectPath, secret, 20, 10000)
    }
}

class ConnectorSocketIOPassiveFactory{
    make(socket){
        return new ConnectorSocketIOPassive(socket)
    }
}


class ConnectorAbstractFactory{
    static getChatConnectorFactory(){
        return new ConnectorSocketIOFactory("/chat")
    }

    static getDataConnectorFactory(){
        return new ConnectorSocketIOFactory("/data")
    }

    static getServerConnectorFactory(){
        return new ConnectorSocketIOPassiveFactory()
    }

}


const ConnectorEvents = {
    CONNECTING: Symbol("connecting"),
    CONNECTED: Symbol("connect"),
    DEAD: Symbol("dead"),
}

module.exports = {
    ConnectorEvents: ConnectorEvents,
    ConnectorAbstractFactory: ConnectorAbstractFactory
}
