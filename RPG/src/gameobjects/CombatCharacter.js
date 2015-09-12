//
//show hp
//
var CombatCharacter = function (maingame, jsondata, map)
{
    MovingCharacter.call(this, maingame, jsondata, map);
    
    var actions = this.jsondata.triggers;
    this.weapons = [];
    this.numberOfActions = 2;
    
    for(var i=0;i<actions.length;i++)
    {
        var action = actions[i];
        
        if(action.type=="combatAttributes")
        {
            this.movementspeed = action.movementspeed;
            this.shieldhpmax = this.shieldhp = action.shieldhp;
            this.selfhpmax = this.selfhp = action.selfhp;
            this.attackable = action.attackable;
            this.hostile = action.hostile;
            //start hostile
        }
        else if(action.type=="weaponsInventory")
        {
            for(var j=0;j<action.weapons.length;j++)
            {
                var weapon = new Weapon(action.weapons[j]);
                this.weapons.push(weapon);
            }
        }  
        else if(action.type=="powerBoosts")
        {
            //attacks / actions
            /*
            - move
            - use item
            - own attacks (with stats)
            - hit
            */
            
            //boost and bonuses
            /*
            - bad eyesight -  50% chance to miss
            
            
            */
            /*
            
            - possible drops?
            - 
            
            */
        }   
    }
};

CombatCharacter.prototype = Object.create(MovingCharacter.prototype);
CombatCharacter.constructor = CombatCharacter;

// handle 1 step of combat
// if has 2 then ca
CombatCharacter.prototype.handleCombat = function()     
{
    if(this.IsPlayer)
    {
        //activate ui   
    }
    else
    {
        
      
        
    }
    //return 
}
CombatCharacter.prototype.finalSetup = function()     
{
    this.setLocationByTile(this.currentTile);
    this.setupHealthBar();
}

//
CombatCharacter.prototype.setupHealthBar = function()
{
    this.healthuigroup = this.game.add.group();
    this.shieldbar = [];
    this.healthbar = [];
    
    this.addChild(this.healthuigroup);
    
    
    
    var hpbar;
    var rowcount = 0;
    var count = 0;
    for(var i=0;i<this.shieldhp;i++)
    {
        hpbar = this.game.make.image(0,0,"tiles2","flowerBlue.png");

        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        
        this.shieldbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    for(var i=0;i<this.selfhp;i++)
    {
        hpbar = this.game.make.image(0,0,"tiles2","flowerRed.png");
        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        this.healthbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    this.healthuigroup.x = -this.width;
    this.healthuigroup.y = -this.height-this.healthuigroup.height;
}
CombatCharacter.prototype.takeDmg = function(dmg)
{
    this.shieldhp -= dmg;
    if(this.shieldhp<0)
    {
        this.selfhp += this.shieldhp;
        this.shieldhp = 0;
    }
    if(this.selfhp<0)
    {
        console.log(this,"die");
    }
    this.updateBars();
}
CombatCharacter.prototype.isAlive = function()
{
    if(this.selfhp<0)
        return false;
    return true;
}
CombatCharacter.prototype.updateBars = function()
{
    for(var i=0;i<this.shieldbar.length;i++)
    {
        if(i>=this.shieldhp)
        {
            this.shieldbar[i].tint = 0x0000f0;
        }
        else
        {
            this.shieldbar[i].tint = 0xffffff;
        }
    }
    for(var i=0;i<this.healthbar.length;i++)
    {
        if(i>=this.selfhp)
        {
            this.healthbar[i].tint = 0x0000f0;
        }
        else
        {
            this.healthbar[i].tint = 0xffffff;
        }
    }
}
CombatCharacter.prototype.startCombat = function()
{
    //show health bar
    this.healthuigroup.visible = true;
}
CombatCharacter.prototype.endCombat = function()
{
    this.healthuigroup.visible = false;
    //hide health bar
    //give back control?
}
//this.overtint
//this.removetint
CombatCharacter.prototype.tintRed = function()
{
    this.tint = 0xff0000;
}
CombatCharacter.prototype.tintYellow = function()
{
    this.tint = 0xff0000;
}
CombatCharacter.prototype.tintGreen = function()
{
    this.tint = 0x00ff00;
}
CombatCharacter.prototype.doRemoveTint = function()
{
    this.tint = 0xffffff;
}
//
MovingCharacter.prototype.fireGun = function()
{
    this.changeState("use");
}
//
//roller tints different if hostile
CombatCharacter.prototype.handleOver = function() 
{
    if(this.hostile)
    {
        this.tint = 0xff0000;
    }
    else
    {
        this.tint = 0x00ff00;
    }
    if(this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this);
    }
}
CombatCharacter.prototype.handleOut = function() 
{
    this.tint = 0xffffff;
    if(this.maingame.textUIHandler)
    {
        this.maingame.textUIHandler.hideRollover();
    }
}
//get movement range
CombatCharacter.prototype.findWalkable = function(moveIndex) 
{
    return this.map.hexHandler.doFloodFill(moveIndex,this.movementspeed);
}
CombatCharacter.prototype.findWalkableFromCurrent = function() 
{
    return this.map.hexHandler.doFloodFill(this.currentTile,this.movementspeed);
}
CombatCharacter.prototype.Speed = function()     
{
    return 1;
}