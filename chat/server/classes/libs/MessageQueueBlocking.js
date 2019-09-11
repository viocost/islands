/**
 * This implements multi-address blocking message queue
 * The object is basically a hash table.
 * Keys are addresses, and values are queues.
 * When enqueueing - an address and a message are required.
 * Each address queue has mutex. Enqueueing or dequeueing
 * requires obtaining mutex lock.
 * If queue for given address is already initialized, then regular
 * enqueue / dequeue operation is invoked.
 * If not, queue init lock is acquired and queue is initialized.
 */
const Lock = require("./Lock.js")
const Logger = require("../libs/Logger.js")


class MessageQueueBlocking{
    constructor(){
        this._lock = new Lock()
        this._queue = []
    }

    async lock(){
        return this._lock.acquire()
    }

    async unlock(){
        this._lock.release()
    }

    enqueue(obj){
        this._queue.push(obj);
    }

    async dequeue(){
        await this.lock()
        try{
            Logger.debug("Dequeueing from blocking message queue")
            return this._queue.shift();
        }catch(err){

        }finally{
            await this.unlock()
        }
    }

    async remove(obj){
        Logger.debug("Removing object from queue")
        await this.lock();
        try{
            let index = this._queue.indexOf(obj)
            if (index > -1){
                this._queue.splice(index, 1)
            }
        }catch(err){
            Logger.error("Error removing object from the queue: " + err)
        }finally{
            await this.unlock();
        }
    }

    length(){
        return this._queue.length;
    }

}

module.exports = MessageQueueBlocking;
