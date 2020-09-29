import { StateMachine } from "../../../../common/AdvStateMachine"

class SessionCrypto{
    constructor({ connectorFactory, secretDecryptor }){
        this.connectorFactory = connectorFactory;
        this.secretDecryptor = secretDecryptor;
        this.sm = this._prepareStateMachine()
        this.connector = this.connectorFactory.make();
        this.connector.on("connect", ()=>{

        })

        this.connector.on("disconnect", ()=>{

        })
    }


    send(msg){
        this.sm.handle.sendMessage(msg)
    }


    _processSendMessage(stateMachine, evName, args){
        this.connector.send(this._wrap(args[0]))
       
    }


    _wrap(msg){
        return msg;
    }

    _prepareStateMachine(){
        return new StateMachine({
            name: "Session Crypto SM",
            stateMap: {
                inactive: {
                    initial: true,
                    transitions: {
                        setActive: {
                            state: "acceptingMessages"
                        }
                    }
                },

                acceptingMessages: {
                    transitions: {
                        setInactive: {
                            state: "inactive"
                        },
                        sendMessage: {
                            actions: this._processSendMessage.bind(this)
                        }
                    }
                }
            }
        })

    }


}
