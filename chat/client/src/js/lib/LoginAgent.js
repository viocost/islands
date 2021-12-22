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
import { SymCryptoAgentFactory, AsymFullCryptoAgentFactory } from "../../../../common/CryptoAgent"
import { WildEmitter } from "../../../../common/WildEmitter";
import { AuthMessage } from "../../../../common/AuthMessage";
import { SecretHandle } from "../../../../common/SecretHandle";
import { ClientSessionFactory } from "../../../../common/Session";
import { VaultFactory } from "./Vault";
import { IslandsVersion } from "../../../../common/Version";
import { ClientReconnectionAgentFactory } from "./ReconnectionAgent";



export class LoginAgent{
    constructor(connectorFactory, uxBus){
        WildEmitter.mixin(this)
        this.sm = this._prepareStateMachine()
        this.connector = this._prepareConnector(connectorFactory);
        this.connector.connect()
        this.uxBus = uxBus
    }



    acceptPassword(password){
        this._password = new SecretHandle(password, "Entered login password");
        console.log(`Accepted password: ${this._password}`);
        this.sm.handle.passwordAccepted()
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
                case(AuthMessage.CHALLENGE): {
                    let challenge = msg.data
                    if(challenge.sessionKey && challenge.privateKey){
                        this._challenge = challenge
                        this.sm.handle.challengeAccepted()
                    }
                    break
                }

                case(AuthMessage.AUTH_OK): {
                    this.sm.handle.authOk()
                }
            }
        })
        return connector;
    }

    /**
     * Sending challenge solution to the server
     * Secret here is already re-encrypted with session key
     */
    _decryptSuccessHandler(args){

        let sessionKey = args[0]
        let secret = args[1]

        let msg = createAuthMessage({
            command: AuthMessage.CHALLENGE_SOLUTION,
            data: secret
        })

        this.connector.send("auth", msg)

    }

    _initializeSession(args){
        //Init session, arrival hub, topic loader etc
        console.log("Initializing session");

        //make crypto agent

        let cryptoAgent = this.sessionKeyAgent;
        let secret = this.secret

        console.log(`Creating session. Secret: ${secret}`);
        let reconnectionAgentFactory = new ClientReconnectionAgentFactory()
        this.session = ClientSessionFactory.make(this.connector, this.uxBus, cryptoAgent, secret, reconnectionAgentFactory);
        this.sm.handle.success()
    }


    _handleFailed(args){
        console.log("Login agent failed");

        this.emit(LoginAgentEvents.FAIL)
    }


    /**
     * After successful authentication it is needed to initialize
     * Arrival hub, Vault, all topics UI and whatever else.
     * This function will do part of that, but later must be refactored
     * into a dedicated initializer object.
     */
    _handleSuccess(args){
        console.log("Login agent success");


        let vault = VaultFactory.initSaved(IslandsVersion.getVersion, this.vaultRaw, this._challenge.vaultId)
        vault.password = this._password;

        this.emit(LoginAgentEvents.SUCCESS, this.session, vault)
    }

    /**
     * Given a challenge from the server, which consists of
     * - Password encrypted vault private key
     * - vault public key encrypted session key
     * - vault public key encrypted session secret nonce
     *
     * This function will try to decrypt the vault using password
     * provided by user, and decrypt session keys with resulting private key
     */
    _tryDecrypt(args){
        console.log("Trying to decrypt the challenge");

        console.log("Decrypting vault...");
        let password = this._password.getSecret();

        // CRYPTO: Password sym vault decryption
        let ic = new iCrypto();
        let data;

        try{
            let salt = this._challenge.privateKey.substring(0, 256)
            let vaultSymKey = SymCryptoAgentFactory.makeHexFromPassword(password, salt)
            let vaultCipher = this._challenge.privateKey.substr(256)
            let vaultRaw = JSON.parse(vaultSymKey.decrypt(vaultCipher));
            this.vaultRaw = vaultRaw;

            let vaultPrivateKey = AsymFullCryptoAgentFactory.make(this.vaultRaw.privateKey)
            this.secret = vaultPrivateKey.decrypt(this._challenge.secret)

            this.vaultRaw.pkfp = vaultPrivateKey.getPkfp()

            let sessionKey = vaultPrivateKey.decrypt(this._challenge.sessionKey)

            let sessionKeyAgent = SymCryptoAgentFactory.make(sessionKey)

            this.sessionKeyAgent = sessionKeyAgent
            console.log(`SESSION KEY ${sessionKeyAgent.getKey()}`);

            let secretSessionEncrypted = sessionKeyAgent.encrypt(this.secret)
            this.sm.handle.decryptSuccess(sessionKeyAgent.getKey().getSecret(), secretSessionEncrypted);

        } catch (err){
            console.log("Decryption error");
            this.sm.handle.decryptError(err);
            return;
        }
    }

    _notifyLoginError(args){
        this.emit(LoginAgentEvents.FAIL)
    }

    _notifyDecryptionError(args){
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
                        },

                        authOk: {
                            state: "initializing"
                        }

                    }
                },

                initializing: {
                    entry: this._initializeSession.bind(this),
                    transitions: {
                        success: {
                            state: "authenticated"
                        }
                    }

                },

                authenticated: {
                    entry: this._handleSuccess.bind(this),
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
