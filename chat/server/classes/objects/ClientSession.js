const iCrypto = require("../../../common/iCrypto");

class ClientSession{
    constructor(connectionManager, connectionId, clientPublicKey){
        this.sm = this._prepareStateMachine()
        this.connectionManager = connectionManager;
        this.connectionId = connectionId;
        this.clientPublicKey = clientPublicKey;
        this.sessionKey = iCrypto.createRandomHexString();
        this.challenge = iCrypto.createRandomHexString();




    }


    _prepareStateMachine(){



    }






}


module.exports = ClientSession;
