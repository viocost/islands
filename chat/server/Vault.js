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

        if (!fs.existsSync(this._vaultPath)) {
            fs.mkdirSync(this._vaultPath);
        }
    }

    getBlob(key) {
        let keyComponents = key.split("/")
        let pathToFile = path.join(this._vaultPath, ...keyComponents)
        if(!isContained(this._vaultPath, pathToFile)){
            throw new err.AccessDenied()
        }

        if (!fs.existsSync(pathToFile)) {
            return null
        }

        return fs.readFileSync(pathToFile, "utf8");
    }

    saveBlob(key, blob) {
        let keyComponents = key.split("/")
        let pathToFile = path.join(this._vaultPath, ...keyComponents)
        let subdir = path.join(this._vaultPath, ...keyComponents.slice(0, keyComponents.length - 1))

        if(!isContained(this._vaultPath, pathToFile)){
            throw new err.AccessDenied()
        }

        if (keyComponents.length > 1) {
            fs.ensureDirSync(subdir)
        }
        fs.writeFileSync(pathToFile, blob)
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
