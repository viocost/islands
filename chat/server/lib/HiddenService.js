const fs = require("fs-extra")

class HiddenService{

    constructor({onion, key, host, port, control, hsPath}){
        this.onion = onion;
        this.control = control
        this.host = host;
        this.port = port;
        this.path = hsPath;
        this.key =  JSON.parse(fs.readFileSync(this.path, "utf8")).key
    }


    launch(){
        this.control.launchOnionWithKey({host: this.host, port: this.port, key: this.key})
            .then(()=>{})
            .catch((err)=>{ console.log(`Launch hidden service error: ${err}`)})
    }

    kill(){
        this.control.kill

    }


    enable(){

    }

    disable(){
       
    }


    isEnabled(){
        return JSON.parse(fs.readFileSync(this.path, "utf8")).enabled
    }

}



module.exports = {
    HiddenService: HiddenService
}
