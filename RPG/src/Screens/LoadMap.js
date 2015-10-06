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
        this.load.json('gameData', 'assets/maps/gamedata.json');
        this.load.json('player', 'assets/maps/player.json');
        //load actual map
        this.load.json('map', 'assets/maps/forestmap.json');
    },
	create: function () {
        this.state.start('Game');
	},
	update: function () {
	},
};
