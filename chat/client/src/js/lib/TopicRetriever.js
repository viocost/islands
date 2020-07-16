import { StateMachine } from "../../../../common/AdvStateMachine";
import { fetchJSON } from "./FetchJSON";
import { WildEmitter } from "./WildEmitter"


export class TopicRetriever {
    constructor() {
        WildEmitter.mixin(this)
        this.stateMachine = this.prepareStateMachine();
        this.toipcs;
        this.error;
    }

    prepareStateMachine() {
        return new StateMachine(this, {
            name: "Topic Retriever SM",
            stateMap: {
                ready: {
                    initial: true,
                    transitions: {
                        fetchTopics: { actions: this.fetchTopics, state: 'fetchingTopics' }
                    }
                },

                error: {
                    transitions: {
                        fetchTopics: { actions: this.fetchTopics, state: 'fetchingTopics' }
                    }
                },

                fetchingTopics: {
                    transitions: {
                        JSONReceived: { actions: this.processTopics, state: 'finished' },
                        fetchJSONError: { actions: this.processError, state: 'error' }

                    }
                },

                finished: {
                    final: true
                }

            }

        }, { msgNotExistMode: StateMachine.Warn, traceLevel: StateMachine.TraceLevel.DEBUG })
    }


    fetchTopics() {
        fetchJSON("/topics", this.stateMachine)
    }

    processError(err) {
        this.error = err;
        this.emit("error", err);
    }

    processTopics(stateMachine, eventName, args) {
        let data = args[0]
        this.topics = data;
        this.emit("finished", this.topics);
    }

    run() {
        this.stateMachine.handle.fetchTopics();
    }
}
