const { EventEmitter } = require('events');
const { StateMachine } = require("../../common/AdvStateMachine")
const { iCrypto } = require("../../common/iCrypto");


class VaultFactory{
    constructor(){

    }


    makePendingVault(config) {
        const vault = new Vault();
        vault.setPending(oneTimePassword)
        return vault;
    }

    makeActiveVault(vaultId, config){
        const vault = new Vault()
    }
}

class Vault extends EventEmitter {



    constructor() {
        this.sm = this._prepareStateMachine();
    }

    setPending(oneTimePassword){
        this.sm.handle.setPending(oneTimePassword);
    }

    updateVaultSettings() {

    }


    saveTopic() {

    }

    deleteTopic() {

    }

    //This called when user tries to login
    authenticate() {

    }


    saveVault() {

    }

    loadOnions() {

    }

    _OTPDeriveSymKey(OTP){

    }

    _setPendingSymkey(args){
        let OTP = args[0];
        this._pendingSymKey = this._OTPDeriveSymKey(OTP);
    }

    _prepareStateMachine() {
        return new StateMachine(this, {
            name: "Vault SM",
            stateMap: {
                start: {
                    transitions: {
                        setPending: {
                            state: "pending",
                            actions: this._setPendingSymkey
                        },

                        setActive: {
                            state: "active",
                            transitions: {

                            }
                        }
                    }
                },

                pending: {
                    transitions: {
                        setActive: {
                            state: "active"
                        },

                        setIncactive: {
                            state: "inactive"
                        }
                    }
                },

                active: {

                },

                inactive: {

                }


            }
        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

}



module.exports = Vault;
