import { Vault } from './Vault'
import { iCrypto } from "./iCrypto";


class VaultHolderError extends Error{ constructor(data){ super(data); this.name = "VaultHolderError" } }
const { createDerivedErrorClasses } = require("../../../../common/DynamicError");


const err = createDerivedErrorClasses(VaultHolderError, {
    isNull: "VaultNotInitialized"
})

export class VaultHolder{
    constructor(vaultData, id, password){
        this.vaultEncrypted = vaultData;
        this.password = password;
        this.vault = null;
        this.vaultId = id;
        this.error = null
    }

    unlock(){

        let ic = new iCrypto();

        try{
            ic.addBlob("s16", this.vaultEncrypted.substring(0, 256))
                .addBlob("v_cip", this.vaultEncrypted.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", this.password, "s16")
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
        vault.password = this.password;
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
        if(null === this.vault) throw new err.isNull()
        return this.vault;
    }

}
