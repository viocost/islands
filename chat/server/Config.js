const path = require("path")
const fs = require("fs-extra")


let configPath = path.join(__dirname, '..', 'old_server',  'config', 'config.json');


function buildConfig(){

    const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const basePath = path.join(verifyGetConfigParameter("ISLANDS_DATA"), "IslandsChat");
    const torPassword = verifyGetConfigParameter("TOR_PASSWD", configFile);
    const torControlPort = verifyGetConfigParameter("TOR_CONTROL_PORT", configFile);
    const torControlHost = verifyGetConfigParameter("TOR_CONTROL_HOST", configFile);
    const torHost = "0.0.0.0"//verifyGetConfigParameter("TOR_HOST", configFile);
    const torPort = verifyGetConfigParameter("TOR_PORT", configFile);
    const torSOCKSPort = verifyGetConfigParameter("TOR_SOCKS_PORT", configFile);

    return {
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
}


function verifyGetConfigParameter(param, configFile){
    if(process.env[param]){
        return process.env[param]
    } else if (!global.DEBUG || !configFile[param]){
        console.error(`Required parameter ${param} has not been provided. Note that production mode requires paramters to be passed via environment variables. \nExiting...`)
        process.exit(1)
    } else {
        return configFile[param]
    }
}

module.exports = {
    buildConfig: buildConfig
}
