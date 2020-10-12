const gulp = require("gulp");
const fs = require('fs-extra');
const shelljs = require("shelljs");

let pathToIsland;

for(let i = 1; i< process.argv.length; i++){
    switch (process.argv[i]){
        case "-p":{
            pathToIsland = process.argv[i+1]
        }
    }
}

if(!pathToIsland || !fs.existsSync(pathToIsland)){
    console.log("Islands path not found")
    process.exit(1);
}



gulp.task("client", ()=>{
    let clientWatcher = gulp.watch("client/src/**/*")
    let commonWatcher = gulp.watch("common/**/*")
    clientWatcher.on('change', ()=>{
        let cmd = `./refresh.sh -p ${pathToIsland} -bf`
        shelljs.exec(cmd);
    })

    commonWatcher.on('change', ()=>{
        let cmd = `./refresh.sh -p ${pathToIsland} -bf`
        shelljs.exec(cmd);
    })
})

gulp.task("server", ()=>{
    let serverWatcher = gulp.watch("server/**/*")
    serverWatcher.on('change', ()=>{
        let cmd = `./refresh.sh -p ${pathToIsland}`
        shelljs.exec(cmd);
    })

    let oldServerWatcher = gulp.watch("old_server/**/*")

    oldServerWatcher.on('change', ()=>{
        let cmd = `./refresh.sh -p ${pathToIsland}`
        shelljs.exec(cmd);
    })
})

gulp.task('watch', gulp.parallel(['server', 'client']))

gulp.task('default', gulp.task("watch"))
