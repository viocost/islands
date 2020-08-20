
class HiddenService{

    constructor({onion, permanent, privateKey}){
        this.id = onion.substring(0, 16);
        this.fullAddress = onion.substring(0, 16) + ".onion";
        this.permanent = !!permanent;
        this.privateKey = privateKey;

    }



    getHSPrivateKey(config, hsid){
        hsid = hsid.substring(0, 16);
        let hsPath = path.join(config.hiddenServicesPath, hsid)
        if(!fs.existsSync(hsPath)){
            throw new Error("Hidden service private key is not found");
        }
        return fs.readFileSync(hsPath, "utf8")
    }

}

HiddenService.Status  = {
    UP: 1,
    DOWN: 2,
    UNKNOWN: 3
};



module.exports = {
    HiddenService: HiddenService
}
