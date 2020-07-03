import { StateMachine } from "./AdvStateMachine";


export class LoginAgent{
    //In object pass UI functions
    constructor({}){
        this.sm = this.prepareStateMachine()
    }


    prepareStateMachine(){
        return new StateMachine(this, {
            name: "Vault Holder SM",
            stateMap: {
                noVaultNoPassword: {
                    initial: true,

                },

                noVaultHasPassword: {
                    transitions: {
                        vaultTimeout: {

                        }
                    }

                },

                hasVaultNoPassword: {

                },



                decryptingVault: {

                },

                loggedIn: {
                    final: true
                }





            }
       })
    }

}
