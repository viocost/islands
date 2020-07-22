const { StateMachine } = require("adv-state");
const { iCrypto } = require("../../common/iCrypto")
const { createClientIslandEnvelope } = require("../../common/Message");


class ClientSession {
    constructor(){
        this.sm = this._prepareStateMachine();

    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    acceptAsymKey(publicKey, vaultEncrypted){
        this.sm.handle.authWithPublicKey(publicKey, vaultEncrypted)
    }





    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _authWithPublicKey(stateMachin, evName, args){
        let publicKey = args[0]
        let privateKeyEncrypted = args[1]

        let ic = new iCrypto()
        ic.createNonce("secret", 128)
          .createSYMKey("session-key")
          .setRSAKey("public-key", publicKey, "public")
          .publicKeyEncrypt("secret", "public-key", "secret-enc")
          .publicKeyEncrypt("session-key", "public-key", "session-key-enc")

        this.sessionKey = ic.get("session-key")
        this.secret = ic.get("secret")

        let msg = createClientIslandEnvelope({ command: "auth-challenge", body: {
            privateKeyEncrypted: privateKeyEncrypted,
            secret: ic.get("secret-enc"),
            sessionKey: ic.get("session-key-enc")
        }})

        console.log("Sending auth challenge to client");

    }

    _authWithSymkey(){

    }


    _terminate(){

    }

    _messageFromClient(){

    }

    _messageToClient() {

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
                            state: "awatingAuth",
                        },

                        authWithPublicKey: {
                            actions: this._authWithPublicKey,
                            state: "awatingAuth",
                        },

                        disconnect: {
                            actions: this._terminate
                        }
                    }
                },

                awatingAuth: {
                    transitions: {
                        authSuccess: {
                            state: "active",
                        },
                        authFailed: {
                            actions: this._terminate
                        },
                        processTerminated: {
                            state: "terminated"
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
