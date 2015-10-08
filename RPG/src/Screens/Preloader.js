
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
		this.preloadBar = this.add.sprite(0, 278, 'loadingScreen', 'loading_barfront.png');
        
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
        
        this.load.atlasJSONHash('ui', 'assets/simpleui.png', 'assets/simpleui.json');
        this.load.atlasJSONHash('tiles2', 'assets/tiles2.png', 'assets/tiles2.json');
        this.load.atlasJSONHash('actors', 'assets/actors.png', 'assets/actors.json');
        this.load.atlasJSONHash('gameplayinterface', 'assets/paradoxinterface.png', 'assets/paradoxinterface.json');//dialogui
		this.load.image('loading', 'assets/loading.png');
        this.load.image('mainmenu', 'assets/mainmenu.png');
        this.load.image('mapselect', 'assets/mapselect.png');
        this.load.image('winscreen', 'assets/winscreen.png');
        this.load.image('instructions', 'assets/instructions.png');
        //this.load.bitmapFont("simplefont", "assets/fonts/calibri_white.png", "assets/fonts/calibri_white.fnt");
        this.load.bitmapFont("simplefont", "assets/fonts/badabb.png", "assets/fonts/badabb.fnt");
        
        this.load.atlasJSONHash('dialogui', 'assets/dialogui.png', 'assets/dialogui.json');//dialogui
        
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
	   //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        
        this.state.start('LoadMap');
        //this.state.start('MainMenu');
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
