const EventEmitter = require("events");
const Err = require("./IError.js")
const Envelope = require("../objects/CrossIslandEnvelope.js");
const Logger = require("../libs/Logger.js");

class CrossIslandMessenger extends EventEmitter{
    constructor(connector = Err.required()){
        super();
        this.connector = connector;
        this._crossIslandMessageQueue = {};
        this._setConnectorListeners();
    }

    async send(envelope,){
        this._enqueueMessage(envelope);
        this._checkConnection(envelope.destination, envelope.origin);
    }

    _checkConnection(dest, orig, numberOfAttempts = 7, timeout = 7000){
        this.connector.callPeer(dest, orig, numberOfAttempts, timeout)
    }

    _enqueueMessage(envelope){
        Logger.debug("Enqueueing message and awaiting connection_established event");
        let dest = envelope.destination;
        if(this._crossIslandMessageQueue[dest]){
            this._crossIslandMessageQueue[dest].push(envelope)
        } else {
            this._crossIslandMessageQueue[dest] = [envelope];
        }
    }

    _dequeueMessage(destination){
        return this._crossIslandMessageQueue[destination].shift();
    }


    _setConnectorListeners(){
        this.connector.on("connection_established", async residence =>{
            await this._sendAwaitingMessages(residence);
        });
        this.connector.on("connection_error", data =>{
            this.processConnectionError(data)
        });


        this.connector.on("message", envelope=>{
            if (envelope.return){
                Logger.warn("Return envelope received", {
                    origin: envelope.origin,
                    dest: envelope.destination,
                    command: this.getMessageCommand(envelope)
                });

                this.emit("return_" +  this.getMessageCommand(envelope), envelope);
            }else if (envelope.response){
                Logger.verbose("Response envelope received", {
                    origin: envelope.origin,
                    dest: envelope.destination,
                    command: this.getMessageCommand(envelope)
                });
                this.emit(this.getMessageResponse(envelope), envelope);
            }else{
                Logger.verbose("Envelope received", {
                    origin: envelope.origin,
                    dest: envelope.destination,
                    command: this.getMessageCommand(envelope)
                });
                this.emit(this.getMessageCommand(envelope), envelope);
            }
        });
        this.connector.on("error", (envelope, err)=>{
            Logger.error("Tor connector error.",{
                error: err
            });
        })
    }


    async _sendAwaitingMessages(destination){
        Logger.debug("Connection established. Processing queue", {destination: destination});
        if(!this._crossIslandMessageQueue[destination]){
            Logger.debug("No messages to send to destination", {destination: destination})
            return;
        }
        while(this._crossIslandMessageQueue[destination].length > 0){
            let envelope = this._crossIslandMessageQueue[destination][0];
            try{
                await this.connector.sendDirectly(envelope);
                this._dequeueMessage(destination);
            }catch(err){
                Logger.error("Error while sending a message. Will try to re-establish connection", {destination: destination, error: err.message});
                this._checkConnection(envelope.origin, envelope.destination)
            }
        }
    }

    processConnectionError(data){
        Logger.debug("Error establishing a connection to hidden endpoint", {
            origin: data.origin,
            destination: data.destination,
            maxAttempts: data.maxAttempts,
            attempts: data.attempts,
            error: data.error
        });
        if(!this._crossIslandMessageQueue[data.destination] || this._crossIslandMessageQueue[data.destination].length === 0){
            return
        }
        this._crossIslandMessageQueue[data.destination] = this._crossIslandMessageQueue[data.destination].filter(envelope=>{
            if (envelope.returnOnConnectionFail){
                this.returnEnvelopeOnConnectionFail(envelope, data.error);
            }
            return !(envelope.returnOnConnectionFail);
        });
    }


    returnEnvelopeOnConnectionFail(envelope, errMsg){
        envelope.setReturn("Endpoint is unreachable: " + errMsg);
        this.emit("return_" +  this.getMessageCommand(envelope), envelope);
    }


    async returnEnvelope(originalEnvelope, err){
	let logmsg = "Island is returning envelope origin: " + originalEnvelope.origin +
		    " dest: " + originalEnvelope.destination +
	    " error: " + err;
	if (originalEnvelope.payload
	    && originalEnvelope.payload.headers
	    && originalEnvelope.payload.headers.command){
	    logmsg += (" command: " + originalEnvelope.payload.headers.command);
	}
	Logger.warn(logmsg);
        const envelope = Envelope.makeReturnEnvelope(originalEnvelope, err);
        return this.connector.sendDirectly(envelope);
    }


    getMessageCommand(envelope){
        while(envelope.payload){
            envelope = envelope.payload;
        }
        const message = envelope;
        return message.headers.command;
    }


    getMessageResponse(envelope){
        while(envelope.payload){
            envelope = envelope.payload;
        }
        const message = envelope;
        return message.headers.response;
    }


    _printOutgoingEnvelope(envelope){
        if (envelope.return){
            console.log("\n================= SENDING RETURN ENVELOPE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope) + "\n\n");
        }else if (envelope.response){
            console.log("\n================= SENDING RESPONSE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope));
            console.log("    response: " + this.getMessageResponse(envelope) + "\n\n");
        }else{
            console.log("\n================= SENDING MESSAGE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope) + "\n\n");
        }
    }

    _printIncomingEnvelope(envelope){
        if (envelope.return){

            console.log("\n================= RECEIVED RETURN ENVELOPE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope) + "\n\n");
        }else if (envelope.response){
            console.log("\n================= RECEIVED RESPONSE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope));
            console.log("    response: " + this.getMessageResponse(envelope) + "\n\n");
        }else{
            console.log("\n================= RECEIVED MESSAGE ============ ");
            console.log("    Origin: " + envelope.origin);
            console.log("    Destination: " + envelope.destination);
            console.log("    command: " + this.getMessageCommand(envelope) + "\n\n");
        }
    }

}

module.exports = CrossIslandMessenger;
