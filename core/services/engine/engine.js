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

const USAGE = `ISLANDS ENGINE

OPTIONS:

-p
    Chat port. Default port is ephemeral.

-d
    Debug mode.

-h
    Print this message



`

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

console.log("Done. Launching apps.");



function outputHandler(){
    //resetting timestamp
    lastOutput = new Date();
    setTimeout(()=>{
        if (new Date() - lastOutput >= CONNECTION_STRING_SHOW_TIMEOUT - 20){
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
    parseArgs();
    initEnv();
    console.log("Parsing configuration...");
    await parseTorConfig();
    prepareTorDataDirectory();
    initializeTorEnv();
    generateTorrc();
    launchTor();
    await launchChat();
}



function createCli(){

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })




        rl.setPrompt(process.env["PROMPT"] ? `${process.env["PROMPT"]}:>` : "island:> ")

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

function parseArgs(){
    const args = process.argv.slice(2);

    args.forEach((val, index, arr)=>{
        switch(val){
            case "-d":
                process.env["DEBUG"] = true;
                break;
            case "-p":
                process.env["CHAT_PORT"] = arr[index+1];
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
