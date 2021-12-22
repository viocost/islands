import { StateMachine } from "../../../../common/AdvStateMachine"
import { TopicEvents } from "./Topic";

const BASE_TITLE = "Islands"

export class TabNotificationAgent{
    constructor(bus, baseTitle = BASE_TITLE){
        this._sm = this.prepareStateMachine()
        this.baseTitle = baseTitle;
        this.counter = 0;
        window.title = this.baseTitle;
        window.addEventListener("blur", this._sm.handle.blur.bind(this))
        window.addEventListener("focus", this._sm.handle.focus.bind(this))
        bus.on(TopicEvents.NEW_CHAT_MESSAGE, this._sm.handle.messageReceived.bind(this))
    }


    //increments counter and updates page title
    _updateTitle(){
        this.counter++
        window.title = `(${this.counter}) ${this.baseTitle}`

    }

    _reset(){
        this.counter = 0;
        window.title = this.baseTitle;
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
