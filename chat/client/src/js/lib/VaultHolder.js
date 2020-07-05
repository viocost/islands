export class VaultHolder{
    constructor(vault, password){
        this.password = password;
        this.vault = vault;
    }

    getVault(){
        return this.vault;
    }

}
