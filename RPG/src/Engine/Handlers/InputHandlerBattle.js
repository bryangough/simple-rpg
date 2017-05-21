var InputHandlerBattle = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
    
    this.playerDecide = null;
    this.frindges = null;
    
    this.overEnemy = null;
    this.battleState = null;
    
    this.pauseInput = false;
};
InputHandlerBattle.prototype = Object.create(InputHandler.prototype);
InputHandlerBattle.constructor = InputHandlerBattle;

//
InputHandlerBattle.prototype.onMove = function(pointer, x, y)
{
    //console.log("move2 ",pointer.active);
    //if(!pointer.active)
    //    return;
    
    this.doDragScreenMove(x,y);
    
    if(this.overEnemy!=null)
    {
        this.overEnemy.handleOut();
        this.overEnemy = null;
    }
    //console.log("this.playerDecide ",this.playerDecide)
    if(this.playerDecide==null)
        return;
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        //return;
    if(!pointer.active)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;

    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);

    if(this.withinFringes(moveIndex))
        this.gameref.map.highlightHex.moveCursor(moveIndex);
    else 
        this.gameref.map.highlightHex.hideCursor();
    //attempting to make the tile select the player
    //select works, unselect doesn't
    if(moveIndex!=undefined)
    {
       //console.log(moveIndex.moverontile);
        if(moveIndex.moverontile!=null)
        {
            this.gameref.map.highlightHex.moveCursor(moveIndex);
            moveIndex.moverontile.handleOver();
            this.overEnemy = moveIndex.moverontile;
        }
    }
   else
    {
        
    }
},
InputHandlerBattle.prototype.withinFringes = function(moveIndex) 
{
    for(var i=0;i<this.frindges.length;i++)
    {
        for(var j=0;j<this.frindges[i].length;j++)
        {
            if(moveIndex==this.frindges[i][j])
                return true;
        }
    }
    return false;
}
InputHandlerBattle.prototype.hideInputAreas = function(combater) 
{
    this.gameref.map.highlightHex.cleanuptiles();
}

InputHandlerBattle.prototype.showAreaForMove = function(combater) 
{
    console.log('showareaformove **')
    this.frindges = combater.findWalkableFromCurrent();
    this.gameref.map.highlightHex.drawFringes(this.frindges);
}
InputHandlerBattle.prototype.clickedHex = function(pointer,eventt)
{
    //console.log("click",pointer,pointer.active,this.gameref.input.priorityID);
    //console.log('handleClick ',pointer);
    this.dragScreen = false;
    if(this.didDrag)        //test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(this.pauseInput)
        return;
    if(!pointer.active)
        return;
    if(this.playerDecide==null)
        return;
    
    
    if(this.overEnemy)
    {
        this.overEnemy.handleClick(pointer);
        if(this.overEnemy.IsPlayer)
        {
            this.clickedPlayer(this.overEnemy,pointer);
        }
    }
    
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x) /this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y) /this.gameref.map.scaledto;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx,pointery);

    if(moveIndex!=null)
    {
        if(this.game.currentAction==this.game.WALK)
        {
            if(this.withinFringes(moveIndex))
            {
                this.playerDecide.domove(moveIndex);
                this.gameref.map.highlightHex.cleanuptiles();
            }
        }
    }
} 
InputHandlerBattle.prototype.clickedObject = function(clickedObject)
{
    if(this.pauseInput)
        return;
    console.log('**** clickedObject ',clickedObject,this.playerDecide);
    if(this.playerDecide==null || !this.playerDecide.dotouched)
        return;
    this.playerDecide.dotouched(clickedObject);
}
InputHandlerBattle.prototype.clickedPlayer = function(actor)
{
    if(this.pauseInput)
        return;
    this.cleanUpPlayer();
    var playerChoice = this.battleState.mBattleStates.mCurrentState.findDecideByActor(actor);
    if(playerChoice)
        playerChoice.execute();
    else
        console.log("no player");
}
InputHandlerBattle.prototype.highlightplayer = function(actor, clicked)
{
    this.playerDecide = this.battleState.mBattleStates.mCurrentState.findDecideByActor(actor);
    this.showAreaForMove(actor);
}
InputHandlerBattle.prototype.cleanUpPlayer = function()
{
    this.playerDecide = null;
    this.hideInputAreas();
}
//if recieve both use the touched
