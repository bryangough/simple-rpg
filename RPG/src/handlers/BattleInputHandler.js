var BatttleInputHandler = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
    
    this.playerDecide = null;
    this.frindges = null;
};
BatttleInputHandler.prototype = Object.create(InputHandler.prototype);
BatttleInputHandler.constructor = BatttleInputHandler;

//
BatttleInputHandler.prototype.onMove = function(pointer, x, y)
{
    //console.log("move2 ",pointer.active);
    //if(!pointer.active)
    //    return;
    
    if(this.dragScreen)
    {
        var diffx = this.dragPoint.x-x;
        var diffy = this.dragPoint.y-y;

        this.dragPoint.x = x;
        this.dragPoint.y = y;

        if(diffx!=0||diffy!=0)
            this.didDrag = true;
        this.gameref.map.mapGroup.x -= diffx;
        this.gameref.map.mapGroup.y -= diffy;

        //console.log(diffx,diffy);
        //move around
        return;
    }
    if(this.playerDecide==null)
        return;
    if(GlobalEvents.currentacion != GlobalEvents.WALK && GlobalEvents.currentacion != GlobalEvents.COMBATSELECT)
        return;
    if(!pointer.active)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;

    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);

    //console.log(moveIndex);
    if(this.withinFringes(moveIndex))
        this.gameref.map.highlightHex.highlighttilebytile(0,moveIndex);
},
BatttleInputHandler.prototype.withinFringes = function(moveIndex) 
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
BatttleInputHandler.prototype.hideInputAreas = function(combater) 
{
    this.gameref.map.highlightHex.cleanuptiles();
}

BatttleInputHandler.prototype.showAreaForMove = function(combater) 
{
    this.frindges = combater.findWalkableFromCurrent();
    this.gameref.map.highlightHex.drawFringes(this.frindges);
}
BatttleInputHandler.prototype.clickedHex = function(pointer,b)
{
    //console.log("click",pointer,pointer.active,this.gameref.input.priorityID);
    this.dragScreen = false;
    if(this.didDrag)        //test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    
    if(!pointer.active)
        return;
    if(this.playerDecide==null)
        return;
    if(GlobalEvents.currentacion != GlobalEvents.WALK && GlobalEvents.currentacion != GlobalEvents.COMBATSELECT)
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
        if(this.game.currentacion==this.game.WALK)
        {
            if(this.withinFringes(moveIndex))
            {
                this.playerDecide.domove(moveIndex);
                this.gameref.map.highlightHex.cleanuptiles();
            }
        }
    }
} 
BatttleInputHandler.prototype.clickedObject = function(clickedObject)
{
    if(this.playerDecide==null)
        return;
    this.playerDecide.dotouched(clickedObject);
}
//if recieve both use the touched
