
export class CoreUnit{
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
