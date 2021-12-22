const { MessageQueue } = require("./MessageQueue")
const { StateMachine } = require("./AdvStateMachine")
const { WildEmitter } = require("./WildEmitter")
const { ConnectorEvents } = require("./Connector")
const { NotImplemented } = require("./Error")
const { iCrypto } = require("./iCrypto")


class Session {
    constructor(connector) {
        WildEmitter.mixin(this)
        this._id = iCrypto.hexEncode(iCrypto.getBytes(16))
        this._messageQueue = new MessageQueue()
        this._incomingCounter = new SeqCounter();
        this._connector = connector;
    }

    acceptMessage() {
        throw new NotImplemented()
    }

    /**
     * Returns whether the session is active
     */
    isPaused() {
        throw new NotImplemented()
    }

    /**
     * Given a secret string returns whether it recognizes it
     */
    recognizesSecret(secret) {
        throw new NotImplemented()
    }

    /**
     * Returns a secret string that is meant to be passes to
     * another session instance for recognition
     */
    getSecret() {
        throw new NotImplemented()
    }

    getId(){

        throw new NotImplemented()
    }

    /**
     * Replaces the connector
     */
    replaceConnectorOnReconnection(connector) {
        throw new NotImplemented()
    }
}


class GenericSession extends Session {

    /**
     * @param connector
     * Is an instance that session will push messages to and listen events from.
     * It must have methods:
     *     send(ev, data)
     *     on(ev, func)
     *
     * @param incomingMessagePreprocessors
     * An array of functions which will be used to process incoming messages
     * before checking it with incoming message counter and pushing to sink
     *
     *
     * @param outgoingMessagePreprocessors
     * An array of functions which will be used to process outgoing messages
     * before pushing them to connector and after dequeueing
     *
     * @param secretRecognizer
     * Is a function that checks passed nonce using internal rules and returns true or false
     * depending on whether it complies with the rules or not.
     * Recognizer can be any function, but initially it is meant to identify
     * whether a passed cipher can be decrypted to a control nonce using session key.
     *
     */
    constructor({ connector, incomingMessagePreprocessors = [], outgoingMessagePreprocessors = [], secretRecognizer, secretHolder }) {
        super(connector)
        this._sm = this._prepareStateMachine()
        this._recognizer = secretRecognizer
        this._secretHolder = secretHolder //function that returns a secret when invoked
        this._incomingMessagePreprocessors = incomingMessagePreprocessors;
        this._outgoingMessagePreprocessors = outgoingMessagePreprocessors;
        this._bootstrapConnector(connector)
    }

    /**
     * The main method to call for sending message to the client
     */
    acceptMessage(msg) {
        this._sm.handle.outgoingMessage(msg)
    }


    /**
     * We need a mechanism through wich a session can identify a nonce and
     * respond whether it is recognized or not. This function calls session secretRecognizer with the passed nonce.
     * Session itself doesn't keep the nonce, it is enclosed within the secretRecognizer function.
     */
    recognizesSecret(nonce) {
        return this._recognizer(nonce)
    }

    getSecret() {
        return this._secretHolder()
    }

    getId(){
        return this._id
    }

    replaceConnectorOnReconnection(connector) {
        this._sm.handle.reconnectSuccess(connector)
    }



    isPaused() {
        console.log(`Is paused called. Current state: ${this._sm.state}`);
        return this._sm.state === "awatingReconnection"
    }

    isActive(){
        return !this.isPaused();
    }


    _preprocessIncoming(message) {
        return this._incomingMessagePreprocessors.reduce((acc, f) => f(acc), message)
    }


    _preprocessOutgoing(message) {
        return this._outgoingMessagePreprocessors.reduce((acc, f) => f(acc), message)
    }

    _processIncomingMessage(args) {

        let processed = this._preprocessIncoming(args[0])

        console.log(`Received incoming message. seq: ${processed.seq}`);

        if (!this._incomingCounter.accept(processed.seq)) {
            console.log("Message out of sync. Ignoring and sending ping");
            this._sm.handle.sendPing()
        } else {
            console.log("Emitting a message");
            this.emit(SessionEvents.MESSAGE, processed.message)
        }
    }


    _processOutgoingMessage(args) {
        this._messageQueue.enqueue(args[0])
        this._sm.handle.processQueue()
    }



