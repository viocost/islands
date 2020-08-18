const { buildConfig } = require("./Config")
const { Vault, Vaults } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const fs = require("fs-extra")
const path = require("path")

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

    ensureDirExist(config.basePath);

    //Initializing vaults

    const vaults = loadVaults(config.vaultsPath);

    activateAdminAccount(vaults, args.port, config)

    activateGuestAccounts(vaults)

}


function activateAdminAccount(vaults, port, config){

    ensureAdminVaultExist()

    let adminVault = vaults.filter( v =>{
        return v.id = getAdminVaultId()
    })

    if(adminVault.length === 0){
        //make admin vault
        new Vault(adminVaultId)

    }

    activateAccount()

}

/**
 * TODO Refactor this later when change storage system
 */
function activateAccounts(port, config, requestEmitter){
    let vaultsPath = config.vaultsPath;
    ensureDirExist(vaultsPath);
    let vaultDirectories = fs.readdirSync(vaultsPath);

    switch(vaultDirectories.length){

        case 0: //No vaults. Creating pending admin vault and initializing admin service
            console.log("Initializing admin");
            let newVaultId = Vault.generateID();
            let vault = new Vault(newVaultId, path.join(vaultsPath, newVaultId),  requestEmitter)
            activateAccount(vault);

        case 1: //Only a single vault, which assumed to be admin
            console.log("Initializing existing admin vault");
            let vaultId = vaultDirectories[0]
            let vault = new Vault(vaultId, path.join(vaultsPath, vaultId), requestEmitter)
            activateAccount(vault);

        default: // More than 1 vault. Figuring out which accoutn is which and activating all
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


    let vaults = [];

    for (let vaultId of vaultDirectories){
        let fullVaultDir = path.join(vaultsPath, vaultId)
        vaults.push(new Vault(vaultId, fullVaultDir, requestEmitter));
    }

    return vaults;
}

function activateGuestAccounts(vaults){
    //if admin vault does not exist - create it

    for(let vault of vaults){
        activateAccount(vault)
    }
}

//disable account functionality

function ensureAdminVaultExist(vaults){
    //if no vaults - then there's no admin vault

    // If there's one vault - then that's the admin's vault

    // else (multiple vaults) do any magic to determine which vault belongs to admin and return its id
    //

}

function loadVaults(vaultsPath, config, requestEmitter){
}


function activateAccount(vault, requestEmitter){
    let webService = new WebService()
    let sessions = new Sessions(vault)
    let hiddenService = new HiddenService();
    webService.on('connection', (socket)=>{
        //need to figure out if
        sessions.add(socket)
        //create new session and add it
    })
    accounts.push([webService, sessions, hiddenService])
}

function isAdminVault(vaultId){

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
