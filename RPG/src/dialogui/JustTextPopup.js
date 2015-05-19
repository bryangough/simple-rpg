//***** JustTextPopup ********
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
//
    this.bg = this.game.make.image(0,0,"actors","textBox.png");
    this.add(this.bg);
//
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(10, 10, "badabb", "Text goes here.", 25);
    this.textMain.tint = 0x00ffff;
    this.textMain.wordWrap = true;
    this.textMain.wordWrapWidth = 300;
    this.add(this.textMain);
//
    this.visible = false;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay){
    
    this.x = this.game.width/2-this.width/2;
    this.y = this.game.height/2-this.height/2;

    
    this.textMain.text = texttodisplay;
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