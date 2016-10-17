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
        this.gameref.camera.adjustPosition(-diffx, -diffy);
        return;
    }
    if(GlobalEvents.currentAction != GlobalEvents.WALK)
    {
        //return;
    }
    if(this.game.global.pause)
    {
        return;
    }
    //these number have to be adjuested 94, 60?
    //85, 51
    //var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x+ this.gameref.map.hexHandler.halfHex/2) / this.gameref.map.scaledto;
    //var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y+ this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight) / this.gameref.map.scaledto;
    
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x) / this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y) / this.gameref.map.scaledto;

    //pointerx -= this.gameref.map.hexHandler.halfHex;
    //pointery += this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);
    
    /*var playertile = this.gameref.map.hexHandler.checkHex(
        this.gameref.map.playerCharacter.x + this.gameref.map.hexHandler.halfHex/2, this.gameref.map.playerCharacter.y + this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight);*/
    //console.log(moveIndex.posx,moveIndex.posy);
    var playertile = this.gameref.map.hexHandler.checkHex( this.gameref.map.playerCharacter.x, this.gameref.map.playerCharacter.y);
    //console.log("width "+moveIndex.width,moveIndex.height);
    //console.log(playertile,this.gameref.map.playerCharacter.x, this.gameref.map.playerCharacter.y);
    if(moveIndex)
    {
        //this.gameref.map.hexHandler.sprite.x = playertile.x;
        //this.gameref.map.hexHandler.sprite.y = playertile.y;// - this.gameref.map.hexHandler.bottomOffset;
        //this.tiletest.y = moveIndex.y;
    }
    //console.log(playertile);
    //console.log(playertile.posx,playertile.posy,this.playerCharacter.x,this.playerCharacter.y);
   // if(moveIndex)
    //    console.log(moveIndex.posx,moveIndex.posy);

    //console.log(this.input.worldX,this.gameref.map.mapGroup.x,this.input.worldX-this.gameref.map.mapGroup.x);

    //this.gameref.map.highlightHex.doShowPath(this.gameref.pathfinder,playertile,moveIndex);
    this.gameref.map.hexHandler.dolines(playertile, moveIndex, false, this.gameref.map.highlightHex);
    //var fridges = this.gameref.map.hexHandler.doFloodFill(moveIndex,3,false,true);
    //this.gameref.map.highlightHex.drawFringes(fridges);
    //this.gameref.map.highlightHex.moveCursor(moveIndex);
    //this.gameref.map.highlightHex.highilightneighbors(playertile);
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
    if (!pointer.withinGame) { return; }
    
    //console.log("hex",pointer.active);
    
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
            this.gameref.map.playerCharacter.moveto(moveIndex, {x:pointerx, y:pointery});
        }
    }
} 