const  CoreUnit = require("./CoreUnit.js");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const CuteSet = require("./CuteSet.js")
const { execFileSync } = require("child_process")
const { platform } = require("os");
const { readdirSync } = require("fs");
const crypto = require("crypto");


// Checking environment variables
const envVariables = ['BASE', 'NODEJS', 'TOR', 'ISLANDS_DATA', 'APPS', 'CONFIG'];
const osEnv = {
    "darwin": ['DYLD_LIBRARY_PATH'],
    "linux": ['LD_LIBRARY_PATH'],
    "win32": []
}



for (let env of envVariables.concat(osEnv[platform()])){
    if (!process.env.hasOwnProperty(env)){
        console.log(`Missing environment variable ${env}`)
        process.exit(1);
    }
}

//Parse islands config
const config = JSON.parse(fs.readFileSync(path.join(process.env["CONFIG"], "island_conf.json")));
if (!config.tor                    ||
    !config.tor.torControlPort     ||
    !config.tor.torExitPolicy      ||
    !config.tor.hiddenServicePort  ||
    !config.tor.torSOCKSPort){
        console.log(`Missing required tor parameter in config.`)
        process.exit(1);
}

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

console.log(`TOR HASH IS ${process.env["TOR_PASSWD_HASH"]}`)

//preparing tor data directory
let torDir = path.join(process.env["ISLANDS_DATA"], "tor")
if (!fs.existsSync(torDir)){
    fs.mkdirSync(torDir);
}

console.log(`Tor data directory is ${torDir}`);
//generate torrc
let torConfig = `
ControlPort ${config.tor.torControlPort}
HashedControlPassword ${process.env["TOR_PASSWD_HASH"]}
ExitPolicy ${config.tor.torExitPolicy}
SOCKSPort ${config.tor.torSOCKSPort}
DataDirectory ${torDir}
`
let torrcPath = path.join(process.env['CONFIG'], "torrc");
fs.writeFileSync(torrcPath, torConfig);

console.log("Launching tor...")
process.env["TOR_CONTROL_PORT"] = config.tor.torControlPort;
process.env["TOR_CONTROL_HOST"] = '127.0.0.1';
process.env["TOR_PORT"] = config.tor.hiddenServicePort;
process.env["TOR_HOST"] = '127.0.0.1';



// Set tor env variables
// launch tor
let torCmdArgs = ["-f", torrcPath];
const tor = new CoreUnit(process.env["TOR"], torCmdArgs, true);
tor.launch();

let chatCmdArgs = [`${process.env["APPS"]}/chat/server/app.js`];
if (process.env["DEBUG"]){
    console.log("Setting DEUBG flag for chat")
    chatCmdArgs.push("--debug")
}

console.log(`In engine. Chat port is: ${process.env["CHAT_PORT"]}`);

if (process.env["CHAT_PORT"] && parseInt(process.env["CHAT_PORT"]) < 65536){
    chatCmdArgs.push("-p")
    chatCmdArgs.push(process.env["CHAT_PORT"]);
}

const chat = new CoreUnit(process.env["NODEJS"], chatCmdArgs, true)
chat.launch();

console.log("Done. Launching apps.");

const coreApps = new CuteSet(["engine"])
const appDirs = new CuteSet(readdirSync(process.env["APPS"]).filter((app)=>{
    return !coreApps.has(app);
}))

for (let app of appDirs){
    console.log(`Starting ${app}`);
}



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})




rl.setPrompt(process.env["PROMPT"] ? `${process.env["PROMPT"]}:>` : "island:> ")
rl.prompt


rl.on('line', (line)=>{
    console.log("processing command");
    switch(line.trim()){
        case 'help':
            console.log("Here will be help message");
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

