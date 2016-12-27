//
BattleHeroTurnState = function (statemachine, game, gameref, isPlayerTurn, inputHandler) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    
    this.mActions = [];//actions
    this.mEntities = [];//entitys
    this.actionStates = new StateMachine();
    
    this.inputHandler = inputHandler;
    this.actionStates.add("tick", new BattleTick(this.actionStates, this));
    this.actionStates.add("execute", new BattleExecute(this.actionStates));
    
    this.iteractor = -1;
    this.team = [];
    
    this.isPlayerTurn = isPlayerTurn;
    //
}
BattleHeroTurnState.prototype = Object.create(EmptyState.prototype);
BattleHeroTurnState.constructor = BattleHeroTurnState;
//
BattleHeroTurnState.prototype.init = function(map) 
{
}
//
BattleHeroTurnState.prototype.SortByTime = function(a,b)
{
    return a.TimeRemaining() > b.TimeRemaining()
}
BattleHeroTurnState.prototype.update = function(elapsedTime) 
{
    //this.game.debug.text(this.mActions.length+"", 20, 25) 
    this.game.debug.text("Pause input: "+ this.inputHandler.pauseInput, 20, 25) 
    if(this.mActions.length>0)
        this.actionStates.update(elapsedTime);    
    else
        this.statemachine.nextTeam();
}
BattleHeroTurnState.prototype.render = function() 
{
    this.actionStates.render();
}
BattleHeroTurnState.prototype.getActiveCombater = function()
{
    this.mEntities[this.iteractor];
}
BattleHeroTurnState.prototype.NextTick = function()
{
    this.actionStates.change("tick");
}
BattleHeroTurnState.prototype.onEnter = function(params) 
{
    console.log("BattleTurn")
    this.createTeam();
    if(!this.isPlayerTurn)
    {
        this.inputHandler.pauseInput = true;
        //if(this.mActions.length>0)
        //    this.mActions[this.mActions.length-1].execute();
    }
}
BattleHeroTurnState.prototype.setTeam = function(team) 
{
    this.mEntities = team;
}
BattleHeroTurnState.prototype.addTeamate = function(teammate) 
{
    this.mEntities.push(teammate);
}
BattleHeroTurnState.prototype.createTeam = function() 
{
    //every time?
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    this.NextTick();
    console.log("num: "+this.mEntities.length);
    this.createActions();
}
BattleHeroTurnState.prototype.createActions = function()
{
    //this.mActions.clear();
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
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
    }
}
BattleHeroTurnState.prototype.findDecideByActor = function(actor)
{
    for(var x=0;x<this.mActions.length;x++)
    {
        if(this.mActions[x].combater == actor)
        {
            return this.mActions[x];
        }
    }
    return null;
}
BattleHeroTurnState.prototype.removeAction = function(action)
{
    var i = this.mActions.indexOf(action);
    console.log("removeAction ",i,this.mActions,action);
    if (i > -1) 
    {
        this.mActions.splice(i, 1);
        return true;
    }
    return false;
}
BattleHeroTurnState.prototype.placeAtFront = function(action)
{
    var i = this.mActions.indexOf(action);
    if (i > -1) 
    {
        this.mActions.splice(i, 1);
    }
    this.mActions.push(action);
}

BattleHeroTurnState.prototype.placeAtEnd = function()
{
    var a = this.mActions.pop();
    this.mActions.unshift(val);
}
BattleHeroTurnState.prototype.removeTopAction = function()
{
    var a = this.mActions.pop();
    return a;
}
BattleHeroTurnState.prototype.addToActionsRear = function(val)
{
    this.mActions.unshift(val);
    this.NextTick();
}
BattleHeroTurnState.prototype.addToActionsFront = function(val)
{
    this.mActions.push(val);
    this.NextTick();
}
BattleHeroTurnState.prototype.moveOn = function()
{
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
    this.NextTick();
}
BattleHeroTurnState.prototype.onExit = function() 
{
    console.log('On exit.')
    this.mActions = [];
    this.inputHandler.cleanUpPlayer();
}
BattleHeroTurnState.prototype.leaveThisState = function() 
{
    //can be used to warn if player still has actions
    return true;
}
BattleHeroTurnState.prototype.getActions = function()
{
    return this.mActions;
}
