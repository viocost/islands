const { StateMachine } = require("adv-state");
const { iCrypto } = require("../../common/iCrypto")
const { createClientIslandEnvelope } = require("../../common/Message");


class ClientSession {
    constructor(clientConnector, connectionId, clientRequestEmitter){
        this.clientConnector = clientConnector;
        this.clientRequestEmitter = clientRequestEmitter
        this.connectionId = connectionId;
        this.sm = this._prepareStateMachine();
        this._sendCount = 0;
        this._receiveCount = 0;
        this._subscribe(clientConnector, connectionId)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    acceptAsymKey(publicKey, vaultEncrypted){
        this.sm.handle.authWithPublicKey(publicKey, vaultEncrypted)
    }


    send(message){
        this.sm.handle.messageToClient(message);
    }


    // This function expects encrypted with session key secret
    // On reconnect if given secret decrypts and matches the secret that was set earlier
    // A new socket will be given to the session
    isSecretIdentified(secretEncrypted){
        try{
            console.log(`Identifying a secret: ${secretEncrypted}`);
            let secretRaw = this._sessionKeyDecrypt(secretEncrypted)
            console.log(`Secret set: ${this.secret}, secret given: ${secretRaw}, matches: ${secretRaw === this.secret}`);
            return this.secret === secretRaw;
        }catch (err){
            console.log("secret didn't match:", err);
            return false
        }
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _subscribe(clientConnector, connectionId){
        clientConnector.on(connectionId, (msg, data)=>{
            switch(msg){
                case "message":
                    this._messageFromClient(data)
                    break

                case "client_disconnected":
                    console.log(`Client disconnected: ${connectionId}`);
                    break
                case "client_reconnected":
                    console.log(`Client reconnected: ${connectionId}`);
                    break
            }
        })

    }

    _sessionKeyEncrypt(data){
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        const ic = new iCrypto();
        ic.addBlob("msg_raw", msg)
          .setSYMKey("key", this.sessionKey)
          .AESEncrypt("msg_raw", "key", "msg_enc", true)
        return ic.get("msg_enc");
    }

    _sessionKeyDecrypt(data){
        console.log(`Session key${this.sessionKey}`);
        const ic = new iCrypto();
        ic.addBlob("msg_enc", data)
          .setSYMKey("key", this.sessionKey)
          .AESDecrypt("msg_enc", "key", "msg_raw", true)
        return ic.get("msg_raw");
    }

    _authWithPublicKey(stateMachine, evName, args){
        let publicKey = args[0]
        let privateKeyEncrypted = args[1]

        let ic = new iCrypto()
        ic.createNonce("secret-bin", 64)
          .bytesToHex("secret-bin", "secret")
          .createSYMKey("session-key")
          .setRSAKey("public-key", publicKey, "public")
          .publicKeyEncrypt("secret", "public-key", "secret-enc", "hex")
          .publicKeyEncrypt("session-key", "public-key", "session-key-enc", "hex")

        this.sessionKey = ic.get("session-key")
        this.secret = ic.get("secret")

        let msg = createClientIslandEnvelope({ command: "challenge", body: {
            privateKeyEncrypted: privateKeyEncrypted,
            secret: ic.get("secret-enc"),
            sessionKey: ic.get("session-key-enc")
        }})

        console.log("Sending auth challenge to client");

        this.clientConnector.send(this.connectionId, "auth", msg)
    }


    _authWithSymkey(){

    }


    _terminate(){

    }

    _messageFromClient(blob){
        try{
            let {seq, message} = JSON.parse(this._sessionKeyDecrypt(blob))
            console.log(`Received message with seq ${seq}. Previous seq: ${this._receiveCount}`);
            if(seq !== this._receiveCount + 1){
                console.log("Messages missing!");
            }
            this._receiveCount++;
            this.clientRequestEmitter.acceptMessage(message, this.connectionId)

        }catch(err){
            console.log(`Decryption error in client session: ${err.message}`);
        }
    }

    _messageToClient(stateMachine, evName, args) {

        const seq = ++this._sendCount;
        const blob = this._sessionKeyEncrypt({ seq: seq, message: args[0] });
        this.clientConnector.send(this.connectionId, "message", blob)
    }


    _handleDisconnect() {
        console.log("\nHere we handling disconnect\n");

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
                        },

                        authWithPublicKey: {
                            actions: this._authWithPublicKey,
                            state: "active"
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

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.NONE})

    }
}


module.exports = {
    ClientSession: ClientSession
}
