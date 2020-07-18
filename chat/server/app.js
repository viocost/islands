const express = require('express');
const app = express();
const Chat = require('./classes/IslandsChat');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require("fs-extra");
const fileUpload = require('express-fileupload');
//const HiddenServiceManager = require("./classes/libs/HiddenServiceManager");

//const Logger = require("./classes/libs/Logger.js");
//const helpRouter = require("./helpRouter.js");
//const vaultRouter = require("./vaultRouter");
const adminRouter = require("./adminRouter");
const appRouter = require("./appRouter");
const HSVaultMap = require("./classes/libs/HSVaultMap");
//const mobileRouter = require("./mobileRouter");

console.log("\n\nINITIALIZING ISLANDS....")

try{
    global.VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "../",'package.json' )).toString()).version;

    console.log(`Version is set to ${global.VERSION}`)
}catch(err){
    console.trace("Failed to set version: " + err );
    global.VERSION = "version unknown";
}

app.use(fileUpload());


let PORT = 4000;
let HOST = '0.0.0.0';

global.DEBUG = false;



//Building configuration


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


adminRouter.init(app, config, HOST, PORT, adminKeyPath, updatePath);
appRouter.init(config);
app.use("/", appRouter.router);
app.use("/admin", adminRouter.router);



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
