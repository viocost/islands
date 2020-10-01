const ClientSessionManager = require("./libs/ClientSessionManager.js");
const ClientConnectionManager = require("./libs/ClientConnectionManager.js");
const TorConnector = require("./libs/TorConnector.js");
const HistoryManager = require("./libs/HistoryManager.js");
const TopicAuthorityManager = require("./libs/TopicAuthorityManager.js");
const CrossIslandMessenger = require("./libs/CrossIslandMessenger.js");
const InviteAssistant = require("./assistants/InviteAssistant.js");
const TopicJoinAssistant = require("./assistants/TopicJoinAssistant.js");
const TopicInitAssistant = require("./assistants/TopicInitAssistant.js");
const LoginAssistant = require("./assistants/LoginAssistant.js");
const ServiceAssistant = require("./assistants/ServiceAssistant.js");
const ChatMessageAssistant = require("./assistants/ChatMessageAssistant.js");
const ClientSettingsAssistant = require("./assistants/ClientSettingsAssistant.js");
const DataTransferAssistant = require("./assistants/DataTransferAssistant.js");
const BootLeaveAssistant = require("./assistants/BootLeaveAssistant.js");
const VaultManager = require("./libs/VaultManager.js");
const Logger = require("./libs/Logger.js");
const AssistantCoordinator = require("./assistants/AssistantCoordinator.js");
const VaultUpdater = require("../lib/VaultUpdater");

class IslandsChat{
    constructor(opts, requestEmitter, sessionManager) {
        console.log(`Initializing legacy managers!!!!!!!!`);
        this.historyPath = (opts ? opts.historyPath : null);
        this.clientRequestEmitter = requestEmitter
        this.torConnector = new TorConnector(opts);
        this.crossIslandMessenger = new CrossIslandMessenger(this.torConnector);
        this.hm = new HistoryManager(this.historyPath);

        this.vaultManager = new VaultManager(opts, this.clientRequestEmitter);
        this.clientSessionManager = sessionManager
        this.vaultManager.registerSessionManager(this.clientSessionManager);

        AssistantCoordinator.initialize();


        this.topicAuthorityManager = new TopicAuthorityManager(
            this.crossIslandMessenger,
            this.torConnector,
            this.torConnector.torController,
            this.hm);

        this.topicInitAssistant = new TopicInitAssistant(this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.torConnector,
            this.vaultManager,
            this.clientSessionManager);

        this.LoginAssistant = new LoginAssistant(this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.torConnector,
            this.clientSessionManager,
            this.vaultManager);

        this.inviteAssistant = new InviteAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.crossIslandMessenger
        );

        this.topicJoinAssistant = new TopicJoinAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.crossIslandMessenger,
            this.torConnector,
            this.vaultManager
        );

        this.serviceAssistant = new ServiceAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.crossIslandMessenger,
            this.torConnector
        );

        this.chatMessageAssistant = new ChatMessageAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.crossIslandMessenger
        );

        this.clientSettingsAssistant = new ClientSettingsAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm
        );

        this.dataTransferAssistant = new DataTransferAssistant(
            this.hm,
            this.torConnector
        );

        this.bootLeaveAssistant = new BootLeaveAssistant(
            this.clientSessionManager,
            this.clientRequestEmitter,
            this.hm,
            this.topicAuthorityManager,
            this.crossIslandMessenger,
            this.vaultManager,
            this.torConnector
        );

        this.vaultUpdater = new VaultUpdater(opts, this.clientRequestEmitter);

        Logger.verbose("Chat started")
    }



    async runGlobalResync(){
        await this.serviceAssistant.runGlobalResync();
    }
}


module.exports = IslandsChat;
