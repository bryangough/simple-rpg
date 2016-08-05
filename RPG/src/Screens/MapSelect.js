
BasicGame.MapSelect = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MapSelect.prototype = {

	create: function () {
		this.add.sprite(0, 0, 'mapselect');

		this.back = this.add.button(10, 530, 'ui', this.returnToMain, this, 'menu0001.png', 'menu0002.png', 'menu0002.png','menu0001.png');
        
        this.displayLevel("Level 1", 1);
        this.displayLevel("Level 2", 2);
        this.displayLevel("Level 3", 3);
	},
    displayLevel:function(name, level){
        
        var btn = this.add.button(120, 200+60*level, 'ui', this.clickMap, this, 'button_blue_up.png', 'button_blue_over.png', 'button_blue_over.png','button_blue_up.png');
        btn.level = level;
        
        this.setupText(140,215+60*level, "simplefont", name, 20);
    },    
    clickMap:function(clicked, pointer){
        this.game.global.loadMap = clicked.level;
        this.state.start('LoadMap');
    },
	update: function () {
	},

	returnToMain: function (pointer) {
		this.state.start('MainMenu');
	}
};

BasicGame.MapSelect.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.add.bitmapText(x, y, font, text, size); 
    return newtext;
}
