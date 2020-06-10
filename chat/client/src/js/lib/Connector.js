import * as io from "socket.io-client";
import { WildEmitter } from "./WildEmitter";
import { Internal } from "../../../../common/Events";
import * as CuteSet from "cute-set";
import { StateMachine } from "./StateMachine";

export class Connector extends StateMachine{
    constructor(connectionString=""){
        super({}, "disconnected", StateMachine.Warn);
        WildEmitter.mixin(this);

        //variables
        this.pingPongCount = 0;
        this.maxUnrespondedPings = 0;

        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 0;

        this.reconnectionDelay = 1500;


        //defining states
        this.addStates[
            "disconnected",
            "connecting",
            "reconnecting",
            "error",
            "connected"
        ]

        //message handlers
        this.addMessageHandlers("disconnected", {
            connect: this.connect,
        })

        this.addMessageHandlers("connecting", {
            connectionEstablished: ()=>{
                this.connectionEstablished()
                this.emit("connected");
                return "connected"
            },
        })

        this.addMessageHandlers("reconnecting", {
            connectionEstablished: ()=>{
                this.connectionEstablished()
                this.emit("connected");
                return "connected"
            },
        })

        this.addMessageHandlers("connected", {

            handleMessage: ()=>{console.log("processing message")},
            handleDisconnect: this.handleDisconnect
        })



        // Initializing socket
        this.chatSocket = io(`${connectionString}/chat`, {
            reconnection: false,
            autoConnect: false,
            upgrade: false
            //pingInterval: 10000,
            //pingTimeout: 5000,
        });

    }



    configureSocket(){
        let onevent = this.chatSocket.onevent;
        this.chatSocket.onevent = function(packet){
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }
        //End

        this.chatSocket.on("ping", ()=>{
            pingPongCount++;
            if (this.pingPongCount > maxUnrespondedPings){
                console.log("chatSocket pings are not responded. Resetting connection");
                this.chatSocket.disconnect();
                this.connectionAttempts = 0
                setTimeout(attemptConnection, reconnectionDelay)
            }
        })

        this.chatSocket.on("pong", ()=>{
            this.pingPongCount = 0;
        })

        this.chatSocket.on('connect', ()=>{
            this.handle.connectionEstablished();
        });

        this.chatSocket.on("disconnect", ()=>{
            this.transitionState(ConnectionState.DISCONNECTED);

            console.log("Island disconnected.");
            this.connectionAttempts = 0
            setTimeout(attemptConnection, reconnectionDelay);
        });

        this.chatSocket.on('connect_error', (err)=>{

            if (this.connectionAttempts < this.maxConnectionAttempts){
                console.log("Connection error on attempt: " + attempted + err);
                this.connectionAttempts += 1;
                setTimeout(attemptConnection, reconnectionDelay);
            }

        });

        this.chatSocket.on('connect_timeout', (err)=>{
            this.transitionState(ConnectionState.ERROR);
            console.log('Chat connection timeout');
            reject(err);
        });
    }



    setConnectionQueryProperty(k, v){
        if (!this.socketInitialized) throw new Error("Socket uninitialized.")
        this.chatSocket.io.opts.query[k] = typeof v === "object" ? JSON.stringify(v) : v;
    }

    connect(){
        setTimeout(this.establishConnection, 100)
        return "connecting"
    }

    handleDisconnect(){

    }

    handleReconnect(){
        return "reconnecting"
    }

    connectionEstablished(){

        if(this.socketInitialized){
            console.log("Socket reconnected");
        }

        //SOCKET INITIAL SETUP
        this.socketInitialized = true;
        console.log("Island connection established");

        this.chatSocket.on("*", (event, data)=>{
            console.log(`Got event: ${event}`);
            this.emit(event, data);
        })

        this.chatSocket.on('reconnecting', (attemptNumber)=>{
            this.handle.reconnect(attemptNumber)
        })

        this.chatSocket.on('reconnect', (attemptNumber) => {
            console.log(`Successfull reconnect client after ${attemptNumber} attempt`)
            this.handle.connectionEstablished()
        });

        this.chatSocket.on('error', (err)=>{
            console.error(`Socket error: ${err}`)
            attempted = 0;
            console.log("Resetting connection...")
            setTimeout(attemptConnection, reconnectionDelay)
        })

    }

    attemptConnection(){
                    console.log("Attempting island connection: " + attempted);

                    self.transitionState(ConnectionState.CONNECTING);
                    self.chatSocket.open()

    }

    establishConnection(vaultId, connectionAttempts = 7, reconnectionDelay = 5000){
        return new Promise((resolve, reject)=>{
            let self = this;

            let upgrade = !!this.upgradeToWebsocket;
            if (self.chatSocket && self.chatSocket.connected){
                resolve();
                return;
            }

            let attempted = 0;
            let pingPongCount = 0;
            let maxUnrespondedPings = 10;

            const socketConfig = {
                query: {
                    vaultId: vaultId
                },
                reconnection: false,
//                forceNew: true,
                autoConnect: false,
                upgrade: upgrade
            }


            socketConfig.upgrade = self.transport > 0;

            self.chatSocket = io(`${this.connectionString}/chat`, socketConfig);

            //Wildcard fix


            attemptConnection();
        })
    }


    isConnected(){
        return this.chatSocket.connected;
    }

    send(msg){
        if(!this.isConnected()){
            console.error("Socket disconnected. Unbale to send message.");
            this.emit(Internal.CONNECTION_ERROR, msg);
            return
        }


        try{
            this.chatSocket.send(msg);
            console.log("Message sent!");
        }catch (err){
            console.error(`Internal error sending message: ${err.message}`);
            this.emit(Internal.CONNECTION_ERROR, msg);
        }

    }
}

export const ConnectionState = {
    DISCONNECTED: Symbol("disconnected"),
    CONNECTED: Symbol("connected"),
    CONNECTING: Symbol("connecting"),
    RECONNECTING: Symbol("reconnecting"),
    ERROR: Symbol("error")
}
