BattleTick = function (mStateMachine, state) {
    this.mStateMachine = mStateMachine;
    this.state = state;
   // this.mActions = mActions;
}
BattleTick.prototype = Object.create(EmptyState.prototype);
BattleTick.constructor = BattleTick;

BattleTick.prototype.update = function(elapsedTime) 
{
    var mActions = this.state.getActions();
    
    if(mActions.length<=0)
    {
        //this should never happen
        console.log("BattleTick no actions");
        return;
    }
    for(var i=0;i<mActions.length;i++)
    {
        var a = mActions[i];
        a.Update(elapsedTime);
    }
    if(mActions[mActions.length-1].isReady)
    {
        var top = mActions.pop();
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