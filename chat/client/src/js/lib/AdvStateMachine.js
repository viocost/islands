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


class StateMachine {
    static Discard () { return ()=> undefined } ;
    static Warn(prop, smName) { return ()=> console.warn(`${smName}: property ${prop} does not exist in current state`) };
    static Die   (prop, smName) { return ()=>{ throw new PropertyNotExist(`${smName}, ${prop}`)  }; }

    constructor({ stateMap,
                  initialState = 'start',
                  msgNotExistMode = StateMachine.Discard,
                  trace = false,
                  name = "State Machine"
                }) {
        // we need to expose the state object based on a variable

        if( stateMap === undefined) throw new Error("No state map provided");

        if(!stateMap.hasOwnProperty(initialState)) throw new Error("Initial state not in state map");

        this.error = false;
        this.trace = trace;
        this.name = name;
        this.msgNotExistMode = msgNotExistMode;
        this.stateMap = new Proxy(stateMap, {
            get(target, prop){
                if(!(prop in target)) throw new StateNotExist(prop)
                return target[prop];
            }

        });

        this.legalEvents = this.generateEventNames();

        this.state = initialState;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // let entryNewState = this.stateMap[initialState].entry;                                                                                 //
        // if (typeof entryNewState === "function") {                                                                                             //
        //     if(this.trace) console.log(`%c ${this.name}: Calling entry action for "${initialState}"`,  'color: #009933;  font-weight: 600; '); //
        //     entryNewState();                                                                                                                   //
        // }                                                                                                                                      //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.performActions(this.stateMap[initialState].entry, "Initial entry");


        this.handle = new Proxy(this, {
            get(target, prop) {

                if(target.error) throw new Error("The state machine is blown");

                if( target.legalEvents.has(prop))
                    return (args) => {
                        setImmediate(()=>target.processEvent(prop, args))
                    };

                throw new Error(`Illegal event name ${prop}`)
            }
        });
    }


    processEvent(eventName, eventArgs) {

        ///////////////////////////////////////
        // if I will change state            //
        //   call exit actions               //
        // call transition actions           //
        // if  I will change state           //
        //   change state                    //
        //   call entry actions on new state //
        ///////////////////////////////////////



        if (this.trace){
            console.log(`${this.name}: Current state: ${this.state}. `)
            console.log(`   Processing event ${eventName}(${JSON.stringify(eventArgs)})`);
        }

        if (!(eventName in this.stateMap[this.state].transitions)){
            this.msgNotExistMode(eventName, this.name);
            return;
        }



        let actions = this.stateMap[this.state].transitions[eventName]["actions"];
        let newState = this.stateMap[this.state].transitions[eventName]["state"]

        if (newState) {
            if (!(newState in this.stateMap)){
                this.error = true;
                throw new StateNotExist(newState);
            }

            let exitActions = this.stateMap[this.state].exit;

            if(exitActions) this.performActions(exitActions, "exit");

        }

        if (actions) this.performActions(actions, "transition");

        //Setting new state
        if (newState) {

            let entryActions = this.stateMap[newState].entry;
            this.state = newState;
            if(this.trace) console.log(`State is now set to ${this.state}`);
            if (entryActions) this.performActions(entryActions, "entry");
        }
    }

    performActions(actions, context){

        if (this.trace) console.log(`%c ${this.name}: Calling actions for ${context}`, 'color: #c45f01; font-size: 13px; font-weight: 600; ');

        if (!Array.isArray(actions)){
            actions = [actions]
        }

        for( let action of actions ){
            if(typeof action !== "function") {
                this.error = true;
                throw new TypeError("Action is not a function");
            }
            action();
        }

    }

    generateEventNames(){
        let res = new Set();

        for( let state in this.stateMap){
            for(let event in this.stateMap[state].transitions){
                res.add(event)
            }
        }
        if(this.trace) console.log(`${this.name} recognizes events ${JSON.stringify(Array.from(res))}`)
        return res;
    }

}


class PropertyNotExist extends Error{constructor(msg){super(`Message ${msg} does not exist in current state`)}}
class StateNotExist extends Error{constructor(msg){super(`State ${msg} does not exist.`)}}



module.exports = {
    StateMachine: StateMachine
}
