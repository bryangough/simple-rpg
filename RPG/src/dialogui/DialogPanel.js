//bg
//button1,button2,button3
//text font

//***** DialogPanel ********
var DialogPanel = function(game, maingame, dialogEngine, parent, state){
	Phaser.Group.call(this, game);

    this.state = state;
    this.overTint = 0xff5500;
    this.maingame = maingame;
    this.dialogEngine = dialogEngine;
}
DialogPanel.prototype = Object.create(Phaser.Group.prototype);
DialogPanel.constructor = DialogPanel;


//
DialogPanel.prototype.setup = function(button){   
    
    //
    this.setupBG("dialogui","dialog_main.png");
    //
    this.btnPlay1 = this.setupButton(36.95, -22.4, 'dialogui', this.play1,'dialog_10002.png', 'dialog_10001.png', 'dialog_10001.png','dialog_10002.png');
    this.btnPlay2 = this.setupButton(37.4, 25.25, 'dialogui', this.play2,'dialog_20002.png', 'dialog_20001.png', 'dialog_20001.png','dialog_20002.png');    
    this.btnPlay3 = this.setupButton(35.95, 45.8, 'dialogui', this.play3,'dialog_30002.png', 'dialog_30001.png', 'dialog_30001.png','dialog_30002.png');
    //
    this.textMain = this.setupText(0, -60, "badabb", "Text goes here.", 25); 
    this.btnPlay1.textRef = this.setupText(95, -10, "badabb", "1. ", 25);
    this.btnPlay2.textRef = this.setupText(95, 35, "badabb", "2. ", 25);
    this.btnPlay3.textRef = this.setupText(95, 82, "badabb", "3. ", 25);
    
    this.portrait1 = null;
    this.portrait2 = null;
	// Place it out of bounds (?)
	this.x = 300;
    this.y = -1000;
};
//
DialogPanel.prototype.setupPortrait = function(x,y,spritesheet,sprite)
{    
    var portrait = this.game.make.sprite(0,0,spritesheet,sprite);
    this.add(portrait);
    return portrait;
}
//
DialogPanel.prototype.setupBG = function(spritesheet,sprite)
{    
    var bg = this.game.make.image(0,0,spritesheet,sprite);
    this.add(bg);
}
//
DialogPanel.prototype.setupButton = function(x,y,spritesheet, callback, overFrame, outFrame, downFrame, upFrame)
{    
    var newBtn = this.game.make.button(x,y,spritesheet, callback, this, overFrame, outFrame, downFrame, upFrame);
    this.add(newBtn);
    //
    newBtn.events.onInputOver.add(this.buttonOver, this);
    newBtn.events.onInputOut.add(this.buttonOut, this);
    newBtn.forceOut = true;
    //
    //this.btnPlay2.input.pixelPerfectOver = true;
    newBtn.input.useHandCursor = true;
    return newBtn;
}
//
DialogPanel.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.make.bitmapText(x, y, font, text, size); 
    this.add(newtext);
    return newtext;
}

/*
Button events
*/
DialogPanel.prototype.buttonOver = function(button){
    console.log("over");
    button.textRef.tint = this.overTint;
};
DialogPanel.prototype.buttonOut = function(button){
    console.log("out");
    button.textRef.tint = 0xffffff;
};

//how to handle just next
DialogPanel.prototype.play1 = function(button){
    this.dialogData = this.dialogData.links[0];
    this.nextDialog();
};
DialogPanel.prototype.play2 = function(button){
    this.dialogData = this.dialogData.links[1];
    this.nextDialog();
};
DialogPanel.prototype.play3 = function(button){
    this.dialogData = this.dialogData.links[2];
    this.nextDialog();
};
DialogPanel.prototype.justDoNext = function(){
    if(this.dialogData==null)
        this.endDialog();
    else if(this.dialogData.links.length==0){
        this.dialogData = null;
        this.endDialog();
    }
    else{
        this.dialogData = this.dialogData.links[0];
        this.nextDialog();
    }
};

//
DialogPanel.prototype.nextDialog = function(){
    this.dialogData = this.dialogEngine.getNextDialog(this.dialogData);
    if(this.dialogData==null)
        this.endDialog();
    else
       this.setupDialog(); 
}
//
DialogPanel.prototype.setupDialog = function(){    
    if(this.dialogData==null)
    {
        console.log("dialog data not set");
        return;
    }
    this.textMain.text = this.dialogData.actor.json.Name +": " + this.dialogData.current.DialogueText;
    
    if(this.portrait1==null)
        this.portrait1 = this.setupPortrait(0,0,"actors",this.dialogData.actor.json.Pictures+".png");
    else if(this.portrait1.frameName != this.dialogData.actor.json.Pictures)
        this.portrait1.frameName = this.dialogData.actor.json.Pictures+".png";
    
    //if links are players do normal
    //else can click anywhere?
    if(this.dialogData.links.length>1 && this.dialogData.links[0].Actor==this.dialogEngine.playerActor.id)
    {
        for(var i=0;i<3;i++)
        {
            if(this.dialogData.links[i]!=null && this.dialogData.links[i].Actor==this.dialogEngine.playerActor.id)
            {
                this["btnPlay"+(i+1)].visible = true;
                this["btnPlay"+(i+1)].textRef.visible = true;
                this["btnPlay"+(i+1)].textRef.text = (i+1)+". " + this.dialogData.links[i].DialogueText;
                this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
            }
            else
            {
                this["btnPlay"+(i+1)].visible = false;
                this["btnPlay"+(i+1)].textRef.visible = false;
                this["btnPlay"+(i+1)].textRef.text = "";
                this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
            }
        }
        this.game.input.onDown.remove(this.justDoNext, this); 
    }
    else
    {
        this.hideButtons();
        this.game.input.onDown.add(this.justDoNext, this); 
    }
}
//
DialogPanel.prototype.hideButtons = function(){
    for(var i=0;i<3;i++){
        this["btnPlay"+(i+1)].visible = false;
        this["btnPlay"+(i+1)].textRef.visible = false;
        this["btnPlay"+(i+1)].textRef.text = "";
        this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
    }
}
//
DialogPanel.prototype.startDialog = function(id){
    this.dialogData = this.dialogEngine.startConvo(id);
    console.log("start Dialog",id);
    if(this.dialogData){
        this.visible = true;
        this.y = 250;
        this.setupDialog();
    }
    else
    {
        console.log("dialog data not found");
    }
};
DialogPanel.prototype.endDialog = function(){
    //this.btnPlay1.changeStateFrame.apply(this.btnPlay1,['Up']);
    //this.btnPlay2.frame = 0;
    //this.btnPlay3.frame = 0;
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.state.exitDialog();
    this.visible = false;
    this.y = -1000;
};


