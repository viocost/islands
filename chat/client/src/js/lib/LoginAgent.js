import { MasterRSAKeyAgent } from "./lib/KeyAgent";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { VaultHolder } from "./VaultHolder";
import { VaultRetriever } from "./VaultRetriever";
import { Vault } from "./Vault";
import { WildEmitter } from "./WildEmitter";
import { Events } from "../../../../common/Events";
import { iCrypto } from "../../../../common/iCrypto";


export class LoginAgent{
    //In object pass UI functions
    constructor({ version, connector, arrivalHub }){
        WildEmitter.mixin(this);
        this.version = version;
        this.connector = connector;
        this.arrivalHub = arrivalHub;
        this.sm = this._prepareStateMachine()
        this.vaultId;
        this.vaultEncrypted;
        this.vaultHolder;
        this.vaultRaw;
        this.masterKeyAgent;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS
    fetchVault(){
        this.sm.handle.fetchVault()
    }

    acceptPassword(password){
        this.sm.handle.acceptPassword(password)
    }

    getRawVault(){
        return this.vaultRaw;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _acceptPassword(stateMachine, evName, args){
        this.masterKeyAgent = new MasterRSAKeyAgent(args[0])
        console.log(`Password accepted: ${args[0]}`);
        this.connector.setMasterKeyAgent(this.masterKeyAgent)
        this.connector.establishConnection()

    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                watingForPassword: {
                    initial: true,
                    transitions: {
                        acceptPassword: {
                            actions: [ this._acceptPassword, this._connect ],
                            state: "connecting"
                        }
                    }
                },

                connecting: {
                    transitions: {
                        sessionEstablished: {
                            state: "waitingForVault",
                            actions: this._performFetchVault
                        }
                    }
                },

                waitingForVault: {
                    vaultReceived: {
                        actions: this._tryDecrypt,
                        state: "decrypting"
                    }
                },

                decrypting: {
                    decryptionError: {
                        state: "waitingForPassword",
                        actions: this._notifyLoginError
                    },

                    success: {
                        state: "success",
                        actions: this._notifyLoginSuccess
                    }

                },

                success: {
                    final: true
                }
            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }


    _performFetchVault(){
        const vaultRetriever = new VaultRetriever("/vault");
        vaultRetriever.run(this._processFetchVaultResult.bind(this))
    }

    _processFetchVaultResult(err, data){

        if (err){
            console.log(`Fetch vault error: ${err}`);
            this.error = err;
            return;
        }

        console.log(`Got the vault: ${data} this: ${this}`);
        this.vaultId = data.vaultId;
        this.vaultEncrypted = data.vault;
        this.sm.handle.gotVault();
    }

    _notifyPasswordInvalid(){
        console.log("password invalid");
    }

    _tryDecrypt(){
        console.log("Decrypting vault...");
        let password = this.password;

        let ic = new iCrypto();
        let data;

        try{
            ic.addBlob("s16", this.vaultEncrypted.substring(0, 256))
                .addBlob("v_cip", this.vaultEncrypted.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", password, "s16")
                .AESDecrypt("v_cip", "sym", "vault_raw", true)

            data = JSON.parse(ic.get("vault_raw"));
            this.vaultRaw = data;

        } catch (err){
            this.sm.handle.decryptError(err);
            return;
        }

        // Populating new object
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
        vault.version = this.version;

        //settings
        vault.initializeSettings(data.settings)
        this.vaultHolder = new VaultHolder(vault)
        console.log('decrypt success');
        this.sm.handle.decryptSuccess();
    }

    _notifyLoginSuccess(){
        this.emit(Events.LOGIN_SUCCESS, this.vaultHolder)

    }

    _notifyLoginError(sm, evName, err){
        this.emit(Events.LOGIN_ERROR, err);
    }

}
