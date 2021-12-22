const mocha = require("mocha")
const { assert, expect } = require("chai")
const { iCrypto } = require("../common/iCrypto")


describe("Testing icrypto hash functions", ()=>{
    this.controlString = "The quick brown fox jumps over the lazy dog"
    this.controlSha256 = "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"
    this.buffer = new ArrayBuffer(16);
    this.array = new Uint8Array(this.buffer)

    for (let i=0; i<16; i++){this.array[i] = i}

    this.binHash = "be45cb2605bf36bebde684841a28f0fd43c69850a3dce5fedba69928ee3a8991"

    it("Should take hash using atomic function", ()=>{

        let ic = new iCrypto()
        ic.addBlob("text", this.controlString)
          .hash("text", "hres", "sha256")

        console.log(ic.get("hres"));
        assert(this.controlSha256 === ic.get('hres'))
    })

    it("Should take a simple sha256 from the string", ()=>{
        let ic = new iCrypto()
        ic.createHash("h", "sha256")
          .updateHash("h", this.controlString)
          .digestHash("h", "res", true)
        console.log(ic.get("res"));
        assert(this.controlSha256 === ic.get('res'))
    })

    it("Should update hash char by char", ()=>{
        let ic = new iCrypto()
        ic.createHash("h", "sha256")
        this.controlString.split("").forEach(letter=>{
            ic.updateHash("h", letter)
        })
        ic.digestHash("h", "res", true)
        console.log(ic.get("res"));

        assert(this.controlSha256 === ic.get('res'))
    })


})
