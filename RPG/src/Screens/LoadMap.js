//load full map for session?
//or maybe put this in pre-load

BasicGame.LoadMap = function (game) {

};
BasicGame.LoadMap.prototype = {
    preload: function () {
        this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
        //
        //load set data. This will eventually be from the server
        //should test if this is already done
        this.levels = [
            {gameData:"level1Data",map:"level1Map"},
            {gameData:"level2Data",map:"pathMap"},
            {gameData:"level2Data",map:"soloMap"}
        ];
        
        //console.log(this.game.global,this.game.global.loadMap,this.levels)
        var level = this.levels[this.game.global.loadMap];
        if(level!=null)
        {
            //console.log(level.gameData, level.map)
            this.load.json('gameData', 'assets/maps/'+level.gameData+".json");
            this.load.json('map', 'assets/maps/'+level.map+".json");
        }
        else
        {
            //show error message
            //
            console.error("Map Not exists.")
        }
    },
	create: function () {
        this.state.start('Game',true,false);
	},
	update: function () {
	},
};
