const { iCrypto } = require("../common/iCrypto")

class MessageQueue{
    constructor(){
        this._id = iCrypto.hexEncode(iCrypto.getBytes(16))
        this._seq = 0
        this._queue = []
        this._dequeued = []

    }

    enqueue(message){
        this._queue.push({queue: this._id, seq: ++this._seq, message: message});
    }

    dequeue(){
        let msg = this._queue.splice(0, 1)[0]
        if(msg){
            this._dequeued.push(msg)
            return msg;
        }
    }

    sync(lastSeq){
        let lastSeenMessage = this._dequeued.find(e=>e.seq === lastSeq)
        if(lastSeenMessage){
            let lastSeqIndex = this._dequeued.indexOf(lastSeenMessage)
            this._dequeued.splice(0, lastSeqIndex+1);
            this._queue = [...this._dequeued, ...this._queue]
            this._dequeued = []
        }
    }

    get lastSeq(){
        return this._seq;
    }
}



module.exports = {
    MessageQueue: MessageQueue
}
