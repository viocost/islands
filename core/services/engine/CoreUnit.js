const { execFile, fork }  = require("child_process");
const { StateMachine } = require("adv-state");
const { createDerivedErrorClasses } = require("./DynamicError");

class CoreUnitError extends Error{ constructor(data){ super(data); this.name = "CoreUnitError" } }
const err = createDerivedErrorClasses(CoreUnitError, {
    LaunchFromBase: "AttemptToInvokeLaunchFromBaseClass",
})

const SHUTDOWN_TIMEOUT = 10000;


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
        this.sm;
        this.restartTimeout = 200;
        this.crashLevel = 0;
        this.crashes = getLimitedLengthArray(15);
        this.process = null
        this.onoutput;
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // Public methods

    launch(){
        this.sm.handle.launch()
    }


    kill(){
        this.sm.handle.kill()
    }


    switchOutput(onOff){
        this.output = !!onOff;
    }


    restart(){
        this.sm.handle.restart()


    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods


    _performLaunch(){
        throw new err.LaunchFromBase("This method should be implemented by child classes")
    }



    _processExit(code){
        console.log(`Child process exited with code: ${code}`);
        if (code === 0){
            this.sm.handle.exitedNormally()
        } else {
            this.sm.handle.nonZeroExit(code)
        }


    }

    _restartOnCrash(args){
        this.crashes.push(new Date())
        let timeout = this._calculateRestartTimeout()

        setTimeout(()=>{
            console.log("Restarting after crash");
            this.sm.handle.launch()
        }, timeout)

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

    _performKill(){
        console.log("Killing core unit")
        this.process.kill()

        setTimeout(()=>{
            if(this.sm.state ===  "shuttingDown"){
                this.sm.handle.shutdownTimeoutExpired()
            }
        }, SHUTDOWN_TIMEOUT)
    }

    _performRestart(){
        console.log('Restarting process');
        this.process.kill()
    }

    handleOutput(data){
        let msg = data.toString('utf8')
        if (this.output){
            console.log(msg)
        }
        if (typeof this.onoutput === "function"){
            this.onoutput(msg)
        }
    }



}


class ExecutableChildProcess extends CoreUnit{
    constructor(...args){
        super(...args)
        this.sm = prepareCoreUnitStateMachine.call(this, this.executable);
    }


    _performLaunch(){
        this.process = execFile(this.executable, this.args)

        this.process.on('exit', this._processExit.bind(this))
        this.process.stdout.on("data", this.handleOutput.bind(this))
        this.process.stderr.on("data", this.handleOutput.bind(this))
        this.sm.handle.processRunning()
    }

}


class NodeChildProcess extends CoreUnit{

    constructor(...args){
        super(...args)
        this.sm = prepareCoreUnitStateMachine.call(this, this.executable);
    }


    _performLaunch(){
        this.process = fork(this.executable, this.args, ()=>{
            console.log(`Subprocess ${this.executable} started`);
            this.sm.handle.processRunning()
        })

        this.process.on('exit', this._processExit.bind(this))
        this.process.stdout.on("data", this.handleOutput.bind(this))
        this.process.stderr.on("data", this.handleOutput.bind(this))
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


function prepareCoreUnitStateMachine(name){
        return new StateMachine(this, {
            name: name,
            stateMap: {
                notRunning: {
                    initial: true,
                    transitions: {
                        launch: {
                            actions: this._performLaunch,
                        },

                        exitedNormally: {
                            state: "terminated"
                        },

                        nonZeroExit: {
                            state: "notRunning",
                            actions: this._restartOnCrash
                        },


                        processRunning: {
                            state: "running"
                        }

                    }
                },

                running: {
                    transitions: {
                        nonZeroExit: {
                            state: "notRunning",
                            actions: this._restartOnCrash
                        },

                        restart: {
                            actions: this._performRestart
                        },

                        kill: {
                            actions: this._kill,
                            state: "shuttingDown"
                        }
                    }
                },

                restarting: {
                    transitions: {
                        nonZeroExit: {
                            actions: this._performLaunch
                        },

                        exitedNormally: {
                            actions: this._performLaunch
                        },
                    }

                },

                shuttingDown: {
                    entry: this._setShutdownTimeout,
                    transitions: {
                        exitedNormally: {
                            state: "terminated"
                        },

                        shutdownTimeoutExpired: {
                            state: "shutdownTimeout"

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

module.exports = {
    NodeChildProcess: NodeChildProcess,
    ExecutableChildProcess: ExecutableChildProcess
};
