const express = require('express');
const path = require("path")
const SocketIO = require('socket.io');
const iCrypto = require("./iCrypto")

const { EventEmitter } = require("events")


let HOST = "127.0.0.1";
let PORT = 4000


class WebService extends EventEmitter{
    constructor(host = "127.0.0.1", port){
        super()
        this.app = express();
        this.port = port;
        this.host = host;
        this.server;
        this.io;
        this.chatSocket;
        this.dataSocket;

    }

    async start(){

        this.port = this.port ? this.port : await getPort();
        //views engine
        this.app.set('views', path.join(__dirname, '..', 'views'));
        this.app.set('view engine', 'pug');

        //static dir
        this.app.use(express.static(path.join(__dirname, '..', '..', 'public')));

        this.app.get("/", (req, res)=>{

            res.render("chat", {
                title:"Islands chat",
                version: global.VERSION
            //    registration: isVaultAwaitingRegistration(req.headers["host"]),
            });
        })

        this.server = this.app.listen(this.port, this.host, ()=>{
            console.log(`Web service started on ${this.host}:${this.port}`);
        });

        this.io = SocketIO.listen(this.server)
        this.chatSocket = this.io.of("/chat")
        this.dataSocket = this.io.of("/data")

        this.chatSocket.on("connect", socket=>{

            this.emit("connect", )
            socket.on("message", msg=>{
                this.emit("message", msg)
            })

        })
    }
}

module.exports = WebService
