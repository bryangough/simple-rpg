var InputHandler = function (game, gameref)
{
    
    this.game = game;
    this.gameref = gameref;
    
    this.dragScreen = false;
    this.didDrag = false;
    this.dragPoint = new Point(0,0);
};
//
InputHandler.prototype.turnOn = function()
{
    this.gameref.input.addMoveCallback(this.onMove, this); 
    this.gameref.input.onDown.add(this.doDragScreen, this);
    this.gameref.input.onUp.add(this.clickedHex, this);
    this.gameref.input.priorityID = 0;
    //
    this.dragScreen = false;
    this.didDrag = false;
}
InputHandler.prototype.turnOff = function()
{
    this.gameref.input.deleteMoveCallback(this.onMove, this); 
    this.gameref.input.onDown.remove(this.doDragScreen, this);
    this.gameref.input.onUp.remove(this.clickedHex, this);
}
//
InputHandler.prototype.onMove = function(pointer, x, y)
{
    //console.log("move ",pointer.active);
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
    if(GlobalEvents.currentAction != GlobalEvents.WALK)
    {
        return;
    }
    if(this.game.global.pause)
    {
        return;
    }
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;

    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);
    var playertile = this.gameref.map.hexHandler.checkHex(this.gameref.map.playerCharacter.x, this.gameref.map.playerCharacter.y);
    if(moveIndex)
    {
        //this.tiletest.x = moveIndex.x;
        //this.tiletest.y = moveIndex.y;
    }
    //console.log(playertile);
    //console.log(playertile.posx,playertile.posy,this.playerCharacter.x,this.playerCharacter.y);
   // if(moveIndex)
    //    console.log(moveIndex.posx,moveIndex.posy);

    //console.log(this.input.worldX,this.gameref.map.mapGroup.x,this.input.worldX-this.gameref.map.mapGroup.x);

    //this.highlightHex.doShowPath(this.pathfinder,this.playerCharacter.currentTile,moveIndex);
    //this.gameref.map.hexHandler.dolines(playertile,moveIndex,false,this.gameref.map.highlightHex);
    //var fridges = this.gameref.map.hexHandler.doFloodFill(moveIndex,6,true);
    //this.gameref.map.highlightHex.drawFringes(fridges);
    this.gameref.map.highlightHex.highlighttilebytile(0,moveIndex);
    //this.highlightHex.highilightneighbors(moveIndex);
},
InputHandler.prototype.doDragScreen = function(pointer)
{
    //console.log("drag",pointer.active);
    if(!pointer.active)
        return;
    
    this.dragScreen = true;
    this.dragPoint.x = pointer.x;
    this.dragPoint.y = pointer.y;
}
InputHandler.prototype.clickedObject = function(clickedObject)
{
}
InputHandler.prototype.clickedHex = function(pointer,b)
{
    
    //console.log("hex",pointer.active);
    
    //this needs to be blocked if clicking ui
    this.dragScreen = false;
    if(this.didDrag)        //test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(!pointer.active)
        return;

    if(GlobalEvents.currentAction != GlobalEvents.WALK)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx,pointery);
    
    if(moveIndex!=null)
    {
        if(this.game.currentAction==this.game.WALK)
        {
            this.gameref.map.playerCharacter.moveto(moveIndex);
        }
    }
} 