const { StateMachine } = require("../../common/AdvStateMachine")
const { iCrypto } = require("../../common/iCrypto")
const { createAuthMessage } = require("../../common/Message")

class PendingConnection{
    constructor({ connector, sessions, vault }){
        this.connector = connector;
        this.sessions = sessions;
        this.vault = vault
        this._sm = this._prepareStateMachine()


        if(this.connector.hasConnectionQuery()){
            this._sm.handle.reconnect()
        } else {
            this._sm.handle.connect(connector, sessions, vault)
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

        connector.on("challenge_response", message=>{
            this._sm.handle.processChallengeResponse(message)
        })

        let vault = this.vault.getVault()
        let vaultPublicKey = this.vault.getPublicKey()

        let sessionKey = this._createSessionKey()
        let encryptedSessionKey = this._encryptSessionKey(sessionKey, vaultPublicKey)

        console.log("Sedning cahllenge to client");
        this._sendChallenge(encryptedSessionKey, vault);

    }

    /**
     * Called when auth request received from the connector
     * Verifies the nonce and creates new session. Or dies
     */
    _processChallengeResponse(stateMachine, eventName, args){

    }

    _handleFail(stateMachine, eventName, args){
        console.log("Destroying the connector");
        let connector = args[0]
        connector.destroy()
    }

    _sendSuccessMessage(connector){
        console.log("Sending success message");
        connector.send("auth", "success")
    }

    _createSessionKey(){
        return iCrypto.getBytes(32)
    }

    _encryptSessionKey(target, publicKey){
        let ic = new iCrypto()
        ic.addBlob("key-raw", target)
          .setRSAKey("pub", publicKey, "public")
          .publicKeyEncrypt("key-raw", "pub", "key-cipher", "hex")
        return ic.get("key-cipher")
    }

    _sendChallenge(sessionKey, vault){
        console.log("Sending challenge");
        let msg = createAuthMessage({
            data: {
                sessionKey: sessionKey,
                privateKey: vault
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
                        connect: {
                            state: "connecting",
                            actions: this._handleConnect.bind(this)
                        },

                        reconnect: {
                            state: "reconnecting"
                        }

                    }
                },

                connecting: {

                },

                reconnecting: {

                },

                failed: {

                },

                done: {

                }


            }
        }, )
    }
}


module.exports = {
    PendingConnection: PendingConnection
}
