const express = require('express');
let path = require("path")
const SocketIO = require('socket.io');
const { EventEmitter } = require("events")


class WebService extends EventEmitter{
    constructor(host, port){
        super()
        this.app = express();
        this.port = port;
        this.host = host;

        //views engine
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');

        //static dir
        this.app.use(express.static(path.join(__dirname, '../public')));

        this.app.get("/", (req, res)=>{
            res.send("Hello");
        })

        this.server = this.app.listen(port, host, ()=>{
            console.log(`Web service started on ${host}:${port}`);
        });

        this.io = SocketIO.listen(server)
        this.chatSocket = io.of("/chat")
        this.dataSocket = io.of("/data")

        this.chatSockt.on("connect", socket=>{
            socket.on("message", msg=>{
                this.emit("message")
            })

        })
    }

}

module.exports = WebService
