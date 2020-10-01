import { WildEmitter } from "./WildEmitter";
import { iCrypto } from "../../../../common/iCrypto";
import { StateMachine } from "../../../../common/AdvStateMachine";
import { createClientIslandEnvelope, createAuthMessage } from "../../../../common/Message"


export class Session{

    constructor({ messageSink }){
        this._sendPendingQueue = [];
        this._sentQueue = [];
        this._messageSink = messageSink;
        this._sendCount = 0;

    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS

    acceptMessage(msg){
        this._messageQueue.push({ seq: ++this._sendCount, msg: msg})
    }

    _processQueue(){
        let tempQueue = this._sendPendingQueue;
        this._sendPendingQueue = [];
        while (tempQueue.length > 0){
            let msg = this._processMessage(tempQueue.splice(0, 1)[0])
            this._messageSink.send(msg);
            this._sentQueue.push(msg);
        }
    }

    _processMessage(msg){
        return msg;
    }



    _prepareSessionStateMachine() {
        return new StateMachine(this, {
            name: "Session State Machine",
            stateMap: {

                noKey: {
                    initial: true,
                    //No key is present
                    transitions: {
                        validateKey: {
                            state: "awatingKeyValidation",
                            actions: this._sendKeyValidationRequest.bind(this)
                        }
                    }
                },

                // State when we have session key
                // But cannot be sure whether it is valid or not
                // Specifically we need to receive a confirmation from the server
                // That the key is valid
                awatingKeyValidation: {
                    transitions: {
                        keyValidated: {
                            state: "sessionEstablished"
                        },
                        keyInvalidated: {
                            state: "noKey"
                        }
                    }
                },

                sessionEstablished: {
                    entry: this._processSendQueue.bind(this),
                    transitions: {
                        processSendQueue: {
                            actions: this._processSendQueue.bind(this)
                        },

                        processIncomingMessage: {
                            actions: this._processIncomingMessage.bind(this)
                        },

                        keyInvalidated: {
                            state: "noKey"
                        }
                    }
                }
            }

        })
    }
}
