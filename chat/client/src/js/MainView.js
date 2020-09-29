import * as util from "./lib/dom-util";
import * as UI from "./lib/ChatUIFactory"


export function setLoginView({ onLoginClick }) {
    let header = util.$("header")
    util.appendChildren(header, UI.bakeLoginHeader());

    let mainContainer = util.$('#main-container');
    util.removeAllChildren(mainContainer);

    let loginBlock = UI.bakeLoginBlock()
    util.appendChildren("#main-container", loginBlock)

    let loginBtn = util.$('#vault-login-btn')
    loginBtn.onclick = onLoginClick;
}

export function setRegistrationView({ onRegisterClick }){
    let registrationBlock = UI.bakeRegistrationBlock(onRegisterClick)
    util.appendChildren("#main-container", registrationBlock)

    let registerBtn = util.$("#register-vault-btn")
    registerBtn.onclick = onRegisterClick;
}
