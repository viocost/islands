const { StateMachine } = require("adv-state");


class ClientSession {
    constructor(){

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
