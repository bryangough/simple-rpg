StateMachine = function (game) {
    this.mStates = [];//associative
    this.mCurrentState = null;
    this.currentState = null;
}
StateMachine.prototype.update = function(elapsedTime) 
{
    if(this.mCurrentState!=undefined)
        this.mCurrentState.update(elapsedTime);
}
StateMachine.prototype.render = function() 
{
    if(this.mCurrentState!=undefined)
        this.mCurrentState.render();
}
StateMachine.prototype.change = function(stateName, params) 
{
    var newState = this.mStates[stateName];
    if(newState==null)
        return;
    
    if(this.mCurrentState!=undefined)
        this.mCurrentState.onExit();
    
    this.mCurrentState = newState;
    this.mCurrentState.onEnter(params);
    this.currentState = stateName;
}
StateMachine.prototype.add = function(name, state) 
{
    this.mStates[name] = state;
}