import { StateMachine } from "./AdvStateMachine";

export class LoginAgent{
    constructor(){
        this.sm = this.prepareStateMachine()


    }


    prepareStateMachine(){
        return new StateMachine(this, {
            name: "Login Agent SM",
            stateMap: {
                ready: {
                    initial: true

                },

                fetchingVault: {

                },

                initializingTopics: {

                },

                postLogin: {

                },




            }

        }, {
            msgNotExistMode: StateMachine.Warn,
            traceLevel: StateMachine.TraceLevel.DEBUG
        })

    }
}
