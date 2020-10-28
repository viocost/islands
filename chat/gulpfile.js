const gulp = require("gulp");
const fs = require('fs-extra');
const shelljs = require("shelljs");

let pathToIsland = [];

for(let i = 1; i< process.argv.length; i++){
    switch (process.argv[i]){
        case "-p":{
            pathToIsland.push(process.argv[i+1])
        }
    }
}

if(!pathToIsland.length === 0 || !verifyPathExists(pathToIsland)){
    console.log("Islands path not found")
    process.exit(1);
}


function verifyPathExists(paths){
    for(let p of paths){
        if(!fs.existsSync(p)){
            console.log(`Path ${p} does not exist`);
            return false
        }
    }
    return true;
}

gulp.task("client", ()=>{
    let clientWatcher = gulp.watch("client/src/**/*")
    let commonWatcher = gulp.watch("common/**/*")
    clientWatcher.on('change', ()=>{
        let paths = pathToIsland.map(el=> ` -p ${el}`)
        refresh(paths, true)
    })

    commonWatcher.on('change', ()=>{
        let paths = pathToIsland.map(el=> ` -p ${el}`)
        refresh(paths, true)
    })
})

gulp.task("server", ()=>{
    let serverWatcher = gulp.watch("server/**/*")
    serverWatcher.on('change', ()=>{
        let paths = pathToIsland.map(el=> ` -p ${el}`)
        refresh(paths)
    })

    let oldServerWatcher = gulp.watch("old_server/**/*")

    oldServerWatcher.on('change', ()=>{
        let paths = pathToIsland.map(el=> ` -p ${el}`)
        refresh(paths)
    })
})

gulp.task('watch', gulp.parallel(['server', 'client']))

gulp.task('default', gulp.task("watch"))


function refresh(refreshPath, withFront){
    let cmd = `./refresh.sh ${refreshPath.join(" ")} ${withFront ? "-bf" : ""}`
    shelljs.exec(cmd);
}
