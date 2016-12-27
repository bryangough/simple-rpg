var CombatCharacter = function (maingame, jsondata, map)
{
    MovingCharacter.call(this, maingame, jsondata, map);
    
    var actions = this.jsondata.triggers;
    this.weapons = [];
    this.weaponCatagories = [];
    this.numberOfActions = 2;
    this.isCombatCharacter = true;
    
    this.currentSelectedWeapon = null;
    this.hostile = false;
    this.displayNameText = "";
    this.dead = false;
    
    
    this.faction = [];
    
    this.applyCombatActions(actions);
};

CombatCharacter.prototype = Object.create(MovingCharacter.prototype);
CombatCharacter.constructor = CombatCharacter;

CombatCharacter.prototype.applyCombatActions = function(actions)
{
    //this.eventDispatcher.init(actions);
    
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
        }
        else if(action.type=="weaponsInventory")
        {
            var category = null;
            if(action.name!=null)
            {
                if(this.weaponCatagories[action.name]==null)
                    this.weaponCatagories[action.name] = [];
                category = this.weaponCatagories[action.name];
            }
            //
            for(var j=0;j<action.weapons.length;j++)
            {
                var weaponData = this.maingame.getGameData("Weapons",action.weapons[j]);
                if(weaponData!=null && weaponData.triggers!=null)
                {
                    var weapon = new Weapon(weaponData.triggers[0]);
                    this.weapons.push(weapon);
                    if(category!=null)
                    {
                        category.push(weapon);
                    }
                }
            }
        }  
        else if(action.type=="weapon")
        {
            var weapon = new Weapon(action);
            this.weapons.push(weapon);
        }
        /*else if(action.type=="CharacterSpawn")
        {
            this.displayNameText = actions[i].EnemyType;
            
            //console.log(this, this.displayNameText);
            var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);//this should be saved with here somehow
            if(enemy!=null && enemy.triggers!=null)
                this.applyCombatActions(enemy.triggers)
        }*/
        else if(actions[i].type=="CharacterSpawn")
        {   
            this.displayNameText = actions[i].EnemyType;
            this.name = actions[i].EnemyType;
            //
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, actions[i].conditions);
            if( this.eventDispatcher.testConditions(con))
            {
                var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
                if(enemy!=null && enemy.triggers!=null)
                {
                    this.applyCombatActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
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
}
CombatCharacter.prototype.finalSetup = function()     
{
    if(this.currentTile!=null)
        this.setLocationByTile(this.currentTile);
    if(!this.notcreated)
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
    this.shieldhp = 0; //bg
    for(var i=0;i<this.shieldhp;i++)
    {
        hpbar = this.game.make.image(0,0,'gameplayinterface',"combat_actionpoints0001.png");

        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        hpbar.tint = 0xffffff;
        this.shieldbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    for(var i=0;i<this.selfhp;i++)
    {
        hpbar = this.game.make.image(0,0,'gameplayinterface',"combat_actionpoints0001.png");
        hpbar.tint = 0x0000ff;
        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        hpbar.tint = 0xffffff;
        this.healthbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    //console.log(this.maingame.map.scaledto);
    this.healthuigroup.x = -this.width/2;
    this.healthuigroup.y = -this.height;//*this.maingame.map.scaledto;//-this.healthuigroup.height;
    this.healthuigroup.visible = false;
}
CombatCharacter.prototype.boostShield = function(heal)
{
    this.shieldhp += heal;
    if(this.shieldhp>this.shieldhpmax)
        this.shieldhp = this.shieldhpmax;
    this.updateBars();
}
CombatCharacter.prototype.takeDmg = function(dmg)
{
    this.shieldhp -= dmg;
    if(this.shieldhp<0)
    {
        this.selfhp += this.shieldhp;
        this.shieldhp = 0;
    }
    if(this.selfhp<=0)
    {
        //console.log(this,"die");
        this.changeState("die");
        this.eventDispatcher.testAction();
        this.dead = true;
        this.jsondata.destroyed = true;
        this.jsondata.dead = true;
        
        //make tile walkable after death. No need to litter the battlefield.
        this.currentTile.changeWalkable(true);
    }
    else
    {
        this.changeState("hurt");
    }
    this.updateBars();
}

CombatCharacter.prototype.doDead = function()
{
    this.currentTile.changeWalkable(true);
    
    this.eventDispatcher.doAction("OnDeath",this);
}
CombatCharacter.prototype.isAlive = function()
{
    if(this.selfhp<=0)
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
    this.moveToCenter();
    this.healthuigroup.visible = true;
    // stop movement when in combat
    this.changeMoveState("idle");
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
    this.doTint(0xff0000);   
}
CombatCharacter.prototype.tintYellow = function()
{
    this.doTint(0xff0000);
}
CombatCharacter.prototype.tintGreen = function()
{
    this.doTint(0x00ff00);
}
CombatCharacter.prototype.doRemoveTint = function()
{
    this.doTint(0xffffff);
}
CombatCharacter.prototype.doTint = function(myTint)
{
    this.baseImage.tint = myTint;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = myTint;
    }
}
//
//
//roller tints different if hostile
CombatCharacter.prototype.handleOver = function() 
{
    
    if(this.hostile)
    {
        this.tintRed();
    }
    else
    {
        this.tintGreen();
    }
    /*
    if selected weapon
    
    - determin range
    - determin acc
    - show acc
    
    if()
    {
    this.combater.currentSelectedWeapon
    
    
        //
        
    }*/
    
    //console.log(this.jsondata,this.parent.jsondata);
    if(this.maingame.gGameMode.currentState=="combat" && !this.dead)
    {
        this.maingame.gGameMode.mCurrentState.handleOver(this);
    }
       //if(this.maingame.gGameMode.mCurrentState.inputHandler.clickedObject(this);
    if(this.jsondata.displayName && this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this.jsondata.displayName,this.x,this.y);
    }
    //console.log(this,this.parent,this.displayNameText);
    
    if(this.displayNameText!="")
        this.maingame.textUIHandler.showRollover(this.displayNameText,this.x,this.y);
}
CombatCharacter.prototype.handleOut = function() 
{
    this.doRemoveTint();
    if(this.maingame.textUIHandler)
    {
        this.maingame.textUIHandler.hideRollover();
    }
    if(this.maingame.gGameMode.currentState=="combat")
    {
        this.maingame.gGameMode.mCurrentState.handleOut();
    }
}
//get movement range
CombatCharacter.prototype.findWalkable = function(moveIndex) 
{
    return this.map.hexHandler.doFloodFill(moveIndex, this.movementspeed, true);
}
CombatCharacter.prototype.findWalkableFromCurrent = function() 
{
    return this.map.hexHandler.doFloodFill(this.currentTile, this.movementspeed, true);
}
CombatCharacter.prototype.removeCurrentTile = function(path)
{
    for(var k=0;k<path.length;k++)
    {
        for(var i=0;i<path[k].length;i++)
        {
            if(path[k][i] == this.currentTile)
            {
                //remove it
            }
        }
    }
}
CombatCharacter.prototype.Speed = function()     
{
    return 1;
}
CombatCharacter.prototype.shootGun = function(target, weapon, afterAction, action)
{
    this.faceTarget(target);
    
    //do critical fail calcs
    
    this.changeState("shoot");
    this.actionsaftermove = [{func:this.afterShoot, para:[{weapon:weapon, target:target, afterAction:afterAction, action:action}], removeself:false, callee:this, con:null, walkto:false}];
}
CombatCharacter.prototype.doShoot = function()
{
    //animate shot
    
    this.changeState("idle");
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
    this.actionsaftermove = null;
}
CombatCharacter.prototype.afterShoot = function(params)
{
    //console.log(params);
    var target = params.target;
    var weapon = params.weapon;
    var afterAction = params.afterAction;
    var action = params.action;
    var state = params.state;
    
    var distanceTo = this.maingame.map.hexHandler.testRange(target.currentTile, this.currentTile, false)
    var range = weapon.range;
    
    var acc = weapon.acc - (distanceTo/(range * 60))/5;
    //
    if(distanceTo > range * 60)
    {
        acc = 0;
    }
    var hit = true;
    if(Math.random()<acc)
    {
        hit = true;
        //target.takeDmg(weapon.dmg);
    }
    
    var action = new CombatAction(this.game, this.gameref, this, target, "bullet", state, [weapon, acc, hit]);
    //create bullet action
    //
    //
    //pass target, weapon, acc back to combat action to 
    // create a bullet
    /**/
        
    afterAction.func.apply(afterAction.callee,[action]);
}
//

