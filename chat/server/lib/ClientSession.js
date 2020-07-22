const { StateMachine } = require("adv-state");
const { iCrypto } = require("../../common/iCrypto")
const { createClientIslandEnvelope } = require("../../common/Message");


class ClientSession {
    constructor(clientConnector, connectionId, clientRequestEmitter){
        this.clientConnector = clientConnector;
        this.clientRequestEmitter = clientRequestEmitter
        this.connectionId = connectionId;
        this.sm = this._prepareStateMachine();
        this._subscribe(clientConnector, connectionId)

    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    acceptAsymKey(publicKey, vaultEncrypted){
        this.sm.handle.authWithPublicKey(publicKey, vaultEncrypted)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _subscribe(clientConnector, connectionId){
        clientConnector.on(connectionId, (msg, data)=>{
            switch(msg){
                case "message":
                    this._messageFromClient(data)
                    break

                case "disconnect":
                    console.log(`Client disconnected: ${connectionId}`);
                    break
                case "reconnect":
                    console.log(`Client reconnected: ${connectionId}`);
                    break
            }
        })

    }

    _sessionKeyEncrypt(data){
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        const ic = new iCrypto();
        ic.addBlob("msg_raw", msg)
          .setSYMKey("key", this.sessionKey)
          .AESEncrypt("msg_raw", "key", "msg_enc", true)
        return ic.get("msg_enc");
    }

    _sessionKeyDecrypt(data){
        const ic = new iCrypto();
        ic.addBlob("msg_enc", data)
          .setSYMKey("key", this.sessionKey)
          .AESDecrypt("msg_enc", "key", "msg_raw", true)
        return ic.get("msg_raw");
    }

    _authWithPublicKey(stateMachin, evName, args){
        let publicKey = args[0]
        let privateKeyEncrypted = args[1]

        let ic = new iCrypto()
        ic.createNonce("secret", 128)
          .createSYMKey("session-key")
          .setRSAKey("public-key", publicKey, "public")
          .publicKeyEncrypt("secret", "public-key", "secret-enc", "hex")
          .publicKeyEncrypt("session-key", "public-key", "session-key-enc", "hex")

        this.sessionKey = ic.get("session-key")
        this.secret = ic.get("secret")

        let msg = createClientIslandEnvelope({ command: "challenge", body: {
            privateKeyEncrypted: privateKeyEncrypted,
            secret: ic.get("secret-enc"),
            sessionKey: ic.get("session-key-enc")
        }})

        console.log("Sending auth challenge to client");

        this.clientConnector.send(this.connectionId, "auth", msg)
    }

    _authWithSymkey(){

    }


    _terminate(){

    }

    _messageFromClient(blob){
        try{
            let msg = JSON.parse(this._sessionKeyDecrypt(blob))
            this.clientRequestEmitter.acceptMessage(msg, this.connectionId)

        }catch(err){
            console.log(`Decryption error in client session: ${err.message}`);
        }
    }

    _messageToClient(msg) {
        const blob = this._sessionKeyEncrypt(msg);
        this.clientConnector.send(this.connectionId, "message", blob)
    }


    _handleDisconnect() {

    } 

    _prepareStateMachine(){


        return  new StateMachine(this, {
            name: "Clien Session SM",
            stateMap: {
                waitingForClientSecret: {
                    initial: true,
                    transitions: {
                        authWithSymkey:{
                            actions: this._authWithSymkey,
                        },

                        authWithPublicKey: {
                            actions: this._authWithPublicKey,
                            state: "active"
                        },

                        disconnect: {
                            actions: this._terminate
                        }
                    }
                },

                active: {
                    transitions: {
                        messageFromClient: {
                            actions: this._messageFromClient,
                        },

                        messageToClient: {
                            actions: this._messageToClient,
                        },

                        disconnect: {
                            actions: this._handleDisconnect,
                            state: "reconnectOrDie"
                        }
                    }
                },

                reconnectOrDie: {
                    transitions: {
                        reconnect: {
                            actions: this._handleResync,
                            state: "resync"
                        },

                        timerExpired: {
                            actions: this._terminate
                        },

                        processTerminated: {
                            state: "terminated"
                        },
                    }

                },

                resync: {

                    disconnect: {
                        actions: this._handleDisconnect,
                        state: "reconnectOrDie"
                    },

                    resynced: {
                        state: "active"
                    }


                },


                terminated: {
                    final: true
                }

            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })

    }
}


module.exports = {
    ClientSession: ClientSession
}
