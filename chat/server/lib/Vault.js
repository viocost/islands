const { EventEmitter } = require('events');
const path = require("path");
const fs = require("fs-extra");


class Vault extends EventEmitter{

    constructor(id, vaultPath, webService){
        super();
        this.vaultPath = vaultPath;
        this.webService = webService;
        this.id = id;
        this.state = VaultState.UNINITIALIZED;
        this.onions = []

    }




    //This called when user tries to login
    authenticate(){

    }


    saveVault(){

    }

}


const VaultState = {
    UNINITIALIZED: Symbol("Uninitialized"),
    INITIALIZED: Symbol("Initialized")
}


module.exports = Vault;
