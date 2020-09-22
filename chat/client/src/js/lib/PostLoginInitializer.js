import { ArrivalHub } from "./ArrivalHub"
import { IslandsVersion } from "../../../../common/Version"
import { TopicRetriever } from  "./TopicRetriever"
import { createClientIslandEnvelope, Message } from "../../../../common/Message";
import { Internal, Events } from "../../../../common/Events"
import { WildEmitter } from "../../../../common/WildEmitter"

/**
 * It is given an authenticated session and vault
 * It has to
 * - Load and decrypt topics and all services
 * - Have server to launch hidden services
 */
export class PostLoginInitializer {
    static Success = Symbol("success")
    static Fail = Symbol("fail")

    constructor(session, vault) {
        WildEmitter.mixin(this)

        console.log("PostLoginInitializer started...");

        this.arrivalHub = new ArrivalHub(session);
        this.session = session;
        this.vault = vault;

        vault.bootstrap(this.arrivalHub, session, IslandsVersion.getVersion());
    }

    run() {
        this.loadTopics(this.vault)
        //initialize vault
        // initialize all topics
    }


    loadTopics(vault) {
        console.log("Loading topics...");
        //setVaultListeners(vault);
        let retriever = new TopicRetriever();
        retriever.once("finished", (data) => this.initTopics(data, vault))
        retriever.once("error", (err) => { console.log(err) })
        retriever.run();
    }

    checkUpdateVaultFormat(vault, existingTopics) {
        //V1 support
        let rawVault = loginAgent.getRawVault()

        if (!rawVault.topics) return

        //Otherwise version 1, update required. First initializing topics
        for (let pkfp in rawVault.topics) {

            if (pkfp in existingTopics) {
                continue;
            }
            let topic = rawVault.topics[pkfp];
            console.log(`Initializing existingTopics ${pkfp}`);
            existingTopics[pkfp] = new Topic(pkfp, topic.name, topic.key, topic.comment)
            setTopicListeners(existingTopics[pkfp])
            existingTopics[pkfp].bootstrap(this.session, arrivalHub, version);
        }


        //updating vault to current format

        //let { vault, existingTopics, hash, sign } = vault.pack();
        let packedVault = vault.pack()

        let message = new Message(vault.version);
        message.setSource(vault.id);
        message.setCommand(Internal.UPDATE_VAULT_FORMAT);
        message.addNonce();
        message.body.vault = packedVault.vault;
        message.body.sign = packedVault.sign;
        message.body.hash = packedVault.hash;
        message.body.topics = packedVault.topics;
        message.signMessage(vault.privateKey);
        console.log("%c UPDATING VAULT FORMAT!!", "color: red; font-size: 20px");
        this.session.acceptMessage(message)

    }


    initTopics(data, vault) {
        console.log("Initializing topics...");

        if (!data.topics) return

        let topics = {}
        for (let pkfp in data.topics) {

            console.log(`Initializing topics ${pkfp}`);

            // TODO fix version!
            let topic = vault.decryptTopic(data.topics[pkfp], vault.password)
            topics[pkfp] = new Topic(pkfp, topic.name, topic.key, topic.comment)
            topics[pkfp].bootstrap(this.session, arrivalHub, version);
        }

        vault.topics = topics;
        //this.checkUpdateVaultFormat(vaultHolder, topics)
        this.postLogin(vault);

    }


    postLogin(vault) {
        console.log("SENDING POST LOGIN");
        const message = createClientIslandEnvelope({
            command: Internal.POST_LOGIN,
            pkfpSource: vault.id,
            privateKey: vault.privateKey,
            body: {
                topics: Object.keys(vault.topics)
            }
        })

        vault.once(Internal.POST_LOGIN_DECRYPT, (msg) => {
            this.postLoginDecrypt(msg, vault);
        })
        this.session.acceptMessage(message);
    }


