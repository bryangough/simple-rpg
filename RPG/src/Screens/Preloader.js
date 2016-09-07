
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
		this.preloadBar = this.add.sprite(0, 273, 'loadingScreen', 'loading_barfront.png');
        
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
        
        this.load.atlasJSONHash('ui', this.game.global.uilocation + 'simpleui.png', this.game.global.uilocation + 'simpleui.json');
        this.load.atlasJSONHash('gameplayinterface', this.game.global.uilocation + 'paradoxinterface.png', this.game.global.uilocation + 'paradoxinterface.json');
        
		this.load.image('loading', this.game.global.uilocation + 'loading.png');
        this.load.image('mainmenu', this.game.global.uilocation + 'mainmenu.png');
        this.load.image('mapselect', this.game.global.uilocation + 'mapselect.png');
        this.load.image('winscreen', this.game.global.uilocation + 'winscreen.png');
        this.load.image('instructions', this.game.global.uilocation + 'instructions.png');

        this.load.bitmapFont("simplefont", this.game.global.uilocation + "fonts/badabb.png", this.game.global.uilocation + "fonts/badabb.fnt");
        
        //this.load.atlasJSONHash('dialogui', 'dialogui.png', 'dialogui.json');//dialogui
        
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
	   //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here
        this.load.json('player', this.game.global.assetsLocation + 'maps/playerdata.json');
        this.load.json('playergamedata', this.game.global.assetsLocation + 'maps/playergamedata.json');
        
        //
        this.load.json('levels', 'levels.json');
        
        this.barwidth = this.preloadBar.width;
        this.preloadBar.width = 0;
        
        this.load.onFileComplete.add(this.updateProgress,this);
	},
    updateProgress:function(progress, filekey, success, totalloadedfiles, totalfiles){
        var val = progress /100;
        //console.log(this.barwidth * val)
        this.preloadBar.width = this.barwidth * val;
        //this.rocket.x = this.barwidth * val;
        //console.log(val);
    },
	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        
        this.state.start('LoadMap');
        //this.state.start('MainMenu');
        //this.state.start('MapSelect');
	},

	/*update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.ready == false)//this.cache.isSoundDecoded('titleMusic') && 
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}*/

};
