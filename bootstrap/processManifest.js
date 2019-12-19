// ---------------------------------------------------------------------------------------------------------------------------
// This script fetches manifest file from torrent,
// fetches source code specified in manifes
// validates and installs it,
// and exitst with 0 if all is successful

//const Transmission = require("transmission");
const path = require("path");
const fs = require("fs");
const QBT = require("qbittorrent-api");



const ERROR = {
    NO_MANIFEST_LINK: 1,
    MANIFEST_DOWNLOAD_TIMEOUT: 2,
    SOURCE_DOWNLOAD_TIMEOUT: 3,
    SOURCE_INVALID: 4,
    PUBLIC_KEY_NOT_FOUND: 5,
    TORRENT_DAEMON_ERROR: 6,
    DISK_ERROR: 7,
    MANIFEST_ERROR: 8,
    UNKNOWN_ERROR: 117
}




process.on("SIGINT", ()=>{
    console.log("Interrupted. Exiting");
    exit = true;
    process.exit();
})

if (process.argv.length < 3) process.exit(ERROR.NO_MANIFEST_LINK)

let qbt = QBT.connect("https://localhost:8080", "admin", "adminadmin")
qbt.version((err, data)=>{
    if (err){
        console.error(err)
        process.exit(ERROR.TORRENT_DAEMON_ERROR)
    }
    console.log(data);
})

let manifestId;
let manifestPath;
let sourceFilePath;
let manifestDownloadStart;
let sourceDownloadStart;
let exiting = false

let magnet = fs.readFileSync(process.argv[2], "utf8");
console.log(`Loaded magnet: ${magnet}`);


function addManifest(){
    qbt.add(magnet, (err, result)=>{
        if (err){
            console.log(err);
            process.exit(ERROR.TORRENT_DAEMON_ERROR)
        } else if (exiting){
            console.log("Exiting detected.");
            return;
        }

        //console.log(result)
        manifestId = result.id;
        manifestDownloadStart = new Date();
        waitManifest();
    })
}




function waitManifest(){
    console.log("Waiting for manifest");
    qbt.get(manifestId, (err, res)=>{
        if (err){
            console.log(err);
            process.exit(TORRENT_DAEMON_ERROR);
        }



        let percentDone = res.torrents[0].percentDone*100;
        console.log(`Manifest percent done: ${percentDone}`);
        manifestPath = path.join(res.torrents[0].downloadDir, res.torrents[0].name)

        console.log(`Downloaded to ${manifestPath}`);

        if(exiting){
            return;
        }else if (percentDone < 100){
            console.log("Waiting manifest...");
            setTimeout(waitManifest, 4000)
        } else {
            processManifest()
        }
    })

}


function processManifest(){
    if (exiting) return;
    console.log("Processing manifest");


}


// qbt.get((err, arg)=>{
//     if(err){
//         console.log(err);
//         process.exit()
//     }else{
//         for (let t of arg.torrents){
//             console.log(t);
//         }
//     }

// })

addManifest();
