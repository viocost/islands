import { WildEmitter } from "../chat/WildEmitter";
import * as io from "socket.io-client";

/**
 * This class is responsible for following:
 *   1. maintaining connection with the island through multiplexing socket.
 *   2. Sending arbitrary messages asyncronously in FIFO fasion.
 *   3. Receiving messages from island multiplexing socket and notifying subscribers.
 *
 *
 */
export class MultiplexorQueue{
    constructor(upgradeToWebsocket){
        this.upgradeToWebsocket = upgradeToWebsocket;
        WildEmitter.mixin(this);

    }


    async enqueue(){

    }

    async dequeue(){

    }

    async establishConnection(connectionAttempts = 7, reconnectionDelay = 8000){
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
                reconnection: false,
                forceNew: true,
                autoConnect: false,
                pingInterval: 10000,
                pingTimeout: 5000,
            }

            socketConfig.upgrade = self.transport > 0;

            self.chatSocket = io('/chat', socketConfig);

            self.chatSocket.on('connect', ()=>{
                this.finishSocketSetup();
                console.log("Island connection established");
                this.islandConnectionStatus = true;
                this.emit("connected_to_island");
                resolve();
            });



            self.chatSocket.on("disconnect", ()=>{
                console.log("Island disconnected.");
                this.islandConnectionStatus = false;
                this.emit("disconnected_from_island");
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


    setListeners(){

    }


}
