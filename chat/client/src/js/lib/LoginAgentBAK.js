import { StateMachine } from "../../../../common/AdvStateMachine";
import { VaultHolder } from "./VaultHolder";
import { VaultRetriever } from "./VaultRetriever";
import { Vault } from "./Vault";
import { WildEmitter } from "./WildEmitter";
import { Events } from "../../../../common/Events";
import { iCrypto } from "../../../../common/iCrypto";
import { Internal } from "../../../../common/Events"

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
        this.sessionKeyEncrypted;
        this.sessionKeyRaw;


        this.connector.on("auth", (msg)=>{
            switch(msg.headers.command){
                case Internal.AUTH_CHALLENGE:{
                    this.sm.handle.acceptChallenge(msg)
                    break;
                }

                case Internal.AUTH_OK: {
                    this.emit(Events.LOGIN_SUCCESS, this)
                }


            }
        })
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS

    acceptPassword(password){
        this.password = password;
        this.sm.handle.acceptPassword()
    }

    getRawVault(){
        return this.vaultRaw;
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS

    _acceptChallenge(stateMachine, eventName, args){
        console.log("Saving session data");
        let { headers, body } = args[0]
        let { private_key, session_key } = body
        this.vaultEncrypted = private_key;
        this.sessionKeyEncrypted = session_key;
    }

    _acceptPassword(stateMachine, eventName, args){
        console.log("Saving password");
        this._password = args[0]
    }


    _decryptSuccessHandler(stateMachine, eventName, args){
        this.connector.acceptSessionKey(args[0])
    }


    _notifyLoginError(sm, evName, err){
        this.emit(Events.LOGIN_ERROR, err);
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                noVaultNoPassword: {
                    initial: true,
                    transitions: {

                        acceptPassword: {
                            state: "noVaultHasPassword",
                            actions: this._acceptPassword.bind(this)
                        },

                        acceptChallenge:{
                            state: "hasVaultNoPassword",
                            actions: this._acceptChallenge.bind(this)
                        }
                    }
                },

                noVaultHasPassword: {
                    transitions: {
                        acceptChallenge:{
                            state: "hasVaultNoPassword",
                            actions: this._acceptChallenge.bind(this)
                        }

                    }

                },


                hasVaultNoPassword: {
                    transitions: {
                        acceptPassword: {
                            state: "decrypting"
                        }
                    }
                },

                decrypting: {
                    entry: this._tryDecrypt.bind(this),

                    transitions: {
                        decryptError: {
                            state: "hasVaultNoPassword",
                            actions: this._notifyLoginError
                        },

                        decryptSuccess: {
                            actions: this._decryptSuccessHandler.bind(this),
                            state: "authenticated"
                        }
                    }
                },


                authenticated: {
                    final: true
                }
            }
       })
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

        //decrypt session key

        ic.setRSAKey("secret_k", this.vaultRaw.privateKey, "private")
          .addBlob("session_k", this.sessionKeyEncrypted)
          .privateKeyDecrypt("session_k", "secret_k", "session_k_raw", "hex")
        this.sessionKeyRaw = ic.get("session_k_raw");

        console.log("Session key decrypted");
        this.sm.handle.decryptSuccess(ic.get("session_k_raw"));
    }


}
