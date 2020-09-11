/**
 * Session is the object that transparently processes messages to and
 * from client, maintains message queue and keep track of messages it
 * sent and received.
 *
 * It is responsible for keeping messages in-sync and re-sending missed messages
 *
 * When session is started - it is given authenticated connector and the session key agent
 * Once initialized - it is ready to work.
 *
 *
 * The is immediately thrown away on disconnect, then the session sets timer and waits for client reconnect.
 * If client re-connects - the session replaces the connector, resyncs and continues
 * Otherwise, the timer will expire and the session will be removed from the list of active sessions
 *
 * Whenever session sends a message, it passes it through a queue. Each message is given seq number.
 * All the messages pushed to a connector in the order of their seq number.
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

const { MessageQueue } = require("../../common/MessageQueue")
const { StateMachine } = require("../../common/AdvStateMachine")
const { WildEmitter } = require("../../common/WildEmitter")
const { ConnectorEvents } = require("../../common/Connector")

class Session{
    constructor(connector, keyAgent){
        WildEmitter.mixin(this)
        this._sm = this._prepareStateMachine()
        this._connector = connector;
        this._keyAgent = keyAgent;
        this._messageQueue = new MessageQueue()
        this._bootstrapConnector(connector);
    }


    send(message){
        this._sm.handle.outgoingMessage(message)
    }

    _processIncomingMessage(stateMachine, eventName, args){
        let msg = JSON.parse(this._keyAgent.decrypt(args[0]))

    }

    _processOutgoingMessage(stateMachine, eventName, args){

    }

    _commitSuicide(stateMachine, eventName, args){
        this.emit(SessionEvents.DEAD)
    }

    _bootstrapConnector(connector){
        connector.on(ConnectorEvents.DEAD, ()=>{
            this._sm.handle.connectorDisconnected();
        })

        connector.on("sync", msg=>{
            this._sm.handle.sync(msg);
        })

        connector.on("message", msg=>{
            this._sm.handle.incomingMessage(msg)
        })
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Session SM",
            stateMap: {
                active: {
                    initial: true,
                    transitions: {
                        sync: {

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
                        }

                    }

                },

                awatingReconnection: {
                    transitions: {
                        reconnect: {
                            state: "active"
                        },

                        timeout: {
                            state: "dead"
                        }
                    }

                },

                dead: {
                    entry: this._commitSuicide.bind(this)

                }
            }
        })

    }


}

const SessionEvents = {
    DEAD: Symbol("dead"),
    MESSAGE: Symbol("message")
}
