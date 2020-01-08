const path = require("path");
const fs = require("fs");
const QBT = require("qbittorrent-api");
const parseMagnet = require("parse-magnet-uri")
const EventEmitter = require("events").EventEmitter

class Bootstrapper extends EventEmitter{
    constructor(){
        super();
        this.qbt = QBT.connect("http://localhost:8080", "admin", "adminadmin")
    }

    checkQbtConnection(){
        return new Promise((resolve, reject)=>{
            this.qbt.version((err, data)=>{
                if (err){
                    console.log(`QBT connection error: ${err}`);
                    reject(err)
                }else{
                    console.log("QBT connection successful");
                    resolve()
                }
            })
        })
    }


    bootstrap(manifestMagnet){

    }

}

module.exports = Bootstrapper
