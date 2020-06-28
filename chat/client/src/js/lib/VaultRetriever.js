import { WildEmitter } from "./WildEmitter";
import { createDerivedErrorClasses }  from "../../../../common/DynamicError";
import { Vault } from "./Vault";

class VaultRetrieverError extends Error{ constructor(data){ super(data); this.name = "VaultRetrieverError" } }
const err = createDerivedErrorClasses(VaultRetrieverError, {
    vaultIsNull: "VaultNotAvailable",
    fetchVaultError: "FetchVaultError"

})


export class VaultRetriever{

    constructor(url){
        WildEmitter.mixin(this);
        this.url = url;
        this.vaultData = null;
    }

    getVaultData(){
        if(null === this.vaultData) throw new err.vaultIsNull();
        return this.vaultData;
    }

    run(cb){
        setImmediate(async ()=>{
            try{
                let data = await this.fetchVault()
                cb(null, data);
            }catch(err){
                console.log(`Fetch vault error: ${err}`);
                cb(error)
            }
        })
    }

    async fetchVault(){
        let response = await fetch(url, {
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
