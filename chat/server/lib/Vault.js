const path = require("path");
const fs = require("fs-extra");
const { EventEmitter } = require('events');
const { StateMachine } = require('adv-state')

class Vault extends EventEmitter{

    constructor(id, config){
        super();
        this.id = id;
        this.onions = []
    }


    updateVaultSettings(){

    }


    saveTopic(){

    }

    deleteTopic(){

    }

    //This called when user tries to login
    authenticate(){

    }


    saveVault(){

    }

    loadOnions(){

    }

}



module.exports = Vault;
