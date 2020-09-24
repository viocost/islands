const { MessageBus } = require("../common/MessageBus")

class TestObject{
    constructor(name){
        this._name = name;
    }

    get name(){
        return this._name
    }

    set name(name){
        this._name = name
    }
}


let mb = new MessageBus()

let o1 = new TestObject("Object 1")
let o2 = new TestObject("Object 2")
let o3 = new TestObject("Object 3")
let debugObj = new TestObject("DebugObj")


mb.register(o1, (sender, message, data)=>{
    console.log(`Object 1 received ${message} from ${sender.name}`);
    console.dir(data)
})


mb.register(o2, (sender, message, data)=>{
    console.log(`Object 2 received ${message} from ${sender.name}`);
    console.dir(data)
    mb.deliver(o2, "TEST3", {
        a: 1,
        b: 2
    })
}, "TEST1" )


mb.register(o3, (sender, message, data)=>{
    console.log(`Object 3 received ${message} from ${sender.name}`);
    console.dir(data)
}, ["TEST1", "TEST2"])


mb.register(debugObj, (sender, message, data)=>{
    console.log(`Debug Object received ${message} from ${sender.name}`);
    console.dir(data)
})

mb.deliver(o1, "TEST1", "blabla")
mb.deliver(o2, "TEST2", "blabla")


mb.register(o3, (sender, message, data)=>{
    console.log(`Object 3 received ${message} from ${sender.name}`);
    console.dir(data)
})


mb.deliver(o1, "TEST1", "blabla")

mb.unregister(o2)


mb.deliver(o2, "FUCKU", "blabla")
mb.deliver(o1, "Jackass", "blabla")
