BattleTick = function (mStateMachine, mActions) {
    this.mStateMachine = mStateMachine;
    this.mActions = mActions;
}
BattleTick.prototype = Object.create(EmptyState.prototype);
BattleTick.constructor = BattleTick;

BattleTick.prototype.update = function(elapsedTime) 
{
    if(this.mActions.length<=0)
    {
        //this should never happen
        console.log("BattleTick no actions");
        return;
    }
    for(var i=0;i<this.mActions.length;i++)
    {
        var a = this.mActions[i];
        a.Update(elapsedTime);
    }
    if(this.mActions[this.mActions.length-1].isReady)
    {
        var top = this.mActions.pop();
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