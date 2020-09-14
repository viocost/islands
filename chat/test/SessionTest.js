const { assert, expect } = require("chai")
const { SessionFactory } = require("../server/lib/Session")
const { EventEmitter } = require("events")

class MockConnector extends EventEmitter{
    constructor(){
        super()
    }
    send(msg){
        console.log(`Mock connector sends: ${msg}`);
    }
}


class MockCrypto{
    encrypt(msg){
        console.log(`Mock crypto encrypts message ${msg}`);
    }

    decrypt(msg){
        console.log(`Mock crypto decrypts message ${msg}`);
    }
}


describe("Session test", ()=>{

    it("should init the session with mock objects", ()=>{
        let session = SessionFactory.makeRegularSession(new MockConnector(), new MockCrypto())
        session.acceptMessage("booo")

    })
})
