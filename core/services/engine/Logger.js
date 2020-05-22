const fs = require("fs");

const LOG_LEVELS = [
    "ERROR",
    "WARNING",
    "INFO",
    "DEUBG",
 ]

class Logger{
    static Logger;

    static getLogger(){
        if(Logger.Logger) return Logger.Logger
        throw new Error("Logger is not initialized");
    }

    static init(pathToLogs, level){
        Logger.Logger = new Logger(pathToLogs, level)
    }

    constructor(pathToLogs, level=2){
        if(level < 0 || level >= LOG_LEVELS.length) throw new Error("Invalid level parameter");
        this.pathToLogs = pathToLogs;
        this.level = level;
    }



    debug(data, optionalLabel){
        if(this.level > 2){
            this._writeLog(data, LOG_LEVELS[3], optionalLabel)
        }

    }

    info(data, optionalLabel){

        if(this.level > 1){
            this._writeLog(data, LOG_LEVELS[2], optionalLabel)
        }
    }

    warn(data, optionalLabel){

        if(this.level > 0){
            this._writeLog(data, LOG_LEVELS[1], optionalLabel)
        }
    }

    warning(data, optionalLabel){
        this.warn(data, optionalLabel)

    }

    error(data, optionalLabel){
            this._writeLog(data, LOG_LEVELS[0], optionalLabel)
    }

    _writeLog(data, level, optionalLabel=""){
        let msg = `${level}${"=="+optionalLabel}==${new Date().toISOString()}==${data}`;
        try{
            fs.appendFileSync(this.pathToLogs, msg);
        }catch(err){
            console.log(`Logging error: ${err}`);
        }
    }

}

module.exports = Logger;
