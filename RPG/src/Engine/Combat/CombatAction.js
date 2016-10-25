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
    console.log("Combat Action execute ",this.action);
    //
    if(this.action=="move")
    {
        this.combater.moveToSpotCombat(this.target,[{func:this.doFinish, para:[], removeself:false, callee:this, con:null, walkto:false}], this.combater.movementspeed);
    }
    else if(this.action=="shoot")//shoot
    {
        this.combater.shootGun(this.target, this.params[0], {func:this.doFinish, callee:this}, this);
    }
    else if(this.action=="useitem")//use item
    {
        console.log(this.targe, this.params);
        this.combater.douse();
    }   
    else if(this.action=="bullet")//use item
    {
        var weapon = this.params[0];
        var acc = this.params[1];
        //this.game, this.gameref, this, clickedObject, "bullet", this.state,[weapon, acc]
        //imagename, action, onhitaction, start, target
        this.gameref.bulletHandler.fireBullet("combat_actionpoints0001.png", this, null, this.combater, this.target, {func:this.doFinish, callee:this});
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
CombatAction.prototype.addActionToState = function(nextAction)
{
    this.state.placeAtFront(nextAction);
}
CombatAction.prototype.doFinish = function(nextState)
{
    console.log("combat action: doFinish")
    if(nextState!=null)
        this.state.placeAtFront(nextAction);
    this.state.removeAction(this);//this should be just a pop
    this.state.NextTick();
}
