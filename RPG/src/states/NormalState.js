NormalState = function (statemachine, game, gameref) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.inputHandler = new InputHandler(this.game, this.gameref);
}
NormalState.prototype = Object.create(EmptyState.prototype);
NormalState.constructor = NormalState;

NormalState.prototype.init = function(map) 
{
    
}
NormalState.prototype.update = function(elapsedTime) 
{
    
}
NormalState.prototype.render = function() 
{
    
}
NormalState.prototype.onEnter = function(params) 
{
    //console.log("normal enter");
    this.inputHandler.turnOn();
}
NormalState.prototype.onExit = function() 
{
    //console.log("normal exit");
    this.inputHandler.turnOff();
}