    // Decrypts topic authorities' and hidden services keys
    // and re-encrypts them with session key, so island can poke all services
    postLoginDecrypt(msg, vault) {
        console.log(`Got decrypt command from server.`)
        //decrypting and sending data back

        let decryptBlob = (privateKey, blob, lengthChars = 4) => {
            let icn = new iCrypto();
            let symLength = parseInt(blob.substr(-lengthChars))
            let blobLength = blob.length;
            let symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
            let cipher = blob.substring(0, blobLength - symLength - lengthChars);
            icn.addBlob("symcip", symk)
                .addBlob("cipher", cipher)
                .asym.setKey("priv", privateKey, "private")
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .sym.decrypt("cipher", "sym", "blob-raw", true)
            return icn.get("blob-raw")
        };

        let encryptBlob = (publicKey, blob, lengthChars = 4) => {
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

        let services = msg.body.services;
        let sessionKey = msg.body.sessionKey;
        let res = {}
        for (let pkfp of Object.keys(services)) {
            let topicData = services[pkfp];
            let topicPrivateKey = topics[pkfp].privateKey;

            let clientHSPrivateKey, taHSPrivateKey, taPrivateKey;

            if (topicData.clientHSPrivateKey) {
                clientHSPrivateKey = decryptBlob(topicPrivateKey, topicData.clientHSPrivateKey)
            }

            if (topicData.topicAuthority && topicData.topicAuthority.taPrivateKey) {
                taPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taPrivateKey)
            }

            if (topicData.topicAuthority && topicData.topicAuthority.taHSPrivateKey) {
                taHSPrivateKey = decryptBlob(topicPrivateKey, topicData.topicAuthority.taHSPrivateKey)
            }

            topics[pkfp].loadMetadata(topicData.metadata);

            let preDecrypted = {};

            if (clientHSPrivateKey) {
                preDecrypted.clientHSPrivateKey = clientHSPrivateKey
            }
            if (taPrivateKey || taHSPrivateKey) {
                preDecrypted.topicAuthority = {}
            }
            if (taPrivateKey) {
                preDecrypted.topicAuthority.taPrivateKey = taPrivateKey
            }
            if (taHSPrivateKey) {
                preDecrypted.topicAuthority.taHSPrivateKey = taHSPrivateKey
            }

            res[pkfp] = preDecrypted
        }

        console.log("Decryption is successfull.");
        let message = new Message(IslandsVersion.getVersion());
        message.setCommand(Internal.POST_LOGIN_CHECK_SERVICES)
        message.setSource(vault.getId());
        message.body.services = res;
        message.signMessage(vault.privateKey);
        vault.once(Events.POST_LOGIN_SUCCESS, this.handleSuccess.bind(this, vault, vault.topics));
        vault.once(Events.POST_LOGIN_ERROR, this.handleFail.bind(this));
        vault.once(Events.LOGIN_ERROR, this.handleFail.bind(this));
        this.session.acceptMessage(message);
    }

    checkUpdateVaultFormat(vault, existingTopics) {
        //V1 support
        let rawVault = loginAgent.getRawVault()

        if (!rawVault.topics) return

        //Otherwise version 1, update required. First initializing topics
        for (let pkfp in rawVault.topics) {

            if (pkfp in existingTopics) {
                continue;
            }
            let topic = rawVault.topics[pkfp];
            console.log(`Initializing existingTopics ${pkfp}`);
            existingTopics[pkfp] = new Topic(pkfp, topic.name, topic.key, topic.comment)
            setTopicListeners(existingTopics[pkfp])
            existingTopics[pkfp].bootstrap(this.session, arrivalHub, version);
        }


        //updating vault to current format

        let currentVault = vault
        //let { vault, existingTopics, hash, sign } = currentVault.pack();
        let packedVault = currentVault.pack()

        let message = new Message(currentVault.version);
        message.setSource(currentVault.id);
        message.setCommand(Internal.UPDATE_VAULT_FORMAT);
        message.addNonce();
        message.body.vault = packedVault.vault;
        message.body.sign = packedVault.sign;
        message.body.hash = packedVault.hash;
        message.body.topics = packedVault.topics;
        message.signMessage(currentVault.privateKey);
        console.log("%c UPDATING VAULT FORMAT!!", "color: red; font-size: 20px");
        this.session.acceptMessage(message)

    }

    handleSuccess(vault, topics){
        console.log(`Processing login result`);
        this.emit(PostLoginInitializer.Success, vault, topics)
    }

    handleFail(err){
        this.emit(PostLoginInitializer.Fail, err)
    }


}
