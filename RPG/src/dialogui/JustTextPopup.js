//***** JustTextPopup ********
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
//
    //this.bg = this.game.make.image(0,0,"actors","textBox.png");
    //this.add(this.bg);
    var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    this.add(shadow);
    shadow.width = 900;
    shadow.height = 600;
    //shadow.x = -200;
    //shadow.y = -100;
//
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(10, 10, "simplefont", "Text goes here.", 35);
    //this.textMain.tint = 0x00ffff;
    this.textMain.wordWrap = true;
    this.textMain.wordWrapWidth = 300;
    this.add(this.textMain);
//
    this.visible = false;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay, tint){
    
    this.textMain.text = texttodisplay;
    
    if(tint)
        this.textMain.tint = tint;
    else
        this.textMain.tint = 0xffffff;
    
    this.textMain.x = this.game.width/2-this.textMain.width/2;
    this.textMain.y = this.game.height/2-this.textMain.height/2;

    //this.dialogData = null;
    this.visible = true;
    this.game.input.onDown.add(this.closePopup, this);
}
/*JustTextPopup.prototype.showTextFromHandler = function(convoid){
    this.dialogData = this.dialogEngine.startConvo(convoid);
    if(this.dialogData){
        this.visible = true;
        this.x = 0;
        this.textMain.text = this.dialogData.current.DialogueText;
        this.game.input.onDown.add(this.nextPopup, this);
    }
}
JustTextPopup.prototype.nextPopup = function(){
    if(this.dialogData)
        this.dialogData = this.dialogEngine.getNextDialog(this.dialogData.current);
    if(this.dialogData==null)
    {
        this.closePopup();
        return;
    }
    this.textMain.text = this.dialogData.current.DialogueText;
}*/
JustTextPopup.prototype.closePopup = function(){
    //this.dialogData = null
    //this.x = -1000;
    this.visible = false;
    this.game.input.onDown.remove(this.closePopup, this);
    
    this.maingame.unpauseGame();
}