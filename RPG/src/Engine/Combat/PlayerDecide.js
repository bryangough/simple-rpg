var PlayerDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    this.isDone = false;
    
    this.maxActions = 2;
    //
}
PlayerDecide.prototype.Update = function(elapse)
{
}
PlayerDecide.prototype.onEnter = function(params)
{
    console.log('Playerdecide onEnter')
}
PlayerDecide.prototype.onExit = function(params)
{
    console.log('Playerdecide onExit')
}


PlayerDecide.prototype.execute = function()
{
    console.log("Player decide execute.", this.maxActions);
    if(this.maxActions<1)
    {
        this.state.removeAction(this);
        return;
    }
    this.state.inputHandler.pauseInput = false;
    this.state.statemachine.inputHandler.highlightplayer(this.combater);
    this.selectThis();
}
PlayerDecide.prototype.selectThis = function()
{
    console.log("Player decide select.",this.combater);
    this.state.placeAtFront(this);    
}
PlayerDecide.prototype.cleanup = function()
{
    
}
PlayerDecide.prototype.domove = function(spot)
{
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    this.testEndOfTurn();
    this.state.addToActionsFront(action);
   // this.isDone = true;
}
PlayerDecide.prototype.dotouched = function(clickedObject)
{
    if(clickedObject.hostile)
    {
        var action;
        var weapon;
        //console.log(this.combater.currentSelectedWeapon);
        if(this.combater.currentSelectedWeapon)
        {
            weapon = this.combater.currentSelectedWeapon;
        }
        /*else if(this.combater.weapons.length>0)
        {
            weapon = this.combater.weapons[0];
        }*/
        console.log("weapon ",weapon)
        if(weapon!=null)
        {
            action = new CombatAction(this.game, this.gameref, this.combater, clickedObject, "shoot", this.state,[weapon]);
            this.testEndOfTurn();
            this.state.addToActionsFront(action);
        }
    }
}
PlayerDecide.prototype.testEndOfTurn = function()
{
    this.maxActions--;
    //this.state.removeTopAction();
    //if player has no more action remove from list
    console.log("actions: ", this.maxActions);
    if(this.maxActions<=0)
        this.state.removeAction(this);
}
PlayerDecide.prototype.endTurn = function()
{
    action = new CombatAction(this.game, this.gameref, this.combater, this.combater, "nothing", this.state,[]);
    this.state.addToActionsFront(action);
}
PlayerDecide.prototype.usePower = function(spot)
{
    if(this.combater.currentSelectedWeapon)
    {
        weapon = this.combater.currentSelectedWeapon;
    }
    if(weapon!=null)
    {
        action = new CombatAction(this.game, this.gameref, this.combater, this.combater, "useitem", this.state,[weapon]);
        this.testEndOfTurn();
        this.state.addToActionsFront(action);
    }
}

