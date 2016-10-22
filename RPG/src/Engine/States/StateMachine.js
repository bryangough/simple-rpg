StateMachine = function (game) {
    this.mStates = [];//associative
    this.mCurrentState = null;
    this.currentState = null;
    this.changeState = new Phaser.Signal();
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
    //console.log("change state: ",stateName);
    var newState = this.mStates[stateName];
    if(newState==null)
        return;
    
    if(this.mCurrentState!=undefined)
        this.mCurrentState.onExit();
    
    this.mCurrentState = newState;
    this.mCurrentState.onEnter(params);
    this.currentState = stateName;
    
    this.changeState.dispatch(this, this.currentState, this.mCurrentState)
}
StateMachine.prototype.add = function(name, state) 
{
    this.mStates[name] = state;
}
StateMachine.prototype.getByName = function(name) 
{
    return this.mStates[name];
}
