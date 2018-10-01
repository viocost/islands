class ChatClient {

    constructor(opts){
        this.islandConnectionStatus = false;
        this.allMessagesLoaded = false;
        this.chatSocket = null;
        this.fileSocket = null;
        this.session = null; //can be "active", "off"
        this.newTopicPending = {};
        this.pendingTopicJoins = {};
        this.outgoingMessageQueue = {};
        this.attachmentsUploadQueue = {};
        this.setClientHandlers();
        WildEmitter.mixin(this);
    }

    /*************************************************************
     * =====  Request Response and Notidication processing ======*
     *************************************************************/
    setClientHandlers(){
        this.responseHandlers = {
            init_topic_get_token_success: this.initTopicContinueAfterTokenReceived,
            init_topic_success: this.initTopicSuccess,
            login_decryption_required: this.loginDecryptData,
            join_topic_success: this.notifyJoinSuccess,
            login_success: this.finalizeLogin,
            update_settings_success: this.onSuccessfullSettingsUpdate,
            load_more_messages_success: this.loadMoreMessagesSuccess,
            request_invite_success: this.processInviteCreated,
            request_invite_error: this.requestInviteError,
            sync_invites_success: this.syncInvitesSuccess,
            save_invite_success: this.saveInviteSuccess,
            update_invite_success: this.updateInviteSuccess,
            send_success: this.messageSendSuccess,
            del_invite_success: this.delInviteSuccess,
            boot_participant_failed: this.bootParticipantFailed,
            send_fail: this.messageSendFail,
            default: this.processInvalidResponse
        };

        this.serviceMessageHandlers = {
            metadata_issue: this.processMetadataUpdate,
            meta_sync: this.processMetadataUpdate,
            u_booted: this.uWereBooted,
            whats_your_name: this.processNicknameRequest,
            my_name_response: this.processNicknameResponse,
            nickname_change_broadcast: this.processNicknameChangeNote,
            default: this.processUnknownNote

        };



        this.messageHandlers = {
            shout_message: this.processIncomingMessage,
            whisper_message: this.processIncomingMessage
        };


        this.requestHandlers = {
            new_member_joined: this.processNewMemberJoined
        };

        this.requestErrorHandlers = {
            login_error: this.loginFail,
            init_topic_error: this.initTopicFail,
            request_invite_error: this.requestInviteError,
            sync_invites_error: this.syncInvitesError,
            default: this.unknownError
        }
    }


    processServiceMessage(message){
        (this.serviceMessageHandlers.hasOwnProperty(message.headers.command)) ?
            this.serviceMessageHandlers[message.headers.command](message, this) :
            this.serviceMessageHandlers.default(message, this)
    }

    processServiceRecord(record, self){
        //TODO decrypt body
        console.log("New service record arrived!");
        record.body = ChatUtility.decryptStandardMessage(record.body, self.session.privateKey);
        self.emit("service_record", record)
    }






    processResponse(response){
        response = new Message(response);
        if (response.headers.error){
            this.requestErrorHandlers.hasOwnProperty(response.headers.response) ?
                this.requestErrorHandlers[response.headers.response](response, this) :
                this.requestErrorHandlers.default(response, this);
            return;
        }

        this.responseHandlers.hasOwnProperty(response.headers.response) ?
            this.responseHandlers[response.headers.response](response, this) :
            this.responseHandlers.default(response, this);
    }

    processRequest(request){
       (this.requestHandlers.hasOwnProperty(request.headers.command)) ?
           this.requestHandlers[request.headers.command](request, this) :
           this.requestErrorHandlers.default(request, this)
    }


    /**
     * Processes unknown note
     * @param note
     * @param self
     */
    processUnknownNote(note, self){
        console.log("UNKNOWN NOTE RECEIVED!\n" + JSON.stringify(note));
        self.emit("unknown_note", note);
    }


    /**************************************************
     * ======  TOPIC LOGIN AND REGISTRATION ==========*
     **************************************************/
    /**
     * Called initially on topic creation
     * @param {String} nickname
     * @returns {Promise<any>}
     */
    initTopic(nickname, topicName){
        return new Promise(async (resolve, reject)=>{
            try{
                let self = this;
                nickname = String(nickname).trim();
                if (!nickname || nickname.length < 3){
                    reject("Nickname entered is invalid");
                    return;
                }

                //CREATE NEW TOPIC PENDING
                let ic = new iCrypto();
                //Generate keypairs one for user, other for topic
                ic = await ic.asym.asyncCreateKeyPair('owner-keys');
                ic = await ic.asym.asyncCreateKeyPair('topic-keys');
                ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                let newTopic = {
                    ownerKeyPair: ic.get("owner-keys"),
                    topicKeyPair: ic.get("topic-keys"),
                    ownerPkfp: ic.get("owner-pkfp"),
                    topicID: ic.get("topic-pkfp"),
                    ownerNickName: nickname,
                    topicName: topicName
                };

                //Request island to init topic creation and get one-time key.
                let request = new Message();
                request.headers.command = "new_topic_get_token";
                let body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                };
                request.set("body", body);
                self.newTopicPending[newTopic.topicID] = newTopic;
                await this.establishIslandConnection();
                this.chatSocket.emit("request", request);
                resolve();
            }catch(err){
                throw err;
            }
        })
    }

    /**
     * New token on init topic received. Proceeding with topic creation
     * @param response
     * @param self
     */
    initTopicContinueAfterTokenReceived(response, self){

        console.log("Token received, continuing creating topic");

        let pendingTopic = self.newTopicPending[response.body.topicID];
        let token = response.body.token; // Token is 1-time disposable public key generated by server

        //Forming request
        let newTopicData = {
            topicKeyPair: pendingTopic.topicKeyPair,
            ownerPublicKey: pendingTopic.ownerKeyPair.publicKey,
        };

        let newTopicDataCipher = ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token);

        //initializing topic settings
        let settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName,
            pendingTopic.topicName,
            pendingTopic.ownerKeyPair.publicKey);



        //Preparing request
        let request = new Message();
        request.headers.command = "init_topic";
        request.headers.pkfpSource = pendingTopic.ownerPkfp;
        request.body.topicID = pendingTopic.topicID;
        request.body.settings = settings;
        request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicDataCipher;

        //Sending request
        self.chatSocket.emit("request", request);
    }


    prepareNewTopicSettings(nickname, topicName, publicKey, encrypt = true){
        //Creating and encrypting topic settings:
        let settings = {
            membersData: {},
            soundsOn: true
        };
        if(nickname){
            let ic = new iCrypto;
            ic.asym.setKey("pubk", publicKey, "public")
                .getPublicKeyFingerprint("pubk", "pkfp");
            settings.nickname = nickname;
            settings.membersData[ic.get("pkfp")] = {nickname: nickname};
        }

        if(topicName){
            settings.topicName = topicName;
        }
        if (encrypt){
            return ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey)
        }else {return settings}

    }


    initTopicSuccess(request, self){
        let data = self.newTopicPending[request.body.topicID];
        let pkfp = data.pkfp;
        let privateKey = data.privateKey;
        let nickname = data.nickname;
        self.emit("init_topic_success", {
            pkfp: data.ownerPkfp,
            nickname: data.ownerNickName,
            privateKey: data.ownerKeyPair.privateKey
        });
        delete self.newTopicPending[request.body.topicID];
    }

    async topicLogin(privateKey){
        let success = true;
        let error;

        privateKey = String(privateKey).trim();


        if(this.session && this.session.status === "active" && this.islandConnectionStatus){
            this.emit("login_success");
            return;
        }
        try{
            await this.establishIslandConnection();
            let ic = new iCrypto();
            ic.setRSAKey('pk', privateKey, "private")
                .publicFromPrivate('pk', 'pub')
                .getPublicKeyFingerprint('pub', 'pkfp')
                .createNonce('nonce')
                .bytesToHex('nonce', "noncehex");

            this.session = {
                sessionID: ic.get("noncehex"),
                publicKey : ic.get("pub"),
                privateKey : ic.get('pk'),
                publicKeyFingerprint : ic.get("pkfp"),
                status : 'off'
            };

            let body = {
                publicKey: ic.get("pub"),
                sessionID: ic.get("noncehex")
            };

            let request = new Message();
            request.set("body", body);
            request.headers.command = "init_login";
            request.headers.pkfpSource = ic.get("pkfp");
            request.signMessage(ic.get("pk"));
            this.chatSocket.emit("request", request);
        }catch(err){
            success = false;
            error = err.message
        }

        //On error try to disconnect
        if(!success){
            try{
                await  this.terminateIslandConnection();
            }catch(err){
                console.log("ERROR terminating island connection: " + err);
            }finally{
                this.emit("login_fail", error)
            }
        }
    }

    /**
     * Islnad request to decrypt data while logging in
     * data must be in request.body.loginData and it can contain
     *    clientHSPrivateKey,
     *    TAprivateKey
     *    TAHSPrivateKey
     *
     * @param response
     * @param self
     */
    loginDecryptData(request, self){

        let decryptBlob = (privateKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            let symLength = parseInt(blob.substr(-lengthChars))
            let blobLength = blob.length;
            let symk = blob.substring(blobLength- symLength - lengthChars, blobLength-lengthChars );
            let cipher = blob.substring(0, blobLength- symLength - lengthChars);
            icn.addBlob("symcip", symk)
                .addBlob("cipher", cipher)
                .asym.setKey("priv", privateKey, "private")
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .sym.decrypt("cipher", "sym", "blob-raw", true)
            return icn.get("blob-raw")
        };

        let encryptBlob = (publicKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            icn.createSYMKey("sym")
                .asym.setKey("pub", publicKey, "public")
                .addBlob("blob-raw", blob)
                .sym.encrypt("blob-raw", "sym", "blob-cip", true)
                .asym.encrypt("sym", "pub", "symcip", "hex")
                .encodeBlobLength("symcip", 4, "0", "symcipl")
                .merge(["blob-cip", "symcip", "symcipl"], "res")
            return icn.get("res");
        };

        if (!self.session){
            console.log("invalid island request");
            return;
        }

        let clientHSPrivateKey, taPrivateKey, taHSPrivateKey;
        let token = request.body.token;
        let loginData = request.body.dataForDecryption;
        let ic = new iCrypto();
        ic.asym.setKey("priv", self.session.privateKey, "private");

        //Decrypting client Hidden service key
        if (loginData.clientHSPrivateKey){
            clientHSPrivateKey = decryptBlob(self.session.privateKey, loginData.clientHSPrivateKey)
        }

        if (loginData.topicAuthority && loginData.topicAuthority.taPrivateKey){
            taPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taPrivateKey )
        }

        if (loginData.topicAuthority && loginData.topicAuthority.taHSPrivateKey){
            taHSPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taHSPrivateKey)
        }

        let preDecrypted = {};

        if (clientHSPrivateKey){
            preDecrypted.clientHSPrivateKey = encryptBlob(token, clientHSPrivateKey)
        }
        if (taPrivateKey || taHSPrivateKey){
            preDecrypted.topicAuthority = {}
        }
        if (taPrivateKey){
            preDecrypted.topicAuthority.taPrivateKey = encryptBlob(token, taPrivateKey)
        }
        if (taHSPrivateKey){
            preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(token, taHSPrivateKey)
        }

        let decReq = new Message();
        decReq.headers.pkfpSource = self.session.publicKeyFingerprint;
        decReq.body = request.body;
        decReq.body.preDecrypted = preDecrypted;
        decReq.headers.command = "login_decrypted_continue";
        decReq.signMessage(self.session.privateKey);
        console.log("Decryption successfull. Sending data back to Island");

        self.chatSocket.emit("request", decReq);
    }




    finalizeLogin(response, self){
        let metadata = Metadata.parseMetadata(response.body.metadata);
        let sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint,
            self.session.privateKey,
            metadata);
        let messages = self.decryptMessagesOnMessageLoad(response.body.messages);
        let settings = metadata.body.settings ? metadata.body.settings : {};
        self.session.status = "active";
        self.session.metadata = metadata.body;
        self.session.metadata.sharedKey = sharedKey;
        self.session.metadataSignature = metadata.signature;
        self.session.settings = JSON.parse(ChatUtility.decryptStandardMessage(settings, self.session.privateKey));
        self.emit("login_success", messages);
        self.checkNicknames()
    }

    checkNicknames(){
        for (let pkfp of Object.keys(this.session.metadata.participants)){
            if(!this.getMemberNickname(pkfp)){
                this.requestNickname(pkfp);
            }
        }
    }

    getMemberNickname(pkfp){
        if(!this.session || ! pkfp){
            return
        }
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp]){
            return membersData[pkfp].nickname;
        }
    }

    getMemberAlias(pkfp){
        if(!this.session || !pkfp){
            return
        }
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp] && membersData[pkfp].alias){
            return membersData[pkfp].alias;
        } else{
            return pkfp.substring(0, 8)
        }
    }

    deleteMemberAlias(pkfp){
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp]){
            delete membersData[pkfp].alias;
        }
    }

    getMemberRepr(pkfp){
        let membersData = this.session.settings.membersData;
        if(membersData[pkfp]){
            return this.getMemberAlias(pkfp) || this.getMemberNickname(pkfp) || "Anonymous";
        }
    }


    deleteMemberData(pkfp){
        let membersData = this.session.settings.membersData;
        delete membersData[pkfp];
    }

    setMemberNickname(pkfp, nickname, settings){
        if(settings){
            settings.membersData[pkfp] = {
                joined: new Date(),
                nickname: nickname
            };
            return
        }
        if(!pkfp){
            throw "Missing required parameter";
        }
        let membersData = this.session.settings.membersData;
        if (!membersData[pkfp]){
            this.addNewMemberToSettings(pkfp)
        }

        membersData[pkfp].nickname = nickname;
    }

    setMemberAlias(pkfp, alias){
        if(!pkfp){
            throw "Missing required parameter";
        }
        if(!this.session){
            return
        }
        let membersData = this.session.settings.membersData;
        if (!membersData[pkfp]){
            membersData[pkfp] = {}
        }
        if(!alias){
            delete membersData[pkfp].alias
        }else{
            membersData[pkfp].alias = alias;
        }

    }

    requestNickname(pkfp){
        if(!pkfp){
            throw "Missing required parameter"
        }
        let request = new Message();
        request.setCommand("whats_your_name");
        request.setSource(this.session.publicKeyFingerprint);
        request.setDest(pkfp);
        request.addNonce();
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    broadcastNameChange(){
        let self = this;
        let message = new Message();
        message.setCommand("nickname_change_broadcast");
        message.setSource(this.session.publicKeyFingerprint);
        message.addNonce();
        message.body.nickname = ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
        message.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", message);
    }

    processNicknameResponse(request, self){
        self._processNicknameResponseHelper(request, self)
    }

    processNicknameChangeNote(request, self){
        self._processNicknameResponseHelper(request, self, true)
    }

    _processNicknameResponseHelper(request, self, broadcast = false){
        console.log("Got nickname response");
        let publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, request)){
            console.trace("Invalid signature");
            return
        }
        let existingNickname = self.getMemberNickname(request.headers.pkfpSource);
        let memberRepr = self.getMemberRepr(request.headers.pkfpSource);
        let newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) :
            ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);
        if( newNickname !== existingNickname){
            self.setMemberNickname(request.headers.pkfpSource, newNickname);
            self.saveClientSettings();
            if(existingNickname && existingNickname !== ""){
                self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
            }
        }
    }

    createServiceRecordOnMemberNicknameChange(existingName, newNickname, pkfp){
        existingName = existingName || "";
        let msg = "Member " + existingName + " (id: "  +  pkfp + ") changed nickname to: " + newNickname;
        this. createRegisterServiceRecord("member_nickname_change", msg);
    }

    createRegisterServiceRecord(event, message){
        let request = new Message();
        request.addNonce();
        request.setSource(this.session.publicKeyFingerprint);
        request.setCommand("register_service_record");
        request.body.event = event;
        request.body.message = ChatUtility.encryptStandardMessage(message,
            this.session.publicKey);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    processNicknameRequest(request, self){
        let parsedRequest = new Message(request);
        let publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, parsedRequest)){
            console.trace("Invalid signature");
            return
        }
        let response = new Message();
        response.setCommand("my_name_response");
        response.setSource(self.session.publicKeyFingerprint);
        response.setDest(request.headers.pkfpSource);
        response.addNonce();
        response.body.nickname = ChatUtility.encryptStandardMessage(self.session.settings.nickname, publicKey);
        response.signMessage(self.session.privateKey);
        self.chatSocket.emit("request", response);
    }

    addNewMemberToSettings(pkfp){
        this.session.settings.membersData[pkfp] = {
            joined: new Date()
        };
    }


    async attemptReconnection(){
        await this.topicLogin(this.session.privateKey);
    }

    loadMoreMessages(lastLoadedMessageID){
        if(this.allMessagesLoaded) return;
        let request = new Message();
        request.headers.command = "load_more_messages";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.body.lastLoadedMessageID = lastLoadedMessageID;
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    loadMoreMessagesSuccess(response, self){
        let messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages);
        self.allMessagesLoaded = response.body.lastMessages.allLoaded ||  self.allMessagesLoaded;
        self.emit("messages_loaded", messages)
    }

    decryptMessagesOnMessageLoad(data){
        let keys = data.keys;
        let metaIDs = Object.keys(keys);
        for (let i=0;i<metaIDs.length; ++i){
            let ic = new iCrypto;
            ic.addBlob('k', keys[metaIDs[i]])
                .hexToBytes("k", "kraw")
                .setRSAKey("priv", this.session.privateKey, "private")
                .privateKeyDecrypt("kraw", "priv", "kdec");
            keys[metaIDs[i]] = ic.get("kdec");
        }

        let messages = data.messages;
        let result = [];
        for (let i=0; i<messages.length; ++i){
            let message = new ChatMessage(messages[i]);
            if(message.header.service){
                message.body = ChatUtility.decryptStandardMessage(message.body, this.session.privateKey)
            } else if(message.header.private){
                message.decryptPrivateMessage(this.session.privateKey);
            } else{
                message.decryptMessage(keys[message.header.metadataID]);
            }
            result.push(message);
        }
        return result;
    }


    logout(){
        this.chatSocket.disconnect();
        this.session = null;
        this.allMessagesLoaded = false;
    }


    haveIRightsToBoot(){
        return parseInt(this.session.metadata.participants[this.session.publicKeyFingerprint].rights) >=3
    }


    bootParticipant(pkfp){
        let self = this;
        if (!self.haveIRightsToBoot()){
            self.emit("boot_participant_fail", "Not enough rights to boot a member")
            return
        }

        let request = new Message();
        request.headers.command = "boot_participant";
        request.headers.pkfpSource = self.session.publicKeyFingerprint;
        request.headers.pkfpDest = self.session.metadata.topicAuthority.pkfp;
        request.body.pkfp = pkfp;
        request.signMessage(self.session.privateKey);
        self.chatSocket.emit("request", request);
    }


    /**
     * TODO implement method
     * Processes notification of a member deletion
     * If this note received - it is assumed, that the member was successfully deleted
     * Need to update current metadata
     * @param note
     * @param self
     */
    noteParticipantBooted(note, self){
        console.log("Note received: A member was booted. Processing");
        let newMeta = Metadata.parseMetadata(note.body.metadata);
        self._updateMetadata(newMeta);
        let bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
        this.deleteMemberData(note.body.bootedPkfp);
        this.saveClientSettings();
        self.emit("participant_booted", "Participant " + bootedNickname + " was booted!")
    }



    bootParticipantFailed(response, self){
        console.log("Boot member failed!");
        self.emit("boot_participant_fail", response.error);
    }

    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */
    async initTopicJoin(nickname, inviteCode) {
        console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);

        const clientSettings = new ClientSettings();
        clientSettings

        await this.establishIslandConnection();
        let ic = new iCrypto();
        ic.asym.createKeyPair("rsa")
            .getPublicKeyFingerprint('rsa', 'pkfp')
            .addBlob("invite64", inviteCode.trim())
            .base64Decode("invite64", "invite");

        let invite = ic.get("invite").split("/");
        let inviterResidence = invite[0];
        let inviterID = invite[1];
        let inviteID = invite[2];

        if (!this.inviteRequestValid(inviterResidence, inviterID, inviteID)){
            this.emit("join_topic_fail");
            throw "Invite request is invalid";
        }

        this.pendingTopicJoins[inviteID] = {
            publicKey: ic.get('rsa').publicKey,
            privateKey: ic.get('rsa').privateKey,
            nickname: nickname,
            inviterID: inviterID,
            inviterResidence: inviterResidence
        };

        let headers = {
            command: "join_topic",
            pkfpDest: inviterID,
            pkfpSource: ic.get('pkfp'),

        };
        let body = {
            inviteString: inviteCode.trim(),
            inviteCode: inviteID,
            destination: inviterResidence,
            invitee:{
                publicKey: ic.get('rsa').publicKey,
                nickname: nickname,
                pkfp: ic.get('pkfp')
            }
        };
        let request = new Message();
        request.set('headers', headers);
        request.set("body", body);
        request.signMessage(ic.get('rsa').privateKey);
        this.chatSocket.emit("request", request);
        let topicData = {
            newPublicKey: ic.get('rsa').publicKey,
            newPrivateKey: ic.get('rsa').privateKey,

        };
        return topicData
    }


    initSettingsOnTopicJoin(topicInfo, request){
        let privateKey = topicInfo.privateKey;
        let publicKey = topicInfo.publicKey;
        let ic = new iCrypto();
        ic.asym.setKey("pub", publicKey, "public")
            .getPublicKeyFingerprint("pub", "pkfp");
        let pkfp = ic.get("pkfp");
        let topicName = ChatUtility.decryptStandardMessage(request.body.topicName, privateKey);
        let inviterNickname = ChatUtility.decryptStandardMessage(request.body.inviterNickname, privateKey);
        let inviterPkfp = request.body.inviterPkfp;
        let settings = this.prepareNewTopicSettings(topicInfo.nickname, topicName, topicInfo.publicKey, false);

        this.setMemberNickname(inviterPkfp, inviterNickname, settings);
        this.saveClientSettings(settings, privateKey)
    }

    onSuccessfullSettingsUpdate(response, self){
        console.log("Settings successfully updated!");
        self.emit("settings_updated");
    }

    notifyJoinSuccess(request, self){
        console.log("Join successfull received!");
        let topicInfo = self.pendingTopicJoins[request.body.inviteCode];
        self.initSettingsOnTopicJoin(topicInfo, request);
        self.emit("topic_join_success", {
            nickname: topicInfo.nickname,
            privateKey: topicInfo.privateKey
        })
    }

    saveClientSettings(settingsRaw, privateKey){
        if(!settingsRaw){
            settingsRaw = this.session.settings;
        }
        if(!privateKey){
            privateKey = this.session.privateKey;
        }
        let ic = new iCrypto();
        ic.asym.setKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pub")
            .getPublicKeyFingerprint("pub", "pkfp");
        let publicKey = ic.get("pub");
        let pkfp = ic.get("pkfp")

        if(typeof settingsRaw === "object"){
            settingsRaw = JSON.stringify(settingsRaw);
        }
        let settingsEnc = ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
        let headers = {
            command: "update_settings",
            pkfpSource: pkfp
        };
        let body = {
            settings: settingsEnc
        };

        let request = new Message();
        request.set("headers", headers);
        request.set("body", body);
        request.signMessage(privateKey);
        console.log("Snding update settings request");
        this.chatSocket.emit("request", request);
    }

    /**
     * TODO implement method
     * Notifies a booted member
     * If received - it is assumed that this client was successfully booted
     * from the topic.
     * Need to conceal the topic
     * @param note
     * @param self
     */
    uWereBooted(note, self){
        console.log("Looks like I am being booted. Checking..");

        if(!Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, note)){
            console.log("Probably it was a mistake");
            return;
        }

        self.session.metadata.status = "sealed";
        console.log("You have been booted");
        self.emit("u_booted", "You have been excluded from this channel.");

    }


    updateMetaOnNewMemberJoin(message, self){
        self.session.metadata = JSON.parse(message.body.metadata);
        self.emit("new_member_joined")
    }

    loginFail(response, self){
        console.log("Emiting login fail... " + response.headers.error);
        self.emit("login_fail", response.headers.error);
    }

    initTopicFail(response, self){
        console.log("Init topic fail: " + response.headers.error);
        self.emit("init_topic_error", response.headers.error);
    }

    unknownError(response, self){
        console.log("Unknown request error: " + response.headers.response);
        self.emit("unknown_error", response.headers.error);
    }

    processInvalidResponse(response, self){
        console.log("Received invalid server response");
        self.emit("invalid_response", response);
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== PARTICIPANTS HANDLING   ============*
     **************************************************/

    addNewParticipant(nickname, publicKey, residence, rights){
        let ic = new iCrypto();
        ic.setRSAKey("pk", publicKey, "public")
            .getPublicKeyFingerprint("pk", "fp");

        let participant = new Participant();
        participant.set('nickname', nickname);
        participant.set('publicKey', ic.get("pk"));
        participant.set('publicKeyFingerprint', ic.get("fp"));
        participant.set('residence', residence);
        participant.set('rights', rights);
        this.session.metadata.addParticipant(participant);
        this.broadcastMetadataUpdate();
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ FILE HANDLING  ================*
     **************************************************/

    /**
     * Takes list of files and uploads them
     * to the Island asynchronously.
     *
     * Resolves with list of fileInfo JSON objects.
     * @param filesAttached list of files each type of File
     * @return Promise
     */
    uploadAttachments(filesAttached, messageID, metaID){
        return new Promise(async (resolve, reject)=>{
            const self = this;

            if (Worker === undefined){
                reject(null, "Client does not support web workers.")
                return;
            }

            const filesProcessed = [];

            const pkfp = self.session.publicKeyFingerprint;
            const privk = self.session.privateKey;
            const symk = self.session.metadata.sharedKey;
            const residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;

            for (let file of filesAttached){
                console.log("Calling worker function");
                filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence))
            }

            try{
                const filesInfo = await Promise.all(filesProcessed);
                resolve(filesInfo);
            }catch (err) {
                console.log("ERROR DURING UPLOAD ATTACHMENTS: " + err);
                reject(err)
            }


        })
    }

    /**
     * Uploads a single attachment to the island
     * Calculates hash of unencrypted and encrypted file
     * signs both hashes
     * resolves with fileInfo object
     * @returns {Promise<any>}
     */
    uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence){
        return new Promise((resolve, reject)=>{
            console.log("!!!Initializing worker...");
            let uploader = new Worker("/js/uploaderWorker.js");

            let uploadComplete = (msg)=>{
                let fileInfo = new AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
                uploader.terminate();
                resolve(fileInfo);
            };

            let uploadProgress = (msg) =>{
                //TODO implement event handling

            };

            let uploadError = (msg)=>{
                uploader.terminate();
                self.emit("upload_error", msg.data);
                reject(data)
            };

            let messageHandlers = {
                "upload_complete": uploadComplete,
                "upload_progress": uploadProgress,
                "upload_error": uploadError
            };

            uploader.onmessage = (ev)=>{
                let msg = ev.data;
                messageHandlers[msg.result](msg.data);
            };

            uploader.postMessage({
                command: "upload",
                attachment: file,
                pkfp: pkfp,
                privk: privk,
                symk: symk
            });
        })
    }



    /**
     * Downloads requested attachment
     *
     * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
     *          Must contain all required info including hashes, signatures, and link
     */
    downloadAttachment(fileInfo){
        return new Promise(async (resolve, reject)=>{
            let self = this;
            let privk = self.session.privateKey; //To decrypt SYM key

            //Getting public key of
            let parsedFileInfo = JSON.parse(fileInfo);

            let fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

            if(Worker === undefined){
                const err = "Worker is not defined.Cannot download file."
                console.log(err);
                reject(err);
            }
            const myPkfp = self.session.publicKeyFingerprint;
            let fileData = await self.downloadAttachmentWithWorker(fileInfo, myPkfp, privk, fileOwnerPublicKey);
            self.emit("download_complete", {fileInfo: fileInfo, fileData: fileData});
        })

    }

    downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk){
        return new Promise(async (resolve, reject)=>{
            const downloader = new Worker("/js/downloaderWorker.js");
            const downloadComplete = (fileBuffer)=>{
                resolve(fileBuffer);
                downloader.terminate();
            };


            const messageHandlers = {
                "download_complete": downloadComplete
            };

            const processMessage = (msg)=>{
                messageHandlers[msg.result](msg.data)
            };

            downloader.onmessage = (ev)=>{
                processMessage(ev.data)
            };

            downloader.postMessage({
                command: "download",
                data: {
                    fileInfo: fileInfo,
                    myPkfp: myPkfp,
                    privk: privk,
                    pubk: ownerPubk
                }
            })
        })
    }


    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ MESSAGE HANDLING  ============*
     **************************************************/

    prepareMessage(messageContent, recipientPkfp) {
        return new Promise((resolve, reject) => {
            let self = this;
            console.log("Preparing message: " + messageContent);
            if (!self.isLoggedIn()) {
                self.emit("login_required");
                reject();
            }
            //Preparing chat message
            let chatMessage = new ChatMessage();
            chatMessage.header.metadataID = this.session.metadata.id;
            chatMessage.header.author = this.session.publicKeyFingerprint;
            chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
            chatMessage.header.private = !!recipientPkfp;
            chatMessage.header.nickname = self.session.settings.nickname;
            chatMessage.body = messageContent;
            resolve(chatMessage);
        })
    }




    /**
     * Sends the message.
     *
     * @param {string} messageContent
     * @param {array} filesAttached Array of attached files. Should be taken straight from input field
     * @returns {Promise<any>}
     */
     shoutMessage(messageContent, filesAttached){
        return new Promise(async (resolve, reject)=>{
            let self = this;

            let attachmentsInfo;

            const metaID = self.session.metadata.id;
            const chatMessage = await self.prepareMessage(messageContent);

            if (filesAttached && filesAttached.length >0){
                attachmentsInfo = await self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);
                for (let att of attachmentsInfo) {
                    chatMessage.addAttachmentInfo(att)
                }
            }

            chatMessage.encryptMessage(this.session.metadata.sharedKey);
            chatMessage.sign(this.session.privateKey);

            //Preparing request
            let message = new Message();
            message.headers.pkfpSource = this.session.publicKeyFingerprint;
            message.headers.command = "broadcast_message";
            message.body.message = chatMessage.toBlob();
            let userPrivateKey = this.session.privateKey;
            message.signMessage(userPrivateKey);
            //console.log("Message ready: " + JSON.stringify(message));
            this.chatSocket.emit("request", message);
            resolve();
        })
    }

    whisperMessage(pkfp, messageContent, filesAttached){
        return new Promise(async (resolve, reject)=>{
            let self = this;

            const chatMessage = await self.prepareMessage(messageContent, pkfp);

            //Will be enabled in the next version

            let keys = [self.session.publicKey];
            keys.push(self.session.metadata.participants[pkfp].publicKey);
            chatMessage.encryptPrivateMessage(keys);
            chatMessage.sign(this.session.privateKey);

            //Preparing request
            let message = new Message();
            message.headers.pkfpSource = this.session.publicKeyFingerprint;
            message.headers.pkfpDest = pkfp;
            message.headers.command = "send_message";
            message.headers.private = true;
            message.body.message = chatMessage.toBlob();
            let userPrivateKey = this.session.privateKey;
            message.signMessage(userPrivateKey);
            this.chatSocket.emit("request", message);
            resolve();
        })
    }

    processIncomingMessage(data, self){
        console.log("Received incoming message! ");
        let message = data.message;
        let symKey = data.key ? ChatUtility.privateKeyDecrypt(data.key, self.session.privateKey) :
            self.session.metadata.sharedKey;
        let chatMessage = new ChatMessage(message.body.message);
        let author = self.session.metadata.participants[chatMessage.header.author];
        if(!author){
            throw "Author is not found in the current version of metadata!";
        }
        if(!chatMessage.verify(author.publicKey)){
            self.emit("error", "Received message with invalid signature!");
        }
        if(!chatMessage.header.private && !data.key && chatMessage.header.metadataID !== self.session.metadata.id){
            throw "current metadata cannot decrypt this message";
        }

        if(chatMessage.header.private){
            chatMessage.decryptPrivateMessage(self.session.privateKey);
        }else{
            chatMessage.decryptMessage(symKey);
        }
        let authorNickname = chatMessage.header.nickname;
        let authorPkfp = chatMessage.header.author;
        let authorExistingName = self.getMemberNickname(authorPkfp);
        if(!this.nicknameAssigned(authorPkfp) ||
            authorNickname !== self.getMemberNickname(authorPkfp)){
            self.setMemberNickname(authorPkfp, authorNickname);
            self.saveClientSettings()
            self.createServiceRecordOnMemberNicknameChange(authorExistingName, authorNickname, authorPkfp)
        }
        self.emit("chat_message", chatMessage);
    }

    nicknameAssigned(pkfp){
         try{
             return this.session.settings.membersData[pkfp].hasOwnProperty("nickname");
         }catch(err){
             return false;
         }
    }

    async messageSendSuccess(response, self){
        let chatMessage = new ChatMessage(response.body.message);
        let author = self.session.metadata.participants[chatMessage.header.author];
        if(!author){
            throw "Author is not found in the current version of metadata!";
        }
        if(!chatMessage.verify(author.publicKey)){
            self.emit("error", "Received message with invalid signature!");
        }
        if(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id){
            throw "current metadata cannot decrypt this message";
        }

        if(chatMessage.header.private){
            chatMessage.decryptPrivateMessage(self.session.privateKey);
        }else{
            chatMessage.decryptMessage(self.session.metadata.sharedKey);
        }

        self.emit("send_success", chatMessage);

    }

    messageSendFail(response, self){
        let messageID = JSON.parse(response).body.message.header.id;
        self.emit("send_fail", self.outgoingMessageQueue[messageID]);
        delete self.outgoingMessageQueue[messageID];
    }

    isLoggedIn(){
        return this.session && this.session.status === "active"
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/


    /**************************************************
     * ================ INVITES HANDLING  ============*
     **************************************************/


    /**
     * Sends request to topic authority to create an invite
     */
    requestInvite(){
        let ic = new iCrypto()
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        let request = new Message();
        let myNickNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.nickname,
            this.session.metadata.topicAuthority.publicKey);
        let topicNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.topicName,
            this.session.metadata.topicAuthority.publicKey);
        request.headers.command = "request_invite";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.body.nickname = myNickNameEncrypted;
        request.body.topicName = topicNameEncrypted;
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);

    }

    syncInvites(){
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        let request = new Message();
        request.headers.command = "sync_invites";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.headers.nonce = ic.get("nhex");
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    syncInvitesSuccess(response, self){
        if(Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, response)){
            self.updatePendingInvites(response.body.invites);
            self.emit(response.headers.response)
        }else{
            throw "invalid message"
        }
    }

    generateInvite(){
        if (!this.session || !(this.session.status ==="active")){
            this.emit("login_required");
            return;
        }
        let ic = new iCrypto();
        ic.createNonce("iid")
            .bytesToHex('iid', "iidhex");
        let body = {
            requestID: ic.get("iidhex"),
            pkfp: this.session.publicKeyFingerprint
        };

        let request = new Message();
        request.headers.command = "request_invite";
        request.set("body", body);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    requestInviteError(response, self){
        console.log("Request invite error received: " + response.headers.error);
        self.emit("request_invite_error", response.headers.error)
    }

    syncInvitesError(response, self){
        console.log("Sync invites error received: " + response.headers.error);
        self.emit("sync_invites_error", response.headers.error)
    }

    processInviteCreated(response, self){
        self.updatePendingInvites(response.body.userInvites);
        self.emit("request_invite_success", response.body.inviteCode)
    }


    updateSetInviteeName(inviteID, name){
        this.session.settings.invites[inviteID].name = name;
        this.saveClientSettings(this.session.settings, this.session.privateKey)
    }

    saveInviteSuccess(response, self){
        self.updatePendingInvites(response.body.userInvites);
        self.emit("invite_generated", self.session.pendingInvites[response.body.inviteID])
    }

    updateInviteSuccess(response, self){
        self.updatePendingInvites(response.body.invites);
        self.emit("invite_updated")
    }

    /**
     * Given a dictionary of encrypted pending invites from history
     * decrypts them and adds to the current session
     * @param invitesUpdatedEncrypted
     */
    updatePendingInvites(userInvites){
        for(let i of userInvites){
            if(!this.session.settings.invites.hasOwnProperty(i)){
                this.session.settings.invites[i] = {}
            }
        }
        for (let i of Object.keys(this.session.settings.invites)){
            if(!userInvites.includes(i)){
                delete this.session.settings.invites[i];
            }
        }

        this.saveClientSettings(this.session.settings, this.session.privateKey);
    }

    settingsInitInvites(){
        this.session.settings.invites = {};
        this.saveClientSettings(this.session.settings, this.session.privateKey);
    }


    deleteInvite(id){
        console.log("About to delete invite: " + id);
        let request = new Message();
        request.headers.command = "del_invite";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp
        let body = {
            invite: id,
        };
        request.set("body", body);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }


    delInviteSuccess(response, self){
        console.log("Del invite success! ");
        self.updatePendingInvites(response.body.invites)
        self.emit("del_invite_success")
    }

    getPendingInvites(){
        console.log("Del invite fail! ");
        self.emit("del_invite_fail")
    }

    inviteRequestValid(inviterResidence, inviterID, inviteID){
        return (inviteID && inviteID && this.onionValid(inviterResidence))
    }





    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ====== ISLAND CONNECTION HANDLING  ============*
     **************************************************/
    async establishIslandConnection(option = "chat"){
        return new Promise((resolve, reject)=>{
            if (option === "chat"){
                if (this.chatSocket && this.chatSocket.connected){
                    resolve();
                    return;
                }
                this.chatSocket = io('/chat', {
                    reconnection: false,
                    forceNew: true,
                    transports: ['websocket', "longpoll"],
                    pingInterval: 10000,
                    pingTimeout: 5000,
                });
                this.chatSocket.on('connect', ()=>{
                    this.finishSocketSetup();
                    console.log("Island connection established");
                    this.islandConnectionStatus = true;
                    this.emit("connected_to_island");
                    resolve();
                });



                this.chatSocket.on("disconnect", ()=>{
                    console.log("Island disconnected.");
                    this.islandConnectionStatus = false;
                    this.emit("disconnected_from_island");
                });

                this.chatSocket.on('connect_error', (err)=>{
                    console.log('Connection Failed');
                    reject(err);
                });
            } else if (option === "file"){
                console.log("Connecting to file socket");
                if (this.fileSocket && this.fileSocket.connected){
                    console.log("File socket already connected! returning");
                    resolve();
                    return;
                }

                this.fileSocket = io('/file', {
                    'reconnection': true,
                    'forceNew': true,
                    'reconnectionDelay': 1000,
                    'reconnectionDelayMax' : 5000,
                    'reconnectionAttempts': 5
                });

                this.fileSocket.on("connect", ()=>{
                    this.setupFileTransferListeners();
                    console.log("File transfer connectiopn established");
                    resolve()
                });

                this.fileSocket.on("connect_error", (err)=>{
                    console.log('Island connection failed: ' + err.message);
                    reject(err);
                });
            }


        })
    }


    async terminateIslandConnection(){
        try{
            if (this.chatSocket && this.chatSocket.connected){
                this.chatSocket.disconnect();
            }
        }catch(err){
            throw ("Error terminating connection with island: " + err);
        }
    }



    //TODO implement method
    setupFileTransferListeners(){

    }

    finishSocketSetup(){
        this.initChatListeners();
    }

    initChatListeners(){
        this.chatSocket.on('message', message =>{

            console.log(JSON.stringify(message));
        });


        this.chatSocket.on('request', request =>{
           console.log("Received new incoming request");
           this.processRequest(request, this)
        });

        this.chatSocket.on("response", response=>{
            this.processResponse(response, this);
        });

        this.chatSocket.on("service", message=>{
            this.processServiceMessage(message, this);
        });


        this.chatSocket.on("service_record", message=>{
            console.log("Got SERVICE RECORD!");
            this.processServiceRecord(message, this);
        });

        this.chatSocket.on("message", message=>{
           this.processIncomingMessage(message, this)
        });

        this.chatSocket.on('reconnect', (attemptNumber) => {
            console.log("Successfull reconnect client")
        });



        this.chatSocket.on('metadata_update', meta=>{
            this.processMetadataUpdate(meta);
        });


/*
        this.chatSocket.on("chat_session_registered", (params)=>{
            if (params.success){
                this.session.status = "active";
                this.emit("chat_session_registered");
            }
        });
*/
        // this.chatSocket.on("last_metadata",(data)=>{
        //     this.processMetadataResponse(data);
        // })
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/



    /**************************************************
     * ========== METADATA MANIPULATION   ============*
     **************************************************/

    /**
     * Takes metadata from session variable,
     * prepares it and sends to all participants
     */
    broadcastMetadataUpdate(metadata){
        let newMetadata = this.session.metadata.toBlob(true);
        let updateRequest = {
            myBlob: newMetadata,
            topicID: this.session.metadata.topicID,
            publicKeyFingerprint: this.session.publicKeyFingerprint,
            recipients :{}
        };

        Object.keys(this.session.metadata.participants).forEach((key)=>{
           //TODO encrypt
           let encryptedMeta = newMetadata;
           let fp = this.session.metadata.participants[key].publicKeyFingerprint;
           let residence = this.session.metadata.participants[key].residence;
           updateRequest.recipients[key] = {
               residence: residence,
               metadata: newMetadata
           }
        });

        this.chatSocket.emit("broadcast_metadata_update", updateRequest);
    }


    //SHIT CODE
    processMetadataUpdate(message, self){
        if(message.headers.event === "new_member_joined"){
            self.processNewMemberJoined(message, self)
        } else if(message.headers.event === "member_booted"){
            self.noteParticipantBooted(message, self)
        }else if( message.headers.event === "u_booted"){
            this.uWereBooted(message, self)
        } else if(message.headers.event === "meta_sync"){
            self.processMetaSync(message, self)
        }
    }

    processMetaSync(message, self){
        if(!self.session){
            return;
        }
        console.log("Processing metadata sync message")
        if(message.body.metadata){
            self._updateMetadata(Metadata.parseMetadata(message.body.metadata));
            self.emit("metadata_updated");
        }
    }

    processNewMemberJoined(request, self){
        if(!self.session){
            return;
        }
        let newMemberPkfp =  request.body.pkfp;
        let newMemberNickname =  request.body.nickname;
        self._updateMetadata(Metadata.parseMetadata(request.body.metadata));
        self.addNewMemberToSettings(newMemberPkfp);
        self.setMemberNickname(newMemberPkfp, newMemberNickname);
        self.saveClientSettings();
        self.emit("new_member_joined");
    }


    _updateMetadata(metadata){
        let self = this;
        let sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint,
            self.session.privateKey,
            metadata);
        self.session.metadata = metadata.body;
        self.session.metadata.sharedKey = sharedKey;
        self.session.metadataSignature = metadata.signature;
    }


    /**************************************************
     * =================== END  ===================== *
     **************************************************/


    /**************************************************
     * ========== SETTINGS UPDATES ====================*
     **************************************************/
    myNicknameUpdate(newNickName){
        if(!newNickName){
            return;
        }
        newNickName = newNickName.trim();
        let settings = this.session.settings;
        if (settings.nickname === newNickName){
            return;
        }
        settings.nickname = newNickName;
        this.setMemberNickname(this.session.publicKeyFingerprint, newNickName);
        this.saveClientSettings(settings, this.session.privateKey)
        this.broadcastNameChange();
    }

    topicNameUpdate(newTopicName){
        if(!newTopicName){
            return;
        }
        newTopicName = newTopicName.trim();
        let settings = this.session.settings;
        if (settings.topicName === newTopicName){
            return;
        }
        settings.topicName = newTopicName;
        this.saveClientSettings(settings, this.session.privateKey)
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/



    /**************************************************
     * ========== UTILS   ============*
     **************************************************/

    signBlob(privateKey, blob){
        let ic = new iCrypto;
        ic.setRSAKey("pk", privateKey, "private")
            .addBlob("b", blob)
            .privateKeySign("b", "pk", "sign")
        return ic.get("sign");
    }

    verifyBlob(publicKey, sign, blob){
        let ic = new iCrypto()
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", sign)
            .addBlob("b", blob)
            .publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }




    /**
     * Generates .onion address and RSA1024 private key for it
     */
    generateOnionService(){
        let pkraw = forge.rsa.generateKeyPair(1024);
        let pkfp = forge.pki.getPublicKeyFingerprint(pkraw.publicKey, {encoding: 'hex', md: forge.md.sha1.create()})
        let pem = forge.pki.privateKeyToPem(pkraw.privateKey);

        if (pkfp.length % 2 !== 0) {
            // odd number of characters
            pkfp = '0' + pkfp;
        }
        let bytes = [];
        for (let i = 0; i < pkfp.length/2; i = i + 2) {
            bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
        }

        let onion  = base32.encode(bytes).toLowerCase() + ".onion";
        return {onion: onion, privateKey: pem};
    }

    onionAddressFromPrivateKey(privateKey){
        let ic = new iCrypto()
        ic.setRSAKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pubk")
        let pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"))
        let pkfp = forge.pki.getPublicKeyFingerprint(pkraw, {encoding: 'hex', md: forge.md.sha1.create()})

        if (pkfp.length % 2 !== 0) {
            pkfp = '0' + pkfp;
        }
        let bytes = [];
        for (let i = 0; i < pkfp.length/2; i = i + 2) {
            bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
        }

        return base32.encode(bytes).toLowerCase() + ".onion";
    }


    extractFromInvite(inviteString64, thingToExtract = "all"){
        let ic = new iCrypto();
        ic.addBlob("is64", inviteString64)
            .base64Decode("is64", "is")
        let inviteParts = ic.get("is").split("/")

        let things = {
            "hsid" : inviteParts[0],
            "pkfp" : inviteParts[1],
            "inviteCode" : inviteParts[2],
            "all" : inviteParts
        };
        try{
            return things[thingToExtract]
        }catch(err){
            throw "Invalid parameter thingToExtract"
        }
    }


    onionValid(candidate){
        let pattern = /^[a-z2-7]{16}\.onion$/;
        return pattern.test(candidate);
    }

    getMyResidence(){
        return this.session.metadata.participants[this.session.publicKeyFingerprint].residence;
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/


}

class Metadata{
    static parseMetadata(blob){
        if(typeof (blob) === "string"){
            return JSON.parse(blob);
        }else{
            return blob;
        }
    }

    static extractSharedKey(pkfp, privateKey, metadata){
        let keyCipher = metadata.body.participants[pkfp].key;
        let ic = new iCrypto();
        ic.addBlob("symcip", keyCipher)
            .asym.setKey("priv", privateKey, "private")
            .asym.decrypt("symcip", "priv", "sym", "hex");
        return ic.get("sym");
    }

    static isMetadataValid(metadata, taPublicKey){

    }
}



class Participant{

    static objectValid(obj){
        if (typeof(obj) === "string"){
            return false;
        }

        for (let i = 0; i<Participant.properties.length;++i){
            if (!obj.hasOwnProperty(Participant.properties[i])){
                return false;
            }
        }
        return (Object.keys(obj).length === Participant.properties.length);
    }

    constructor(blob){
        if (blob){
            this.parseBlob(blob);
        }
    }

    toBlob(stringify = false){
        if (!this.readyForExport()){
            throw "Object participant has some properties uninitialized"
        }
        let result = {};
        for (let i=0; i<Participant.properties.length; ++i){
            let key = Participant.properties[i];
            let value = this[Participant.properties[i]];
            console.log("Key: " + key + "; Value: " + value);
            result[Participant.properties[i]] = this[Participant.properties[i]];
        }
        return (stringify ? JSON.stringify(result) : result);
    }

    parseBlob(blob){
        if(!blob){
            throw "missing required parameter";
        }

        if (typeof(blob)=== "string"){
            blob = JSON.parse(blob);
        }

        if (!this.objectValid(blob)){
            throw "Participant blob is invalid"
        }

        for (let i = 0; i< Participant.properties.length; ++i){
            this[Participant.properties[i]] = blob[Participant.properties[i]]
        }

    }

    keyExists(key){
        if (!key)
            throw "keyExists: Missing required arguments";
        return Object.keys(this).includes(key.toString());
    }



    readyForExport(){
        for (let i=0; i<Participant.properties; ++i){
            if (!this[Participant.properties[i]]){
                return false;
            }
        }
        return true;
    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){

        if (!Participant.properties.includes(name)){
            throw 'Participant: invalid property "' + name + '"';
        }

        this[name] = value;
    };

}

Participant.properties = ["nickname", "publicKey", "publicKeyFingerprint", "residence", "rights"];



class Invite{

    static objectValid(obj){
        if (typeof(obj) === "string"){
            return false;
        }

        for (let i of Invite.properties){
            if (!obj.hasOwnProperty(i)){
                return false;
            }
        }
        return true;
    }

    static decryptInvite(cipher, privateKey, symLengthEncoding = 4){
        let ic = new iCrypto();
        let symlength = parseInt(cipher.substr(cipher.length - symLengthEncoding));
        let symkcip = cipher.substring(cipher.length-symlength - symLengthEncoding, cipher.length - symLengthEncoding);
        let payloadcip = cipher.substring(0, cipher.length - symlength - symLengthEncoding);
        ic.addBlob("symciphex", symkcip)
            .hexToBytes("symciphex", "symcip")
            .addBlob("plcip", payloadcip)
            .setRSAKey("privk", privateKey, "private")
            .privateKeyDecrypt("symcip", "privk", "sym")
            .AESDecrypt("plcip", "sym", "pl", true);
        return JSON.parse(ic.get("pl"));
    }

    static setInviteeName(invite, name){
        invite.inviteeName = name;
    }



    constructor(onionAddress = this.pRequired(),
                pubKeyFingerprint = this.pRequired(),
                hsPrivateKey){

        let ic = new iCrypto()
        ic.createNonce("n").bytesToHex("n", "id");
        this.set('onionAddress', onionAddress);
        this.set('pkfp', pubKeyFingerprint);
        this.set('inviteID', ic.get('id'));
        if (hsPrivateKey){
            let ic = new iCrypto();
            ic.setRSAKey("k", hsPrivateKey, "private")
            this.hsPrivateKey = ic.get("k");
        }
    }

    static constructFromExisting(invite){
        let ic = new iCrypto();
        ic.addBlob("i", invite.inviteCode)
            .base64Decode("i", "ir");

        let onion = ic.get("ir").split("/")[0];

        let newInvite = new Invite(onion, chat.session.publicKeyFingerprint, invite.hsPrivateKey);
        newInvite.set('inviteID', invite.inviteID);
        return newInvite;
    }




    toBlob(encoding){
        let result = this.get("onionAddress") + "/" +
                 this.get("pkfp") + "/" +
                 this.get("inviteID");
        if (encoding){
            let ic = new iCrypto();
            if (!ic.encoders.hasOwnProperty(encoding)){
                throw "WRONG ENCODING"
            }
            ic.addBlob("b", result)
                .encode("b", encoding, "bencoded");
            result = ic.get("bencoded");
        }
        return result;
    }

    stringifyAndEncrypt(publicKey){
        if(!publicKey || !Invite.objectValid(this)){
            throw "Error at stringifyAndEncrypt: the object is invalid or public key is not provided"
        }
        let ic = new iCrypto();

        let invite = {
            inviteCode: this.toBlob("base64"),
            hsPrivateKey: this.hsPrivateKey
        };

        if (this.inviteeName){
            invite.inviteeName = this.inviteeName
        }

        ic.addBlob("invite", JSON.stringify(invite))
            .sym.createKey("sym")
            .setRSAKey("pubk", publicKey, "public")
            .AESEncrypt("invite", "sym", "invitecip", true)
            .publicKeyEncrypt("sym", "pubk", "symcip", "hex")
            .encodeBlobLength("symcip", 4, "0", "symlength")
            .merge(["invitecip", "symcip", "symlength"], "res")
        return ic.get("res")

    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){
        if (!Invite.properties.includes(name)){
            throw 'Invite: invalid property "' + name + '"';
        }
        this[name] = value;
    };

    keyExists(key){
        if (!key)
            throw "keyExists: Missing required arguments";
        return Object.keys(this).includes(key.toString());
    }

    pRequired(functionName = "Invite"){
        throw functionName + ": missing required parameter!"
    }
}

Invite.properties = ["onionAddress", "hsPrivateKey","pkfp", "inviteID"];



/**
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
    constructor(request){
        if(typeof(request)==="string"){
            request = JSON.parse(request);
        }
        this.headers = request ? this.copyHeaders(request.headers) : {
            command: "",
            response: ""
        };
        this.body = request ? request.body : {};
        this.signature = request ? request.signature : "";
    }


    static verifyMessage(publicKey, message){
        let ic = new iCrypto();
        let requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", message.signature)
            .hexToBytes('sign', "signraw")
            .addBlob("b", requestString);
        ic.publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }

    setError(error){
        this.headers.error = error || "Unknown error";
    }

    setResponse(response){
        this.headers.response = response;
    }

    copyHeaders(headers){
        let result = {};
        let keys = Object.keys(headers);
        for (let i=0; i< keys.length; ++i){
            result[keys[i]] = headers[keys[i]];
        }
        return result;
    }

    signMessage(privateKey){
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

    addNonce(){
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        this.headers.nonce = ic.get("nhex");
    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){
        if (!Message.properties.includes(name)){
            throw 'Invite: invalid property "' + name + '"';
        }
        this[name] = value;
    };

}

Message.properties = ["headers", "body", "signature"];




/**
 * Represents chat message
 * Signature hashes only header + body of the message
 *
 * Recipient:
 * */
class ChatMessage{
    constructor(blob){
        if(typeof(blob) === "string"){
            blob = JSON.parse(blob);
        }

        this.signature = blob ?  blob.signature : "";
        this.header = blob ? blob.header : {
            id : this.generateNewID(),
            timestamp: new Date(),
            metadataID :"",
            author: "",
            nickname: "", //AUTHOR PKFP
            recipient: "all", //RCIPIENT PKFP
        };
        this.body = blob ? blob.body : "";
        this.attachments = blob ? blob.attachments : undefined;
    }

    /**
     * encrypts and replaces the body of the message with its cipher
     * @param key Should be SYM AES key in form of a string
     */
    encryptMessage(key){
        let self = this;
        let ic = new iCrypto();
        ic.setSYMKey("k", key)
            .addBlob("body", self.body)
            .AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');
        if (self.attachments){
            ic.addBlob("attachments", JSON.stringify(self.attachments))
                .AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8")
            self.attachments = ic.get("attachmentscip")
        }

        if (self.header.nickname){
            ic.addBlob("nname", self.header.nickname)
                .AESEncrypt("nname", "k", "nnamecip", true);
            self.header.nickname = ic.get("nnamecip")
        }

        self.body = ic.get("bodycip")
    }


    encryptPrivateMessage(keys){
        let self = this;
        let ic = new iCrypto();
        ic.sym.createKey("sym")
            .addBlob("body", self.body)
            .AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');
        if (self.header.nickname){
            ic.addBlob("nname", self.header.nickname)
                .AESEncrypt("nname", "sym", "nnamecip", true);
            self.header.nickname = ic.get("nnamecip")
        }
        self.body = ic.get("bodycip");
        self.header.keys = {};
        self.header.private = true;
        for(let key of keys){
            let icn = new iCrypto();
            icn.asym.setKey("pubk", key, "public")
                .addBlob("sym", ic.get("sym"))
                .asym.encrypt("sym", "pubk", "symcip", "hex")
                .getPublicKeyFingerprint("pubk", "pkfp");
            self.header.keys[icn.get("pkfp")] = icn.get("symcip")
        }
    }

    decryptPrivateMessage(privateKey){
        try{
            let ic = new iCrypto();
            ic.asym.setKey("priv", privateKey, "private")
                .publicFromPrivate("priv", "pub")
                .getPublicKeyFingerprint("pub", "pkfp")
                .addBlob("symcip", this.header.keys[ic.get("pkfp")])
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .addBlob("bodycip", this.body)
                .sym.decrypt("bodycip", "sym", "body", true);
            this.body = ic.get("body");

            if(this.header.nickname){
                ic.addBlob("nnamecip", this.header.nickname)
                    .AESDecrypt("nnamecip", "sym", "nname", true);
                this.header.nickname= ic.get("nname");
            }
        }catch(err){
            console.log("Error decrypting private message: " + err);
        }
    }


    /**
     * Decrypts body and replaces the cipher with raw text
     * @param key
     */
    decryptMessage(key){
        try{
            let ic = new iCrypto();
            ic.sym.setKey("k", key)
                .addBlob("bodycip", this.body)
                .sym.decrypt("bodycip", "k", "body", true);
            this.body = ic.get("body")
            if (this.attachments){
                ic.addBlob("attachmentscip", this.attachments)
                    .AESDecrypt("attachmentscip", "k", "attachments", true);
                this.attachments = JSON.parse(ic.get("attachments"))
            }
            if(this.header.nickname){
                ic.addBlob("nnamecip", this.header.nickname)
                    .AESDecrypt("nnamecip", "k", "nname", true);
                this.header.nickname= ic.get("nname");
            }
        }catch(err){
            console.log("Error decrypting message: " + err);
        }
    }

    /**
     * Adds attachment metadata to the message
     * @param {Attachment} attachment
     */
    addAttachmentInfo(attachment){
        let self = this;
        if(!self.attachments){
            self.attachments = []
        }

        AttachmentInfo.verifyFileInfo(attachment);
        self.attachments.push(attachment);
    }


    sign(privateKey){
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
        if (this.attachments){
            requestString += JSON.stringify(this.attachments)
        }
        ic.addBlob("body", requestString)
            .setRSAKey("priv", privateKey, "private")
            .privateKeySign("body", "priv", "sign");
        this.signature = ic.get("sign");
    }

    verify(publicKey){
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
        if (this.attachments){
            requestString += JSON.stringify(this.attachments)
        }
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", this.signature)
            .addBlob("b", requestString)
            .publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }

    getNonce(size){
        let ic = new iCrypto;
        ic.createNonce("n", size ? parseInt(size): 8 )
            .bytesToHex("n", "nh");
        return ic.get("nh");
    }

    generateNewID(){
        return this.getNonce(8);
    }



    toBlob(){
        return JSON.stringify(this);
    }

}




function WildEmitter() { }

WildEmitter.mixin = function (constructor) {
    var prototype = constructor.prototype || constructor;

    prototype.isWildEmitter= true;

    // Listen on the given `event` with `fn`. Store a group name if present.
    prototype.on = function (event, groupName, fn) {
        this.callbacks = this.callbacks || {};
        var hasGroup = (arguments.length === 3),
            group = hasGroup ? arguments[1] : undefined,
            func = hasGroup ? arguments[2] : arguments[1];
        func._groupName = group;
        (this.callbacks[event] = this.callbacks[event] || []).push(func);
        return this;
    };

    // Adds an `event` listener that will be invoked a single
    // time then automatically removed.
    prototype.once = function (event, groupName, fn) {
        var self = this,
            hasGroup = (arguments.length === 3),
            group = hasGroup ? arguments[1] : undefined,
            func = hasGroup ? arguments[2] : arguments[1];
        function on() {
            self.off(event, on);
            func.apply(this, arguments);
        }
        this.on(event, group, on);
        return this;
    };

    // Unbinds an entire group
    prototype.releaseGroup = function (groupName) {
        this.callbacks = this.callbacks || {};
        var item, i, len, handlers;
        for (item in this.callbacks) {
            handlers = this.callbacks[item];
            for (i = 0, len = handlers.length; i < len; i++) {
                if (handlers[i]._groupName === groupName) {
                    //console.log('removing');
                    // remove it and shorten the array we're looping through
                    handlers.splice(i, 1);
                    i--;
                    len--;
                }
            }
        }
        return this;
    };

    // Remove the given callback for `event` or all
    // registered callbacks.
    prototype.off = function (event, fn) {
        this.callbacks = this.callbacks || {};
        var callbacks = this.callbacks[event],
            i;

        if (!callbacks) return this;

        // remove all handlers
        if (arguments.length === 1) {
            delete this.callbacks[event];
            return this;
        }

        // remove specific handler
        i = callbacks.indexOf(fn);
        callbacks.splice(i, 1);
        if (callbacks.length === 0) {
            delete this.callbacks[event];
        }
        return this;
    };

    /// Emit `event` with the given args.
    // also calls any `*` handlers
    prototype.emit = function (event) {
        this.callbacks = this.callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this.callbacks[event],
            specialCallbacks = this.getWildcardCallbacks(event),
            i,
            len,
            item,
            listeners;

        if (callbacks) {
            listeners = callbacks.slice();
            for (i = 0, len = listeners.length; i < len; ++i) {
                if (!listeners[i]) {
                    break;
                }
                listeners[i].apply(this, args);
            }
        }

        if (specialCallbacks) {
            len = specialCallbacks.length;
            listeners = specialCallbacks.slice();
            for (i = 0, len = listeners.length; i < len; ++i) {
                if (!listeners[i]) {
                    break;
                }
                listeners[i].apply(this, [event].concat(args));
            }
        }

        return this;
    };

    // Helper for for finding special wildcard event handlers that match the event
    prototype.getWildcardCallbacks = function (eventName) {
        this.callbacks = this.callbacks || {};
        var item,
            split,
            result = [];

        for (item in this.callbacks) {
            split = item.split('*');
            if (item === '*' || (split.length === 2 && eventName.slice(0, split[0].length) === split[0])) {
                result = result.concat(this.callbacks[item]);
            }
        }
        return result;
    };

};




/**
 * Implements files attachments functionality
 * Constructor accepts a file element
 */
class AttachmentInfo{
    constructor(file, onion, pkfp, metaID, privKey, messageID, hashEncrypted, hashUnencrypted, hashAlgo = "sha256"){
        let self = this;
        self.name = file.name;
        self.size = file.size;
        self.type = file.type;
        self.lastModified = file.lastModified;
        self.pkfp = pkfp;
        self.metaID = metaID;
        self.hashAlgorithm = hashAlgo;
        self.messageID = messageID;
        self.hashEncrypted = hashEncrypted;
        self.hashUnencrypted = hashUnencrypted;
        self.link = self.buildLink(onion, pkfp, self.hashUnencrypted);
        self.signHashes(privKey);
    }

    get(){
        let self = this;
        return {
            name: self.name,
            size: self.size,
            type: self.type,
            lastModified: self.lastModified,
            pkfp: self.pkfp,
            hashEncrypted: self.hashEncrypted,
            hashUnencrypted: self.hashUnencrypted,
            signEncrypted: self.signEncrypted,
            signUnencrypted: self.signUnencrypted,
            metaID: self.metaID,
            messageID: self.messageID,
            link: self.link,
            hashAlgorithm: self.hashAlgorithm
        }
    }

    getLink(){
        return this.link;
    }

    static verifyFileInfo(info){
        let required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link",  "metaID", "messageID", "hashAlgorithm"];
        for(let i of required){
            if (!info.hasOwnProperty(i)){
                throw "Attachment verifyFileInfo: Missing required property: " + i;
            }
        }
    }

    static parseLink(link){
        const ic = new iCrypto();
        ic.addBlob("l", link)
            .base64Decode("l", "lres");
        const elements = ic.get("lres").split("/");
        return{
            residence: elements[0],
            pkfp: elements[1],
            name: elements[2]
        }
    }



    buildLink(onion, pkfp, hash){
        if(!onion || !pkfp || !hash){
            throw "Attachment buildLink: missing required parameters";
        }
        const rawLink = onion + "/" + pkfp + "/" + hash;
        const ic = new iCrypto();
        ic.addBlob("l", rawLink)
            .base64Encode("l", "l64");
        return ic.get("l64");
    }

    signHashes(privKey){
        if(!privKey){
            throw "Attachment signAttachmentHash: privKey is undefined";
        }
        let self = this;
        let ic = new iCrypto();
        ic.addBlob("hu", self.hashUnencrypted)
            .addBlob("he", self.hashEncrypted)
            .asym.setKey("pk", privKey, "private")
            .asym.sign("hu", "pk", "sign_u")
            .asym.sign("he", "pk", "sign_e");
        self.signUnencrypted = ic.get("sign_u");
        self.signEncrypted = ic.get("sign_e");
    }
}

AttachmentInfo.properties = ["name", "size", "type", "lastModified", "hashUnencrypted", "signUnencrypted", "hashEncrytped", "signEncrypted","link", "metaID", "messageID", "hashAlgorithm"];


WildEmitter.mixin(WildEmitter);



class ChatUtility{
    /**
     * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
     * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
     * Sym key generated randomly every time
     * @param blob - cipher blob
     * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
     * @param privateKey
     * @returns {}
     */
    static decryptStandardMessage(blob = Err.required(),
                                  privateKey = Err.required(),
                                  lengthSymLengthEncoded = 4, ){

        let symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));

        let symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
        let payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
        let ic = new iCrypto();
        ic.addBlob("blobcip", payloadCipher)
            .addBlob("symkcip", symKeyCipher)
            .asym.setKey("privk", privateKey, "private")
            .privateKeyDecrypt("symkcip", "privk", "symk", "hex")
            .AESDecrypt("blobcip", "symk", "blob-raw", true,  "CBC", "utf8");
        return ic.get("blob-raw");
    }

    static encryptStandardMessage(blob = Err.required(),
                                  publicKey = Err.required(),
                                  lengthSymLengthEncoded = 4,){
        let ic = new iCrypto();
        ic.sym.createKey("symk")
            .addBlob("payload", blob)
            .asym.setKey("pubk", publicKey, "public")
            .sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8")
            .asym.encrypt("symk", "pubk", "symcip", "hex")
            .encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength")
            .merge(["blobcip", "symcip", "symciplength"], "res");
        return ic.get("res");
    }

    static publicKeyEncrypt(blob = Err.required(),
                            publicKey = Err.required()){
        const ic = new iCrypto();
        ic.addBlob("blob", blob)
            .asym.setKey("pubk", publicKey, "public")
            .publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
        return ic.get("blobcip");
    }

    static privateKeyDecrypt(blob, privateKey, encoding = "hex"){
        const ic = new iCrypto();
        ic.addBlob("blobcip", blob)
            .asym.setKey("priv", privateKey, "private")
            .privateKeyDecrypt("blobcip", "priv", "blob", encoding);
        return ic.get("blob");
    }

    static symKeyEncrypt(blob, key, hexify = true){
        const ic = new iCrypto();
        ic.addBlob("b", blob)
            .sym.setKey("sym", key)
            .AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8")
        return ic.get("cip")
    }

    static symKeyDecrypt(cip, key, dehexify = true){
        const ic = new iCrypto();
        ic.addBlob("cip", cip)
            .sym.setKey("sym", key)
            .AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
        return ic.get("b")
    }
}


class ClientSettings{
    constructor(){
        this.nicknames = {};
        this.invites = {};
    }
}