import * as util  from "domik";
import { BlockingSpinner } from "./lib/BlockingSpinner";
import toastr from "./lib/toastr";
import { Chat } from "./lib/ChatClient";

// ---------------------------------------------------------------------------------------------------------------------------
// TEST
window.util = util;
// ---------------------------------------------------------------------------------------------------------------------------
// ~END TEST

// ---------------------------------------------------------------------------------------------------------------------------
// Visual Sections
let loginBlock;
let registrationBlock;
let registrationCompletedBlock;
let chatBlock;
let spinner = new BlockingSpinner();
// ---------------------------------------------------------------------------------------------------------------------------
// Objects
let vault;
let topics;

document.addEventListener('DOMContentLoaded', event =>{
    console.log(`Initializing page. Registration: ${isRegistration()}`);
    let form = bakeLoginBlock();
    let container = util.$("#main-container");
    util.appendChildren(container, form);
});


// ---------------------------------------------------------------------------------------------------------------------------
// Page blocks management
function bakeLoginBlock(){
     return  util.bake("div", {
        id: "vault-login--wrapper",
        style: 'display: flex;',
        children: util.bake("div", {
            classes: "form-border",
            children: [
                util.bake("h3", {html: "Vault login:"}),
                util.bake("div",  {
                    children:  util.bake("input", {
                        id: "vault-password",
                        attributes: {
                            type: "password",
                            placeholder: "Password",
                            maxlength: "50"
                        }
                    })
                }),
                util.bake("div", {
                    children: util.bake("button", {
                        classes: "btn",
                        id: "vault-login-btn",
                        text: "Login",
                        listeners: {
                            "click": ()=>{alert("CLICKED!")}
                        }
                    }),
                })
            ]
        })
    })
}

function bakeRegistrationBlock(){

}

function bakeRegistrationSuccessBlock(){

}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END Page blcoks management


// ---------------------------------------------------------------------------------------------------------------------------
// UI handlers
function vaultLogin(){
    let passwordEl = util.$("#vault-password");
    if (!passwordEl){
        throw new Error("Vault password element is not found.");
    } else if (!passwordEl.value){
        throw new Error("Error: missing password.")
    }
    loadingOn()
    XHR({
        type: "post",
        url: "/",
        success: (data)=>{
            console.log("Vault obtained. Processing...");
            try{
                initSession(data, password, passwordEl)
            }catch(err){
                toastr.warning(`Login error: ${err.message}`);
            }finally{
                loadingOff();
            }
        },

        error: err => {
            loadingOff();
            toastr.warning(err.responseText);
        }
    })
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END UI handlers




// Decrypts the vault and initializes session
function initSession(vaultData, password){
    //Decrypt vault

    //Initialize multiplexor socket

    //Initialize vault

    //Initialize topic instances

    //Initizlie interface
}

// ---------------------------------------------------------------------------------------------------------------------------
// Util


function loadingOn() {
    spinner.loadingOn()
}

function loadingOff() {
    spinner.loadingOff()
}
// ---------------------------------------------------------------------------------------------------------------------------
// ~END util
