const { Router } = require("express");
const router = Router();
const VaultManager = require("./classes/libs/VaultManager");
const Logger = require("./classes/libs/Logger");
const AdminKey = require("./classes/libs/AdminKey");

let vaultManager;

module.exports.init = function(config) {
    vaultManager = new VaultManager(config);
}

router.get('/', (req, res)=>{
    console.log(`GET chat. Version ${global.VERSION}`);
    res.render("chat", {title:"Islands chat", version: global.VERSION});
});


// Posting to root path interpreted as a login attempt
// processing login
router.post("/", (req, res)=>{
    try{
        let id = getVaultId(req.headers["host"]);
        if(!id){
            res.set("Content-Type", "application/json")
            res.status(401).send("Vault login error: vault not found");
        } else {
            let vault = vaultManager.getVault(id);
            res.set("Content-Type", "application/json")
               .status(200).send({"vault": vault, "vaultId": id})
        }
    }catch(err){
        Logger.warn(err.message, {stack: err.stack, cat: "login"});
        res.set("Content-Type", "application/json")
        res.status(400).send("Vault login error.");
    }
});


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
