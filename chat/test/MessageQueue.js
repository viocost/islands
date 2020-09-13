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

        let count = 0;
        console.log("Dequeueing 1-7");
        while(m = mq.dequeue()){
            assert(m.seq === ++count)
            console.log(` Dequeued: ${m.seq} ${m.message}`);
        }
        assert(mq.lastSeq === 7)

        mq.sync(3);

        assert(mq._queue.length === 4)
        assert(mq._dequeued.length === 0)

        console.log("Dequeueing 4-10");
        mq.enqueue("hello8")
        mq.enqueue("hello9")
        mq.enqueue("hello10")


        count = 3
        while(m = mq.dequeue()){

            assert(m.seq === ++count)
            console.log(` Dequeued: ${m.seq} ${m.message}`);
        }
        mq.sync(10);
        assert(mq._queue.length ===0)
        assert(mq._dequeued.length ===0)
        console.log("Test completed");

    })


})
