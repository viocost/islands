const Request = require("../objects/ClientRequest.js");
const Message = require("../objects/Message.js");
const Err = require("../libs/IError.js");
const Metadata = require("../objects/Metadata.js");
const iCrypto = require("../libs/iCrypto.js");
const ClientError = require("../objects/ClientError.js");
const Util = require("../libs/ChatUtility.js");
const Logger = require("../libs/Logger.js");
const Events = require("../../../common/Events").Events;
const Internal = require("../../../common/Events").Internal;
const { createClientIslandEnvelope } = require("../../../common/Message")


// number of messages loaded initially by default
const DEFAULT_LOADED_MSGS_QTY = 30



class LoginAssistant{
    constructor(requestEmitter = Err.required(),
                historyManager = Err.required(),
                taManager = Err.required(),
                connector = Err.required(),
                clientSessionManager = Err.required(),
                vaultManager = Err.required()){

        this.pendingLogins = {};
        this.hm = historyManager;
        this.vaultManager = vaultManager;
        this.connector = connector;
        this.sessionManager = clientSessionManager;
        this.setHandlers();
        this.setClientErrorTypes();
        this.subscribe(requestEmitter);
        this.topicAuthorityManager = taManager;
    }


    /*********************************************
     * Handlers
     *********************************************/
    /**
     *
     * @param request
     * @param connectionId
     * @param self
     * @returns {Promise<void>}
     */


    async postLogin(request, connectionId, self){
        console.log(`POST LOGIN CALLED: ${JSON.stringify(request)} ${connectionId}`);
        Logger.debug(`Processing post login request. Topics: ${JSON.stringify(request.body.topics)}, conn id: ${connectionId}`, {cat: "login"})

        // Verify request
        // Post login should be sent on behalf of vault
        //let verified = Request.verify(request, self.vaultManager.getVaultPublicKey(request.headers.pkfpSource));
        //Logger.debug(`Verified: ${verified}`, {cat: "login"});

        // Gather encrypted HS private keys and topic authorities

        let session = self.sessionManager.getSessionByConnectionId(connectionId);
        if (!session) throw new Error(`Session has not been initialized for connection ${connectionId}`)

        let topicsData = {};
        if(request.body.topics){
            for (let pkfp of request.body.topics){

                Logger.debug(`Getting services data for ${pkfp}`, {cat: "login"});
                let metadata = JSON.parse(await self.hm.getLastMetadata(pkfp));
                if(!metadata){
                    Logger.error(`Metadata not found for ${pkfp}`)
                    continue;
                }

                topicsData[pkfp] = await self.getDataForDecryption(pkfp, metadata);
                topicsData[pkfp].metadata = metadata;
            }
        } else {
            Logger.warning("NO TOPIC IDs PRESENT IN POST LOGIN", {cat: "login"})
            return;
        }

        Logger.debug(`got data for ${Object.keys(topicsData)}`, {cat: "login"})

        // Send to client for decryption
        let response = createClientIslandEnvelope({
            pkfpSource: "island",
            command: Internal.POST_LOGIN_DECRYPT,
            pkfpDest: request.headers.pkfpSource,
            body: {
                services: topicsData,
            }
        })

        session.send(response, connectionId)
    }

    async checkServices(request, connectionId, self){

        Logger.debug(`Received check services request. Checking...`, {cat: "login"})

        //verify request

        let services = request.body.services;

        for(let pkfp of Object.keys(services)){
            let metadata = JSON.parse(await self.hm.getLastMetadata(pkfp));
            Logger.debug(`Checking topic authority`, {cat: "login"})
            if (self.isTopicOwner(pkfp, metadata) && await self.taLaunchRequired(metadata.body.topicAuthority.pkfp)){
                Logger.debug(`Topic autority launch required. Launching`, {cat: "login"})
                const taPkfp = metadata.body.topicAuthority.pkfp;
                const taPrivateKey = services[pkfp].topicAuthority.taPrivateKey;
                const taHSPrivateKey = services[pkfp].topicAuthority.taHSPrivateKey;
                await self.topicAuthorityManager.launchTopicAuthority(taPrivateKey, taHSPrivateKey, taPkfp);
            }

            const residence = metadata.body.participants[pkfp].residence;
            console.log("Checking client hidden service: " + residence, {cat: "login"});
            if (!await self.connector.isHSUp(residence)){
                Logger.debug(`Hidden service ${residence} launch required.`, {cat: "login"})
                const clientHSKey = services[pkfp].clientHSPrivateKey ;
                await self.launchClientHS(clientHSKey);
            }

        }
        let response = Message.makeResponse(request, "island", Events.POST_LOGIN_SUCCESS)
        let session = self.sessionManager.getSessionByConnectionId(connectionId);
        session.send(response, connectionId);
    }

