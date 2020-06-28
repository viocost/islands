class VaultHolderError extends Error{ constructor(data){ super(data); this.name = "VaultHolderError" } }
const { createDerivedErrorClasses } = require("../../../../common/DynamicError");
import { iCrypto } from "./iCrypto";


const err = createDerivedErrorClasses(VaultHolderError, {
    isNull: "VaultNotInitialized"
})

export class VaultHolder{
    constructor(vaultData, password){
        this.vaultData = vaultData;
        this.password = password;
        this.vault = null;
    }

    unlock(){
        //try unlocking

        let ic = new iCrypto();
        ic.addBlob("s16", vaultEncrypted.substring(0, 256))
            .addBlob("v_cip", vaultEncrypted.substr(256))
            .hexToBytes("s16", "salt")
            .createPasswordBasedSymKey("sym", this.password, "s16")
            .AESDecrypt("v_cip", "sym", "vault_raw", true)
            .setRSAKey("pub", data.publicKey, "public")
            .getPublicKeyFingerprint("pub", "pkfp");

        // Populating new object
        let data = JSON.parse(ic.get("vault_raw"));

        const vault = new Vault()

        vault.pkfp = ic.get("pkfp");
        vault.adminKey = data.adminKey;
        vault.admin = data.admin;
        vault.publicKey = data.publicKey;
        vault.privateKey = data.privateKey;

        //settings
        if(data.settings){
            vault.settings = JSON.parse(JSON.stringify(data.settings));
        } else {
            vault.settings = {
                sound: true
            }
        }


        if(!data.pkfp){
            ic.setRSAKey("pub", data.publicKey, "public")
              .getPublicKeyFingerprint("pub", "pkfp");
        } else {
            this.pkfp = data.pkfp;
        }

        //////////////////////////////////////////////////////////////
        // let unpackedTopics = this.unpackTopics(topics, password) //
        //                                                          //
        // if (unpackedTopics){                                     //
        //     for(let pkfp of Object.keys(unpackedTopics)){        //
        //         console.log(`INITIALIZING TOPIC ${pkfp}`);       //
        //         this.topics[pkfp] = new Topic(                   //
        //             this.version,                                //
        //             pkfp,                                        //
        //             unpackedTopics[pkfp].name,                   //
        //             unpackedTopics[pkfp].key,                    //
        //             unpackedTopics[pkfp].comment                 //
        //         )                                                //
        //     }                                                    //
        // }                                                        //
        //////////////////////////////////////////////////////////////

        if (!data.version || semver.lt(data.version, "2.0.0")){
            // TODO format update required!
            console.log(`vault format update required to version ${version}`)
            let self = this;
            this.version = version;
            this.versionUpdate = async ()=>{
                console.log("!!!Version update lambda");
                await  self.updateVaultFormat(data)
            };
        }
    }

    getVault(){
        if(null === this.vault) throw new err.isNull()

        return this.vault;
    }

}
