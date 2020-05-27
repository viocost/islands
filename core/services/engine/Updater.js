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
        try{

            console.log(`Running update with ${this.pathToUpdate}`);
            //Making sure update zip exists
            if(!fs.existsSync(this.pathToUpdate)) throw new Error("Update file not found!");

            //emptying our update dir
            console.log("Preparing update directory");
            fs.emptyDirSync(process.env["UPDATE_DIR"]);

            //Extracting contents of the update
            console.log("Extracting update files")
            await extract(this.pathToUpdate, { dir: process.env["UPDATE_DIR"]  })
            console.log("Extraction completed");

            let updateRoot = path.join(process.env["UPDATE_DIR"], "islands")
            let apps = path.join(process.env["UPDATE_DIR"], "islands", "apps")
            let chat = path.join(apps, "chat")
            let engine = path.join(apps, "engine");

            if(fs.existsSync(chat)){
                fs.removeSync(this.updatableComponents.chat)
                fs.mkdirSync(this.updatableComponents.chat)
                fs.copySync(chat, this.updatableComponents.chat)
                console.log("Chat updated");
            }


            if(fs.existsSync(engine)){
                fs.removeSync(this.updatableComponents.engine)

                fs.mkdirSync(this.updatableComponents.engine)
                fs.copySync(engine, this.updatableComponents.engine)
                console.log("Engine updated");
            }

            fs.readdirSync(updateRoot, {withFileTypes: true}).forEach(f=>{
                if (f.isFile()){
                    console.log(`Will copy ${path.join(updateRoot, f.name)}`);
                    fs.copySync(path.join(updateRoot, f.name), path.join(process.env["BASE"], f.name))

                }
            })

            console.log("Update completed.");
        }catch(err){
            console.log(err)
        }finally{
            fs.emptyDirSync(process.env["UPDATE_DIR"]);
        }


    }
}

module.exports = Updater;
