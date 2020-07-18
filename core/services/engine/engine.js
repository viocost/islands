const  { ExecutableChildProcess, NodeChildProcess } = require("./CoreUnit.js");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const CuteSet = require("./CuteSet.js")
const { execFileSync } = require("child_process")
const { platform } = require("os");
const { readdirSync } = require("fs");
const crypto = require("crypto");
const hound = require('hound');  //Filewatcher for debug mode. Restarts when something is changed
const getPort = require('get-port');
const LoggerSingleton = require("./Logger")
const Updater = require("./Updater");

const USAGE = `ISLANDS ENGINE

OPTIONS:

-u islands_update_x.x.xxx.zip
    Update islands with update file and exit

-p
    Chat port. Default port is ephemeral.

-d
    Debug mode.

--tor-password somepassword
    When running in debug mode - set specific tor password
    This will not work in production mode.

-v
    Print version and exit
-h
    Print this message and exit

`

const LOG_FILENAME = "islands.log"
let LOGS_SWITCH;
let OUTPUT;
let UPDATE_FILE;
let PRINT_VERSION = false;
let Logger;

let torDebugPassword;

//output handling
let lastOutput = new Date();
let connectionStringPrintedLast = false;
const CONNECTION_STRING_SHOW_TIMEOUT = 2000
const CHAT_CONNECTION = {
    host: "localhost",
    port: 4000
}
let DEBUG_PORT;

const torConfig = {
    torHost: '127.0.0.1',
    torControlHost: '127.0.0.1'
}


//config container
let config;

let tor; //tor subprocess handle
let chat; //chat subprocess handle


//Parse islands config
async function parseTorConfig(){
    config = JSON.parse(fs.readFileSync(path.join(process.env["CONFIG"], "island_conf.json")));
    if (!config.tor                    ||
        !config.tor.torExitPolicy){
            console.log(`Missing required tor parameter in config.`)
            process.exit(1);
    }

    torConfig.torControlPort = config.tor.torControlPort || await getPort();
    torConfig.hiddenServicePort = config.tor.hiddenServicePort || await getPort();
    torConfig.torSOCKSPort = config.tor.torSOCKSPort || await getPort();
    torConfig.torExitPolicy = config.tor.torExitPolicy;

}


function prepareTorDataDirectory(){
    //preparing tor data directory
    let torDir = path.join(process.env["ISLANDS_DATA"], "tor")
    if (!fs.existsSync(torDir)){
        fs.mkdirSync(torDir);
    }
    torConfig.torDir = torDir
}

function generateTorrc(){
    //generate torrc
    let content = `
    ControlPort ${torConfig.torControlPort}
    HashedControlPassword ${process.env["TOR_PASSWD_HASH"]}
    ExitPolicy ${torConfig.torExitPolicy}
    SOCKSPort ${torConfig.torSOCKSPort}
    DataDirectory ${torConfig.torDir}
    `
    torConfig.torrcPath = path.join(process.env['CONFIG'], "torrc");
    fs.writeFileSync(torConfig.torrcPath, content);
}


function initializeTorEnv(){
    //gen dynamic tor password
    process.env["TOR_PASSWD"] = process.env["DEBUG"] && !!torDebugPassword ?
        torDebugPassword : crypto.randomBytes(20).toString('hex');



    //get tor hash
    let hashCmdArgs = ["--hash-password", process.env["TOR_PASSWD"], "--quiet"]
    for (let i=0; i<50; i++){
        process.env["TOR_PASSWD_HASH"] = execFileSync(process.env["TOR"], hashCmdArgs).toString("utf8") || ""
        if(process.env["TOR_PASSWD_HASH"].length > 5){
            console.log("Tor control password hash has been successfully generated.");
            break
        }
    }

    if (!process.env["TOR_PASSWD_HASH"]){
        console.log(`Tor password hash has not been successfully generated. This behavior was observed on some Windows versions under Virtualbox.\n
                    Try another Windows edition, or virtualization platform.`)
        process.exit(1)
    }

    process.env["TOR_CONTROL_PORT"] = torConfig.torControlPort;
    process.env["TOR_CONTROL_HOST"] = torConfig.torControlHost;
    process.env["TOR_PORT"] = torConfig.hiddenServicePort;
    process.env["TOR_HOST"] = torConfig.torHost;
    process.env["TOR_SOCKS_PORT"] = torConfig.torSOCKSPort;
}



