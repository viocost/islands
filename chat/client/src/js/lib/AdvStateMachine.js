const { createDerivedErrorClasses } = require("../../../../common/DynamicError");


class StateMachineError extends Error{ constructor(details) { super(details); this.name = "StateMachineError" } }

const err = createDerivedErrorClasses(StateMachineError, {
    msgNotExist: "MessageNotExist",
    noStateMap: "MissingStateMap",
    initStateNotInMap: "InitialStateNotFoundInMap",
    multipleInitialStates: "MultipleInitialStates",
    stateNotExist: "StateNotExist",
    blown: "StateMachineIsBlown",
    illegalEventName: "IllegalEventName",
    actionTypeInvalid: "ActionTypeInvalid",
    cannotDetermineAction: "CannotDetermineValidAction",
})

/**
 *
 * Actions
 *   array of lambdas passed to the transitions
 *   Each will be called with
 *     StateMachine, EventName, EventArgs
 */


class StateMachine {
    static Discard () { return ()=> undefined } ;
    static Warn(prop, smName) { return ()=> console.warn(`${smName}: property ${prop} does not exist in current state`) };
    static Die   (prop, smName) { return ()=>{ throw new err.msgNotExist(`${smName}, ${prop}`)  }; }
    static TraceLevel = {
        NONE: Symbol("none"),
        INFO: Symbol("info"),
        DEBUG: Symbol("debug")
    }


    constructor(obj, { stateMap, initialState, name = "State Machine" },
        { msgNotExistMode = StateMachine.Discard, traceLevel = StateMachine.TraceLevel.INFO}){

        this.verifyStateMap(stateMap, initialState)


        console.log(`traceLevel ${traceLevel.toString()}`);
        this.obj = obj;

        this.error = false;
        this.traceLevel = traceLevel;
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

                if(target.error) throw new err.blown(target.error);

                if( target.legalEvents.has(prop))
                    return (...args) => {
                        setImmediate(()=>{
                            if(target.error) return;
                            try{
                                target.processEvent(prop, args);
                            }catch(err){
                                target.error = err;
                            }
                        })
                    };

                throw new err.illegalEventName(`${prop}`)
            }
        });
    }


    getEventDescription(eventName, eventArgs){
        let descriptions = this.stateMap[this.state].transitions[eventName];

        if(!Array.isArray(descriptions)){
            descriptions = [ descriptions ]
        }

        let res = []

        for (let desc of descriptions){
            if(this.areGuardsPassed(desc, eventName, eventArgs)) res.push(desc)
        }

        if(res.length > 1 ){
            this.error = true;
            throw new err.cannotDetermineAction(`For ${eventName}. Multiple actions' guards passed`)
        }

        return res[0];

    }

    areGuardsPassed(evDescription, eventName, eventArgs){
        let res = true;
        if( undefined === evDescription.guards) return res;

        let guards = Array.isArray(evDescription.guards) ? evDescription.guards : [ evDescription.guards ];

        for(let guard of guards){
            if(!guard.call(this.obj, this, eventName, eventArgs)) {
                res = false;
                break;
            }
        }

        if(this.isDebug()) console.log(`   Guards evaluated to ${res} `);
        return res;
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

        if (this.isInfo()){
            console.log(`${this.name}: Current state: ${this.state}. `)
            if(this.isDebug())
                console.log(`   Processing event ${eventName}(${JSON.stringify(eventArgs)})`);
        }

        if (!(eventName in this.stateMap[this.state].transitions)){
            this.msgNotExistMode(eventName, this.name);
            return;
        }

        let eventDescription = this.getEventDescription(eventName, eventArgs);

        if(undefined === eventDescription){
            if(this.isInfo()) console.log(`  NO VALID ACTION FOUND for ${eventName}`);
            return
        }

        let actions =  eventDescription["actions"];
        let newState = eventDescription["state"]

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
            if(this.isInfo()) console.log(`State is now set to ${this.state}`);
            if (entryActions) this.performActions(entryActions, "entry", eventName, eventArgs);

        }
    }

    performActions(actions, context, eventName, eventArgs){

        if (this.isDebug()) console.log(`%c ${this.name}: Calling actions for ${context} || Event name: ${eventName} || Event args: ${JSON.stringify(eventArgs)}`, 'color: #c45f01; font-size: 13px; font-weight: 600; ');

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
        if(this.isInfo()) console.log(`${this.name} recognizes events ${JSON.stringify(Array.from(res))}`)
        return res;
    }

    isDebug(){
        return this.traceLevel === StateMachine.TraceLevel.DEBUG;
    }

    isInfo(){
        return this.traceLevel === StateMachine.TraceLevel.DEBUG || this.traceLevel === StateMachine.TraceLevel.INFO;
    }

    verifyStateMap(stateMap){
        //Verify there is state map
        if( stateMap === undefined) throw new err.noStateMap();

        //Verify there is initial state
        let initialState = [];
        for (let state in stateMap){
            if (stateMap[state].initial) initialState.push(state)
        }

        //Verify state map
        if(initialState.length === 0) throw new err.initStateNotInMap(`Initial state provided: ${initialState} || States: ${JSON.stringify(Object.keys(stateMap))}`);
        if(initialState.length > 1) throw new err.multipleInitialStates(JSON.stringify(initialState));
    }
}






module.exports = {
    StateMachine: StateMachine
}
