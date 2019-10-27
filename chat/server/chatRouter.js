const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const VaultManager = require("./classes/libs/VaultManager");
const version = require("./classes/libs/Version");

let vaultManager;
let VERSION;

module.exports.init = function(config, version) {
    VERSION = version;
    vaultManager = new VaultManager(config);
}

router.get('/', (req, res)=>{
    res.render("chat", {title:"Islands chat", version: version.getVersion()});
});




module.exports.router = router;