function launchTor(){
    console.log("Launching tor...");
    // Set tor env variables
    // launch tor
    let torCmdArgs = ["-f", torConfig.torrcPath];
    tor = new ExecutableChildProcess(process.env["TOR"], torCmdArgs, false);
    tor.launch();
    tor.onoutput = data=>{ outputHandler(data, "TOR") };
}


async function launchChat(){

    let chatCmdArgs = [`${process.env["APPS"]}/chat/server/island.js`];
    if (process.env["DEBUG"]){
        console.log("Setting DEUBG flag for chat")
        chatCmdArgs.push("--debug")

        let dPort = config.nodeDebugPort || await getPort();
        let dHost = config.nodeDebugHost || "localhost";
        DEBUG_PORT = dPort;

        console.log(`Setting node debug to: ${dHost}:${dPort}`)
        chatCmdArgs.splice(0, 0, `--inspect=${dHost}:${dPort}`);
    }


    if (process.env["CHAT_PORT"] && parseInt(process.env["CHAT_PORT"]) < 65536){
        CHAT_CONNECTION.port = process.env["CHAT_PORT"]
    } else{
        CHAT_CONNECTION.port = await getPort();
        process.env["CHAT_PORT"] = CHAT_CONNECTION.port
    }

    chatCmdArgs.push("-p")
    chatCmdArgs.push(process.env["CHAT_PORT"]);

    chat = new ExecutableChildProcess(process.env["NODEJS"], chatCmdArgs, true)
    chat.launch();
    chat.onoutput = data=>{ outputHandler(data, "ISLANDS")};

    if (process.env["DEBUG"]){
        console.log("Enabling chat debug source watcher")
        let watcher = hound.watch(path.join(process.env["APPS"], "chat"))

        watcher.on("change", ()=>{
            chat.restart()
            console.log("Something has changed")
        })

        watcher.on("create", ()=>{
            console.log("Something has been created")
            chat.restart()
        })

        watcher.on("delete", ()=>{
            console.log("Something has been deleted")
            chat.restart()
        })
    }
}




function outputHandler(data, label){
    if (LOGS_SWITCH) Logger.info(data, label);
    //resetting timestamp
    connectionStringPrintedLast = false;
    lastOutput = new Date();
    setTimeout(()=>{
        if (new Date() - lastOutput >= CONNECTION_STRING_SHOW_TIMEOUT - 5 && !connectionStringPrintedLast){
            printConnectionString();
        }
    }, CONNECTION_STRING_SHOW_TIMEOUT)

}

function printConnectionString(){

let str = `\nCONNECT TO ISLAND: http://${CHAT_CONNECTION.host}:${CHAT_CONNECTION.port}
ADMIN: http://${CHAT_CONNECTION.host}:${CHAT_CONNECTION.port}/admin
`
    if (process.env['DEBUG']) str += `DEBUG PORT: ${DEBUG_PORT}`;
    console.log(str)
    connectionStringPrintedLast = true;
}


function prepareLogger(){
    process.env["ISLANDS_LOGS"] = path.join(process.env["ISLANDS_DATA"], "logs")
    if(!fs.existsSync(process.env["ISLANDS_LOGS"])) fs.mkdirSync(process.env["ISLANDS_LOGS"]);
    let level = process.env["DEBUG"] ? 3 : 1;
    LoggerSingleton.init(path.join(process.env["ISLANDS_LOGS"], LOG_FILENAME), level);
    Logger = LoggerSingleton.getLogger();
}

function clearLogs(){
    console.log("Clearing logs...");
    fs.unlinkSync(path.join(process.env["ISLANDS_LOGS"], LOG_FILENAME))
    console.log("done");
}

//Putting it all together
async function main(){
    parseArgs();
    initEnv();
    await checkUpdate();
    printVersion()
    prepareLogger()
    console.log("Parsing configuration...");
    await parseTorConfig();
    prepareTorDataDirectory();
    initializeTorEnv();
    generateTorrc();
    launchTor();
    await launchChat();
    createCli();
}



