var MovingCharacter = function (maingame, game, name) 
{
    Phaser.Sprite.call(this, game, 0,0, "actors","movingPerson2_idle0001.png");
    this.game = game;
    this.maingame = maingame;
    this.name = name;
    this.IsPlayer = true;
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
    
    //basic animations
    //next proper direction facing
    this.animations.add('idle', Phaser.Animation.generateFrameNames('movingPerson2_idle', 1, 2, '.png', 4), 1, true, false);
    this.animations.add('walk', Phaser.Animation.generateFrameNames('movingPerson2_walk', 1, 4, '.png', 4), 8, true, false);
    
    this.animations.play("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.animations.play('idle', 30, true);
    }, this);*/
    
    this.oldTile;
    this.currentTile;
    
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    this.dir = new Phaser.Point();
    this.walkspeed = 0.1875;

    //this.inventory = [];
    
};
MovingCharacter.prototype = Object.create(Phaser.Sprite.prototype);
MovingCharacter.constructor = MovingCharacter;

MovingCharacter.prototype.isMoving = function() 
{
   if(this.dir.x == 0 && this.dir.y == 0)
       return false;
    return true;
}
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.x = inx;
    this.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    this.x = tile.x+this.maingame.hexHandler.halfHex;
    this.y = tile.y+this.maingame.hexHandler.halfHex;
    this.oldTile = tile;
    this.currentTile = tile;
}
MovingCharacter.prototype.setDirection = function() 
{
    this.dir.x =  this.nextTile.x+this.maingame.hexHandler.halfHex-this.x;
    this.dir.y =  this.nextTile.y+this.maingame.hexHandler.halfHex-this.y;
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
    this.nextTile = this.maingame.hexHandler.getTileByCords(path[this.pathlocation].x,path[this.pathlocation].y);
    this.setDirection();
    this.animations.play("walk");
}
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.x+this.maingame.hexHandler.halfHex;
                    var testy = this.currentTile.y+this.maingame.hexHandler.halfHex;
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
                else
                {
                    this.nextTile = this.maingame.hexHandler.getTileByCords(this.path[this.pathlocation].x,this.path[this.pathlocation].y);
                    this.setDirection();
                }
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
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
//Student.prototype = Object.create(Person.prototype); 
//Student.prototype.constructor = Student;

var InteractiveObject = function (maingame, jsondata) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    this.jsondata = jsondata;

    this.eventDispatcher = new EventDispatcher(this.game,this.maingame,this);
    this.eventDispatcher.init(this.jsondata.triggers);

    this.setupArt(this.jsondata);
    //if(this.eventDispatcher.onTalkAction)
    //{
    //}
    this.events.onInputDown.add(this.handleClick, this);    
    this.inputEnabled = true;
    
    //console.log(this.actions);
    /*for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actorset")
            this.handleActorSet(actions[i]);
        else if(actions[i].type=="actiontext")
            this.handleActionText(actions[i]);
    }*/
    //
}
InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = MovingCharacter;


InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupReactToAction = function() 
{
    this.events.onInputDown.add(handleClick, this);
    //this.events.onInputOver.add(, this);//for rollover
    //this.events.onInputOut.add(, this);
}
InteractiveObject.prototype.handleClick = function() 
{
    console.log("object clicked",GlobalEvents.currentacion);
    if(GlobalEvents.currentacion == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentacion == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch");
    else if(GlobalEvents.currentacion == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook");
    else if(GlobalEvents.currentacion == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk");
    
}
InteractiveObject.prototype.setupArt = function(json) 
{
    var objectreference = this.maingame.getTile(this.jsondata.name,this.jsondata.tilesetid);
    var spotx = this.jsondata.x;
    var spoty = this.maingame.gridSizeY-this.jsondata.y-1;
    Phaser.Sprite.call(this, this.game, this.jsondata.offsetx*this.maingame.hexHandler.hexagonWidth, this.jsondata.offsety*this.maingame.hexHandler.hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");

    this.maingame.hexHandler.hexagonArray[spoty][spotx].addChild(this);
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
}
//******
var InventoryEngine = function (maingame, jsondata) 
{
}
InventoryEngine.prototype.enterInventory = function() 
{
}