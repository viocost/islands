const { assert, expect } = require("chai")
const { SessionFactory } = require("../server/lib/Session")
const { EventEmitter } = require("events")


class MockConnector extends EventEmitter{
    constructor(){
        super()
    }
    send(ev, msg){
        console.log(`Mock connector sends ev: ${ev}: ${msg}`);
    }
}


class MockCrypto{
    encrypt(msg){
        console.log(`Mock crypto encrypts message ${msg}`);
        return msg
    }

    decrypt(msg){
        console.log(`Mock crypto decrypts message ${msg}`);
        return msg
    }
}


describe("Session test", ()=>{
    before(()=>{
        this.connectorServer = new MockConnector()
        let cryptor = new MockCrypto()
        this.sessionServer = SessionFactory.makeServerSessionV1(this.connectorServer, cryptor, (nonce)=>{
            return "abc" === cryptor.decrypt(nonce)
        })
    })

    it("should init the session with mock objects", ()=>{
        this.sessionServer.acceptMessage("booo")
        this.sessionServer.acceptMessage({a: 1, b: "asdf"})
        this.sessionServer.acceptMessage("goo")
        this.sessionServer.acceptMessage([1, 2, 3, 4, 5])
    })

    it("should recognize the nonce", ()=>{

        assert(this.sessionServer.recognizes("abc"))
        assert(!this.sessionServer.recognizes("abac"))


    })
})
