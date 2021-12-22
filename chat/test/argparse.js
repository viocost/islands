const mocha = require("mocha")
const { assert, expect } = require("chai")
const { parseArguments } = require('../server/ArgParser')

describe("Argparse test", ()=>{
    before(()=>{

    })

    it("Should parse an array of arguments", ()=>{
        let array = ["-p", "4000", "--debug", "-otp", "hello"]
        let res = parseArguments(array)
        assert(res.port == 4000)
        assert(res.debug == true)
        assert(res.otp == "hello")
    })

    after(()=>{

    })


})
