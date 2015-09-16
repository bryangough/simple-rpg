BattleExecute = function (mStateMachine, mActions) {
    this.topAction = null;
}
BattleExecute.prototype = Object.create(EmptyState.prototype);
BattleExecute.constructor = BattleExecute;

BattleExecute.prototype.update = function(elapsedTime) 
{
    if(this.topAction);
        this.topAction.Update(elapsedTime);
}
BattleExecute.prototype.render = function() 
{
}
BattleExecute.prototype.onEnter = function(topAction) 
{
    this.topAction = topAction;
    if(this.topAction)
        this.topAction.execute();
}
BattleExecute.prototype.onExit = function() 
{
    if(this.topAction)
        this.topAction.cleanup();
}