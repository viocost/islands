// This is a main core driver script
const { spawn } = require("child_process")
const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let torOutput = []

let tor = spawn('./tor')
tor.stdout.on('data', (data) => {
    torOutput.push(data.toString())
})


tor.stderr.on('data', (data) => {
    torOutput.push(data.toString())
})


rl.setPrompt("island:> ")
rl.prompt


rl.on('line', (line)=>{
    console.log("processing command");
    switch(line.trim()){
        case 'hello':
            console.log("Wassup?");
            break;
    }
    rl.prompt();

}).on('close', ()=>{
    console.log("closing");
})
