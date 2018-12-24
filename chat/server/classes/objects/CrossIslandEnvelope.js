const Err = require("../libs/IError.js");

class CrossIslandEnvelope{
    constructor(destination = Err.required(),
                payload = Err.required(),
                origin){
        this.destination = destination;
        this.payload = payload;
        this.origin = origin;
        this.returnOnConnectionFail = false;
    }

    static getOriginalPayload(envelope){
        let request = envelope;
        while(request.payload){
            request = request.payload
        }
        return request
    }

    setReturn(err){
        this.return = true;
        this.error  = err;
    }

    setResponse(){
        this.response = true;
    }

    setReturnOnFail(val){
        this.returnOnConnectionFail = !!val;
    }

    static makeReturnEnvelope(originalEnvelope, err){
        const returnEnvelope = new CrossIslandEnvelope(originalEnvelope.origin, originalEnvelope, originalEnvelope.destination);
        returnEnvelope.setReturn(err);
        return returnEnvelope;
    }

    getPayload(){
        return this.payload
    }

    setPayload(payload = Err.required()){
        this.payload = payload;
    }
}

module.exports = CrossIslandEnvelope;