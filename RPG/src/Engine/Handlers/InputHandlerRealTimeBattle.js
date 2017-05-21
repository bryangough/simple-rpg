var InputHandlerRealTimeBattle = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
    
    this.playerDecide = null;
    this.frindges = null;
    
    this.overEnemy = null;
    this.battleState = null;
    
    //this.pauseInput = false;
};
InputHandlerRealTimeBattle.prototype = Object.create(InputHandler.prototype);
InputHandlerRealTimeBattle.constructor = InputHandlerRealTimeBattle;

InputHandlerRealTimeBattle.prototype.onMove = function(pointer, x, y)
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
    //if(this.playerDecide==null)
    //    return;
    //if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
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

    //this.handleCharMove();
    if(moveIndex!=undefined)
    {
       //console.log(moveIndex.moverontile);
        if(moveIndex.moverontile!=null)
        {   
            moveIndex.moverontile.handleOver();
            this.overEnemy = moveIndex.moverontile;
        }
        
    }
    this.gameref.map.highlightHex.moveCursor(moveIndex);
}
InputHandlerRealTimeBattle.prototype.clickedHex = function(pointer,eventt)
{
    if (!pointer.withinGame) { return; }
    //this needs to be blocked if clicking ui
    this.dragScreen = false;
    if(this.didDrag)//test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(!pointer.active)
        return;
    
    if(this.overEnemy)
    {
        this.overEnemy.handleClick(pointer);
        if(this.overEnemy.IsPlayer)
        {
            this.clickedPlayer(this.overEnemy,pointer);
        }
    }
    //
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    //
    this.handleCharMove();
} 
InputHandlerRealTimeBattle.prototype.clickedObject = function(clickedObject)
{
    //if(this.pauseInput)
    //    return;
    console.log('**** clickedObject ',clickedObject,this.playerDecide);
    if(this.playerDecide==null || !this.playerDecide.dotouched)
        return;
    this.playerDecide.dotouched(clickedObject);
}