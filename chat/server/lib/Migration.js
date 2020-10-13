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

    CONFIG = config;
    let version = getVersion(config.basePath);

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


// This is the first migration
// Moves all hidden service to corresponding vaults
// Removes HS map
//
function toVersion1(config){
    console.log("Migrating to version 1");
    const { getMap, init } = require("../../old_server/classes/libs/HSVaultMap")
    init(config.hsVaultMap)
    let hsVaultMap = getMap()

    let vaultsPath = config.vaultsPath;

    //Reading all vaults directories names
    let vaults = fs.readdirSync(vaultsPath);

    //Only getting an admin vault
    let adminVaultId = vaults.filter(vaultId =>{
        return isAdminVault(vaultId, hsVaultMap);
    })[0];



    //for each vault directory
    for (let vaultId of vaults){
        let vaultDir = path.join(vaultsPath, vaultId)
        let hsDir = path.join(vaultDir, "hidden_services")
        if(!fs.existsSync(hsDir)){
            //creating hidden service directory
            fs.mkdirSync(hsDir);
        }

        // Obtaining hidden services that belong to this vault
        let hiddenServices = Object.keys(hsVaultMap).filter(onion=>{
            return hsVaultMap[onion].vaultID === vaultId;
        })

        //Saving each hidden service in the directory
        for(let onion of hiddenServices){
            let hsPath = path.join(hsDir, onion)
            let key = fs.readFileSync(path.join(config.hiddenServicesPath, onion), "utf8")
            fs.writeFileSync(hsPath, JSON.stringify({
                key: key,
                enabled:  hsVaultMap[onion].enabled
            }))
        }
    }

    //Now admin vault is identified by an empty admin file in vault dir
    fs.writeFileSync(path.join(vaultsPath, adminVaultId, "admin"), "");

    //Writing vault version for future reference
    fs.writeFileSync(path.join(config.basePath, VERSION_FILENAME), "1")
    console.log("Migration to version 1 is completed");
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

module.exports = {
    migrate: migrate
}
