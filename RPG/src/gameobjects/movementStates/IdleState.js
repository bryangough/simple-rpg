IdleState = function (statemachine, game, gameref, mover) {
    //this.mover = mover;
    //this.statemachine = statemachine;
    //this.game = game;
    //this.gameref = gameref;
}
IdleState.prototype = Object.create(EmptyState.prototype);
IdleState.constructor = IdleState;

/*IdleState.prototype.init = function(map) 
{
    
}
IdleState.prototype.update = function(elapsedTime) 
{
    
}
IdleState.prototype.render = function() 
{
    
}
IdleState.prototype.onEnter = function(params) 
{
    
}
IdleState.prototype.onExit = function() 
{
    
}*/
IdleState.prototype.atTargetTile = function()
{    
}