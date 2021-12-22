const path = require("path")
const fs = require("fs-extra")
const HistoryManager = require("../../old_server/classes/libs/HistoryManager")

/**
 * This module does automatic data migrations based on version.
 * Such migrations are done when client doesn't have to be involved
 *
 */


const VERSION_FILENAME = "data_version";
const CURRENT_VERSION = 0;
const MIGRATION_SEQUENCE = [ upToDate ]


let CONFIG;

function migrate(config){

    CONFIG = config;
    let version = getVersion(config.basePath);

    if(version < 0 || version > CURRENT_VERSION){
        throw new Error(`Migration error: invalid version "${version}"`)
    }

    for(let step of MIGRATION_SEQUENCE.slice(version)){
        step(config)
    }


}


function getVersion(basePath){
    let pathToVersion = path.join(basePath, VERSION_FILENAME)
    if(fs.existsSync(pathToVersion)){
        return parseInt(fs.readFileSync(pathToVersion).toString("utf8"))
    }

    return 0;
}




function upToDate(){
    console.log("Data version is up to date.")
}


function ensureDataVersion(basePath){

    let pathToVersion = path.join(basePath, VERSION_FILENAME)
    let pathToVaults = path.join(basePath, "vaults");
    if(fs.readdirSync(pathToVaults).length === 0 && !fs.existsSync(pathToVersion)){
        fs.writeFileSync(pathToVersion, String(CURRENT_VERSION))
    }


    return 0;
}

module.exports = {
    migrate: migrate,
    ensureDataVersion: ensureDataVersion
}
