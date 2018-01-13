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

//index route
app.get('/', (req, res)=>{
    res.render('index');
});

//This one is blank yet
app.get('/private', (req, res)=>{
    res.render('private');
});

//Dictionary of active socket connections
//key is socket id
const USERS_ONLINE = {};

//defining event handlers for socket.io
app.io.on('connection', (socket)=>{

    if(socket.handshake.query.name !== undefined){
        //creating new user object
        user = {
            name : socket.handshake.query.name,
            id : socket.id,
        };
        console.log(user.name + ' with id ' + user.id + ' has connected');

        //if User with such id is not already online, add him to USERS_ONLINE
        if (!USERS_ONLINE.hasOwnProperty(socket.id)){
            USERS_ONLINE[socket.id] = user.name;
        }

        console.log(socket.id);
        //returning added socket id
        socket.send(socket.id);

        //asking all the clients to update online users list
        updateOnlineUsersList();
    }

    //
    socket.on('broadcast_msg', (data)=>{
        message = {
            author: USERS_ONLINE[socket.id],
            message: data.message,
            id: socket.id
        };
        app.io.broadcast('new_message', message);
    });

    socket.on('message', (message)=>{
        let data;
        try{
            data = JSON.parse(message)
        } catch(err) {
            console.log('invalid JSON');
            data = {}
        }

        switch(data.type){
            case "offer":
                console.log("sending offer to: " + data.name);
                let conn = USERS_ONLINE[data.id];

                socket.otherName = data.name;

                if (conn !== null){
                    sendTo(conn, {
                       type: "offer",
                       offer: data.offer,
                       name: socket.name
                    });
                }
                break;

            case "answer":
                console.log("Sending answer to: ", data.name);
        }

    });

    //disconnect handler
    socket.on('disconnect', ()=>{
        //removing connected user from USERS_ONLINE dict
        if(USERS_ONLINE.hasOwnProperty(socket.id)){
            userName = USERS_ONLINE[socket.id];
            delete USERS_ONLINE[socket.id];
            console.log('User ' + userName + ' with id ' + socket.id + ' has been disconnected');
        }else{
            console.log('user disconnected');
        }
        //asking all the clients to update online users list
        updateOnlineUsersList();
    });
});

function updateOnlineUsersList(){
    app.io.broadcast('update_online_users', USERS_ONLINE);
}

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
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
    