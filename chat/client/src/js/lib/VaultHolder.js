export class VaultHolder{
    constructor(vault, password, vaultRaw){
        this.password = password;
        this.vault = vault;
    }

    getVault(){
        return this.vault;
    }


}
