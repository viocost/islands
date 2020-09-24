const { MessageBus } = require("../common/MessageBus")

class TestObject {
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name
    }

    set name(name) {
        this._name = name
    }
}


let mb = new MessageBus()

let o1 = new TestObject("Object 1")
let o2 = new TestObject("Object 2")
let o3 = new TestObject("Object 3")
let debugObj = new TestObject("DebugObj")


mb.register((sender, message, data) => {
    console.log(`Object 1 received ${message} from ${sender}`);
    console.dir(data)
}, null, o1)


mb.register((sender, message, data) => {
    console.log(`Object 2 received ${message} from ${sender}`);
    console.dir(data)
    mb.deliver("TEST3", {
        a: 1,
        b: 2
    })
}, "TEST1", o2)


mb.register((sender, message, data) => {
    console.log(`Object 3 received ${message} from ${sender}`);
    console.dir(data)
}, "TEST1", o3)


mb.register((sender, message, data) => {
    console.log(`Debug Object received ${message} from ${sender}`);
    console.dir(data)
}, null, debugObj)

mb.deliver("TEST1", "blabla", o1)
mb.deliver("TEST2", "blabla", o2)


mb.register((sender, message, data) => {
    console.log(`Object 3 received ${message} from ${sender}`);
    console.dir(data)
}, o3)


mb.deliver("TEST1", "blabla", o1)

mb.unregisterByRecipient(o2)


mb.deliver("FUCKU", "blabla", o2)
mb.deliver("Jackass", "blabla", o1)
