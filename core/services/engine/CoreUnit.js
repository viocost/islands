const { execFile }  = require("child_process");

/**
 * This class provides simple process management functionality
 * such as start, stop, restart, handle crash, get output etc.
 *
 * @param cmd - command to start a process
 */
class CoreUnit{
    constructor(executable, args, output){
        console.log("Launching core unit: " + executable)
        this.output = output; //if true then print to console
        this.executable = executable;
        this.args = args;
        this.restartTimeout = 200;
        this.crashLevel = 0;
        this.crashes = getLimitedLengthArray(15);
        this.process = null //  process handle
        this.killing = false // kill flag
    }

    setCrashLevel(level){
        this.crashLevel = level;
        this.crashes.splice(0, this.crashes.length-1)
    }

    calculateRestartTimeout(){
        let curTime = new Date()
        let timeoutPerLevel = [350, 2000]
        let timeWindow = timeoutPerLevel[this.crashLevel] * 15;

        let crashCount = 0;

        for(let i=this.crashes.length-1; i>=0; --i){
            if (curTime - this.crashes[i] <= timeWindow){
                crashCount++;
            }
        }

        console.log("Crash count: " + crashCount)
        console.log("Level: " + this.crashLevel)

        if (crashCount >= 9 && this.crashLevel < 1){
            console.log("Increasing crash level!");
            this.setCrashLevel(this.crashLevel + 1)
        }

        let res = timeoutPerLevel[this.crashLevel]
        console.log(`Timeout is ${res}`);
        return res
    }

    launch(){
        let self = this;
        this.process = execFile(this.executable, this.args)
        let handler = ()=>{
            self.crashes.push(new Date())
            let tmt = self.calculateRestartTimeout()
            setTimeout(()=>{
                if (self.killing) return;
                self.launch()
            }, tmt)
        }
        this.process.on('exit', handler)
        this.process.stdout.on("data", (data)=>{
            if (this.output){
                console.log(data.toString('utf8'))
            }
        })
        this.process.stderr.on("data", (data)=>{
            if(this.output){
                console.log(data.toString('utf8'))
            }
        })
    }


    kill(){
        console.log("Killing core unit")
        this.killing = true;
        this.process.kill()
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
