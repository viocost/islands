import { StateMachine } from "./AdvStateMachine";
import { iCrypto } from "./iCrypto";
import { ChatUtility } from "./ChatUtility";
import { Message } from "./Message";
import { WildEmitter } from  "./WildEmitter";
import { createDerivedErrorClasses } from "../../../../common/DynamicError"
import { createStream } from "socket.io-stream/lib";


class TopicCreatorError extends Error{ constructor(data){ super(data); this.name = "TopicCreatorError" } }
let err = createDerivedErrorClasses(TopicCreatorError, {

})


export class TopicCreator {

    constructor(nickname, topicName, connector, vaultHolder) {
        WildEmitter.mixin(this)
        this.nickname = nickname;
        this.topicName = topicName;
        this.connector = connector;
        this.vaultHolder = vaultHolder;
        this.sm = this.prepareStateMachine();
    }

    prepareStateMachine() {
        return new StateMachine(this, {
            name: "Topic Creator SM",
            stateMap: {
                ready: {
                    initial: true,
                    transitions: {
                        run: {
                            state: "creatingTopic",
                            actions: this.initTopic
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
                    final: true
                },
                error: {
                    final: true
                }

            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    async initTopic(stateMachine, evName, args) {
        nickname = args[0]
        topicName = args[1]
        console.log("Checking input");
        nickname = String(nickname).trim();
        if (!nickname || !/^.{2,20}$/.test(nickname)) {
            this.emit(Events.INIT_TOPIC_ERROR,
                `Nickname entered is invalid`);
            return;
        }
        if (!/^.{0,20}$/.test(topicName)) {
            this.emit(Events.INIT_TOPIC_ERROR,
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
        let newTopicData = {
            topicKeyPair: topicKeyPair,
            ownerPublicKey: ownerKeyPair.publicKey
        };

        console.log("Preparing request");
        let newTopicDataCipher = ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), this.sessionKey);

        //initializing topic settings
        let settings = Topic.prepareNewTopicSettings(this.version, nickname, topicName, ownerKeyPair.publicKey)

        // TODO Prepare new topic vault record
        let vaultRecord = this.prepareVaultTopicRecord(this.version,
            ownerPkfp,
            ownerKeyPair.privateKey,
            topicName)

        //Preparing request
        let request = new Message(this.version);
        request.headers.command = Internal.INIT_TOPIC;
        request.headers.pkfpSource = this.id;
        request.body.topicID = topicID;
        request.body.topicPkfp = ownerPkfp;
        request.body.settings = settings;
        request.body.ownerPublicKey = ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicDataCipher;
        request.body.vaultRecord = vaultRecord;
        request.body.vaultId = this.id;
        request.signMessage(this.privateKey)

        this.connector.send(request)

    }

    addTopicToVault(){
        let vault = this.vaultHolder.getVault();

        //if(!Message.verifyMessage(vault.sessionKey, data)){
        //    throw new Error("Session key signature is invalid!")
        //}
        console.log(`Adding new topic to vault`)
        let vaultRecord = data.body.vaultRecord;
        let metadata = data.body.metadata;
        let topicData = vault.decryptTopic(vaultRecord, vault.password);
        let pkfp = topicData.pkfp;
        let newTopic = new Topic(
            pkfp,
            topicData.name,
            topicData.key,
            topicData.comment
        )

        console.log(`New topic initialized: ${pkfp}, ${topicData.name} `)
        newTopic.loadMetadata(metadata);
        newTopic.bootstrap(vault.messageQueue, vault.arrivalHub, vault.version);
        vault.topics[pkfp] = newTopic;

        if (vault.pendingInvites.hasOwnProperty(data.body.inviteCode)){
            let inviteeNickname = vault.pendingInvites[data.body.inviteCode].nickname
            console.log(`Initialize settings  on topic join. Invitee ${inviteeNickname}`);
            vault.initSettingsOnTopicJoin(vault, pkfp, inviteeNickname, data)
        }
        vault.emit(Events.TOPIC_CREATED, pkfp);
        return pkfp
    }


    run(){
        this.handle.run()
    }

}
