import { StateMachine } from "adv-state";
class BaseView{

}

export class MainView extends BaseView{
    constructor(){
        super()
        this.sm = this._prepareStateMachine()
    }

    _prepareStateMachine(){
        return new StateMachine(this, {
            name: "Chat Main View SM", 
            stateMap: {
                blank: {
                    initial: true,
                    transitions: {
                        loading: {
                            state: "loading"
                        }
                    }
                },

                loading: {
                    transitions: {
                        login: {
                            state: "login"
                        },
                       
                        registration: {
                            state: "registration"
                        }

                    }
                },

                login: {
                    transitions: {
                        active: {
                            state: "active"
                        },
                    }

                },

                registration: {
                    transitions: {
                        login: {
                            state: "login"
                        }
                    }
                },

                active: {
                    transitions: {
                        logout: {
                            state: "logout"
                        }
                    }
                },

                logout: {
                    final: true
                }
            }
        })
        
    }
}
