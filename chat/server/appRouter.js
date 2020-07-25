const { Router } = require("express");
const router = Router();
//const VaultManager = require("./classes/libs/VaultManager");
//const Logger = require("./classes/libs/Logger");
//const AdminKey = require("./classes/libs/AdminKey");
//const HSMap = require("./classes/libs/HSVaultMap");
//const { isSecured } = require("./classes/AdminServer");


//let vaultManager;

////////////////////////////////////////////////////
// module.exports.init = function(config) {       //
//  //   vaultManager = new VaultManager(config); //
// }                                              //
////////////////////////////////////////////////////

router.get('/', (req, res)=>{
    console.log(`GET chat. Version ${global.VERSION}`);

    res.render("chat", {
        title:"Islands chat",
        version: global.VERSION,
        registration: false,

    });
});


// Posting to root path interpreted as a login attempt
// processing login
router.get("/vault", (req, res)=>{
    /////////////////////////////////////////////////////////////////////////
    // try{                                                                //
    //     let id = getVaultId(req.headers["host"]);                       //
    //     if(!id){                                                        //
    //         res.set("Content-Type", "application/json")                 //
    //         res.status(401).send("Vault login error: vault not found"); //
    //     } else {                                                        //
    //         let vault = vaultManager.getVault(id);                      //
    //         res.set("Content-Type", "application/json")                 //
    //            .status(200).send({"vault": vault, "vaultId": id })      //
    //     }                                                               //
    // }catch(err){                                                        //
    //     Logger.warn(err.message, {stack: err.stack, cat: "login"});     //
    //     res.set("Content-Type", "application/json")                     //
    //     res.status(400).send("Vault login error.");                     //
    // }                                                                   //
    /////////////////////////////////////////////////////////////////////////
});


// Posting to root path interpreted as a login attempt
// processing login
router.get("/topics", (req, res)=>{
    res.status(200).send("Topics")
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // try{                                                                                       //
    //     let id = getVaultId(req.headers["host"]);                                              //
    //     if(!id){                                                                               //
    //         res.set("Content-Type", "application/json")                                        //
    //         res.status(401).send("Vault login error: vault not found");                        //
    //     } else {                                                                               //
    //         let topics = vaultManager.getTopics(id);                                           //
    //         res.set("Content-Type", "application/json")                                        //
    //            .status(200).send({"topics": topics, "vaultId": id, "version": global.VERSION}) //
    //     }                                                                                      //
    // }catch(err){                                                                               //
    //     Logger.warn(err.message, {stack: err.stack, cat: "login"});                            //
    //     res.set("Content-Type", "application/json")                                            //
    //     res.status(400).send("Vault login error.");                                            //
    // }                                                                                          //
    ////////////////////////////////////////////////////////////////////////////////////////////////
});

router.post("/register", (req, res)=>{
    console.log("GUEST REGISTRATION!");
    /////////////////////////////////////////////////////////////////////////////
    // if(!isVaultAwaitingRegistration(req.headers.host)) {                    //
    //     res.status(401).send("Error: vault is not awaiting registration."); //
    //     return;                                                             //
    // }                                                                       //
    // guestVaultRegistration(req, res);                                       //
    /////////////////////////////////////////////////////////////////////////////
})

function guestVaultRegistration(req, res){
    ////////////////////////////////////////////////////////////////
    // try{                                                       //
    //     let host = req.headers["host"];                        //
    //     let vaultId = getVaultId(host);                        //
    //     let vaultData = req.body;                              //
    //     console.log(`vault hash is : ${vaultData.vaultHash}`); //
    //     vaultManager.completeRegistration(                     //
    //         vaultData.vault,                                   //
    //         vaultData.vaultHash,                               //
    //         vaultData.vaultSign,                               //
    //         vaultData.vaultPublicKey,                          //
    //         vaultId                                            //
    //         );                                                 //
    //     res.set("Content-Type", "application/json");           //
    //     res.status(200).send(req.body);                        //
    // }catch(err){                                               //
    //     res.status(400).send({error: err})                     //
    // }                                                          //
    ////////////////////////////////////////////////////////////////
}


module.exports.router = router;
