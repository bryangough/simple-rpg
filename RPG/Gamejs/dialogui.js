var DialogPanel = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);

    this.overTint = 0xff5500;
    this.maingame = maingame;
    
	var bg = this.game.make.sprite(0,0,"dialogui","dialog_main.png");
    this.add(bg);
    this.btnPlay1 = this.game.make.button(36.95, -22.4, 'dialogui', this.play1, this,'dialog_10002.png', 'dialog_10001.png', 'dialog_10001.png','dialog_10002.png');
    this.btnPlay2 = this.game.make.button(37.4, 25.25, 'dialogui', this.play2, this,'dialog_20002.png', 'dialog_20001.png', 'dialog_20001.png','dialog_20002.png');    
    this.btnPlay3 = this.game.make.button(35.95, 45.8, 'dialogui', this.play3, this,'dialog_30002.png', 'dialog_30001.png', 'dialog_30001.png','dialog_30002.png');
    //
    this.add(this.btnPlay1);
    this.add(this.btnPlay3);
    this.add(this.btnPlay2);
    
    this.btnPlay1.events.onInputOver.add(this.buttonOver, this);
    this.btnPlay2.events.onInputOver.add(this.buttonOver, this);
    this.btnPlay3.events.onInputOver.add(this.buttonOver, this);
    
    //this.btnPlay1.input.pixelPerfectOver = true;
    this.btnPlay1.input.useHandCursor = true;
    //this.btnPlay2.input.pixelPerfectOver = true;
    this.btnPlay2.input.useHandCursor = true;
    //this.btnPlay3.input.pixelPerfectOver = true;
    this.btnPlay3.input.useHandCursor = true;

    this.btnPlay1.events.onInputOut.add(this.buttonOut, this);
    this.btnPlay2.events.onInputOut.add(this.buttonOut, this);
    this.btnPlay3.events.onInputOut.add(this.buttonOut, this);

     
    this.text1 = this.game.make.bitmapText(95, -10, "badabb", "1. Check", 25);
    this.text2 = this.game.make.bitmapText(95, 35, "badabb", "2. Match", 25);
    this.text3 = this.game.make.bitmapText(95, 82, "badabb", "3. Mate", 25);

    this.btnPlay1.textRef = this.text1;
    this.btnPlay2.textRef = this.text2;
    this.btnPlay3.textRef = this.text3;
    
    this.textMain = this.game.make.bitmapText(0, -60, "badabb", "Text goes here.", 25);
    
    this.add(this.textMain);
    this.add(this.text1);
    this.add(this.text2);
    this.add(this.text3);

	// Place it out of bounds
	this.x = 300;
	//this.y = 250;
    this.y = -1000;
};

DialogPanel.prototype = Object.create(Phaser.Group.prototype);
DialogPanel.constructor = DialogPanel;

//roll over
DialogPanel.prototype.buttonOver = function(button){
    button.textRef.tint = this.overTint;
};
DialogPanel.prototype.buttonOut = function(button){
    button.textRef.tint = 0xffffff;
};

//
DialogPanel.prototype.play1 = function(button){
    this.endDialog();
};
DialogPanel.prototype.play2 = function(button){
    this.endDialog();
};
DialogPanel.prototype.play3 = function(button){
    this.endDialog();
};

//
DialogPanel.prototype.startDialog = function(diagjsoninput){
    this.visible = true;
    this.y = 250;
};
DialogPanel.prototype.endDialog = function(){
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.maingame.unpauseGame();
    this.visible = false;
    this.y = -1000;
};