const { spawn, exec }  = require("child_process");

/**
 * This class provides simple process management functionality
 * such as start, stop, restart, handle crash, get output etc.
 *
 * @param cmd - command to start a process
 */
class CoreUnit{
    constructor(cmd){
        console.log("Launching core unit: " + cmd)

        this.cmd = cmd
        this.restartTimeout = 200;
        this.crashLevel = 0;
        this.crashes = getLimitedLengthArray(15);
        this.process = null //  process handle
        this.killing = false // kill flag
    }

    setCrashLevel(level){
        this.crashLevel = level;
    }

    calculateRestartTimeout(){
        let curTime = new Date()
        let timeoutPerLevel = [200, 2000, 5000]
        let timeWindow = timeWindow[this.crashLevel] * 15;

        let crashCount = 0;

        for(let ts of this.crashes.reverse()){
            if (curTime - ts <= timeWindow){
                crashCount++
            }
        }

        if (crashCount >= 10 && this.crashLevel < 2){
            this.setCrashLevel(this.crashLevel + 1)
        } else {
            this.setCrashLevel(0)
        }

        return timeoutPerLevel[this.crashLevel]
    }

    launch(){
        let self = this;
        this.process = exec(this.cmd)
        let handler = ()=>{
            self.crashes.push(new Date())
                setTimeout(()=>{
                    if (self.killing) return;
                    self.launch()
                }, self.calculateRestartTimeout())
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
