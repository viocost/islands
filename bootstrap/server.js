const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const Bootstrapper = require("./bootstrapper")
// const SourceHandler = require("./SourceHandler");

const cjson = require("circular-json");

app.set('views', __dirname);
app.set('view engine', 'pug');
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')));

app.get("/", (req, res)=>{
    res.render("index");
})

app.post("/bootstrap", (req, res)=>{
    console.log(`Got data: ${JSON.stringify(req.body)}`);
    console.log(`Got request: ${req.params}`);
    res.status(200).send({res: "ok"})
})

const server = app.listen(4000, '0.0.0.0', ()=>{
    console.log("Server running...")
})


const wsServer = new WebSocket.Server({ server })

/**
 * Stringifies JSON object and sends it to socket
 */
function sjsend(socket, data){
    socket.send(JSON.stringify(data))
}

function bootstrap(socket, data){
    console.log(`Bootstrapping with ${data.magnet}`);
    let Bootstrapper = new Bootstrapper();
    Bootstrapper.getManifest(data.magnet);


    // Init bootstrapper class

    // hash = getManifest
    // sourceMagnet = processManifest(hash)
    // getSource(sourceMagnet)
    // unzip/install
    // kill bootstrap app


    qbt.version((err, data)=>{
        if (err){
            console.error(err)
            process.exit(ERROR.TORRENT_DAEMON_ERROR)
        }
        console.log(data);
    })


}

wsServer.on('connection', (socket)=>{
    console.log("Got connection");

    let processMessage = (ev) => {
        let msg = JSON.parse(ev.data)
        console.log(`Got message from client: ${msg.data}`);

        handlers = {
            bootstrap: bootstrap
        }

        if (!msg.command || !handlers.hasOwnProperty(msg.command)){
            console.error(`Invalid request: ${msg.command}`)
            return;
        }

        handlers[msg.command](socket, msg.data)


    }

    socket.onmessage =  processMessage;
})
