/*
this.jsondata.destroyed - object has been destroy

//move?, state?
//seperate the graphics from the data

//need to remember where they are and what state they are in for scene changes

*/
var InteractiveObject = function (maingame, jsondata) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    this.jsondata = jsondata;

    this.jsondata.state = "idle";
    
    this.eventDispatcher = new EventDispatcher(this.game,this.maingame,this);
    this.eventDispatcher.init(this.jsondata.triggers);

    this.setupArt(this.jsondata);

    //this.events.onInputDown.add(this.handleClick, this);    
    this.setupReactToAction();
    this.inputEnabled = true;
    //
    var actions = this.jsondata.triggers;
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actorset")
        {
            this.actor = maingame.globalHandler.getActorByID(actions[i].id);
            //maingame.globalHandler.getActorByID
        }
        if(actions[i].type=="animations")
        {
            var animations = actions[i].animations;
            var tempanimation;
            for(var j=0;j<animations.length;j++)
            {
                //console.log(animations[j].id,animations[j].name);
                if(animations[j].start==0&&animations[j].stop==0){
                    tempanimation = this.animations.add(animations[j].id,[animations[j].name+".png"], 1, animations[j].loop, false);
                }
                else{
                    tempanimation =  this.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(animations[j].name, animations[j].start, animations[j].stop, '.png', 4), 12, animations[j].loop, false);
                }
            }
            /*if(tempanimation!=null)
            {
                tempanimation.onComplete.add(function () {
                    this.changeState(animations[0].nextState);
                }, this);
            }*/
            //will try this - if the animation doesn't look, it will go to base
            //eventual should setup next
            //this.animations.currentAnim.onComplete.add(function () {
            //    this.animations.play(animations[0].id);
            //}, this);
        }
    }
    if(this.actor){
        this.changeState(this.actor.getValue("state"));
    }
    else{
        this.changeState("idle");
    }
    //
    //
    //this will move
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnActivate");
}
InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = MovingCharacter;
//
//  
InteractiveObject.prototype.changeState = function(newstate) 
{
    this.animations.play(newstate);
    if(this.actor)
        this.actor.updateValue("state",newstate);
}
InteractiveObject.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = this[fnstring];
    fnparams = fnparams.split(',');
    if (typeof fn === "function") 
    {
        fn.apply(this, fnparams);
    }
}
InteractiveObject.prototype.moveto = function(tox,toy) 
{
    console.log("moveto",tox,toy);
    if(tox!=null)
        var tile = this.maingame.hexHandler.getTileByCords(tox,toy);
    console.log(tile);
    if(tile)
    {
        tile.addChild(this);
    }
}
InteractiveObject.prototype.destroySelf = function(elapseTime) 
{
    this.jsondata.destroyed = true;
    this.eventDispatcher.destroy();
    this.events.onInputDown.remove(this.handleClick, this);  
    this.events.onInputOver.remove(this.handleOver, this);//for rollover
    this.events.onInputOut.remove(this.handleOut, this);
    this.destroy();
}
InteractiveObject.prototype.handleOver = function() 
{
    this.tint = 0x00ffff;
}
InteractiveObject.prototype.handleOut = function() 
{
    this.tint = 0xffffff;
}

InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupReactToAction = function() 
{
    this.events.onInputDown.add(this.handleClick, this);
    this.events.onInputOver.add(this.handleOver, this);//for rollover
    this.events.onInputOut.add(this.handleOut, this);
}
InteractiveObject.prototype.handleClick = function() 
{
    if(GlobalEvents.currentacion == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentacion == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch");
    else if(GlobalEvents.currentacion == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook");
    else if(GlobalEvents.currentacion == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk");
    else if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.eventDispatcher.doAction("OnUseItem");
}
InteractiveObject.prototype.setupArt = function(json) 
{
    var objectreference = this.maingame.getTile(this.jsondata.name,this.jsondata.tilesetid);
    var spotx = this.jsondata.x;
    var spoty = this.jsondata.y;//this.maingame.gridSizeY-this.jsondata.y-1;
    Phaser.Sprite.call(this, this.game, this.jsondata.offsetx*this.maingame.hexHandler.hexagonWidth, this.jsondata.offsety*this.maingame.hexHandler.hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");

    this.maingame.hexHandler.hexagonArray[spoty][spotx].addChild(this);
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
}
/*

function playWhenFinished(name) {
  // is this sprite currently animating?
  if (sprite.isPlaying) {
    // yes, so play the next animation when this one has finished
    sprite.animations.onComplete.addOnce(function() {
      sprite.animations.play(name, 30, false);
    }, this);
  }
  else {
    // no, so play the next animation now
    sprite.animations.play(name, 30, false);  
  }
}
 
 */