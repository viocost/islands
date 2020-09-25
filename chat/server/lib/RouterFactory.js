const { Router } = require("express");
const { RouterHolder } = require("./RouterHolder")
const AdminRouterLib = require("../../old_server/adminRouter")

function AppRouter(vault){
    const router = Router()
    router.get('/', (req, res)=>{
        console.log(`GET chat. Version ${global.VERSION}`);

        res.render("chat", {
            title:"Islands chat",
            version: global.VERSION,
            registration: vault.isPending(),
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
        let topics  = vault.getTopics();
        res.status(200).send({ topics: topics })
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

    return new RouterHolder("/", router);
}


function AdminRouter(vault){
    return AdminRouterLib.router
}

module.exports = {
    RouterFactory: {
        AppRouter: AppRouter,
        AdminRouter: AdminRouter
    }
}
