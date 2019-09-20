const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const VaultManager = require("./classes/libs/VaultManager");
const HSMap = require("./classes/libs/HSVaultMap");
const AdminKey = require("./classes/libs/AdminKey");
const Logger = require("./classes/libs/Logger");
const version = require("./classes/libs/Version");

let vaultManager;

let VERSION; //Depricated

let hiddenServiceManager;

module.exports.init = function(config, version, hsManager) {
    VERSION = version;
    vaultManager = new VaultManager(config);
    hiddenServiceManager = hsManager
};

router.get('/', (req, res)=>{
    let onion = req.headers["host"];
    let isRegistration = isVaultAwaitingRegistration(onion);
    res.render("vault", {
        version: version.getVersion(),
        title: "Islands chat - Vault",
        registration: isRegistration,
    });
});


router.post("/", (req, res)=>{
    Logger.debug("Got vault post request")
    try{
        let id = getVaultId(req.headers["host"]);
        if(!id){

            Logger.debug("Error, no id!")
            res.set("Content-Type", "application/json")
            res.status(401).send("Vault login error: vault not found");
        } else {
            Logger.debug("Data is correct")
            let vault = vaultManager.getVault(id);
            res.type('json').set("Content-Type", "application/json")
                .status(200).send({"vault": vault})
        }
    }catch(err){
        Logger.warn(err.message);
        res.set("Content-Type", "application/json")
        res.status(400).send("Vault login error.");
    }
});


router.post("/register", (req, res)=>{
    try{
        let host = req.headers["host"];
        let vaultId = getVaultId(host);
        let vaultData = req.body;
        vaultManager.completeRegistration(
            vaultData.vault,
            vaultData.vaultSign,
            vaultData.vaultPublicKey,
            vaultId
            );
        res.set("Content-Type", "application/json");
        res.status(200).send(req.body);
    }catch(err){
        Logger.debug(err)
        res.status(400).send({error: err})
    }

});

router.post("/update", (req, res)=>{
    let host = req.headers["host"];
    let vaultId = getVaultId(host);
    try{
        vaultManager.updateVault(req.body.vault, vaultId, req.body.sign);
        res.set("Content-Type", "application/json");
        res.status(200).send(req.body);
    }catch(err){
        Logger.error(err.message);
        res.set("Content-Type", "application/json");
        res.status(500).send({error: err.message})
    }
});


router.get('/get/:id', (req, res)=>{
    let vaultID = req.params.id;

    try{
        let vaultData = vaultManager.getVault(vaultID);
        res.set('Content-Type', 'application/json');
        res.status(200).send({vault: vaultData})
    }catch(err){
        res.status(500).send({error: err})
    }
});


// router.get("/testios", (req, res)=>{
//     res.render("iostest");
// })



function isVaultAwaitingRegistration(onion){
    let vaultID = HSMap.getVaultId(onion);
    if (!vaultID){
        return false;
    }
    return vaultManager.isRegistrationPending(vaultID);

}

//Given a host returns vault ID associated with it
//IF host is not an onion address - id of admin vault returned
//If no vault matches onion address - undefined returned
function getVaultId (host){
    if (!isOnion(host)) {
        return AdminKey.getPkfp();
    } else {
        return HSMap.getVaultId(extractOnion(host));
    }
}


function isOnion(host){
    let pattern = /.*[a-z2-7]{16}\.onion.*/;
    return pattern.test(host);
}

function extractOnion(host){
    return host.match(/[a-z2-7]{16}\.onion/)[0];
}

module.exports.router = router;

