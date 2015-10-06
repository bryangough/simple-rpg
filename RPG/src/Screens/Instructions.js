
BasicGame.Instructions = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.Instructions.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'instructions');

		this.playButton = this.add.button(177, 529, 'ui', this.returnToMain, this, 'OK Button0001.png', 'OK Button0002.png', 'OK Button0002.png','OK Button0001.png');
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	returnToMain: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('MainMenu');

	}
};
