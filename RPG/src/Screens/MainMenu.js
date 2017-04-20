
BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'mainmenu');

		this.playButton = this.add.button(376, 425, 'ui', this.startGame, this, 'Play Button0001.png', 'Play Button0002.png', 'Play Button0002.png','Play Button0001.png');
        
        //this.playButton = this.add.button(376, 487, 'ui', this.gotoInstructions, this, 'Instructions Button0001.png', 'Instructions Button0002.png', 'Instructions Button0002.png','Instructions Button0001.png');

        this.state.start('MapSelect');
	},

	update: function () {

		

	},

	startGame: function (pointer) {

		
		//	And start the actual game
		this.state.start('MapSelect');

	},
    gotoInstructions: function (pointer) {


		//	And start the actual game
		this.state.start('Instructions');

	}

};
