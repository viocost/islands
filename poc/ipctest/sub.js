const path = require("path")
const net = require("net")

console.log("Sub started");
let counter = 0;

let interval = setInterval(()=>{
    console.log(`SUB counter ${counter}`);
    counter ++;
}, 2000)

let server = net.createServer()
server.listen(53215, "127.0.0.1", ()=>{
    console.log("Command server started");
})


server.on("connection", (socket)=>{

    console.log("New connection!");

    socket.on("data", data=>{
        console.log(`Message received: ${data.toString("utf8")}`);
        socket.write("Wassup?")
    })
   
})
