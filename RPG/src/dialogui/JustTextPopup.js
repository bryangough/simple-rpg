//***** JustTextPopup ********
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
    this.dialogEngine = dialogEngine;
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(0, 0, "badabb", "Text goes here.", 25);
    this.textMain.tint = 0x00ffff;
    this.add(this.textMain);
    this.x = -1000;
    //for if dialog
    this.dialogData;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay){
    this.x = 0;
    this.textMain.text = texttodisplay;
    this.dialogData = null;
    this.game.input.onDown.add(this.nextPopup, this);
}
JustTextPopup.prototype.showTextFromHandler = function(convoid){
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
}
JustTextPopup.prototype.closePopup = function(){
    this.dialogData = null
    this.x = -1000;
    this.game.input.onDown.remove(this.nextPopup, this);
    
    this.maingame.unpauseGame();
}