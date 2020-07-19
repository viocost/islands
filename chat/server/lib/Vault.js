const path = require("path");
const fs = require("fs-extra");
const { EventEmitter } = require('events');
const { StateMachine } = require('adv-state')
const { iCrypto } = require("../../common/iCrypto");


class Vault extends EventEmitter {

    static MakePendingVault(oneTimePassword) {
        const vault = new Vault();
        vault.setPending(oneTimePassword)
        return vault;
    }

    constructor(id, config) {
        this.id = id;
        this.sm = this.prepareStateMachine();
        this.onions = []
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

    prepareStateMachine() {
        return new StateMachine(this, {
            name: "Vault SM",
            stateMap: {
                start: {
                    transitions: {
                        setPending: {
                            state: "pending"
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
