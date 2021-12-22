const TorController = require("./TorController");
const { iCrypto } = require("../../../common/iCrypto");
const Logger = require("../libs/Logger.js");
const HSMap = require("./HSVaultMap");


class HiddenServiceManager{


    constructor(islandConfig, appHost, appPort){
        console.log(`Hidden service manager init: host: ${appHost}, port: ${appPort}`);

        if(!islandConfig.hasOwnProperty("hiddenServicesPath")){
            throw new Error("Invalid server config. No hidden services path specified");
        }

        let torControlOpts = {
            password: islandConfig.torConnector.torControlPassword,
            host: islandConfig.torConnector.torControlHost,
            port:  islandConfig.torConnector.torControlPort
        };

        this.torCon = new TorController(torControlOpts);
        this.hiddenServices = {};
        this.appPort = appPort;
        this.appHost = appHost;
    }


    enableSavedHiddenService(hs, privKey){
        return new Promise(async (resolve, reject)=>{
            try{
                Logger.debug("Attempting to enable hidden service: " + hs);
                if(await this.torCon.isHSUp(hs)){
                    resolve();
                    return;
                }

                await this.launchIslandHiddenService(true, privKey, hs);
                resolve()
            } catch(err){
                Logger.error("Error enabling hidden service: " + hs + " \n" + err);
                reject(err)
            }
        })
    }

    async launchIslandHiddenService(permanent=true, hsPrivateKey, onion, port=80){ //
        //For now it is only localhost                                             //
        let host = "127.0.0.1"                                                     //
        let self = this;                                                           //
        let keyContent = hsPrivateKey;                                             //
        port = self.appPort.toString();                                            //
                                                                                   //
        let response;
        if (hsPrivateKey){
            if(await this.torCon.isHSUp(onion)){                      //
                return({                                                               //
                    hsid: onion.substring(0, 16),                                      //
                    privateKey: keyContent                                             //
                })                                                                     //
            } else{
                response = await self.torCon.launchOnionWithKey({
                    host: host,
                    port: port,
                    key: keyContent
                })

            }

        } else {
            response = await self.torCon.createAndLaunchNewOnion({                 //
                host: host,                                                            //
                port: port,                                                            //
                keyType: "RSA1024",                                                    //
            });                                                                        //
        }                                                                          //
                                                                                   //
        if(response.code === 250){                                                 //
            let privateKey = keyContent ? iCrypto.base64ToPEM(keyContent) :        //
                iCrypto.base64ToPEM(response.messages.PrivateKey.substr(8));       //
                                                                                   //
            let newHS = new HiddenService({                                        //
                onion: response.messages.ServiceID.substring(0, 16) + ".onion",    //
                permanent: permanent,                                              //
                privateKey: privateKey                                             //
            });                                                                    //
            return newHS;                                                          //
        } else {                                                                   //
            return {err: response.error}                                           //
        }                                                                          //
    }                                                                              //
    /////////////////////////////////////////////////////////////////////////////////

    disableSavedHiddenService(hs){
        return new Promise(async (resolve, reject)=>{
            try{
                if(await this.torCon.isHSUp(hs)){
                    await this.torCon.killHiddenService(hs)
                    resolve();
                }
            }catch(err){
                reject(err);
            }
        })
    }

    async deleteHiddenService(hsid){
        hsid = hsid.trim().substring(0, 16);
        if(await this.torCon.isHSUp(hsid)){
            await this.torCon.killHiddenService(hsid);
        }

        delete this.hiddenServices[hsid];
        Logger.debug("Hidden service " + hsid + " successfully deleted");
    }

    getHSFolderPath(){
        return this.islandHSFolderPath;
    }




    async ensureSavedHiddenServicesLaunched(){
        let self = this;
        let map = HSMap.getMap();

        for (let hs of Object.keys(self.hiddenServices)){
            Logger.debug("Launching " + hs + "service");
            if(await self.torCon.isHSUp(hs) && !map[hs].enabled){
                Logger.debug("Disabling hidden service: " + hs);
                let response = await self.torCon.killHiddenService(hs);
                if(response.code != 250){
                    Logger.error("Error launching hs: " + hs , JSON.stringify(response));
                }
                //kill hidden service
            } else if (map[hs].enabled && ! await self.torCon.isHSUp(hs)){
                let keyContent = iCrypto.pemToBase64(self.hiddenServices[hs].privateKey);

                let response = await self.torCon.createHiddenService({
                    detached: true,
                    port: "80" + "," + "127.0.0.1" + ":" + self.appPort.toString(),
                    keyType: "RSA1024",
                    keyContent: keyContent,
                });
                if(response.code != 250){
                    Logger.error("Error launching hs: " + hs , JSON.stringify(response));
                }
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



module.exports = {
    HiddenServiceManager: HiddenServiceManager,
    HiddenService: HiddenService
}
