const  CoreUnit = require("./CoreUnit.js");
const  spawn = require("child_process").spawn
const readline = require("readline")
const fs = require("fs")
const path = require("path")

const binPath = path.join(__dirname, "..", "bin")
console.log(`Bin path: ${binPath}`);


// Checking environment variables
const envVariables = ['NODEJS', 'NPM', 'PYTHON', 'PIP', 'TOR', 'ISLANDS_DATA', 'APPS', 'ISLANDS_CONF', 'TORIFY'];

for (let env of envVariables){
    if (!process.env.hasOwnProperty(env)){
        console.log(`Missing environment variable ${env}`)
        process.exit(1);
    }
}


// if not present
// try to look for them
//    if unsuccessful
//       die

// Assuming that core binaries provided with environment variables
if (!fs.existsSync(path.join(binPath, "tor")) ||
    !fs.existsSync(path.join(binPath, "node")) ||
    !fs.existsSync(path.join(binPath, "python3")) ||
    !fs.existsSync(path.join(binPath, "npm"))
   ){
    console.log("Core binares not found.")
    process.exit(1)
}


console.log("Launching tor...")

const tor = new CoreUnit(path.join(binPath, "tor"))
tor.launch();

console.log("Done.");

console.log("Launching i2p...")
const i2p = new CoreUnit(path.join(binPath, "i2pd"))
i2p.launch();

console.log("Done.");


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


// ---------------------------------------------------------------------------------------------------------------------------
// Util

function getLimitedLengthArray(length){
    let arr = new Array();

    arr.push = function(){
        if (this.length >= length){
            this.shift();
        }
        return Array.prototype.push.apply(this, arguments);

    }

    return arr;
}
