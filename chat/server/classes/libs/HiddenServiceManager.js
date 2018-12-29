TorController = require("./TorController");

class HiddenServiceManager{
    constructor(islandConfig, appHost, appPort){
        self.islandConfig = islandConfig;
        self.appPort = appPort;
        self.appHost = appHost;
        let torControlOpts = {
            password: islandConfig.torConnector.torControlPassword,
            host: islandConfig.torConnector.torControlHost,
            port:  islandConfig.torConnector.torControlPort
        };

        self.torCon = new TorController(torControlOpts);

    }

    async saveNewHiddenService(hsid, keyData){

    }

    async launchIslandHiddenServices(onion, keyData, port="80"){
        let keyType = keyData ? "RSA1024" : "NEW";
        let keyContent = keyData;
        port = port.toString().trim() + "," + self.appHost + ":" + self.appPort.toString();


        if (keyContent){
            let hsup = await torCon.isHSUp(onion);
            if(hsup){
                let hsid = onion.substring(0, 16);
                islandHiddenServices.add(hsid)
                returnSuccess({
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
            let newHS = {
                hsid: response.messages.ServiceID.substring(0, 16) + ".onion",
                privateKey: response.messages.PrivateKey

            };
            //ADD HIDDEN SERVICE TO THE LIST
            let hsid = response.messages.ServiceID.substring(0, 16);
            islandHiddenServices.add(hsid);
            returnSuccess(newHS)
        }


    }

    async deleteHiddenService(){

    }

}