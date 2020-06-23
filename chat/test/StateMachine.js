const  { StateMachine } = require("../client/src/js/lib/AdvStateMachine.js");


function getLightBulbSM(initState){
    return new StateMachine(undefined, {
        trace: true,
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
    constructor(initState){

        this.name = 'Lamp'

        this.sm = new StateMachine(this, {

            trace: true,
            name: "Lamp sm",
            initialState: "off",

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

    toggle(){
        this.sm.handle.toggle()
    }

    beep(){
        console.log("BEEP");
    }

    sayName(){
        console.log(`My name is ${this.name}`);
    }
}

function testLamp(){
    let lamp = new Lamp("off")
    lamp.toggle()
    lamp.toggle()
    lamp.toggle()

}

function testLightBulb(){
    let sm = getLightBulbSM("off");
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle("Hey", 123, "boo")
    sm.handle.toggle('asdf', "foo")
}

testLightBulb();

//testLamp()
