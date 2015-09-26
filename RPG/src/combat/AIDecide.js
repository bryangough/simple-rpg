var AIDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    //
}
AIDecide.prototype.Update = function(elapse)
{
}
AIDecide.prototype.execute = function()
{
   // this.state.removeTopAction();
    
    //console.log("AI execute");
    if(this.combater.isAlive())
    {
        //move to random location -
        // eventuall move towards Player
        
        var action = null;
        if(Math.random()>0.5)
            action = this.randomMove();
        else
            action = this.doAttack();
        
        this.state.addToActionsFront(action);
    }
    else
    {
        this.state.moveOn();
        this.gameref.toggleCombat();//I don't like this
        //this.state.leaveThisState();//test if no more enemies
    }
}
AIDecide.prototype.cleanup = function()
{
}
AIDecide.prototype.randomMove = function()
{
    var action;
    var location = this.combater.findWalkableFromCurrent();
    var spot;
    if(location!=null)
    {
        var x = Math.floor(Math.random()*location.length);
        spot = location[x][Math.floor(Math.random()*location[x].length)];
    }
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    return action;
}
AIDecide.prototype.doAttack = function()
{
    var action;
    var weapon;
    if(this.combater.weapons.length>0)
    {
        weapon = this.combater.weapons[0];
        //use weapon
        //against player
    }
    if(weapon!=null)
        action = new CombatAction(this.game, this.gameref, this.combater, this.gameref.map.playerCharacter, "shoot", this.state,[weapon]);
        
    return action;
}