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

const HistoryManager = require("../old_server/classes/libs/HistoryManager.js");
const { SessionManagerAdapter } = require("./lib/SessionManagerAdapter")

const ClientRequestRouter = require("../old_server/classes/libs/ClientRequestEmitter.js");

const IslandsChat = require("../old_server/classes/IslandsChat")

const accounts = [];
const vaults = [];

//Legacy managers. Have to go eventually
const managers = {};


//create express
function main(){
    console.log("Starting Islands...");
    const args = parseArguments(process.argv.slice(2));

    if(args.debug){
        global.DEBUG = true;
    }

    //Setting global version
    try{
        global.VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "../",'package.json' )).toString()).version;
        console.log(`Version is set to ${global.VERSION}`)
    }catch(err){
        console.trace("Missing version number. Exiting..." + err );
        process.exit(-1)
    }

    //Building configuration
    const config = buildConfig()


    ensureDirExist(config.basePath);

    //Ensure that at least admin vault exists
    ensureAdminVaultExist(config)


    //Migration
    migrate(config);



    //Initializing tor controller
    let torController = new TorController({
        host: config.torConnector.torControlHost,
        port: config.torConnector.torControlPort,
        password:  config.torConnector.torPassword,
    })

    //Initializing logger
    Logger.initLogger(config.servicePath, global.DEBUG ? "debug" : "info");




    // ---------------------------------------------------------------------------------------------------------------------------
    // Legacy section


    //Initializing vaults

    //const vaults = loadVaults(config.vaultsPath);

    //activateAdminAccount(vaults, args.port, config)

    //activateGuestAccounts(vaults)
    const requestEmitter = new ClientRequestRouter();


    activateAccounts(args.port, config, requestEmitter)


    //create managers here
    //

    //chat here is a collection of legacy managers that eventually have to go
    let sessionManagerAdapter = new SessionManagerAdapter(accounts)
    let chat = new IslandsChat(config, requestEmitter, sessionManagerAdapter)

}


function activateAccounts(port, config, requestEmitter){
    let vaultDirectories = fs.readdirSync(config.vaultsPath);

    for(let vaultId of vaultDirectories){
        let vault = new Vault({
            vaultId: vaultId,
            requestEmitter: requestEmitter,
            vaultDirectory: path.join(config.vaultsPath, vaultId)
        })

        let isAdmin = isAdminVault(config, vaultId)

        if(isAdmin){
            //Init admin router legacy
            AdminServer.initAdminEnv(config, vaultId, "0.0.0.0", port)
        }

        //Activating admin vault with provided port number
        activateAccount({
            vault: vault,
            requestEmitter: requestEmitter,
            isAdmin: isAdmin,
            port: isAdmin ? port : getPort(), //if not admin - then port is ephemeral
            host: '0.0.0.0',  //hardcoded for now
            config: config
        })
    }


    let vaults = [];

    for (let vaultId of vaultDirectories){
        let fullVaultDir = path.join(config.vaultsPath, vaultId)
        vaults.push(new Vault({ vaultId: vaultId, vaultDirectory: fullVaultDir, requestEmitter: requestEmitter }));
    }

    return vaults;
}


/**
 * This function initializes web services for each active island account
 *
 */
function activateAccount({vault, requestEmitter, port, host, isAdmin, config}){

    console.log(`Activating account for ${vault.id}`);

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

    let sessions = new Sessions(vault, requestEmitter)


    webService.on('connection', (socket)=>{
        console.log("New incoming connection");
        let pendingConnection = new PendingConnection({
            connector: ConnectorAbstractFactory.getServerConnectorFactory().make(socket),
            sessions: sessions,
            vault: vault
        })
    })

    webService.launch();

    accounts.push({
        webService: webService,
        vault: vault,
        sessions: sessions,
        hiddenServices: hiddenServices
    })
}


//Initializing leagcy managers, they all have to go at some point
function initializeManagers(config){
    managers.historyManager = new HistoryManager(config.historyPath);
}



function getHSPrivateKey(config, hsid){
    hsid = hsid.substring(0, 16);
    let hsPath = path.join(config.hiddenServicesPath, hsid)
    if(!fs.existsSync(hsPath)){
        throw new Error("Hidden service private key is not found");
    }
    return fs.readFileSync(hsPath, "utf8")
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
