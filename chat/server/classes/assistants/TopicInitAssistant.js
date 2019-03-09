const iCrypto =require("../libs/iCrypto.js");
const Response = require("../objects/ClientResponse.js");
const Request = require("../objects/ClientRequest.js");
const ClientError = require("../objects/ClientError.js");
const Utility = require("../libs/ChatUtility.js");
const Err = require("../libs/IError.js");


class TopicInitAssistant{

    constructor(connectionManager = Err.required(),
                requestEmitter = Err.required(),
                historyManager = Err.required(),
                topicAuthorityManager = Err.required(),
                torConnector = Err.required()){

        this.connector = torConnector;
        this.newTopicPending = {};
        this.connectionManager = connectionManager;
        this.hm = historyManager;
        this.topicAuthorityManager = topicAuthorityManager;

        this.setHandlers();
        this.setEventsHandled();
        this.setClientErrorTypes();
        this.subscribe(requestEmitter);

    }


    /*********************************************
     * Handlers
     *********************************************/

    /**
     * This is the first step to initialize a new topic
     * Client requests to generate 1-time-key to pass along new topic data
     * this function generates the token, saves it RAM
     * for future processing and responses with new token
     * @param request
     * @param socket
     * @param self
     */
    createToken(request, connectionId, self){
        //Create token
        console.log("TopicInit: create token called");
        request = Request.parse(request);

        //Error check
        if(!request.hasAttribute("topicID")){
            throw "Topic id is required";
        } else if(!request.hasAttribute("ownerPublicKey")){
            throw "Owner public key is required";
        }

        //Creating token
        let ic = new iCrypto();
        ic.asym.createKeyPair("rsa-key", 1024);

        //Saving pending request
        let pendingTopic = {
            topicID: request.body.topicID,
            ownerPublicKey: request.body.ownerPublicKey,
            token: ic.get("rsa-key")
        };

        self.setNewTopicPending(pendingTopic);

        let response = new Response("init_topic_get_token_success", request);
        response.setAttribute("token",  ic.get("rsa-key").publicKey);
        self.connectionManager.sendResponse(connectionId, response);
    }

    /**
     * Client request to initialize the topic
     * Client must have send all the required information to initalize first metadata,
     * in particular: nickname, topic name, client public key, topic private key.
     *
     * This routine must create 2 Hidden services - 1 for the client,
     * another for the topic authority.
     *
     * Private keys for both services must be encrypted with CLIENT PUBLIC KEY!
     * Topic private key must also be encrypted with client public key
     *
     * all 3 encrypted private keys must be stored on disk
     *
     * then first metadata must be appended to the newly created history file
     * and topic authority initialized
     *
     * @param request
     * @param connectionId
     * @param self
     */
    async initTopic(request, connectionId, self){

        self.initTopicVerifyRequest(request);

        const newTopicPending = self.getNewTopicPendingData(request.body.topicID);
        const newTopicRequest = request.body.newTopicData;
        const newTopicData = JSON.parse(Utility.decryptStandardMessage(newTopicRequest, newTopicPending.token.privateKey));

        const topicKeyPair = newTopicData.topicKeyPair;
        const ownerPublicKey = newTopicData.ownerPublicKey;

        const torResponse = await self.preapreNewHiddenService(self);

        const clientResidence = torResponse.serviceID.substring(0, 16) + ".onion";
        const clientHsPrivateKey = torResponse.privateKey;
        const clientHsPrivateKeyCip = Utility.encryptStandardMessage(clientHsPrivateKey, request.body.ownerPublicKey);

        //Create topic directory
        await self.hm.initTopic(request.headers.pkfpSource,
            request.body.ownerPublicKey,
            clientHsPrivateKeyCip
        );

        //Initializing and saving new topic authority
        const taPkfp = await self.topicAuthorityManager.createTopicAuthority(
            request.headers.pkfpSource,
            ownerPublicKey,
            clientResidence,
            topicKeyPair.privateKey);

        const metadata = self.topicAuthorityManager.getTopicAuthority(taPkfp).getCurrentMetadata();
        metadata.body.settings = request.body.settings;
        //Persist first metadata to history
        await self.hm.initHistory(request.headers.pkfpSource, metadata.toBlob());

        //Deleting new pending topic token
        delete self.newTopicPending[request.body.topicID];

        //return success
        let response = new Response("init_topic_success", request);
        self.connectionManager.sendResponse(connectionId, response);
    }
    /*********************************************
     * ~ END Handlers ~
     *********************************************/



    /*********************************************
     * Helper functions
     *********************************************/



    getErrorType(command){
        if(!this.clientErrorTypes[command]){
            throw "Error tpye not found!";
        }
        return this.clientErrorTypes[command]
    }


    setHandlers(){
        this.handlers = {
            new_topic_get_token: this.createToken,
            init_topic: this.initTopic
        }
    }


    setEventsHandled(){
        this.eventsHandled = [
            "new_topic_get_token",
            "init_topic"
        ]
    }

    setClientErrorTypes(){
        this.clientErrorTypes = {};
        this.eventsHandled.forEach((val)=>{
            this.clientErrorTypes[val] ="init_topic_error";
        })
    }

    subscribe(requestEmitter){
        let self = this;
        self.eventsHandled.forEach((val)=>{
            requestEmitter.on(val, async (request, connectionId)=>{
                await self.handleRequest(request, connectionId, self);
            })
        });
    }

    async handleRequest(request, connectionId, self){
        try{

            await this.handlers[request.headers.command](request, connectionId, self)
        }catch(err){
            //handle error
            try{
                console.trace("Request handle error. Command: " + request.headers.command + "\n" + err);
                let error = new ClientError(request, this.getErrorType(request.headers.command) , "Internal server error");
                this.connectionManager.sendResponse(connectionId, error);
            }catch(fatalError){
                console.trace("Some big shit happened: " + fatalError + "\nOriginal error: " + err);
            }
        }
    }

    initTopicVerifyRequest(request){
        if(!this.newTopicPending[request.body.topicID]){
            throw "Pending topic data not found";
        }

        if(!request.body.newTopicData){
            throw "Missing new topic data";
        }
    }

    getNewTopicPendingData(topicId){
        return this.newTopicPending[topicId]
    }

    async preapreNewHiddenService(self){
        return self.connector.createHiddenService()
    }

    setNewTopicPending(data){
        this.newTopicPending[data.topicID] = data;
    }
    /*********************************************
     * ~ End helper Functions
     *********************************************/
}


module.exports = TopicInitAssistant;