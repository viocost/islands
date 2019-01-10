const iCrypto = require('./libs/iCrypto');
const fs = require('fs');
const Logger = require("./libs/Logger.js");
const HiddenServiceManager = require("./libs/HiddenServiceManager");



const shell = require('shelljs');
const TorController = require('./libs/TorController.js');
let keysFolderPath;
let updatePath;

let islandConfig;
let appPort;
let appHost;
let islandHiddenServiceManager;


const handlers = {
  "set_admin": setAdmin,
  "admin_login": adminLogin,
  "update_from_file": islandUpdateFromFile,
  "update_from_github": islandUpdateFromGithub,
  "launch_hidden_service": launchIslandHiddenService,
  "delete_hidden_service": deleteIslandHiddenService,
  "load_logs": loadLogs,
  "log_level_change": changeLogLevel,
  "logger_state_change": changeLoggerState,
   "clear_logs": clearLogs
};


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


function handleAdminRequest(req, res){
    console.log("Handling admin request...");
    try{
        handlers[req.body.action](req, res)
    }catch(err){
        console.log("Error handling admin request: " + err);
        res.status = 500;
        res.set('Content-Type', 'text/html');
        res.end('{"fail" : ' + err + '}');
    }
}



/********ISLAND HIDDEN SERVICES ********/
/**
 * Launches Island hidden service, if it is not up already
 *
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
async function  launchIslandHiddenService(req, res){
    console.log("Launching hidden service");
    let data = req.body;

    let returnSuccess = (newHS)=>{
        if (newHS){
            res.set('Content-Type', 'application/json');
            res.status(200).send({
                message: "HS launch success",
                hiddenServices: islandHiddenServiceManager.getHiddenServices(),
                newHS: newHS});
        }

    };

    let returnError = (err)=>{
        res.status(500).send("Launch hidden servce error: " + err);
    };

    if(!verifyRequest(data.pkfp, data.nonce, data.sign)) {
        returnError("The request verification failed");
    }

    let launchRes = await islandHiddenServiceManager.launchIslandHiddenService(
        !!data.permanent,
        data.hsPrivateKey,
        data.onion
    );

    launchRes.err ? returnError(launchRes.err) : returnSuccess(launchRes);


    // //LAUNCH SERVICE
    // let torControlOpts = {
    //     password: islandConfig.torConnector.torControlPassword,
    //     host: islandConfig.torConnector.torControlHost,
    //     port:  islandConfig.torConnector.torControlPort
    // };
    //
    // let torCon = new TorController(torControlOpts);
    // let keyType = data.privateKey ? "RSA1024" : "NEW";
    // let keyContent = data.hsPrivateKey;
    // let onion = data.onion;
    // let port = data.port ? data.port : "80";
    //
    //
    // port = port.toString().trim() + "," + appHost + ":" + appPort.toString();
    //
    //
    // //IF KEY PASSED - CHECK IF HS IS UP
    // if (keyContent){
    //     let hsup = await torCon.isHSUp(onion);
    //     if(hsup){
    //         let hsid = onion.substring(0, 16);
    //         islandHiddenServices.add(hsid)
    //         returnSuccess({
    //             hsid: hsid,
    //             privateKey: keyContent
    //         })
    //     }
    // }
    //
    // let response = await torCon.createHiddenService({
    //     detached: true,
    //     port: port,
    //     keyType: keyType,
    //     keyContent: keyContent,
    // });
    //
    // if(response.code === 250){
    //     let newHS = {
    //         hsid: response.messages.ServiceID.substring(0, 16) + ".onion",
    //         privateKey: response.messages.PrivateKey
    //
    //     };
    //     //ADD HIDDEN SERVICE TO THE LIST
    //     let hsid = response.messages.ServiceID.substring(0, 16);
    //     islandHiddenServices.add(hsid);
    //     returnSuccess(newHS)
    // }
}





async function deleteIslandHiddenService(req, res){
    console.log("Taking down island hidden service");

    let data = req.body;
    let hsToDelete = data.onion.substring(0, 16);
    let returnSuccess = ()=>{
        res.set('Content-Type', 'application/json');
        res.status(200).send({
            message: "Hidden service has been taken down",
            hiddenServices: islandHiddenServiceManager.getHiddenServices()
        });
    };

    let returnError = (err)=>{
        res.status(500).send("Hidden servce deletion error: " + err);
    };

    if(!verifyRequest(data.pkfp, data.nonce, data.sign)){
        returnError("Invalid request");
    }

    await islandHiddenServiceManager.deleteHiddenService(data.onion);

    returnSuccess()

}


/************** END *******************/

