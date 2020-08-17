const err = require('./Error')
const { StateMachine } = require("adv-state");
const { iCrypto } = require("../../common/iCrypto")
const { createClientIslandEnvelope } = require("../../common/Message");


class Session{
    constructor(){
        if(this.constructor === Session){
            throw new err.AttemptToInstatiateBaseClass()
        }
    }
}



class ClientSession extends Session {
    constructor(, ){
        super();
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




    tryReconnection(socket){
        let secretEncrypted = socket.getSessionSecret()
        if(this._isSecretIdentified()){
            this.sm.handle.reconnect(socket)
        }

    }



    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _acceptMessage(message){
        console.log("Accept message called");
    }


    //Replaces dead socket with new alive one
    _acceptSocketOnReconnection(socket){
        this._socket.off("*");
        this._socket = socket;
        this._socket.on("disconnect", ()=>{ throw new Error("Not implemented") })
        this._socket.on("message", ()=>{ throw new Error("Not implemented") })
    }

    // This function expects encrypted with session key secret
    // On reconnect if given secret decrypts and matches the secret that was set earlier
    // A new socket will be given to the session
    _isSecretIdentified(secretEncrypted){
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
                connectedNotAuthenticated: {
                    transitions: {
                        disconnect: {
                            state: "terminated",
                        },

                        authOk: {
                            state: "connectedAuthenticated",
                        }
                    }
                },

                connectedAuthenticated: {
                    transitions: {
                        disconnect: {
                            state: "awatingReconnect"
                        },

                        acceptMessage: {
                            actions: this._acceptMessage.bind(this)
                        },

                    }
                },

                awatingReconnect: {
                    transitions: {
                        timeout: {
                            state: "terminated"
                        },

                        reconnect: {
                            state: "connectedAuthenticated",
                            actions: this._acceptSocketOnReconnection.bind(this)
                        }
                    }
                },

                terminated: {
                    entry: this._commitSuicie,
                    final: true
                }
            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.NONE})

    }
}


module.exports = {
    ClientSession: ClientSession
}
