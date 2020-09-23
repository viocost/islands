const  CuteSet  = require("cute-set") ;


class MessageBus{

    //list of recipients and messages
    constructor(){
        this._queue = [];
        this._subscribers = {}
        this._processing = false;

    }

    unregister(self){
        delete this._subscribers[self]
    }

    register(self, cb, messages = []){

        this._subscribers[self] = {
            messages: new CuteSet(messages),
            callback: cb
        }
    }

    deliver(sender, msg, data){
        this._queue.push([sender, msg, data])

        if(this._processing){
            return;
        }

        this._processing = true;

        let message
        while(message = this._queue.splice(0, 1)[0]){
            for(let recipient in this._subscribers){
                console.log(`Delivering to ${recipient.name}`);
                if(recipient === sender){
                    continue
                }

                let recipientData = this._subscribers[recipient]

                if(recipientData.messages.length === 0
                   || recipientData.messages.has(message[1])){
                    recipientData.callback(...message)
                }

            }
        }

        this._processing = false
    }
}

module.exports = {
    MessageBus: MessageBus
};
