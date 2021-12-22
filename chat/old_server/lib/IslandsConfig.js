const { createDerivedErrorClasses } = require("../../common/DynamicError");
const path = require("path")
const fs = require("fs-extra")


class IslandsConfigError extends Error{ constructor(data){ super(data); this.name = "IslandsConfigError" } }
const err = createDerivedErrorClasses(IslandsConfigError, {
    unableCreateBase: "UnableToCreateBaseDirectory"
})

function prepareConfig(){
    let configPath = path.join(__dirname, "../", 'config', 'config.json');
    let configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
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
            throw new err.unableCreateBase(err.message);
        }
    }

    let config = {
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

    console.dir(config)

    return config


//    historyPath = config.historyPath || historyPath;
//    let updatePath = config.updatePath || "../update";

 //   let adminKeyPath = config.adminKeyPath || "../keys";

  //  servicePath = config.servicePath || "../service/";

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
    prepareConfig: prepareConfig
}
