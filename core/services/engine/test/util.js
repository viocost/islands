const util = require("../util")
const { assert } = require("chai")
const fs = require("fs")

describe("tests util functions", ()=>{

    before(()=>{
        if(!fs.existsSync("toDelete")){
            fs.mkdirSync("toDelete")
            fs.mkdirSync("toDelete/toDelete2")
            fs.mkdirSync("toDelete/toDelete2/toDelete3")
            fs.writeFileSync("toDelete/junk.txt", "hsjdkfhjaskfshafl")
            fs.writeFileSync("toDelete/toDelete2/junk.txt", "hsjdkfhjaskfshafl")
        }
    })

    it("should copy directory", ()=>{
        if(fs.existsSync("dest")){
            util.removeItem("dest")
        }

        assert(!fs.existsSync("dest"))

        fs.mkdirSync("dest")

        util.copy("./toDelete", "./dest")

        assert(fs.existsSync("./dest/toDelete"))
        assert(fs.existsSync("./dest/toDelete/toDelete2"))
        assert(fs.existsSync("./dest/toDelete/toDelete2/junk.txt"))

        util.removeItem("dest");

        assert(!fs.existsSync("dest"))
    })

    it("should delete directory", ()=>{
        assert(fs.existsSync("toDelete"))
        assert(fs.existsSync("toDelete/toDelete2"))
        assert(fs.existsSync("toDelete/junk.txt"))
        util.removeItem("toDelete")
        assert(!fs.existsSync("toDelete"))
    })

    it("should delete file", ()=>{
        fs.writeFileSync("./toDelete", "hsjdkfhjaskfshafl")
        assert(fs.existsSync("./toDelete"))
        util.removeItem("./toDelete")
        assert(!fs.existsSync("./toDelete"))
    })


    it("should delete symbolic link", ()=>{
        fs.writeFileSync("./toDelete", "hsjdkfhjaskfshafl")
        fs.symlinkSync("./toDelete", "./toDeleteLink")
        assert(fs.existsSync("./toDelete"))
        util.removeItem("./toDeleteLink")
        assert(!fs.existsSync("./toDeleteLink"))
        util.removeItem("./toDelete")
        util.removeItem("./toDelete")
    })


    it("should delete symbolic link to a directory but not remove the directory itself", ()=>{
        makeDummyDirectory()
        fs.symlinkSync("./toDelete", "./toDeleteLink")
        util.removeItem("./toDeleteLink")
        assert(fs.existsSync("./toDelete"))
        assert(fs.existsSync("./toDelete/toDelete2"))
        assert(fs.existsSync("./toDelete/junk.txt"))
        assert(!fs.existsSync("./toDeleteLink"))
        util.removeItem("./toDelete")
        assert(!fs.existsSync("./toDelete"))
    })
})

function makeDummyDirectory(){
        if(!fs.existsSync("toDelete")){
            fs.mkdirSync("toDelete")
            fs.mkdirSync("toDelete/toDelete2")
            fs.mkdirSync("toDelete/toDelete2/toDelete3")
            fs.writeFileSync("toDelete/junk.txt", "hsjdkfhjaskfshafl")
            fs.writeFileSync("toDelete/toDelete2/junk.txt", "hsjdkfhjaskfshafl")
        }
}
