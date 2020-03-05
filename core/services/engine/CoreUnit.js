const { spawn, exec }  = require("child_process");

/**
 * This class provides simple process management functionality
 * such as start, stop, restart, handle crash, get output etc.
 *
 * @param cmd - command to start a process
 */
class CoreUnit{
    constructor(cmd){
        console.log("Launching core unit: " + binPath)

        this.cmd = cmd
        this.restartTimeout = 0;
        this.crashes = getLimitedLengthArray(10);
        this.process = null //  process handle
        this.killing = false // kill flag
    }

    launch(){
        let self = this;
        this.process = exec(this.cmd)
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

module.exports = CoreUnit;
