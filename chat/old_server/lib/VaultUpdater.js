


class VaultUpdater{
    constructor(config, requestEmitter){
        this.requestEmitter = requestEmitter;
        this.vaultsPath = config.vaultsPath;
    }


    saveSettings(){

    }

    updateVaultFormat(id, vaultBlob, topics, publicKey, hash){
        Logger.info("Updating vault format", {cat: "vault"});
        this._backupVault(id)
        this._writeVault(id, vaultBlob, publicKey, hash)
        for(let pkfp of Object.keys(topics)){
            this.saveTopic(id, pkfp, topics[pkfp])
        }
    }

    async saveVault(request, connectionId, self){
        console.log("SAVING VAULT!!!")
        let { vault, hash, sign, topics } = request.body
        let id = request.headers.pkfpSource;
        let publicKey = self.vaultManager.getVaultPublicKey(id);
        if (!Request.isRequestValid(request, publicKey)){
            throw new Error("Save vault request signature is not verified.")
        }

        console.log("Updating vault")
        self.vaultManager.updateVaultFormat(id, vault, topics, publicKey,  hash)
        console.log("VAULT UPDATED!");
        let message = Message.makeResponse(request, "island", Events.VAULT_UPDATED)
        message.body = request.body;
        let session = self.sessionManager.getSessionByConnectionId(connectionId);
        session.broadcast(message);
    }


    _backupVault(id){
        let vaultPath = path.join(this.vaultsPath, id);
        let bakPath = path.join(this.vaultsPath, `${id}_BAK`);

        if(!fs.existsSync(vaultPath)){
            return;
        }

        if(!fs.existsSync(bakPath)){
            fs.mkdirSync(bakPath)
        }
        fs.copySync(vaultPath, bakPath)
    }

    _updateVault(id, blob){
        let vaultPath = path.join(this.vaultsPath, id);
        fs.writeFileSync(path.join(vaultPath, "vault"), blob);
    }


    _writeVault(id, blob, publicKey, hash){
        let vaultPath = path.join(this.vaultsPath, id);
        if(!fs.existsSync(vaultPath)){
            fs.mkdirSync(vaultPath);
        }
        if (!fs.existsSync(path.join(vaultPath, "topics"))){
            fs.mkdirSync(path.join(vaultPath, "topics"));
        }
        fs.writeFileSync(path.join(vaultPath, "vault"), blob);
        fs.writeFileSync(path.join(vaultPath, "publicKey"), publicKey);
        fs.writeFileSync(path.join(vaultPath, "hash"), hash);
    }
}

module.exports = VaultUpdater;
