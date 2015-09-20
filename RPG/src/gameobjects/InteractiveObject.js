/*
this.jsondata.destroyed - object has been destroy

//move?, state?
//seperate the graphics from the data

//need to remember where they are and what state they are in for scene changes

extra states
state
destroyed - if destroyed don't recreate on enter


*/
var InteractiveObject = function (maingame, jsondata, map) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    this.map = map;
    
    this.jsondata = jsondata;

    //this.jsondata.state = "idle";    
    this.posx;//sprite locations
    this.posy;
    this.currentTile=null;//moveable location
    this.hasstates = false;
    this.isCreated = false;
    this.eventDispatcher = new EventDispatcher(this.game,this.maingame,this);
}
InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = InteractiveObject;
InteractiveObject.prototype.allowInput = function(val) 
{
    this.inputEnabled = val;
    if(this.input!=null)
        this.input.priorityID = 100;
}
InteractiveObject.prototype.dosetup = function() 
{
    this.setupArt(this.jsondata);
    this.footprint;//
    //this.events.onInputDown.add(this.handleClick, this);    
    
    //
    var actions = this.jsondata.triggers;
    this.applyInteractActions(actions);
    
    if(this.actor&&this.actor.getValue("state")!=""){
        this.changeState(this.actor.getValue("state"));
    }
    else{
        if(this.jsondata.state1="")
            this.changeState(this.jsondata.state);
        else
            this.changeState("idle");
    }
    //
    //
    //this will move
    this.allowInput(true);
    this.setupReactToAction();
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnActivate", null);
    //
    this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
    this.finalSetup();
}
InteractiveObject.prototype.finalSetup = function()     
{
    
}
InteractiveObject.prototype.applyInteractActions = function(actions)
{
    //console.log("applyInteractActions",this);
    
    this.eventDispatcher.init(actions);
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actorset")
        {
            this.actor = this.maingame.globalHandler.getActorByID(actions[i].id);
            //maingame.globalHandler.getActorByID
        }
        else if(actions[i].type=="walkTiles")
        {
            this.footprint = [];
            for(var j=0;j<actions[i].tiles.length;j++)
            {
                this.footprint.push(this.map.hexHandler.getTileByCords(actions[i].tiles[j].posx,actions[i].tiles[j].posy));
            }
        }
        else if(actions[i].type=="CharacterSpawn")
        {
            var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
            if(enemy!=null && enemy.triggers!=null)
                this.applyInteractActions(enemy.triggers)
        }
        else if(actions[i].type=="animations")
        {
            this.applyAnimations(actions[i]);
        }
    }
}
InteractiveObject.prototype.applyAnimations = function(actions)
{
    var animations = actions.animations;
    var tempanimation;
    var complete;
    this.hasstates = true;
    if(!this.isCreated)
        this.createTempArt(actions.spriteSheet,"movingPerson1_idle0001");
    for(var j=0;j<animations.length;j++)
    {
        if(animations[j].start==0&&animations[j].stop==0){
            tempanimation = this.animations.add(animations[j].id,[animations[j].name+".png"], 1, animations[j].loop, false);
        }
        else{
            tempanimation =  this.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(animations[j].name, animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
        }
        if(animations[j].onComplete)
        {
            tempanimation.onComplete.add(function () {
                this.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
            }, {stateNum:j,caller:this});
        }
    }   
}
InteractiveObject.prototype.createTempArt = function(spritesheet,image) //character art or guy not yet spawned
{
    Phaser.Sprite.call(this, this.game, 
                        0,
                        0,
                       spritesheet, image+".png");
    this.map.objectGroup.add(this);
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
    this.isCreated = true;
}
InteractiveObject.prototype.setupArt = function(json) 
{
    if(json.name!=undefined && json.tilesetid!=undefined)
    {
        this.isCreated = true;
        var objectreference = this.map.getTile(json.name,json.tilesetid);
        var spotx = json.x || 0;
        var spoty = json.y || 0;

        this.posx = json.posx || 0;
        this.posy = json.posy || 0;
        var tile = this.map.hexHandler.getTileByCords(spotx,spoty);

        Phaser.Sprite.call(this, this.game, 
                           spotx + this.map.objectoffset.x,
                            spoty*-1 + this.map.objectoffset.y,
                           objectreference.spritesheet, objectreference.tile+".png");
        this.map.objectGroup.add(this);
        this.anchor.x = 0.5;
        this.anchor.y = 1.0;
    }
}
//
//  
InteractiveObject.prototype.changeState = function(newstate) 
{
    //need to test if state exists
    
    if(this.hasstates)
    {
        var nextAnimation = this.animations.getAnimation(newstate);
        if(nextAnimation)
        {
            this.animations.play(newstate);
            if(this.actor)
                this.actor.updateValue("state",newstate);
            this.jsondata.state = newstate;
        }
        else
        {
            console.log(this,newstate,"state doesn't exist.");
        }
    }
    else
    {
        this.jsondata.state = newstate;
    }
}
InteractiveObject.prototype.testTHISValues = function(variablein,compare,value)
{
    var variable = this[variablein];
    if(variable==null||variable==undefined)
    {
        variable = this.jsondata[variablein];
    }
    if(compare=="Is")
        return (variable == value);
    if(compare=="IsNot")
        return (variable != value);
    if(compare=="Less")
        return (variable < value);
    if(compare=="Greater")
        return (variable > value);
    if(compare=="LessEqual")
        return (variable <= value);
    if(compare=="GreaterEqual")
        return (variable >= value);
    return false;
}
InteractiveObject.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = this[fnstring];
    fnparams = fnparams.split(',');
    if (typeof fn === "function") {
        fn.apply(this, fnparams);
    }
}
InteractiveObject.prototype.moveto = function(tox,toy) 
{
    if(tox!=null)
        var tile = this.map.hexHandler.getTileByCords(tox,toy);
    if(tile)
    {
        var currenttile = this.map.hexHandler.checkHex(this.x,this.y);
        currenttile.changeWalkable(true);
        this.x = tile.x;
        this.y = tile.y;
        tile.changeWalkable(false);
        this.updateLocation(tile);
    }
    //
    this.handleOut();
}
InteractiveObject.prototype.areWeNeighbours = function(fromtile)
{
    if(this.footprint){
        for(var i=0;i<this.footprint.length;i++){
            if(fromtile==this.footprint[i])
                return true;
            if(this.map.hexHandler.areTilesNeighbors(this.footprint[i],fromtile))
                return true;
        }
    }
    if(fromtile==this.currentTile)
        return true;
    if(this.map.hexHandler.areTilesNeighbors(this.currentTile,fromtile))
        return true;
    return false;
}
InteractiveObject.prototype.updateLocation = function(tile)
{
    this.jsondata.x = tile.posx;
    this.jsondata.y = tile.posy;
    
    //moving characters should always be in middle
    //this.jsondata.posx = tile.x;
    //this.jsondata.posy = tile.y;
}
 
