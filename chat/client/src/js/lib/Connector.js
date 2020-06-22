import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import * as CuteSet from "cute-set";
import { StateMachine } from "./AdvStateMachine";

export class Connector{


    constructor(connectionString=""){
        WildEmitter.mixin(this);
        this.socket = this.createSocket(connectionString);
        this.socketInitialized = false;
        this.stateMachine = this.prepareStateMachine()


        this.pingCount = 0;

        this.maxUnrespondedPings = 10;
        this.reconnectionDelay = 4000;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 8;
        this.killSocket = false;

    }


    createSocket(connectionString){
        let socketConfig = {
            reconnection: false,
            autoConnect: false,
            upgrade: false
            //pingInterval: 10000,
            //pingTimeout: 5000,
        }

        let socket = io(`${connectionString}`, socketConfig);

        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet){
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }
        //End

        socket.on("ping", ()=>{
            this.pingPongCount++;
            if (this.pingPongCount > this.maxUnrespondedPings){
                console.log("socket pings are not responded. Resetting connection");
                socket.disconnect();
                attempted = 0
                setTimeout(attemptConnection, reconnectionDelay)
            }
        })

        socket.on("pong", ()=>{
            this.pingPongCount = 0;
        })

        socket.on('connect', ()=>{
            console.log("Island connection established");
            this.stateMachine.handle.connected()
        });


        socket.on("*", (event, data)=>{
            console.log(`Got event: ${event}`);
            this.emit(event, data);
        })

        socket.on('reconnecting', (attemptNumber)=>{
            this.stateMachine.handle.reconnecting()
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log(`Successfull reconnect client after ${attemptNumber} attempt`)
            this.stateMachine.handle.connected();
        });

        socket.on('error', (err)=>{
            this.stateMachine.handle.error();
            console.error(`Socket error: ${err}`)
            this.connectionAttempts = 0;
            console.log("Resetting connection...")
        })

        socket.on("disconnect", ()=>{
            this.stateMachine.handle.processDisconnect();
        });

        socket.on('connect_error', (err)=>{

            this.stateMachine.handle.error();
            if (this.connectionAttempts < this.maxConnectionAttempts){
                console.log("Connection error on attempt: " + this.connectionAttempts + err);
                this.connectionAttempts += 1;
                setTimeout(this.attemptConnection, reconnectionDelay);
            } else {
                console.log('Connection Failed');
            }

        });


        socket.on('connect_timeout', (err)=>{
            this.stateMachine.handle.error();
            console.log('Chat connection timeout');
        });


        return socket;
    }

    prepareStateMachine(){
        return new StateMachine({
            disconnected: {
                connect: {
                    state: ConnectionState.CONNECTING,
                    after: this.connectLambda()
                },

            },

            connecting:{
                connected: {
                    state:  ConnectionState.CONNECTED,
                    after: ()=>{ this.emit(Internal.CONNECTION_STATE_CHANGED) }
                },
                error: {
                    state: ConnectionState.ERROR
                },
            },

            reconnecting:{
                connected: { state: ConnectionState.CONNECTED },
                error: { state: ConnectionState.ERROR }
            },

            connected:{
                processDisconnect: {
                    state: ConnectionState.DISCONNECTED,
                    after: ()=>{
                        this.emit(Internal.CONNECTION_STATE_CHANGED)
                        setTimeout(()=>{
                            this.stateMachine.handle.connect()
                        }, this.reconnectionDelay);
                    }
                },

                disconnectSocket: {
                    on: ()=>{ this.killSocket }
                },

                sendMessage: {


                },

                error: { state: ConnectionState.ERROR }
            },

            error:{
                connect: {
                    state: ConnectionState.CONNECTING,
                    after: this.connectLambda()
                }
            },

        }, ConnectionState.DISCONNECTED, StateMachine.Warn, true, "CONNECTOR SM");
    }

    transitionState(){
        this.emit(Internal.CONNECTION_STATE_CHANGED, this.stateMachine.state);
    }

    setConnectionQueryProperty(k, v){
        if(!this.socket.io.opts.query) this.socket.io.opts.query = {};
        this.socket.io.opts.query[k] = typeof v !== "string" ? JSON.stringify(v) : v;
    }


    connectLambda(){
        return ()=>{
            this.connectionAttempts++;
            this.socket.open();
        }
    }

    establishConnection(){
        this.stateMachine.handle.connect();
    }

    isConnected(){
        return this.socket.connected;
    }

    send(msg){
        this.stateMachine.handle.sendMessage(msg);

        if(!this.isConnected()){
            console.error("Socket disconnected. Unbale to send message.");
            this.emit(Internal.CONNECTION_ERROR, msg);
            return
        }


        try{
            this.socket.send(msg);
            console.log("Message sent!");
        }catch (err){
            console.error(`Internal error sending message: ${err.message}`);
            this.emit(Internal.CONNECTION_ERROR, msg);
        }

    }

    //TODO Refactor
    async establishConnectionBAK(connectionAttempts = 7, reconnectionDelay = 5000){
        return new Promise((resolve, reject)=>{
            let self = this;

            let upgrade = !!this.upgradeToWebsocket;
            if (self.socket && self.socket.connected){
                resolve();
                return;
            }

            let attempted = 0;
            let pingPongCount = 0;
            let maxUnrespondedPings = 10;
            function attemptConnection(){
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
