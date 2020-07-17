const path = require("path")
const net = require("net");
const { execFile, fork, spawn }  = require("child_process");


let executable = "node";


let counter = 0;
let interval = setInterval(()=>{
    console.log(`Main count ${counter}`)
    counter++
}, 1000)


let subProcess = execFile("node",  ['./sub.js'])

subProcess.stdout.on("data", data => { console.log(`STDOUT SUB ${data.toString('utf8')}`) })
subProcess.stderr.on("data", data => { console.log(`STDERR SUB ${data.toString('utf8')}`) })
subProcess.on("message", msg=>{
    console.log(`Message from child: ${msg}`);

})

subProcess.on('exit', ()=>{
    clearInterval(interval);

    console.log("child exited. Exiting...");
    process.exitCode = 0
})

setTimeout(()=>{
    console.log("Starting new connection");
    let socket = net.connect({port : 53215, host: "127.0.0.1"})
    socket.write("Hello World")

    socket.on("data", data=>{
        console.log(`Message received from the server: ${data.toString("utf8")}`);
    })
}, 1000)
