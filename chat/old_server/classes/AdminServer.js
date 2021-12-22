const { iCrypto } = require('../../common/iCrypto');
const fs = require('fs-extra');
const path = require('path');
const Logger = require("./libs/Logger.js");
const VaultManager = require("./libs/VaultManager");
const { HiddenServiceManager } = require("./libs/HiddenServiceManager");
const HSMap = require("./libs/HSVaultMap");
const shell = require('shelljs');
const { Storage } = require("./../../server/Storage")
const { HiddenService } = require("../../server/lib/HiddenService")
const KeyBuilder = require("../../server/StorageKeyBuilderAdapter")

let keysFolderPath;
let updatePath;
let islandHiddenServiceManager;
let vaultManager;
let adminVaultId;


const handlers = {
  "admin_setup": adminSetup,
  "admin_login": adminLogin,
  "update_from_file": islandUpdateFromFile,
  "update_from_github": islandUpdateFromGithub,
  "launch_admin_hidden_service": launchAdminHiddenService,
  "create_guest": createGuest,
  "enable_hidden_service": enableHiddenService,
  "disable_hidden_service": disableHiddenService,
  "delete_guest": deleteGuest,
  "delete_hidden_service": deleteAdminHiddenService,
  "update_hs_description": updateHSDescription,
  "load_logs": loadLogs,
  "log_level_change": changeLogLevel,
  "logger_state_change": changeLoggerState,
   "clear_logs": clearLogs
};

function handleAdminRequest(req, res){
    console.log("Handling admin request...");
    console.dir(req.body)
    try{
        console.log("Trying handle");
        handlers[req.body.action](req, res)

        console.log("done");
    }catch(err){
        console.log("Error handling admin request: " + err);
        res.status = 400;
        res.set('Content-Type', 'application/json');
        res.end({error: err.message});
    }
}



async function clearLogs(req, res){
    if(!isRequestValid(req)){
        //Key was not verified
        Logger.warn("Unverefied change log level request", {
            pkfp: req.body.pkfp,
            sign: req.body.sign,
            nonce: req.body.nonce
        });
        return res.status(500).end('"error": "Request was not verified"')
    }

    await Logger.clearLogs();
    res.set('Content-Type', 'application/json');
    res.status(200).send({message: "Success"})

}

function changeLogLevel(req, res){
    if(!isRequestValid(req)){
        //Key was not verified
        Logger.warn("Unverefied change log level request", {
            pkfp: req.body.pkfp,
            sign: req.body.sign,
            nonce: req.body.nonce
        });
        return res.status(500).end('"error": "Request was not verified"')
    }

    Logger.setLevel(req.body.level);
    res.set('Content-Type', 'application/json');
    res.status(200).send({message: "Success"})
}


function changeLoggerState(req, res){
    if(!isRequestValid(req)){
        //Key was not verified
        Logger.warn("Unverefied change log state request", {
            pkfp: req.body.pkfp,
            sign: req.body.sign,
            nonce: req.body.nonce
        });
        return res.status(500).end('"error": "Request was not verified"')
    }
    let enabled = req.body.state === "true" || req.body.level === true;
    Logger.switchLogger(enabled);
    res.set('Content-Type', 'application/json');
    res.status(200).send({message: "Success"})
}





/********ISLAND HIDDEN SERVICES MANAGEMENT ********/
/**
 * Launches Island hidden service, if it is not up already
 * Maps it to admin's vault
 * req.body must have following properties:
 *  pkfp - Public Key Fingerprint of Island's Administrator
 *  nonce
 *  sign - signature of nonce done by Islands Administrator
 *  OPTIONAL:
 *  onion - onion address of hidden service needed to launch
 *  keyContent - private key for given onion
 *
 *  There is no validation done on whether private key matches the onion address
 *  provided.
 *
 * @param req - standard request
 * @param res - standard response
 * @returns {Promise<void>}
 */
