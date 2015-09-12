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
        
        var location = this.combater.findWalkableFromCurrent();
        var spot;
        if(location!=null)
        {
            var x = Math.floor(Math.random()*location.length);
            spot = location[x][Math.floor(Math.random()*location[x].length)];
        }
       /* 
        //use weapon
        if(this.weapons>0)
        {
            var weapon = this.weapons[0];
            //use weapon
            //against player
        }
        */

        //
        
        var action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
        this.state.addToActionsFront(action);
    }
    
}