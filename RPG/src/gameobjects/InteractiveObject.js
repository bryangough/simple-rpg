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
    this.otherAnimations = [];
    
    this.baseImage;
    
    this.notcreated = false;
}
InteractiveObject.prototype = Object.create(Phaser.Group.prototype);
//InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = InteractiveObject;

InteractiveObject.prototype.allowInputNow = function(val) 
{
    if(this.baseImage==null)
        return;
    this.baseImage.inputEnabled = val;
    if(this.baseImage.input!=null)
        this.baseImage.input.priorityID = 100;
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
    this.allowInputNow(true);
    this.setupReactToAction();
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnActivate", null);
    //
    if(!this.notcreated)
        this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
    this.finalSetup();
    //
}
InteractiveObject.prototype.finalSetup = function()     
{
    
}
InteractiveObject.prototype.applyInteractActions = function(actions)
{
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
                this.footprint.push(this.map.hexHandler.getTileByCords( actions[i].tiles[j].posx, actions[i].tiles[j].posy) );
            }
        }
        else if(actions[i].type=="CharacterSpawn")
        {   
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, actions[i].conditions);
            if( this.eventDispatcher.testConditions(con) )
            {
                var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
                if(enemy!=null && enemy.triggers!=null)
                {
                    this.applyInteractActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
            }
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
    //console.log("created",this.isCreated, this);
    if(!this.isCreated)
    {
        actions.spriteSheet = actions.spriteSheet || "actors2";
        this.createTempArt(actions.spriteSheet,"body1_human_idle_0001");
    }
    //
    for(var j=0;j<animations.length;j++)
    {
        if(animations[j].start==0 && animations[j].stop==0){
            tempanimation = this.baseImage.animations.add(animations[j].id, [animations[j].name+".png"], 1, animations[j].loop, false);
        }
        else{
            tempanimation =  this.baseImage.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(animations[j].name+"_", animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
        }
        if(animations[j].onComplete)
        {
            tempanimation.onComplete.add(function () {
                //console.log("onComplete");
                this.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
            }, {stateNum:j,caller:this});
        }
    } 
    //console.log(this.baseImage.animations);
    if(actions.otherName != null)
    {
        var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
        head.anchor.x = 0.5;
        head.anchor.y = 1.0;
        this.addChild(head);
        this.otherAnimations.push(head);
        
        this.addOtherAnimation(animations, head, false, actions.otherName);
    }  
    if(actions.weapon != null)
    {
        var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
        head.anchor.x = 0.5;
        head.anchor.y = 1.0;
        this.addChild(head);
        this.otherAnimations.push(head);
        this.setChildIndex(head,0);
        this.addOtherAnimation(animations, head, false, actions.weapon);
    }  
    this.savedAnimations = animations;
}
InteractiveObject.prototype.addOtherAnimation = function(animations, addTo, doOnComplete, otherName)
{
    for(var j=0;j<animations.length;j++)
    {
        if(animations[j].start==0 && animations[j].stop==0){
            tempanimation = addTo.animations.add(animations[j].id, [otherName + animations[j].justName+".png"], 1, animations[j].loop, false);
        }
        else{
            tempanimation =  addTo.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(otherName + animations[j].justName+"_", animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
        }
        if(animations[j].onComplete && doOnComplete)
        {
            tempanimation.onComplete.add(function () {
                addTo.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
            }, {stateNum:j,caller:this});
        }
    }  
}
InteractiveObject.prototype.createTempArt = function(spritesheet,image) //character art or guy not yet spawned
{
    //console.log("createTempArt ", spritesheet,image);
    Phaser.Group.call(this, this.game, null);
    this.baseImage = this.game.make.sprite(
                        0,
                        0,
                       spritesheet, image+".png");
    this.addChild(this.baseImage);
    this.map.objectGroup.add(this);
    this.baseImage.anchor.x = 0.5;
    this.baseImage.anchor.y = 1.0;
    this.isCreated = true;
    this.otherAnimations.push(this.baseImage);
    
    //console.log(this.posx, this.posy);
    if(this.posx != undefined && this.posy != undefined)
        this.setLocationByTile(this.map.hexHandler.getTileByCords(this.posx, this.posy));
}
InteractiveObject.prototype.setupArt = function(json) 
{
    if(json.name!=undefined && json.tilesetid!=undefined)
    {
        //console.log("setupart", this, json.name);
        this.isCreated = true;
        var objectreference = this.map.getTile(json.name,json.tilesetid);
        var spotx = json.x || 0;
        var spoty = json.y || 0;

        this.posx = json.posx || 0;
        this.posy = json.posy || 0;
        var tile = this.map.hexHandler.getTileByCords(spotx,spoty);

        Phaser.Group.call(this, this.game, null);
        
        /*Phaser.Sprite.call(this, this.game, 
                           spotx + this.map.objectoffset.x,
                            spoty*-1 + this.map.objectoffset.y,
                           objectreference.spritesheet, objectreference.tile+".png");
        */
        
        //console.log(this, objectreference.spritesheet, objectreference.tile);
        
        this.baseImage = this.game.make.sprite(spotx + this.map.objectoffset.x,
                            spoty*-1 + this.map.objectoffset.y,
                           objectreference.spritesheet, objectreference.tile+".png");
        this.addChild(this.baseImage);
        this.baseImage.anchor.x = 0.5;
        this.baseImage.anchor.y = 1.0;
        this.otherAnimations.push(this.baseImage);
        this.map.objectGroup.add(this);
    }
}
//
//  
InteractiveObject.prototype.changeState = function(newstate) 
{
    //need to test if state exists
    //console.log("caller is " + arguments.callee.caller.toString(), newstate);
    
    if(this.hasstates)
    {
        if(this.baseImage)
        {
            var nextAnimation = this.baseImage.animations.getAnimation(newstate);
            
            //console.log(this,nextAnimation);
            
            if(nextAnimation)
            {
                this.baseImage.play(newstate);

                for(var i=0;i<this.otherAnimations.length;i++)
                {
                    if(this.otherAnimations[i] != undefined && this.otherAnimations[i].animations.getAnimation(newstate) != undefined)
                       this.otherAnimations[i].animations.play(newstate);
                }

                if(this.actor)
                    this.actor.updateValue("state",newstate);
                this.jsondata.state = newstate;
                //console.log(this.jsondata, newstate);
            }
            else
            {
                console.log(this,newstate,"state doesn't exist.");
            }
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

InteractiveObject.prototype.deSpawn = function() 
{
    this.destroySelf();
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
    this.flushAll();
}
InteractiveObject.prototype.flushAll = function() 
{
    if(this.animations!=null)
    {
        this.animations.stop();
        this.animations.destroy();
    }
    this.eventDispatcher.destroy();
    if(this.baseImage)
    {
        this.baseImage.events.onInputUp.remove(this.handleClick, this);  
        this.baseImage.events.onInputOver.remove(this.handleOver, this);//for rollover
        this.baseImage.events.onInputOut.remove(this.handleOut, this);
    }
    this.destroy();
    console.log(this,"- destroy -");
}
InteractiveObject.prototype.handleOver = function() 
{
    this.baseImage.tint = 0x00ffff;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = 0x00ffff;
    }
    
    if(this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this.jsondata.displayName, this.x, this.y);
    }
}
InteractiveObject.prototype.handleOut = function() 
{
    this.baseImage.tint = 0xffffff;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = 0xffffff;
    }
    
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
    if(this.baseImage==null)
        return;
    this.baseImage.events.onInputUp.add(this.handleClick, this);
    this.baseImage.events.onInputOver.add(this.handleOver, this);//for rollover
    this.baseImage.events.onInputOut.add(this.handleOut, this);
}
InteractiveObject.prototype.handleClick = function(touchedSprite, pointer) 
{
    if(GlobalEvents.currentAction == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentAction == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.ITEM)
        this.eventDispatcher.doAction("OnUseItem", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
    {
        if(this.attackable)
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