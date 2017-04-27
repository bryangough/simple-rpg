var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    console.log('new player')
    Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.socket.on('newplayer',function(data){
    console.log('newplayer')
    BasicGame.Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    console.log(BasicGame)
    for(var i = 0; i < data.length; i++){
        
        BasicGame.Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

Client.socket.on('move',function(data){
    BasicGame.Game.movePlayer(data.id,data.x,data.y);
});

Client.socket.on('remove',function(id){
    BasicGame.Game.removePlayer(id);
});