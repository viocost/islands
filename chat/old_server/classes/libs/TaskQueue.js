const { log } = require("winston");

class TaskQueue{
    constructor(){
        this._queue = [];
        this._working = false;
    }

    enqueue(routine, ...args){
        this._queue.push({routine: routine, args: args})
    }


    run(){
        console.log("Run called");
        console.dir(this)
        setImmediate(this._processQueue.bind(this))
    }

    async _processQueue(){

        console.log("run called: " + this._queue.length);
        if(!this._working){
            this._working = true;
        } else{
            return;
        }
        let job;
        while(job = this._queue.shift()){
            await job.routine(job.args)
        }

        this._working = false;
    }
}

module.exports = TaskQueue;
