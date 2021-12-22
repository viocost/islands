const { buildConfig } = require("./Config")
const { Vault, VaultPending, VaultIdLength } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const { Sessions } = require("./Sessions")
const { HiddenService } = require("./lib/HiddenService")
const { migrate, ensureDataVersion } = require("./lib/Migration");
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
const { StorageFactoryAbs, StorageType, } = require("./StorageFactory")
const { StorageSQLite, } = require("./StorageSQLite")
const { Storage } = require("./Storage")
const KeyBuilder = require("./StorageKeyBuilderAdapter")

const { SessionManagerAdapter } = require("./lib/SessionManagerAdapter")

const ClientRequestEmitter = require("../old_server/classes/libs/ClientRequestEmitter.js");

const IslandsChat = require("../old_server/classes/IslandsChat")

const HOST = "0.0.0.0";

const storageFactory = StorageFactoryAbs.getFactory(StorageType.SQLiteStorage);



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
    const requestEmitter = new ClientRequestEmitter();


    //make sure all directories exist
    validateDirStructure(config)


    //Making sure data version is present
    ensureDataVersion(config.basePath)

    //Initializing logger
    Logger.initLogger(config.servicePath, global.DEBUG ? "debug" : "info");



    //Converting data to new formats if needed
    migrate(config);



    // TODO Refactor
    // Request emitter is required for old managers to function
    // It listens to messages directly from session object, reads "command" field
    // in the headers of the ClientServerEnvelope and emits the command with
    // that message. Then Interested parties react appropriately.
    // Accounts is an array of objects.
    // Each account has following fields:
    // - webServices - wrapper around dedicated express app
    // - vault - Vault object
    // - sessions - Collection of account related sessions
    // - hiddenServices - Account specific hidden services
    const accounts = []
    activateAccounts(args.port, config, requestEmitter, accounts)

    //Checking if admin vault is present.
    //If not - creating it
    ensureAdminVaultExist({
        config: config,
        requestEmitter: requestEmitter,
        adminPort: args.port,
        accounts: accounts
    })

    //chat here is a collection of legacy managers that eventually have to go
    let sessionManagerAdapter = new SessionManagerAdapter(accounts)
    let chat = new IslandsChat(config, requestEmitter, sessionManagerAdapter)

}

/**
 * Initializes new empty pending vault and returns its id
 * @isAdmin -
 */
function createAccount(vaultsPath, isAdmin){

    console.log(`Creating account. For admin: ${isAdmin}`);
    //generating id
    let id;
    do{
        id = Vault.generateId()
    }while(fs.existsSync(path.join(vaultsPath, id)))

    //generating hidden service
    const { onion, publicKey, privateKey } = TorController.generateRSA1024Onion()

    fs.ensureDirSync(vaultsPath)
    let storage = storageFactory.make(vaultsPath, id);
    storage.write(KeyBuilder.buildKey("hidden_services", onion), JSON.stringify({
        key: privateKey,
        enabled: true
    }))
    storage.write(VaultPending, "");

    if(isAdmin)   storage.write("admin", "yes")

    Storage.deleteStorage(storage);
    return id;
}

function activateAccounts(adminPort, config, requestEmitter, accounts){
    let vaultFiles = fs.readdirSync(config.vaultsPath)
                             .filter(file=>fs.statSync(path.join(config.vaultsPath, file)).isFile());

    for(let vaultId of vaultFiles){


        if(!isVaultValid(config, vaultId)){
            console.log("Vault is invalid. Ignoring");
            continue;
        }


        let isAdmin = isAdminVault(config, vaultId)
        let port = isAdmin ? adminPort : getPort()

        let account = activateAccount({
            vaultId: vaultId,
            requestEmitter: requestEmitter,
            config: config,
            port: port,
            isAdmin: isAdmin
        })

        accounts.push(account)
    }
}



/**
 * This function initializes web services for each active island account
 *
 */
