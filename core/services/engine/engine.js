const  CoreUnit = require("./CoreUnit.js");
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


//output handling
let lastOutput = new Date();
const CONNECTION_STRING_SHOW_TIMEOUT = 2000
const CHAT_CONNECTION = {
    host: "localhost",
    port: 4000
}

const torConfig = {
    torHost: '127.0.0.1',
    torControlHost: '127.0.0.1'
}


//config container
let config;

let tor; //tor subprocess handle
let chat; //chat subprocess handle

// Checking environment variables
const envVariables = ['BASE', 'NODEJS', 'TOR', 'ISLANDS_DATA', 'APPS', 'CONFIG'];
const osEnv = {
    "darwin": ['DYLD_LIBRARY_PATH'],
    "linux": ['LD_LIBRARY_PATH'],
    "win32": []
}


console.log("Parsing configuration...");

for (let env of envVariables.concat(osEnv[platform()])){
    if (!process.env.hasOwnProperty(env)){
        console.log(`Missing environment variable ${env}`)
        process.exit(1);
    }
}


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


//Generates random tor control password
// hashes it using tor binary and saves in TOR_PASSWD_HASH environment variable
function generateDynamicTorPassword(){

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
    process.env["TOR_PASSWD"] = crypto.randomBytes(20).toString('hex');

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
    tor = new CoreUnit(process.env["TOR"], torCmdArgs, true);
    tor.launch();
    tor.onoutput = outputHandler;
}


async function launchChat(){

    let chatCmdArgs = [`${process.env["APPS"]}/chat/server/app.js`];
    if (process.env["DEBUG"]){
        console.log("Setting DEUBG flag for chat")
        chatCmdArgs.push("--debug")
        if(config.nodeDebugPort && config.nodeDebugHost){
            console.log(`Setting node debug to: ${config.nodeDebugHost}:${config.nodeDebugPort}`)
            chatCmdArgs.splice(0, 0, `--inspect=${config.nodeDebugHost}:${config.nodeDebugPort}`);
        }
    }


    if (process.env["CHAT_PORT"] && parseInt(process.env["CHAT_PORT"]) < 65536){
        CHAT_CONNECTION.port = process.env["CHAT_PORT"]
    } else{
        CHAT_CONNECTION.port = await getPort();
        process.env["CHAT_PORT"] = CHAT_CONNECTION.port
    }

    chatCmdArgs.push("-p")
    chatCmdArgs.push(process.env["CHAT_PORT"]);

    chat = new CoreUnit(process.env["NODEJS"], chatCmdArgs, true)
    chat.launch();
    chat.onoutput = outputHandler;
}

console.log("Done. Launching apps.");


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

function outputHandler(){
    //resetting timestamp
    lastOutput = new Date();
    setTimeout(()=>{
        if (new Date() - lastOutput > CONNECTION_STRING_SHOW_TIMEOUT){
            printConnectionString();
        }
    }, CONNECTION_STRING_SHOW_TIMEOUT)

}

function printConnectionString(){
    console.log(`CONNECT TO ISLAND: http://${CHAT_CONNECTION.host}:${CHAT_CONNECTION.port}`)
    console.log(`ADMIN: http://${CHAT_CONNECTION.host}:${CHAT_CONNECTION.port}/admin`)
}

//Putting it all together
async function main(){
    await parseTorConfig();
    prepareTorDataDirectory();
    initializeTorEnv();
    generateTorrc();
    launchTor();

    await launchChat();
}




main()
    .then(()=>{

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })




        rl.setPrompt(process.env["PROMPT"] ? `${process.env["PROMPT"]}:>` : "island:> ")
        rl.prompt

        const usage = `
            help - print this message
            rc   - restart chat
            exit - exit
        `

        rl.on('line', (line)=>{
            console.log("processing command");
            switch(line.trim()){
                case 'help':
                    console.log(usage);
                    break;
                case "rc":
                    console.log("Restarting chat...")
                    chat.restart()
                    break;
                case 'start':
                    console.log("Starting services")
                    break
                case 'stop':
                    console.log("Stopping services");
                    break
                case 'exit':
                    console.log('Killing core services')
                    tor.kill()
                    console.log('Exiting...');
                    process.exit(0)
            }
            rl.prompt();

        }).on('close', ()=>{
            console.log("closing");
        })
    })
    .catch(err=>{
        console.error(`Main script error: ${err}`)
        console.trace(err)
        process.exit(1);
    })
