const express = require('express');
const app = express();
let path = require("path")
const Vault = require("./lib/Vault");
const fs = require("fs-extra");
const SocketIO = require('socket.io');

let HOST = "0.0.0.0";
let PORT = 4000

//views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//static dir
app.use(express.static(path.join(__dirname, '../public')));

let basePath;
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

console.log(`Base path: ${basePath}`);

let vaultsPaths = getVaults(basePath);
let vaults = vaultsPaths.map(vPath =>{
    let id = vPath.split(path.sep).reverse()[0]
    console.log(`Initializing vault with id: ${id}, and path: ${vPath} `);
    return new Vault(id, vPath)
})


const server = app.listen(PORT, HOST, async ()=>{
    console.log("running on " + "\nHOST: " + HOST + "\nPORT: " +  PORT);
});

const io = SocketIO.listen(server)
const chatSocketHub = io.of("/chat")
chatSocketHub.on("connect")
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
