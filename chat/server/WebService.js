const express = require('express');
const SocketIO = require('socket.io');
//const adminRouter = require("./adminRouter");
const appRouter = require("./appRouter");
const path = require("path")

class WebService{
    constructor(host, port){
        this._port = port;
        this._host = host;
        this._app = express()


        this._app.set('views', path.join(__dirname, 'views'));
        this._app.set('view engine', 'pug');

        if (this._app.get('env') === 'development'){
            const logger = require('morgan');
            this._app.use(logger('dev'));
            this._app.locals.pretty = true;
        }

        this._app.use(express.static(path.join(__dirname, '../public')));
        this._app.use("/", appRouter.router);
    }


    launch(){
        this._server = this._app.listen(this._port, this._host, ()=>{
            console.log(`Island Web Service is running at ${host}:${port}`);
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


    }


    _handleNewDataConnection(socket){


    }


}


class WebServiceAdmin extends WebService{
    constructor(port){
        super(port)
//        this._app.use("/admin", adminRouter.router);
    }



}

class WebServiceGuest extends WebService{
    constructor(port){
        super(port)
        this._app.use("/admin", adminRouter.router);
    }
}

module.exports = {
    WebServiceAdmin: WebServiceAdmin,
    WebServiceGuest: WebServiceGuest
}
