


let configPath = path.join(__dirname, 'config', 'config.json');
let historyPath = "../history/";
let adminKeysPath = "../keys/";
let servicePath = "../service/";
let logger;


const basePath = path.join(verifyGetConfigParameter("ISLANDS_DATA"), "IslandsChat");
const torPassword = verifyGetConfigParameter("TOR_PASSWD", configFile);
const torControlPort = verifyGetConfigParameter("TOR_CONTROL_PORT", configFile);
const torControlHost = verifyGetConfigParameter("TOR_CONTROL_HOST", configFile);
const torHost = verifyGetConfigParameter("TOR_HOST", configFile);
const torPort = verifyGetConfigParameter("TOR_PORT", configFile);
const torSOCKSPort = verifyGetConfigParameter("TOR_SOCKS_PORT", configFile);


if(!fs.existsSync(basePath)){
    try{
        fs.mkdirSync(basePath)
    }catch (err){
        console.log(`Unable to create base directory: ${err}`)
        console.log("Exiting...");
        process.exit
    }
}

const config = {
    "historyPath":        path.join(basePath, "history"),
    "updatePath":         path.join(basePath, "update"),
    "adminKeyPath":       path.join(basePath, "keys"),
    "vaultsPath":         path.join(basePath, "vaults"),
    "servicePath":        path.join(basePath, "service"),
    "hsVaultMap":         path.join(basePath, "hsmap"),
    "hiddenServicesPath": path.join(basePath, "hs"),
    "basePath":           basePath,
    "vaultIdLength":      64,
    "torConnector": {
        "hiddenServiceHOST": torHost,
        "hiddenServicePORT": torPort,
        "torListenerPort": 80,
        "torControlHost": torControlHost,
        "torControlPort": torControlPort,
        "torControlPassword" : torPassword,
        "torSOCKSPort": torSOCKSPort
    }
}



historyPath = config.historyPath || historyPath;
let updatePath = config.updatePath || "../update";

let adminKeyPath = config.adminKeyPath || "../keys";

servicePath = config.servicePath || "../service/";

let configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
