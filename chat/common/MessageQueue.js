const { iCrypto } = require("../common/iCrypto")

class MessageQueue{
    constructor(){
        this._id = iCrypto.hexEncode(iCrypto.getBytes(16))
        this._seq = 0
        this._queue = []
        this._sent = []

    }

    enqueue(message){
        this._queue.push({queue: this._id, seq: ++this._seq, message: message});
    }

    dequeue(){
        let msg = this._queue.splice(0, 1)[0]
        if(msg){
            this._sent.push(msg)
            return msg;
        }
    }

    dequeueAll(){
        let allEnqueued = this._queue;
        this._queue = []

        for(let msg of allEnqueued){
            this._sent.push(msg)
        }
        return allEnqueued;
    }

    sync(lastSeq){
        let lastSeenMessage = this._sent.find(e=>e.seq === lastSeq)
        if(lastSeenMessage){
            let lastSeqIndex = this._sent.indexOf(lastSeenMessage)
            this._sent.splice(0, lastSeqIndex+1);
            return [...this._sent];
        }
    }

    get lastSeq(){
        return this._seq;
    }

}

module.exports = {
    MessageQueue: MessageQueue
}
