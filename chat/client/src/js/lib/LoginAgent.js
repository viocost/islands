import { StateMachine } from "./AdvStateMachine";


export class LoginAgent{
    //In object pass UI functions
    constructor({}){
        this.sm = this.prepareStateMachine()
    }


    prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                noVaultNoPassword: {
                    initial: true,
                    transitions: {
                        fetchVault: {
                            actions: this.processFetchVaultResult
                        },

                        gotVault: {
                            state: "hasVaultNoPassword",
                        }
                    }
                },

                noVaultHasPassword: {
                    transitions: {
                        gotVault: {
                            state: "decryptingVault"
                        },

                        vaultTimeout: {

                        }
                    }

                },

                hasVaultNoPassword: {
                    transitions: {
                        gotPassword: {
                            state: "decryptingVault"
                        }
                    }

                },
                decryptingVault: {
                    entry: this.tryDecrypt,
                    transitions: {
                        decryptError: {
                            state: "hasVaultNoPassword"
                        },

                        decryptSuccess: {
                            state: "loggedIn"
                        }
                    }

                },

                loggedIn: {
                    entry: this.notifyLoginSuccess,
                    final: true
                }





            }
       })
    }

    fetchVault(){
        this.sm.handle.fetchVault()
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

    notifyLoginSuccess(){

    }

    tryDecrypt(stateMachine, evName, args){

        const password = args[0];

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

}
