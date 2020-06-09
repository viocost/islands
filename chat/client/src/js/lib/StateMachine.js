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
    static Discard = ()=> ()=> undefined;
    static Warn = (prop)=> ()=> console.warn(`Property ${prop} does not exist in current state`);
    static Die  = (prop) => ()=>{ throw new PropertyNotExist(prop)  };

    constructor(stateMap, startStateName='start',  msgNotExistMode=StateMachine.Discard) {
        // we need to expose the state object based on a variable
        if(!stateMap ) throw new StateMapInvalid();
        if(!stateMap.hasOwnProperty(startStateName)) throw new  StartStateNotFound(startStateName);

        this.msgNotExistMode = msgNotExistMode;
        this.stateMap = stateMap;
        this.state = startStateName;


        this.handle = new Proxy(this, {
            get(target, prop) {

                if(prop in target.stateMap[target.state])
                    return (arg) => {
                        let ret = target.stateMap[target.state][prop](arg);
                        if(ret) target.state = ret;
                    };

                return target.msgNotExistMode(prop)
            }
        });

    }


    getNotExistHandler(prop)  {

        let handlers = [

             // silently discard messages not handled
            ()=>{  },
            ()=>{ throw new PropertyNotExist(prop)  },

        ]

        return handlers[this.mode];
    
    }



}


class StartStateNotFound extends Error{constructor(msg){super(msg)}}
class StateMapInvalid extends Error{constructor(msg){super(msg)}}
class PropertyNotExist extends Error{constructor(msg){super(msg)}}

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