InteractiveObject.prototype.destroySelf = function(elapseTime) 
{
    this.jsondata.destroyed = true;
    this.eventDispatcher.destroy();
    this.events.onInputUp.remove(this.handleClick, this);  
    this.events.onInputOver.remove(this.handleOver, this);//for rollover
    this.events.onInputOut.remove(this.handleOut, this);
    this.destroy();
}
InteractiveObject.prototype.handleOver = function() 
{
    this.tint = 0x00ffff;
    if(this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this);
    }
}
InteractiveObject.prototype.handleOut = function() 
{
    this.tint = 0xffffff;
    if(this.maingame.textUIHandler)
    {
        this.maingame.textUIHandler.hideRollover();
    }
}
//
InteractiveObject.prototype.setWalkable = function(walkableto) 
{
    
    if(this.footprint)
    {
        for(var i=0;i<this.footprint.length;i++)
        {
            
            this.footprint[i].changeWalkable(walkableto);
        }
    }
    else
    {
        this.currentTile.changeWalkable(walkableto);
    }
}
//
InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupReactToAction = function() 
{
    this.events.onInputUp.add(this.handleClick, this);
    this.events.onInputOver.add(this.handleOver, this);//for rollover
    this.events.onInputOut.add(this.handleOut, this);
}
InteractiveObject.prototype.handleClick = function(touchedSprite, pointer) 
{
    //console.log("handle click",this.input, this.inputtest, this);
    if(GlobalEvents.currentacion == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentacion == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch", this.map.playerCharacter);
    else if(GlobalEvents.currentacion == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook", this.map.playerCharacter);
    else if(GlobalEvents.currentacion == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk", this.map.playerCharacter);
    else if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.eventDispatcher.doAction("OnUseItem", this.map.playerCharacter);
    else if(GlobalEvents.currentacion == GlobalEvents.COMBATSELECT)
    {
        this.maingame.gGameMode.mCurrentState.inputHandler.clickedObject(this);
    }
    pointer.active = false;
    this.handleOut();
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