
/**
 * This class is responsible for following:
 *   1. Sending arbitrary messages asyncronously in FIFO fasion.
 */
export class MessageQueue{

    constructor(connector){
        this.queueWorkerInterval = 300 //300ms
        this.queueWorkerIntervalId;
        this.connector = connector;
        this.queue = [];
        this.stop = false;
        this.startQueueWorker();
    }

    enqueue(msg){
        this.queue.push(msg);
    }

    //Processes the queue: dequeues each message one by one and send it down the wire
    processQueue(self){
        if(self.queue.length === 0) return;

        console.log("Processing queue");
        let outbound = self.queue
        self.queue = []
        let msg
        while(msg = outbound.shift(0)){
            self.connector.send(msg);
        }
    }

    startQueueWorker(){
        console.log("Starting queue worker");
        this.queueWorkerIntervalId = setInterval(()=>{
            this.processQueue(this)
        }, this.queueWorkerInterval);
    }

    stop(){
        console.log("Stpping queue worker...");
        clearInterval(this.queueWorkerIntervalId)
    }
}
