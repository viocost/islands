import { StateMachine } from "./StateMachine";
import { fetchJSON } from "./FetchJSON";
import { WildEmitter } from "./WildEmitter"


export class TopicRetriever{
    constructor(){
        WildEmitter.mixin(this)
        this.stateMachine = this.prepareStateMachine();
        this.toipcs;
        this.error;
    }

    prepareStateMachine(){
        return new StateMachine({
            ready: {
                fetchTopics: [this.fetchTopicsLambda(), 'fetchingTopics']
            },

            error: {
                fetchTopics: [this.fetchTopicsLambda(), 'fetchingTopics']
            },

            fetchingTopics: {
                JSONReceived: [ this.processTopicsLambda(), 'finished' ],
                fetchJSONError: [ this.processErrorLambda(),  'error']
            },

            finished: { /*Once finished - nothing more to do*/ }

        }, 'ready', StateMachine.Warn, true)
    }


    fetchTopicsLambda(){
        return ()=>{
            fetchJSON("/topics", this.stateMachine)
        }
    }

    processErrorLambda(){
        return (err)=>{
            this.error = err;
            this.emit("error", err);
        }
    }

    processTopicsLambda(){
        return (data)=>{
            this.topics = data;
            this.emit("finished", this.topics);
        }
    }

    fetchTopics(){
        this.stateMachine.handle.fetchTopics();
    }
}
