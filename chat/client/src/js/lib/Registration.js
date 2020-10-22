import { UXMessage }  from "../ui/Common"
import { Vault } from "./Vault"
import { IslandsVersion } from "../../../../common/Version";

export function register(uxBus,  data) {
    uxBus.emit(UXMessage.REGISTER_PROGRESS)

    setTimeout(()=>{

        Vault.registerAdminVault(data.password, data.confirm, IslandsVersion.getVersion())
            .then(() => {
                console.log("Emitting register success on the bus");
                uxBus.emit(UXMessage.REGISTER_SUCCESS)
            })
            .catch(err => {
                uxBus.emit(UXMessage.REGISTER_ERROR, err)
            })
    }, 200)
}
