import { StateMachine } from "../../../../common/AdvStateMachine"
import { TopicEvents } from "./Topic";

const BASE_TITLE = "Islands"

export class TabAgent{
    constructor(bus, baseTitle = BASE_TITLE){
        console.log("INITIALIZING TAB AGENT");
        this._sm = this.prepareStateMachine()
        this.baseTitle = baseTitle;
        this.counter = 0;
        document.title = this.baseTitle;
        document.addEventListener("visibilitychange", this.visibilityChange.bind(this))
        bus.on(TopicEvents.NEW_CHAT_MESSAGE, this._sm.handle.messageReceived.bind(this))
        this.visibilityChange()

    }

    visibilityChange(){
        if(document.visibilityState === 'visible'){
            this._sm.handle.focus()
        } else {
            this._sm.handle.blur()
        }
    }

    //increments counter and updates page title
    _updateTitle(){

        console.log("Incrementing");
        this.counter++
        document.title = `(${this.counter}) ${this.baseTitle}`

    }

    _reset(){
        console.log("Resetting title");
        this.counter = 0;
        document.title = this.baseTitle;
    }

    prepareStateMachine(){
        return new StateMachine(this, {
            name: "Tab notification SM",
            stateMap: {
                inFocus: {
                    initial: true,
                    transitions: {
                        blur: {
                            state: "outOfFocus"
                        }
                    }
                },

                outOfFocus: {
                    transitions: {

                        messageReceived: {
                            actions: this._updateTitle.bind(this)

                        },

                        focus: {
                            actions: this._reset.bind(this),
                            state: "inFocus"
                        }

                    }
                }

            }


        })

    }


}
