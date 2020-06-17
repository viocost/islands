
/**
 * This is implementation of state machine.
 *
 * Constructor accepts object such as:
 * {
 *    start: lambdaStart(){},
 *    <state1>: {
 *        lambda1: ()={...},
 *        lambda2: ()={...},
 *        lambda3: ()={...},
 *
      },

 *    <state2>: {
 *        lambda4: ()={...},
 *        lambda2: ()={...},
 *        lambda5: ()={...},
 *
      }
      ...
   }

   to send message to state machine simply smInstance.handle.msg where msg is some lambda in current state
   If message is not found it is ignored
 */
export class StateMachine {
    static Discard () { return ()=> undefined } ;
    static Warn(prop) { return ()=> console.warn(`Property ${prop} does not exist in current state`) };
    static Die   (prop) { return ()=>{ throw new PropertyNotExist(prop)  }; }

    constructor(stateMap={}, startStateName='start',  msgNotExistMode=StateMachine.Discard, trace=false) {
        // we need to expose the state object based on a variable

        if(!stateMap.hasOwnProperty(startStateName)) {
            stateMap[startStateName] = {};
        }

        this.trace = trace;
        this.msgNotExistMode = msgNotExistMode;
        this.stateMap = new Proxy(stateMap, {
            get(target, prop){
                if(!(prop in target)) throw new StateNotExist(prop)
                return target[prop];
            }

        });


        this.state = startStateName;

        this.handle = new Proxy(this, {
            get(target, prop) {

                if(prop in target.stateMap[target.state])
                    return (onArgs, afterArgs) => {
                        if(target.trace) console.log(`Current state: ${target.state}.`)

                        //Checking "on" handler
                        let on =  target.stateMap[target.state][prop]["on"];
                        if (typeof on === "function") {
                            if(target.trace) console.log(`Calling ${prop} with arguments ${JSON.stringify(arg)}.`)
                            on(...onArgs);
                        }

                        //Setting new state
                        let newState = target.stateMap[target.state][prop]["state"]
                        if(newState) {
                            if (target.trace) console.log(`Transitioning to state ${newState}`);
                            if ( ! (newState in target.stateMap)) throw new StateNotExist(newState);

                            target.state = newState;

                        }


                        //checking "after" handler
                        let after = target.stateMap[target.state][prop]["after"];
                        if (typeof on === "function") {
                            if(target.trace) console.log(`Calling ${prop} with arguments ${JSON.stringify(arg)}.`)
                            after(...afterArgs);
                        }
                    };

                return target.msgNotExistMode(prop)
            }
        });
    }

    addStates(states){
        for(let s of states){
            this.addState(s);
        }
    }


    addState(name){
        if(!this.stateMap.hasOwnProperty(name)) this.stateMap[name] = {};
    }

    addMessageHandler(state, name, lambda){
        this.stateMap[state][name] = lambda;
    }

    addMessageHandlers(state, handlers){
        for (let msg in handlers){
            this.addMessageHandler(state, msg, handlers[msg]);
        }
    }
}
