import { WildEmitter } from "./WildEmitter";
import { createDerivedErrorClasses }  from "../../../../common/DynamicError";
import { Message } from "./Message";
import { Internal } from "../../../../common/Events"

class VaultRetrieverError extends Error{ constructor(data){ super(data); this.name = "VaultRetrieverError" } }
const err = createDerivedErrorClasses(VaultRetrieverError, {
    vaultIsNull: "VaultNotAvailable",
    fetchVaultError: "FetchVaultError"

})


export class VaultRetriever{

    constructor(connector){

        WildEmitter.mixin(this);
        this.connector = connector;
        this.url = url;
        this.vaultData = null;
    }

    getVaultData(){
        if(null === this.vaultData) throw new err.vaultIsNull();
        return this.vaultData;
    }

    run(cb){
        setImmediate(async ()=>{
            let message = new Message();
            message.setCommand(Internal.GET_LOGIN_SET);
            this.connector.send()
            try{
                let data = await this.fetchVault()
                cb(null, data);
            }catch(error){
                console.log(`Fetch vault error: ${error}`);
                cb(error)
            }
        })
    }

    async fetchVault(){
        let response = await fetch(this.url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if(!response.ok){
            throw new err.fetchVaultError(`${response.status}: ${response.statusText}`);
        }

        return await response.json()
    }

}
