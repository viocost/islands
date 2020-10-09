import { WildEmitter } from "../../../../common/WildEmitter";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { Internal, Events } from "../../../../common/Events";


/**
 * This agent takes a password and a confirmation string,
 * re-encrypts all topic keys and sends request to resave the vault
 * re-encrypted with new password
 *
 * After response received from the server emites result to whoever is interested
 */
export class PasswordChangeAgent{
    constructor(password, confirm, vault){
        WildEmitter.mixin(this)
        this.password = password;
        this.confirm = confirm;
        this.vault = vault;
    }

    run(){
        console.log("Changing password of the vault");
        if(this.confirm !== this.password){
            console.log("Password don't match");
            this.emit(PasswordChangeEvents.fail, "Password and confirmation don't match");
            return;
        }

        if(this.vault.password === this.password){
            console.log("Password don't match");
            this.emit(PasswordChangeEvents.fail, "Entered existing password");
            return;
        }

        console.log("All checks are good. Resaving vault...");

        this.vault.password = this.password;
        this.vault.save("Password change");

    }



}



export const PasswordChangeEvents = {
    success: Symbol("success"),
    fail: Symbol("fail")
}
