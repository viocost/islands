/**
 * Session identifies a single authenticated multiplexed connection between the client
 * and the server, transparently processes messages to and
 * from client, maintains message queue and keep track of messages sent and received.
 *
 * It is responsible for keeping messages in-sync and re-sending missed messages
 *
 return this._sm.state !== "awatingReconnection"
 *
 * When session is started - it is given authenticated connector and the session key agent
 * Once initialized - it is ready to work.
 *
 * The connector immediately thrown away on disconnect, then the session sets timer and waits for client reconnect.
 * If client re-connects - the session replaces the connector, resyncs and continues
 * Otherwise, the timer will expire and the session will be removed from the list of active sessions
 *
 * Session accepts and enqueues messages while active or on timeout!
 * After timeout session no longer accepts messages.
 *
 * Session does not process messages from the connector while on timeout,
 * if such situation ever occurs.
 *
 * Message types
 * There are 3 types of messages:
 * "sync" - for resyncronization protocol
 * "auth" - for reconnection and reauth
 * "message" - regular message
 * Only "message" type messages are processed by queue and all preprocessors.
 * "auth" and "sync" are handled differently
 *
 * Sending messages to the client steps:
 * 1. Message is enqueued
 * 2. Queue processing scheduled
 * 3. While there are messages in the queue
 *    - message dequeued
 *    - message processed
 *    - message pushed thruough connector
 *
 * Receiving messages from the client, steps:
 *
 * 1. Message received at connector.
 * 2. Message pre-processed
 * 3. Message is checked by message counter,
 * 4. If it is in order - it is pushed to the sink, otherwise dropped
 *
 *
 *
 * **SECRET
 * Secret is a arbitrary nonce that session instances may pass around to
 * re-identify each other. The algorithm of creating such instance or recognizing it
 * is determined by session creator. Session only calls internal secretRecognizer and secret
 * functions and returns the result.
 * Since the session doesn't handle reconnection itself, it is up to
 * whatever entity to call those methods and make sense of it.
 * Session API has 2 methods:
 * getSecret()
 * recognizesSecret(secret)
 *
 *
 * Syncing messages.
 * Session sends ping messages every n seconds with lastMessageSeen seq.
 *
 * The session on the other end expected to do the same.
 *
 * Whenever new message arrives through the connector, if its seq is not lastReceivedSeq + 1 it is ignored and immediate lastMessageSeen
 * ping sent back to resync.
 *
 * When session receives ping message - it removes all the messages from the send queue up to lastSeen + 1 and re-sends whatever goes after lastSeen + 1
 *
 * On the reconnect ping sent immediatelly.
 *
 * **Incoming message processing (from the client)
 * There is only 2 types of messages session recognizes:
 * sync - messages that are part of syncronization protocol
 * message - regular message
 *
 * Whenever regular message appears through the connector,
 * it is first decrypted and json parsed.
 *
 * Then its sequence number is compared to the last seen.
 * If it is not lastSeen + 1 - the message is ignored and the ping sent
 * otherwise lastSeen is incremented and the payload of the message is emitted.
 *
 * When sync message is decrypted - it is first decrypted and then processed appropriately
 * Sync messages can be ping or pong. Both include lastSeen sequence number.
 * When ping message is received, it checks the queue and resends whatever other entity is missing.
 * It also sends pong message with lastSeen sequence number on current side.
 *
 * When pong message received - only queue check happens and missing messages re-sent.
 *
 *
 *
 */

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
        this._secretHolder = secretHolder
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
        this._sm.handle.reconnect(connector)
    }



    isPaused() {
        return this._sm.state === "awatingReconnection"
    }


    _preprocessIncoming(message) {
        return this._incomingMessagePreprocessors.reduce((acc, f) => f(acc), message)
    }


    _preprocessOutgoing(message) {
        return this._outgoingMessagePreprocessors.reduce((acc, f) => f(acc), message)
    }

    _processIncomingMessage(stateMachine, eventName, args) {

        let processed = this._preprocessIncoming(args[0])

        console.log(`Received incoming message: ${JSON.stringify(processed)}`);

        if (!this._incomingCounter.accept(processed.seq)) {
            console.log("Message out of sync. Ignoring and sending ping");
            this._sm.handle.sendPing()
        } else {
            console.log("Emitting a message");
            this.emit(SessionEvents.MESSAGE, processed.message)
        }
    }


    _processOutgoingMessage(stateMachine, eventName, args) {
        this._messageQueue.enqueue(args[0])
        this._sm.handle.processQueue()
    }



    _processQueue(stateMachine, eventName, args) {
        let message;
        while (message = this._messageQueue.dequeue()) {
            let processed = this._preprocessOutgoing(message)
            this._connector.send(MessageTypes.MESSAGE, processed)
        }
    }


    _processSendPing(stateMachine, eventName, args) {
        let payload = this._preprocessOutgoing({
            command: SyncEvents.PING,
            seq: this._incomingCounter.get()
        })
        this._connector.send(MessageTypes.SYNC, payload)
    }

    _processSendPong(stateMachine, eventName, args) {
        let payload = this._preprocessOutgoing({
            command: SyncEvents.PONG,
            seq: this._incomingCounter.get()
        })

        this._connector.send(MessageTypes.SYNC, payload)
    }


    _processPingPong(stateMachine, eventName, args) {

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

    _handleReplaceConnector(stateMachine, eventName, args) {
        console.log("Replacing connector");
        this._connector.off()
        this._connector = args[0]
        this._bootstrapConnector(this._connector)
    }


    _bootstrapConnector(connector) {
        connector.on(ConnectorEvents.DEAD, () => {
            this._sm.handle.connectorDisconnected();
        })

        connector.on(MessageTypes.SYNC, msg => {
            this._sm.handle.pingPong(msg);
        })

        connector.on(MessageTypes.MESSAGE, msg => {
            this._sm.handle.incomingMessage(msg)
        })
    }

    _processDead() {
        console.log("Dead");
    }


    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Generic Session SM",
            stateMap: {
                active: {
                    initial: true,
                    transitions: {

                        processQueue: {
                            actions: this._processQueue.bind(this)
                        },

                        connectorDisconnected: {
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
                        reconnect: {
                            action: this._handleReplaceConnector.bind(this),
                            state: "active"
                        },

                        timeout: {
                            state: "dead"
                        }
                    }
                },

                dead: {
                    entry: this._processDead.bind(this)
                }
            }
        })
    }
}


