import { WildEmitter } from "./WildEmitter";
import { Lock } from "./Lock";

/**
 * This class is responsible for following:
 *   1. Sending arbitrary messages asyncronously in FIFO fasion.
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
                console.log("Lock acquired, enqueueing");
                this.queue.push(msg);
            }catch(err){
                console.log(`Enqueue error: ${err.message} `);
            }finally{
                console.log("Releasing lock...");
                self.lock.release();
            }

        })
    }

    //Processes the queue: dequeues each message one by one and send it down the wire
    launchQueueWorker(){
        let self = this;
        let processQueue = async ()=>{
            if(self.stop){
                console.log("Stopping worker.");
                this.working = false;
                return;
            }
            try{
                console.log("Worker tick");
                this.working = true;
                await self.lock.acquire();
                let msg
                while(msg = self.queue.shift(0)){
                    console.log(`Sending message down the wire ${msg}`);
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

    stop(){
        this.stop = ture;
    }

    resume(){
        console.log("Resuming worker..");
        if(!this.working){
            this.stop = false;
            this.launchQueueWorker();
        }
    }

    isWorking(){
        return this.working;
    }

}