function activateAccount({port, vaultId, requestEmitter, config, isAdmin}){

    console.log(`Activating account for ${vaultId}`);


    // Creating collection of sessions
    let sessions = new Sessions(requestEmitter)

    let vaultsDir = config.vaultsPath;

    //Creating vault
    console.log("Making vault");
    let vault = makeVault(vaultsDir, vaultId, requestEmitter, sessions)



    //Initializing admin router legacy for admin page if vault belongs to admin
    if(isAdmin){
        activateAdminFeatures(config, vaultId, port)
    }


    console.log("Creatig webservice");
    let webService = createWebService(vault, sessions,  port, isAdmin);
    webService.launch();


    const torControl = new TorController({ host: config.torConnector.torControlHost, port: config.torConnector.torControlPort, password:  config.torConnector.torControlPassword })
    let hiddenServices = launchHiddenServices(vault, port, torControl)

    return {
        webService: webService,
        vault: vault,
        sessions: sessions,
        hiddenServices: hiddenServices
    }
}


function isAdminVault(config, vaultId){

    console.log(`vaultsPath: ${config.vaultsPath}, id: ${vaultId}`);
    console.dir(config)
    let storage = storageFactory.make(config.vaultsPath, vaultId)
    let res = storage.has("admin");
    Storage.deleteStorage(storage);
    return res;
}

function ensureAdminVaultExist({config, requestEmitter, adminPort, accounts}){
    let vaultsPath = config.vaultsPath;
    ensureDirExist(vaultsPath);

    let adminVault = accounts.filter(account=>account.vault.isAdmin())[0]


    if(adminVault === undefined){
        let newId = createAccount(vaultsPath, true)

        let account = activateAccount({
            vaultId: newId,
            requestEmitter: requestEmitter,
            config: config,
            port: adminPort,
            host: HOST,
            isAdmin: true
        })

        activateAdminFeatures(config, newId, adminPort )
        accounts.push(account)

    }
}

function ensureDirExist(dirPath){
    if(!fs.existsSync(dirPath)){
        console.log(`Directory doesn't exist: ${dirPath}. Creating...`);
        fs.mkdirSync(dirPath)
    }
}

function validateDirStructure(config){
    ensureDirExist(config.basePath)
    ensureDirExist(config.vaultsPath)

    //ensureDirExist(config.hsVaultMap)
    //ensureDirExist(config.hiddenServicesPath)
}


//Creates dedicated web service for a given vault
function createWebService(vault, sessions, port, isAdmin){

    let routers = isAdmin ? [ RouterFactory.AppRouter(vault), RouterFactory.AdminRouter(vault) ]
        : [ RouterFactory.AppRouter(vault) ]

    let webService = new WebService({
        routers: routers,
        port: port,
        host: HOST,
        viewsPath: path.join(__dirname, "views"),
        staticPath: path.join(__dirname, "..", "public")
    })



    webService.on('connection', (socket)=>{
        console.log("New incoming connection");
        new PendingConnection({
            connector: ConnectorAbstractFactory.getServerConnectorFactory().make(socket),
            sessions: sessions,
            vault: vault
        })
    })

    return webService
}

function makeVault(vaultsDir, vaultId, requestEmitter, sessions){

    // Creating vault secretary
    let secretary = new VaultSecretary(vaultId, sessions);

    let storage = storageFactory.make(vaultsDir, vaultId)
    storage.enableBackup()


    let vault = new Vault({
        vaultId: vaultId,
        requestEmitter: requestEmitter,
        storage: storage,
        secretary: secretary
    })
    return vault
}


//given a vault launches all its hidden services and returns a list of them
function launchHiddenServices(vault, port, torControl){

    //launching hidden services
    let hiddenServices = vault.loadHiddenServices().map(hsData=>{
        let hs= new HiddenService({
            onion: hsData.onion,
            control: torControl,
            host: HOST,
            port: port,
            privateKey: hsData.privateKey,
            isEnabled: hsData.isEnabled
        })
        hs.launch()
        return hs
    });

    return hiddenServices
}

//given admin vault ID config host port activates admin server
function activateAdminFeatures(config, vaultId, port){
    AdminServer.initAdminEnv(config, vaultId, HOST, port)
}


function isVaultValid(config, vaultId){
    // Vault is valid only when the id is in hex and of certain length
    let vPath = config.vaultsPath
    let regex = new RegExp(`[0-9a-f]{${VaultIdLength}}`)
    let res = StorageSQLite.isFormatValid(path.join(vPath, vaultId)) && regex.test(vaultId)
    console.log(`Is vault valid: ${vaultId} ${res}`);
    return res
}

main();
