var CombatAction = function (game, gameref, combater, target, action, state, params)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.action = action;
    this.state = state;
    this.params = params;
    this.isReady = true;  
    
    this.target = target;
}
CombatAction.prototype.execute = function()
{
    //console.log("Combat Action execute");
    //
    if(this.action=="move")
    {
        this.combater.moveToSpotCombat(this.target,[{func:this.doFinish, para:[], removeself:false, callee:this, con:null, walkto:false}], this.combater.movementspeed);
    }
    else if(this.action=="shoot")//shoot
    {
        this.combater.shootGun(this.target, this.params[0], {func:this.doFinish, callee:this});
    }
    else if(this.action=="useitem")//use item
    {
        console.log(this.targe, this.params);
        //
        this.combater.douse();
        //this.combater.appl
    }   
    else
        this.doFinish();
}
CombatAction.prototype.cleanup = function()
{
}
CombatAction.prototype.Update = function(elapse)
{
}

CombatAction.prototype.doFinish = function()
{
    /*if(this.combater.numberOfActions)
    {    
        //var action = new AIDecide(this.game, this.gameref, this.combater, this.combater.Speed(), this.state);
        //this.state.addToActionsFront(action);
    }
    else
    {*/
    if(this.combater.IsPlayer)
    {
        var action = new PlayerDecide(this.game, this.gameref, this.combater, this.combater.Speed(), this.state);
        this.state.addToActionsRear(action);
    }
    else
    {
        var action = new AIDecide(this.game, this.gameref, this.combater, this.combater.Speed(), this.state);
        this.state.addToActionsRear(action);
    }
    //}
    
    this.state.mBattleStates.change("tick");
}
