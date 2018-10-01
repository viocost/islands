const ClientError = require("../objects/ClientError.js");
const Err = require("../libs/IError.js");
const Request = require("../objects/ClientRequest.js");
const Response = require("../objects/ClientResponse.js");
const Metadata = require("../objects/Metadata.js");



class ClientSettingsAssistant{
    constructor(connectionManager = Err.required(),
                sessionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required()){
        this.connectionManager = connectionManager;
        this.hm = historyManager;
        this.sessionManager = sessionManager;
        this.subscribeToClientRequests(requestEmitter);
    }

    subscribeToClientRequests(requestEmitter){
        this.subscribe(requestEmitter, {
            //Handlers
            update_settings: this.updateSettings
        }, this.clientRequestErrorHandler)
    }


    async updateSettings(request, connectionID, self,){
        const metadata = Metadata.parseMetadata(await self.hm.getLastMetadata(request.headers.pkfpSource));
        if(!Request.isRequestValid(request, metadata.getParticipantPublicKey(request.headers.pkfpSource))){
            throw "Update request was not verified";
        }
        metadata.setSettings(request.body.settings);
        //let clientSettingsManager = new ClientSettingsManager(self.hm);
        //await clientSettingsManager.writeSettings(request.headers.pkfpSource, request.body.settings, metadata);
        self.hm.appendMetadata(metadata.toBlob(), request.headers.pkfpSource);
        let response = new Response("update_settings_success", request);
        self.sessionManager.broadcastUserResponse(request.headers.pkfpSource, response);
    }

    /***** Error handlers *****/
    clientRequestErrorHandler(request, connectionID, self, err){
        console.trace(err);
        try{
            let error = new ClientError(request, self.getClientErrorType(request.headers.command) , "Internal server error")
            self.connectionManager.sendResponse(connectionID, error);
        }catch(fatalError){
            console.log("Some big shit happened: " + fatalError + "\nOriginal error: " + err);
            console.trace(err)
        }
    }

    /**
     * Generic subscribe function
     * @param emitter
     * @param handlers
     * @param errorHandler
     */
    subscribe(emitter = Err.required(),
              handlers = Err.required(),
              errorHandler = Err.required()){
        let self = this;
        Object.keys(handlers).forEach((command)=>{
            emitter.on(command, async(...args)=>{
                args.push(self);
                await self.handleRequest(handlers, command, args, errorHandler);
            })
        })
    }

    /**
     * Generic request handler
     * @param handlers - map of request-specific routines
     * @param command
     * @param args - array of arguments
     * @param errorHandler - request specific error handler
     * @returns {Promise<void>}
     */
    async handleRequest(handlers, command, args, errorHandler){
        try{
            await handlers[command](...args)
        }catch(err){
            args.push(err);
            await errorHandler(...args);
        }
    }
}

module.exports = ClientSettingsAssistant;