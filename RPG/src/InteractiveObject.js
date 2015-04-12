/*
this.jsondata.destroyed - object has been destroy

//move?, state?


*/
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
//
//  
InteractiveObject.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = this[fnstring];
    fnparams = fnparams.split(',');
    if (typeof fn === "function") 
    {
        fn.apply(this, fnparams);
    }
}
InteractiveObject.prototype.destroySelf = function(elapseTime) 
{
    this.jsondata.destroyed = true;
    this.eventDispatcher.destroy();
    this.events.onInputDown.remove(this.handleClick, this);  
    //this.events.onInputOver.remove(, this);//for rollover
    //this.events.onInputOut.remove(, this);
    this.destroy();
}
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