function  launchAdminHiddenService(req, res){
    console.log("Launching admin hedden service");

    let data = req.body;

    let returnSuccess = (hiddenServices)=>{
        Logger.debug("Success launching admin HS")
        res.set('Content-Type', 'application/json');
        res.status(200).send({
                hiddenServices: hiddenServices
        })
    };

    let returnError = (err, status = 400)=>{
        Logger.debug("Error launching admin HS: " + err.message);
        res.status(status).send("Launch hidden servce error: " + err);
    };
    if(!verifyRequest(data.pkfp, data.requestString, data.sign, false)) {
        Logger.warn("Request was not verified!")
        returnError("Request verification failed", 401);
    }

    //requestData can have fields
    // privateKey
    // onion
    let requestData = JSON.parse(data.requestString);

    islandHiddenServiceManager.launchIslandHiddenService(
        true,
        requestData.privateKey,
        requestData.onion
    )

        .then((launchRes)=>{
            if (launchRes.err){
                returnError(launchRes.err);
                return
            }

            addAdminHiddenService(launchRes)
            //update HSVault map
            //HSMap.put(launchRes.fullAddress, data.pkfp, "", true);
            //return result
            //get here all hidden services and return it
            let hiddenServices = getHiddenServices();
            console.dir(hiddenServices);
            returnSuccess(hiddenServices);
        }).catch(err=>{
            console.log("Error launching hidden service " + err);
            Logger.debug(err.message);
            returnError(err)
        });
}

function deleteAdminHiddenService(req, res){
    let returnSuccess = (hiddenServices)=>{
        Logger.debug("Admin hidden service removed");
        res.set('Content-Type', 'application/json');
        res.status(200).send({
            hiddenServices: hiddenServices
        })
    };

    let returnError = (err, status = 400)=>{
        Logger.debug("Error launching admin HS: " + err.message);
        res.status(status).send("Launch hidden servce error: " + err);
    };

    let data = req.body;

    if(!verifyRequest(data.pkfp, data.requestString, data.sign, false)) {
        Logger.warn("Request was not verified!");
        returnError("Request verification failed", 401);
    }
    let requestData = JSON.parse(data.requestString);
    let hsid = requestData.onion.substring(0, 16)
    islandHiddenServiceManager.deleteHiddenService(hsid)
        .then(()=>{
            deleteAdminHiddenServiceRecord(hsid)

            returnSuccess(getHiddenServices())
        })
        .catch(err =>{
            console.log("Error deleting hidden service: " + err);
            returnError(err, 500);
        })
}

function deleteGuest(req, res){
    res.status(405).send("Not supported in this version")
}


//Crteates new guest vault and launches dedicated hidden service
async function createGuest(req, res){
    res.status(405).send("Not supported in this version")
}


async function enableHiddenService(req, res){
    let data = req.body;
    let returnSuccess = (hiddenServices)=>{
        Logger.debug("Success enabling hidden service");
        res.set('Content-Type', 'application/json');
        res.status(200).send({
            hiddenServices: hiddenServices
        })
    };

    let returnError = (err, status = 400)=>{
        Logger.debug("Error enabling hidden service " + err.message);
        res.status(status).send("Enable hidden servce error: " + err);
    };

    try{
        if(!verifyRequest(data.pkfp, data.requestString, data.sign, false)) {
            Logger.warn("Request was not verified!");
            returnError("Request verification failed", 401);
        }

        let requestData = JSON.parse(data.requestString);
        let hsid = requestData.onion.substring(0,16)
        let storage = getAdminStroage()
        let privateKey = JSON.parse(storage.getBlob(KeyBuilder.buildKey("hidden_services", hsid))).key;
        islandHiddenServiceManager.enableSavedHiddenService(requestData.onion, privateKey);
        updateAdminHiddenServiceRecordEnabledState(requestData.onion.substring(0,16), true)
        returnSuccess(getHiddenServices())
    }catch(err){
        console.log(`Error enabling hs: ${err}`);
        returnError(err, 500);
    }
}


