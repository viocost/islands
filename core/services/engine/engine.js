const  CoreUnit = require("./CoreUnit.js");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const CuteSet = require("./CuteSet.js")
const { execSync } = require("child_process")
const { platform } = require("os");
const { readdirSync } = require("fs");
const crypto = require("crypto");


const binPath = path.join(__dirname, "..", "bin")
console.log(`Bin path: ${binPath}`);


// Checking environment variables
const envVariables = ['BASE', 'NODEJS', 'PYTHON', 'TOR', 'ISLANDS_DATA', 'APPS', 'CONFIG'];
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
if (!config.tor ||
    !config.tor.torControlPort ||
    !config.tor.torExitPolicy  ||
    !config.tor.torSOCKSPort){
        console.log(`Missing required tor parameter in config.`)
        process.exit(1);
}

//gen dynamic tor password
process.env["TOR_PASSWD"] = crypto.randomBytes(20).toString('hex');

//get tor hash
let torHashCmd = `${process.env["TOR"]} --hash-password ${process.env["TOR_PASSWD"]} --quiet`
process.env["TOR_PASSWD_HASH"] = execSync(torHashCmd).toString("utf8")
console.log(`TOR HASH IS ${process.env["TOR_PASSWD_HASH"]}`)

//Generate torrc
let torConfig = `
ControlPort ${config.tor.torControlPort}\n
HashedControlPassword ${process.env["TOR_PASSWD_HASH"]}\n
ExitPolicy ${config.tor.torExitPolicy}\n
`
let torrcPath = path.join(process.env['CONFIG'], "torrc");
fs.writeFileSync(torrcPath, torConfig);

console.log("Launching tor...")
process.env["TOR_CONTROL_PORT"] = config.tor.torControlPort;
process.env["TOR_CONTROL_HOST"] = '127.0.0.1';
process.env["TOR_PORT"] = 15140;
process.env["TOR_HOST"] = '127.0.0.1';




// Set tor env variables
// launch tor
let torCmd = `${process.env["TOR"]} -f ${torrcPath}`
const tor = new CoreUnit(torCmd, false)
tor.launch();

let chatCmd = `${process.env["NODEJS"]} ${process.env["APPS"]}/chat/server/app.js`
const chat = new CoreUnit(chatCmd, true)
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




rl.setPrompt("island:> ")
rl.prompt


rl.on('line', (line)=>{
    console.log("processing command");
    switch(line.trim()){
        case 'help':
            console.log("Wassup?");
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

