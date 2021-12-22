const Logger = require("./classes/libs/Logger");
const { prepareConfig } = require("./lib/IslandsConfig");
const { StateMachine } = require("../common/AdvStateMachine");
const fs = require("fs-extra")


//Logger.initLogger(config.servicePath, "debug");
const VaultRegistrators = {}


//parse arguments
let adminKeysPath  
let HOST
let PORT
let oneTimePassword

process.argv.forEach((val, index, array)=>{
    switch(val){
        case "-otp":
            oneTimePassword = process.argv[index+1]
            break
        case "-p":
            PORT = process.argv[index+1];
            break;
        case "-h":
            HOST = process.argv[index+1];
            break;
        case "-k":
            adminKeysPath = process.argv[index+1];
            break
        case "--debug":
            console.log("Setting global debug to true");
            global.DEBUG = true;
            break
    }
});



//create config
const config = prepareConfig();

//convert legacy


loadVaults(config.vaultsPath)

function loadVaults(vaultsPath){

    fs.readdirSync(vaultsPath).map(()=> {

        return new Vault(config)
    })

}

//check admin account
// TODO Later rafactor vault system


//notify parent if can start

//or notify that cannot and exit;

//const islandSM = prepareIslandStateMachine();
//setup state machine


//Say hello
let helloMsg = "!!=====ISLANDS v." + global.VERSION + " =====!!"
//Logger.info(helloMsg);



function prepareIslandStateMachine(){
    return new StateMachine(null, {
        name: "Island SM",
        stateMap: {

        }
    })
}