async function disableHiddenService(req, res){
    let data = req.body;
    let returnSuccess = (hiddenServices)=>{
        Logger.debug("Success disabling hidden service");
        res.set('Content-Type', 'application/json');
        res.status(200).send({
            hiddenServices: hiddenServices
        })
    };

    let returnError = (err, status = 400)=>{
        Logger.debug("Error disabling hidden service " + err.message);
        res.status(status).send("Disable hidden servce error: " + err);
    };
    try{
        if(!verifyRequest(data.pkfp, data.requestString, data.sign, false)) {
            Logger.warn("Request was not verified!");
            returnError("Request verification failed", 401);
        }

        let requestData = JSON.parse(data.requestString);
        islandHiddenServiceManager.disableSavedHiddenService(requestData.onion);
        updateAdminHiddenServiceRecordEnabledState(requestData.onion.substring(0, 16), false)
        returnSuccess(getHiddenServices())
    }catch(err){
        console.log("Error disabling hidden service: " + err);
        returnError(err, 500)
    }

}




async function updateHSDescription(req, res){
    let data = req.body;
    let returnSuccess = (hiddenServices)=>{
        Logger.debug("Hidden service description updated");
        res.set('Content-Type', 'application/json');
        res.status(200).send({
            hiddenServices: hiddenServices
        })
    };

    let returnError = (err, status = 400)=>{
        Logger.debug("Error updateing hidden service description: " + err.message);
        res.status(status).send("Disable hidden servce error: " + err);
    };

    try{
        if(!verifyRequest(data.pkfp, data.requestString, data.sign, false)) {
            Logger.warn("Request was not verified!")
            returnError("Request verification failed", 401);
        }

        let requestData = JSON.parse(data.requestString);
        console.dir(data);

        let hiddenServices = getHiddenServices();
        for(let key in hiddenServices){
            for (let hsid in hiddenServices[key]){
                if(hsid === requestData.onion.substring(0, 16)){
                    console.log(`HS found. Updating description`);
                    let hsKey = KeyBuilder.buildKey(`hidden_services`, hsid)
                    let storage = Storage.getAllByKeyPresent(hsKey)[0]
                    hiddenServices[key][hsid].description = requestData.description;
                    data.description = requestData.description
                    storage.write(hsKey, JSON.stringify(hiddenServices[key][hsid]))
                    console.log(`Write successful`);
                    returnSuccess(hiddenServices)
                    return;
                }
            }
        }


    }catch(err){
        console.log(`Error updating HS description: ${err}`);
        returnError(err, 500)
    }


}


/********~ END ISLAND HIDDEN SERVICES MANAGEMENT ********/

function verifyRequest(pkfp, nonce, sign, dehexify = true){
    let storage = getAdminStroage()

    let publicKey = storage.getBlob("admin_key");
    if(!publicKey) throw new Error("Public key not found.")

    let ic = new iCrypto();
    ic.setRSAKey("pubk", publicKey, "public")
        .addBlob("sign", sign);
    if(dehexify){
        ic.addBlob("nhex", nonce )
            .hexToBytes("nhex", "n")
    } else{
        ic.addBlob("n", nonce )
    }
    ic.publicKeyVerify("n", "sign", "pubk", "verified");
    return ic.get("verified")
}

function adminLogin(req, res){
    try{
        console.log("Processing admin login");
        let data = req.body;
        if(verifyRequest(data.pkfp, data.nonce, data.sign)){
            res.set('Content-Type', 'application/json');
            let loggerInfo = Logger.getLoggerInfo();
            res.status(200).send({
                message: "Login successfull",
                loggerInfo: loggerInfo,
                hiddenServices: HSMap.getMapAsString()
            });
        } else{
            res.status(500).send("Login error: invalid key");
        }
    }catch(err){
        console.log("Admin login error: " + err);
        res.status(401).send("Request has not been verified");
    }

}

