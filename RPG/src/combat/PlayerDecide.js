var PlayerDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    //
}
PlayerDecide.prototype.Update = function(elapse)
{
}
PlayerDecide.prototype.execute = function()
{
    console.log("Player decide execute.");
    
    this.state.inputHandler.playerDecide = this;
    this.state.inputHandler.showAreaForMove(this.combater);
    
    //activate player can control
    
    
}
PlayerDecide.prototype.domove = function(spot)
{
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    this.state.addToActionsFront(action);
}