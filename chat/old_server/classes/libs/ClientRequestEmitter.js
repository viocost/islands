const EventEmitter = require('events');
const Err = require("./IError.js");
const Logger = require("./Logger");

/**
 * This object accepts and emits already decrypted
 * messages from client. All sessions write to it and all managers are subscribed to it.
 *
 */
class ClientRequestEmitter extends EventEmitter{

    constructor(){
        super();
    }

    acceptMessage(msg, connectionId){
        console.log(`RECEIVED A MESSAGE: ${JSON.stringify(msg)} ${connectionId}`);
        this.emit(msg.headers.command, msg, connectionId)
    }

}

module.exports = ClientRequestEmitter;
