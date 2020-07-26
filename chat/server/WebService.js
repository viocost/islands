const express = require('express');
const SocketIO = require('socket.io');
//const adminRouter = require("./adminRouter");
const appRouter = require("./appRouter");
const path = require("path")

class WebService{
    constructor({host, port, viewsPath, staticPath}){
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
        this._app.use("/", appRouter.router);
    }


    launch(){
        this._server = this._app.listen(this._port, this._host, ()=>{
            console.log(`Island Web Service is running at ${this._host}:${this._port}`);
            this._launchSocketServer(this._server)
        });


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
        this.emit('connection', new SocketIOClientConnection(socket))
        //2 state machines: connection / reconnection
    }


    _handleNewDataConnection(socket){

    }


}


class WebServiceAdmin extends WebService{
    constructor(){
        super(...arguments)
//        this._app.use("/admin", adminRouter.router);
    }



}

class WebServiceGuest extends WebService{
    constructor(){
        super(...arguments)
        this._app.use("/admin", adminRouter.router);
    }
}

module.exports = {
    WebServiceAdmin: WebServiceAdmin,
    WebServiceGuest: WebServiceGuest
}
