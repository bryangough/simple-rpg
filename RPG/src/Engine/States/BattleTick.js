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
    //console.log(mActions);
    
    if(mActions.length<=0)
    {
        //this should never happen
        console.log("BattleTick no actions");
        return;
    }
    for(var i=0;i<mActions.length;i++)
    {
        var a = mActions[i];
        if(a!=null)
        {
            a.Update(elapsedTime);
        }
        else{
            console.log(mActions);
         //   console.log(this,a);
        }
    }
    if(mActions[mActions.length-1].isReady)// && mActions[mActions.length-1].isDone)
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