import { StateMachine } from "./AdvStateMachine";
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
                fetchTopics: { after: this.fetchTopicsLambda(), state: 'fetchingTopics' }
            },

            error: {
                fetchTopics: { after: this.fetchTopicsLambda(), state: 'fetchingTopics' }
            },

            fetchingTopics: {
                JSONReceived: { after: this.processTopicsLambda(), state: 'finished' },
                fetchJSONError: { after: this.processErrorLambda(),  state: 'error' }
            },

            finished: { /*Once finished - nothing more to do*/ }

        }, 'ready', StateMachine.Warn, true, "TOPIC RETRIEVER SM")
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
