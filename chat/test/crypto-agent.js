const { SymCryptoAgentFactory, AsymPublicCrypoAgentFactory, AsymFullCryptoAgentFactory } = require("../common/CryptoAgent")
const { assert, expect } = require("chai")

const AsymPublic = AsymFullCryptoAgentFactory
const AsymFull = AsymFullCryptoAgentFactory

describe("It should test crypto agent API", ()=>{
    this.testString = "Bla bla bla bla dub dub dub"

    it("Should create regular agent", ()=>{
        let agent = AsymFull.make()
        let cipher = agent.encrypt(this.testString)
        let raw = agent.decrypt(cipher)
        assert (raw === this.testString)
    })
})
