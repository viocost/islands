const { buildConfig } = require("./Config")
const { Vault, Vaults } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const { Sessions } = require("./Sessions")
const { HiddenService } = require("./lib/HiddenService")
const { migrate } = require("./lib/Migration");
const TorController = require("../old_server/classes/libs/TorController")
const getPort = require("get-port-sync")
const { RouterFactory } = require("./lib/RouterFactory");
const Logger = require("../old_server/classes/libs/Logger");
const { PendingConnection } = require("./lib/PendingConnection")
const { ConnectorAbstractFactory } = require("../common/Connector")
const AdminServer  = require("../old_server/classes/AdminServer")
const fs = require("fs-extra")
const path = require("path")
const { VaultSecretary } = require("./VaultSecretary");

const HistoryManager = require("../old_server/classes/libs/HistoryManager.js");
const { SessionManagerAdapter } = require("./lib/SessionManagerAdapter")

const ClientRequestEmitter = require("../old_server/classes/libs/ClientRequestEmitter.js");

const IslandsChat = require("../old_server/classes/IslandsChat")


//Legacy managers. Have to go eventually
const managers = {};


//create express
function main(){
    console.log("Starting Islands...");

    // Parsing CLI arguments
    const args = parseArguments(process.argv.slice(2));

    if(args.debug){
        global.DEBUG = true;
    }

    //Setting global island version
    try{
        global.VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "../",'package.json' )).toString()).version;
        console.log(`Version is set to ${global.VERSION}`)
    }catch(err){
        console.trace("Missing version number. Exiting..." + err );
        process.exit(-1)
    }

    //Building configuration
    const config = buildConfig()

    //Initializing logger
    Logger.initLogger(config.servicePath, global.DEBUG ? "debug" : "info");

    ensureDirExist(config.basePath);


    //Converting data to new formats if needed
    migrate(config);

    //Checking if admin vault is present.
    //If not - creating it
    ensureAdminVaultExist(config)


    // TODO Refactor
    // Request emitter is required for old managers to function
    // It listens to messages directly from session object, reads "command" field
    // in the headers of the ClientServerEnvelope and emits the command with
    // that message. Then Interested parties react appropriately.
    const requestEmitter = new ClientRequestEmitter();

    // Accounts is an array of objects.
    // Each account has following fields:
    // - webServices - wrapper around dedicated express app
    // - vault - Vault object
    // - sessions - Collection of account related sessions
    // - hiddenServices - Account specific hidden services
    const accounts = []
    activateAccounts(args.port, config, requestEmitter, accounts)


    //chat here is a collection of legacy managers that eventually have to go
    let sessionManagerAdapter = new SessionManagerAdapter(accounts)
    let chat = new IslandsChat(config, requestEmitter, sessionManagerAdapter)

}


function activateAccounts(port, config, requestEmitter, accounts){
    let vaultDirectories = fs.readdirSync(config.vaultsPath);

    for(let vaultId of vaultDirectories){

        //Activating account
        accounts.push(activateAccount({
            vaultId: vaultId,
            requestEmitter: requestEmitter,
            config: config,
            argPort: port
        }))
    }
}


/**
 * This function initializes web services for each active island account
 *
 */
function activateAccount({argPort, vaultId, requestEmitter,  config}){

    console.log(`Activating account for ${vaultId}`);

    // TODO refactor! For now hardcoded
    const host = "0.0.0.0"

    // Creating collection of sessions
    let sessions = new Sessions(requestEmitter)

    // Creating vault secretary
    let secretary = new VaultSecretary(vaultId, sessions);

    let vault = new Vault({
        vaultId: vaultId,
        requestEmitter: requestEmitter,
        vaultDirectory: path.join(config.vaultsPath, vaultId),
        secretary: secretary
    })

    let isAdmin = isAdminVault(config, vaultId)
    let port = isAdmin ? argPort : getPort()

    //Initializing admin router legacy for admin page if vault belongs to admin
    if(isAdmin){
        AdminServer.initAdminEnv(config, vaultId, "0.0.0.0", port)
    }

    //Creating tor controller
    const torControl = new TorController({ host: config.torConnector.torControlHost, port: config.torConnector.torControlPort, password:  config.torConnector.torControlPassword })

    //launching hidden services
    let hiddenServices = vault.loadHiddenServices().map(hsData=>{
        let hs= new HiddenService({
            onion: hsData.onion,
            control: torControl,
            host: host,
            port: port,
            hsPath: hsData.hsPath
        })
        hs.launch()
        return hs
    });

    let routers = isAdmin ? [ RouterFactory.AppRouter(vault), RouterFactory.AdminRouter(vault) ]
        : [ RouterFactory.AppRouter(vault) ]

    let webService = new WebService({
        routers: routers,
        port: port,
        host: host,
        viewsPath: path.join(__dirname, "views"),
        staticPath: path.join(__dirname, "..", "public")
    })



    webService.on('connection', (socket)=>{
        console.log("New incoming connection");
        let pendingConnection = new PendingConnection({
            connector: ConnectorAbstractFactory.getServerConnectorFactory().make(socket),
            sessions: sessions,
            vault: vault
        })
    })

    webService.launch();

    return {
        webService: webService,
        vault: vault,
        sessions: sessions,
        hiddenServices: hiddenServices
    }
}


function isAdminVault(config, vaultId){
    let vaultPath = path.join(config.vaultsPath, vaultId)
    return fs.existsSync(path.join(vaultPath, "admin"))
}

function ensureAdminVaultExist(config, port){
    let vaultsPath = config.vaultsPath;
    ensureDirExist(vaultsPath);

    if(fs.readdirSync(vaultsPath).length === 0){

        //create hidden service
        const hsData = TorController.generateRSA1024Onion()
       
        // create vault
        Vault.createPendingVault(vaultsPath, { onion: hsData.onion, key: hsData.privateKey, isEnabled: true })
    }
}

function ensureDirExist(dirPath){
    if(!fs.existsSync(dirPath)){
        console.log(`Directory doesn't exist: ${dirPath}. Creating...`);
        fs.mkdirSync(dirPath)
    }
}



main();
