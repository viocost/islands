/**
 *
 * Responsibilities:
 * - Initialize connector
 * - Establish authenticated connection
 * - Initialize session
 * - Initialize Crypto agent
 * - Initiazlie Master key agent
 *

 First thing login agent does is initializes a connector.

 Connector should automatically connect to the island.
 If password is supplied before connector established the connection,
 the agent should save the password and continue with connector.

 It is possible that connector will die on timeout, if failed to reach the server.
 In that case login agent should return "timed out" message which would be shown
 to the user and ask to reload the page.

 Once connection is established, login agent should receive a message
 with encrypted private key from the server (sent automatically on new connection).

 If password is present - login agent should perform decryption
 and initialization, otherwise it should wait for the password.

 Once login agent has both password and encrypted private key - it should proceed to
 decryption. In case if user will entered wrong password - Login agent will fail to decrypt the
 private key. User should then be asked to enter password again. Once entered, login agent will
 re-attempt decryption. The cycle will repeat until user enters the correct password or leaves the page.

 Once key is decrypted, login agent initializes Session, TopicLoader, ArrivalHub, and exits.

 */


import { ConnectorEvents } from "./Connector"


export class LoginAgent{
    constructor(connectorFactory){
        this.sm = this._prepareStateMachine()
        this.connector = connectorFactory.make()
        this.connector.on(ConnectorEvents.CONNECTING, ()=>{
            console.log("connector connecting");
        })

        this.connector.on(ConnectorEvents.CONNECTED, ()=>{
            console.log("connector conected");
        })

        this.connector.on(ConnectorEvents.DEAD, ()=>{
            console.log("connector dead");
            this.sm.handle.connectorDead()
        })


        this.connector.on("auth", msg=>{
            console.log(`Auth message received: ${msg}`);
        })

    }

    acceptPassword(password){
        this.sm.handle.acceptPassword(password)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS


    _decryptSuccessHandler(stateMachine, eventName, args){

    }

    _initializeSession(stateMachine, eventName, args){
        //Init session, arrival hub, topic loader etc
       

    }


    _acceptPassword(stateMachine, eventName, args){
        console.log("Saving password");
        this._password = args[0]
    }


    _handleFailed(stateMachine, eventName, args){
        console.log("Login agent failed");
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                noVaultNoPassword: {
                    initial: true,
                    transitions: {

                        acceptPassword: {
                            state: "noVaultHasPassword",
                            actions: this._acceptPassword.bind(this)
                        },

                        acceptChallenge:{
                            state: "hasVaultNoPassword",
                            actions: this._acceptChallenge.bind(this)
                        }
                    }
                },

                noVaultHasPassword: {
                    transitions: {
                        acceptChallenge:{
                            state: "hasVaultNoPassword",
                            actions: this._acceptChallenge.bind(this)
                        }

                    }

                },


                hasVaultNoPassword: {
                    transitions: {
                        acceptPassword: {
                            state: "decrypting"
                        }
                    }
                },

                decrypting: {
                    entry: this._tryDecrypt.bind(this),

                    transitions: {
                        connectorDead: {
                            state:

                        },
                        decryptError: {
                            state: "hasVaultNoPassword",
                            actions: this._notifyLoginError
                        },

                        decryptSuccess: {
                            actions: this._decryptSuccessHandler.bind(this),
                            state: "initializing"
                        }
                    }
                },

                initializing: {
                    entry: this._initializeSession.bind(this)

                },

                authenticated: {
                    final: true
                },

                failed: {
                    entry: this._handleFailed.bind(this),
                    final: true

                }
            }
       })
    }


}

export const LoginAgentEvents = {

}
