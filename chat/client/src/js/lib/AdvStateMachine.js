
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


function asArray(arg){
    if (arg === null || arg === undefined)
        return []
    else if (Array.isArray(arg))
        return arg
    else
        return [arg]
}


export class StateMachine {
    static Discard () { return ()=> undefined } ;
    static Warn(prop, smName) { return ()=> console.warn(`${smName}: property ${prop} does not exist in current state`) };
    static Die   (prop, smName) { return ()=>{ throw new PropertyNotExist(`${smName}, ${prop}`)  }; }

    constructor(stateMap={}, startStateName='start',  msgNotExistMode=StateMachine.Discard, trace=false, name="State Machine") {
        // we need to expose the state object based on a variable

        if(!stateMap.hasOwnProperty(startStateName)) {
            stateMap[startStateName] = {};
        }

        this.trace = trace;
        this.name = name;
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
                    return (onArgs = [], afterArgs = []) => {
                        if(target.trace) console.log(`${target.name}: Current state: ${target.state}.`)

                        let on =  target.stateMap[target.state][prop]["on"];
                        let after = target.stateMap[target.state][prop]["after"];
                        let newState = target.stateMap[target.state][prop]["state"]

                        if (typeof on === "function") {
                            if(target.trace) console.log(`${target.name}: Calling ${prop} with arguments ${JSON.stringify(onArgs)}.`)
                            on(...asArray(onArgs));
                        }

                        //Setting new state
                        if(newState) {
                            if (target.trace) console.log(`%c ${target.name}: TRANSITIONING TO "${newState}"`, 'color: #c45f01; font-size: 13px; font-weight: 600; ');

                            if ( ! (newState in target.stateMap)) throw new StateNotExist(newState);

                            target.state = newState;

                        }


                        //checking "after" handler
                        if (typeof after === "function") {
                            if(target.trace) console.log(`${target.name}: Calling ${prop} with arguments ${JSON.stringify(afterArgs)}.`)
                            after(...asArray(afterArgs));
                        }
                    };

                return target.msgNotExistMode(prop, target.name)
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
