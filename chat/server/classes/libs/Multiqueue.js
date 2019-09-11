const Lock = require("./Lock.js");
const MessageQueueBlocking = require("./MessageQueueBlocking.js");
const Logger = require("./Logger.js");


/**
 * Collection of queues neede to properly process request events.
 * It is basically extended hashtable, where key is onion address and
 * value is request queue for given address.
 *
 * Whenever new address has created - the entire multiqueue must be locked.
 *
 *
 */
class Multiqueue{
    constructor(){
        this._lock = new Lock();
        this._queues = {}
    }

    async enqueue(dest, obj, onSucess, onError, timeout){
        if (!this._queues.hasOwnProperty(dest)){
            try {
                await this._lock.acquire();
                if(!this._queues.hasOwnProperty(dest)){
                    this._queues[dest] = new MessageQueueBlocking();
                }
            }catch(e){
                Logger.error("Error enqueueing message: " + e)
            }finally{
                this._lock.release();
            }
        }

        //Here we are sure that queue exists
        let queue = this._queues[dest];
        try{
            await queue.lock();
            queue.enqueue(obj);
            if (timeout){
                setTimeout(()=>{

                })
            }
        }catch(e){
            Logger.error("Error enqueueing message: " + e)
        }finally{
            queue.unlock();
        }
    }

    get(key){
        return this._queues[key];
    }



    isEmpty(key){
        return this._queues.hasOwnProperty(key) && this._queues[key]
    }

}


module.exports = Multiqueue;
