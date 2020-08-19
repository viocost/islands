const { buildConfig } = require("./Config")
const { Vault, Vaults } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const Logger = require("../old_server/classes/libs/Logger");

const fs = require("fs-extra")
const path = require("path")

const { getMap, init } = require("../old_server/classes/libs/HSVaultMap")

const HistoryManager = require("../old_server/classes/libs/HistoryManager.js");
const ClientRequestRouter = require("../old_server/classes/libs/ClientRequestCollector.js");

const accounts = [];
const vaults = [];


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


    //Initializing logger
    Logger.initLogger(config.servicePath, global.DEBUG ? "debug" : "info");


    // TODO Refactor
    //Initializing hsVaultMap
    init(config.hsVaultMap)


    ensureDirExist(config.basePath);

    //Initializing vaults

    //const vaults = loadVaults(config.vaultsPath);

    //activateAdminAccount(vaults, args.port, config)

    //activateGuestAccounts(vaults)
    const requestEmitter = new ClientRequestRouter();
    activateAccounts(args.port, config, requestEmitter)

}

/**
 * TODO Refactor this later when change storage system
 */
function activateAccounts(port, config, requestEmitter){
    let vaultsPath = config.vaultsPath;
    ensureDirExist(vaultsPath);
    let vaultDirectories = fs.readdirSync(vaultsPath);

    switch(vaultDirectories.length){

        case 0: {//No vaults. Creating pending admin vault and initializing admin service
            console.log("No vaults. Initializing pending admin vault");
            let newVaultId = Vault.generateID();
            let vault = new Vault(newVaultId, path.join(vaultsPath, newVaultId),  requestEmitter)
            activateAccount(vault, );
        }
        case 1:{  //Only a single vault, which assumed to be admin
            console.log("Initializing existing admin vault");
            let vaultId = vaultDirectories[0]
            let vault = new Vault(vaultId, path.join(vaultsPath, vaultId), requestEmitter)
            activateAccount(vault);
        }
        default: {  // Figuring out which accoutn is which and activating all
            for(let vaultId of vaultDirectories){
                let vault = new Vault(vaultId, path.join(vaultsPath, vaultId), requestEmitter)

                if(isAdminVault(vaultId)){

                    //Activating admin vault with provided port number
                    activateAccount(vault, port)
                } else {

                    //Activate with ephemeral port
                    activateAccount(vault)
                }
            }
        }


    }


    let vaults = [];

    for (let vaultId of vaultDirectories){
        let fullVaultDir = path.join(vaultsPath, vaultId)
        vaults.push(new Vault(vaultId, fullVaultDir, requestEmitter));
    }

    return vaults;
}

/**
 * TODO Refactor this
 *
 * Currently admin vault is determined only by the way island is accessed
 * If it is accessed via direct link - then it is considered as admin
 *
 * If accessed via onion - then there is a JSON blob that has mapping
 * onion->{vaultID, isAdmin, isEnabled} (names are different in hsVaultMap)
 *
 * Guests could only access island via onion, not via direct link
 *
 * Admin vault may not have any onion activated, so the map will contain only guest
 * onion services.
 *
 * Given vaultId this function loads hsVaultMap.
 * If vaultId not in map, then we assume that it is admin
 * otherwise we read isAdmin ("admin") value from the map for corresponding vaultId
 *
 */
function isAdminVault(vaultID){
    let hsVaultMap = getMap()
    let adminOnions = Object.keys(hsVaultMap).filter(onion=>{
        return hsVaultMap[onion].vaultID === vaultID;
    })

    if (adminOnions.length === 0){
        return true
    } else {
        return hsVaultMap[adminOnions[0]].admin;
    }
}

function activateAccount(vault, requestEmitter, port){

    console.log(`Activating account for ${vault.id}`);
    let webService = new WebService({})
    let sessions =null //new Sessions(vault)
    let hiddenService = null;  //new HiddenService();
    webService.on('connection', (socket)=>{
        //need to figure out if
        sessions.add(socket)
        //create new session and add it
    })
    accounts.push([webService, sessions, hiddenService])
}


//Initializing leagcy managers
function initializeManagers(){
        this.clientRequestEmitter = new ClientRequestRouter();
        this.hm = new HistoryManager(this.historyPath);
}

function ensureDirExist(dirPath){
    if(!fs.existsSync(dirPath)){
        console.log(`Directory doesn't exist: ${dirPath}. Creating...`);
        fs.mkdirSync(dirPath)
    }
}

main();
