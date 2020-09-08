/**

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
import { StateMachine } from "../../../../common/AdvStateMachine";


export class LoginAgent{
    constructor(connectorFactory){
        this.sm = this._prepareStateMachine()
        this.connector = this._prepareConnector(connectorFactory);
        this.connector.connect()
    }



    acceptPassword(password){
        this.sm.handle.acceptPassword(password)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _prepareConnector(connectorFactory){

        let connector = connectorFactory.make()

        connector.on(ConnectorEvents.CONNECTING, ()=>{
            console.log("connector connecting");
        })

        connector.on(ConnectorEvents.CONNECTED, ()=>{
            console.log("connector conected");
        })

        connector.on(ConnectorEvents.DEAD, ()=>{
            console.log("connector dead");
            this.sm.handle.connectorDead()
        })


        connector.on("*", (event, data)=>{
            console.log(`message received: ${event.toString()}, ${data}`);
        })

        return connector;
    }

    _decryptSuccessHandler(stateMachine, eventName, args){

    }

    _initializeSession(stateMachine, eventName, args){
        //Init session, arrival hub, topic loader etc
       

    }

    _acceptChallenge(stateMachine, eventName, args){
        console.log("Accepting challengte");

    }

    _acceptPassword(stateMachine, eventName, args){
        console.log("Saving password");
        this._password = args[0]
    }


    _handleFailed(stateMachine, eventName, args){
        console.log("Login agent failed");
    }

    _tryDecrypt(stateMachine, eventName, args){

    }

    _notifyLoginError(stateMachine, eventName, args){
       
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
                            state: "failed"
                        },
                        decryptError: {
                            state: "hasVaultNoPassword",
                            actions: this._notifyLoginError.bind(this)
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
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }


}

export const LoginAgentEvents = {

}
