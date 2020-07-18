const Logger = require("./classes/libs/Logger.js");
const { StateMachine } = require("../common/AdvStateMachine");


Logger.initLogger(config.servicePath, "debug");



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


const islandSM = prepareIslandStateMachine();
//setup state machine





//Say hello
let helloMsg = "!!=====ISLANDS v." + global.VERSION + " =====!!"
Logger.info(helloMsg);



function prepareIslandStateMachine(){
    return new StateMachine(null, {
        name: "Island SM",
        stateMap: {

        }
    })
}
