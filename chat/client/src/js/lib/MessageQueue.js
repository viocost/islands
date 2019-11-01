import { WildEmitter } from "./WildEmitter";
import { Lock } from "./Lock";

/**
 * This class is responsible for following:
 *   1. maintaining connection with the island through multiplexing socket.
 *   2. Sending arbitrary messages asyncronously in FIFO fasion.
 *   3. Receiving messages from island multiplexing socket and notifying subscribers.
 *
 *
 */
export class MessageQueue{

    constructor(upgradeToWebsocket){
        WildEmitter.mixin(this);
        this.upgradeToWebsocket = upgradeToWebsocket;
        this.lock = new Lock();
        this.queue = [];



    }

    async enqueue(msg){
        let self = this
        setImmediate(async ()=>{
            try{
                console.log("Aquiring lock");
                await self.lock.acquire();
                console.log("Lock aquired, enqueueing");
                this.queue.push(msg);
            }catch(err){
                console.log(`Enqueue error: ${err.message} `);
            }finally{
                console.log("Releasing lock...");
                self.lock.release();
            }

        })
    }


    launchQueueWorker(){
        let self = this;
        let processQueue = async ()=>{
            try{
                await self.lock.aquire();
                let msg;
                while(msg = self.queue.shift(0)){
                    console.log(`Sending message down the wire`);
                    //Send message here
                    // if error - insert it back and report the error
                }
            }catch(err){
                console.log(`Queue processor error ${err.message}`);
            }finally{
                self.lock.release();
                //Repeat after 300ms
                setTimeout(processQueue, 300);
            }
        }
        setImmediate(processQueue);
    }


    setListeners(){

    }


}
