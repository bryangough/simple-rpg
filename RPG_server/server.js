//TODO: add package.json
//https://github.com/Jerenaux/basic-mmo-phaser
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/src',express.static(__dirname + '/src'));
app.use('/assets',express.static(__dirname + '/assets'));
//app.use(express.static('js'));
//app.use(express.static('assets'));


app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});


server.lastPlayderID = 0;
server.playersList = [];

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

io.use(function(socket, next) {
  /* ... */

  next(null, true);
});


io.on('connection',function(socket){
    // socket.on('customEvent', function(customEventData) {
    socket.on('newplayer',function(){
        console.log('new player');
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };
        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);

        /*socket.on('click',function(data){
            console.log('click to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });*/

    });
    
    socket.on('disconnect',function(){
        io.emit('remove',socket.player.id);
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
