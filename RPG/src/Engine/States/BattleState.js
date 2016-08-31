// start combat
// remove normal ui

// player decides
// player action
// ai decides
// ai action
//
//
//
BattleState = function (statemachine, game, gameref) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.inputHandler = new InputHandlerBattle(this.game, this.gameref);
    this.enemyRollover = new EnemyTargetRollOver(this.game, this.gameref, this);
    
    this.mActions = [];//actions
    this.mEntities = [];//entitys
    this.mBattleStates = new StateMachine();
    
    this.mBattleStates.add("tick", new BattleTick(this.mBattleStates, this));
    this.mBattleStates.add("execute", new BattleExecute(this.mBattleStates));
    
    
    this.activeButtons = new CombatButtons(this.game, this.gameref);
    this.activeButtons.x = 50;
    this.activeButtons.y = 430;
    this.game.add.existing(this.activeButtons);
    this.gameref.uiGroup.add(this.activeButtons);
    this.activeButtons.visible = false;
    //
    this.iteractor = -1;
    //
}
BattleState.prototype = Object.create(EmptyState.prototype);
BattleState.constructor = BattleState;
//
BattleState.prototype.init = function(map) 
{
}
//
BattleState.prototype.handleOver = function(combat) 
{
    if(!this.gameref.map.playerCharacter.currentSelectedWeapon)
    {
        this.handleOut();
        return;
    }
    if(combat.hostile)
    {
        //check line of site
        //do acc check
        var hasLineOfSite = this.gameref.map.hexHandler.lineOfSite(combat.currentTile, this.gameref.map.playerCharacter.currentTile)
        if(!hasLineOfSite)
        {
            this.enemyRollover.showText(combat.x, combat.y, "NO LOS");    
            return;
        }
        
        var distanceTo = this.gameref.map.hexHandler.testRange(combat.currentTile, this.gameref.map.playerCharacter.currentTile, false)
        var range = this.gameref.map.playerCharacter.currentSelectedWeapon.range;
        if(distanceTo > range * 60)
        {
            this.enemyRollover.showText(combat.x, combat.y, "Out of range");    
            return;
        }
        var acc = this.gameref.map.playerCharacter.currentSelectedWeapon.acc - (distanceTo/(range * 60))/5;
        acc *= 100;
        this.enemyRollover.showText(combat.x, combat.y, "Chance to hit: " + acc.toFixed(0) + "%");    
    }
    else
    {
        this.enemyRollover.showText(combat.x, combat.y, "Civilian.");
    }
    
}
BattleState.prototype.handleOut = function() 
{
    this.enemyRollover.visible = false;
}
//
BattleState.prototype.SortByTime = function(a,b)
{
    return a.TimeRemaining() > b.TimeRemaining()
}
BattleState.prototype.update = function(elapsedTime) 
{
    this.mBattleStates.update(elapsedTime);    
}
BattleState.prototype.render = function() 
{
    this.mBattleStates.render();
}
BattleState.prototype.getActiveCombater = function()
{
    this.mEntities[this.iteractor];
}
BattleState.prototype.onEnter = function(params) 
{
    this.activeButtons.visible = true;
    this.inputHandler.turnOn();
 
    this.mEntities = params.entities;
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    this.mBattleStates.change("tick");
 
    this.mEntities = params.entities;
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        //for(var j=0;j<2;j++)//each player will have 2 actions?
        //{
            if(e.IsPlayer)
            {
                var action = new PlayerDecide(this.game, this.gameref, e,  e.Speed(), this);
                this.mActions.push(action);
            }
            else
            {
                var action = new AIDecide(this.game, this.gameref, e, e.Speed(), this);
                this.mActions.push(action);
            }
        //}
    }
    //
    //Sort(this.mActions, this.SortByTime);
    //
}
BattleState.prototype.removeTopAction = function()
{
    this.mActions.pop();
}
BattleState.prototype.addToActionsRear = function(val)
{
    this.mActions.unshift(val);
    this.mBattleStates.change("tick");
}
BattleState.prototype.addToActionsFront = function(val)
{
    this.mActions.push(val);
    this.mBattleStates.change("tick");
}
BattleState.prototype.moveOn = function()
{
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
    this.mBattleStates.change("tick");
}
BattleState.prototype.onExit = function() 
{
    this.mActions = [];//flush actions
    
    this.activeButtons.visible = false;
    this.inputHandler.turnOff();
    
    this.inputHandler.hideInputAreas();
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].endCombat();
    }
    
    if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
    {
        GlobalEvents.currentAction = GlobalEvents.WALK;
    }
}
BattleState.prototype.leaveThisState = function() 
{
    for(var i=0;i<this.mEntities.length;i++)
    {
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            return false;
        }
    }
    return true;
}
BattleState.prototype.getActions = function()
{
    return this.mActions;
}
