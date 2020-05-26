const fs = require("fs-extra");
const extract = require("extract-zip");
const path = require("path")


class Updater{
    constructor(pathToUpdate){
        this.pathToUpdate = pathToUpdate;
        this.updatableComponents = {
            "chat": path.join(process.env["APPS"], "chat"),
            "engine": path.join(process.env["APPS"], "engine"),
        }


    }

    async runUpdate(){
        console.log(`Running update with ${this.pathToUpdate}`);
        //Making sure update zip exists
        if(!fs.existsSync(this.pathToUpdate)) throw new Error("Update file not found!");

        //emptying our update dir
        console.log("Preparing update directory");
        fs.emptyDir(process.env["UPDATE_DIR"]);

        //Extracting contents of the update
        console.log("Extracting update files")
        await extract(this.pathToUpdate, { dir: process.env["UPDATE_DIR"]  })

        let files = fs.readdirSync(process.env["UPDATE_DIR"]);

        console.log("Files extracted");
        files.forEach(f => console.log(f));


    }
}

module.exports = Updater;
