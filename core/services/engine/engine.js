const  CoreUnit = require("./CoreUnit.js");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const CuteSet = require("./CuteSet.js")
const { platform } = require("os");
const { readdirSync } = require("fs");



const binPath = path.join(__dirname, "..", "bin")
console.log(`Bin path: ${binPath}`);


// Checking environment variables
const envVariables = ['NODEJS', 'NPM', 'PYTHON', 'PIP', 'TOR', 'TOR_PASSWD', 'TOR_PASSWD_HASH', 'ISLANDS_DATA', 'APPS', 'CONFIG', 'TORIFY'];
const osEnv = {
    "darvin": ['DYLD_LIBRARY_PATH'],
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
const config = JSON.parse(fs.readFileSync(path.join(process.env["CONFIG"], "island_conf.json"))
if (!config.tor ||
    !config.tor.torControlPort ||
    !config.tor.torExitPolicy  ||
    !config.tor.torSOCKSPort){
        console.log(`Missing required tor parameter in config.`)
        process.exit(1);
}

let torConfig = `
ControlPort ${config.tor.torControlPort}\n
HashedControlPassword ${process.env["TOR_PASSWD_HASH"]}\n
ExitPolicy ${config.tor.torExitPolicy}\n
`
let torrcPath = path.join(process.env['CONFIG'], "torrc");
fs.writeFileSync(torrcPath, torConfig);

console.log("Launching tor...")

//Generate torrc


// Set tor env variables
// launch tor

const tor = new CoreUnit(path.join(binPath, "tor"))
tor.launch();

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
            i2p.kill()
            tor.kill()
            console.log('Exiting...');
            process.exit(0)
            break;
    }
    rl.prompt();

}).on('close', ()=>{
    console.log("closing");
})

