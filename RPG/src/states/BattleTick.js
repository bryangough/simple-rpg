BattleTick = function (mStateMachine, mActions) {
    this.mStateMachine = mStateMachine;
    this.mActions = mActions;
}
BattleTick.prototype = Object.create(EmptyState.prototype);
BattleTick.constructor = BattleTick;

BattleTick.prototype.update = function(elapsedTime) 
{
    for(var i=0;i<this.mActions.length;i++)
    {
        var a = this.mActions[i];
        a.Update(elapsedTime);
    }

    if(this.mActions.Top().IsReady())
    {
        var top = this.mActions.Pop();
        this.mStateMachine.change("execute", top);
    }
}
BattleTick.prototype.render = function() 
{

}
BattleTick.prototype.onEnter = function(params) 
{

}
BattleTick.prototype.onExit = function() 
{

}