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
    this.inputHandler = new BatttleInputHandler(this.game, this.gameref);

    
    this.mActions = [];//actions
    this.mEntities = [];//entitys
    this.mBattleStates = new StateMachine();
    
    this.mBattleStates.add("tick", new BattleTick(this.mBattleStates, this.mActions));
    this.mBattleStates.add("execute", new BattleExecute(this.mBattleStates, this.mActions));
    
    
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

BattleState.prototype.init = function(map) 
{
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
    GlobalEvents.currentacion = GlobalEvents.COMBATSELECT;
    this.mBattleStates.change("tick");
}
BattleState.prototype.onExit = function() 
{
    //console.log("battle exit");
    this.activeButtons.visible = false;
    this.inputHandler.turnOff();
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].endCombat();
    }
    if(GlobalEvents.currentacion == GlobalEvents.COMBATSELECT)
        GlobalEvents.WALK;
}
BattleState.prototype.leaveThisState = function() 
{
    
    //are their active enemies?
    for(var i=0;i<this.mEntities.length;i++)
    {
        //console.log(this.mEntities[i].isAlive(), this.mEntities[i].hostile, !this.mEntities[i].IsPlayer);
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            //console.log("alive",this.mEntities[i]);
            return false;
        }
    }
    return true;
}
BattleState.prototype.toggleCombat = function() 
{
    
    //are their active enemies?
    for(var i=0;i<this.mEntities.length;i++)
    {
        //console.log(this.mEntities[i].isAlive(), this.mEntities[i].hostile, !this.mEntities[i].IsPlayer);
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            //console.log("alive",this.mEntities[i]);
            return false;
        }
    }
    return true;
}