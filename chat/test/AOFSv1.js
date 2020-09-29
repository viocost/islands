const mocha = require("mocha")
const { assert, expect } = require("chai")
const { AppendOnlyFileStorageV1 } = require("../server/lib/AppendOnlyFileStorage")
const fs = require("fs")

const testFileName = "testfile"

describe("testing append only file storage V1", ()=>{

    before(()=>{
        if(fs.existsSync(testFileName)){
            fs.unlinkSync(testFileName)
        }

    })

    it("should create new file with byte ordering mark", ()=>{
        const store = new AppendOnlyFileStorageV1(testFileName);

        const buffer = new ArrayBuffer(4);
        const view8 = new Uint8Array(buffer);
        const fd = fs.openSync(testFileName, "r")
        fs.readSync(fd, view8, 0, 4, null)
        const view = new Uint16Array(buffer);
        assert(view[0] === 0x4241 && view[1] === 0x4443)


    })

    after(()=>{

        if(fs.existsSync(testFileName)){
            fs.unlinkSync(testFileName)
        }
    })


})
