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
                    return (arg) => {
                        if(target.trace) console.log(`Current state: ${target.state}. Calling ${prop}. Arguments: ${arg}`)
                        target.stateMap[target.state][prop][0](arg);
                        let newState = target.stateMap[target.state][prop][1]
                        if(newState) {
                            if (target.trace) console.log(`Transitioning to state ${newState}`);
                            target.state = newState;
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


class PropertyNotExist extends Error{constructor(msg){super(`Message ${msg} does not exist in current state`)}}
class StateNotExist extends Error{constructor(msg){super(`State ${msg} does not exist.`)}}

function test2(){
    let sm = new StateMachine({}, "disconnected", StateMachine.Warn)
    sm.addStates(["disconnected", "session_pending", "session_active"])

    sm.addMessageHandlers("disconnected", {
        handleConnection: ()=>{
            console.log("Handling connection");
            return "session_pending";
        }
    })
    sm.addMessageHandlers("session_pending", {
        generateKey: ()=>{
            console.log("Key generated");
        },

        getVault: ()=>{
            console.log("Getting vault");
        },

        disconnect: ()=>{
            console.log("Disconnected");
            return "disconnected"
        },

        authenticationSuccessful: ()=>{
            console.log("Authenticated");
            return "session_active"
        }

    })

    sm.addMessageHandlers("session_active", {
        handleMessage: ()=>{console.log("Handling message")},
        disconnect: ()=>{ console.log("Disconnnected"); return "disconnected" }
    })


    sm.handle.handleConnection()
    sm.handle.getVault()
    sm.handle.generateKey()
    sm.handle.authenticationSuccessful()
    sm.handle.authenticationSuccessful()

    sm.handle.handleMessage()
    sm.handle.handleMessage()
    sm.handle.handleMessage()
    sm.handle.disconnect()
    sm.handle.handleMessage()
    sm.handle.handleMessage()
    sm.handle.handleMessage()


}

function test(){

    let f1 = ()=>{console.log("f1")}
    let f2 = ()=>{console.log("f2")}
    let f3 = ()=>{console.log("f3")}
    let f4 = ()=>{console.log("f4")}

    sm = new StateMachine({
        start: {start(){return "A"}},
        'A':{
        msg_k(msg){
            f1();
            return 'B';
        },
        msg_r(msg){
            f4();
        }
        },
        'B':{
        msg_k(msg){
            f2();
        },
        msg_r(msg){
            f3();
            return 'A';
        }
        }

    }, 'start', StateMachine.Warn)

    sm.handle.start()
    sm.handle.msg_k()
    sm.handle.msg_k()
    sm.handle.msg_r()
    sm.handle.msg_nonexistant()


    sm = new StateMachine({
        start: {start(){return "A"}},
        'A':{
        msg_k(msg){
            f1();
            return 'B';
        },
        msg_r(msg){
            f4();
        }
        },
        'B':{
        msg_k(msg){
            f2();
        },
        msg_r(msg){
            f3();
            return 'A';
        }
        }

    }, 'start', StateMachine.Die)

    console.log(`Current state: ${sm.state}`);
    try{

        sm.handle.sadfljhsafh()
    } catch(err){ console.log(`Expected Error thrown ${err}`) }



    sm = new StateMachine({
        start: {start(){return "A"}},
        'A':{
        msg_k(msg){
            f1();
            return 'B';
        },
        msg_r(msg){
            f4();
        }
        },
        'B':{
        msg_k(msg){
            f2();
        },
        msg_r(msg){
            f3();
            return 'A';
        }
        }

    }, 'start', StateMachine.Discard)

    sm.handle.start()
    sm.handle.sadf()
    sm.handle.asdf()
    sm.handle.msg_k()
    sm.handle.msg_k()
    sm.handle.msg_r()
    sm.handle.msg_r()
    sm.handle.msg_r()

}
