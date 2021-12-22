const fs = require("fs-extra")

class HiddenService{

    constructor({onion, host, port, control, privateKey, isEnabled, storage}){
        this.onion = onion;
        this.control = control
        this.host = host;
        this.port = port;
        this.path = hsPath;
        this.key =  privateKey;
        this.isEnabled = isEnabled;


    }


    launch(){
        this.control.launchOnionWithKey({host: this.host, port: this.port, key: this.key})
            .then(()=>{})
            .catch((err)=>{ console.log(`Launch hidden service error: ${err}`)})
    }

    kill(){

    }


    enable(){

    }

    disable(){
       
    }


    isEnabled(){
        return this.isEnabled;
    }

}



module.exports = {
    HiddenService: HiddenService
}