    async getDataForDecryption(clientPkfp, metadata, sessionID){
        let taData, hsKey;
        Logger.debug("Getting data for decryption", {cat: "login"})
        //const pendingLogin = this.getPendingLogin(sessionID);

        if (this.isTopicOwner(clientPkfp, metadata) && await this.taLaunchRequired(metadata.body.topicAuthority.pkfp)){
            console.log("TA launch required");
            const taPkfp = metadata.body.topicAuthority.pkfp;

            taData = {
                taPrivateKey: await this.topicAuthorityManager.getTopicAuthorityPrivateKey(taPkfp),
                taHSPrivateKey: await this.topicAuthorityManager.getTopicAuthorityHSPrivateKey(taPkfp)
            };

        }

        const clientResidence = metadata.body.participants[clientPkfp].residence;
        console.log("Checking client hidden service: " + clientResidence);
        if (!await this.connector.isHSUp(clientResidence)){
            hsKey = await this.hm.getClientHSPrivateKey(clientPkfp);
        }

        return {
                topicAuthority: taData,
                clientHSPrivateKey: hsKey,
        }

    }


    /*********************************************
     * ~ END Handlers ~
     *********************************************/

    /*********************************************
     * Helper functions
     *********************************************/

    async getSettings(pkfp){
        return this.hm.getClientSettings(pkfp);
    }

    async initSession(request, connectionId, self){
        self.sessionManager.createSession(request.headers.pkfpSource, connectionId, request.body.sessionID);
    }

    async getLastMessages(pkfp){
        return await this.hm.getMessagesAndKeys(DEFAULT_LOADED_MSGS_QTY, pkfp)
    }

    isTopicOwner(clientPkfp, metadata){
        return metadata.body.owner === clientPkfp;
    }


    async taLaunchRequired(taPkfp) {
        return  !(this.topicAuthorityManager.isTopicAuthorityLaunched(taPkfp) &&
            await this.topicAuthorityManager.isTaHiddenServiceOnline(taPkfp));
    }

    /**
     * Assumes that topic authority is local
     * @param pkfp
     * @param self
     * @returns {Promise<{taPrivateKey: *, topicHSPrivateKey: *}>}
     */
    async getTopicAuthorityData(pkfp, self){
        let taPrivateKey = await self.hm.getTopicKey(pkfp, "taPrivateKey")
        let topicHSPrivateKey = await self.hm.getTopicKey(pkfp, "taHSPrivateKey")
        return {
            taPrivateKey: taPrivateKey,
            taHSPrivateKey: topicHSPrivateKey
        }
    }


    generateDecryptionToken(){
        const ic = new iCrypto();
        ic.asym.createKeyPair("kp", 1024);
        return ic.get("kp");
    }


    deletePendingLogin(sessionID){
        if (!this.pendingLogins.hasOwnProperty(sessionID)){
            throw new Error("Pending login not found");
        }

        delete this.pendingLogins[sessionID];
    }

    async verifyLoginRequest(request){
        const clientPublicKey = await this.hm.getOwnerPublicKey(request.headers.pkfpSource);
        Request.isRequestValid(request, clientPublicKey);
    }

    async launchClientHS(privateKey = Err.required()){
        await this.connector.createHiddenService(privateKey);
    }

    async setPendingLogin(request){
        const clientPublicKey = this.hm.getOwnerPublicKey(request.headers.pkfpSource);
        const metadata = Metadata.parseMetadata(await this.hm.getLastMetadata(request.headers.pkfpSource));
        const pendingLogin = {
            publicKey: clientPublicKey,
            metadata: metadata,
            request: request
        };

        this.pendingLogins[request.body.sessionID] = pendingLogin;
    }

    getPendingLogin(sessionID){
        if (!this.pendingLogins.hasOwnProperty(sessionID)){
            throw new Error("Pending login not found");
        }

        return this.pendingLogins[sessionID];
    }

    setClientErrorTypes(){
        this.clientErrorTypes = {};
        Object.keys(this.handlers).forEach((val)=>{
            this.clientErrorTypes[val] = Events.LOGIN_ERROR;
        })
    }

    getErrorType(command){
        if(!this.clientErrorTypes[command]){
            throw new Error("Error tpye not found!");
        }
        return this.clientErrorTypes[command]
    }

    subscribe(requestEmitter){
        let self = this;
        Object.keys(self.handlers).forEach((val)=>{
            requestEmitter.on(val, async (request, connectionId)=>{
                await self.handleRequest(request, connectionId, self);
            })
        });
    }

    setHandlers(){
        this.handlers = {}
        this.handlers[Internal.POST_LOGIN] = this.postLogin;
        this.handlers[Internal.POST_LOGIN_CHECK_SERVICES] = this.checkServices;
    }

    async handleRequest(request, connectionId, self){
        try{
            console.log(`Processing login topic request: ${request.headers.command}`);
            await this.handlers[request.headers.command](request, connectionId, self)
        }catch(err){
            //handle error
            Logger.warn("Topic login error", {
                error: err.message,
                cat: "login",
                pkfp: request.pkfp,
                connectionId: connectionId,
                stack: err.stack
            });

            try{
                let error = new ClientError(request, this.getErrorType(request.headers.command) , err.message)
                let session = self.sessionManager.getSessionByConnectionId(connectionId)
                session.send(error, connectionId)

            }catch(fatalError){
                Logger.error("Topic login assistant FATAL ERROR", {
                    connectionId: connectionId,
                    request: JSON.stringify(request),
                    cat: "login",
                    error: fatalError.message,
                    context: fatalError.stack,
                    originalError: err.message
                })

            }


        }
    }


    /*********************************************
     * ~ End helper Functions
     *********************************************/

}

module.exports = LoginAssistant;
