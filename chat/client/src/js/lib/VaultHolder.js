import { Vault } from './Vault';
import { iCrypto } from "./iCrypto";
import { VaultRetriever } from "./VaultRetriever";


class VaultHolderError extends Error{ constructor(data){ super(data); this.name = "VaultHolderError" } }
const { createDerivedErrorClasses } = require("../../../../common/DynamicError");


const err = createDerivedErrorClasses(VaultHolderError, {
    isNull: "VaultNotInitialized",
    noCipher: "EncryptedVaultNotFound"
})

export class VaultHolder{
    constructor(){
        this.vaultEncrypted = null;
        this.password = null;
        this.vault = null;
        this.vaultId = null;
        this.error = null
    }

    unlock(password){

        if(this.vaultEncrypted === null){
            return false;
        }

        let ic = new iCrypto();

        try{
            ic.addBlob("s16", this.vaultEncrypted.substring(0, 256))
                .addBlob("v_cip", this.vaultEncrypted.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", password, "s16")
                .AESDecrypt("v_cip", "sym", "vault_raw", true)
        } catch (err){
            this.error = `Error unlocking vault: ${err}\n`
            return false;
        }

        // Populating new object
        let data = JSON.parse(ic.get("vault_raw"));
        ic.setRSAKey("pub", data.publicKey, "public")
            .getPublicKeyFingerprint("pub", "pkfp");

        const vault = new Vault()
        vault.password = password;
        vault.pkfp = ic.get("pkfp");
        vault.adminKey = data.adminKey;
        vault.admin = data.admin;
        vault.publicKey = data.publicKey;
        vault.privateKey = data.privateKey;
        console.log(`Vault raw data: ${data}`);
        vault.id = this.vaultId;

        //settings
        if(data.settings){
            vault.settings = JSON.parse(JSON.stringify(data.settings));
        } else {
            vault.settings = {
                sound: true
            }
        }

        this.vault = vault;
        return true;
    }

    getVault(){

        if(null === this.vault){
            throw new err.isNull()
        }

        return this.vault;
    }

    fetchVault(){
        console.log("Fetching vault");

        if(null != this.vaultEncrypted){
            return
        }

        setImmediate(()=>{
            const vaultRetriever = new VaultRetriever("/vault");
            vaultRetriever.run(this.processFetchVaultResult.bind(this))
        })
    }

    processFetchVaultResult(err, data){

        if (err){
            console.log(`Fetch vault error: ${err}`);
            this.error = err;
            return;
        }

        console.log(`Got the vault: ${data} this: ${this}`);
        this.vaultId = data.vaultId;
        this.vaultEncrypted = data.vault;
    }
}
