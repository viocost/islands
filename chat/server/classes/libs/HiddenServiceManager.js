const TorController = require("./TorController");
const fs = require("fs-extra");
const iCrypto = require("./iCrypto");
const Logger = require("../libs/Logger.js");

class HiddenServiceManager{

    constructor(islandConfig, appHost, appPort){

        if(!islandConfig.hasOwnProperty("hiddenServicesPath")){
            throw "Invalid server config. No hidden services path specified";
        }

        let torControlOpts = {
            password: islandConfig.torConnector.torControlPassword,
            host: islandConfig.torConnector.torControlHost,
            port:  islandConfig.torConnector.torControlPort
        };

        this.torCon = new TorController(torControlOpts);
        this.hiddenServices = {};
        this.islandConfig = islandConfig;
        this.setHSFolderPath(islandConfig['hiddenServicesPath']);

        this.appPort = appPort;
        this.appHost = appHost;

        this.loadSavedHiddenServices();


    }

    init(){
        this.ensureSavedHiddenServicesLaunched()
            .then(()=>{
                Logger.debug("Initialized");
            })
            .catch(err=>{
              Logger.error(err)
            })
    }


    ensureHSDirectoryExists(HSDirPath){
        if(!fs.existsSync(HSDirPath)){
            fs.mkdirsSync(HSDirPath);
        }
    }



    async launchIslandHiddenService(permanent=true, hsPrivateKey, onion, port=80){
        let self = this;
        let keyType = hsPrivateKey ? "RSA1024" : "NEW";
        let keyContent = hsPrivateKey;
        port = port.toString().trim() + "," + self.appHost + ":" + self.appPort.toString();


        if (hsPrivateKey){
            let hsup = await torCon.isHSUp(onion);
            if(hsup){
                let hsid = onion.substring(0, 16);

                //TODO Add hidden service
                // islandHiddenServices.add(hsid)
                return({
                    hsid: hsid,
                    privateKey: keyContent
                })
            }
        }


        let response = await self.torCon.createHiddenService({
            detached: true,
            port: port,
            keyType: keyType,
            keyContent: keyContent,
        });

        if(response.code === 250){
            let newHS = new HiddenService({
                onion: response.messages.ServiceID.substring(0, 16) + ".onion",
                permanent: permanent,
                privateKey: iCrypto.base64ToPEM(response.messages.PrivateKey.substr(8))
            });

            await self.addHiddenService(newHS);
            return newHS;
        } else {
            return {err: response.error}
        }
    }


    async addHiddenService(hs){
        this.hiddenServices[hs.id] = hs;
        if(hs.permanent){
            await this.saveNewHiddenService(hs)
        }
    }

    async saveNewHiddenService(hs){
        return new Promise((resolve, reject)=>{
            let filepath = this.getHSFolderPath() + hs.id;
            fs.writeFileSync(filepath, hs.privateKey,  (err)=>{
                if(err) reject(err);
                resolve(err);
            })
        })
    }

    getHiddenServices(){
        let services = {};

        for(let id of Object.keys(this.hiddenServices)){
            try{
                services[id] = this.hiddenServices[id].getInfo();
            }catch(e){
                //no action required
                console.log("Error getting info for service: " + id);
            }

        }

        return services
    }

    async deleteHiddenService(hsid){
        hsid = hsid.trim().substring(0, 16);
        await this.torCon.killHiddenService(hsid);
        if(this.hiddenServices[hsid].permanent){
            fs.unlinkSync(this.getHSFolderPath() + hsid);
        }
        delete this.hiddenServices[hsid];
        Logger.debug("Hidden service " + hsid + " successfully deleted");
    }

    setHSFolderPath(HSFolderPath){

        HSFolderPath = HSFolderPath.trim();
        this.ensureHSDirectoryExists(HSFolderPath);
        this.islandHSFolderPath = HSFolderPath[-1] !== "/" ?
             HSFolderPath + "/" :
             HSFolderPath;
    }

    getHSFolderPath(){
        return this.islandHSFolderPath;
    }

    loadSavedHiddenServices(){
        let self = this;
        let HSFolderPath = self.getHSFolderPath();
        let files = fs.readdirSync(HSFolderPath);
        for (let file of files){
            let key = fs.readFileSync(HSFolderPath + file, "utf8");
            let hs = new HiddenService({
                onion: file,
                permanent: true,
                privateKey: key
            });
            self.hiddenServices[hs.id] = hs;
        }
    }

    async ensureSavedHiddenServicesLaunched(){
        let self = this;
        for (let hs of Object.keys(self.hiddenServices)){
            console.log("Launching hs: " + hs);

            Logger.debug("Launching " + hs + "service");
            if(await self.torCon.isHSUp(hs)){
                continue
            }

            let keyContent = iCrypto.pemToBase64(self.hiddenServices[hs].privateKey);

            let response = await self.torCon.createHiddenService({
                detached: true,
                port: "80" + "," + self.appHost + ":" + self.appPort.toString(),
                keyType: "RSA1024",
                keyContent: keyContent,
            });
            if(response.code != 250){
                Logger.error("Error launching hs: " + hs , JSON.stringify(response));
            }
        }
    }

}


class HiddenService{

    constructor({onion, permanent, privateKey}){
        this.id = onion.substring(0, 16);
        this.fullAddress = onion.substring(0, 16) + ".onion";
        this.permanent = !!permanent;
        this.privateKey = privateKey;

    }

    setStatusUp(){
        this.status = HiddenService.Status.UP;
    }

    setStatusDown(){
        this.status = HiddenService.Status.DOWN;
    }

    setStatusUnknown(){
        this.status = HiddenService.Status.UNKNOWN;
    }

    getStatus(){
        return this.status;
    }

    getInfo(){
        return {
            id: this.id,
            fullAddress: this.fullAddress,
            permanent: this.permanent,
            status: this.status
        }
    }
}

HiddenService.Status  = {
    UP: 1,
    DOWN: 2,
    UNKNOWN: 3
};



module.exports = HiddenServiceManager;


