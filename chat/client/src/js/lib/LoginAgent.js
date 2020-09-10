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
import { Message, createAuthMessage } from "../../../../common/Message";
import { iCrypto } from "../../../../common/iCrypto"
import { WildEmitter } from "../../../../common/WildEmitter"


export class LoginAgent{
    constructor(connectorFactory){
        WildEmitter.mixin(this)
        this.sm = this._prepareStateMachine()
        this.connector = this._prepareConnector(connectorFactory);
        this.connector.connect()

    }



    acceptPassword(password){
        this._password = password;
        this.sm.handle.passwordAccepted(password)
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

        connector.on("auth", msg=>{
            console.log(`Auth message received ${msg.headers.command}`);
            msg = Message.from(msg)
            switch(msg.command){
                case("challenge"): {
                    let challenge = msg.data
                    if(challenge.sessionKey && challenge.privateKey){
                        this._challenge = challenge
                        this.sm.handle.challengeAccepted(challenge)
                    }
                }
            }



        })
        return connector;
    }

    /**
     * Sending challenge solution to the server
     */
    _decryptSuccessHandler(stateMachine, eventName, args){
        let sessionKey = args[0]
        let nonceEnc = args[1]

        let msg = createAuthMessage({
            command: "challenge_solution",
            data: nonceEnc
        })

        this.connector.send("auth", msg)

    }

    _initializeSession(stateMachine, eventName, args){
        //Init session, arrival hub, topic loader etc
       

    }


    _handleFailed(stateMachine, eventName, args){
        console.log("Login agent failed");
    }

    _tryDecrypt(stateMachine, eventName, args){
        console.log("Trying to decrypt the challenge");

        console.log("Decrypting vault...");
        let password = this._password;

        let ic = new iCrypto();
        let data;

        try{
            ic.addBlob("s16", this._challenge.privateKey.substring(0, 256))
                .addBlob("v_cip", this._challenge.privateKey.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", password, "s16")
                .AESDecrypt("v_cip", "sym", "vault_raw", true)

            data = JSON.parse(ic.get("vault_raw"));
            this.vaultRaw = data;
            // Temporary. Later vault will be fetched separately.
            // Login agent will only fetch specific keys
        } catch (err){
            this.sm.handle.decryptError(err);
            return;
        }

        // Populating new object
        ic.setRSAKey("pub", data.publicKey, "public")
            .getPublicKeyFingerprint("pub", "pkfp");

        this.vaultRaw.pkfp = ic.get("pkfp")
        //decrypt session key

        ic.setRSAKey("secret-k", this.vaultRaw.privateKey, "private")
          .addBlob("session-k", this._challenge.sessionKey)
          .privateKeyDecrypt("session-k", "secret-k", "session-k-raw-hex", "hex")
        this.sessionKeyRaw = ic.get("session-k-raw-hex");
        console.log(`SESSION KEY ${this.sessionKeyRaw}`);

        //Encrypting control nonce for the server
        ic.addBlob("nonce-raw-hex", this._challenge.nonceEncrypted)
          .hexToBytes('nonce-raw-hex', "nonce-raw")
          .hexToBytes("session-k-raw-hex", "session-k-raw")
          .AESEncrypt('nonce-raw', "session-k-raw", "nonce-enc", true)

        console.log("Session key decrypted");
        this.sm.handle.decryptSuccess(ic.get("session-k-raw-hex"), ic.get("nonce-enc"));

    }

    _notifyLoginError(stateMachine, eventName, args){
        this.emit(LoginAgentEvents.FAIL)
    }

    _notifyDecryptionError(stateMachine, eventName, args){
        this.emit(LoginAgentEvents.DECRYPTION_ERROR)
    }


    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                noVaultNoPassword: {
                    initial: true,
                    transitions: {

                        passwordAccepted: {
                            state: "noVaultHasPassword",
                        },

                        challengeAccepted:{
                            state: "hasVaultNoPassword",
                        }
                    }
                },

                noVaultHasPassword: {
                    transitions: {
                        challengeAccepted:{
                            state: "hasVaultNoPassword",
                        }

                    }

                },


                hasVaultNoPassword: {
                    transitions: {
                        passwordAccepted: {
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
                            actions: this._notifyDecryptionError.bind(this)
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

    DECRYPTION_ERROR: Symbol("decryption_error"),
    FAIL: Symbol("fail"),
    SUCCESS: Symbol("success")

}
