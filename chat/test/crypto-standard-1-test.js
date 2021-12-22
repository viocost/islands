const Crypto = require("../common/CryptoStandardV1")
const { assert, expect } = require("chai")

describe("This is test for Islands crypto standard V1", ()=>{
    let testString = "Uronili mishku na pol i porvali mishke lapu"
    let testStringHash = "10f70b2f4d4b81316b616fd60d90e76608ec329264eb8bbf4193afdc18efb229"

    it("should create asym keypair", ()=>{
        let kp = Crypto.createAsymKey()
        console.log(kp.privateKey);
        assert(kp.publicKey && kp.privateKey)
        this.kp = kp
    })

    it("should encrypt a string with public key", ()=>{

        let cipher = Crypto.publicKeyEncrypt(testString, this.kp.publicKey)
        console.log(cipher);
        this.cipher = cipher
        assert(cipher.substring(0, 3) === "!01")

    })

    it("should decrypt the cipher using private key", ()=>{

        let dec = Crypto.privateKeyDecrypt(this.cipher, this.kp.privateKey)
        assert(dec === testString)
    })

    it("should sign test string", ()=>{
        this.sign = Crypto.sign(testString, this.kp.privateKey)
        assert(this.sign)
    })

    it("should verify test string", ()=>{
        assert(Crypto.verify(testString, this.kp.publicKey, this.sign))

    })

    it("should throw an exception for giving unknown cipher", ()=>{
        expect(()=>Crypto.privateKeyDecrypt(this.cipher.substr(3))).to.throw(Error)
    })


    it("Should not decrypt corrupted string", ()=>{
        expect(()=>Crypto.privateKeyDecrypt(this.cipher.substring(0, 33))).to.throw(Error)
    })


    it("Should encrypt a string using symkey", ()=>{
        this.sym = Crypto.createSymKey()
        this.symCip = Crypto.symKeyEncrypt(testString, this.sym)
        assert(this.symCip.substring(0, 3) === "!01")
    })

    it("Should decrypt sym encrypted cipher", ()=>{
        assert(Crypto.symKeyDecrypt(this.symCip, this.sym) === testString)
    })


    it("Should take a hash of a given string", ()=>{
        assert(Crypto.hash(testString) === testStringHash)

    })


})
