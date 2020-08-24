
class HiddenService{

    constructor({onion, key, host, port, control}){
        this.onion = onion;
        this.key = key;
        this.control = control
        this.host = host;
        this.port = port;
    }


    launch(){
        this.control.launchOnionWithKey({host: this.host, port: this.port, key: this.key})
    }

    enable(){

    }

    disable(){

    }

}



module.exports = {
    HiddenService: HiddenService
}
