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
    //console.log("Player decide execute.");
    
    this.state.inputHandler.playerDecide = this;
    this.state.inputHandler.showAreaForMove(this.combater);
    
    //activate player can control
    
    //if not look,
}
PlayerDecide.prototype.cleanup = function()
{
    this.state.inputHandler.playerDecide = null;
    this.state.inputHandler.hideInputAreas();
}

PlayerDecide.prototype.domove = function(spot)
{
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    this.state.addToActionsFront(action);
}
PlayerDecide.prototype.dotouched = function(clickedObject)
{
    var action;
    var weapon;
    if(this.combater.currentSelectedWeapon)
    {
        weapon = this.combater.currentSelectedWeapon;
    }
    else if(this.combater.weapons.length>0)
    {
        weapon = this.combater.weapons[0];
    }
    if(weapon!=null)
    {
        action = new CombatAction(this.game, this.gameref, this.combater, clickedObject, "shoot", this.state,[weapon]);
        this.state.addToActionsFront(action);
    }
}

