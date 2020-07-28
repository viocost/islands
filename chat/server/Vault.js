const fs = require("fs-extra");
const path = require("path")
const { iCrypto } = require("../common/iCrypto")
const err = require("../common/Error")
const { isContained } = require("./util");

class Vault {
    constructor() {
        if (this.constructor === Vault) {
            throw new err.AttemptToInstatiateBaseClass();
        }
    }

    getBlob() {
        throw new err.NotImplemented()
    }

    saveBlob() {
        throw new err.NotImplemented()
    }

    deleteBlob(){
        throw new err.NotImplemented()
    }

    getSignedBlob() {
        throw new err.NotImplemented()
    }

    saveSignedBlob() {
        throw new err.NotImplemented()
    }

}


class VaultDirectory extends Vault {
    constructor(vaultPath) {
        super()
        this._vaultPath = vaultPath;
        fs.ensureDirSync(this._vaultPath);
        if(this.getBlob("admin") === "true"){

        }
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    getBlob(key) {
        const pathToFile = this._keyToPath(key)
        return fs.existsSync(pathToFile) ? fs.readFileSync(pathToFile, "utf8") : null;
    }

    saveBlob(key, blob) {
        const pathToFile = this._keyToPath(key)
        this._ensureSubdirExist(key)
        fs.writeFileSync(pathToFile, blob)
    }

    hasKey(key){
        return fs.existsSync(this._keyToPath(key))
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods


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




class VaultFactory{
    makeNewVault(){

    }

    loadVaults(){
        throw
    }
}

class VaultFactoryV1 extends VaultFactory{

}


class VaultFactoryV2 VaultFactory{

}

class VaultsSQLite extends VaultFactory{

}

class VaultsDirectory extends VaultFactory{

    constructor(vaultsPath) {
        super()
        this._vaultsPath = vaultsPath;
    }

    loadVaults() {
        //populates list of vaults
        let vaults = fs.readdirSync(this._vaultsPath).map(vaultPath);
        let x =  []
        for (let vault of vaults) {
            x.push(new VaultDirectory(path.join(this._vaultsPath, vault)))
        }
        return x
    }


    initializePendingVault(){

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
