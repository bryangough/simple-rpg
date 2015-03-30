var MovingCharacter = function (maingame, name) 
{
    
    this.maingame = maingame;
    this.name = name;
    this.sprite = this.maingame.make.sprite(0,0, "actors","movingPerson2_idle0001.png");
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
    
    //basic animations
    //next proper direction facing
    this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('movingPerson2_idle', 1, 2, '.png', 4), 1, true, false);
    this.sprite.animations.add('walk', Phaser.Animation.generateFrameNames('movingPerson2_walk', 1, 4, '.png', 4), 8, true, false);
    
    this.sprite.animations.play("idle");
    
    /*this.sprite.animations.currentAnim.onComplete.add(function () {
       this.sprite.animations.play('idle', 30, true);
    }, this);*/
    
    this.oldTile;
    this.currentTile;
    
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    this.dir = new Phaser.Point();
    this.walkspeed = 0.1875;
    
    
    this.inventory = [];
    
};
MovingCharacter.prototype.isMoving = function() 
{
   if(this.dir.x == 0 && this.dir.y == 0)
       return false;
    return true;
}
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
    if(!path)
        return;
    if(path.length<=0)
        return;
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = this.maingame.getTileByCords(path[this.pathlocation].x,path[this.pathlocation].y);
    this.setDirection();
    this.sprite.animations.play("walk");
}
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            this.currentTile = this.maingame.checkHex(this.sprite.x,this.sprite.y);
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.tileImage.x+this.maingame.halfHex;
                    var testy = this.currentTile.tileImage.y+this.maingame.halfHex;
                    var range = 3;
                    if(testx-range<this.sprite.x && testx+range>this.sprite.x && testy-range<this.sprite.y && testy+range>this.sprite.y)
                    {
                        this.sprite.x = testx;
                        this.sprite.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile();
                        this.sprite.animations.play("idle");
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
    
    if(this.dir.x<0)
        this.sprite.scale.x = -1;
    else if(this.dir.x>0)
        this.sprite.scale.x = 1;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
//Student.prototype = Object.create(Person.prototype); 
//Student.prototype.constructor = Student;

var InteractiveObject = function (maingame, jsondata) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    this.jsondata = jsondata;
    //art for the object here
    
    //
    var actions = this.jsondata.actions;
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actionconvtrigger")
            this.handleActionConvTrigger(actions[i]);
        else if(actions[i].type=="actorset")
            this.handleActorSet(actions[i]);
        else if(actions[i].type=="actiontext")
            this.handleActionText(actions[i]);
    }
    //
    this.setupArt();
}
InteractiveObject.prototype.handleActorSet = function(json) 
{
}
InteractiveObject.prototype.handleActionConvTrigger = function(json) 
{
}
InteractiveObject.prototype.handleActionText = function(json) 
{
}
InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupArt = function(json) 
{
    var objectreference = this.maingame.getTile(this.jsondata.name,this.jsondata.tilesetid);
    var spotx = this.jsondata.x;
    var spoty = this.maingame.gridSizeY-this.jsondata.y-1;//gridSizeY-jsondata.y-1;
    var tileobject = this.game.make.sprite(this.jsondata.offsetx*this.maingame.hexagonWidth, this.jsondata.offsety*this.maingame.hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");
    this.maingame.hexagonArray[spoty][spotx].tileImage.addChild(tileobject);
    tileobject.anchor.x = 0.5;
    tileobject.anchor.y = 1.0;
}
/*
 {
    "type": "actionconvtrigger",
    "trigger": "OnTalk",
    "convid": 1,
    "once": false,
    "skipIfNoValidEntries": false
},
{
    "type": "actorset",
    "ActorName": "Crab"
},
{
    "type": "actiontext",
    "lookatactive": true,
    "lookat": "A baby crab trying to get your attention."
}

*/