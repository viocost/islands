class MessageBus {

    //list of recipients and messages
    constructor() {
        this._queue = [];

        /**
         * A subscription is an object with callback, and optional recipient and message fields.
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
         * Unregister can take an object recipient or an integer key.
         *
         * If an integer key passed, then the subscription that matches the key will be deleted.
         * If an object passed, then all subscriptions where the object is a recipient
         * will be deleted.
         *
         */
        this._subscriptions = {}
        this._processing = false;
        this.subscriptionSeq = 0;
    }

    /**
     * Deleting a single subscription identified by id
     */
    unregisterById(id) {
        delete this._subscriptions[id]
    }

    /**
     * Deleting all subscriptions with mathced recipient
     *
     */
    unregisterByRecipient(recipient) {
        for (let key of Object.keys(this._subscriptions)) {
            if (this._subscriptions[key].recipient === recipient) {
                delete this._subscriptions[key]
            }
        }
    }

    /**
     * Registers a callback for a certain message or all of them.
     *
     */
    register(callback, message, recipient) {
        this._subscriptions[++this.subscriptionSeq] = { callback: callback, message: message, recipient: recipient }
        return this._subscriptionSeq;
    }


    deliver(message, data, sender) {
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
            for (let key in this._subscriptions) {

                //Checking if sender also a recipient and ignoring if so.
                let subscription = this._subscriptions[key]
                if (subscription.recipient && subscription.recipient === message.sender) {
                    continue
                }

                //Delivering if message not specified, or if specified and matches
                //Sending JSON, for easier interpretation
                // Also including the key of the subscription in case the handler wants to
                // unregister immediately
                if (!subscription.message || subscription.message === message.message) {
                    subscription.callback(key, message)
                }
            }

        }

        this._processing = false
    }
}

module.exports = {
    MessageBus: MessageBus
};
