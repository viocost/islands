import { WildEmitter } from "./WildEmitter";
import * as io from "socket.io-client";
import { Internal } from "../../../../common/Events";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { iCrypto } from "../../../../common/iCrypto";
import { createClientIslandEnvelope, createAuthMessage } from "../../../../common/Message"
import { inspect } from "util";
import { Message } from "./Message";




export class Connector {


    constructor(connectionString = "" ) {
        WildEmitter.mixin(this);
        this.connectorStateMachine = this._prepareConnectorStateMachine()
        this.acceptorStateMachine = this._prepareAcceptorStateMachine()
        this.sessionStateMachine = this._prepareSessionStateMachine()
        this.socket = this._createSocket(connectionString);
        this.socketInitialized = false;
        this.pingCount = 0;
        this.queue = [];
        this.maxUnrespondedPings = 10;
        this.reconnectionDelay = 4000;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 8;
        this.killSocket = false;
        this._challenge;
        this._sessionKey;
        this._sendCount = 0;
        this._receiveCount = 0;
        this._authHandlers = this._getAuthHandlers()
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS
    send(msg) {
        console.log("Sending message");
        this.acceptorStateMachine.handle.acceptMessage(msg);
    }



    acceptSessionKey(key) {
        this.sessionKey = key;
        console.log(`Session key is set to ${key}`);
        this.sessionStateMachine.handle.validateKey();
    }

    setConnectionQueryProperty(k, v) {

        if (!this.socket.io.opts.query) {
            this.socket.io.opts.query = {};
        }

        this.socket.io.opts.query[k] = typeof v !== "string" ? JSON.stringify(v) : v;
    }

    establishConnection() {
        this.connectorStateMachine.handle.connect();
    }

    getConnectionState() {
        return this.connectorStateMachine.state;
    }




    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _sendAuthToServer(stateMachine, eventName, args){
        console.log("Emitting auth message directly");
        this.socket.emit("auth", args[0])
    }

    _getAuthHandlers(){
        let handlers = {}
        handlers[Internal.AUTH_CHALLENGE] = ({ private_key, session_key })=>{
            //Server request to establish a session
            // session key is encrypted with public key
            // private key is encrypted with password-based symkey known to the user
            // User supposed to decrypt private key, decrypt session key and send session key encrypted nonce to the server
            // The session will be the established
            //
            console.log("Received auth challenge");
            this.sessionStateMachine.handle.keyInvalidated()
        }

        //Server response after submission of
        // auth challenge
        handlers[Internal.AUTH_OK] = ()=>{
            console.log("AUTH OK RECEIVED");
            this.sessionStateMachine.handle.keyValidated()
        }

        return handlers;

    }
    //////////////////////////////////////////////////
    // _acceptKeyAgent(stateMachine, evName, args){ //
    //     this.keyAgent = args[0];                 //
    // }                                            //
    //////////////////////////////////////////////////

    _resetConnectionAttempts() {
        this.connectionAttempts = 0;
    }

    _emitState(stateMachine) {
        this.emit(Internal.CONNECTION_STATE_CHANGED, stateMachine.state);
    }

    _notifyError(err) {
        this.emit(Internal.CONNECTION_ERROR, err)
    }

    _connect() {
        this.connectionAttempts++;
        this.socket.open();
    }

    _scheduleReconnect() {

        if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.log("Reached max connection attempts, giving up...")
            return
        }

        setTimeout(this.establishConnection.bind(this), this.reconnectionDelay)
    }


    _createSocket(connectionString) {
        let socketConfig = {
            reconnection: false,
            autoConnect: false,
            upgrade: false
        }

        let socket = io(`${connectionString}`, socketConfig);

        //Wildcard fix
        let onevent = socket.onevent;
        socket.onevent = function(packet) {
            let args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet)
        }
        //End

        socket.on("ping", () => {
            this.pingPongCount++;
            if (this.pingPongCount > this.maxUnrespondedPings) {
                console.log("socket pings are not responded. Resetting connection");
                socket.disconnect();
                attempted = 0
                setTimeout(attemptConnection, reconnectionDelay)
            }
        })

        socket.on("pong", () => {
            this.pingPongCount = 0;
        })

        socket.on('connect', () => {
            console.log("Island connection established");
            //this.sessionStateMachine.handle.validateKey();
            this.connectorStateMachine.handle.connected()
        });

