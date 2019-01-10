const express = require('express');
const app = express();
const Chat = require('./classes/IslandsChat');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require("fs");
const fileUpload = require('express-fileupload');
const adminServer = require('./classes/AdminServer');
const Logger = require("./classes/libs/Logger.js");
let VERSION;
try{
    VERSION = "v" + JSON.parse(fs.readFileSync('./package.json').toString()).version
}catch(err){
    console.log("Failed to set version: " + err );
    VERSION = "version unknown";
}

app.use(fileUpload());


let PORT = 4000;
let HOST = '0.0.0.0';

global.DEBUG = true;


let configPath = './config/config.json';
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
historyPath = config.historyPath || historyPath;
let updatePath = config.updatePath || "../update";

let adminKeyPath = config.adminKeyPath || "../keys";
adminServer.setKeyFolder(adminKeyPath, updatePath);
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

app.get("/", (req, res)=>{
    res.render("chat", {title:"Islands chat", version: VERSION});
});

app.get("/admin", (req, res)=>{
    res.render("admin", {
        title:"Admin login",
        secured: adminServer.isSecured(),
        version: VERSION
    });
});

Logger.initLogger(config.servicePath, "debug");

adminServer.initAdminEnv(app, config, HOST, PORT);



let chat;
//const server = app.listen(PORT, HOST, ()=>{
const server = app.listen(PORT, HOST, async ()=>{
    console.log("running on " + "\nHOST: " + HOST + "\nPORT: " +  PORT);
    chat = new Chat(server, config);
    await chat.runGlobalResync();
});




