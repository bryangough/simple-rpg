//characters that will be moving around the map using the patherfinder
//
//
var MovingCharacter = function (maingame, jsondata) 
{
    InteractiveObject.call(this, maingame, jsondata);
    //
    this.oldTile;
    this.currentTile;
    //
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    //
    this.dir = new Phaser.Point();
    
    this.walkspeed = 0.1875;
    var actions = this.jsondata.triggers;
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
MovingCharacter.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
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
}
//this is only avaliable to players - for when we have multiple players moving around
MovingCharacter.prototype.gotoAnotherMap = function(map, tile) 
{

}
//
MovingCharacter.prototype.setDirection = function() 
{
    this.dir.x =  this.nextTile.x+this.maingame.hexHandler.halfHex-this.x;
    this.dir.y =  this.nextTile.y+this.maingame.hexHandler.halfHexHeight-this.y;
    this.dir.normalize();
}
MovingCharacter.prototype.setPath = function(path) 
{
    //
    if(!path)
        return;
    if(path.length<=0)
        return;
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = path[this.pathlocation];//this.maingame.hexHandler.getTileByCords( path[this.pathlocation].x, path[this.pathlocation].y);
    this.setDirection();
    this.animations.play("walk");
}
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //need to test if next spot is now not walkable
            this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
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
    this.x += this.dir.x * this.walkspeed * elapseTime;
    this.y += this.dir.y * this.walkspeed * elapseTime;
    
    if(this.dir.x<0)
        this.scale.x = -1;
    else if(this.dir.x>0)
        this.scale.x = 1;
}

    //this.animations.play("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.animations.play('idle', 30, true);
    }, this);*/