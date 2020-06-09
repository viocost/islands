import * as util  from "./lib/dom-util";
import * as UI from "./lib/ChatUIFactory";
import { BlockingSpinner } from "./lib/BlockingSpinner";
import toastr from "./lib/toastr";
import "../css/chat.sass"
import "../css/vendor/loading.css";
import * as CuteSet from "cute-set";
import * as io from "socket.io-client";
import { StateMachine } from "./lib/StateMachine";



let vault;
let topics;



document.addEventListener('DOMContentLoaded', event =>{
    //console.log(`Initializing page. Registration: ${isRegistration()}, Version: ${version}`);

    console.log("Content loaded. Processing!");
    //loadSounds();
    //initChat();
    initLoginUI();

    //util.$("#print-dpi").onclick = ()=>{alert(window.devicePixelRatio)}
    //util.$("#print-max").onclick = ()=>{alert(window.innerWidth)}
});



function initLoginUI(){
    console.log("Initializing login UI");
    let header = util.$("header")
    util.appendChildren(header, UI.bakeLoginHeader());

    let mainContainer = util.$('#main-container');
    util.removeAllChildren(mainContainer);

    if (isRegistration()){

        let registrationBlock = UI.bakeRegistrationBlock(()=>{
            console.log("Registration handler");
        })
        util.appendChildren("#main-container", registrationBlock)
    } else {
        let loginBlock = UI.bakeLoginBlock(initSession)
        util.appendChildren("#main-container", loginBlock)
    }
}



function initSession(){

    console.log("init session called");
}
