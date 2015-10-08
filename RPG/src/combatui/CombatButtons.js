//***** CombatButtons ********
//Player select able buttons
CombatButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
    //
    this.currentActive;
    this.activeToggle;
    this.buttons = [];
    //
    // weapon swap ( 2 choices )
    //
    // 4 based on weapon (1 group invisible)
    // 4 buff / actions
    
    //points number across top
    //end turn

    this.player = this.gameref.map.playerCharacter;
      
    this.range = null;
    this.melee = null;
    this.buffs = null;

    if(this.player.weaponCatagories)
    {
        this.range = this.player.weaponCatagories["Range"];
        this.melee = this.player.weaponCatagories["Melee"];
        this.buffs = this.player.weaponCatagories["Buffs"];
        
        this.bargroups = [];
        this.bargrouppowers = [];
        //
        
        var iwidth = 60;
        
        var attacksx = 100;
        var attacksy = 50;
        
        var buffx = 300;
        
        this.bargroups["Range"] = this.game.add.group();
        this.bargrouppowers["Range"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.range[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+i*iwidth,attacksy,"gameplayinterface","combat_power_empty.png");
                this.bargroups["Range"].addChild(s);
            }
            else
            {
               this.bargrouppowers["Range"][i] = {up:null,active:null};
                this.setButton(attacksx+i*iwidth,attacksy,"combat_power_attack.png","combat_power_attack.png", this.bargrouppowers["Range"][i], this.doPower, this.bargroups["Range"]); 
            }
        }
        this.addChild(this.bargroups["Range"]);
        //
        this.bargroups["Melee"] = this.game.add.group();
        this.addChild(this.bargroups["Melee"]);
        this.bargrouppowers["Melee"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.melee[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+i*iwidth,attacksy-100,"gameplayinterface","combat_power_empty.png");
                this.bargroups["Melee"].addChild(s);
            }
            else
            {
               this.bargrouppowers["Melee"][i] = {up:null,active:null};
                this.setButton(attacksx+i*iwidth,attacksy-100,"combat_power_attack.png","combat_power_attack.png", this.bargrouppowers["Melee"][i], this.doPower, this.bargroups["Melee"]); 
            }
        }
        //
        this.bargroups["Buffs"] = this.game.add.group();
        this.addChild(this.bargroups["Buffs"]);
        this.bargrouppowers["Buffs"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.buffs[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+buffx+i*iwidth,attacksy,"gameplayinterface","combat_power_empty.png");
                this.bargroups["Buffs"].addChild(s);
            }
            else
            {
               this.bargrouppowers["Buffs"][i] = {up:null,active:null};
                this.setButton(attacksx+buffx+i*iwidth,attacksy,"combat_power_buff.png","combat_power_buff.png", this.bargrouppowers["Buffs"][i], this.doPower, this.bargroups["Buffs"]); 
            }
        }
        //
    }    
    this.toggleMelee = {up:null,active:null};
    this.setButton(5, 24, "combat_toggle_melee.png","combat_toggle_melee.png", this.toggleMelee, this.doMelee, this);
    
    this.toggleRange = {up:null,active:null};
    this.setButton(5, 60, "combat_toggle_range.png","combat_toggle_range.png", this.toggleRange, this.doRange, this);
    
    this.endTurn = {up:null, active:null};
    this.setButton(900-iwidth*3, attacksy,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.endTurn, this.endTurnPress, this);

    //this.doRange();
    
    
    
    
}
CombatButtons.prototype = Object.create(Phaser.Group.prototype);
CombatButtons.constructor = CombatButtons;
CombatButtons.prototype.setButton = function(x, y, imageup,imageactive, ref, clickevent, group){
    
    ref.up = this.game.make.sprite(x,y,"gameplayinterface",imageup);
    console.log(imageup, group);
    group.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.input.priorityID = 10; 
    ref.up.events.onInputDown.add(clickevent, this);
    
    this.buttons[ref.up] = ref;
    
    ref.active = this.game.make.sprite(x,y,"gameplayinterface",imageactive);
    ref.active.visible = false;
    group.add(ref.active);
    
    
}
CombatButtons.prototype.endTurnPress = function(touchedSprite, pointer){
    
}
//Toggle
CombatButtons.prototype.doMelee = function(touchedSprite, pointer){
    console.log("domelee",this.activeToggle);
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.activeToggle);
    this.activeToggle = this.buttons[touchedSprite];
    this.enableButton(this.activeToggle);
    
    this.bargroups["Range"].visible = false;
    this.bargroups["Melee"].visible = true;
}
CombatButtons.prototype.doRange = function(touchedSprite, pointer){
    console.log("range",this.activeToggle);
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.activeToggle);
    this.activeToggle = this.buttons[touchedSprite];
    this.enableButton(this.activeToggle);
    
    this.bargroups["Range"].visible = true;
    this.bargroups["Melee"].visible = false;
}
/*CombatButtons.prototype.switchWeaponLoadout = function()
{
    //
}*/
//

CombatButtons.prototype.doPower = function(touchedSprite, pointer){
    //touching another player with weapon does attack
    //if self buff (heal) just clicking?
    
    //this.player.currentSelectedWeapon
}
CombatButtons.prototype.dowalk = function(touchedSprite, pointer){
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.currentActive);
    this.currentActive = this.buttons[touchedSprite];
    this.enableButton(this.currentActive);
    
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
}


//
CombatButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        this.disableAll();
}
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