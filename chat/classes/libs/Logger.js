const { createLogger, format, transports,  } = require('winston');
const { combine, timestamp, label, json } = format;
const fs = require("fs-extra");
const Err = require("../libs/IError.js");




class Logger{

    constructor(){
        throw "This class cannot be instantiated";
    }
    static _getLogger(){
        if(!Logger._logger ){
            throw "Logger has not been initialized"
        }
        return Logger._logger;
    }

    static setLevel(level = Err.required()){
        if(!Logger._levels.includes(level)){
            throw "Logger set level error: invalid level";
        }
        Logger._logger.level = level;
    }

    static switchLogger(on = true){
        Logger._status = on;
    }

    static initLogger  (path = Err.required(), level){
        let fullPath = path[-1] === "/" ? path + "logs/" : path + "/logs/";
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        if(!fs.existsSync(fullPath)){
            fs.mkdirSync(fullPath);
        }

        let instance = createLogger({
            level: level ? level : "info",
            format: combine(
                timestamp(),
                json(),
            ),

            transports: [
                new transports.Console(),
                new transports.File({ filename: fullPath + 'error.log', maxsize: 5242880, level: 'error' }),
                new transports.File({ filename: fullPath + 'combined.log', maxsize: 5242880})
            ]
        });

        Logger._path = fullPath;
        Logger._logger = instance;
    };

    static async fetchLogs(errorOnly = false){
        let path = errorOnly ? Logger._path + "error.log" :
            Logger._path + "combined.log";
        if(await fs.existsSync(path)){
            return await fs.readFile(path, 'utf8');
        } else{
            return undefined;
        }
    }

    static async clearLogs(){
        let pathErr =  Logger._path + "error.log";
        let pathCombined = Logger._path + "combined.log";
        if(await fs.exists(pathCombined)){
            await fs.writeFile(pathCombined, "")
        }
        if(await fs.exists(pathErr)){
            await fs.writeFile(pathErr, "")
        }
    }

    static info(msg = Err.required(), additionalData){
        Logger._log("info", msg, additionalData)
    }

    static silly(msg = Err.required(), additionalData){
        Logger._log("silly", msg, additionalData)
    }

    static debug(msg = Err.required(), additionalData){
        Logger._log("debug", msg, additionalData)
    }

    static warn(msg = Err.required(), additionalData){
        Logger._log("warn", msg, additionalData)
    }

    static error(msg = Err.required(), additionalData){
        Logger._log("error", msg, additionalData)
    }

    static verbose(msg = Err.required(), additionalData){
        Logger._log("verbose", msg, additionalData)
    }

    static _log(level = Err.required(), msg = Err.required(), additionalData){
        if(!Logger.isEnabled()){
            return;
        }
        let logger = Logger._getLogger();
        let logMsg = {level: level, message: msg};
        if(additionalData){
            for(let key of Object.keys(additionalData)){
                logMsg[key] = additionalData[key];
            }
        }
        logger.log(logMsg);
    }

    static isEnabled(){
        return Logger._status
    }

    static getLoggerInfo(){
        return  {
            enabled: (Logger._logger && Logger._status),
            level: (Logger._logger)? Logger._logger.level: null,
        };
    }
}

Logger._path = undefined;
Logger._status = true;
Logger._logger = undefined;
Logger._level = undefined;
Logger. _levels = ["silly", "debug", "verbose", "info",  "warn", "error"];




module.exports = Logger;