function adminSetup(req, res){
    Logger.debug("Admin setup called", {cat: "admin"});
    // make sure there is no keys or
    console.log("Setting admin");

    if (isSecured()){
        throw new Error("Error setting admin: admin key is already registered");
    }

    //Check public key and signature
    let data = req.body;
    let ic = new iCrypto();
    ic.addBlob("nhex", data.nonce )
        .setRSAKey("pubk", data.adminPublickKey, "public")
        .addBlob("sign", data.sign)
        .hexToBytes("nhex", "n")
        .publicKeyVerify("n", "sign", "pubk", "res");

    if(!ic.get('res')){
        throw new Error("Error setting admin: public key was not verified");
    }

    //Check vault
    let vaultBlob = data.vault;
    let hash = data.hash;
    let signature = data.vaultSign;
    let publicKey = data.vaultPublicKey;
    ic.getPublicKeyFingerprint("pubk", "pkfp");
    vaultManager.saveNewVault(vaultBlob, hash, signature, publicKey, adminVaultId);



    try{
        let storage = getAdminStroage()
        storage.write('admin_key', ic.get('pubk'))
        //let kPath = path.join(keysFolderPath , ic.get('pkfp'));
        //fs.writeFileSync(kPath, ic.get('pubk'));
        res.set('Content-Type', 'application/json')
            .status(200)
            .send({vaultID: adminVaultId});
        Logger.debug("Admin vault registered successfully!", {cat: "admin"})
    }catch(err) {
        Logger.error("Error setting admin: " + err, {cat: "admin"})
    }
}


function isSecured (){
    let storage = getAdminStroage()
    return storage.has("admin_key")
}


function islandUpdateFromGithub(req, res){
    if(!isRequestValid(req)){
        //Key was not verified
        return res.status(500).end('"error": "Update request was not verified"')
    }

    let branch = req.body.branch;
    let command = (branch === "dev") ? "chmod +x /usr/src/app/scripts/updategh.sh && /usr/src/app/scripts/updategh.sh -b dev" :
        "chmod +x /usr/src/app/scripts/updategh.sh && /usr/src/app/scripts/updategh.sh";
    console.log("BRANCH: " + branch + "\nCommand: " + command);
    let updateResult = shell.exec(command);

    if (updateResult.code !==0){
        return res.status(500).send(updateResult.stderr.toString());
    }else{
        res.set('Content-Type', 'text/html');
        res.end('"success":"ok", "status": "200"');
        setTimeout(()=>{
            process.exit();
        }, 1000);
    }
}


function islandUpdateFromFile(req, res){
    let data = req.body;
    let file = req.files.file;
    let key = fs.readFileSync(path.join(keysFolderPath, data.pkfp), "utf8");
    let ic = new iCrypto();
    ic.addBlob("f", file.data.toString('binary'))
        .setRSAKey("pubk", key, "public")
        .addBlob("sign", data.sign)
        .publicKeyVerify("f", "sign", "pubk", "res");
    if(!ic.get("res")){
        //Key was not verified
        return res.status(500).end('"error": "Update file was not verified"')
    }
    let fullUpdatePath = updatePath + "chat.zip";
    console.log("Moving to " + fullUpdatePath);
    if(!fs.existsSync(updatePath)){
        fs.mkdirSync(updatePath)
    }
    file.mv(updatePath + "chat.zip", (err)=>{
        if (err)
            return res.status(500).send(err);
        console.log("file saved. ready for update!");
        let updateResult = shell.exec("chmod +x /usr/src/app/scripts/update.sh && /usr/src/app/scripts/update.sh");
        if (updateResult.code !==0){
            return res.status(500).send(updateResult.stderr.toString());
        }else{
            res.set('Content-Type', 'text/html');
            res.end('"success":"ok", "status": "200"');
            setTimeout(()=>{
                process.exit();
            }, 1000);
        }

    })

}


