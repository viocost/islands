const { iCrypto } = require("./iCrypto")
const { clone } = require("./ObjectUtil")

/**
 * Message is the major data type used for client-server-client communication
 * 
 * 
 * 
 * Possible headers:
 *  command: used mainly between browser and island
 *  response: island response to browser. This is an arbitrary string by which
 *         sender identifies the outcome of the request. Can be an error code like login_error
 *  error: error message if something goes wrong it should be set. If it is set -
 *              the response treated as an error code
 *  pkfpSource: public key fingerprint of the sender
 *  pkfpDest: public key fingerprint of the recipient
 *
 *
 */
class Message{
    constructor(version, request){

        if(typeof(request)==="string"){
            request = JSON.parse(request);
        }
        this.headers = request ? this.copyHeaders(request.headers) : {
            command: "",
            response: "",
            version: version
        };

        this.body = request ? request.body : {};
        this.signature = request ? request.signature : "";
    }

    static from(obj){
        let message = new Message();
        for(let key in obj){
            message[key] = obj[key]
        }

        return message
    }


    static verifyMessage(publicKey, message){
        // CRYPTO: Verify message signature
        let ic = new iCrypto();
        let requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", message.signature)
            .hexToBytes('sign', "signraw")
            .addBlob("b", requestString);
        ic.publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }

    copyHeaders(headers){
        let result = {};
        let keys = Object.keys(headers);
        for (let i=0; i< keys.length; ++i){
            result[keys[i]] = headers[keys[i]];
        }
        return result;
    }

    setVersion(version){
        if(version === undefined || version === "") throw new Error("Error setting message version: version undefined");
        this.headers.version = version;
    }

    signMessage(privateKey){
        // CRYPTO:  Sign message with private key
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.headers) + JSON.stringify(this.body);
        ic.addBlob("body", requestString)
            .setRSAKey("priv", privateKey, "private")
            .privateKeySign("body", "priv", "sign");
        this.signature = ic.get("sign");
    }


    setSource(pkfp){
        this.headers.pkfpSource = pkfp;
    }

    setDest(pkfp){
        this.headers.pkfpDest = pkfp;
    }

    setCommand(command){
        this.headers.command = command
    }

    setBody(body){
        this.body = body;
    }

    addNonce(){
        // CRYPTO:  Create nonce
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        this.headers.nonce = ic.get("nhex");
    }

    get source(){
        return this.headers.source
    }

    set source(source){
        this.headers.source = source
    }

    get dest(){
        return this.headers.dest
    }

    set dest(dest){
        this.headers.dest = dest
    }
    get command(){
        return this.headers.command
    }

    set command(command){
        this.headers.command = command
    }

    get data(){
        return this.body
    }

    set data(data){
        this.body = data
    }
}

function createClientIslandEnvelope({ pkfpSource,
                                             pkfpDest,
                                             command,
                                             version = global.VERSION ? global.VERSION : window.islandsVersion(),
                                             body = {},
                                             privateKey  }){

    const message = new Message(version);
    message.headers.pkfpSource = pkfpSource;
    message.headers.pkfpDest = pkfpDest;
    message.headers.command = command;
    message.headers.version = version;
    message.body = clone(body);

    if (privateKey){
        message.signMessage(privateKey);
    }

    return message;
}

function createAuthMessage({
    data, command
}){
    const message = new Message();
    message.headers.command = command;
    message.body = data;
    return message;
}

Message.properties = ["headers", "body", "signature"];


module.exports = {
    createClientIslandEnvelope: createClientIslandEnvelope,
    Message: Message,
    createAuthMessage: createAuthMessage
}
