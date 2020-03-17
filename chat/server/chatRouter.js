const express = require("express");
const router = express.Router();
const VaultManager = require("./classes/libs/VaultManager");


module.exports.init = function(config) {
    vaultManager = new VaultManager(config);
}

router.get('/', (req, res)=>{
    console.log(`GET chat. Version ${global.VERSION}`);
    res.render("chat", {title:"Islands chat", version: global.VERSION});
});




module.exports.router = router;
