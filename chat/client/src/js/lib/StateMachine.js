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
    constructor(stateMap, mode=0) {
        // we need to expose the state object based on a variable
        let self = this;
        this.mode = mode;
        this.stateMap = stateMap;
        this.state = this.stateMap.start;


        this.handle = new Proxy(this, {
            get(target, prop) {

                if(prop in target.state)
                    return (arg) => {
                        let ret = target.state[prop](arg);
                        if(ret) self.state = self.stateMap[ret];
                    };

                return self.getNotExistHandler(prop)
            }
        });

    }


    getNotExistHandler(prop)  {

        let handlers = [

            ()=> undefined,  // silently discard messages not handled
            ()=>{ console.warn(`Property ${prop} does not exist in current state`) },
            ()=>{ throw new PropertyNotExist(prop)  },

        ]

        return handlers[this.mode];
    
    }



};


class StartStateNotFound extends Error{constructor(msg){super(msg)}}
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

    }, 2)

}
