const Vault = require("./lib/Vault");
const fs = require("fs-extra");
const path = require("path");
const WebService = require("./lib/WebService");
const getPort = require('get-port');


let basePath
let HOST = "127.0.0.1"
let vaults;


async function initIslands(){

    let vaultsPaths = getVaults(basePath);

    vaults = Promise.all(vaultsPaths.map(async vPath =>{
        let id = vPath.split(path.sep).reverse()[0]
        let port = await getPort();
        let webService = new WebService(HOST, port)
        webService.start()
        console.log(`Initializing vault with id: ${id}, and path: ${vPath} `);
        return new Vault(id, vPath, webService)
    }))
}


process.argv.forEach((val, index, array)=>{
    switch(val){
        case "-b":
            basePath = array[index+1];
            break

        case "-p":
            PORT = array[index+1];
            break
    }
});

initIslands()
    .then(()=>{
        console.log("Islands initialized");
    })
    .catch(err=>{
        throw err
    })



///UTILITY FUNCTIONS
//Given base path returns array of paths for each vault
function getVaults(basePath){
    return fs.readdirSync(path.join(basePath, "vaults")).map(vaultId =>{
        return path.join(basePath, "vaults", vaultId);
    })
}


//Given base path checks directory tree and creates if necessary
function checkDirTree(basePath){
   
}
