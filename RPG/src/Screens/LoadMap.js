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
            {gameData:"level2Data",map:"level2Map"}
        ];

        this.load.json('gameData', 'assets/maps/'+this.levels[this.game.global.loadMap].gameData+".json");
        this.load.json('map', 'assets/maps/'+this.levels[this.game.global.loadMap].map+".json");
    },
	create: function () {
        this.state.start('Game',true,false);
	},
	update: function () {
	},
};
