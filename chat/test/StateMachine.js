const  { StateMachine } = require("../client/src/js/lib/AdvStateMachine.js");


function getLightBulbSM(){
    return new StateMachine({
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


function testLightBulb(){
    let sm = getLightBulbSM();
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
    sm.handle.toggle()
}

testLightBulb();
