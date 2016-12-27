var AIDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    this.isDone = true;
    //
    this.maxActions = 2;
    
    this.enemyfocus = null;
}
AIDecide.prototype.Update = function(elapse)
{
}
AIDecide.prototype.execute = function()
{
    // this.state.removeTopAction();
        
    if(this.combater.isAlive() && this.maxActions>0)
    {
        this.selectThis();
        //move to random location -
        // eventuall move towards Player
        
        var action = null;
        var weapon = this.combater.weapons[0]
        if( weapon )
        {
        }
        //if(Math.random()>0.5)
        //    action = this.randomMove();
        //else
        //    action = this.doAttack();
        
        //lineOfSite
        var hasLineOfSite = true;
        var withinRange = true;
        if(weapon.range>1)
        {
            hasLineOfSite = this.gameref.map.hexHandler.lineOfSite(this.combater.currentTile, this.gameref.map.playerCharacter.currentTile)
        }
            
        if(hasLineOfSite)
        {
            var distanceTo = this.gameref.map.hexHandler.testRange(this.combater.currentTile, this.gameref.map.playerCharacter.currentTile, false)
            if(distanceTo > weapon.range * 60)
            {
                withinRange = false;
            }
        }
        
        var r = Math.random();
        if(r < 0.1)//10% of the time just randomly walk around
        {
            action = this.randomMove();
        }
        else if(hasLineOfSite && withinRange)
        {
            action = this.doAttack();
        }
        else
        {
            /*this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
            this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx, moveIndex.posy] );
            this.maingame.pathfinder.calculatePath();*/
            action = this.moveToPlayer();
        }
        this.testEndOfTurn();
        this.state.addToActionsFront(action);
    }
    else
    {
        this.state.removeAction(this);
        this.state.moveOn();
        this.gameref.toggleCombat();//I don't like this
        //this.state.leaveThisState();//test if no more enemies
    }
}
AIDecide.prototype.selectPlayerToAttack = function()
{
    //get players from other team
    //get alive players
    //
}
AIDecide.prototype.selectThis = function()
{
    console.log("AI decide select.",this.combater);
    this.state.placeAtFront(this);    
}
AIDecide.prototype.testEndOfTurn = function()
{
    this.maxActions--;
    //this.state.removeTopAction();
    //if player has no more action remove from list
    console.log("AI actions: ", this.maxActions);
    if(this.maxActions<=0)
        this.state.removeAction(this);
}
/*AIDecide.prototype.movercallback = function(path){
    path = path || [];
    console.log(path);
    //path = this.map.hexHandler.pathCoordsToTiles(path);
}*/
AIDecide.prototype.cleanup = function()
{
}
AIDecide.prototype.moveToPlayer = function()
{
//    return this.randomMove();
    var action;
    action = new CombatAction(this.game, this.gameref, this.combater, this.gameref.map.playerCharacter, "move", this.state);
    return action;
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