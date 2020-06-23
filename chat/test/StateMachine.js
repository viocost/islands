const  { StateMachine } = require("../client/src/js/lib/AdvStateMachine.js");


function getLightBulbSM(initState){
    return new StateMachine(undefined, {
        trace: true,
        traceLevel: StateMachine.TraceLevel.DEBUG,
        initialState: initState,
        name: "Light Bulb",
        stateMap: {
            off: {
                entry: ()=>{ console.log("I am entry action for off state") },
                exit:  ()=>{ console.log("I am exit action for off state") },
                transitions: {
                    toggle: {
                        actions: ()=>{ console.log("I am toggle event handler for state OFF") },
                        state: "on",
                    }
                }
            },

            on: {
                entry: ()=>{ console.log("I am entry action for on state") },
                exit:  ()=>{ console.log("I am exit action for on state") },
                transitions: {
                    toggle: {
                        actions: ()=>{ console.log("I am toggle event handler for state ON") },
                        state: "off"
                    }
                }
            }
    },})
}

class Lamp{
    constructor(){

        this.name = 'Lamp'

        this.sm = new StateMachine(this, {

            trace: true,
            name: "Lamp sm",
            initialState: "off",
            traceLevel: StateMachine.TraceLevel.DEBUG,

            stateMap: {
                on:{
                    transitions: {
                        toggle: {
                            actions: this.turnOff,
                            state: "off"
                        }
                    }
                },

                off: {
                    transitions: {
                        toggle: {
                            actions: [ this.turnOn, this.beep, this.sayName ],
                            state: "on"
                        }
                    }
                }
            }
        })
    }

    turnOn(){
        console.log("turnOn call");
        console.log(this);
    }

    turnOff(){
        console.log("turnOff call");
    }

    toggle(a, b, c){
        this.sm.handle.toggle(a, b, c)
    }

    beep(a, b, c){
        console.log(`BEEP! Args: ${a} ${b} ${c} ` );
    }

    sayName(a, b, c){
        console.log(`My name is ${this.name} Args: a:  ${a} b: ${b} c: ${c}`);
    }
}

function testLamp(){
    let lamp = new Lamp("off")
    lamp.toggle(1, 2, 3)
    lamp.toggle(4, 5, 6)
    lamp.toggle(7, 8, 9)

}

function testLightBulb(){
    let sm = getLightBulbSM("off");
    sm.handle.toggle(1, 2, 3)
    sm.handle.toggle(4, 5, 6)
    sm.handle.toggle("Hey", 123, "boo")
    sm.handle.toggle('asdf', "foo")
}

//testLightBulb();

testLamp()
