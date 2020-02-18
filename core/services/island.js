// This is a main core driver script
const { spawn } = require("child_process")
const readline = require("readline")
const fs = require("fs")
const path = require("path")

const binPath = path.join(__dirname, "..", "bin")
console.log(`Bin path: ${binPath}`);


class CoreUnit{
    constructor(binPath, confPath){
        console.log("Launching core unit: " + binPath)
        this.binPath = binPath
        this.confPath = confPath
        this.restartTimeout = 0;
        this.crashes = getLimitedLengthArray(10);
        this.process = null //  process handle
        this.killing = false // kill flag
    }

    launch(){
        let self = this;
        this.process = spawn(this.binPath)
        let handler = ()=>{
                setTimeout(()=>{
                    if (self.killing) return;
                    self.launch()
                }, self.restartTimeout)
        }
        this.process.on('close', handler)
        this.process.on('exit', handler)
        this.process.stdout.on("data", (data)=>{console.log(data.toString())})
        this.process.stderr.on("data", (data)=>{console.log(data.toString())})
    }


    kill(){
        console.log("Killing core unit")
        this.killing = true;
        this.process.kill("SIGTERM")
    }


}

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
