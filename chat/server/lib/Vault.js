const { EventEmitter } = require('events');
const path = require("path");
const fs = require("fs-extra");


class Vault extends EventEmitter{

    constructor(id, config){
        super();
        this.id = id;
        this.vaultPath = path.join(config.vaultsPath, id)
        this.state = VaultState.UNINITIALIZED;
        this.onions = []

    }




    //This called when user tries to login
    authenticate(){

    }


    saveVault(){

    }

}



module.exports = Vault;
