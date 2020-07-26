const { buildConfig } = require("./Config")
const { VaultsDirectory, Vaults } = require("./Vault")
const { WebService } = require("./WebService")


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



    //Initializing vaults
    const vaults = new VaultsDirectory(config.vaultsPath)
    vaults.loadVaults()


    //if admin vault does not exist - create it
    let accounts = []

    for(let vault of vaults){
        let webService = new WebService()
        let sessions = new Sessions(vault)
        let hiddenService = new HiddenService();
        webService.on('connection', (ClientConnectionSocket)=>{
            sessions.add(socket)
        })
        accounts.push([webService, sessions, hiddenService])

    }


}

//disable account functionality


main();
