const Messages = require("./GenMessages/Messages")
const CuteSet = require("cute-set")


class Queue{
    constructor(){
        this._queue = [];
    }

    enqueue(item){
        this._queue.push(item)
    }

    dequeue(){
        return this._queue.splice(0, 1)
    }

    isEmpty(){
        return this._queue.length === 0;
    }

}


// Subscribing to messages:
// bus.subscribe(this, MESSAGES.CreateTopic)

class Subscriber{
    update(){}
}


class Subscriptions extends MessageTypesRefers{
    constructor(messages){
        super(messages)
        return new Proxy(this, {

        })
    }



    validateArguments(subscriber, message){
        if(!(subscriber instanceof Subscriber)){
            throw new ValueError("susbscriber type is invalid")
        }

        if(message && !(message instanceof Messages.MESSAGE_BASE)){
            throw new ValueError("message type is invalid")
        }
    }

}

// Given a message type returns an array of associated objects (dispatcher)
class MessageTypeRefers{

    constructor(messages){
        this._messages = new Array(messages.length)
        for(let message of messages){
            this._messages[message.msg_index] = new CuteSet()
        }
    }

    add(obj, message){
        if(message){
            this._messages[message.msg_index].add(obj)
        } else {
            for(let id in this._messages){
                this._messages[id].add(obj)
            }
        }
    }

    remove(obj, message){
        if(message){
            this._messages[message.msg_index].delete(obj)
        } else {
            for(let id in this._messages){
                this._messages[id].delete(obj)
            }
        }
    }

    get(message){
        return this._messages[message.msg_index];
    }
}

class MessageBus{
    constructor(messages){
        this._subscriptions = new MessageTypeRefers(messages)
        this._in_process = false;
        this._queue = new Queue()
    }

    deliver(sender, message){

        this.verifySenderIsSubscriber(sender)
        this._queue.enqueue({s: sender, m: message});

        do{
            if(this._in_process){ return }
            this.in_process = true
            let {s, m} = this._queue.dequeue()
            let subscriptions = this._subscriptison.get(m)
            for(let subscriber of subscriptions){
                if(subscriber===s) continue;
                subscriber.update(m)
            }
            this._in_process = false;
        } while(!this._queue.isEmpty())

    }

    /**
     * subscriber must be an object with method update
     * message must be a registered type
     */
    subscribe(subscriber, message){

        this._subscriptions.add(subscriber, message)

    }

    unsubscribe(subscriber, message){

    }

    verifySenderIsSubscriber(subscriber){
        if(!(subscriber instanceof Subscriber)){
            throw new ValueError("Subscriber type is invalid")
        }
    }
}



class Agent{
    //has message dispatcher

}
class Subscriber {



    update(){
    }
}

class MessageBus{
    //list of recipients and messages
    constructor() {
        this._queue = [];

        /**
         * A subscription is an object with callback, and optional subscriber and message fields.
         * If message is specified, then callback will be invoked.
         * only when the message matches, otherwise it will be invoked
         * on any message.
         *
         * If n similar subscriptions are made callbacks will be invoked n times
         *
         * A subscription is identified by a key, which is an integer.
         * Wheneve new subscription comes in - it is assigned a key which is
         * returned after registration.
         *
         * Unregister can take an object subscriber or an integer key.
         *
         * If an integer key passed, then the subscription that matches the key will be deleted.
         * If an object passed, then all subscriptions where the object is a subscriber
         * will be deleted.
         *
         */
        this._subscriptions = {}
        this._processing = false;
        this.subscriptionSeq = 0;
    }

    /**
     * Takes either id of subscription or a subscriber, or both
     * and removes any handlers associated with them
     */
    off({ id, subscriber }){
        if(id){
            delete this._subscriptions[id]
        }

        if(subscriber){

            for (let key of Object.keys(this._subscriptions)) {
                if (this._subscriptions[key].subscriber === subscriber) {
                    delete this._subscriptions[key]
                }
            }
        }
    }

    /**
     * Registers a callback for a certain message or all of them.
     * Message must be a string, a symbol, or null, callback - any function,
     * subscriber - anything
     *
     */
    on(message=null, callback, subscriber) {

        this._subscriptions[++this.subscriptionSeq] = { callbacks: asArray(callback), message: message, subscriber: subscriber }
        return this.subscriptionSeq;
    }


    deliver(message, sender) {

        //refactor to an envelope
        this._queue.push({ sender: sender, message: message })

        if (this._processing) {
            return;
        }

        this._processQueue()

    }


    _processQueue() {
        this._processing = true;

        // While there are messages in the queue
        let message
        while (message = this._queue.splice(0, 1)[0]) {

            for (let key in this._subscriptions) {

                //Checking if sender also a subscriber and ignoring if so.
                let subscription = this._subscriptions[key]
                if (subscription.subscriber && subscription.subscriber === message.sender) {
                    continue
                }

                //
                //Delivering if message not specified, or if specified and matches
                // Including the key of the subscription in case the handler wants to
                // off immediately
                //
                // Message is an object { sender, message, data }
                if (!subscription.message || subscription.message === message.message) {
                    for(let cb of subscription.callbacks){
                        cb(message.data)
                    }
                }
            }

        }

        this._processing = false
    }

}

module.exports = {
    MessageBus: MessageBus
}
