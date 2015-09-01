//***** ActionButtons ********
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
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
    
    this.inv = {up:null,active:null};
    this.setButton(300,0,"invBtn0001.png","invBtn0002.png",this.inv,this.doInv);
    
    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent){
    ref.up = this.game.make.sprite(x,y,"dialogui",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.input.priorityID = 10; 
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"dialogui",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
}
//these also should do something
ActionButtons.prototype.doInv = function(touchedSprite, pointer){
    pointer.active = false;
    if(this.gameref.inventory.visible==true)
    {
        this.gameref.inventory.visible = false;
        
        //this.disableButton(this.inv);
    }
    else
    {
        this.gameref.inventory.visible = true;
        //this.enableButton(this.inv);
    }
}
ActionButtons.prototype.dowalk = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.WALK;
    this.currentActive = this.walk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.douse = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.TOUCH;
    this.currentActive = this.use;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dolook = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.LOOK;
    this.currentActive = this.look;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dotalk = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.TALK;
    this.currentActive = this.talk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.disableAll = function(){
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
ActionButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.disableAll();
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