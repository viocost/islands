const express = require("express");
const router = express.Router();
const { iCrypto } = require('../common/iCrypto')
const fs = require("fs-extra");
const Logger = require("./classes/libs/Logger");
const HSMap = require("./classes/libs/HSVaultMap");
const version = require("./classes/libs/Version");
const adminServer = require('./classes/AdminServer');
const { RouterHolder } = require("../server/lib/RouterHolder")

let VERSION;

router.get("/vault", (req, res)=>{
   let { vault } =  adminServer.getAdminVault();
   res.set("Content-Type", "application/json")
      .status(200).send({
          "vault": vault,
          "version": version.getVersion()
      })

});

router.get('/', (req, res)=>{

    //Admin called when island key is not yet registered or no-vault flag passed
        //render the page

    //Admin called and admin is set up
        //Find admin vault
        //Return the page
    let host = req.headers["host"];

    let hiddenServices = adminServer.getHiddenServices()

    if(!isOnion(host) || HSMap.isAdmin(host)){
        res.render("admin", {
            title:"Admin login",
            secured: adminServer.isSecured(),
            vault: undefined,
            version: version.getVersion(),
            hs: iCrypto.hexEncode(JSON.stringify(hiddenServices))
        });
    } else {
        res.status(403).send("Forbidden");
    }
});

router.post('/', (req, res)=>{
    adminServer.handleAdminRequest(req, res)
})

function isOnion(host){
    let pattern = /.*[a-z2-7]{16}\.onion.*/;
    return pattern.test(host);
}


module.exports.init = (app, config, adminKeyPath, updatePath)=>{
    adminServer.setKeyFolder(adminKeyPath, updatePath);
    adminServer.initAdminEnv(app, config, HOST, PORT);
};



module.exports.router = new RouterHolder("/admin", router)
