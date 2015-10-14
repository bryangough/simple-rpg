var TextUIHandler = function (game, x, y, gameref, parent)
{
    //Phaser.Group.call(this, game, parent);
    this.gameref = gameref;
    this.game = game;
    
    this.justTextPopup;//Single text display
    this.barkHandler;
    this.activeButtons;//Action Buttons ui

    this.rollovertext;
    
    this.mapData;
}
//TextUIHandler.prototype = Object.create(Phaser.Group.prototype);
//TextUIHandler.constructor = TextUIHandler;

TextUIHandler.prototype.setup = function(mapData, uiGroup, dialoghandler)
{
    this.mapData = mapData;
    this.uiGroup = uiGroup;
    
        //    
    this.justTextPopup = new JustTextPopup(this.game,this.gameref,this.dialoghandler);
    this.game.add.existing(this.justTextPopup);
    this.uiGroup.add(this.justTextPopup);

    this.barkHandler = new BarkTextHandler(this.game,this.gameref);
    this.game.add.existing(this.barkHandler);
    this.uiGroup.add(this.barkHandler);

    this.rollovertext = this.game.make.bitmapText(0, 0, "simplefont", "Text goes here.", 25);
    this.rollovertext.visible = false;
    this.game.add.existing(this.rollovertext);
    this.uiGroup.add(this.rollovertext);
}

//this needs to be controlled by a queue?
//if 2 are show at once, they are displayed 1 after the other
TextUIHandler.prototype.showDeadText = function(textDisplay)
{
    this.justTextPopup.showText(textDisplay,0xff0000);
},
TextUIHandler.prototype.showJustText = function(textDisplay)
{
    this.justTextPopup.showText(textDisplay);
    GlobalEvents.tempDisableEvents();
    this.gameref.pauseGame();
},
TextUIHandler.prototype.showBark = function(object,text)
{
    this.barkHandler.barkOverObject(object,text);
},
/*TextUIHandler.prototype.showJustTextDialog = function(convid)
{
    //console.log("showJustTextDialog");
    this.justTextPopup.showTextFromHandler(convid);
    GlobalEvents.tempDisableEvents();
    this.pauseGame();
},*/
TextUIHandler.prototype.showRollover = function(text, x, y)
{
    if(!this.rollovertext)
        return;
    this.rollovertext.text = text;
    this.rollovertext.anchor.x = 0.5;
    this.rollovertext.visible = true;

    console.log(text,x,y);
    this.rollovertext.x = (x + this.gameref.map.mapGroup.x) * this.gameref.map.scaledto;
    this.rollovertext.y = (y + this.gameref.map.mapGroup.y) * this.gameref.map.scaledto;
    
    //if display is off the screen
    if(this.rollovertext.y<0){
        this.rollovertext.y = y + this.gameref.map.mapGroup.y;// + object.height;// + object.height;
    }
    this.rollovertext.tint = 0x9999ff;
}
TextUIHandler.prototype.hideRollover = function()
{
    this.rollovertext.visible = false;
}
TextUIHandler.prototype.update = function(elapsedTime)
{
    this.barkHandler.step(elapsedTime);
}