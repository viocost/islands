const fs = require("fs-extra");
const path = require("path")
const { iCrypto } = require("../common/iCrypto")
const err = require("../common/Error")
const { isContained } = require("./util");

class Store {
    constructor() {
        if (this.constructor === Store) {
            throw new err.AttemptToInstatiateBaseClass();
        }
    }

    getBlob() {
        throw new err.NotImplemented()
    }

    saveBlob() {
        throw new err.NotImplemented()
    }

    getSignedBlob() {
        throw new err.NotImplemented()
    }

    saveSignedBlob() {
        throw new err.NotImplemented()
    }

}


class VaultDirectory extends Store {
    constructor(vaultPath) {
        super()
        this._vaultPath = vaultPath;
        fs.ensureDirSync(this._vaultPath);
        if(this.getBlob("admin") === "true"){

        }
    }

    getBlob(key) {
        const pathToFile = this._keyToPath(key)
        return fs.existsSync(pathToFile) ? fs.readFileSync(pathToFile, "utf8") : null;
    }

    saveBlob(key, blob) {
        const pathToFile = this._keyToPath(key)
        this._ensureSubdirExist(key)
        fs.writeFileSync(pathToFile, blob)
    }

    keyExist(key){
        this._ensureContained(this._keyToPath(key))
    }


    _keyToPath(key){
        let keyComponents = key.split("/")
        let pathToFile = path.join(this._vaultPath, ...keyComponents)
        this._ensureContained(pathToFile)
        return pathToFile;
    }

    _ensureSubdirExist(pathToFile){
        let keyComponents = pathToFile.split("/").filter(token=>token);

        if(keyComponents.length > 1){
            const subdir =  path.join(this._vaultPath, ...keyComponents.slice(0, keyComponents.length - 1))
            fs.ensureDirSync(subdir);
        }
    }

    _ensureContained(pathToFile){
        if(!isContained(this._vaultPath, pathToFile)){
            throw new err.AccessDenied()
        }
    }

}


class Vaults {

    _vaults = [];

    *[Symbol.iterator]  (){
        for(let vault of this._vaults){
            yield vault;
        }
    }

    loadVaults() {
        throw new err.NotImplemented()
    }

    makeNewVault(){
        throw new err.NotImplemented()
    }
}


class VaultsDirectory extends Vaults {

    constructor(vaultsPath) {
        super()
        this._vaultsPath = vaultsPath;
    }

    loadVaults() {
        //populates list of vaults
        let vaults = fs.readdirSync(this._vaultsPath);
        for (let vault of vaults) {
            this._vaults.push(new VaultDirectory(path.join(this._vaultsPath, vault)))
        }
    }

    makeNewVault(publicKey, encryptedPrivateKey, isAdmin) {
        let vaultId;

        if (isAdmin) {
            vaultId = "admin"
        } else {
            const ic = new iCrypto()
            ic.setRSAKey("pub", publicKey, "public")
                .getPublicKeyFingerprint("pub", "pkfp")
            vaultId = ic.get("pkfp");
        }

        const vault = new VaultDirectory(path.join(this._vaultsPath, vaultId))
        vault.saveBlob("publicKey", publicKey)
        vault.saveBlob("encryptedPrivateKey", encryptedPrivateKey)
        this._vaults.push(vault);
    }

}


module.exports = {
    VaultsDirectory: VaultsDirectory,
    VaultDirectory: VaultDirectory
}
