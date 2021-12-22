const path = require("path")
const fs = require("fs")

let configPath;
let configFilename = "island_conf.json"

function parseArgs(){
    const args = process.argv.slice(2);

    args.forEach((val, index, arr)=>{
        switch(val){
            case "-p":
            case "--dest-path":
                configPath = arr[index+1];
                break;
        }
    })


}
//end
function main(){
    parseArgs();

    if(!fs.existsSync(configPath)){
        console.error("Config path not found")
        process.exit(1);
    }


    fs.writeFileSync(path.join(configPath, configFilename), JSON.stringify({
        "tor": {
            "torExitPolicy": "reject *:*",
        },
        "data": "",
        "nodeDebugHost": "127.0.0.1",
    }, null, 4))

    console.log("Configuration written successfully.");
}

main()
