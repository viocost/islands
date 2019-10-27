const Logger = require("./Logger.js");
const fs = require("fs-extra");
const RandExp = require("randexp");
const iCrypto = require("./iCrypto");
const AdminKey = require("./AdminKey");



/**FILENAMES*/
const PENDING = "pending.signature";
const VAULT = "vault";
const PUBLICKEY = "publicKey";


class VaultManager{
    constructor(config){
        if (!config.vaultsPath){
            throw new Error("Init error: Vaults path is not specified!");
        }
        this.setVaultsPath(config.vaultsPath);

        if(!fs.existsSync(this.vaultsPath)){
            Logger.debug("Vaults directory doesn't exist. Creating...");
            fs.mkdirSync(this.vaultsPath);
            Logger.debug("Vaults directory created!");
        }

        this.vaultIdLength = config.vaultIdLength || 64;
    }

    setVaultsPath(path){
        this.vaultsPath = /[\\\/]/.test(path[path.length-1]) ? path : path + "/";
        Logger.debug("Vaults path set to: " + this.vaultsPath)
    }


    updateVault(vaultBlob, id, signature, publicKey = null, newKeySignature = null){

        if(!publicKey){
            publicKey = this.getVaultPublicKey(id);
        }

        if(!this.isOwnerVerified(vaultBlob, signature, publicKey)){
            throw("Owner's signature is invalid");
        }
        if(this.isRegistrationPending(id)){
            throw("The vault registration is pending. Updates are disabled");
        }


        this._updateVault(id, vaultBlob, publicKey);
        Logger.debug("Vault successfully updated!");
    }

    isOwnerVerified(vaultBlob, signature, publicKey){
        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .hexToBytes("vaulthex", "vault")
            .publicKeyVerify("vault", "sign", "pubkey", "verified");

        return ic.get("verified")
    }

    saveNewVault(vaultBlob, signature, publicKey, id){
        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .hexToBytes("vaulthex", "vault")
            .publicKeyVerify("vault", "sign", "pubkey", "verified");
        if(!ic.get("verified")){
            throw new Error("Vault signature is not valid");
        }
        Logger.debug("Signature is valid");

        if (!id){
            do{
                id = this.generateID();
            }while (this.isVaultExist(id));
        } else if (this.isVaultExist(id)){
            throw new Error("Vault already exists");
        }
        this._writeVault(id, vaultBlob, publicKey);
        return id;
    }


    completeRegistration(vaultBlob, signature, publicKey, id){
        let ic = new iCrypto();
        ic.addBlob("vaulthex", vaultBlob)
            .addBlob("sign", signature)
            .setRSAKey("pubkey", publicKey, "public")
            .hexToBytes("vaulthex", "vault")
            .publicKeyVerify("vault", "sign", "pubkey", "verified");
        if(!ic.get("verified")){
            throw new Error("Vault signature is not valid");
        }
        Logger.debug("Signature is valid");
        if(!this.isRegistrationActive(id)){
            throw new Error("Registration is not active for: " + id)
        }

        this._writeVault(id, vaultBlob, publicKey);
        this._consumeRegistrationToken(id)
    }

    getVault(id){
        //Get vault
        if(!this.isVaultExist(id)){
            throw new Error("Vault not found");
        }

        return fs.readFileSync(this.getVaultPath(id), 'utf8');
    }


    isRegistrationPending(vaultID){
        Logger.debug("Registration pending called but not implemented!");
        return  fs.existsSync(this.vaultsPath + vaultID) &&
        !fs.existsSync(this.vaultsPath + vaultID + "/" + VAULT) &&
        !fs.existsSync(this.vaultsPath + vaultID + "/" + PUBLICKEY) &&
        fs.existsSync(this.vaultsPath + vaultID + "/" + PENDING)
    }


    isRegistrationActive(vaultID){
        let adminPublicKey = AdminKey.get();
        if(!this.isRegistrationPending(vaultID)){
            return false
        }

        let signData =  fs.readFileSync(this.vaultsPath + vaultID + "/" + PENDING, "utf8");
        let ic = new iCrypto();
        ic.addBlob("sign", signData)
            .addBlob("idhex", vaultID)
            .hexToBytes("idhex", "id")
            .setRSAKey("pub", adminPublicKey, "public")
            .publicKeyVerify("id", "sign", "pub", "res");
        return ic.get("res")
    }


    deleteTopic(vaultBlob, vaultId, pkfp, signature, publicKey = null){
        if(!publicKey){
            publicKey = this.getVaultPublicKey(vaultId);
        }
        if(!this.isOwnerVerified(vaultBlob, signature, publicKey)){
            throw("Owner's signature is invalid");
        }
        if(this.isRegistrationPending(vaultId)){
            throw("The vault registration is pending. Updates are disabled");
        }

        //updating vault
        this._updateVault(vaultId, vaultBlob, publicKey);


    }

    _consumeRegistrationToken(vaultID){
        fs.unlinkSync(this.vaultsPath + vaultID + "/" + PENDING);
    }

    createGuestVault(vaultID, signature){
        fs.mkdirSync(this.vaultsPath + vaultID );
        fs.writeFileSync(this.vaultsPath + vaultID + "/" + PENDING, signature)
    }



    logUnauthorizedWriteAttempt(data){
        Logger.warn("Unauthorized vault write attempt!", data)
    }

    getVaultPath(id){
        return this.vaultsPath + id + "/vault";
    }

    async deleteVault(id){
        if(fs.existsSync(this.vaultsPath + id))
            await fs.remove(this.vaultsPath + id);
    }

    getVaultPublicKeyPath(id){
        return this.vaultsPath + id + "/publicKey";
    }

    isVaultExist(id){
        return (fs.existsSync(this.vaultsPath + id) &&
            fs.existsSync(this.vaultsPath + id + "/vault") &&
            fs.existsSync(this.vaultsPath + id + "/publicKey"));
    }

    _writeVault(id, blob, publicKey){
        let vaultPath = this.vaultsPath + id + "/";
        if(!fs.existsSync(vaultPath)){
            fs.mkdirSync(vaultPath);
        }
        fs.writeFileSync(vaultPath + "vault", blob);
        fs.writeFileSync(vaultPath + "publicKey", publicKey);
    }

    _updateVault(id, blob){
        let vaultPath = this.vaultsPath + id + "/";
        fs.writeFileSync(vaultPath + "vault", blob);
    }

    getVaultPublicKey(id){
        if(!this.isVaultExist(id)){
            throw new Error("Vault not found");
        }

        return fs.readFileSync(this.getVaultPublicKeyPath(id), 'utf8');
    }


    generateID(){
        return new RandExp(new RegExp("[a-f0-9]{" + this.vaultIdLength + "}")).gen();
    }


}

module.exports = VaultManager;

/**
 *  dir-id
 *    vault
 *    publicKey
 *
 */