        socket.on("message", (msg) => {
            this.connectorStateMachine.handle.messageReceived(msg)
        })

        socket.on("auth", msg => {
            console.log("Received auth message");
            console.dir(msg)
            if(this._authHandlers.hasOwnProperty(msg.headers.command)){
                this._authHandlers[msg.headers.command](msg)
            }
        })

        socket.on("*", (event, data) => {
            console.log(`Got event: ${event}`);
            this.emit(event, data);
        })

        socket.on('reconnecting', (attemptNumber) => {
            this.connectorStateMachine.handle.reconnecting()
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log(`Successfull reconnect client after ${attemptNumber} attempt`)
            this.connectorStateMachine.handle.connected();
        });

        socket.on('error', (err) => {
            this.connectorStateMachine.handle.error();
        })

        socket.on('reconnecting', (attemptNumber) => {
            this.connectorStateMachine.handle.reconnecting()
            console.log(`Attempting to reconnect : ${attemptNumber}`)
        })

        socket.on("disconnect", () => {

            this.sessionStateMachine.handle.keyInvalidated()
        });

        socket.on('connect_error', (err) => {
            this.connectorStateMachine.handle.error(err);
        });


        socket.on('connect_timeout', () => {
            console.log('Chat connection timeout');
            this.connectorStateMachine.handle.error();
        });