function verifyRequest(pkfp, nonce, sign){
    let publicKey;
    try{
        publicKey = fs.readFileSync(keysFolderPath + pkfp, "utf8");
    }catch(err){
        console.log("Error: public ket not found. pkfp: " + pkfp + "\nError: " + err);
        return false;
    }

    let ic = new iCrypto();
    ic.addBlob("nhex", nonce )
        .setRSAKey("pubk", publicKey, "public")
        .addBlob("sign", sign)
        .hexToBytes("nhex", "n")
        .publicKeyVerify("n", "sign", "pubk", "verified");
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
                hiddenServices: islandHiddenServiceManager.getHiddenServices()
            });
        } else{
            res.status(500).send("Login error: invalid key");
        }
    }catch(err){
        console.log("Admin login error: " + err);
        res.status(500).send("Login error: unknown server error");
    }

}

function setAdmin(req, res){
    // make sure there is no keys or
    console.log("Setting admin");

    if (isSecured()){
        throw "Error setting admin: admin key is already registered"
    }

    let data = req.body;

    let ic = new iCrypto();
    ic.addBlob("nhex", data.nonce )
        .setRSAKey("pubk", data.publickKey, "public")
        .addBlob("sign", data.sign)
        .hexToBytes("nhex", "n")
        .publicKeyVerify("n", "sign", "pubk", "res");

    if(!ic.get('res')){
        throw "Error setting admin: public key was not verified";
    }

    ic.getPublicKeyFingerprint("pubk", "pkfp");
    try{

        let path = keysFolderPath + ic.get('pkfp');
        fs.writeFileSync(path, ic.get('pubk'));
        res.set('Content-Type', 'text/html');
        res.end('{"success" : "Public key is written", "status" : 200}');
    }catch(err) {
        throw "Error setting admin: " + err
    }
}


function isSecured (){
    console.log("IsSecured called");
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
    let key = fs.readFileSync(keysFolderPath + data.pkfp, "utf8");
    let ic = new iCrypto();
    ic.addBlob("f", file.data.toString('binary'))
        .setRSAKey("pubk", key, "public")
        .addBlob("sign", data.sign)
        .publicKeyVerify("f", "sign", "pubk", "res");
    if(!ic.get("res")){
        //Key was not verified
        return res.status(500).end('"error": "Update file was not verified"')
    }
    let path = updatePath + "chat.zip";
    console.log("Moving to " + path);
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
    let errorsOnly = (req.body.errorsOnly.trim().toLowerCase() === "true" || req.body.errorsOnly === true);

    let logs = await Logger.fetchLogs(errorsOnly);
    res.set('Content-Type', 'application/json');

    if(logs){
        res.status(200).send({message: "Logs fetched", records: logs});
    } else{
        res.status(404).send({message: "Logs not found"});
    }
}


function isRequestValid(req){
    let nonce = req.body.nonce;
    let pkfp = req.body.pkfp;
    let sign = req.body.sign;
    let publicKey = fs.readFileSync(keysFolderPath + pkfp, "utf8");
    let ic = new iCrypto();
    ic.addBlob("nhex", nonce)
        .hexToBytes("nhex", "n")
        .setRSAKey("pubk", publicKey, "public")
        .addBlob("sign", sign)
        .publicKeyVerify("n", "sign", "pubk", "res");
    return ic.get("res");
}






/**
 * Checks whether there is at least a single trusted public key registered
 * returns true if at least 1 key is found and returns false otherwise
 * @returns {boolean}
 */
module.exports.isSecured = function(){
    return isSecured();
};


module.exports.initAdminEnv = function(app, config, host, port){
    console.log("initAdminEnv called");
    islandConfig = config;
    app.post("/admin", handleAdminRequest);
    appPort = port;
    appHost = host;
    islandHiddenServiceManager = new HiddenServiceManager(islandConfig, appHost, appPort);
    islandHiddenServiceManager.init()

};


module.exports.setKeyFolder = function(keysPath, uPath){
    console.log("setting update path to " + updatePath);
    keysFolderPath = keysPath;
    updatePath = uPath;
};

module.exports.setHSFolderPath = function(hsFolderPath){
    console.log("setting update path to " + updatePath);
    hiddenServicesFolderPath = hsFolderPath;
};




