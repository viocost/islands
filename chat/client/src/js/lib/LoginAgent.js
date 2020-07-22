import { MasterRSAKeyAgent } from "./KeyAgent";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { VaultHolder } from "./VaultHolder";
import { VaultRetriever } from "./VaultRetriever";
import { Vault } from "./Vault";
import { WildEmitter } from "./WildEmitter";
import { Events } from "../../../../common/Events";
import { iCrypto } from "../../../../common/iCrypto";
import { ConnectionState } from "./Connector";
import { Internal } from "../../../../common/Events"



export class LoginAgent {
    //In object pass UI functions
    constructor({ version, connector, arrivalHub }) {
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
        this.password;

        this.connector.on(Internal.CONNECTION_STATE_CHANGED, state => {
            switch (state) {
                case ConnectionState.SESSION_ESTABLISHED:
                    this.sm.handle.sessionEstablished()
                    break
                case ConnectionState.INVALID_KEY:
                    console.log("Decryption error");
                    this.sm.handle.decryptionError()
                    break

            }
        })
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS
    fetchVault() {
        console.log("FETCH VAULT CALLED");


        //       this.sm.handle.fetchVault()
    }

    acceptPassword(password) {
        this.password = password;
        this.sm.handle.acceptPassword(password)
    }

    getRawVault() {
        return this.vaultRaw;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS


    _acceptPassword(stateMachine, evName, args) {
        this.masterKeyAgent = new MasterRSAKeyAgent(args[0])
        console.log(`Password accepted: ${args[0]}`);
        this.connector.setKeyAgent(this.masterKeyAgent)
        this.connector.establishConnection()

    }

    _performFetchVault() {
        console.log("Fetching vault now");
        const vaultRetriever = new VaultRetriever("/vault");
        vaultRetriever.run(this._processFetchVaultResult.bind(this))
    }

    _processFetchVaultResult(err, data) {

        if (err) {
            console.log(`Fetch vault error: ${err}`);
            this.error = err;
            return;
        }

        console.log(`Got the vault: ${data} this: ${this}`);
        this.vaultId = data.vaultId;
        this.vaultEncrypted = data.vault;
        this.sm.handle.gotVault();
    }

    _notifyPasswordInvalid() {
        this.emit(Events.LOGIN_ERROR, "Passowrd invalid");
    }

    _tryDecrypt() {
        console.log("Decrypting vault...");
        let password = this.password;

        let ic = new iCrypto();
        let data;

        try {
            ic.addBlob("s16", this.vaultEncrypted.substring(0, 256))
                .addBlob("v_cip", this.vaultEncrypted.substr(256))
                .hexToBytes("s16", "salt")
                .createPasswordBasedSymKey("sym", password, "s16")
                .AESDecrypt("v_cip", "sym", "vault_raw", true)

            data = JSON.parse(ic.get("vault_raw"));
            this.vaultRaw = data;

        } catch (err) {
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

    _notifyLoginSuccess() {
        this.emit(Events.LOGIN_SUCCESS, this.vaultHolder)

    }

    _notifyLoginError(sm, evName, err) {
        this.emit(Events.LOGIN_ERROR, err);
    }



    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                awatingPassword: {
                    initial: true,
                    transitions: {
                        acceptPassword: {
                            actions: this._acceptPassword,
                            state: "awatingSession"
                        }
                    }
                },

                awatingSession: {
                    transitions: {
                        sessionEstablished: {
                            state: "fetchingVault"
                        },

                        decryptionError: {
                            state: "awatingPassword",
                            actions: this._notifyPasswordInvalid
                        }
                    }
                },

                fetchingVault: {
                    entry: this._performFetchVault,
                    trnasitions: {
                        gotVault: {
                            state: "decryptingVault"
                        },

                        error: {
                            state: "fatalError"
                        }
                    }
                },

                decryptingVault: {
                    entry: this._tryDecrypt,
                    transitions: {
                        decryptSuccess: {
                            state: "success"
                        },

                        decryptError: {
                            state: "fatalError"
                        }
                    }

                },

                success: {
                    entry: this._notifyLoginSuccess,
                    final: true
                },

                fatalError: {
                    entry: this._notifyLoginError,
                    entry: () => { console.log("FATAL ERROR"); }
                }
            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

}