function createCli(){

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })




        rl.setPrompt(process.env["PROMPT"] ? `${process.env["PROMPT"]}:>` : "island:> ")

        const usage = `
help
   print this message

logs-on
   enable logging into file

logs-off
   disable logging into file

clear-logs
   remove logs file

output-on
   enable output to terminal

output-off
   disable output to terminal

Ctrl-c
   Kill island
        `

        rl.on('line', (line)=>{
            console.log(`processing command: ${line}`);
            switch(line.trim()){
                case 'help':
                    printConnectionString();
                    console.log(usage);
                    break;
                case 'logs-on':
                    LOGS_SWITCH = true
                    OUTPUT = true
                    break
                case 'logs-off':
                    LOGS_SWITCH = false
                    break

                case 'clear-logs':
                    clearLogs()
                    break;
                case 'output-on':
                    tor.switchOutput(true)
                    chat.switchOutput(true)
                    OUTPUT = true
                    break
                case 'output-off':
                    tor.switchOutput(false)
                    chat.switchOutput(false)
                    OUTPUT = false
                    break

            }
            rl.prompt();

        }).on('close', ()=>{
            console.log("closing");
        })
}

//initialization
function initEnv(){
    if(!process.env.hasOwnProperty("BASE")){
            console.log(`Missing environment variable BASE`)
            process.exit(1);
    }

    process.env["APPS"] = path.join(process.env["BASE"], "apps");
    process.env["CONFIG"] = path.join(process.env["BASE"], "config");
    process.env["ISLANDS_DATA"] = path.join(process.env["BASE"], "data");
    process.env["UPDATE_DIR"] = path.join(process.env["BASE"], "update")

    const p = platform()
    if (p === "linux"){
            initLinux();
    } else if (p === "darwin"){

            initMac();
    } else if (p === "win32"){

            initWin();
    } else {
        console.log("ERROR: UNKNONWN PLATFORM");
        process.exit(1);
    }
}

async function checkUpdate(){
    if (!UPDATE_FILE) return;

    let updater = new Updater(UPDATE_FILE);
    await updater.runUpdate()
    PRINT_VERSION = true
    printVersion();

}

function initLinux(){
    process.env["TOR"] = path.join(process.env["BASE"], "core/linux/bin/tor");
    process.env["NODEJS"] = path.join(process.env["BASE"], "core/linux/bin/node");
    process.env['LD_LIBRARY_PATH'] = path.join(process.env["BASE"], "core/linux/lib");
}

function initMac(){
    process.env["TOR"] = path.join(process.env["BASE"], "core/mac/bin/tor");
    process.env["NODEJS"] = path.join(process.env["BASE"], "core/mac/bin/node");
    process.env['DYLD_LIBRARY_PATH'] = path.join(process.env["BASE"], "core/mac/lib");
}

function initWin(){
    let winPath = process.arch === "x64" ? "win64" : "win32"
    process.env["TOR"] = path.join(process.env["BASE"], "core", winPath, "tor", "tor.exe");
    process.env["NODEJS"] = path.join(process.env["BASE"], "core", winPath, "node", "node.exe");
}

//prints version and exits
function printVersion(){
    if(!PRINT_VERSION) return;

    console.log("\nPrinting islands version...\n");
    let pkgJson = JSON.parse(fs.readFileSync(path.join(process.env["APPS"], "chat", "package.json")))
    let coreVersion = fs.readFileSync(path.join(process.env["BASE"], "core", "core.version"), "utf8")

    let pkgJsonEngine = JSON.parse(fs.readFileSync(path.join(process.env["APPS"], "engine", "package.json")))

    let versionString = `ISLANDS RELEASE ${pkgJson["version"]}
Chat version: ${pkgJson["chat-version"]}
Engine version: ${pkgJsonEngine["version"]}
${coreVersion}
`
    console.log(versionString)
    console.log("Exiting...")
    process.exit(0)

}

function parseArgs(){
    const args = process.argv.slice(2);

    args.forEach((val, index, arr)=>{
        switch(val){
            case "-u":
                UPDATE_FILE = arr[index+1]
                break;
            case "-d":
                process.env["DEBUG"] = true;
                LOGS_SWITCH = true
                break;
            case "-p":
                process.env["CHAT_PORT"] = arr[index+1];
                break;

            case "-v":
                PRINT_VERSION = true
                break;
            case "--tor-password":
                torDebugPassword = arr[index+1]
                break;
            case "-h":
                console.log(USAGE);
                process.exit(0);
        }
    })


}
//end

main()
    .then(()=>{
        console.log("Running....");

    })
    .catch(err=>{
        console.error(`Main script error: ${err}`)
        console.trace(err)
        process.exit(1);
    })
