const { buildConfig } = require("./Config")
const { Vault, Vaults } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const adminRouter = require("../old_server/adminRouter")
const appRouter = require("../old_server/appRouter")
const { Sessions } = require("./Sessions")
const { HiddenService } = require("./lib/HiddenService")
const { migrate } = require("./lib/Migration");
const TorController = require("../old_server/classes/libs/TorController")

const Logger = require("../old_server/classes/libs/Logger");

const fs = require("fs-extra")
const path = require("path")

const HistoryManager = require("../old_server/classes/libs/HistoryManager.js");

const HiddenServiceManager = require("../old_server/classes/libs/HiddenServiceManager");
const ClientRequestRouter = require("../old_server/classes/libs/ClientRequestCollector.js");

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

    ensureDirExist(config.basePath);

    ensureAdminVaultExist(config)

    //Initializing vaults

    //const vaults = loadVaults(config.vaultsPath);

    //activateAdminAccount(vaults, args.port, config)

    //activateGuestAccounts(vaults)
    const requestEmitter = new ClientRequestRouter();
    activateAccounts(args.port, config, requestEmitter)

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

        //Activating admin vault with provided port number
        activateAccount({
            vault: vault,
            requestEmitter: requestEmitter,
            isAdmin: isAdmin,
            port: isAdmin ? port : undefined, //if not admin - then port is ephemeral
            host: '0.0.0.0'  //hardcoded for now
        })


    }


    let vaults = [];

    for (let vaultId of vaultDirectories){
        let fullVaultDir = path.join(vaultsPath, vaultId)
        vaults.push(new Vault({ vaultId: vaultId, vaultDirectory: fullVaultDir, requestEmitter: requestEmitter }));
    }

    return vaults;
}


function activateAccount({vault, requestEmitter, port, host, isAdmin}){

    console.log(`Activating account for ${vault.id}`);

    //load hidden service
    let accountHiddenServices = getAccountHiddenServices(vault.id)

    let routers = isAdmin ? [ adminRouter.router, appRouter.router ] : [ appRouter.router ]

    let webService = new WebService({
        routers: routers,
        port: port,
        host: "0.0.0.0",
        viewsPath: path.join(__dirname, "views"),
        staticPath: path.join(__dirname, "..", "public")
    })
    let sessions = new Sessions(vault)


    let hiddenService = new HiddenService();
    webService.on('connection', (socket)=>{
        //need to figure out if
        sessions.add(socket)
        //create new session and add it
    })
    webService.launch();
    accounts.push([webService, sessions, hiddenService])
}


//Initializing leagcy managers, they all have to go at some point
function initializeManagers(config){
    managers.historyManager = new HistoryManager(config.historyPath);
}





function getAccountHiddenServices(vaultId){
    let hsVaultMap = getMap()
    return Object.keys((hsVaultMap)).filter(onion =>{
        return hsVaultMap[onion].vaultID === vaultId
    })
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

function ensureAdminVaultExist(config){
    let vaultsPath = config.vaultsPath;
    ensureDirExist(vaultsPath);

    if(fs.readdirSync(vaultsPath).length === 0){

        //create hidden service


        //create vault
        Vault.createPendingVault(vaultsPath)
    }
}

function ensureDirExist(dirPath){
    if(!fs.existsSync(dirPath)){
        console.log(`Directory doesn't exist: ${dirPath}. Creating...`);
        fs.mkdirSync(dirPath)
    }
}



main();