        return socket;
    }

    _processAuthMessage(stateMachine, evName, args) {
        console.log("Auth message received");
        let message = args[0];
        const handlers = {
            challenge: () => {
                console.log("challenge");
                this.emit("auth_challenge")
            },


        }

        switch (message.headers.command) {
        }
    }



    _processIncomingMessage(stateMachine, evName, args) {
        try {

            let encryptedBlob = args[0]
            console.log(inspect(encryptedBlob));
            let decrypted = this._sessionKeyDecrypt(encryptedBlob)
            console.log(`Decrypted message: ${decrypted}`);
            let { seq, message } = JSON.parse(decrypted)

            console.log(`Received message with seq ${seq}. Previous seq: ${this._receiveCount}`);
            if (seq !== this._receiveCount + 1) {
                console.log("Messages missing!");
            }
            this._receiveCount++;
            this.emit(message.headers.pkfpDest, message)
        } catch (err) {
            console.log(`Message processing error: ${err}`);
        }
    }


    _decryptSessionKey(stateMachine, evName, args) {
        try {
            const { privateKeyEncrypted, sessionKey, secret } = this._challenge;
            this.keyAgent.initializeMasterKey(privateKeyEncrypted)
            this.sessionKey = this.keyAgent.masterKeyDecrypt(sessionKey)
            let secretRaw = this.keyAgent.masterKeyDecrypt(secret)
            let secretEncryptedWithSessionKey = this._sessionKeyEncrypt(secretRaw)
            console.log(`Secret encrypted with session key is: ${secretEncryptedWithSessionKey}`);
            let dec = this._sessionKeyDecrypt(secretEncryptedWithSessionKey)
            this.setConnectionQueryProperty("secret", secretEncryptedWithSessionKey)
            this.acceptorStateMachine.handle.activate()
            this.connectorStateMachine.handle.decryptionSuccess()
        } catch (err) {
            console.log(`DECRYPTION ERROR: ${err}`);
            this.connectorStateMachine.handle.decryptionError();
        }
    }

    _retryDecryption(stateMachine, evName, args) {
        this.keyAgent = args[0]
        this.connectorStateMachine.handle.decryptSessionKey()
    }

    _sessionKeyEncrypt(data) {
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        const ic = new iCrypto();
        ic.addBlob("msg_raw", msg)
            .setSYMKey("key", this.sessionKey)
            .AESEncrypt("msg_raw", "key", "msg_enc", true)
        return ic.get("msg_enc");
    }

    _sessionKeyDecrypt(data) {
        const ic = new iCrypto();
        ic.addBlob("msg_enc", data)
            .setSYMKey("key", this.sessionKey)
            .AESDecrypt("msg_enc", "key", "msg_raw", true)
        return ic.get("msg_raw");
    }

    _setSessionKey(stateMachine, evName, args) {
        this.sessionKey = args[0];
    }

    //Called whenever connection to server is established
    _onConnectionEstablished(stateMachine, enName, args) {
        //this.sessionStateMachine.handle.validateSessionKey()
    }




    // Encrypts a nonce and sends it to server
    // for confirmation request
    _sendKeyValidationRequest(stateMachine, evName, args) {
        //make request
        let ic = new iCrypto();
        ic.createNonce("n", 32)
        let encrypted = this._sessionKeyEncrypt(ic.get("n"))

        let request = createAuthMessage({
            command: Internal.AUTH_CHALLENGE_RESPONSE,
            data: {
                nonce: encrypted
            }
        })
        this.connectorStateMachine.handle.auth(request)
    }

    _processSendQueue(stateMachine, evName, args) {
        console.log("processing send queue");
        if (this.queue.length === 0) {
            console.log("Nothing to send");
            return;
        }

        console.log("Processing queue");
        let outbound = this.queue
        this.queue = []
        let msg
        while (msg = outbound.shift(0)) {
            const msgEncrypted = this._sessionKeyEncrypt(msg)
            console.log(`Sending message ${JSON.stringify(msg)} \n ENCRYPTED: ${msgEncrypted}`);
            this.socket.emit("message", msgEncrypted);
        }
    }

    _performAcceptMessage(stateMachine, evName, args) {
        let msg = args[0]
        let seq = ++this._sendCount;
        console.log(`Accepting outgoing message. Seq: ${seq}`);
        this.queue.push({ seq: seq, message: msg });
        this.sessionStateMachine.handle.processSendQueue()
    }

    _prepareAcceptorStateMachine() {
        return new StateMachine(this, {
            name: "Accept input from user SM",
            stateMap: {
                inactive: {
                    initial: true,
                    transitions: {
                        activate: {
                            state: "acceptingMessages",
                        },
                    }
                },

                acceptingMessages: {
                    entry: () => { console.log("Now accepting messages") },
                    transitions: {
                        acceptMessage: {
                            actions: this._performAcceptMessage
                        },

                        deactivate: {
                            state: "inactive"
                        }
                    }
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    _prepareConnectorStateMachine() {
        return new StateMachine(this, {
            name: "Connector SM",
            stateMap: {
                disconnected: {
                    entry: this._emitState,
                    initial: true,
                    transitions: {
                        connect: {
                            state: ConnectionState.CONNECTING,
                            actions: this._connect
                        },
                    }
                },

                connecting: {
                    entry: this._emitState,
                    transitions: {
                        connected: {
                            state: ConnectionState.CONNECTED,
                        },

                    }
                },

                connected: {
                    entry: this._onConnectionEstablished.bind(this),
                    transitions: {
                        auth: {
                            actions: this._sendAuthToServer.bind(this)
                        }

                    }

                },

            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    _prepareSessionStateMachine() {
        return new StateMachine(this, {
            name: "Session State Machine",
            stateMap: {

                noKey: {
                    initial: true,
                    //No key is present
                    transitions: {
                        validateKey: {
                            state: "awatingKeyValidation",
                            actions: this._sendKeyValidationRequest.bind(this)
                        }
                    }
                },

                // State when we have session key
                // But cannot be sure whether it is valid or not
                // Specifically we need to receive a confirmation from the server
                // That the key is valid
                awatingKeyValidation: {
                    transitions: {
                        keyValidated: {
                            state: "sessionEstablished"
                        },
                        keyInvalidated: {
                            state: "noKey"
                        }
                    }
                },

                sessionEstablished: {
                    entry: this._processSendQueue.bind(this),
                    transitions: {
                        processSendQueue: {
                            actions: this._processSendQueue.bind(this)
                        },

                        processIncomingMessage: {
                            actions: this._processIncomingMessage.bind(this)
                        },

                        keyInvalidated: {
                            state: "noKey"
                        }
                    }
                }
            }

        })
    }
}

class MessageQueue {

    constructor(socket) {
        this._socket = socket;
        this._sm = this._prepareAcceptorStateMachine()

    }

    _prepareAcceptorStateMachine() {
        return new StateMachine(this, {
            name: "Accept input from user SM",
            stateMap: {
                inactive: {
                    initial: true,
                    transitions: {
                        activate: {
                            state: "acceptingMessages",
                        },
                    }
                },

                acceptingMessages: {
                    entry: () => { console.log("Now accepting messages") },
                    transitions: {
                        acceptMessage: {
                            actions: this._performAcceptMessage
                        },

                        deactivate: {
                            state: "inactive"
                        }
                    }
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }





}

export const ConnectionState = {
    DISCONNECTED: "disconnected",
    CONNECTING: "connecting",
    CONNECTED: "connected",
}
