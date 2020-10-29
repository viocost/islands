

class MessageBus {

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


    emit(message, data, sender) {

        console.log("MESSAGE ORDER DEBUG IN Messages bus emit : ", message);
        this._queue.push({ sender: sender, message: message, data: data })

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
            console.log(`MESSAGE ORDER DEBUG process queue: `);
            console.dir(message)

            for (let key in this._subscriptions) {

                //Checking if sender also a subscriber and ignoring if so.
                let subscription = this._subscriptions[key]
                if (subscription.subscriber && subscription.subscriber === message.sender) {
                    continue
                }

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

function asArray(item){
    return Array.isArray(item) ? item : [ item ];
}

module.exports = {
    MessageBus: MessageBus
};
