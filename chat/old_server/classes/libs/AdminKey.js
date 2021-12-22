const { iCrypto } = require("../../../common/iCrypto");
const Logger = require("./Logger");
const { Storage } = require("../../../server/Storage")

let adminKeyPath;

function get(){
    if(!ensureInitialized()){
        return;
    }

    let storage = getAdminStroage()
    return storage.get("admin_key")
}


function getPkfp(){
    let pubKey = get()

    if(!pubKey) return;

    let ic = new iCrypto();
    ic.setRSAKey("pub", pubKey, "public")
        .getPublicKeyFingerprint("pub", "pkfp");
    return ic.get("pkfp");
}


function ensureInitialized(){
    let storage = getAdminStroage()
    if(storage){
        return storage.has("admin_key")
    }
    return false
}


function getAdminStroage(){
    for(let storage of Storage.everyStorageObject()){
        if(storage.has("admin")){
            return storage
        }
    }
}

module.exports = {
    get: get,
    getPkfp: getPkfp

}
