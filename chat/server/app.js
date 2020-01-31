const express = require('express');
const app = express();
const Chat = require('./classes/IslandsChat');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require("fs-extra");
const fileUpload = require('express-fileupload');
const HiddenServiceManager = require("./classes/libs/HiddenServiceManager");

const Logger = require("./classes/libs/Logger.js");
const helpRouter = require("./helpRouter.js");
const vaultRouter = require("./vaultRouter");
const adminRouter = require("./adminRouter");
const chatRouter = require("./chatRouter");
const HSVaultMap = require("./classes/libs/HSVaultMap");
const mobileRouter = require("./mobileRouter");
let VERSION;

console.log("\n\nINITIALIZING ISLANDS....")

try{
    VERSION = "v" + JSON.parse(fs.readFileSync('./package.json').toString()).version
    console.log(`Version is set to ${VERSION}`)
}catch(err){
    console.trace("Failed to set version: " + err );
    VERSION = "version unknown";
}

app.use(fileUpload());


let PORT = 4000;
let HOST = '0.0.0.0';

global.DEBUG = true;


let configPath = './server/config/config.json';
let historyPath = "../history/";
let adminKeysPath = "../keys/";
let servicePath = "../service/";
let logger;

process.argv.forEach((val, index, array)=>{
    if (val === "-p"){
        PORT = process.argv[index+1];
    } else if(val === "-h"){
        HOST = process.argv[index+1];
    } else if (val === "-c") {
        configPath = process.argv[index+1];
    } else if (val === "-k"){
        adminKeysPath = process.argv[index+1];
    }
});


let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

Logger.initLogger(config.servicePath, "debug");
let helloMsg = "!!=====ISLANDS v." + VERSION + " =====!!"
console.log(helloMsg);
Logger.info(helloMsg);

historyPath = config.historyPath || historyPath;
let updatePath = config.updatePath || "../update";

let adminKeyPath = config.adminKeyPath || "../keys";

servicePath = config.servicePath || "../service/";

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000}));

if (app.get('env') === 'development'){
    logger = require('morgan');
    app.use(logger('dev'));
    app.locals.pretty = true;
}

app.use(express.static(path.join(__dirname, '../public')));



//HS - hidden service
HSVaultMap.init(config.hsVaultMap);


adminRouter.init(app, config, HOST, PORT, VERSION, adminKeyPath, updatePath);
vaultRouter.init(config, VERSION);
mobileRouter.init(VERSION);

app.use("/", vaultRouter.router);
app.use("/mobile", mobileRouter.router);
app.use("/help", helpRouter);
app.use("/chat", chatRouter.router);
app.use("/admin", adminRouter.router);


app.get("/iostest", (req, res)=>{
    res.render("iostest")
})


let chat;
//const server = app.listen(PORT, HOST, ()=>{
const server = app.listen(PORT, HOST, async ()=>{
    console.log("running on " + "\nHOST: " + HOST + "\nPORT: " +  PORT);
    chat = new Chat(server, config);
    await chat.runGlobalResync();
});

//
// //TEST ONLY
//let testws = require("./classes/poc/testws");
//testws.init(server);
//
