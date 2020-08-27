const err = require('../common/Error')
const { StateMachine } = require("adv-state");
const { iCrypto } = require("../common/iCrypto")
const { createClientIslandEnvelope, createAuthMessage } = require("../common/Message");
const { Internal } = require("../common/Events")


class Session{
    constructor(){
        if(this.constructor === Session){
            throw new err.AttemptToInstatiateBaseClass()
        }
    }
}



class ClientSession extends Session {
    _sessionKey;
    _socket;
    _publicKey;
    _encryptedPrivateKey;
  
    constructor(socket, publicKey, encryptedPrivateKey){
        super();
        this._socket = socket;
        this._publicKey = publicKey;
        this._encryptedPrivateKey = encryptedPrivateKey
        this._sendCount = 0;
        this._receiveCount = 0;
        this._sessionKey = this._createSessionKey();
        this._sm = this._prepareStateMachine();
        //this._subscribe(clientConnector, connectionId)
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods



    send(message){
        this._sm.handle.messageToClient(message);
    }


    tryReconnection(socket){
        let secretEncrypted = socket.getSessionSecret()
        if(this._isSecretIdentified()){
            this._sm.handle.reconnect(socket)
        }
    }

    //Given nonce tries to decrypt it with session key
    doesDecrypt(nonce){
        return false
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _sendChallenge(){
        let ic = new iCrypto()
        ic.setRSAKey("pub", this._publicKey, "public")
          .addBlob("session_key", this._sessionKey)
          .publicKeyEncrypt("session_key", "pub", "challenge", "hex")
        let data = {
            session_key: ic.get("session_key"),
            private_key: this._encryptedPrivateKey
        }

        let msg = createAuthMessage({ data: data, command: Internal.AUTH_CHALLENGE })
        this._sendAuth(msg)
    }

    _sendAuth(msg){
        this._socket.emit("auth", msg)
    }

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

    _createSessionKey(){
        let ic = new iCrypto()
        ic.createSYMKey("sk")
        return ic.get("sk")
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
                    entry: this._sendChallenge(),
                    initial: true,
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
                    final: true
                }
            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.NONE})

    }
}


module.exports = {
    ClientSession: ClientSession
}
