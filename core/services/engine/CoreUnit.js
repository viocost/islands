const { execFile }  = require("child_process");
const { StateMachine } = require("adv-state");



const SHUTDOWN_TIMEOUT = 10000;
const RESTART_TIMOUT_LEVEL_1 = 200;
const RESTART_TIMOUT_LEVEL_2 = 2000;

/**
 * This class provides simple process management functionality
 * such as start, stop, restart, handle crash, get output etc.
 *
 * @param cmd - command to start a process
 */
class CoreUnit{
    constructor(executable, args, output){
        console.log("Launching core unit: " + executable)
        this.sm = _prepareStateMachine()
        this.output = output; //if true then print to console
        this.executable = executable;
        this.args = args;
        this.restartTimeout = 200;
        this.crashLevel = 0;
        this.crashes = getLimitedLengthArray(15);
        this.process = null //  process handle
        this.killing = false // kill flag
        this.onoutput;
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    launch(){
        this.process = execFile(this.executable, this.args, ()=>{
            console.log(`Subprocess ${this.executable} started`);

        })
        let handler = ()=>{
            this.crashes.push(new Date())
            let tmt = this._calculateRestartTimeout()
            setTimeout(()=>{
                if (this.killing) return;
                this.launch()
            }, tmt)
        }
        this.process.on('exit', handler)
        this.process.stdout.on("data", data => { this.handleOutput(data, this) })
        this.process.stderr.on("data", data => { this.handleOutput(data, this) })
    }


    kill(){
        console.log("Killing core unit")
        this.killing = true;
        this.process.kill()
    }


    switchOutput(onOff){
        this.output = !!onOff;
    }

    restart(){
        this.process.kill("SIGTERM");
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Core Unit SM",
            stateMap: {
                notRunning: {
                    initial: true,
                    transitions: {
                        launch: {
                            actions: this.launch,
                        },

                        processRunning: {
                            state: "running"
                        }

                    }
                },

                running: {
                    transitions: {
                        processClosedNonZero: {
                            state: "notRunning",
                            actions: this._restartOnCrash
                        },

                        kill: {
                            actions: this._kill,
                            state: "shuttingDown"
                        }
                    }
                },

                shuttingDown: {
                    entry: this._setShutdownTimeout,
                    transitions: {
                        subProcessClosed: {
                            state: terminated
                        },

                        shutdownTimeoutExpired: {

                        }

                    }

                },


                shutdownTimeout: {
                    final: true,
                    entry: this._notifyShutdownTimeout
                },

                terminated: {
                    final: true
                }

            }

        }, { msgNotExist: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }

    _notifyShutdownTimeout(){
        console.log("SHUTDOWN TIMEOUT! Process hasn't closed gracefully");
    }

    _setShutdownTimeout(){
        setTimeout(()=>{

        })

    }

    _setCrashLevel(level){
        this.crashLevel = level;
        this.crashes.splice(0, this.crashes.length-1)
    }

    _calculateRestartTimeout(){
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
            this._setCrashLevel(this.crashLevel + 1)
        }

        let res = timeoutPerLevel[this.crashLevel]
        console.log(`Timeout is ${res}`);
        return res
    }


    handleOutput(data, self){
        let msg = data.toString('utf8')
        if (self.output){
            console.log(msg)
        }
        if (typeof self.onoutput === "function"){
            self.onoutput(msg)
        }
    }



}


class NodeChildProcess extends CoreUnit{
    constructor(){
        super(arguments)
    }
}

class ExecutableChildProcess extends CoreUnit{

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

module.exports = {
    NodeChildProcess: NodeChildProcess,
    ExecutableChildProcess: ExecutableChildProcess
};