class ServerSession extends GenericSession {
    constructor({ connector, incomingMessagePreprocessors = [], outgoingMessagePreprocessors = [], secretRecognizer }) {
        super(connector)
        this._sm = this._prepareStateMachine()
        this._recognizer = secretRecognizer
        this._incomingMessagePreprocessors = incomingMessagePreprocessors;
        this._outgoingMessagePreprocessors = outgoingMessagePreprocessors;
        this._bootstrapConnector(connector);
    }

    _commitSuicide(stateMachine, eventName, args) {
        this.emit(SessionEvents.DEAD)
    }


}


class ClientSession extends GenericSession {
    constructor({ connector, incomingMessagePreprocessors = [], outgoingMessagePreprocessors = [], secretHolder }) {
        super(arguments)
        this._secretHolder = secretHolder
        this._sm = this._prepareStateMachine()
        this._incomingMessagePreprocessors = incomingMessagePreprocessors;
        this._outgoingMessagePreprocessors = outgoingMessagePreprocessors;
        this._bootstrapConnector(connector);
    }

    getSecret() {
        return this._secretHolder()
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
        console.log(`Checking if message is in-sync. Seq ${seq}, current: ${this._counter}`);
        if (seq != (this._counter + 1)) {
            return false
        }

        this._counter++
        return true;
    }

}


function prepareMessageProcessor(lambda) {
    return (msg) => {
        return lambda(msg)
    }
}


class SessionEnvelope {
    constructor(seq, payload) {
        this.seq = seq;
        this.payload = payload;
    }

    static from(blob) {
        if (typeof blob === "string") {
            blob = JSON.parse(blob)
        }
        return new SessionEnvelope(blob.seq, blob.payload)
    }
}

const SessionEvents = {
    DEAD: Symbol("dead"),
    MESSAGE: Symbol("message")
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

class SessionRecognizer {
    constructor(recognizerLambda) {
        this.recognize = recognizerLambda;
    }
}




class SessionFactory {

    static make(connector, cryptoAgent, secret) {
        let serializer = (msg) => {
            if (typeof msg !== "string") {
                return JSON.stringify(msg)
            }
            return msg
        }

        let deserializer = msg => JSON.parse(msg)

        let encryptor = (msg) => {
            return cryptoAgent.encrypt(msg)
        }

        let decryptor = (msg) => {
            return cryptoAgent.decrypt(msg)
        }

        let secretRecognizer = (msg) => {
            return cryptoAgent.decrypt(msg) === secret
        }

        let secretHolder = () => {
            return cryptoAgent.encrypt(secret);
        }

        let session = new GenericSession({
            connector: connector,
            incomingMessagePreprocessors: [decryptor, deserializer],
            outgoingMessagePreprocessors: [serializer, encryptor],
            secretHolder: secretHolder,
            secretRecognizer: secretRecognizer
        });
        return session
    }
}

module.exports = {
    SessionFactory: SessionFactory,
    SessionEvents: SessionEvents,
    MessageTypes: MessageTypes,
    ClientSession: ClientSession
}
