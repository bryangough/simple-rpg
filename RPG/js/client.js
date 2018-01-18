var Client = {};

Client.doConnect = function(){
    this.socket = io.connect();
}


Client.sendTest = function(){
    console.log("test sent");
    if(this.socket)
        Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    console.log('new player')
    if(this.socket)
        Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
    if(this.socket)
        Client.socket.emit('click',{x:x,y:y});
};

Client.setupSockect = function(){
    if(!this.socket)
        return;
    this.socket.on('open', function(data){
        console.log('on open')
    });
    this.socket.on('connect', function(data){
        console.log('on connect')
    });
    this.socket.on('connect_timeout', function(data){
        console.log('on connect_timeout')
    })
    this.socket.on('connect_error', function(data){
        console.log('on connect_error')
    })
    this.socket.on('reconnect', function(data){
        console.log('on connect')
    })
    this.socket.on('close', function(data){
        console.log('on connect')
    })
    
    
    
    this.socket.on('newplayer',function(data){
        console.log('newplayer')
        BasicGame.Game.addNewPlayer(data.id,data.x,data.y);
    });

    this.socket.on('allplayers',function(data){
        console.log(BasicGame)
        for(var i = 0; i < data.length; i++){
            BasicGame.Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        }
    });
    this.socket.on('move',function(data){
        BasicGame.Game.movePlayer(data.id,data.x,data.y);
    });

    this.socket.on('remove',function(id){
        BasicGame.Game.removePlayer(id);
    });
}

