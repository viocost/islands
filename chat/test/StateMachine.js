const  { StateMachine } = require("../client/src/js/lib/AdvStateMachine.js");


function getLightBulbSM(){
    return new StateMachine(undefined, {
        trace: true,
        initialState: "off",
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
                            actions: this.turnOn,
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
}

function testLamp(){
    let lamp = new Lamp()
    lamp.toggle()
    lamp.toggle()
    lamp.toggle()

}

function testLightBulb(){
    let sm = getLightBulbSM();
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
}

testLightBulb();

testLamp()