async function loadLogs(req, res){
    if(!isRequestValid(req)){
        return res.status(401).end('"error": "Update request was not verified"')
    }
    try{
        let errorsOnly = (req.body.errorsOnly === true);

        let logs = await Logger.fetchLogs(errorsOnly);
        res.set('Content-Type', 'application/json');

        if(logs){
            res.status(200).send({message: "Logs fetched", records: logs});
        } else{
            res.status(404).send({message: "Logs not found"});
        }
    }catch(err){
        res.status(500).send(`Internal server error: ${err.message}`);
    }
}


function isRequestValid(req){
    let nonce = req.body.nonce;
    let pkfp = req.body.pkfp;
    let sign = req.body.sign;
    let publicKey = fs.readFileSync(path.join(keysFolderPath, pkfp), "utf8");
    let ic = new iCrypto();
    ic.addBlob("nhex", nonce)
        .hexToBytes("nhex", "n")
        .setRSAKey("pubk", publicKey, "public")
        .addBlob("sign", sign)
        .publicKeyVerify("n", "sign", "pubk", "res");
    return ic.get("res");
}

function getAdminVault (){
    return vaultManager.getAdminVault()
};




/**
 * Checks whether there is at least a single trusted public key registered
 * returns true if at least 1 key is found and returns false otherwise
 * @returns {boolean}
 */
module.exports.isSecured = function(){
    return isSecured();
};


module.exports.getAdminVault = getAdminVault;



module.exports.setKeyFolder = function(keysPath, uPath){
    console.log("setting keysPath path to " + keysPath);
    keysFolderPath = keysPath;
    updatePath = uPath;
};

module.exports.setHSFolderPath = function(hsFolderPath){
    console.log("setting update path to " + hsFolderPath);
    hiddenServicesFolderPath = hsFolderPath;
};



module.exports.getAdminPublicKey = function(){

    if (!fs.existsSync(keysFolderPath)){
        fs.mkdirSync(keysFolderPath);
        return false;
    }

    try{
        let files = fs.readdirSync(keysFolderPath);
        return files && files.length>0;
    } catch(err){
        throw err;
    }
};

module.exports.handleAdminRequest = handleAdminRequest

//This is a dumb vacuum for all island hidden services
// it returns a nested map in form of
// vaultId => {
//    hsid: data,
//    another_hsid: data,
//    ...
// }
function getHiddenServices(){

    res = {}

    for(let storage of Storage.everyStorageObject()){
        let vaultId = storage.id;

        let vaultHiddenServices = {}
        let hsKeys = storage.allKeys()
                               .filter(key=>/hidden_services\/.*/.test(key))

        hsKeys.forEach(key=>{
            vaultHiddenServices[key.split("/").slice(-1)[0]] = JSON.parse(storage.getBlob(key))
        })

        res[vaultId] = vaultHiddenServices
    }

    return res;
}


function addAdminHiddenService(service){
    let storage = getAdminStroage()
    storage.write(KeyBuilder.buildKey("hidden_services", service.id), JSON.stringify({
        key: service.privateKey,
        enabled: true
    }))
}

function deleteAdminHiddenServiceRecord(serviceId){
    let storage = getAdminStroage()
    storage.delete(KeyBuilder.buildKey("hidden_services", serviceId))
}

function updateAdminHiddenServiceRecordEnabledState(serviceId, setEnabled){
    let storage = getAdminStroage()
    let key = KeyBuilder.buildKey("hidden_services", serviceId)
    let hsData = JSON.parse(storage.getBlob(key));
    hsData.enabled = setEnabled;
    storage.write(key, JSON.stringify(hsData))
}

function getAdminStroage(){
    for(let storage of Storage.everyStorageObject()){
        if(storage.has("admin")){
            return storage
        }
    }
}


module.exports.getHiddenServices = getHiddenServices


module.exports.initAdminEnv = function(config, vaultId, host, port){
    adminVaultId = vaultId
    console.log(`Admin vault id is ${adminVaultId}`);
    islandConfig = config;
    islandHiddenServiceManager  = new HiddenServiceManager(config, host, port);
    vaultManager = new VaultManager(config);
};
