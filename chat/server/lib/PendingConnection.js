const { StateMachine } = require("../../common/AdvStateMachine")
const { iCrypto } = require("../../common/iCrypto")
const { createAuthMessage, Message } = require("../../common/Message")
const { SymCryptoAgentFactory, AsymPublicCryptoAgentFactory } = require("../../common/CryptoAgent")
const { ServerSessionFactory } = require("../../common/Session");
const { AuthMessage } = require("../../common/AuthMessage")



class PendingConnection{
    constructor({ connector, sessions, vault }){
        this.connector = connector;
        this.sessions = sessions;
        this.vault = vault
        this.sessionKeyAgent;
        this._sm = this._prepareStateMachine()


        if(this.connector.hasConnectionQuery()){
            this._sm.handle.reauth(connector.getConnectionQuery(), connector)
        } else {
            this._sm.handle.auth(connector, sessions, vault)
        }
    }


    /**
     * This will try every session in sessions to decipher
     * nonce passed in the connection query.
     * If succeed, then we found the session, and just replace its dead connection with the new one
     *
     * Otherwise, if none of the sessions was able to decrypt the nonce, we drop the connection.
     * If session has expired - user will have to re-login anyway. Or someone is trying to supply wrong key or attack.
     *
     */
    _handleReconnect(args){

        console.log(`Handling reconnect. ${connector.getConnectionQuery()}`);
        let connector = args[0]
        let sessions  = args[1]
        let vault = args[2]

        for(let session of sessions){
            if (session.recognizes(connector.getConnectionQuery())){
                session.replaceConnection(connector);
                this._sm.handle.done()
                return;
            }
        }

        console.log("Unable to process connection. Dropping...");
        this._sm.handle.fail(connector)
    }

    /**
     * Creates new sesison key, encrypts it with
     * vault public key, and sends vault and encrypted session key to client
     * for decryption.
     */
    _handleConnect(args){
        let connector = args[0]
        let secret = iCrypto.hexEncode(iCrypto.getBytes(64))

        connector.on("auth", message=>{
            this._processAuthMessage(message)
        })

        let vaultEncrypted = this.vault.getVault()
        let vaultPublicKey = this.vault.getPublicKey()

        console.log(`public key: ` + vaultPublicKey);
        let sessionKeyAgent = SymCryptoAgentFactory.make();

        let vaultPublicKeyAgent = AsymPublicCryptoAgentFactory.make(vaultPublicKey)

        console.log(`Session key is ${sessionKeyAgent.getKey()}`);

        let encryptedSessionKey = vaultPublicKeyAgent.encrypt(sessionKeyAgent.getKey().getSecret())
        this.sessionKeyAgent = sessionKeyAgent;
        this.secret = secret;

        console.log("Sedning cahllenge to client");
        this._sendChallenge(encryptedSessionKey, vaultEncrypted, vaultPublicKeyAgent.encrypt(secret));
    }

    _processAuthMessage(msg){
        msg = Message.from(msg)
        switch(msg.command){
            case(AuthMessage.CHALLENGE_SOLUTION): {
                this._sm.handle.verifySolution(msg.data);
                break
            }

            default: {
                console.log(`Unknown auth message received: ${msg}`);
            }
        }
    }

    /**
     * Called when auth request received from the connector
     * Verifies the nonce and creates new session. Or dies
     */
    _handleVerifySolution(args){
        try{
            let nonceEncrypted = args[0]
            let nonceDecrypted = this.sessionKeyAgent.decrypt(nonceEncrypted)

            console.log(`Nonce decrypted: ${nonceDecrypted} \nControl nonce: ${this.secret}`);
            if(nonceDecrypted !== this.secret){
                console.log("Error, solution is invalid. Shutting down");
                this._sm.handle.solutionInvalid()
                return
            } else {
                console.log("Control nonce verification successful");
                this._sm.handle.solutionValid()
            }
        }catch(err){
            console.log(`Error while decrypting a message: ${err}. Shutting down`);
            this._sm.handle.fail()
        }
    }

    _handleFail(args){
        console.log("Destroying the connector");
        let connector = args[0]
        //connector.destroy()
    }

    _sendSuccessMessage(connector){

        console.log("Sending success message");
        let msg = createAuthMessage({ command: AuthMessage.AUTH_OK, data: null })
        this.connector.send("auth", msg)
    }



    //Sending vault public key encrypted secret nonce to the client.
    // Expecting the same nonce session key encrypted in response
    _sendChallenge(sessionKey, vaultEncrypted, secretEncrypted){
        console.log("Sending challenge");
        let msg = createAuthMessage({
            data: {
                sessionKey: sessionKey,
                privateKey: vaultEncrypted, //here sending the whole vault blob
                secret: secretEncrypted,
                vaultId: this.vault.getId()
            },
            command: "challenge"
        })

        this.connector.send("auth", msg)
    }

    /**
     * Reauth is basically taking an encrypted nonce and
     * trying to decrypt it with every existing session.
     * If some pending session successfully decrypts the nonce, then
     * that session is given a new connector and its destroy timer is disabled
     */
    _handleReauth(args){

        console.log("Reauthenticating");
        let connector = args[1]
        for(let session of this.sessions.getPausedSessions()){
            console.log("FOUND PAUSED SESSION");
            if (session.recognizesSecret(args[0])){

                console.log("SECRET RECOGNIZED");
                session.replaceConnectorOnReconnection(connector)

                //Sending Auth OK message
                let msg = createAuthMessage({ command: AuthMessage.AUTH_OK, data: null })
                connector.send("auth", msg)
            }
        }



    }

    /**
     * Called after successful authentication
     * Initializes new session, hands it a connector and crypto agent
     * sends "auth_ok" message to the client,
     * exits
     *
     */
    _initSession(args){

        console.log("Initializing session");
        let session  = ServerSessionFactory.make(this.connector, this.sessionKeyAgent, this.secret);
        this.sessions.add(session)
        this._sendSuccessMessage()
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Pending connection SM",
            stateMap: {
                start: {
                    initial: true,
                    transitions: {
                        auth: {
                            state: "authenticating",
                            actions: this._handleConnect.bind(this)
                        },

                        reauth: {
                            state: "reauthenticating"
                        },
                        fail: {
                            state: "failed"
                        }
                    }
                },

                authenticating: {
                    transitions: {
                        verifySolution: {
                            actions: this._handleVerifySolution.bind(this)
                        },

                        solutionInvalid: {
                            state: "failed"
                        },

                        solutionValid: {
                            state: "initializing"
                        },

                        fail: {
                            state: "failed"
                        }

                    }


                },

                initializing: {
                    entry: this._initSession.bind(this),
                    transitions: {
                        done: {
                            state: "done"
                        },

                        fail: {
                            state: "failed"
                        }
                    }

                },

                reauthenticating: {
                    entry: this._handleReauth.bind(this),
                    transitions: {
                        solutionInvalid: {
                            state: "failed"
                        },

                        solutionValid: {
                            state: "done"
                        },

                        fail: {
                            state: "failed"
                        }

                    }
                },

                failed: {
                    final: true,

                    entry: this._handleFail.bind(this),
                },

                done: {
                    final: true
                }

            }
        }, )
    }
}



module.exports = {
    PendingConnection: PendingConnection
}
