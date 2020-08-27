const express = require('express');
const SocketIO = require('socket.io');
const getPort = require('get-port');
const appRouter = require("./appRouter");
const path = require("path")
const { EventEmitter } = require("events")
const { ocketIOClientConnection } = require("./ClientConnection")

class WebService extends EventEmitter{
    constructor({
        host = "127.0.0.1",
        viewsPath = "./views",
        staticPath = "../public",
        routers = [],
        port
    }){

        super()
        this._port = port;
        this._host = host;
        this._app = express();
        this._app.set('views', viewsPath);
        this._app.set('view engine', 'pug');

        if (this._app.get('env') === 'development'){
            const logger = require('morgan');
            this._app.use(logger('dev'));
            this._app.locals.pretty = true;
        }

        this._app.use(express.static(staticPath));
        for(let router of routers){
            this._app.use(router.getBase(), router.getRouter())
        }
    }


    launch(){
        this.ensurePortSet()
            .then(()=>{
                this._server = this._app.listen(this._port, this._host, ()=>{
                    console.log(`Island Web Service is running at ${this._host}:${this._port}`);
                    this._launchSocketServer(this._server)
                });
            })
    }

    async ensurePortSet(){
        if(!this._port){
            this._port = await getPort()
        }
    }

    kill(){

    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Private methods

    _launchSocketServer(server){
        this._io = SocketIO.listen(server);
        this._socketHub = this._io.of("/chat")
        this._dataSocketHub = this._io.of("/file")
        this._socketHub.on('connection', this._handleNewChatConnection.bind(this));
        this._dataSocketHub.on('connection', this._handleNewDataConnection.bind(this));
    }

    _handleNewChatConnection(socket){
        this.emit('connection', socket)

        //2 state machines: connection / reconnection ?
    }


    _handleNewDataConnection(socket){

    }


}

module.exports = {
    WebService: WebService
}
