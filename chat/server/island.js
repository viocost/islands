const { buildConfig } = require("./Config")
const { Vault, Vaults } = require("./Vault")
const { WebService } = require("./WebService")
const { parseArguments } = require("./ArgParser");
const fs = require("fs-extra")
const path = require("path")


const accounts = [];
const vaults = [];

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

    //Initializing vaults
    const vaults = loadVaults(config.vaultsPath);

    //if admin vault does not exist - create it
    for(let vault of vaults){
        activateAccount(vault)
    }
}

//disable account functionality

function loadVaults(vaultsPath, config, requestEmitter){
    let vaultDirectories = fs.readdirSync(vaultsPath);
    let vaults = [];

    for (let vaultId of vaultDirectories){
        let fullVaultDir = path.join(vaultsPath, vaultId)
        vaults.push(new Vault(vaultId, fullVaultDir, requestEmitter));
    }

    return vaults;
}

main();
