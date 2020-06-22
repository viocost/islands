/**
 * This is implementation of state machine.
 *
 * Constructor accepts object such as:
 * {
 *    start: lambdaStart(){},
 *    <state1>: {
 *        lambda1: ()={...}args,
 *        lambda2: ()={...},
 *        lambda3: ()={...},
 *

 *    <state2>: {
 *        lambda4: ()={...},
 setImmediate(()=>{
 *        lambda2: ()={...},
 *        lambda5: ()={...args}
 })

   to send message to state machine simply smInstance.handle.msg where msg is some lambda in current state
   If message is not found it is ignored
 */


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

        let entryNewState = this.stateMap[startStateName].entry;
        if (typeof entryNewState === "function") {
            if(this.trace) console.log(`%c ${this.name}: Calling entry action for "${startStateName}"`,  'color: #009933;  font-weight: 600; ');
            entryNewState();
        }

        this.handle = new Proxy(this, {
            get(target, prop) {

                if(prop in target.stateMap[target.state])
                    return (args) => {
                        if(target.trace) console.log(`${target.name}: Current state: ${target.state}.`)

                        let on =  target.stateMap[target.state][prop]["on"];
                        let newState = target.stateMap[target.state][prop]["state"]

                        if (typeof on === "function") {
                            setTimeout(()=>{
                                if(target.trace) console.log(`${target.name}: Calling ${prop} with arguments ${JSON.stringify(args)}.`)
                                on(args);
                            }, 0)
                        }

                        //Setting new state
                        if(newState) {
                            if ( ! (newState in target.stateMap)) throw new StateNotExist(newState);
                            if (target.trace) console.log(`%c ${target.name}: TRANSITIONING TO "${newState}"`, 'color: #c45f01; font-size: 13px; font-weight: 600; ');

                            let oldState = target.state;
                            let exitOldState = target.stateMap[oldState].exit;
                            let entryNewState = target.stateMap[newState].entry;
                            if (typeof exitOldState === "function") {
                                if(target.trace) console.log(`%c ${target.name}: Calling exit action for "${oldState}"`,  'color: #ff0000;  font-weight: 600; ');
                                exitOldState();
                            }
                            //calling exit of old state

                            target.state = newState;

                            if (typeof entryNewState === "function") {
                                if(target.trace) console.log(`%c ${target.name}: Calling entry action for "${newState}"`,  'color: #009933 ;  font-weight: 600; ');
                                entryNewState();
                            }

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


function getLightBulbSM(){
    return new StateMachine({
        off: {
            entry: ()=>{ console.log("I am entry action for off state") },
            exit:  ()=>{ console.log("I am exit action for off state") },

            toggle: {
                on: ()=>{ console.log("I am toggle event handler for state ON") },
                state: "on"
            }
        },

        on: {

            entry: ()=>{ console.log("I am entry action for off state") },
            exit:  ()=>{ console.log("I am exit action for off state") },

            toggle: {

                on: ()=>{ console.log("I am toggle event handler for state OFF") },
                state: "off"
            }
        }


    }, "off", StateMachine.Warn, true, "Light bulb")
}


function testLightBulb(){
    let sm = getLightBulbSM();
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
}
