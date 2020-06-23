const { createDerivedErrorClasses } = require("../../../../common/DynamicError");
/**
 * This is implementation of state machine.
 *
 * Constructor accepts object such as:
 * {
 *    start: lambdaStart(){},
 *    <state1>: {
 actionTypeInvalid:
 *        lambda1: ()={...}args,
 actionTypeInvalid:
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
    static Die   (prop, smName) { return ()=>{ throw new err.msgNotExist(`${smName}, ${prop}`)  }; }

    constructor(obj, { stateMap,
                  initialState,
                  msgNotExistMode = StateMachine.Discard,
                  trace = false,
                  name = "State Machine"
                }) {
        // we need to expose the state object based on a variable

        if( stateMap === undefined) throw new err.illegal.noStateMap();

        if(!stateMap.hasOwnProperty(initialState)) throw new err.initStateNotInMap(`Initial state provided: ${initialState} || States: ${JSON.stringify(Object.keys(stateMap))}`);

        this.obj = obj;
        this.error = false;
        this.trace = trace;
        this.name = name;
        this.msgNotExistMode = msgNotExistMode;
        this.stateMap = new Proxy(stateMap, {
            get(target, prop){
                if(!(prop in target)) throw new err.stateNotExist(prop)
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

        let initialEntryActions =  this.stateMap[initialState].entry;
        if(initialEntryActions)  this.performActions(initialEntryActions, "Initial entry", undefined, undefined);


        this.handle = new Proxy(this, {
            get(target, prop) {

                if(target.error) throw new err.blown();

                if( target.legalEvents.has(prop))
                    return (args) => {
                        setImmediate(()=>target.processEvent(prop, args))
                    };

                throw new err.illegalEventName(`${prop}`)
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
                throw new err.stateNotExist(newState);
            }

            let exitActions = this.stateMap[this.state].exit;

            if(exitActions) this.performActions(exitActions, "exit", eventName, eventArgs);

        }

        if (actions) this.performActions(actions, "transition", eventName, eventArgs);

        //Setting new state
        if (newState) {

            let entryActions = this.stateMap[newState].entry;
            this.state = newState;
            if(this.trace) console.log(`State is now set to ${this.state}`);
            if (entryActions) this.performActions(entryActions, "entry", eventName, eventArgs);

        }
    }

    performActions(actions, context, eventName, eventArgs){


        if (this.trace) console.log(`%c ${this.name}: Calling actions for ${context} || Event name: ${eventName} || Event args: ${JSON.stringify(eventArgs)}`, 'color: #c45f01; font-size: 13px; font-weight: 600; ');

        if (!Array.isArray(actions)){
            actions = [actions]
        }

        for( let action of actions ){
            if(typeof action !== "function") {
                this.error = true;
                throw new err.actionTypeInvalid(typeof action);
            }
            action.call(this.obj, this, eventName, eventArgs);
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




class StateMachineError extends Error{ constructor(details) { super(details); this.name = "StateMachineError" } }

const err = createDerivedErrorClasses(StateMachineError, {
    msgNotExist: "MessageNotExist",
    noStateMap: "MissingStateMap",
    initStateNotInMap: "InitialStateNotFoundInMap",
    stateNotExist: "StateNotExist",
    blown: "StateMachineIsBlown",
    illegalEventName: "IllegalEventName",
    actionTypeInvalid: "ActionTypeInvalid"
})




module.exports = {
    StateMachine: StateMachine
}