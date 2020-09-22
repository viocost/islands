
document.addEventListener('DOMContentLoaded', event => {
    IslandsVersion.setVersion(islandsVersion())
    console.log(`Islands version is ${IslandsVersion.getVersion()}`);
    let uxBus = new UIMessageBus();

    uxBus.on(UX.UXMessage.LOGIN_CLICK, )

    UX.initialize(uxBus);

    isRegistration() ? prepareRegistration(uxBus)
        : prepareLogin(uxBus)

});

function prepareRegistration(uxBus){

    uxBus.emit(UX.UXMessage.TO_REGISTRATION)
}

function prepareLogin(uxBus){
    uxBus.emit(UX.UXMessage.TO_LOGIN)
}
