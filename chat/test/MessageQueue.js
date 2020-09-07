const mocha = require("mocha")
const { assert, expect } = require("chai")
const { MessageQueue } = require("../common/MessageQueue");

describe("Message queue test", ()=>{
    it("should test message queue", ()=>{
        let mq = new MessageQueue()
        mq.enqueue("hello1")
        mq.enqueue("hello2")
        mq.enqueue("hello3")
        mq.enqueue("hello4")
        mq.enqueue("hello5")
        mq.enqueue("hello6")
        mq.enqueue("hello7")
        console.log(`Last seq: ${ mq.lastSeq}`);
        let m;
        while(m = mq.dequeue()){
            console.log(` Dequeued: ${m.seq} ${m.message}`);
        }
        assert(mq.lastSeq === 7)

        let unseen = mq.sync(3);

        assert(unseen.length === 4)
        assert(mq._sent.length === 4)
        assert(mq._sent[0].seq === 4)

        unseen = mq.sync(3)
        assert(unseen === undefined)

        unseen = mq.sync(5)
        assert(unseen.length === 2)
        assert(unseen[0].seq === 6)

        mq.enqueue("hello8")
        mq.enqueue("hello9")
        mq.enqueue("hello10")

        let all = mq.dequeueAll()
        assert(all.length = 3)
        console.log(mq.id);
        console.log("Test completed");

    })


})
