//***** ActionButtons ********
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
    //
    this.currentActive;
    //
    
    var width = 90
    
    var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    //shadow.width = 90 * 4;
    //shadow.height = 40;
    shadow.x = -20;
    shadow.y = 20;
    
    /*this.magic = {up:null,active:null};
    this.setButton(width * 4, 0,"actionButton0001.png", "actionButton0003.png", this.magic, this.domagic, "actionbuttonIcons0008.png");*/
    
    this.talk = {up:null,active:null};
    this.setButton(width * 3, 0,"actionButton0001.png", "actionButton0003.png", this.talk, this.dotalk, "actionbuttonIcons0005.png");
    
        
    this.look = {up:null,active:null};
    this.setButton(width * 2, 0,"actionButton0001.png", "actionButton0003.png", this.look, this.dolook, "actionbuttonIcons0007.png");
    
        
    this.use = {up:null,active:null};
    this.setButton(width * 1, 0,"actionButton0001.png", "actionButton0003.png", this.use, this.douse, "actionbuttonIcons0006.png");
    
    this.walk = {up:null,active:null};
    this.setButton(width * 0, 0,"actionButton0001.png", "actionButton0003.png", this.walk, this.dowalk, "actionbuttonIcons0001.png");
    
    
    var offset = 35;
    width = 94.7;
    this.settings = {up:null,active:null};
    this.setButton(this.game.world.width - width * 1 - offset, 0,"actionButtonSqr_end0001.png", "actionButtonSqr_end0003.png", this.settings, this.returnToMenu, "actionbuttonIcons0003.png", true);
    //this.settings.up.tint = 0x00ffff
    
    this.combat = {up:null,active:null};
    this.setButton(this.game.world.width - width * 2 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.combat, this.pressedCombat, "actionbuttonIcons0002.png", true);
    this.gameref.gGameMode.changeState.add(this.checkCombat, this);
    
    /*this.log = {up:null,active:null};
    this.setButton(this.game.world.width - width * 3 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.log, this.doLog, "actionbuttonIcons0009.png", true);
    this.log.up.tint = 0x00ffff*/
    
    this.inv = {up:null,active:null};
    this.setButton(this.game.world.width - width * 3 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.inv, this.doInv, "actionbuttonIcons0004.png", true);
    this.gameref.inventory.changeState.add(this.checkInv, this);
    this.gameref.inventory.invSelected.add(this.invSelected, this);
    

    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.returnToMenu = function() 
{
    this.game.state.start('MainMenu');
}
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent, icon, toggle){
    
    ref.up = this.game.make.sprite(x,y,"gameplayinterface",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.input.priorityID = 10; 
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"gameplayinterface",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
    
    if(toggle)
    {
        ref.active.events.onInputDown.add(clickevent, this);
        ref.active.inputEnabled = true;
        ref.active.input.priorityID = 10; 
    }
    if(icon!=undefined)
    {
        var iconImage = this.game.make.sprite(x+20,y+10,"gameplayinterface",icon);
        this.add(iconImage);
    }
    
}
//these also should do something
ActionButtons.prototype.doInv = function(touchedSprite, pointer){
    pointer.active = false;
    this.gameref.inventory.toggle();
}
ActionButtons.prototype.checkInv = function(state){
    if(state)
    {
        this.enableButton(this.inv);
    }
    else
    {
        this.disableButton(this.inv);
    }
}
ActionButtons.prototype.invSelected = function(){
    this.clearActive();
}

//open settings state
ActionButtons.prototype.doSettings = function(touchedSprite, pointer){
    pointer.active = false;
}

ActionButtons.prototype.doCombat = function(touchedSprite, pointer){
    pointer.active = false;
    this.gameref.toggleCombat();
}
ActionButtons.prototype.checkCombat = function(stateMachine,currentState){

    console.log(currentState)
    if(currentState=="combat")
    {
        this.enableButton(this.combat);    
        
    }
    else
    {
        this.disableButton(this.combat);
    }
    
}

ActionButtons.prototype.pressedCombat = function()
{
    this.gameref.toggleCombat();
    //this.gameref.textUIHandler.showJustText("Your not up for a fight.\nBetter to use your wits.");
}


ActionButtons.prototype.doLog = function(touchedSprite, pointer){
    pointer.active = false;
}



ActionButtons.prototype.clearActive = function()
{
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
/*ActionButtons.prototype.domagic = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.MAGIC;
    this.currentActive = this.magic;
    this.enableButton(this.currentActive);
}*/
ActionButtons.prototype.dowalk = function(touchedSprite, pointer){
    if(pointer)
        pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.WALK;
}
ActionButtons.prototype.douse = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.TOUCH;
}
ActionButtons.prototype.dolook = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.LOOK;
}
ActionButtons.prototype.dotalk = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.TALK;    
}
ActionButtons.prototype.disableAll = function(){
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
ActionButtons.prototype.checkRefresh = function(){
    
    
    
    if(GlobalEvents.currentAction == GlobalEvents.ITEM)
    {
        this.disableAll();
    }
    if(this.currentActive)
        this.disableButton(this.currentActive);
    if(GlobalEvents.currentAction == GlobalEvents.TALK)
    {
        this.currentActive = this.talk;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.LOOK)
    {
        this.currentActive = this.look;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.WALK)
    {
        this.currentActive = this.walk;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.TOUCH)
    {
        this.currentActive = this.use;
        this.enableButton(this.currentActive);
    }
}
//
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