//characters that will be moving around the map using the patherfinder
//
//
var MovingCharacter = function (maingame, jsondata) 
{
    InteractiveObject.call(this, maingame, jsondata);
    //
    this.oldTile=null;
    
    //
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    //
    this.prevx;
    this.prevy;
    //
    this.dir = new Phaser.Point();
    
    this.walkspeed = 0.1875;
    var actions = this.jsondata.triggers;
    //
    this.actionsaftermove;
    this.objectmovingto;
    this.movingtotile=null;
    //
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="mover")
            this.walkspeed = actions[i].walkSpeed;
    }
    
    //
    //this.inventory = [];
    
};
MovingCharacter.prototype = Object.create(InteractiveObject.prototype);
MovingCharacter.constructor = MovingCharacter;
//
MovingCharacter.prototype.isMoving = function() 
{
   if(this.dir.x == 0 && this.dir.y == 0)
       return false;
    return true;
}
/*MovingCharacter.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}*/
//
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.x = inx;
    this.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    this.x = tile.x+this.maingame.hexHandler.halfHex;
    this.y = tile.y+this.maingame.hexHandler.halfHexHeight;
    this.oldTile = tile;
    this.currentTile = tile;
    //
    this.updateLocation(tile);
    
    this.findtile();
    
    this.currentTile.changeWalkable(false);
}
//this is only avaliable to players - for when we have multiple players moving around
MovingCharacter.prototype.gotoAnotherMap = function(map, tile) 
{
}
//
MovingCharacter.prototype.setDirection = function() 
{
    //console.log(this.nextTile.x,this.maingame.hexHandler.halfHex,this.nextTile.x+this.maingame.hexHandler.halfHex, this.nextTile.x-this.maingame.hexHandler.halfHex);
    this.dir.x =  this.nextTile.x+this.maingame.hexHandler.halfHex-this.x;
    this.dir.y =  this.nextTile.y+this.maingame.hexHandler.halfHexHeight-this.y;
    this.dir.normalize();
    //console.log(this.nextTile);
}
MovingCharacter.prototype.setPath = function(path) 
{
    if(!path)
        return;
    if(path.length<=0)
        return;
    if(this.objectmovingto!=null && this.objectmovingto.footprint!=null)
    {
        this.movingtotile = this.maingame.hexHandler.findClosesInPath(this.objectmovingto.currentTile, this.objectmovingto.footprint, path);
    }
    
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = path[this.pathlocation];//this.maingame.hexHandler.getTileByCords( path[this.pathlocation].x, path[this.pathlocation].y);
    this.setDirection();
    this.animations.play("walk");
}
MovingCharacter.prototype.moveToObject = function(object,tile,actions)
{
    this.objectmovingto = object;
    //
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    //
    this.moveto(tile);
    //find closes hex
    this.actionsaftermove = actions;
    this.objectmovingto = object;
}
MovingCharacter.prototype.moveto = function(moveIndex){
    if(moveIndex!=null)
    {
        if(this.objectmovingto!=null && this.objectmovingto.areWeNeighbours(this.currentTile)){
            this.atTargetTile();
        }
        else
        {
            //straight line movement
            //var path = this.hexHandler.getlinepath(playertile,moveIndex);
            //this.playerCharacter.setPath(path);
            //
            this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
            this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx,moveIndex.posy] );
            this.maingame.pathfinder.calculatePath();

            this.clearTargetTile();
            this.movingtotile = moveIndex;
        }
    }
}
MovingCharacter.prototype.movercallback = function(path){
    path = path || [];
    path = this.maingame.hexHandler.pathCoordsToTiles(path);
    this.setPath(path);
}
MovingCharacter.prototype.atTargetTile = function()
{
    if(this.actionsaftermove)
    {
        //should pass what type of action it is
        this.changeState("use");
    }   
}
MovingCharacter.prototype.clearTargetTile = function()
{
    this.actionsaftermove = null;
    this.movingtotile = null;
    this.objectmovingto = null;
}
MovingCharacter.prototype.findtile = function()
{
    var onmap = this.maingame.spritegrid.PosToMap(this.x,this.y);
    //console.log("--",onmap.x,onmap.y);
   // onmap = this.maingame.spritegrid.GetMapCoords(onmap.x,onmap.y);
    this.posx = onmap.x;
    this.posy = onmap.y;
  //  console.log("find tile",this.posx,this.posy);
}
//
MovingCharacter.prototype.doUse = function()
{
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
    this.changeState("idle");
}
//
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.currentTile==null)
        this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
    if(this.oldTile==null)
        this.finalSetup();
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //need to test if next spot is now not walkable
            this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
            if(this.oldTile != this.currentTile)
            {
                this.oldTile.changeWalkable(true);
                this.oldTile = this.currentTile;
                this.currentTile.changeWalkable(false);
            }

            if(this.currentTile==null)
            {
                //center old then try again
            }
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)// at last tile, now walk to the center
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.x+this.maingame.hexHandler.halfHex;
                    var testy = this.currentTile.y+this.maingame.hexHandler.halfHexHeight;
                    
                    var range = 3;
                    if(testx-range<this.x && testx+range>this.x && testy-range<this.y && testy+range>this.y)
                    {
                        this.x = testx;
                        this.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile();
                        this.animations.play("idle");
                        //
                        if(this.objectmovingto!=null && this.currentTile!=null){
                            //console.log(this.objectmovingto,this.currentTile,this.objectmovingto.areWeNeighbours(this.currentTile));
                            if(this.objectmovingto.areWeNeighbours(this.currentTile)){
                                this.atTargetTile();
                            }
                        }
                    }
                    this.setDirection();
                }
                else//find next tile
                {
                    this.nextTile = this.path[this.pathlocation]; 
                    this.setDirection();
                }
                this.updateLocation(this.currentTile);
                //activate currenttile as onenter
            }
        }
    }
    var nextx = this.x + this.dir.x * this.walkspeed * elapseTime;
    var nexty = this.y + this.dir.y * this.walkspeed * elapseTime;
    
    //test if next coords are both walkable and moveable, else
    //may not need prevx, can just use x
    if(this.prevx != nextx || this.prevy != nexty)
    {
        this.x = nextx;
        this.y = nexty;
        this.findtile();
        
        this.prevx = this.x;
        this.prevy = this.y;
    }
    //
    if(this.dir.x<0)
        this.scale.x = -1;
    else if(this.dir.x>0)
        this.scale.x = 1;
    
}

    //this.animations.play("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.animations.play('idle', 30, true);
    }, this);*/