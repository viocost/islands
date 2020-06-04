const { EventEmitter } = require('events');
const path = require("path");

class Vault extends EventEmitter{

    constructor(id, vaultPath){
        super();
        this.vaultPath = vaultPath;
        this.id = id;
        this.state = VaultState.UNINITIALIZED;
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
