
//speed?
//PlayerDecide action
//AIDecide

BattleState = function (game) {
    this.mActions = [];//actions
    this.mEntities = [];//entitys
    this.mBattleStates = new StateMachine();
    
    this.mBattleStates.Add("tick", new BattleTick(this.mBattleStates, this.mActions));
    this.mBattleStates.Add("execute", new BattleExecute(this.mBattleStates, this.mActions));
}

BattleState.prototype = Object.create(EmptyState.prototype);
BattleState.constructor = BattleState;

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
BattleState.prototype.onEnter = function(params) 
{
    this.mBattleStates.Change("tick");
 
    //
    // Get a decision action for every entity in the action queue
    // The sort it so the quickest actions are the top
    //

    this.mEntities = params.entities;

    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        
        if(e.playerControlled)
        {
            var action = new PlayerDecide(e, e.Speed());
            this.mActions.Add(action);
        }
        else
        {
            var action = new AIDecide(e, e.Speed());
            this.mActions.Add(action);
        }
    }
    //
    Sort(this.mActions, this.SortByTime);
}
BattleState.prototype.onExit = function() 
{

}