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
        this.load.json('gameData', 'assets/maps/level1Data.json');
        
        //load actual map
        this.load.json('map', 'assets/maps/level1Map.json');
    },
	create: function () {
        this.state.start('Game');
	},
	update: function () {
	},
};
