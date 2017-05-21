var GameServer = function () {
    this.updateRate = 1000/12;
    //this.setLoops();
};

GameServer.getMainGame = function()
{
    return new GameServer();
}

GameServer.prototype.setLoops = function(){ // Sets up the server update loop, and the regenration loop
    console.log(this.update, this.updateRate)
    setInterval(this.update,this.updateRate);
};


//game loop
GameServer.prototype.update = function(){ // called every 1/12 of sec
    //      var elapsedTime = this.game.time.elapsed;
    console.log("update");
    /*Object.keys(GameServer.players).forEach(function(key) {
        var player = GameServer.players[key];
        if(player.alive) player.update();
    });
    Object.keys(GameServer.monstersTable).forEach(function(key) {
        var monster = GameServer.monstersTable[key];
        if(monster.alive) monster.update();
    });*/
};

module.exports.GameServer = GameServer;