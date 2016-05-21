WanderState = function (statemachine, game, gameref, mover) {
    this.mover = mover;
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.goalTile = null;
}
WanderState.prototype = Object.create(EmptyState.prototype);
WanderState.constructor = WanderState;

WanderState.prototype.init = function(map) 
{
    console.log("init")
}
WanderState.prototype.update = function(elapsedTime) 
{
    if(this.goalTile==null)
    {
        this.atTargetTile();
    }
}
WanderState.prototype.render = function() 
{
    
}
WanderState.prototype.onEnter = function(params) 
{
    console.log("onEnter")
    this.goalTile = null;
    //find random location
    //goto location
    //find another location
    //
    //this.atTargetTile();
}
WanderState.prototype.onExit = function() 
{
    this.goalTile = null;
    this.mover.moveToCenter();
}
WanderState.prototype.atTargetTile = function()
{
    var randomlist = this.gameref.map.hexHandler.doFloodFill(this.mover.currentTile, 5, true);
    
    var choicex = Phaser.ArrayUtils.getRandomItem(randomlist);    
    this.goalTile = Phaser.ArrayUtils.getRandomItem(choicex);    
    this.mover.moveToSpot(this.goalTile);
}