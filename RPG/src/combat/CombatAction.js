var CombatAction = function (game, gameref, combater, target, action, state, params)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    this.params = params;
    this.isReady = true;  
    
    this.target = target;
}
CombatAction.prototype.execute = function()
{
    //console.log("Combat Action execute");
    //this.doFinish();
    
    //console.log(this.params);
    //if(action=="move")
    
    this.combater.moveToSpot(this.target,[{func:this.doFinish, para:[], removeself:false, callee:this, con:null, walkto:false}]);
    
}
CombatAction.prototype.Update = function(elapse)
{
}

CombatAction.prototype.doFinish = function()
{
    console.log("Combat Action do finish");
    
    //this.state.removeTopAction();
    
    /*if(this.combater.numberOfActions)
    {    
        //var action = new AIDecide(this.game, this.gameref, this.combater, this.combater.Speed(), this.state);
        //this.state.addToActionsFront(action);
    }
    else
    {*/
        var action = new AIDecide(this.game, this.gameref, this.combater, this.combater.Speed(), this.state);
        this.state.addToActionsRear(action);
    //}
    
    this.state.mBattleStates.change("tick");
}
