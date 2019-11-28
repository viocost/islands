import * as io from "socket.io-client";
import { WildEmitter } from "./WildEmitter";
import { Internal } from "../../../../common/Events";

export class Connector{
    constructor(){
        WildEmitter.mixin(this);
        this.chatSocket;
    }

    async establishConnection(vaultId, connectionAttempts = 7, reconnectionDelay = 8000){
        return new Promise((resolve, reject)=>{
            let self = this;
            let upgrade = !!this.upgradeToWebsocket;
            if (self.chatSocket && self.chatSocket.connected){
                resolve();
                return;
            }

            let attempted = 0;

            function attemptConnection(){
                console.log("Attempting island connection: " + attempted);
                self.chatSocket.open()
            }

            const socketConfig = {
                query: {
                    vaultId: vaultId
                },
                reconnection: false,
                forceNew: true,
                autoConnect: false,
                pingInterval: 10000,
                pingTimeout: 5000,
                upgrade: upgrade
            }

            socketConfig.upgrade = self.transport > 0;

            self.chatSocket = io('/chat', socketConfig);

            //Wildcard fix
            let onevent = self.chatSocket.onevent;
            self.chatSocket.onevent = function(packet){
                let args = packet.data || [];
                onevent.call(this, packet);
                packet.data = ["*"].concat(args);
                onevent.call(this, packet)
            }
            //End


            self.chatSocket.on('connect', ()=>{
                //this.finishSocketSetup();
                console.log("Island connection established");
                //this.islandConnectionStatus = true;
                //this.emit("connected_to_island");
                //
                self.chatSocket.on("*", (event, data)=>{
                    console.log(`Got event: ${event}`);
                    self.emit(event, data);
                })

                self.chatSocket.on('reconnect', (attemptNumber) => {
                    console.log("Successfull reconnect client")
                    self.emit("reconnect");
                });

                self.chatSocket.on('error', (err)=>{
                    console.error(`Socket error: ${err}`)
                })
                resolve();
            });

            self.chatSocket.on("disconnect", ()=>{
                console.log("Island disconnected.");
                self.emit("disconnect");
                //this.islandConnectionStatus = false;
                //this.emit("disconnected_from_island");
            });

            self.chatSocket.on('connect_error', (err)=>{
                if (attempted < connectionAttempts){
                    console.log("Connection error on attempt: " + attempted + err);
                    attempted += 1;
                    setTimeout(attemptConnection, reconnectionDelay);
                } else {
                    console.log('Connection Failed');
                    reject(err);
                }

            });

            self.chatSocket.on('connect_timeout', (err)=>{
                console.log('Chat connection timeout');
                reject(err);
            });

            attemptConnection();
        })
    }

    async reconnect(){

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
