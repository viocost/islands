const { buildConfig } = require("./Config")
const { VaultsDirectory, Vaults } = require("Vault")


function activateAccount(vault, requestEmitter){
    //create express
    //launch tor service
    //create sessions

}

//create express

function main(){


    console.log("Starting Islands...");

    //Setting global version
    try{
        global.VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "../",'package.json' )).toString()).version;

        console.log(`Version is set to ${global.VERSION}`)
    }catch(err){
        console.trace("Failed to set version: " + err );
        global.VERSION = "version unknown";
    }


    //Building configuration
    const config = buildConfig()
    const VaultsDirectory = new VaultsDirectory(config.vaultsPath)


    //Initializing vaults
    
    //if admin vault does not exist - create it


    //launch vault services


    const vaults = new Vaults()


}

main();
