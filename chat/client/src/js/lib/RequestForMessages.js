import { UXMessage } from "../ui/Common"
import { TopicEvents } from "./Topic"

/**
 * This strategy is for getting n messages from the end
 *
 */
class MessageGetterLastStrategy{
    constructor(topic, howMany){
        this.topic = topic;
        this.howMany = howMany;
    }

    get(){
        console.log("Getting messages");
        return this.topic.getLastMessages(this.howMany) || []
    }

}


/**
 * This strategy is for getting n messages before the message with
 * lastId
 */
class MessageGetterBeforeLastIDStrategy{
    constructor(topic, lastId, howMany){
        this.topic = topic;
        this.howMany = howMany;
        this.lastId = lastId;
    }

    get(){
         return this.topic.getLastMessages(this.howMany, this.lastId) || [];
    }
}

/**
 * Determines whether request is fulfilled
 */
class FulfilledCondition{
    constructor(topic, howMany){
        this.topic = topic;
        this.howMany = howMany;
    }

    isFulfilled(){
        return this.topic.areAllMessagesLoaded() || this.howMany === 0;
    }
}


/**
 * outputs messages to uxBus
 */
export class BusOutputWriter{
    constructor(bus){
        this.bus = bus;
    }

    output(message){
        console.log("Writing messages to UXBUS");
        this.bus.emit(UXMessage.LAST_MESSAGES_RESPONSE, message)
    }
}


export class RequestForMessages{
    constructor(topic, howMany, outWriterFactory, uxBus, lastId){
        this.topic = topic;
        this.howMany = howMany;
        this.outWriterFactory = outWriterFactory;
        this.lastId = lastId;
        this.isFulfilled = false;
        uxBus.on(TopicEvents.MESSAGES_LOADED, this.run.bind(this), this)
    }


    //This function implements a single iteration of request for messages algorithm
    //It is subscribed to the bus messages and called on each MESSAGES_LOADED events
    //until the request is fulfilled.
    run(){
        console.log("Messages loaded received. Processing");
        //Determining right strategy for getting messages from topic
        let getter = this.lastId ? new MessageGetterBeforeLastIDStrategy(this.topic, this.lastId, this.howMany):
            new MessageGetterLastStrategy(this.topic, this.howMany)

        //Getting messages
        let messages = getter.get()

        //updating remaining messages count
        this.howMany -= messages.length;

        //if there are any messages at all
        if(messages.length > 0){
            //Giving them to writer
            let writer = this.outWriterFactory.make()

            let response = {
                pkfp: this.topic.pkfp,
                messages: messages,
                before: this.lastId,
                topic: this.topic
            }

            writer.output(response)

            //Updating last written message id
            this.lastId = messages[messages.length-1].header.id;
        }

        //Checking whether request is fulfilled
        if(new FulfilledCondition(this.topic, this.howMany).isFulfilled()){
            //If request fulfilled - unsubscribing from bus and terminating
            console.log("Request fulfilled!");
            uxBus.off(this);
        }
    }
}

class BusOutWriterFactory{
    constructor(bus){
        this.bus = bus;
    }

    make(){
        return new BusOutputWriter(this.bus)
    }
}

export class OutputWriterAbstractFactory{
    static makeBusOutputWriterFactory(bus){
        return new BusOutWriterFactory(bus)
    }

}

export class RequestForMessagesFactory{
    static make(topic, howMany, uxBus, lastId){
        let outFactory = OutputWriterAbstractFactory.makeBusOutputWriterFactory(uxBus)
        return new RequestForMessages(topic, howMany, outFactory, uxBus, lastId)
    }
}
