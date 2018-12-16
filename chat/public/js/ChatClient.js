"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require("babel-polyfill");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChatClient = function () {
    function ChatClient(opts) {
        _classCallCheck(this, ChatClient);

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


    _createClass(ChatClient, [{
        key: "setClientHandlers",
        value: function setClientHandlers() {
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
            };
        }
    }, {
        key: "processServiceMessage",
        value: function processServiceMessage(message) {
            this.serviceMessageHandlers.hasOwnProperty(message.headers.command) ? this.serviceMessageHandlers[message.headers.command](message, this) : this.serviceMessageHandlers.default(message, this);
        }
    }, {
        key: "processServiceRecord",
        value: function processServiceRecord(record, self) {
            //TODO decrypt body
            console.log("New service record arrived!");
            record.body = ChatUtility.decryptStandardMessage(record.body, self.session.privateKey);
            self.emit("service_record", record);
        }
    }, {
        key: "processResponse",
        value: function processResponse(response) {
            response = new Message(response);
            if (response.headers.error) {
                this.requestErrorHandlers.hasOwnProperty(response.headers.response) ? this.requestErrorHandlers[response.headers.response](response, this) : this.requestErrorHandlers.default(response, this);
                return;
            }

            this.responseHandlers.hasOwnProperty(response.headers.response) ? this.responseHandlers[response.headers.response](response, this) : this.responseHandlers.default(response, this);
        }
    }, {
        key: "processRequest",
        value: function processRequest(request) {
            this.requestHandlers.hasOwnProperty(request.headers.command) ? this.requestHandlers[request.headers.command](request, this) : this.requestErrorHandlers.default(request, this);
        }

        /**
         * Processes unknown note
         * @param note
         * @param self
         */

    }, {
        key: "processUnknownNote",
        value: function processUnknownNote(note, self) {
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

    }, {
        key: "initTopic",
        value: function initTopic(nickname, topicName) {
            var _this = this;

            return new Promise(function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
                    var _self, ic, newTopic, request, body;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    _context.prev = 0;
                                    _self = _this;

                                    nickname = String(nickname).trim();

                                    if (!(!nickname || nickname.length < 3)) {
                                        _context.next = 6;
                                        break;
                                    }

                                    reject("Nickname entered is invalid");
                                    return _context.abrupt("return");

                                case 6:

                                    //CREATE NEW TOPIC PENDING
                                    ic = new iCrypto();
                                    //Generate keypairs one for user, other for topic

                                    _context.next = 9;
                                    return ic.asym.asyncCreateKeyPair('owner-keys');

                                case 9:
                                    ic = _context.sent;
                                    _context.next = 12;
                                    return ic.asym.asyncCreateKeyPair('topic-keys');

                                case 12:
                                    ic = _context.sent;

                                    ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                                    ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                                    newTopic = {
                                        ownerKeyPair: ic.get("owner-keys"),
                                        topicKeyPair: ic.get("topic-keys"),
                                        ownerPkfp: ic.get("owner-pkfp"),
                                        topicID: ic.get("topic-pkfp"),
                                        ownerNickName: nickname,
                                        topicName: topicName
                                    };

                                    //Request island to init topic creation and get one-time key.

                                    request = new Message();

                                    request.headers.command = "new_topic_get_token";
                                    body = {
                                        topicID: newTopic.topicID,
                                        ownerPublicKey: ic.get('owner-keys').publicKey
                                    };

                                    request.set("body", body);
                                    _self.newTopicPending[newTopic.topicID] = newTopic;
                                    _context.next = 23;
                                    return _this.establishIslandConnection();

                                case 23:
                                    _this.chatSocket.emit("request", request);
                                    resolve();
                                    _context.next = 30;
                                    break;

                                case 27:
                                    _context.prev = 27;
                                    _context.t0 = _context["catch"](0);
                                    throw _context.t0;

                                case 30:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this, [[0, 27]]);
                }));

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            }());
        }

        /**
         * New token on init topic received. Proceeding with topic creation
         * @param response
         * @param self
         */

    }, {
        key: "initTopicContinueAfterTokenReceived",
        value: function initTopicContinueAfterTokenReceived(response, self) {

            console.log("Token received, continuing creating topic");

            var pendingTopic = self.newTopicPending[response.body.topicID];
            var token = response.body.token; // Token is 1-time disposable public key generated by server

            //Forming request
            var newTopicData = {
                topicKeyPair: pendingTopic.topicKeyPair,
                ownerPublicKey: pendingTopic.ownerKeyPair.publicKey
            };

            var newTopicDataCipher = ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token);

            //initializing topic settings
            var settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName, pendingTopic.topicName, pendingTopic.ownerKeyPair.publicKey);

            //Preparing request
            var request = new Message();
            request.headers.command = "init_topic";
            request.headers.pkfpSource = pendingTopic.ownerPkfp;
            request.body.topicID = pendingTopic.topicID;
            request.body.settings = settings;
            request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
            request.body.newTopicData = newTopicDataCipher;

            //Sending request
            self.chatSocket.emit("request", request);
        }
    }, {
        key: "prepareNewTopicSettings",
        value: function prepareNewTopicSettings(nickname, topicName, publicKey) {
            var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            //Creating and encrypting topic settings:
            var settings = {
                membersData: {},
                soundsOn: true
            };
            if (nickname) {
                var ic = new iCrypto();
                ic.asym.setKey("pubk", publicKey, "public").getPublicKeyFingerprint("pubk", "pkfp");
                settings.nickname = nickname;
                settings.membersData[ic.get("pkfp")] = { nickname: nickname };
            }

            if (topicName) {
                settings.topicName = topicName;
            }
            if (encrypt) {
                return ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey);
            } else {
                return settings;
            }
        }
    }, {
        key: "initTopicSuccess",
        value: function initTopicSuccess(request, self) {
            var data = self.newTopicPending[request.body.topicID];
            var pkfp = data.pkfp;
            var privateKey = data.privateKey;
            var nickname = data.nickname;
            self.emit("init_topic_success", {
                pkfp: data.ownerPkfp,
                nickname: data.ownerNickName,
                privateKey: data.ownerKeyPair.privateKey
            });
            delete self.newTopicPending[request.body.topicID];
        }
    }, {
        key: "topicLogin",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(privateKey) {
                var success, error, ic, body, request;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                success = true;
                                error = void 0;


                                privateKey = String(privateKey).trim();

                                if (!(this.session && this.session.status === "active" && this.islandConnectionStatus)) {
                                    _context2.next = 6;
                                    break;
                                }

                                this.emit("login_success");
                                return _context2.abrupt("return");

                            case 6:
                                _context2.prev = 6;
                                _context2.next = 9;
                                return this.establishIslandConnection();

                            case 9:
                                ic = new iCrypto();

                                ic.setRSAKey('pk', privateKey, "private").publicFromPrivate('pk', 'pub').getPublicKeyFingerprint('pub', 'pkfp').createNonce('nonce').bytesToHex('nonce', "noncehex");

                                this.session = {
                                    sessionID: ic.get("noncehex"),
                                    publicKey: ic.get("pub"),
                                    privateKey: ic.get('pk'),
                                    publicKeyFingerprint: ic.get("pkfp"),
                                    status: 'off'
                                };

                                body = {
                                    publicKey: ic.get("pub"),
                                    sessionID: ic.get("noncehex")
                                };
                                request = new Message();

                                request.set("body", body);
                                request.headers.command = "init_login";
                                request.headers.pkfpSource = ic.get("pkfp");
                                request.signMessage(ic.get("pk"));
                                this.chatSocket.emit("request", request);
                                _context2.next = 25;
                                break;

                            case 21:
                                _context2.prev = 21;
                                _context2.t0 = _context2["catch"](6);

                                success = false;
                                error = _context2.t0.message;

                            case 25:
                                if (success) {
                                    _context2.next = 37;
                                    break;
                                }

                                _context2.prev = 26;
                                _context2.next = 29;
                                return this.terminateIslandConnection();

                            case 29:
                                _context2.next = 34;
                                break;

                            case 31:
                                _context2.prev = 31;
                                _context2.t1 = _context2["catch"](26);

                                console.log("ERROR terminating island connection: " + _context2.t1);

                            case 34:
                                _context2.prev = 34;

                                this.emit("login_fail", error);
                                return _context2.finish(34);

                            case 37:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 21], [26, 31, 34, 37]]);
            }));

            function topicLogin(_x4) {
                return _ref2.apply(this, arguments);
            }

            return topicLogin;
        }()

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

    }, {
        key: "loginDecryptData",
        value: function loginDecryptData(request, self) {

            var decryptBlob = function decryptBlob(privateKey, blob) {
                var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

                var icn = new iCrypto();
                var symLength = parseInt(blob.substr(-lengthChars));
                var blobLength = blob.length;
                var symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
                var cipher = blob.substring(0, blobLength - symLength - lengthChars);
                icn.addBlob("symcip", symk).addBlob("cipher", cipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex").sym.decrypt("cipher", "sym", "blob-raw", true);
                return icn.get("blob-raw");
            };

            var encryptBlob = function encryptBlob(publicKey, blob) {
                var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

                var icn = new iCrypto();
                icn.createSYMKey("sym").asym.setKey("pub", publicKey, "public").addBlob("blob-raw", blob).sym.encrypt("blob-raw", "sym", "blob-cip", true).asym.encrypt("sym", "pub", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symcipl").merge(["blob-cip", "symcip", "symcipl"], "res");
                return icn.get("res");
            };

            if (!self.session) {
                console.log("invalid island request");
                return;
            }

            var clientHSPrivateKey = void 0,
                taPrivateKey = void 0,
                taHSPrivateKey = void 0;
            var token = request.body.token;
            var loginData = request.body.dataForDecryption;
            var ic = new iCrypto();
            ic.asym.setKey("priv", self.session.privateKey, "private");

            //Decrypting client Hidden service key
            if (loginData.clientHSPrivateKey) {
                clientHSPrivateKey = decryptBlob(self.session.privateKey, loginData.clientHSPrivateKey);
            }

            if (loginData.topicAuthority && loginData.topicAuthority.taPrivateKey) {
                taPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taPrivateKey);
            }

            if (loginData.topicAuthority && loginData.topicAuthority.taHSPrivateKey) {
                taHSPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taHSPrivateKey);
            }

            var preDecrypted = {};

            if (clientHSPrivateKey) {
                preDecrypted.clientHSPrivateKey = encryptBlob(token, clientHSPrivateKey);
            }
            if (taPrivateKey || taHSPrivateKey) {
                preDecrypted.topicAuthority = {};
            }
            if (taPrivateKey) {
                preDecrypted.topicAuthority.taPrivateKey = encryptBlob(token, taPrivateKey);
            }
            if (taHSPrivateKey) {
                preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(token, taHSPrivateKey);
            }

            var decReq = new Message();
            decReq.headers.pkfpSource = self.session.publicKeyFingerprint;
            decReq.body = request.body;
            decReq.body.preDecrypted = preDecrypted;
            decReq.headers.command = "login_decrypted_continue";
            decReq.signMessage(self.session.privateKey);
            console.log("Decryption successfull. Sending data back to Island");

            self.chatSocket.emit("request", decReq);
        }
    }, {
        key: "finalizeLogin",
        value: function finalizeLogin(response, self) {
            var metadata = Metadata.parseMetadata(response.body.metadata);
            var sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
            var messages = self.decryptMessagesOnMessageLoad(response.body.messages);
            var settings = metadata.body.settings ? metadata.body.settings : {};
            self.session.status = "active";
            self.session.metadata = metadata.body;
            self.session.metadata.sharedKey = sharedKey;
            self.session.metadataSignature = metadata.signature;
            self.session.settings = JSON.parse(ChatUtility.decryptStandardMessage(settings, self.session.privateKey));
            self.emit("login_success", messages);
            self.checkNicknames();
        }
    }, {
        key: "checkNicknames",
        value: function checkNicknames() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.session.metadata.participants)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pkfp = _step.value;

                    if (!this.getMemberNickname(pkfp)) {
                        this.requestNickname(pkfp);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: "getMemberNickname",
        value: function getMemberNickname(pkfp) {
            if (!this.session || !pkfp) {
                return;
            }
            var membersData = this.session.settings.membersData;
            if (membersData[pkfp]) {
                return membersData[pkfp].nickname;
            }
        }
    }, {
        key: "getMemberAlias",
        value: function getMemberAlias(pkfp) {
            if (!this.session || !pkfp) {
                return;
            }
            var membersData = this.session.settings.membersData;
            if (membersData[pkfp] && membersData[pkfp].alias) {
                return membersData[pkfp].alias;
            } else {
                return pkfp.substring(0, 8);
            }
        }
    }, {
        key: "deleteMemberAlias",
        value: function deleteMemberAlias(pkfp) {
            var membersData = this.session.settings.membersData;
            if (membersData[pkfp]) {
                delete membersData[pkfp].alias;
            }
        }
    }, {
        key: "getMemberRepr",
        value: function getMemberRepr(pkfp) {
            var membersData = this.session.settings.membersData;
            if (membersData[pkfp]) {
                return this.getMemberAlias(pkfp) || this.getMemberNickname(pkfp) || "Anonymous";
            }
        }
    }, {
        key: "deleteMemberData",
        value: function deleteMemberData(pkfp) {
            var membersData = this.session.settings.membersData;
            delete membersData[pkfp];
        }
    }, {
        key: "setMemberNickname",
        value: function setMemberNickname(pkfp, nickname, settings) {
            if (settings) {
                settings.membersData[pkfp] = {
                    joined: new Date(),
                    nickname: nickname
                };
                return;
            }
            if (!pkfp) {
                throw "Missing required parameter";
            }
            var membersData = this.session.settings.membersData;
            if (!membersData[pkfp]) {
                this.addNewMemberToSettings(pkfp);
            }

            membersData[pkfp].nickname = nickname;
        }
    }, {
        key: "setMemberAlias",
        value: function setMemberAlias(pkfp, alias) {
            if (!pkfp) {
                throw "Missing required parameter";
            }
            if (!this.session) {
                return;
            }
            var membersData = this.session.settings.membersData;
            if (!membersData[pkfp]) {
                membersData[pkfp] = {};
            }
            if (!alias) {
                delete membersData[pkfp].alias;
            } else {
                membersData[pkfp].alias = alias;
            }
        }
    }, {
        key: "requestNickname",
        value: function requestNickname(pkfp) {
            if (!pkfp) {
                throw "Missing required parameter";
            }
            var request = new Message();
            request.setCommand("whats_your_name");
            request.setSource(this.session.publicKeyFingerprint);
            request.setDest(pkfp);
            request.addNonce();
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "broadcastNameChange",
        value: function broadcastNameChange() {
            var self = this;
            var message = new Message();
            message.setCommand("nickname_change_broadcast");
            message.setSource(this.session.publicKeyFingerprint);
            message.addNonce();
            message.body.nickname = ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
            message.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", message);
        }
    }, {
        key: "processNicknameResponse",
        value: function processNicknameResponse(request, self) {
            self._processNicknameResponseHelper(request, self);
        }
    }, {
        key: "processNicknameChangeNote",
        value: function processNicknameChangeNote(request, self) {
            self._processNicknameResponseHelper(request, self, true);
        }
    }, {
        key: "_processNicknameResponseHelper",
        value: function _processNicknameResponseHelper(request, self) {
            var broadcast = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            console.log("Got nickname response");
            var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
            if (!Message.verifyMessage(publicKey, request)) {
                console.trace("Invalid signature");
                return;
            }
            var existingNickname = self.getMemberNickname(request.headers.pkfpSource);
            var memberRepr = self.getMemberRepr(request.headers.pkfpSource);
            var newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) : ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);
            if (newNickname !== existingNickname) {
                self.setMemberNickname(request.headers.pkfpSource, newNickname);
                self.saveClientSettings();
                if (existingNickname && existingNickname !== "") {
                    self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
                }
            }
        }
    }, {
        key: "createServiceRecordOnMemberNicknameChange",
        value: function createServiceRecordOnMemberNicknameChange(existingName, newNickname, pkfp) {
            existingName = existingName || "";
            var msg = "Member " + existingName + " (id: " + pkfp + ") changed nickname to: " + newNickname;
            this.createRegisterServiceRecord("member_nickname_change", msg);
        }
    }, {
        key: "createRegisterServiceRecord",
        value: function createRegisterServiceRecord(event, message) {
            var request = new Message();
            request.addNonce();
            request.setSource(this.session.publicKeyFingerprint);
            request.setCommand("register_service_record");
            request.body.event = event;
            request.body.message = ChatUtility.encryptStandardMessage(message, this.session.publicKey);
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "processNicknameRequest",
        value: function processNicknameRequest(request, self) {
            var parsedRequest = new Message(request);
            var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
            if (!Message.verifyMessage(publicKey, parsedRequest)) {
                console.trace("Invalid signature");
                return;
            }
            var response = new Message();
            response.setCommand("my_name_response");
            response.setSource(self.session.publicKeyFingerprint);
            response.setDest(request.headers.pkfpSource);
            response.addNonce();
            response.body.nickname = ChatUtility.encryptStandardMessage(self.session.settings.nickname, publicKey);
            response.signMessage(self.session.privateKey);
            self.chatSocket.emit("request", response);
        }
    }, {
        key: "addNewMemberToSettings",
        value: function addNewMemberToSettings(pkfp) {
            this.session.settings.membersData[pkfp] = {
                joined: new Date()
            };
        }
    }, {
        key: "attemptReconnection",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.topicLogin(this.session.privateKey);

                            case 2:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function attemptReconnection() {
                return _ref3.apply(this, arguments);
            }

            return attemptReconnection;
        }()
    }, {
        key: "loadMoreMessages",
        value: function loadMoreMessages(lastLoadedMessageID) {
            if (this.allMessagesLoaded) return;
            var request = new Message();
            request.headers.command = "load_more_messages";
            request.headers.pkfpSource = this.session.publicKeyFingerprint;
            request.body.lastLoadedMessageID = lastLoadedMessageID;
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "loadMoreMessagesSuccess",
        value: function loadMoreMessagesSuccess(response, self) {
            var messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages);
            self.allMessagesLoaded = response.body.lastMessages.allLoaded || self.allMessagesLoaded;
            self.emit("messages_loaded", messages);
        }
    }, {
        key: "decryptMessagesOnMessageLoad",
        value: function decryptMessagesOnMessageLoad(data) {
            var keys = data.keys;
            var metaIDs = Object.keys(keys);
            for (var i = 0; i < metaIDs.length; ++i) {
                var ic = new iCrypto();
                ic.addBlob('k', keys[metaIDs[i]]).hexToBytes("k", "kraw").setRSAKey("priv", this.session.privateKey, "private").privateKeyDecrypt("kraw", "priv", "kdec");
                keys[metaIDs[i]] = ic.get("kdec");
            }

            var messages = data.messages;
            var result = [];
            for (var _i = 0; _i < messages.length; ++_i) {
                var message = new ChatMessage(messages[_i]);
                if (message.header.service) {
                    message.body = ChatUtility.decryptStandardMessage(message.body, this.session.privateKey);
                } else if (message.header.private) {
                    message.decryptPrivateMessage(this.session.privateKey);
                } else {
                    message.decryptMessage(keys[message.header.metadataID]);
                }
                result.push(message);
            }
            return result;
        }
    }, {
        key: "logout",
        value: function logout() {
            this.chatSocket.disconnect();
            this.session = null;
            this.allMessagesLoaded = false;
        }
    }, {
        key: "haveIRightsToBoot",
        value: function haveIRightsToBoot() {
            return parseInt(this.session.metadata.participants[this.session.publicKeyFingerprint].rights) >= 3;
        }
    }, {
        key: "bootParticipant",
        value: function bootParticipant(pkfp) {
            var self = this;
            if (!self.haveIRightsToBoot()) {
                self.emit("boot_participant_fail", "Not enough rights to boot a member");
                return;
            }

            var request = new Message();
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

    }, {
        key: "noteParticipantBooted",
        value: function noteParticipantBooted(note, self) {
            console.log("Note received: A member was booted. Processing");
            var newMeta = Metadata.parseMetadata(note.body.metadata);
            self._updateMetadata(newMeta);
            var bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
            this.deleteMemberData(note.body.bootedPkfp);
            this.saveClientSettings();
            self.emit("participant_booted", "Participant " + bootedNickname + " was booted!");
        }
    }, {
        key: "bootParticipantFailed",
        value: function bootParticipantFailed(response, self) {
            console.log("Boot member failed!");
            self.emit("boot_participant_fail", response.error);
        }

        /**
         * Called on INVITEE side when new user joins a topic with an invite code
         * @param nickname
         * @param inviteCode
         * @returns {Promise}
         */

    }, {
        key: "initTopicJoin",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(nickname, inviteCode) {
                var clientSettings, ic, invite, inviterResidence, inviterID, inviteID, headers, body, request, topicData;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);

                                clientSettings = new ClientSettings();

                                clientSettings;

                                _context4.next = 5;
                                return this.establishIslandConnection();

                            case 5:
                                ic = new iCrypto();

                                ic.asym.createKeyPair("rsa").getPublicKeyFingerprint('rsa', 'pkfp').addBlob("invite64", inviteCode.trim()).base64Decode("invite64", "invite");

                                invite = ic.get("invite").split("/");
                                inviterResidence = invite[0];
                                inviterID = invite[1];
                                inviteID = invite[2];

                                if (this.inviteRequestValid(inviterResidence, inviterID, inviteID)) {
                                    _context4.next = 14;
                                    break;
                                }

                                this.emit("join_topic_fail");
                                throw "Invite request is invalid";

                            case 14:

                                this.pendingTopicJoins[inviteID] = {
                                    publicKey: ic.get('rsa').publicKey,
                                    privateKey: ic.get('rsa').privateKey,
                                    nickname: nickname,
                                    inviterID: inviterID,
                                    inviterResidence: inviterResidence
                                };

                                headers = {
                                    command: "join_topic",
                                    pkfpDest: inviterID,
                                    pkfpSource: ic.get('pkfp')

                                };
                                body = {
                                    inviteString: inviteCode.trim(),
                                    inviteCode: inviteID,
                                    destination: inviterResidence,
                                    invitee: {
                                        publicKey: ic.get('rsa').publicKey,
                                        nickname: nickname,
                                        pkfp: ic.get('pkfp')
                                    }
                                };
                                request = new Message();

                                request.set('headers', headers);
                                request.set("body", body);
                                request.signMessage(ic.get('rsa').privateKey);
                                this.chatSocket.emit("request", request);
                                topicData = {
                                    newPublicKey: ic.get('rsa').publicKey,
                                    newPrivateKey: ic.get('rsa').privateKey

                                };
                                return _context4.abrupt("return", topicData);

                            case 24:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function initTopicJoin(_x8, _x9) {
                return _ref4.apply(this, arguments);
            }

            return initTopicJoin;
        }()
    }, {
        key: "initSettingsOnTopicJoin",
        value: function initSettingsOnTopicJoin(topicInfo, request) {
            var privateKey = topicInfo.privateKey;
            var publicKey = topicInfo.publicKey;
            var ic = new iCrypto();
            ic.asym.setKey("pub", publicKey, "public").getPublicKeyFingerprint("pub", "pkfp");
            var pkfp = ic.get("pkfp");
            var topicName = ChatUtility.decryptStandardMessage(request.body.topicName, privateKey);
            var inviterNickname = ChatUtility.decryptStandardMessage(request.body.inviterNickname, privateKey);
            var inviterPkfp = request.body.inviterPkfp;
            var settings = this.prepareNewTopicSettings(topicInfo.nickname, topicName, topicInfo.publicKey, false);

            this.setMemberNickname(inviterPkfp, inviterNickname, settings);
            this.saveClientSettings(settings, privateKey);
        }
    }, {
        key: "onSuccessfullSettingsUpdate",
        value: function onSuccessfullSettingsUpdate(response, self) {
            console.log("Settings successfully updated!");
            self.emit("settings_updated");
        }
    }, {
        key: "notifyJoinSuccess",
        value: function notifyJoinSuccess(request, self) {
            console.log("Join successfull received!");
            var topicInfo = self.pendingTopicJoins[request.body.inviteCode];
            self.initSettingsOnTopicJoin(topicInfo, request);
            self.emit("topic_join_success", {
                nickname: topicInfo.nickname,
                privateKey: topicInfo.privateKey
            });
        }
    }, {
        key: "saveClientSettings",
        value: function saveClientSettings(settingsRaw, privateKey) {
            if (!settingsRaw) {
                settingsRaw = this.session.settings;
            }
            if (!privateKey) {
                privateKey = this.session.privateKey;
            }
            var ic = new iCrypto();
            ic.asym.setKey("privk", privateKey, "private").publicFromPrivate("privk", "pub").getPublicKeyFingerprint("pub", "pkfp");
            var publicKey = ic.get("pub");
            var pkfp = ic.get("pkfp");

            if ((typeof settingsRaw === "undefined" ? "undefined" : _typeof(settingsRaw)) === "object") {
                settingsRaw = JSON.stringify(settingsRaw);
            }
            var settingsEnc = ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
            var headers = {
                command: "update_settings",
                pkfpSource: pkfp
            };
            var body = {
                settings: settingsEnc
            };

            var request = new Message();
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

    }, {
        key: "uWereBooted",
        value: function uWereBooted(note, self) {
            console.log("Looks like I am being booted. Checking..");

            if (!Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, note)) {
                console.log("Probably it was a mistake");
                return;
            }

            self.session.metadata.status = "sealed";
            console.log("You have been booted");
            self.emit("u_booted", "You have been excluded from this channel.");
        }
    }, {
        key: "updateMetaOnNewMemberJoin",
        value: function updateMetaOnNewMemberJoin(message, self) {
            self.session.metadata = JSON.parse(message.body.metadata);
            self.emit("new_member_joined");
        }
    }, {
        key: "loginFail",
        value: function loginFail(response, self) {
            console.log("Emiting login fail... " + response.headers.error);
            self.emit("login_fail", response.headers.error);
        }
    }, {
        key: "initTopicFail",
        value: function initTopicFail(response, self) {
            console.log("Init topic fail: " + response.headers.error);
            self.emit("init_topic_error", response.headers.error);
        }
    }, {
        key: "unknownError",
        value: function unknownError(response, self) {
            console.log("Unknown request error: " + response.headers.response);
            self.emit("unknown_error", response.headers.error);
        }
    }, {
        key: "processInvalidResponse",
        value: function processInvalidResponse(response, self) {
            console.log("Received invalid server response");
            self.emit("invalid_response", response);
        }

        /**************************************************
         * =================== END  ===================== *
         **************************************************/

        /**************************************************
         * ========== PARTICIPANTS HANDLING   ============*
         **************************************************/

    }, {
        key: "addNewParticipant",
        value: function addNewParticipant(nickname, publicKey, residence, rights) {
            var ic = new iCrypto();
            ic.setRSAKey("pk", publicKey, "public").getPublicKeyFingerprint("pk", "fp");

            var participant = new Participant();
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

    }, {
        key: "uploadAttachments",
        value: function uploadAttachments(filesAttached, messageID, metaID) {
            var _this2 = this;

            return new Promise(function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
                    var self, filesProcessed, pkfp, privk, symk, residence, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, filesInfo;

                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    self = _this2;

                                    if (!(Worker === undefined)) {
                                        _context5.next = 4;
                                        break;
                                    }

                                    reject(null, "Client does not support web workers.");
                                    return _context5.abrupt("return");

                                case 4:
                                    filesProcessed = [];
                                    pkfp = self.session.publicKeyFingerprint;
                                    privk = self.session.privateKey;
                                    symk = self.session.metadata.sharedKey;
                                    residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;
                                    _iteratorNormalCompletion2 = true;
                                    _didIteratorError2 = false;
                                    _iteratorError2 = undefined;
                                    _context5.prev = 12;


                                    for (_iterator2 = filesAttached[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        file = _step2.value;

                                        console.log("Calling worker function");
                                        filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence));
                                    }

                                    _context5.next = 20;
                                    break;

                                case 16:
                                    _context5.prev = 16;
                                    _context5.t0 = _context5["catch"](12);
                                    _didIteratorError2 = true;
                                    _iteratorError2 = _context5.t0;

                                case 20:
                                    _context5.prev = 20;
                                    _context5.prev = 21;

                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                    }

                                case 23:
                                    _context5.prev = 23;

                                    if (!_didIteratorError2) {
                                        _context5.next = 26;
                                        break;
                                    }

                                    throw _iteratorError2;

                                case 26:
                                    return _context5.finish(23);

                                case 27:
                                    return _context5.finish(20);

                                case 28:
                                    _context5.prev = 28;
                                    _context5.next = 31;
                                    return Promise.all(filesProcessed);

                                case 31:
                                    filesInfo = _context5.sent;

                                    resolve(filesInfo);
                                    _context5.next = 39;
                                    break;

                                case 35:
                                    _context5.prev = 35;
                                    _context5.t1 = _context5["catch"](28);

                                    console.log("ERROR DURING UPLOAD ATTACHMENTS: " + _context5.t1);
                                    reject(_context5.t1);

                                case 39:
                                case "end":
                                    return _context5.stop();
                            }
                        }
                    }, _callee5, _this2, [[12, 16, 20, 28], [21,, 23, 27], [28, 35]]);
                }));

                return function (_x10, _x11) {
                    return _ref5.apply(this, arguments);
                };
            }());
        }

        /**
         * Uploads a single attachment to the island
         * Calculates hash of unencrypted and encrypted file
         * signs both hashes
         * resolves with fileInfo object
         * @returns {Promise<any>}
         */

    }, {
        key: "uploadAttachmentWithWorker",
        value: function uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence) {
            return new Promise(function (resolve, reject) {
                console.log("!!!Initializing worker...");
                var uploader = new Worker("/js/uploaderWorker.js");

                var uploadComplete = function uploadComplete(msg) {
                    var fileInfo = new AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
                    uploader.terminate();
                    resolve(fileInfo);
                };

                var uploadProgress = function uploadProgress(msg) {
                    //TODO implement event handling

                };

                var uploadError = function uploadError(msg) {
                    uploader.terminate();
                    self.emit("upload_error", msg.data);
                    reject(data);
                };

                var messageHandlers = {
                    "upload_complete": uploadComplete,
                    "upload_progress": uploadProgress,
                    "upload_error": uploadError
                };

                uploader.onmessage = function (ev) {
                    var msg = ev.data;
                    messageHandlers[msg.result](msg.data);
                };

                uploader.postMessage({
                    command: "upload",
                    attachment: file,
                    pkfp: pkfp,
                    privk: privk,
                    symk: symk
                });
            });
        }

        /**
         * Downloads requested attachment
         *
         * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
         *          Must contain all required info including hashes, signatures, and link
         */

    }, {
        key: "downloadAttachment",
        value: function downloadAttachment(fileInfo) {
            var _this3 = this;

            return new Promise(function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
                    var self, privk, parsedFileInfo, fileOwnerPublicKey, err, myPkfp, fileData;
                    return regeneratorRuntime.wrap(function _callee6$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    self = _this3;
                                    privk = self.session.privateKey; //To decrypt SYM key

                                    //Getting public key of

                                    parsedFileInfo = JSON.parse(fileInfo);
                                    fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;


                                    if (Worker === undefined) {
                                        err = "Worker is not defined.Cannot download file.";

                                        console.log(err);
                                        reject(err);
                                    }
                                    myPkfp = self.session.publicKeyFingerprint;
                                    _context6.next = 8;
                                    return self.downloadAttachmentWithWorker(fileInfo, myPkfp, privk, fileOwnerPublicKey);

                                case 8:
                                    fileData = _context6.sent;

                                    self.emit("download_complete", { fileInfo: fileInfo, fileData: fileData });

                                case 10:
                                case "end":
                                    return _context6.stop();
                            }
                        }
                    }, _callee6, _this3);
                }));

                return function (_x12, _x13) {
                    return _ref6.apply(this, arguments);
                };
            }());
        }
    }, {
        key: "downloadAttachmentWithWorker",
        value: function downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk) {
            var _this4 = this;

            return new Promise(function () {
                var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
                    var downloader, downloadComplete, messageHandlers, processMessage;
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                        while (1) {
                            switch (_context7.prev = _context7.next) {
                                case 0:
                                    downloader = new Worker("/js/downloaderWorker.js");

                                    downloadComplete = function downloadComplete(fileBuffer) {
                                        resolve(fileBuffer);
                                        downloader.terminate();
                                    };

                                    messageHandlers = {
                                        "download_complete": downloadComplete
                                    };

                                    processMessage = function processMessage(msg) {
                                        messageHandlers[msg.result](msg.data);
                                    };

                                    downloader.onmessage = function (ev) {
                                        processMessage(ev.data);
                                    };

                                    downloader.postMessage({
                                        command: "download",
                                        data: {
                                            fileInfo: fileInfo,
                                            myPkfp: myPkfp,
                                            privk: privk,
                                            pubk: ownerPubk
                                        }
                                    });

                                case 6:
                                case "end":
                                    return _context7.stop();
                            }
                        }
                    }, _callee7, _this4);
                }));

                return function (_x14, _x15) {
                    return _ref7.apply(this, arguments);
                };
            }());
        }

        /**************************************************
         * =================== END  ===================== *
         **************************************************/

        /**************************************************
         * ================ MESSAGE HANDLING  ============*
         **************************************************/

    }, {
        key: "prepareMessage",
        value: function prepareMessage(messageContent, recipientPkfp) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var self = _this5;
                console.log("Preparing message: " + messageContent);
                if (!self.isLoggedIn()) {
                    self.emit("login_required");
                    reject();
                }
                //Preparing chat message
                var chatMessage = new ChatMessage();
                chatMessage.header.metadataID = _this5.session.metadata.id;
                chatMessage.header.author = _this5.session.publicKeyFingerprint;
                chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
                chatMessage.header.private = !!recipientPkfp;
                chatMessage.header.nickname = self.session.settings.nickname;
                chatMessage.body = messageContent;
                resolve(chatMessage);
            });
        }

        /**
         * Sends the message.
         *
         * @param {string} messageContent
         * @param {array} filesAttached Array of attached files. Should be taken straight from input field
         * @returns {Promise<any>}
         */

    }, {
        key: "shoutMessage",
        value: function shoutMessage(messageContent, filesAttached) {
            var _this6 = this;

            return new Promise(function () {
                var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(resolve, reject) {
                    var self, attachmentsInfo, metaID, chatMessage, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, att, message, userPrivateKey;

                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                        while (1) {
                            switch (_context8.prev = _context8.next) {
                                case 0:
                                    self = _this6;
                                    attachmentsInfo = void 0;
                                    metaID = self.session.metadata.id;
                                    _context8.next = 5;
                                    return self.prepareMessage(messageContent);

                                case 5:
                                    chatMessage = _context8.sent;

                                    if (!(filesAttached && filesAttached.length > 0)) {
                                        _context8.next = 29;
                                        break;
                                    }

                                    _context8.next = 9;
                                    return self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);

                                case 9:
                                    attachmentsInfo = _context8.sent;
                                    _iteratorNormalCompletion3 = true;
                                    _didIteratorError3 = false;
                                    _iteratorError3 = undefined;
                                    _context8.prev = 13;

                                    for (_iterator3 = attachmentsInfo[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                        att = _step3.value;

                                        chatMessage.addAttachmentInfo(att);
                                    }
                                    _context8.next = 21;
                                    break;

                                case 17:
                                    _context8.prev = 17;
                                    _context8.t0 = _context8["catch"](13);
                                    _didIteratorError3 = true;
                                    _iteratorError3 = _context8.t0;

                                case 21:
                                    _context8.prev = 21;
                                    _context8.prev = 22;

                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }

                                case 24:
                                    _context8.prev = 24;

                                    if (!_didIteratorError3) {
                                        _context8.next = 27;
                                        break;
                                    }

                                    throw _iteratorError3;

                                case 27:
                                    return _context8.finish(24);

                                case 28:
                                    return _context8.finish(21);

                                case 29:

                                    chatMessage.encryptMessage(_this6.session.metadata.sharedKey);
                                    chatMessage.sign(_this6.session.privateKey);

                                    //Preparing request
                                    message = new Message();

                                    message.headers.pkfpSource = _this6.session.publicKeyFingerprint;
                                    message.headers.command = "broadcast_message";
                                    message.body.message = chatMessage.toBlob();
                                    userPrivateKey = _this6.session.privateKey;

                                    message.signMessage(userPrivateKey);
                                    //console.log("Message ready: " + JSON.stringify(message));
                                    _this6.chatSocket.emit("request", message);
                                    resolve();

                                case 39:
                                case "end":
                                    return _context8.stop();
                            }
                        }
                    }, _callee8, _this6, [[13, 17, 21, 29], [22,, 24, 28]]);
                }));

                return function (_x16, _x17) {
                    return _ref8.apply(this, arguments);
                };
            }());
        }
    }, {
        key: "whisperMessage",
        value: function whisperMessage(pkfp, messageContent, filesAttached) {
            var _this7 = this;

            return new Promise(function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
                    var self, chatMessage, keys, message, userPrivateKey;
                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    self = _this7;
                                    _context9.next = 3;
                                    return self.prepareMessage(messageContent, pkfp);

                                case 3:
                                    chatMessage = _context9.sent;


                                    //Will be enabled in the next version

                                    keys = [self.session.publicKey];

                                    keys.push(self.session.metadata.participants[pkfp].publicKey);
                                    chatMessage.encryptPrivateMessage(keys);
                                    chatMessage.sign(_this7.session.privateKey);

                                    //Preparing request
                                    message = new Message();

                                    message.headers.pkfpSource = _this7.session.publicKeyFingerprint;
                                    message.headers.pkfpDest = pkfp;
                                    message.headers.command = "send_message";
                                    message.headers.private = true;
                                    message.body.message = chatMessage.toBlob();
                                    userPrivateKey = _this7.session.privateKey;

                                    message.signMessage(userPrivateKey);
                                    _this7.chatSocket.emit("request", message);
                                    resolve();

                                case 18:
                                case "end":
                                    return _context9.stop();
                            }
                        }
                    }, _callee9, _this7);
                }));

                return function (_x18, _x19) {
                    return _ref9.apply(this, arguments);
                };
            }());
        }
    }, {
        key: "processIncomingMessage",
        value: function processIncomingMessage(data, self) {
            console.log("Received incoming message! ");
            var message = data.message;
            var symKey = data.key ? ChatUtility.privateKeyDecrypt(data.key, self.session.privateKey) : self.session.metadata.sharedKey;
            var chatMessage = new ChatMessage(message.body.message);
            var author = self.session.metadata.participants[chatMessage.header.author];
            if (!author) {
                throw "Author is not found in the current version of metadata!";
            }
            if (!chatMessage.verify(author.publicKey)) {
                self.emit("error", "Received message with invalid signature!");
            }
            if (!chatMessage.header.private && !data.key && chatMessage.header.metadataID !== self.session.metadata.id) {
                throw "current metadata cannot decrypt this message";
            }

            if (chatMessage.header.private) {
                chatMessage.decryptPrivateMessage(self.session.privateKey);
            } else {
                chatMessage.decryptMessage(symKey);
            }
            var authorNickname = chatMessage.header.nickname;
            var authorPkfp = chatMessage.header.author;
            var authorExistingName = self.getMemberNickname(authorPkfp);
            if (!this.nicknameAssigned(authorPkfp) || authorNickname !== self.getMemberNickname(authorPkfp)) {
                self.setMemberNickname(authorPkfp, authorNickname);
                self.saveClientSettings();
                self.createServiceRecordOnMemberNicknameChange(authorExistingName, authorNickname, authorPkfp);
            }
            self.emit("chat_message", chatMessage);
        }
    }, {
        key: "nicknameAssigned",
        value: function nicknameAssigned(pkfp) {
            try {
                return this.session.settings.membersData[pkfp].hasOwnProperty("nickname");
            } catch (err) {
                return false;
            }
        }
    }, {
        key: "messageSendSuccess",
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(response, self) {
                var chatMessage, author;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                chatMessage = new ChatMessage(response.body.message);
                                author = self.session.metadata.participants[chatMessage.header.author];

                                if (author) {
                                    _context10.next = 4;
                                    break;
                                }

                                throw "Author is not found in the current version of metadata!";

                            case 4:
                                if (!chatMessage.verify(author.publicKey)) {
                                    self.emit("error", "Received message with invalid signature!");
                                }

                                if (!(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id)) {
                                    _context10.next = 7;
                                    break;
                                }

                                throw "current metadata cannot decrypt this message";

                            case 7:

                                if (chatMessage.header.private) {
                                    chatMessage.decryptPrivateMessage(self.session.privateKey);
                                } else {
                                    chatMessage.decryptMessage(self.session.metadata.sharedKey);
                                }

                                self.emit("send_success", chatMessage);

                            case 9:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function messageSendSuccess(_x20, _x21) {
                return _ref10.apply(this, arguments);
            }

            return messageSendSuccess;
        }()
    }, {
        key: "messageSendFail",
        value: function messageSendFail(response, self) {
            var messageID = JSON.parse(response).body.message.header.id;
            self.emit("send_fail", self.outgoingMessageQueue[messageID]);
            delete self.outgoingMessageQueue[messageID];
        }
    }, {
        key: "isLoggedIn",
        value: function isLoggedIn() {
            return this.session && this.session.status === "active";
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

    }, {
        key: "requestInvite",
        value: function requestInvite() {
            var ic = new iCrypto();
            ic.createNonce("n").bytesToHex("n", "nhex");
            var request = new Message();
            var myNickNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.nickname, this.session.metadata.topicAuthority.publicKey);
            var topicNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.topicName, this.session.metadata.topicAuthority.publicKey);
            request.headers.command = "request_invite";
            request.headers.pkfpSource = this.session.publicKeyFingerprint;
            request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
            request.body.nickname = myNickNameEncrypted;
            request.body.topicName = topicNameEncrypted;
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "syncInvites",
        value: function syncInvites() {
            var ic = new iCrypto();
            ic.createNonce("n").bytesToHex("n", "nhex");
            var request = new Message();
            request.headers.command = "sync_invites";
            request.headers.pkfpSource = this.session.publicKeyFingerprint;
            request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
            request.headers.nonce = ic.get("nhex");
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "syncInvitesSuccess",
        value: function syncInvitesSuccess(response, self) {
            if (Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, response)) {
                self.updatePendingInvites(response.body.invites);
                self.emit(response.headers.response);
            } else {
                throw "invalid message";
            }
        }
    }, {
        key: "generateInvite",
        value: function generateInvite() {
            if (!this.session || !(this.session.status === "active")) {
                this.emit("login_required");
                return;
            }
            var ic = new iCrypto();
            ic.createNonce("iid").bytesToHex('iid', "iidhex");
            var body = {
                requestID: ic.get("iidhex"),
                pkfp: this.session.publicKeyFingerprint
            };

            var request = new Message();
            request.headers.command = "request_invite";
            request.set("body", body);
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "requestInviteError",
        value: function requestInviteError(response, self) {
            console.log("Request invite error received: " + response.headers.error);
            self.emit("request_invite_error", response.headers.error);
        }
    }, {
        key: "syncInvitesError",
        value: function syncInvitesError(response, self) {
            console.log("Sync invites error received: " + response.headers.error);
            self.emit("sync_invites_error", response.headers.error);
        }
    }, {
        key: "processInviteCreated",
        value: function processInviteCreated(response, self) {
            self.updatePendingInvites(response.body.userInvites);
            self.emit("request_invite_success", response.body.inviteCode);
        }
    }, {
        key: "updateSetInviteeName",
        value: function updateSetInviteeName(inviteID, name) {
            this.session.settings.invites[inviteID].name = name;
            this.saveClientSettings(this.session.settings, this.session.privateKey);
        }
    }, {
        key: "saveInviteSuccess",
        value: function saveInviteSuccess(response, self) {
            self.updatePendingInvites(response.body.userInvites);
            self.emit("invite_generated", self.session.pendingInvites[response.body.inviteID]);
        }
    }, {
        key: "updateInviteSuccess",
        value: function updateInviteSuccess(response, self) {
            self.updatePendingInvites(response.body.invites);
            self.emit("invite_updated");
        }

        /**
         * Given a dictionary of encrypted pending invites from history
         * decrypts them and adds to the current session
         * @param invitesUpdatedEncrypted
         */

    }, {
        key: "updatePendingInvites",
        value: function updatePendingInvites(userInvites) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = userInvites[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var i = _step4.value;

                    if (!this.session.settings.invites.hasOwnProperty(i)) {
                        this.session.settings.invites[i] = {};
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = Object.keys(this.session.settings.invites)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _i2 = _step5.value;

                    if (!userInvites.includes(_i2)) {
                        delete this.session.settings.invites[_i2];
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.saveClientSettings(this.session.settings, this.session.privateKey);
        }
    }, {
        key: "settingsInitInvites",
        value: function settingsInitInvites() {
            this.session.settings.invites = {};
            this.saveClientSettings(this.session.settings, this.session.privateKey);
        }
    }, {
        key: "deleteInvite",
        value: function deleteInvite(id) {
            console.log("About to delete invite: " + id);
            var request = new Message();
            request.headers.command = "del_invite";
            request.headers.pkfpSource = this.session.publicKeyFingerprint;
            request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
            var body = {
                invite: id
            };
            request.set("body", body);
            request.signMessage(this.session.privateKey);
            this.chatSocket.emit("request", request);
        }
    }, {
        key: "delInviteSuccess",
        value: function delInviteSuccess(response, self) {
            console.log("Del invite success! ");
            self.updatePendingInvites(response.body.invites);
            self.emit("del_invite_success");
        }
    }, {
        key: "getPendingInvites",
        value: function getPendingInvites() {
            console.log("Del invite fail! ");
            self.emit("del_invite_fail");
        }
    }, {
        key: "inviteRequestValid",
        value: function inviteRequestValid(inviterResidence, inviterID, inviteID) {
            return inviteID && inviteID && this.onionValid(inviterResidence);
        }

        /**************************************************
         * =================== END  ===================== *
         **************************************************/

        /**************************************************
         * ====== ISLAND CONNECTION HANDLING  ============*
         **************************************************/

    }, {
        key: "establishIslandConnection",
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                var _this8 = this;

                var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "chat";
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                return _context11.abrupt("return", new Promise(function (resolve, reject) {
                                    if (option === "chat") {
                                        if (_this8.chatSocket && _this8.chatSocket.connected) {
                                            resolve();
                                            return;
                                        }
                                        _this8.chatSocket = io('/chat', {
                                            reconnection: false,
                                            forceNew: true,
                                            transports: ['websocket', "longpoll"],
                                            pingInterval: 10000,
                                            pingTimeout: 5000
                                        });
                                        _this8.chatSocket.on('connect', function () {
                                            _this8.finishSocketSetup();
                                            console.log("Island connection established");
                                            _this8.islandConnectionStatus = true;
                                            _this8.emit("connected_to_island");
                                            resolve();
                                        });

                                        _this8.chatSocket.on("disconnect", function () {
                                            console.log("Island disconnected.");
                                            _this8.islandConnectionStatus = false;
                                            _this8.emit("disconnected_from_island");
                                        });

                                        _this8.chatSocket.on('connect_error', function (err) {
                                            console.log('Connection Failed');
                                            reject(err);
                                        });
                                    } else if (option === "file") {
                                        console.log("Connecting to file socket");
                                        if (_this8.fileSocket && _this8.fileSocket.connected) {
                                            console.log("File socket already connected! returning");
                                            resolve();
                                            return;
                                        }

                                        _this8.fileSocket = io('/file', {
                                            'reconnection': true,
                                            'forceNew': true,
                                            'reconnectionDelay': 1000,
                                            'reconnectionDelayMax': 5000,
                                            'reconnectionAttempts': 5
                                        });

                                        _this8.fileSocket.on("connect", function () {
                                            _this8.setupFileTransferListeners();
                                            console.log("File transfer connectiopn established");
                                            resolve();
                                        });

                                        _this8.fileSocket.on("connect_error", function (err) {
                                            console.log('Island connection failed: ' + err.message);
                                            reject(err);
                                        });
                                    }
                                }));

                            case 1:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function establishIslandConnection() {
                return _ref11.apply(this, arguments);
            }

            return establishIslandConnection;
        }()
    }, {
        key: "terminateIslandConnection",
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.prev = 0;

                                if (this.chatSocket && this.chatSocket.connected) {
                                    this.chatSocket.disconnect();
                                }
                                _context12.next = 7;
                                break;

                            case 4:
                                _context12.prev = 4;
                                _context12.t0 = _context12["catch"](0);
                                throw "Error terminating connection with island: " + _context12.t0;

                            case 7:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this, [[0, 4]]);
            }));

            function terminateIslandConnection() {
                return _ref12.apply(this, arguments);
            }

            return terminateIslandConnection;
        }()

        //TODO implement method

    }, {
        key: "setupFileTransferListeners",
        value: function setupFileTransferListeners() {}
    }, {
        key: "finishSocketSetup",
        value: function finishSocketSetup() {
            this.initChatListeners();
        }
    }, {
        key: "initChatListeners",
        value: function initChatListeners() {
            var _this9 = this;

            this.chatSocket.on('message', function (message) {

                console.log(JSON.stringify(message));
            });

            this.chatSocket.on('request', function (request) {
                console.log("Received new incoming request");
                _this9.processRequest(request, _this9);
            });

            this.chatSocket.on("response", function (response) {
                _this9.processResponse(response, _this9);
            });

            this.chatSocket.on("service", function (message) {
                _this9.processServiceMessage(message, _this9);
            });

            this.chatSocket.on("service_record", function (message) {
                console.log("Got SERVICE RECORD!");
                _this9.processServiceRecord(message, _this9);
            });

            this.chatSocket.on("message", function (message) {
                _this9.processIncomingMessage(message, _this9);
            });

            this.chatSocket.on('reconnect', function (attemptNumber) {
                console.log("Successfull reconnect client");
            });

            this.chatSocket.on('metadata_update', function (meta) {
                _this9.processMetadataUpdate(meta);
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

    }, {
        key: "broadcastMetadataUpdate",
        value: function broadcastMetadataUpdate(metadata) {
            var _this10 = this;

            var newMetadata = this.session.metadata.toBlob(true);
            var updateRequest = {
                myBlob: newMetadata,
                topicID: this.session.metadata.topicID,
                publicKeyFingerprint: this.session.publicKeyFingerprint,
                recipients: {}
            };

            Object.keys(this.session.metadata.participants).forEach(function (key) {
                //TODO encrypt
                var encryptedMeta = newMetadata;
                var fp = _this10.session.metadata.participants[key].publicKeyFingerprint;
                var residence = _this10.session.metadata.participants[key].residence;
                updateRequest.recipients[key] = {
                    residence: residence,
                    metadata: newMetadata
                };
            });

            this.chatSocket.emit("broadcast_metadata_update", updateRequest);
        }

        //SHIT CODE

    }, {
        key: "processMetadataUpdate",
        value: function processMetadataUpdate(message, self) {
            if (message.headers.event === "new_member_joined") {
                self.processNewMemberJoined(message, self);
            } else if (message.headers.event === "member_booted") {
                self.noteParticipantBooted(message, self);
            } else if (message.headers.event === "u_booted") {
                this.uWereBooted(message, self);
            } else if (message.headers.event === "meta_sync") {
                self.processMetaSync(message, self);
            }
        }
    }, {
        key: "processMetaSync",
        value: function processMetaSync(message, self) {
            if (!self.session) {
                return;
            }
            console.log("Processing metadata sync message");
            if (message.body.metadata) {
                self._updateMetadata(Metadata.parseMetadata(message.body.metadata));
                self.emit("metadata_updated");
            }
        }
    }, {
        key: "processNewMemberJoined",
        value: function processNewMemberJoined(request, self) {
            if (!self.session) {
                return;
            }
            var newMemberPkfp = request.body.pkfp;
            var newMemberNickname = request.body.nickname;
            self._updateMetadata(Metadata.parseMetadata(request.body.metadata));
            self.addNewMemberToSettings(newMemberPkfp);
            self.setMemberNickname(newMemberPkfp, newMemberNickname);
            self.saveClientSettings();
            self.emit("new_member_joined");
        }
    }, {
        key: "_updateMetadata",
        value: function _updateMetadata(metadata) {
            var self = this;
            var sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
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

    }, {
        key: "myNicknameUpdate",
        value: function myNicknameUpdate(newNickName) {
            if (!newNickName) {
                return;
            }
            newNickName = newNickName.trim();
            var settings = this.session.settings;
            if (settings.nickname === newNickName) {
                return;
            }
            settings.nickname = newNickName;
            this.setMemberNickname(this.session.publicKeyFingerprint, newNickName);
            this.saveClientSettings(settings, this.session.privateKey);
            this.broadcastNameChange();
        }
    }, {
        key: "topicNameUpdate",
        value: function topicNameUpdate(newTopicName) {
            if (!newTopicName) {
                return;
            }
            newTopicName = newTopicName.trim();
            var settings = this.session.settings;
            if (settings.topicName === newTopicName) {
                return;
            }
            settings.topicName = newTopicName;
            this.saveClientSettings(settings, this.session.privateKey);
        }
        /**************************************************
         * =================== END  ===================== *
         **************************************************/

        /**************************************************
         * ========== UTILS   ============*
         **************************************************/

    }, {
        key: "signBlob",
        value: function signBlob(privateKey, blob) {
            var ic = new iCrypto();
            ic.setRSAKey("pk", privateKey, "private").addBlob("b", blob).privateKeySign("b", "pk", "sign");
            return ic.get("sign");
        }
    }, {
        key: "verifyBlob",
        value: function verifyBlob(publicKey, sign, blob) {
            var ic = new iCrypto();
            ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", sign).addBlob("b", blob).publicKeyVerify("b", "sign", "pubk", "v");
            return ic.get("v");
        }

        /**
         * Generates .onion address and RSA1024 private key for it
         */

    }, {
        key: "generateOnionService",
        value: function generateOnionService() {
            var pkraw = forge.rsa.generateKeyPair(1024);
            var pkfp = forge.pki.getPublicKeyFingerprint(pkraw.publicKey, { encoding: 'hex', md: forge.md.sha1.create() });
            var pem = forge.pki.privateKeyToPem(pkraw.privateKey);

            if (pkfp.length % 2 !== 0) {
                // odd number of characters
                pkfp = '0' + pkfp;
            }
            var bytes = [];
            for (var i = 0; i < pkfp.length / 2; i = i + 2) {
                bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
            }

            var onion = base32.encode(bytes).toLowerCase() + ".onion";
            return { onion: onion, privateKey: pem };
        }
    }, {
        key: "onionAddressFromPrivateKey",
        value: function onionAddressFromPrivateKey(privateKey) {
            var ic = new iCrypto();
            ic.setRSAKey("privk", privateKey, "private").publicFromPrivate("privk", "pubk");
            var pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"));
            var pkfp = forge.pki.getPublicKeyFingerprint(pkraw, { encoding: 'hex', md: forge.md.sha1.create() });

            if (pkfp.length % 2 !== 0) {
                pkfp = '0' + pkfp;
            }
            var bytes = [];
            for (var i = 0; i < pkfp.length / 2; i = i + 2) {
                bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
            }

            return base32.encode(bytes).toLowerCase() + ".onion";
        }
    }, {
        key: "extractFromInvite",
        value: function extractFromInvite(inviteString64) {
            var thingToExtract = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "all";

            var ic = new iCrypto();
            ic.addBlob("is64", inviteString64).base64Decode("is64", "is");
            var inviteParts = ic.get("is").split("/");

            var things = {
                "hsid": inviteParts[0],
                "pkfp": inviteParts[1],
                "inviteCode": inviteParts[2],
                "all": inviteParts
            };
            try {
                return things[thingToExtract];
            } catch (err) {
                throw "Invalid parameter thingToExtract";
            }
        }
    }, {
        key: "onionValid",
        value: function onionValid(candidate) {
            var pattern = /^[a-z2-7]{16}\.onion$/;
            return pattern.test(candidate);
        }
    }, {
        key: "getMyResidence",
        value: function getMyResidence() {
            return this.session.metadata.participants[this.session.publicKeyFingerprint].residence;
        }

        /**************************************************
         * =================== END  ===================== *
         **************************************************/

    }]);

    return ChatClient;
}();

var Metadata = function () {
    function Metadata() {
        _classCallCheck(this, Metadata);
    }

    _createClass(Metadata, null, [{
        key: "parseMetadata",
        value: function parseMetadata(blob) {
            if (typeof blob === "string") {
                return JSON.parse(blob);
            } else {
                return blob;
            }
        }
    }, {
        key: "extractSharedKey",
        value: function extractSharedKey(pkfp, privateKey, metadata) {
            var keyCipher = metadata.body.participants[pkfp].key;
            var ic = new iCrypto();
            ic.addBlob("symcip", keyCipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex");
            return ic.get("sym");
        }
    }, {
        key: "isMetadataValid",
        value: function isMetadataValid(metadata, taPublicKey) {}
    }]);

    return Metadata;
}();

var Participant = function () {
    _createClass(Participant, null, [{
        key: "objectValid",
        value: function objectValid(obj) {
            if (typeof obj === "string") {
                return false;
            }

            for (var i = 0; i < Participant.properties.length; ++i) {
                if (!obj.hasOwnProperty(Participant.properties[i])) {
                    return false;
                }
            }
            return Object.keys(obj).length === Participant.properties.length;
        }
    }]);

    function Participant(blob) {
        _classCallCheck(this, Participant);

        if (blob) {
            this.parseBlob(blob);
        }
    }

    _createClass(Participant, [{
        key: "toBlob",
        value: function toBlob() {
            var stringify = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (!this.readyForExport()) {
                throw "Object participant has some properties uninitialized";
            }
            var result = {};
            for (var i = 0; i < Participant.properties.length; ++i) {
                var key = Participant.properties[i];
                var value = this[Participant.properties[i]];
                console.log("Key: " + key + "; Value: " + value);
                result[Participant.properties[i]] = this[Participant.properties[i]];
            }
            return stringify ? JSON.stringify(result) : result;
        }
    }, {
        key: "parseBlob",
        value: function parseBlob(blob) {
            if (!blob) {
                throw "missing required parameter";
            }

            if (typeof blob === "string") {
                blob = JSON.parse(blob);
            }

            if (!this.objectValid(blob)) {
                throw "Participant blob is invalid";
            }

            for (var i = 0; i < Participant.properties.length; ++i) {
                this[Participant.properties[i]] = blob[Participant.properties[i]];
            }
        }
    }, {
        key: "keyExists",
        value: function keyExists(key) {
            if (!key) throw "keyExists: Missing required arguments";
            return Object.keys(this).includes(key.toString());
        }
    }, {
        key: "readyForExport",
        value: function readyForExport() {
            for (var i = 0; i < Participant.properties; ++i) {
                if (!this[Participant.properties[i]]) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: "get",
        value: function get(name) {
            if (this.keyExists(name)) return this[name];
            throw "Property not found";
        }
    }, {
        key: "set",
        value: function set(name, value) {

            if (!Participant.properties.includes(name)) {
                throw 'Participant: invalid property "' + name + '"';
            }

            this[name] = value;
        }
    }]);

    return Participant;
}();

Participant.properties = ["nickname", "publicKey", "publicKeyFingerprint", "residence", "rights"];

var Invite = function () {
    _createClass(Invite, null, [{
        key: "objectValid",
        value: function objectValid(obj) {
            if (typeof obj === "string") {
                return false;
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = Invite.properties[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var i = _step6.value;

                    if (!obj.hasOwnProperty(i)) {
                        return false;
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return true;
        }
    }, {
        key: "decryptInvite",
        value: function decryptInvite(cipher, privateKey) {
            var symLengthEncoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

            var ic = new iCrypto();
            var symlength = parseInt(cipher.substr(cipher.length - symLengthEncoding));
            var symkcip = cipher.substring(cipher.length - symlength - symLengthEncoding, cipher.length - symLengthEncoding);
            var payloadcip = cipher.substring(0, cipher.length - symlength - symLengthEncoding);
            ic.addBlob("symciphex", symkcip).hexToBytes("symciphex", "symcip").addBlob("plcip", payloadcip).setRSAKey("privk", privateKey, "private").privateKeyDecrypt("symcip", "privk", "sym").AESDecrypt("plcip", "sym", "pl", true);
            return JSON.parse(ic.get("pl"));
        }
    }, {
        key: "setInviteeName",
        value: function setInviteeName(invite, name) {
            invite.inviteeName = name;
        }
    }]);

    function Invite() {
        var onionAddress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.pRequired();
        var pubKeyFingerprint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.pRequired();
        var hsPrivateKey = arguments[2];

        _classCallCheck(this, Invite);

        var ic = new iCrypto();
        ic.createNonce("n").bytesToHex("n", "id");
        this.set('onionAddress', onionAddress);
        this.set('pkfp', pubKeyFingerprint);
        this.set('inviteID', ic.get('id'));
        if (hsPrivateKey) {
            var _ic = new iCrypto();
            _ic.setRSAKey("k", hsPrivateKey, "private");
            this.hsPrivateKey = _ic.get("k");
        }
    }

    _createClass(Invite, [{
        key: "toBlob",
        value: function toBlob(encoding) {
            var result = this.get("onionAddress") + "/" + this.get("pkfp") + "/" + this.get("inviteID");
            if (encoding) {
                var ic = new iCrypto();
                if (!ic.encoders.hasOwnProperty(encoding)) {
                    throw "WRONG ENCODING";
                }
                ic.addBlob("b", result).encode("b", encoding, "bencoded");
                result = ic.get("bencoded");
            }
            return result;
        }
    }, {
        key: "stringifyAndEncrypt",
        value: function stringifyAndEncrypt(publicKey) {
            if (!publicKey || !Invite.objectValid(this)) {
                throw "Error at stringifyAndEncrypt: the object is invalid or public key is not provided";
            }
            var ic = new iCrypto();

            var invite = {
                inviteCode: this.toBlob("base64"),
                hsPrivateKey: this.hsPrivateKey
            };

            if (this.inviteeName) {
                invite.inviteeName = this.inviteeName;
            }

            ic.addBlob("invite", JSON.stringify(invite)).sym.createKey("sym").setRSAKey("pubk", publicKey, "public").AESEncrypt("invite", "sym", "invitecip", true).publicKeyEncrypt("sym", "pubk", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symlength").merge(["invitecip", "symcip", "symlength"], "res");
            return ic.get("res");
        }
    }, {
        key: "get",
        value: function get(name) {
            if (this.keyExists(name)) return this[name];
            throw "Property not found";
        }
    }, {
        key: "set",
        value: function set(name, value) {
            if (!Invite.properties.includes(name)) {
                throw 'Invite: invalid property "' + name + '"';
            }
            this[name] = value;
        }
    }, {
        key: "keyExists",
        value: function keyExists(key) {
            if (!key) throw "keyExists: Missing required arguments";
            return Object.keys(this).includes(key.toString());
        }
    }, {
        key: "pRequired",
        value: function pRequired() {
            var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Invite";

            throw functionName + ": missing required parameter!";
        }
    }], [{
        key: "constructFromExisting",
        value: function constructFromExisting(invite) {
            var ic = new iCrypto();
            ic.addBlob("i", invite.inviteCode).base64Decode("i", "ir");

            var onion = ic.get("ir").split("/")[0];

            var newInvite = new Invite(onion, chat.session.publicKeyFingerprint, invite.hsPrivateKey);
            newInvite.set('inviteID', invite.inviteID);
            return newInvite;
        }
    }]);

    return Invite;
}();

Invite.properties = ["onionAddress", "hsPrivateKey", "pkfp", "inviteID"];

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

var Message = function () {
    function Message(request) {
        _classCallCheck(this, Message);

        if (typeof request === "string") {
            request = JSON.parse(request);
        }
        this.headers = request ? this.copyHeaders(request.headers) : {
            command: "",
            response: ""
        };
        this.body = request ? request.body : {};
        this.signature = request ? request.signature : "";
    }

    _createClass(Message, [{
        key: "setError",
        value: function setError(error) {
            this.headers.error = error || "Unknown error";
        }
    }, {
        key: "setResponse",
        value: function setResponse(response) {
            this.headers.response = response;
        }
    }, {
        key: "copyHeaders",
        value: function copyHeaders(headers) {
            var result = {};
            var keys = Object.keys(headers);
            for (var i = 0; i < keys.length; ++i) {
                result[keys[i]] = headers[keys[i]];
            }
            return result;
        }
    }, {
        key: "signMessage",
        value: function signMessage(privateKey) {
            var ic = new iCrypto();
            var requestString = JSON.stringify(this.headers) + JSON.stringify(this.body);
            ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
            this.signature = ic.get("sign");
        }
    }, {
        key: "setSource",
        value: function setSource(pkfp) {
            this.headers.pkfpSource = pkfp;
        }
    }, {
        key: "setDest",
        value: function setDest(pkfp) {
            this.headers.pkfpDest = pkfp;
        }
    }, {
        key: "setCommand",
        value: function setCommand(command) {
            this.headers.command = command;
        }
    }, {
        key: "addNonce",
        value: function addNonce() {
            var ic = new iCrypto();
            ic.createNonce("n").bytesToHex("n", "nhex");
            this.headers.nonce = ic.get("nhex");
        }
    }, {
        key: "get",
        value: function get(name) {
            if (this.keyExists(name)) return this[name];
            throw "Property not found";
        }
    }, {
        key: "set",
        value: function set(name, value) {
            if (!Message.properties.includes(name)) {
                throw 'Invite: invalid property "' + name + '"';
            }
            this[name] = value;
        }
    }], [{
        key: "verifyMessage",
        value: function verifyMessage(publicKey, message) {
            var ic = new iCrypto();
            var requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
            ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", message.signature).hexToBytes('sign', "signraw").addBlob("b", requestString);
            ic.publicKeyVerify("b", "sign", "pubk", "v");
            return ic.get("v");
        }
    }]);

    return Message;
}();

Message.properties = ["headers", "body", "signature"];

/**
 * Represents chat message
 * Signature hashes only header + body of the message
 *
 * Recipient:
 * */

var ChatMessage = function () {
    function ChatMessage(blob) {
        _classCallCheck(this, ChatMessage);

        if (typeof blob === "string") {
            blob = JSON.parse(blob);
        }

        this.signature = blob ? blob.signature : "";
        this.header = blob ? blob.header : {
            id: this.generateNewID(),
            timestamp: new Date(),
            metadataID: "",
            author: "",
            nickname: "", //AUTHOR PKFP
            recipient: "all" //RCIPIENT PKFP
        };
        this.body = blob ? blob.body : "";
        this.attachments = blob ? blob.attachments : undefined;
    }

    /**
     * encrypts and replaces the body of the message with its cipher
     * @param key Should be SYM AES key in form of a string
     */


    _createClass(ChatMessage, [{
        key: "encryptMessage",
        value: function encryptMessage(key) {
            var self = this;
            var ic = new iCrypto();
            ic.setSYMKey("k", key).addBlob("body", self.body).AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');
            if (self.attachments) {
                ic.addBlob("attachments", JSON.stringify(self.attachments)).AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8");
                self.attachments = ic.get("attachmentscip");
            }

            if (self.header.nickname) {
                ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "k", "nnamecip", true);
                self.header.nickname = ic.get("nnamecip");
            }

            self.body = ic.get("bodycip");
        }
    }, {
        key: "encryptPrivateMessage",
        value: function encryptPrivateMessage(keys) {
            var self = this;
            var ic = new iCrypto();
            ic.sym.createKey("sym").addBlob("body", self.body).AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');
            if (self.header.nickname) {
                ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "sym", "nnamecip", true);
                self.header.nickname = ic.get("nnamecip");
            }
            self.body = ic.get("bodycip");
            self.header.keys = {};
            self.header.private = true;
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = keys[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var key = _step7.value;

                    var icn = new iCrypto();
                    icn.asym.setKey("pubk", key, "public").addBlob("sym", ic.get("sym")).asym.encrypt("sym", "pubk", "symcip", "hex").getPublicKeyFingerprint("pubk", "pkfp");
                    self.header.keys[icn.get("pkfp")] = icn.get("symcip");
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }, {
        key: "decryptPrivateMessage",
        value: function decryptPrivateMessage(privateKey) {
            try {
                var ic = new iCrypto();
                ic.asym.setKey("priv", privateKey, "private").publicFromPrivate("priv", "pub").getPublicKeyFingerprint("pub", "pkfp").addBlob("symcip", this.header.keys[ic.get("pkfp")]).asym.decrypt("symcip", "priv", "sym", "hex").addBlob("bodycip", this.body).sym.decrypt("bodycip", "sym", "body", true);
                this.body = ic.get("body");

                if (this.header.nickname) {
                    ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "sym", "nname", true);
                    this.header.nickname = ic.get("nname");
                }
            } catch (err) {
                console.log("Error decrypting private message: " + err);
            }
        }

        /**
         * Decrypts body and replaces the cipher with raw text
         * @param key
         */

    }, {
        key: "decryptMessage",
        value: function decryptMessage(key) {
            try {
                var ic = new iCrypto();
                ic.sym.setKey("k", key).addBlob("bodycip", this.body).sym.decrypt("bodycip", "k", "body", true);
                this.body = ic.get("body");
                if (this.attachments) {
                    ic.addBlob("attachmentscip", this.attachments).AESDecrypt("attachmentscip", "k", "attachments", true);
                    this.attachments = JSON.parse(ic.get("attachments"));
                }
                if (this.header.nickname) {
                    ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "k", "nname", true);
                    this.header.nickname = ic.get("nname");
                }
            } catch (err) {
                console.log("Error decrypting message: " + err);
            }
        }

        /**
         * Adds attachment metadata to the message
         * @param {Attachment} attachment
         */

    }, {
        key: "addAttachmentInfo",
        value: function addAttachmentInfo(attachment) {
            var self = this;
            if (!self.attachments) {
                self.attachments = [];
            }

            AttachmentInfo.verifyFileInfo(attachment);
            self.attachments.push(attachment);
        }
    }, {
        key: "sign",
        value: function sign(privateKey) {
            var ic = new iCrypto();
            var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
            if (this.attachments) {
                requestString += JSON.stringify(this.attachments);
            }
            ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
            this.signature = ic.get("sign");
        }
    }, {
        key: "verify",
        value: function verify(publicKey) {
            var ic = new iCrypto();
            var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
            if (this.attachments) {
                requestString += JSON.stringify(this.attachments);
            }
            ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", this.signature).addBlob("b", requestString).publicKeyVerify("b", "sign", "pubk", "v");
            return ic.get("v");
        }
    }, {
        key: "getNonce",
        value: function getNonce(size) {
            var ic = new iCrypto();
            ic.createNonce("n", size ? parseInt(size) : 8).bytesToHex("n", "nh");
            return ic.get("nh");
        }
    }, {
        key: "generateNewID",
        value: function generateNewID() {
            return this.getNonce(8);
        }
    }, {
        key: "toBlob",
        value: function toBlob() {
            return JSON.stringify(this);
        }
    }]);

    return ChatMessage;
}();

function WildEmitter() {}

WildEmitter.mixin = function (constructor) {
    var prototype = constructor.prototype || constructor;

    prototype.isWildEmitter = true;

    // Listen on the given `event` with `fn`. Store a group name if present.
    prototype.on = function (event, groupName, fn) {
        this.callbacks = this.callbacks || {};
        var hasGroup = arguments.length === 3,
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
            hasGroup = arguments.length === 3,
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
            if (item === '*' || split.length === 2 && eventName.slice(0, split[0].length) === split[0]) {
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

var AttachmentInfo = function () {
    function AttachmentInfo(file, onion, pkfp, metaID, privKey, messageID, hashEncrypted, hashUnencrypted) {
        var hashAlgo = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : "sha256";

        _classCallCheck(this, AttachmentInfo);

        var self = this;
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

    _createClass(AttachmentInfo, [{
        key: "get",
        value: function get() {
            var self = this;
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
            };
        }
    }, {
        key: "getLink",
        value: function getLink() {
            return this.link;
        }
    }, {
        key: "buildLink",
        value: function buildLink(onion, pkfp, hash) {
            if (!onion || !pkfp || !hash) {
                throw "Attachment buildLink: missing required parameters";
            }
            var rawLink = onion + "/" + pkfp + "/" + hash;
            var ic = new iCrypto();
            ic.addBlob("l", rawLink).base64Encode("l", "l64");
            return ic.get("l64");
        }
    }, {
        key: "signHashes",
        value: function signHashes(privKey) {
            if (!privKey) {
                throw "Attachment signAttachmentHash: privKey is undefined";
            }
            var self = this;
            var ic = new iCrypto();
            ic.addBlob("hu", self.hashUnencrypted).addBlob("he", self.hashEncrypted).asym.setKey("pk", privKey, "private").asym.sign("hu", "pk", "sign_u").asym.sign("he", "pk", "sign_e");
            self.signUnencrypted = ic.get("sign_u");
            self.signEncrypted = ic.get("sign_e");
        }
    }], [{
        key: "verifyFileInfo",
        value: function verifyFileInfo(info) {
            var required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = required[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var i = _step8.value;

                    if (!info.hasOwnProperty(i)) {
                        throw "Attachment verifyFileInfo: Missing required property: " + i;
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }, {
        key: "parseLink",
        value: function parseLink(link) {
            var ic = new iCrypto();
            ic.addBlob("l", link).base64Decode("l", "lres");
            var elements = ic.get("lres").split("/");
            return {
                residence: elements[0],
                pkfp: elements[1],
                name: elements[2]
            };
        }
    }]);

    return AttachmentInfo;
}();

AttachmentInfo.properties = ["name", "size", "type", "lastModified", "hashUnencrypted", "signUnencrypted", "hashEncrytped", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];

WildEmitter.mixin(WildEmitter);

var ChatUtility = function () {
    function ChatUtility() {
        _classCallCheck(this, ChatUtility);
    }

    _createClass(ChatUtility, null, [{
        key: "decryptStandardMessage",

        /**
         * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
         * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
         * Sym key generated randomly every time
         * @param blob - cipher blob
         * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
         * @param privateKey
         * @returns {}
         */
        value: function decryptStandardMessage() {
            var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
            var privateKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
            var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;


            var symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));

            var symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
            var payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
            var ic = new iCrypto();
            ic.addBlob("blobcip", payloadCipher).addBlob("symkcip", symKeyCipher).asym.setKey("privk", privateKey, "private").privateKeyDecrypt("symkcip", "privk", "symk", "hex").AESDecrypt("blobcip", "symk", "blob-raw", true, "CBC", "utf8");
            return ic.get("blob-raw");
        }
    }, {
        key: "encryptStandardMessage",
        value: function encryptStandardMessage() {
            var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
            var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
            var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

            var ic = new iCrypto();
            ic.sym.createKey("symk").addBlob("payload", blob).asym.setKey("pubk", publicKey, "public").sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8").asym.encrypt("symk", "pubk", "symcip", "hex").encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength").merge(["blobcip", "symcip", "symciplength"], "res");
            return ic.get("res");
        }
    }, {
        key: "publicKeyEncrypt",
        value: function publicKeyEncrypt() {
            var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
            var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();

            var ic = new iCrypto();
            ic.addBlob("blob", blob).asym.setKey("pubk", publicKey, "public").publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
            return ic.get("blobcip");
        }
    }, {
        key: "privateKeyDecrypt",
        value: function privateKeyDecrypt(blob, privateKey) {
            var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "hex";

            var ic = new iCrypto();
            ic.addBlob("blobcip", blob).asym.setKey("priv", privateKey, "private").privateKeyDecrypt("blobcip", "priv", "blob", encoding);
            return ic.get("blob");
        }
    }, {
        key: "symKeyEncrypt",
        value: function symKeyEncrypt(blob, key) {
            var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var ic = new iCrypto();
            ic.addBlob("b", blob).sym.setKey("sym", key).AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8");
            return ic.get("cip");
        }
    }, {
        key: "symKeyDecrypt",
        value: function symKeyDecrypt(cip, key) {
            var dehexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var ic = new iCrypto();
            ic.addBlob("cip", cip).sym.setKey("sym", key).AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
            return ic.get("b");
        }
    }]);

    return ChatUtility;
}();

var ClientSettings = function ClientSettings() {
    _classCallCheck(this, ClientSettings);

    this.nicknames = {};
    this.invites = {};
};