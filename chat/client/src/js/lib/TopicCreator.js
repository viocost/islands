import { StateMachine } from "../../../../common/AdvStateMachine";
import { iCrypto } from "../../../../common/iCrypto";
import { Message } from "./Message";
import { WildEmitter } from  "./WildEmitter";
import { Topic } from "./Topic";
import { Internal, Events } from "../../../../common/Events";
import { IslandsVersion }from "../../../../common/Version";

//class TopicCreatorError extends Error{ constructor(data){ super(data); this.name = "TopicCreatorError" } }


export class TopicCreator {

    constructor(nickname, topicName, session, vault, uxBus) {
        WildEmitter.mixin(this)
        this.nickname = nickname;
        this.topicName = topicName;
        this.session = session;
        this.vault = vault;
        this.uxBus = uxBus;
        this.sm = this._prepareStateMachine();

        //TODO GET RID OF SESSION KEY HERE!
        this.sessionKey = vault.sessionKey
        this.version = vault.version

    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS

    run(){
        this.sm.handle.run()
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Topic Creator SM",
            stateMap: {
                ready: {
                    initial: true,
                    transitions: {
                        run: {
                            state: "creatingTopic",
                            actions: this._initTopic
                        }
                    }
                },
                creatingTopic: {
                    transitions: {
                        success: {
                            state: "success",
                            actions: []
                        },

                        error: {
                            state: "error",
                            actions: []
                        }
                    }
                },
                success: {
//                    entry: this._addTopicToVault,
                    final: true
                },
                error: {
                    entry: this._processTopicCreateError,
                    final: true
                }
            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    async _initTopic(args) {
        console.log("Init topic top of the function");
        let nickname = this.nickname;
        let topicName = this.topicName;

        console.log("Checking input");
        nickname = String(nickname).trim();
        if (!nickname || !/^.{2,20}$/.test(nickname)) {
            console.log("Nickname entered is invalid");
            this.uxBus.emit(Events.INIT_TOPIC_ERROR,
                `Nickname entered is invalid`);
            return;
        }
        if (!/^.{0,20}$/.test(topicName)) {

            console.log("Topic name entered is invalid");
            this.uxBus.emit(Events.INIT_TOPIC_ERROR,
                `Topic name entered is invalid`);
            return;
        }

        console.log("Generating keys");
        //CREATE NEW TOPIC PENDING
        let ic = new iCrypto();

        //Generate keypairs one for user, other for topic
        ic = await ic.asym.asyncCreateKeyPair('owner-keys');
        ic = await ic.asym.asyncCreateKeyPair('topic-keys');
        ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
        ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");

        let ownerKeyPair = ic.get("owner-keys")
        let topicKeyPair = ic.get("topic-keys")
        let ownerPkfp = ic.get("owner-pkfp")
        let topicID = ic.get("topic-pkfp")

        //Forming request
        //Theses are topic authority keypair and owner's public key
        let newTopicData = {
            topicKeyPair: topicKeyPair,
            ownerPublicKey: ownerKeyPair.publicKey
        };

        console.log("Preparing request");
        let newTopicDataCipher = JSON.stringify(newTopicData);

        //initializing topic settings
        let settings = Topic.prepareNewTopicSettings(this.version, this.nickname, this.topicName, ownerKeyPair.publicKey)

        // TODO Prepare new topic vault record
        let vault = this.vault;

        let vaultRecord = vault.prepareVaultTopicRecord(this.version,
            ownerPkfp,
            ownerKeyPair.privateKey,
            topicName)

        //Preparing request
        let request = new Message(vault.version);
        request.headers.command = Internal.INIT_TOPIC;
        request.headers.pkfpSource = vault.id;
        request.body.topicID = topicID;
        request.body.topicPkfp = ownerPkfp;
        request.body.settings = settings;
        request.body.ownerPublicKey = ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicData;
        request.body.vaultRecord = vaultRecord;
        request.body.vaultId = vault.id;
        request.signMessage(vault.privateKey)
        this.session.acceptMessage(request)
    }


    _processTopicCreateError(args){
        console.log(`Error creating topic ${args[0]}`);
    }


}
