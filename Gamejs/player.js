var MovingCharacter = function (maingame, name) 
{
    
    this.maingame = maingame;
    this.name = name;
    this.sprite = this.maingame.make.sprite(0,0, "characters","movingPerson2.png");
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
    
    this.oldTile;
    this.currentTile;
    
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    this.dir = new Phaser.Point();
    this.walkspeed = 0.1875;
};
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.sprite.x = inx;
    this.sprite.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    this.sprite.x = tile.tileImage.x+this.maingame.halfHex;
    this.sprite.y = tile.tileImage.y+this.maingame.halfHex;
    this.oldTile = tile;
    this.currentTile = tile;
}
MovingCharacter.prototype.setDirection = function() 
{
    this.dir.x =  this.nextTile.tileImage.x+this.maingame.halfHex-this.sprite.x;
    this.dir.y =  this.nextTile.tileImage.y+this.maingame.halfHex-this.sprite.y;
    this.dir.normalize();
}
MovingCharacter.prototype.setPath = function(path) 
{
    //
    this.path = path;
    //console.log(this.path );
    this.pathlocation = 0;
    this.nextTile = this.maingame.getTileByCords(path[this.pathlocation].x,path[this.pathlocation].y);
    this.setDirection();
    //this.path = null;
}
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //console.log(this.path);
            this.currentTile = this.maingame.checkHex(this.sprite.x,this.sprite.y);
            /*if(this.oldTile!=this.currentTile)
            {
                this.oldTile=this.currentTile;
                this.currentTile.enterTile();
            }*/
            //console.log(this.currentTile,this.nextTile);
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.tileImage.x+this.maingame.halfHex;
                    var testy = this.currentTile.tileImage.y+this.maingame.halfHex;
                    var range = 1;
                    if(testx-range<this.sprite.x && testx+range>this.sprite.x && testy-range<this.sprite.y && testy+range>this.sprite.y)
                    {
                        this.sprite.x = testx;
                        this.sprite.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile();
                    }
                    this.setDirection();
                }
                else
                {
                    this.nextTile = this.maingame.getTileByCords(this.path[this.pathlocation].x,this.path[this.pathlocation].y);
                    this.setDirection();
                }
            }
        }
    }
    this.sprite.x += this.dir.x * this.walkspeed * elapseTime;
    this.sprite.y += this.dir.y * this.walkspeed * elapseTime;
    //flip facing direction x?
    if(this.dir.x<0)
        this.sprite.scale.x = -1;
    else if(this.dir.x>0)
        this.sprite.scale.x = 1;
}