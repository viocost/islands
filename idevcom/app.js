const express = require("express.io"),
      app = express(),
      path = require('path'),
      logger = require('morgan'),
      PORT = 4000;


app.set('view engine', 'pug');
app.http().io();

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "pug");

if (app.get('env') === 'development')
    app.use(logger('dev'));
app.locals.pretty = true;
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
    res.render('index');
});


const USERS_ONLINE = {};

app.io.on('connection', (socket)=>{


    if(socket.handshake.query.name !== undefined){
        user = {
            name : socket.handshake.query.name,
            id : socket.id,
        };
        console.log(user.name + ' with id ' + user.id + ' has connected');
        if (!USERS_ONLINE.hasOwnProperty(socket.id)){
            USERS_ONLINE[socket.id] = user.name;
        }
        updateOnlineUsersList();
    }

    socket.on('disconnect', ()=>{
        if(USERS_ONLINE.hasOwnProperty(socket.id)){
            userName = USERS_ONLINE[socket.id];
            delete USERS_ONLINE[socket.id];
            console.log('User ' + userName + ' with id ' + socket.id + ' has been disconnected');
        }else{
            console.log('user disconnected');
        }
        updateOnlineUsersList();
    });
});

function updateOnlineUsersList(){
    app.io.broadcast('update_online_users', USERS_ONLINE);
}

app.io.route('ready', (req)=>{
    req.io.join(req.data);
    app.io.room(req.data).broadcast('announce', {
        message: 'New client in the ' + req.data + ' room.'
    });
});

app.listen(PORT, 'localhost', ()=>{
    console.log('app started on port ' + PORT);
});
    