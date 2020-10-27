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

const { GenericSession, MessageTypes, SessionEvents } = require("./GenericSession")


class ServerSession extends GenericSession {
    constructor({ connector, incomingMessagePreprocessors = [], outgoingMessagePreprocessors = [], secretRecognizer }) {
        super(connector)
        this._sm = this._prepareStateMachine()
        this._recognizer = secretRecognizer
        this._incomingMessagePreprocessors = incomingMessagePreprocessors;
        this._outgoingMessagePreprocessors = outgoingMessagePreprocessors;
        this._bootstrapConnector(connector);
    }

    _commitSuicide() {
        this.emit(SessionEvents.DEAD)
    }


}


class ClientSession extends GenericSession {
    constructor({ connector, incomingMessagePreprocessors = [], outgoingMessagePreprocessors = [], secretRecognizer, secretHolder, uxBus, reconnectionAgentFactory }) {
        super({
            connector: connector,
            incomingMessagePreprocessors: incomingMessagePreprocessors,
            outgoingMessagePreprocessors: outgoingMessagePreprocessors,
            secretHolder: secretHolder,
            secretRecognizer: secretRecognizer,

        })
        this.uxBus = uxBus
        this.reconnectionAgentFactory = reconnectionAgentFactory
    }

    getSecret() {
        return this._secretHolder()
    }

    subscribeClientBusToConnectorEvents(connector, uxBus){
        connector.on(ConnectorEvents.DEAD, ()=>uxBus.emit(SessionEvents.CONNECTION_LOST))
    }

    _reconnect(){
        console.log("Client session reconnect");

        let reconnectionAgent = this.reconnectionAgentFactory.make({
            timeLimit: this.reconnectTimeLimit,
            onSuccess: this._sm.handle.reconnectSuccess,
            onTimeout: this._sm.handle.reconnectTimeout,
            runTimeout: 3000,
            secret: this.getSecret()
           
        })

        reconnectionAgent.run()
    }

}





class ServerSessionFactory {

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
            try{
                return cryptoAgent.decrypt(msg) === secret
            }catch(err){
                return false
            }
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

class ClientSessionFactory{
    static make(connector, uxBus, cryptoAgent, secret, reconnectionAgentFactory) {
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
            try{
                return cryptoAgent.decrypt(msg) === secret
            }catch(err){
                //decryption error
                return false
            }
        }

        let secretHolder = () => {
            return cryptoAgent.encrypt(secret);
        }

        let session = new ClientSession({
            connector: connector,
            incomingMessagePreprocessors: [decryptor, deserializer],
            outgoingMessagePreprocessors: [serializer, encryptor],
            secretHolder: secretHolder,
            secretRecognizer: secretRecognizer,
            uxBus: uxBus,
            reconnectionAgentFactory: reconnectionAgentFactory

        });
        return session
    }
}

module.exports = {
    ServerSessionFactory: ServerSessionFactory,
    SessionEvents: SessionEvents,
    MessageTypes: MessageTypes,
    ClientSession: ClientSession,
    ClientSessionFactory: ClientSessionFactory
}
