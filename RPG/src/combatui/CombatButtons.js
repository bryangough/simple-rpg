//***** CombatButtons ********
//Player select able buttons
CombatButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
    //
    this.currentActive;
    this.buttons = [];
    //
    // weapon swap ( 2 choices )
    //
    // 4 based on weapon (1 group invisible)
    // 4 buff / actions
    
    //points number across top
    //end turn
    
    
   /* this.walk = {up:null,active:null};
    this.setButton(0,0,"genericBtn0001.png","genericBtn0002.png",this.walk,this.dowalk);
    
    this.use = {up:null,active:null};
    this.setButton(71,0,"genericBtn0001.png","genericBtn0002.png",this.use,this.dowalk);
    
    this.look = {up:null,active:null};
    this.setButton(142,0,"genericBtn0001.png","genericBtn0002.png",this.look,this.dowalk);
    
    this.talk = {up:null,active:null};
    this.setButton(212,0,"genericBtn0001.png","genericBtn0002.png",this.talk,this.dowalk);
    
    this.inv = {up:null,active:null};
    this.setButton(300,0,"genericBtn0001.png","genericBtn0002.png",this.inv,this.dowalk);
    */
    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
    //this.dowalk();
    
    
}
CombatButtons.prototype = Object.create(Phaser.Group.prototype);
CombatButtons.constructor = CombatButtons;
CombatButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent){
    ref.up = this.game.make.sprite(x,y,"dialogui",imageup);
    
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.input.priorityID = 10; 
    ref.up.events.onInputDown.add(clickevent, this);
    
    //console.log(ref.up);
    this.buttons[ref.up] = ref;
    
    ref.active = this.game.make.sprite(x,y,"dialogui",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
}
CombatButtons.prototype.dowalk = function(touchedSprite, pointer){
    //console.log(touchedSprite, pointer);
    if(pointer!=undefined)
        pointer.active = false;  
    
    
    this.disableButton(this.currentActive);
    this.currentActive = this.buttons[touchedSprite];
    this.enableButton(this.currentActive);
    
    GlobalEvents.currentacion = GlobalEvents.COMBATSELECT;
}



CombatButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.disableAll();
}
//
CombatButtons.prototype.enableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = false;
    ref.active.visible = true;
}
CombatButtons.prototype.disableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = true;
    ref.active.visible = false;    
}