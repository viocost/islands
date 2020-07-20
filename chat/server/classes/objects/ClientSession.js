const iCrypto = require("../../../common/iCrypto");
const { StateMachine } = require("../../../common/AdvStateMachine");


/**
 * When session is authenticated it is recognized as key agent (or master)
 *
 */

class ClientSession{
    constructor(clientConnector, connectionId){
        this.sm = this._prepareStateMachine()
        this.clientConnector = clientConnector;
        this.connectionId = connectionId;
        this.clientPublicKey = null;
        this.sessionKey = null;
        this.challenge = null;

    }


    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Client Session SM",
            stateMap: {
                guestMode: {
                    initial: true,
                    transitions: {
                        message: {
                            actions: this._handleGuestMessage,
                        },

                        acceptPublicKey: {
                            actions: this._acceptPublicKey,
                            state: "awatingAuthentication"
                        }
                    }
                },

                awatingAuthentication: {
                    transitions: {
                        getChallenge: {
                            actions: this._sendChallenge
                        },

                        authenticate: {
                            actions: this._authenticate
                        },

                        authOk: {
                            state: "connectedAuthenticated"
                        }
                    }
                },


                connectedAuthenticated: {
                    transitions: {
                        message: {
                            actions: this._hanleMessage
                        },

                        handleDisconnect: {
                            state: "authenticatedAwatingSelfDestruction"
                        }
                    }
                },

                authenticatedAwatingSelfDestruction: {

                },

                noAuthAwatingSelfDestruction: {

                },

                termination: {
                    entry: this._processTermination,
                    final: true
                }
            }
        }, {
            msgNotExistMode:  StateMachine.Warn,
            traceLevel: StateMachine.TraceLevel.DEBUG
        })


    }

    _acceptPublicKey(stateMachine, eventName, args){
        this.clientPublicKey = args[0];
        this.sessionKey = iCrypto.createRandomHexString();
        this.challenge  = iCrypto.createRandomHexString();
    }


    _hanleMessage(stateMachine, eventName, args){
       //decrypt with symkey
       //emit payload
    }


    _authenticate(stateMachine, eventName, args){

        let ic = new iCrypto()
        ic
    }

    _handleGuestMessage(stateMachine, eventName, args){

    }

    _processTermination(stateMachine, eventName, args){
        // remove any connector listeners
        // emit terminated
    }
}


module.exports = ClientSession;
