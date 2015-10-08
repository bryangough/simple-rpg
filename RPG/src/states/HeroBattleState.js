// start combat
// remove normal ui

// player decides
// player action
// ai decides
// ai action
//
//
//
HeroBattleState = function (statemachine, game, gameref) {
    BattleState.call(this, statemachine, game, gameref);
}

HeroBattleState.prototype = Object.create(BattleState.prototype);
HeroBattleState.constructor = HeroBattleState;

HeroBattleState.prototype.init = function(map) 
{
}

//
HeroBattleState.prototype.SortByTime = function(a,b)
{
    return a.TimeRemaining() > b.TimeRemaining()
}
HeroBattleState.prototype.update = function(elapsedTime) 
{
    this.mBattleStates.update(elapsedTime);    
}
HeroBattleState.prototype.render = function() 
{
    this.mBattleStates.render();
    this.game.debug.text(this.mThinking.length, 2, 50, "#00ff00");
    this.game.debug.text(this.mDoing.length, 2, 75, "#00ff00");
    this.game.debug.text(this.mActions.length, 2, 100, "#00ff00");
}
HeroBattleState.prototype.getActiveCombater = function()
{
    this.mEntities[this.iteractor];
}
HeroBattleState.prototype.onEnter = function(params) 
{
    this.activeButtons.visible = true;
    this.inputHandler.turnOn();
 
    this.mEntities = params.entities;
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    this.mBattleStates.change("tick");
 
    this.mEntities = params.entities;
    this.fillActions();
    //
    //Sort(this.mActions, this.SortByTime);
    //
}
HeroBattleState.prototype.fillActions = function()
{
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        if(e.IsPlayer)
        {
            var action = new PlayerDecide(this.game, this.gameref, e,  e.Speed(), this);
            this.mThinking.push(action);
        }
        else
        {
            var action = new AIDecide(this.game, this.gameref, e, e.Speed(), this);
            this.mThinking.push(action);
        }
    }
}
HeroBattleState.prototype.getActions = function()
{
    return this.mActions;
}
HeroBattleState.prototype.removeTopAction = function()
{
    this.mActions.pop();
}
HeroBattleState.prototype.addToActionsRear = function(val)
{
    //after execute
    console.log("at rear",this.mActions.length,this.mActions);
    if(this.mActions.length<=0)//on execute
    {
        this.fillActions();    
        this.mActions = this.mThinking;
    }
}
HeroBattleState.prototype.addToActionsFront = function(val)
{
    if(val)
        this.mDoing.push(val);
    this.mBattleStates.change("tick");
    console.log("addToActionsFront",this.mActions);
    
    if(this.mActions.length<=0)//on execute
    {
        console.log("add", this.mActions, this.mDoing);
        this.mActions = this.mDoing; 
    }
}
//
HeroBattleState.prototype.moveOn = function()
{
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
    this.addToActionsFront();
    //this.mBattleStates.change("tick");
    //this.addToActionsRear();
}
HeroBattleState.prototype.onExit = function() 
{
    //console.log("battle exit");
    this.activeButtons.visible = false;
    this.inputHandler.turnOff();
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].endCombat();
    }
    //console.log(GlobalEvents.currentAction);
    if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
        GlobalEvents.currentAction = GlobalEvents.WALK;
}
HeroBattleState.prototype.leaveThisState = function() 
{
    for(var i=0;i<this.mEntities.length;i++)
    {
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            return false;
        }
    }
    return true;
}