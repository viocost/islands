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


mb.on(null, ({sender, message, data}) => {
    console.log(`Object 1 received ${message} from ${sender}`);
    console.dir(data)
}, o1)


mb.on("TEST1", ( sender, message, data ) => {
    console.log(`Object 2 received ${message} from ${sender}`);
    console.dir(data)
    mb.emit("TEST3", {
        a: 1,
        b: 2
    })
}, o2)


mb.on("TEST1", (sender, message, data) => {
    console.log(`Object 3 received ${message} from ${sender}`);
    console.dir(data)
}, "TEST1")


mb.on(null, (sender, message, data) => {
    console.log(`Debug Object received ${message} from ${sender}`);
    console.dir(data)
}, debugObj)

mb.emit("TEST1", "blabla", o1)
mb.emit("TEST2", "blabla", o2)


mb.on(null, (data) => {
    console.log(`Object 3 received ${message} from ${sender}`);
    console.dir(data)
}, o3)


mb.emit("XXXXXXXXXXXXXX", "blabla", o1)

mb.off({subscriber: o2})


mb.emit("fiz", "blabla", o2)
mb.emit("buzz", "blabla", o1)