    _processQueue() {
        let message;
        while (message = this._messageQueue.dequeue()) {
            let processed = this._preprocessOutgoing(message)
            this._connector.send(MessageTypes.MESSAGE, processed)
        }
    }


    _processSendPing() {
        let payload = this._preprocessOutgoing({
            command: SyncEvents.PING,
            seq: this._incomingCounter.get()
        })
        this._connector.send(MessageTypes.SYNC, payload)
    }

    _processSendPong(args) {
        let payload = this._preprocessOutgoing({
            command: SyncEvents.PONG,
            seq: this._incomingCounter.get()
        })

        this._connector.send(MessageTypes.SYNC, payload)
    }


    _processPingPong(args) {

        let msg = this._preprocessIncoming(args[0])
        let seq = msg.seq;

        console.log(`Pingpong received: ${JSON.stringify(msg)}`);
        this._messageQueue.sync(seq)
        this._sm.handle.processQueue();

        if (msg.command === SyncEvents.PING) {
            console.log("Ping received. Processing...");
            this._sm.handle.sendPong();
        } else {
            console.log("Pong received");
        }
    }


    _processSync(stateMachne, eventName, args) {
    }

    _handleReplaceConnector(args) {
        console.log("REPLACING CONNECTOR");
        this._connector.off()
        delete this._connector;
        this._connector = args[0]
        this._bootstrapConnector(this._connector)
    }


    _bootstrapConnector(connector) {
        console.log("BOOTSTRAPPING A CONNECTOR");
        connector.on(ConnectorEvents.DEAD, () => {
            console.log("CONNECTOR DISCONNECTED HADNLING");
            this._sm.handle.connectorDisconnected();
        })

        connector.on(MessageTypes.SYNC, msg => {
            this._sm.handle.pingPong(msg);
        })

        connector.on(MessageTypes.MESSAGE, msg => {
            this._sm.handle.incomingMessage(msg)
        })
    }


    //By default the session is passive when connection is load
    //If session should take an action when connection is lost - override this function;
    _reconnect(){}

    _processDead() {
        console.log("Dead");
    }


    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Generic Session SM",
            stateMap: {
                active: {
                    entry: this._processQueue.bind(this),
                    initial: true,
                    transitions: {

                        processQueue: {
                            actions: this._processQueue.bind(this)
                        },

                        connectorDisconnected: {
                            actions: this._reconnect.bind(this),
                            state: "awatingReconnection"
                        },

                        //to client
                        outgoingMessage: {
                            actions: this._processOutgoingMessage.bind(this),
                        },

                        //from client
                        incomingMessage: {
                            actions: this._processIncomingMessage.bind(this),
                        },

                        sendPing: {
                            actions: this._processSendPing.bind(this)
                        },

                        sendPong: {
                            actions: this._processSendPong.bind(this)

                        },

                        pingPong: {
                            actions: this._processPingPong.bind(this)
                        },



                    }

                },

                awatingReconnection: {
                    transitions: {

                        outgoingMessage: {
                            actions: this._processOutgoingMessage.bind(this),
                        },

                        reconnectSuccess: {
                            actions: this._handleReplaceConnector.bind(this),
                            state: "active"
                        },

                        reconnectTimeout: {
                            state: "dead"
                        }
                    }
                },

                dead: {
                    entry: this._processDead.bind(this)
                }
            }
        }, {msgNotExistMode: StateMachine.Warn})
    }
}

class SeqCounter {
    constructor() {
        this._counter = 0
    }

    get() {
        return this._counter;
    }

    accept(seq) {
        if (seq != (this._counter + 1)) {
            return false
        }

        this._counter++
        return true;
    }
}

const SessionEvents = {
    DEAD: Symbol("dead"),
    MESSAGE: Symbol("message"),
    CONNECTION_LOST: Symbol("connection_lost"),
    RECONNECTING: Symbol("reconnecting"),
    CONNECTION_STATUS_REQUEST: Symbol("connection_status_request"),
    CONNECTED: Symbol("connected")

}

const MessageTypes = {
    AUTH: "auth",
    SYNC: "sync",
    MESSAGE: "message"
}

const SyncEvents = {
    PING: "ping",
    PONG: "pong"

}

module.exports = {
    GenericSession: GenericSession,
    MessageTypes: MessageTypes,
    SessionEvents: SessionEvents,
    SeqCounter: SeqCounter,
    SyncEvents: SyncEvents
}
