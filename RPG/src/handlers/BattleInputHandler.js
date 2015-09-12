var BatttleInputHandler = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
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
    if(GlobalEvents.currentacion != GlobalEvents.WALK)
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
    //this.hexHandler.dolines(playertile,moveIndex,true,this.highlightHex);
    //var fridges = this.gameref.map.hexHandler.doFloodFill(moveIndex,6);
    //this.gameref.map.highlightHex.drawFringes(fridges);
    //this.gameref.map.highlightHex.highlighttilebytile(0,moveIndex);
    //this.highlightHex.highilightneighbors(moveIndex);
},
BatttleInputHandler.prototype.doDragScreen = function(pointer)
{
    //console.log("drag",pointer.active);
    if(!pointer.active)
        return;
    
    this.dragScreen = true;
    this.dragPoint.x = pointer.x;
    this.dragPoint.y = pointer.y;
}
BatttleInputHandler.prototype.clickedHex = function(pointer,b)
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

    if(GlobalEvents.currentacion != GlobalEvents.WALK)
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
        if(this.game.currentacion==this.game.WALK)
        {
            //this.gameref.map.playerCharacter.moveto(moveIndex);
        }
    }
} 