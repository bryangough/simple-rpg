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
    this.inputHandler.battleState = this;
    this.enemyRollover = new EnemyTargetRollOver(this.game, this.gameref, this);
    
    this.mEntities = [];//entitys
    this.mBattleStates = new StateMachine();
    
    
    //player turn, enemy turn, other turn
    //plus allow everyone more turns
    this.battleOrder = ["Player","AI"];
    this.currentOrder = -1;
    
    this.mBattleStates.add("Player", new BattleHeroTurnState(this, game, gameref, true, this.inputHandler));
    this.mBattleStates.add("AI", new BattleHeroTurnState(this, game, gameref, false, this.inputHandler));
    
    this.activeButtons = new CombatButtons(this.game, this.gameref);
    this.activeButtons.x = 50;
    this.activeButtons.y = 430;
    this.game.add.existing(this.activeButtons);
    this.gameref.uiGroup.add(this.activeButtons);
    this.activeButtons.visible = false;
    //
}
BattleState.prototype = Object.create(EmptyState.prototype);
BattleState.constructor = BattleState;
//
BattleState.prototype.init = function(map) 
{
}
BattleState.prototype.nextTeam = function() 
{
    this.currentOrder++;
    if(this.currentOrder>this.battleOrder.length-1)
        this.currentOrder = 0;
    this.mBattleStates.change(this.battleOrder[this.currentOrder]);
    return this.battleOrder[this.currentOrder];
}
BattleState.prototype.endPlayerTurn = function() 
{
    console.log('Endplayer turn.')
    if(this.battleOrder[this.currentOrder]=="Player")
    {
        this.nextTeam();
    }
}

//why is this here?
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
BattleState.prototype.update = function(elapsedTime) 
{
    this.mBattleStates.update(elapsedTime);    
}
BattleState.prototype.render = function() 
{
    this.mBattleStates.render();
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
    //this.NextTick();
 
    this.mEntities = params.entities;
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        if(e.IsPlayer)
        {
            var playerTurn = this.mBattleStates.getByName("Player");
            playerTurn.addTeamate(e);
            
            //pass to player state
        }
        else
        {
            var playerTurn = this.mBattleStates.getByName("AI");
            playerTurn.addTeamate(e);
            //pass to enemy state
        }
    }
    this.nextTeam();
    //
    //Sort(this.mActions, this.SortByTime);
    //
}
BattleState.prototype.onExit = function() 
{
    console.log("BattleState **  onExit")
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
