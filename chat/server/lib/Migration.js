const path = require("path")
const fs = require("fs-extra")

/**
 * This module does automatic data migrations based on version.
 * Such migrations are done when client doesn't have to be involved
 *
 */


const VERSION_FILENAME = "data_version"
const MIGRATION_SEQUENCE = [ toVersion1, upToDate ]

let CONFIG;

function migrate(config){

    let version = getVersion(config.basePath);

    CONFIG = config;

    for(let migrate of MIGRATION_SEQUENCE.slice(version)){
        migrate()
    }


}


function getVersion(basePath){
    let pathToVersion = path.join(basePath, VERSION_FILENAME)
    if(fs.existsSync(pathToVersion)){
        return parseInt(fs.readFileSync(pathToVersion).toString("utf8"))
    }

    return 0;
}


// This is the first migration
// Moves all hidden service to corresponding vaults
// Removes HS map
//
function toVersion1(){
    console.log("Migrating to version 1");
    const { getMap, init } = require("../../old_server/classes/libs/HSVaultMap")
    init(CONFIG.hsVaultMap)
    let hsVaultMap = getMap()

    let vaultsPath = CONFIG.vaultsPath;
    let vaults = fs.readdirSync(vaultsPath);
    let adminVaultId = vaults.filter(vaultId =>{
        return isAdminVault(vaultId, hsVaultMap);
    })[0];




    for (let vaultId of fs.readdirSync(vaultsPath)){
        let vaultDir = path.join(vaultsPath, vaultId)
        let hsDir = path.join(vaultDir, "hidden_services")
        if(!fs.existsSync(hsDir)){
            fs.mkdirSync(hsDir);
        }


    }





}


function upToDate(){
    console.log("Data version is up to date.")
}



/**
 * This function is for upgrading from version 0 to version 1
 *
 * Currently admin vault is determined only by the way island is accessed
 * If it is accessed via direct link - then it is considered as admin
 *
 * If accessed via onion - then there is a JSON blob that has mapping
 * onion->{vaultID, isAdmin, isEnabled} (names are different in hsVaultMap)
 *
 * Guests could only access island via onion, not via direct link
 *
 * Admin vault may not have any onion activated, so the map will contain only guest
 * onion services.
 *
 * Given vaultId this function loads hsVaultMap.
 * If vaultId not in map, then we assume that it is admin
 * otherwise we read isAdmin ("admin") value from the map for corresponding vaultId
 *
 */
function isAdminVault(vaultID, hsVaultMap){
    let adminOnions = Object.keys(hsVaultMap).filter(onion=>{
        return hsVaultMap[onion].vaultID === vaultID;
    })

    if (adminOnions.length === 0){
        return true
    } else {
        return hsVaultMap[adminOnions[0]].admin;
    }
}
