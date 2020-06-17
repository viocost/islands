import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import * as CuteSet from "cute-set";
import { StateMachine } from "./StateMachine";

export class Connector{
    constructor(connectionString=""){
        WildEmitter.mixin(this);
        this.socket = createSocket(connectionString);
        this.socketInitialized = false;
        this.stateMachine = this.prepareStateMachine()
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
            pingPongCount++;
            if (pingPongCount > maxUnrespondedPings){
                console.log("socket pings are not responded. Resetting connection");
                socket.disconnect();
                attempted = 0
                setTimeout(attemptConnection, reconnectionDelay)
            }
        })

        socket.on("pong", ()=>{
            pingPongCount = 0;
        })

        socket.on('connect', ()=>{
            console.log("Island connection established");
            this.stateMachine.handle.connected()
        });


        socket.on("*", (event, data)=>{
            console.log(`Got event: ${event}`);
            self.emit(event, data);
        })

        socket.on('reconnecting', (attemptNumber)=>{
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log(`Successfull reconnect client after ${attemptNumber} attempt`)
            this.stateMachine.handle.connected();
        });

        socket.on('error', (err)=>{
            stateMachine.handle.error();
            console.error(`Socket error: ${err}`)
            attempted = 0;
            console.log("Resetting connection...")
        })

        socket.on("disconnect", ()=>{

            stateMachine.handle.disconnect();

            console.log("Island disconnected.");
            attempted = 0
            setTimeout(attemptConnection, reconnectionDelay);
        });

        self.socket.on('connect_error', (err)=>{

            self.stateMachine.handle.error();
            self.transitionState();
            if (attempted < connectionAttempts){
                console.log("Connection error on attempt: " + attempted + err);
                attempted += 1;
                setTimeout(attemptConnection, reconnectionDelay);
            } else {
                console.log('Connection Failed');
                reject(err);
            }

        });

        self.socket.on('connect_timeout', (err)=>{
            self.stateMachine.handle.error();
            console.log('Chat connection timeout');
        });


        return socket;
    }

    prepareStateMachine(){
        return new StateMachine({
            disconnected: {
                connect: [this.connectLambda(), ConnectionState.CONNECTING]
                //connecting: [ ()=>undefined,   ConnectionState.CONNECTING ]
            },

            connecting:{
                connected: [()=>undefined, ConnectionState.CONNECTED],
                error: [()=>undefined, ConnectionState.ERROR],
                timeout: [()=>undefined, ConnectionState.TIMEOUT]
            },

            reconnecting:{
                connected: [()=>undefined, ConnectionState.CONNECTED],
                error: [()=>undefined, ConnectionState.ERROR]
            },

            connected:{
                disconnect: [()=>undefined, ConnectionState.DISCONNECTED]
            },

            error:{
                connecting: [()=>undefined, ConnectionState.CONNECTING]
            },

        }, ConnectionState.DISCONNECTED, StateMachine.Warn, true);
    }

    transitionState(){
        this.emit(Internal.CONNECTION_STATE_CHANGED, this.stateMachine.state);
    }

    setConnectionQueryProperty(k, v){
        if (!this.socketInitialized) throw new Error("Socket uninitialized.")
        this.socket.io.opts.query[k] = typeof v === "object" ? JSON.stringify(v) : v;
    }


    connectLambda(){
        return ()=>{
            if(this.socket && this.socket.connected){
                this.stateMachine.handle.connected()
                return;
            }

        }
    }

    establishConnection(){

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

                self.stateMachine.handle.connecting();

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


    isConnected(){
        return this.socket.connected;
    }

    send(msg){
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
}

export const ConnectionState = {
    DISCONNECTED: "disconnected",
    CONNECTED: "connected",
    CONNECTING: "connecting",
    RECONNECTING: "reconnecting",
    ERROR: "error",
    TIMEOUT: "error"
}
