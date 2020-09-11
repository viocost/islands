const { StateMachine } = require("../../common/AdvStateMachine")
const { iCrypto } = require("../../common/iCrypto")
const { createAuthMessage, Message } = require("../../common/Message")
const { SymCryptoAgentFactory, AsymPublicCryptoAgentFactory } = require("../../common/CryptoAgent")

class PendingConnection{
    constructor({ connector, sessions, vault }){
        this.connector = connector;
        this.sessions = sessions;
        this.vault = vault
        this.sessionKeyAgent;
        this._sm = this._prepareStateMachine()


        if(this.connector.hasConnectionQuery()){
            this._sm.handle.reauth()
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
    _handleReconnect(stateMachine, eventName, args){
        let connector = args[0]
        let sessions  = args[1]
        let vault = args[2]

        for(let session of sessions){
            if (session.recognizesCipher(connector.getConnectionQuery().nonce)){
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
    _handleConnect(stateMachine, eventName, args){

        let sessions  = args[1]
        let connector = args[0]
        let controlNonce = iCrypto.hexEncode(iCrypto.getBytes(256))

        connector.on("auth", message=>{
            this._processAuthMessage(message)
        })

        let vault = this.vault.getVault()
        let vaultPublicKey = this.vault.getPublicKey()

        let sessionKeyAgent = SymCryptoAgentFactory.make();

        let vaultPublicKeyAgent = AsymPublicCryptoAgentFactory.make(vaultPublicKey)

        console.log(`Session key is ${sessionKeyAgent.getKey()}`);

        let encryptedSessionKey = vaultPublicKeyAgent.encrypt(sessionKeyAgent.getKey())
        this.sessionKeyAgent = sessionKeyAgent;
        this.controlNonce = controlNonce;

        console.log("Sedning cahllenge to client");
        this._sendChallenge(encryptedSessionKey, vault, controlNonce);

    }

    _processAuthMessage(msg){
        msg = Message.from(msg)
        switch(msg.command){
            case("challenge_solution"): {
                this._sm.handle.verifySolution(msg.data);
                break
            }
        }



    }

    /**
     * Called when auth request received from the connector
     * Verifies the nonce and creates new session. Or dies
     */
    _handleVerifySolution(stateMachine, eventName, args){
        try{
            let nonceEncrypted = args[0]
            let ic = new iCrypto()
            ic.addBlob("nonce-enc", nonceEncrypted)
              .addBlob("session-key-hex", this.sessionKey)
              .hexToBytes("session-key-hex", "session-key")
              .AESDecrypt("nonce-enc", "session-key", "nonce-raw", true)
              .bytesToHex("nonce-raw", "nonce-hex")
            if(ic.get("nonce-hex" !== this.controlNonce)){
                console.log("Error, solution is invalid. Shutting down");
                this._sm.handle.solutionInvalid()
                return
            } else {
                console.log("Control nonce verification successful");
            }
        }catch(err){
            console.log(`Error while decrypting a message: ${err}. Shutting down`);
            this._sm.handle.fail()
        }



    }

    _handleFail(stateMachine, eventName, args){
        console.log("Destroying the connector");
        let connector = args[0]
        //connector.destroy()
    }

    _sendSuccessMessage(connector){
        console.log("Sending success message");
        let msg = createAuthMessage({ command: "auth_ok", data: null })
        this.connector.send("auth", msg)
    }



    _sendChallenge(sessionKey, vault, nonceEncrypted){
        console.log("Sending challenge");
        let msg = createAuthMessage({
            data: {
                sessionKey: sessionKey,
                privateKey: vault,
                nonceEncrypted: nonceEncrypted
            },
            command: "challenge"
        })

        this.connector.send("auth", msg)
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
                            state: "done"
                        },

                        fail: {
                            state: "failed"
                        }

                    }


                },

                reauthenticating: {
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
