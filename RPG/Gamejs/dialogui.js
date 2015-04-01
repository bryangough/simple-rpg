//***** DialogHandler ********
//handle conditions?
var DialogHandler = function(game, conversations, actors){
    this.game = game;
    this.conversations = conversations;
    this.actors = actors;
    
    this.currentConvo;
    this.playerActor = this.getPlayerActor();
}
DialogHandler.prototype.startConvo = function(id){
    this.currentConvo = this.getConversationsByID(id);
    
    if(this.currentConvo!=null)
    {
        var currentDiagData = this.buildDialogByID(0);
        
        if(currentDiagData!=null)
        {
            if(currentDiagData.current.MenuText==""&&currentDiagData.current.DialogueText=="")
                currentDiagData = this.buildDialogWithDiag(currentDiagData.links[0]);
            return currentDiagData;
        }
    }
    return null;
}
//for every other types (displaying the npcs text, players text as options, then going straight to next npc text)
//passing in selected link returns next npc
//passing in current displayed return next npc or pc
DialogHandler.prototype.getNextDialog = function(currentDialog){
    if(currentDialog.links.length<=0||currentDialog.links[0]==null)
        return null;
    return this.buildDialogByID(currentDialog.links[0].DestID);
}
//
DialogHandler.prototype.buildDialogByID = function(id){
    var currentDiag = this.getDialogByID(id);

    if(currentDiag==null)
        return null;
    return this.buildDialogWithDiag(currentDiag);
}
//this might change but it seems like a good idea to just pass back in the diag when the link is selected
DialogHandler.prototype.buildDialogWithDiag = function(currentDiag){
    if(currentDiag==null)
        return null;
    var links = [];
    var l = currentDiag.links.length;
    var tempLink
    for(var i=0;i<l;i++)
    {
        //only handle single conversations for now

        var tempLink = this.getDialogByID(currentDiag.links[i].DestID); 
        
        if(tempLink!=null)
        {
            links.push(tempLink);
        }
    }
    var thisactor = this.getActorByID(currentDiag.Actor);//optimize this, save it somewhere
    var diagPackage = {current:currentDiag,links:links, actor:thisactor};    
    return diagPackage;
};
DialogHandler.prototype.getDialogByID = function(id){
    var l = this.currentConvo.DialogueEntries.length;
    for(var i=0;i<l;i++)
    {
        if(this.currentConvo.DialogueEntries[i].ID==id)
            return this.currentConvo.DialogueEntries[i];
    }
    return null;
};

DialogHandler.prototype.getConversationsByID = function(id){
    var l = this.conversations.length;
    for(var i=0;i<l;i++)
    {
        if(this.conversations[i].id==id)
            return this.conversations[i];
    }
    return null;
};
DialogHandler.prototype.getActorByID = function(actorid){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].id==actorid)
            return this.actors[i];
    }
    return null;
};
DialogHandler.prototype.getPlayerActor = function(){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].IsPlayer)
            return this.actors[i];
    }
    return null;
};
/*
- 

*/
//***** DialogPanel ********
var DialogPanel = function(game, maingame, dialogEngine, parent){
	Phaser.Group.call(this, game, parent);

    this.overTint = 0xff5500;
    this.maingame = maingame;
    this.dialogEngine = dialogEngine;

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
DialogPanel.prototype.nextDialog = function(){
    this.dialogData = this.dialogEngine.getNextDialog(this.dialogData);
    if(this.dialogData==null)
        this.endDialog();
    else
       this.setupDialog(); 
}
//
DialogPanel.prototype.setupDialog = function(){    
    this.textMain.text = this.dialogData.actor.Name +": " + this.dialogData.current.DialogueText;
    for(var i=0;i<3;i++)
    {
        if(this.dialogData.current.links[i]!=null)
        {
            this["btnPlay"+(i+1)].visible = true;
            this["btnPlay"+(i+1)].textRef.visible = true;
            this["btnPlay"+(i+1)].textRef.text = (i+1)+". " + this.dialogData.links[i].MenuText;
        }
        else
        {
            this["btnPlay"+(i+1)].visible = false;
            this["btnPlay"+(i+1)].textRef.visible = false;
        }
    }
}
//
DialogPanel.prototype.startDialog = function(id){
    this.dialogData = this.dialogEngine.startConvo(id);
    if(this.dialogData){
        this.visible = true;
        this.y = 250;
        this.setupDialog();
    }
};
DialogPanel.prototype.endDialog = function(){
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.maingame.unpauseGame();
    this.visible = false;
    this.y = -1000;
};
//***** ActionButtons ********
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    //
    this.currentActive;
    //
    this.walk = {up:null,active:null};
    this.setButton(0,0,"walkBtn0001.png","walkBtn0002.png",this.walk,this.dowalk);
    
    this.use = {up:null,active:null};
    this.setButton(71,0,"useBtn0001.png","useBtn0002.png",this.use,this.douse);
    
    this.look = {up:null,active:null};
    this.setButton(142,0,"lookBtn0001.png","lookBtn0002.png",this.look,this.dolook);
    
    this.talk = {up:null,active:null};
    this.setButton(212,0,"talkBtn0001.png","talkBtn0002.png",this.talk,this.dotalk);
    
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent){
    ref.up = this.game.make.sprite(x,y,"dialogui",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"dialogui",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
}
//these also should do something
ActionButtons.prototype.dowalk = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.WALK;
    this.currentActive = this.walk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.douse = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.USE;
    this.currentActive = this.use;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dolook = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.LOOK;
    this.currentActive = this.look;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dotalk = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.TALK;
    this.currentActive = this.talk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.enableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = false;
    ref.active.visible = true;
}
ActionButtons.prototype.disableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = true;
    ref.active.visible = false;    
}
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
//
//***** BarkTextHandler ********
BarkTextHandler = function(game,maingame){
    this.pool = new BasicObjectPool();
    this.game = game;
    this.maingame=maingame;
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.returnBarkToPool = function(over){
}
//map change
BarkTextHandler.prototype.cleanupAllBarks = function(){
}

//***** BarkText ********
//
BarkText = function(){
    this.textfield;//
    this.timer;//
    this.over;
    this.inUse = false;
}
BarkText.prototype.step = function(elapseTime){
}
BarkText.prototype.reset = function(elapseTime){
}

//***** BasicObjectPool ********
// simple object pool to handle barks and other little things
BasicObjectPool = function([])
{
    this.openArray = [];
    this.allObjectsArray = [];
    
}
BasicObjectPool.prototype.getObject = function(){
    if(this.openArray.length>0)
        return this.openArray.pop();
    //else{
        //var newObject = 
        //this.openArray.push(newObject);
        //this.allObjectsArray.push(newObject);
        return newObject;
    //}
    return null;
}
BasicObjectPool.prototype.addObject = function(returnedobject){
    this.openArray.push(returnedobject);
    this.allObjectsArray.push(returnedobject);
}
BasicObjectPool.prototype.returnObject = function(returnedobject){
    returnedobject.reset();
    this.openArray.push(returnedobject);
}
BasicObjectPool.prototype.destroyself = function(returnedobject){
    this.allObjectsArray = [];
    this.openArray = [];
}
//*****  ********