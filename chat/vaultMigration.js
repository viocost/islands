const { exportVault, importVault, validatePassword } = require("./old_server/classes/libs/VaultMigration");
const { HistoryManager } = require("./old_server/classes/libs/HistoryManager");
const VaultManager = require("./old_server/classes/libs/VaultManager");
const fs = require("fs-extra")
const path = require("path")

let action, source, dest, vault, isAdmin, passwd;

const USAGE = `

Islands vault and history migration tool.

USAGE:

/path/to/node vaultMigration.js -i|-e|-v -d string -s string [-a -p string]

OPTIONS:

-i
    Import vault mode

-e
    Export vault mode

-v
    Verify vault against password
    For this action options -s and -p must be present
    -s should point to vault file. Ex: /path/to/island/data/IslandsChat/vaults/<some_pkfp>/vault



-s
    Vault source. Mandatory.
    When importing a vault this option should specify path to
    vault.zip, i.e. -s /path/to/vault.zip

    When exporting a vault, this option should specify path to
    vault root directory, i.e. -s /path/to/data/IslandsChat/vaults/vaultPkfp
    vaultPkfp is vault public key fingerprint that servers as vault ID,
    it is a 64 chars long string

-d
    Destination. Mandatory.
    When importing a vault, this option should specify path
    to chat data directory, the one that ends with /data/IslandsChat/
    i.e. -d /path/to/data/IslandsChat

    When exporting a vault, this option should specify path to write
    resulting vault.zip.

-a
    Import vault as admin vault. When migrating a guest vault,
    it must be modified in order to be recognized as admin's vault on the new island

-p
    Vault password. Mandatory for import
    This is necessary in order to properly import vault
    and initialize admin key.

-h
    Help. Display this message and exit.
`

process.argv.forEach((val, index, array)=>{
    switch(val){
        case "-i":
            action = 1;
            break;
        case "-e":
            action = 2;
            break;
        case "-v":
            action = 3;
            break;
        case "-s":
            source = process.argv[index+1];
            break;
        case "-d":
            dest = process.argv[index+1];
            break;
        case "-a":
            isAdmin = true
            break;
        case "-p":
            passwd = process.argv[index+1];
            break;
        case "-h":
            printHelpAndExit();
    }
})

if(!action || !source || (new Set([1, 2]).has(action ) && !dest) || (new Set([1, 3]).has(action) && !passwd)){
    console.log(action);
    console.log(passwd);

    printHelpAndExit();
}


if(action === 1){
    console.log("Importing vault.");
    importVault(source, dest, isAdmin, passwd)
        .then(()=>{
            console.log("Import successful");
        })
        .catch((err)=>{
            console.log(`Vault import failed: ${err}`);
        })

}else if(action === 2){
    console.log(`Exporting vault. Source: ${source}`);
    let vaultId = path.basename(source);
    let historydir = path.normalize(path.join(source, "..", "..", "history"))
    console.log("history dir: " + historydir);
    let vaultsPath = path.join(source, "../")

    let hm = new HistoryManager(historydir);
    let vm = new VaultManager({vaultsPath: vaultsPath})

    exportVault(vaultId, hm, vm)
        .then(pathToZip =>{
            fs.copySync(pathToZip, path.join(dest, "vault.zip"));
            console.log("Export completed successfully.")
        })
        .catch(err=>{
            console.log(`Vault export failed: ${err}`);
            throw (err)
        })

} else if (action === 3){
    console.log("Checking password against vault..");
    if(!fs.existsSync(source)){
        console.log("Vault file does not exist");
    }

    validatePassword(passwd, source) ?
        console.log("Password is correct") :
        console.log("Password validation has failed");
}


function printHelpAndExit(){
    console.log(USAGE)
    process.exit(0)
}
