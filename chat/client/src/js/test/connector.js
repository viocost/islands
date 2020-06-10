import { Connector } from "../lib/Connector";

export function runConnectorTest(){
    let c = new Connector();
    c.on("connected", ()=>{console.log("connected")})
    c.on("disconnected", ()=>{console.log("disconnected")})
    c.on("connecting", ()=>{console.log("connecting")})
    c.on("error", ()=>{console.log("error")})
    c.on("reconnecting", ()=>{console.log("reconnecting")})
    return c;
}
