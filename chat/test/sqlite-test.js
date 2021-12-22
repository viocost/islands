const mocha = require("mocha")
const { assert, expect } = require("chai")
const fs = require('fs-extra')
const path = require("path")
let  { StorageFileSystem }  = require("../server/Storage")
let  StorageSQLite;
const { log } = require("winston")

const testFilename = "./storage_sqlite";


(isSqliteLinked() ? describe : describe.skip)("Sqlite storage test", ()=>{

    before(async ()=>{

        StorageSQLite = require("../server/StorageSQLite").StorageSQLite

        if(fs.existsSync("./fs")){
            fs.removeSync("./fs")
        }
        await fs.mkdir("./fs")
    this.storage = new StorageSQLite(testFilename, "test.sqlite");
        this.fstorage = new StorageFileSystem("./fs", "444");
        this.iterations = 20
    })


    it("Should write simple key, then get the same blob and compare it with whats was written", ()=>{
        this.storage.write("test_key", "test_blob")
        this.fstorage.write("test_key", "test_blob")
        assert(this.storage.getBlob("test_key") === "test_blob")
    })


    it("Should write simple key", ()=>{
        this.storage.write("test_key", "test_blob")
        this.fstorage.write("test_key", "test_blob")
        assert(this.storage.getBlob("test_key") === "test_blob")
    })

    it("Tests append function and length", ()=>{

        for (let i=0; i<this.iterations; ++i){
            this.storage.append("appended", `blob`)
            this.fstorage.append("appended", `blob`)
        }

        let blob = this.storage.getBlob("appended")
        let fblob = this.fstorage.getBlob("appended")
        let blobExpected = "blob".repeat(this.iterations)
        //console.log(`Blob:    ${blob}\nFBlob:  ${fblob}\nExpected: ${blobExpected}`);
        assert(blob === blobExpected)
        assert(fblob === blobExpected)

    })

    it("Tests length function on atomic blobs", ()=>{
        let l = this.storage.getLength("test_key")
        let fl = this.fstorage.getLength("test_key")
        assert( l === "test_blob".length)
        assert( l === fl)
    })

    it("Tests length function on appended and atomic blobs", ()=>{
        assert(this.storage.getLength("appended") === this.iterations*4)
        assert(this.fstorage.getLength("appended") === this.iterations*4)
    })

    it("Tests getting partial blob", ()=>{
        let length = 1;
        let offset = 11
        let blob = this.storage.getPartialBlob("appended", offset, length)
        let fblob = this.fstorage.getPartialBlob("appended", offset, length)
        let reference = "blob".repeat(this.iterations).substring(offset, offset+length)
        //console.log(`ref: ${reference}`);
        //console.log(`res: ${blob}`);
        //console.log(`res: ${fblob}`);

        assert(blob === reference)
        assert(fblob === reference)
    })


    it("Tests getting partial blob", ()=>{
        let length = 4;
        let offset = 1
        let blob = this.storage.getPartialBlob("appended", offset, length)
        let fblob = this.fstorage.getPartialBlob("appended", offset, length)
        let reference = "blob".repeat(this.iterations).substring(offset, offset+length)
        //console.log(`ref: ${reference}`);
        //console.log(`res: ${blob}`);
        //console.log(`res: ${fblob}`);

        assert(blob == reference)
        assert(fblob == reference)
    })
    it("Tests getting partial blob", ()=>{
        let length = 5;
        let offset = 1
        let blob = this.storage.getPartialBlob("appended", offset, length)
        let fblob = this.fstorage.getPartialBlob("appended", offset, length)
        let reference = "blob".repeat(this.iterations).substring(offset, offset+length)
        //console.log(`ref: ${reference}`);
        //console.log(`res: ${blob}`);
        //console.log(`res: ${fblob}`);

        assert(blob === reference)
        assert(fblob === reference)
    })

    it("Tests getting partial blob", ()=>{
        let length = 4;
        let offset = 1
        let blob = this.storage.getPartialBlob("appended", offset, length)
        let fblob = this.fstorage.getPartialBlob("appended", offset, length)
        let reference = "blob".repeat(this.iterations).substring(offset, offset+length)
        //console.log(`ref: ${reference}`);
        //console.log(`res: ${blob}`);
        //console.log(`res: ${fblob}`);

        assert(blob === reference)
        assert(fblob === reference)
    })

    after(()=>{
        if(fs.existsSync(testFilename)){
            fs.removeSync(testFilename)
        }
        fs.removeSync("./fs")

    })

})


function runTest(){


    //console.log("done. Writing");

    //console.log("written 1");


    //console.log("written 2. Getting...");
    //console.log(storage.getBlob("test_key"));
    //console.log(storage.getBlob("test_key1"));
    //console.log(storage.getBlob("test_key3"));



    //console.log(`\n\nlength appended: ${storage.getLength('test_key1')}`);
    //console.log(`\n\nlength single: ${storage.getLength('test_key')}`);

    let keys = storage.allKeys()
    //console.log(`\n\nKeys:`);
    console.dir(keys)


    //console.log(`\n\nKey test_key present: ${storage.has("test_key")}`);
    //console.log(`Key non_existent_key present: ${storage.has("non_existent_key")}`);

    let data = storage.getPartialBlob("test_key1", 1, 10)
    //console.log("Partial data:");
    console.dir(data)


    let emptyString = storage.getPartialBlob("test_key1", 1014, 10)
    //console.log(`${emptyString}`);
    ////console.log(`\n\nExisting partial blob: ${storage.getPartialBlob("test_key1", 20, 7)}`);
    //
    ////console.log(`\n\nNon-existng partial blob: ${storage.getPartialBlob("test_key1", 1378, 5)}`);
}


function isSqliteLinked(){
    let sqliteGlobal =  path.join(__dirname, "../../bin/core/linux/lib/node_modules/better-sqlite3")
    let sqliteLink =  path.join(__dirname, "../node_modules/better-sqlite3")
    console.log(sqliteGlobal);
    console.log(sqliteLink);
    if(!fs.existsSync(sqliteLink)){
        if(!fs.existsSync(sqliteGlobal)){
            return false
        } else {
            console.log("Making symlink to sqlite3");
            fs.symlinkSync(sqliteGlobal, sqliteLink)
        }

    }
    return true
}
