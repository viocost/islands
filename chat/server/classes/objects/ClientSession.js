const iCryptpo = require("../libs/iCrypto.js");
const Err = require("../libs/IError.js");
const SESSION_ID_LENGTH = 7;

class ClientSession {

    constructor(clientPkfp = Err.required("Missing required parameter clientPkfp"),
                connectionID = Err.required("Missing required parameter socketId"),
                sessionID = Err.required()) {
        this.clientPkfp = clientPkfp;
        this.timeInitialized = Date.now();
        this.counters = this.loadCounters(clientPkfp);
        this.id = sessionID;
        this.connectionID = connectionID;
    }

    getId(){
        return this.id;
    }

    //Loads participant counters
    loadCounters(pkfp){


    }

    getClientPkfp(){
        return this.clientPkfp;
    }

    getConnectionID(){
        return this.connectionID;
    }
}

module.exports = ClientSession;
