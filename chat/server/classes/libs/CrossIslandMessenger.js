const EventEmitter = require("events");
const Err = require("./IError.js")
const Envelope = require("../objects/CrossIslandEnvelope.js");
const Logger = require("../libs/Logger.js");
const Multiqueue = require("../libs/Multiqueue.js");


class CrossIslandMessenger extends EventEmitter{
    constructor(connector = Err.required()){
        super();
        this.connector = connector;
        this._crossIslandMessageQueue = new Multiqueue();
        this._setConnectorListeners();
    }

    /**
     * Attempts to send given envelope asynchronously.
     * The function will resolve once envelope is enqueued.
     * Next it will check connection with the endpoint.
     * If connection is already established
     * If not established - it will try to establish new connection.
     *
     * Returns promise whether sent attempt was successfull.
     *
     * @arg envelope: CrossIslandEnvelope - envelope to send
     * @arg params: send parameters. Can contain following properties:
     *     onError - callback(envelope) will be called if error occurs during message send
     *     onTimeout - callback(envelope) will be called if timeout expires
     *     onDelivered - callback(envelope) will be called once message has been delivered to addressee
     *     timeout - number in milliseconds. Undefind by default.
     *         If envelope has not been delivered to the addressee before timeout expired
     *         the envelope will be removed from the queue and onTimeout callback will be called.
     */
    async send(envelope, params){
        //TODO implement
        // enqueue envelope

        await this._crossIslandMessageQueue.enqueue(envelope);
        //if onTimeout and timeout - set timeout
        if (typeof params.timeout === "number" && params.timeout > 0){
            setTimeout(()=>{

            }, params.timeout)
        }
        this._checkConnection(envelope.destination, envelope.origin);
        //set other callbacks

        //check connection
    }


    getTimeoutHandler(envelope, onTimeout){
        let self = this
        return async ()=>{
            Logger.debug("standard onTimeout handler called for expired envelope.")
            let queue = self._crossIslandMessageQueue.get(envelope.destination)
            await queue.remove(envelope);
            if (typeof onTimeout === "function"){
                onTimeout(envelope);
            }
        }
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
        //TODO re-implement wiht new data structure

        Logger.debug("Connection established. Processing queue", {destination: destination});

        if(!this._crossIslandMessageQueue[destination]){
            Logger.debug("No messages to send to destination", {destination: destination})
            return;
        }

        let queue = this._crossIslandMessageQueue.get(destination);

        
        while(!queue.isEmpty()){

            let envelope = await queue.dequeue()
            try{
                await this.connector.sendDirectly(envelope);
                if(typeof envelope.onDelivered === "function"){
                    envelope.onDelivered();
                }
            }catch(err){
                Logger.error("Error while sending a message. Will try to re-establish connection", {destination: destination, error: err.message});
                this._checkConnection(envelope.origin, envelope.destination)
                if (typeof envelope.onError === "function"){
                    envelope.onError();
                }
            }
        }
    }

    processConnectionError(data){
        //TODO remove this thing as now it will be handled by timeout callback.
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
