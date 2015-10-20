//characters that will be moving around the map using the patherfinder
//
//
var MovingCharacter = function (maingame, jsondata, map)
{
    InteractiveObject.call(this, maingame, jsondata, map);
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
    this.applyMoverActions(actions);
    this.movetoCenterEvery = true;
    this.douse = true;
    //
    //this.inventory = [];
    this.limit = -1;
    
};
MovingCharacter.prototype = Object.create(InteractiveObject.prototype);
MovingCharacter.constructor = MovingCharacter;
//
MovingCharacter.prototype.applyMoverActions = function(actions)
{
    //console.log("applyMoverActions",this);
    
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="mover")
        {
            //console.log(this);
            this.walkspeed = actions[i].walkSpeed;
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
                    this.applyMoverActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
            }
        }
        else if(actions[i].type=="AnimatedBody")
        {
            var body = this.maingame.getGameData("AnimatedBodies",actions[i].body);
            //console.log(body,actions[i].body);
            if(body!=null && body.triggers!=null)
            {
                this.applyMoverActions(body.triggers);
                this.applyInteractActions(body.triggers);
                if(this.savedAnimations != undefined && actions[i].playerHead != "")
                {
                     var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
                    head.anchor.x = 0.5;
                    head.anchor.y = 1.0;
                    this.addChild(head);
                    this.otherAnimations.push(head);

                    this.addOtherAnimation(this.savedAnimations, head, false, actions[i].playerHead);
                }  
            }
        }
    }
}

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
MovingCharacter.prototype.finalSetup = function()     
{
    //this.currentTile = null;
    
    this.setLocationByTile(this.currentTile);
}

MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.x = inx;
    this.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    //console.log(this);
    if(tile==null)
        tile  = this.map.hexHandler.getTileByCords(this.posx, this.posy);
    this.x = tile.x+this.map.hexHandler.halfHex;
    this.y = tile.y+this.map.hexHandler.halfHexHeight;
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
    //console.log(this.nextTile.x,this.map.hexHandler.halfHex,this.nextTile.x+this.map.hexHandler.halfHex, this.nextTile.x-this.map.hexHandler.halfHex);
    this.dir.x =  this.nextTile.x+this.map.hexHandler.halfHex-this.x;
    this.dir.y =  this.nextTile.y+this.map.hexHandler.halfHexHeight-this.y;
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
        this.movingtotile = this.map.hexHandler.findClosesInPath( this.objectmovingto.currentTile, this.objectmovingto.footprint, path);
    }
    
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = path[this.pathlocation];//this.map.hexHandler.getTileByCords( path[this.pathlocation].x, path[this.pathlocation].y);
    this.setDirection();
    this.changeState("walk");
}
MovingCharacter.prototype.moveToObject = function(object, tile, actions)
{
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    //
    this.moveto(tile);
    //find closes hex
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    this.douse = true;
}
MovingCharacter.prototype.moveToSpotByCoords = function(x, y, actions)
{
    var tile = this.maingame.map.hexHandler.getTileByCords(x, y);
    if(tile!=null)
        this.moveToSpot(tile, actions);
    this.limit = -1;
}
MovingCharacter.prototype.moveToSpot = function(tile, actions)
{
    this.actionsaftermove = actions;
    this.moveto(tile);
    this.actionsaftermove = actions;
    this.douse = false;
    this.limit = -1;
}
MovingCharacter.prototype.moveToSpotCombat = function(tile, actions, limit)
{
    this.actionsaftermove = actions;
    this.moveto(tile);
    this.actionsaftermove = actions;
    this.douse = false;
    this.limit = limit;
    //console.log("moveToSpotCombat ", this.limit);
}
MovingCharacter.prototype.moveto = function(moveIndex){
    if(moveIndex!=null)
    {
        if(this.currentTile==null)
        {
            this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
            this.setLocationByTile(this.currentTile);
        }
        if(this.objectmovingto!=null && this.objectmovingto.areWeNeighbours(this.currentTile)){
            this.atTargetTile();
        }
        else
        {
            //straight line movement
            //var path = this.hexHandler.getlinepath(playertile,moveIndex);
            //this.playerCharacter.setPath(path);
            //
            if(this.currentTile.posx == moveIndex.posx && this.currentTile.posy == moveIndex.posy)
            {
                path = this.map.hexHandler.checkHex(moveIndex.posx,moveIndex.posy);
            }
            else
            {
                this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
                this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx, moveIndex.posy] );
                this.maingame.pathfinder.calculatePath();

                this.clearTargetTile();
                this.movingtotile = moveIndex;
            }
        }
    }
}
MovingCharacter.prototype.movercallback = function(path){
    path = path || [];
    path = this.map.hexHandler.pathCoordsToTiles(path);
    this.setPath(path);
    this.maingame.map.highlightHex.showPathCallback(path);
}
MovingCharacter.prototype.atTargetTile = function()
{
    if(this.actionsaftermove)
    {
        //should pass what type of action it is
        if(this.objectmovingto!=null)
        {
            //face object
        }
        if(this.douse)
        {
            this.changeState("use");
        }   
        else
        {
            this.changeState("idle");
            this.eventDispatcher.completeAction(this.actionsaftermove, true);
            this.clearTargetTile();
        }
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
    var onmap = this.map.spritegrid.PosToMap(this.x,this.y);
   // onmap = this.map.spritegrid.GetMapCoords(onmap.x,onmap.y);
    if(onmap.x!=-1)
    {
        this.posx = onmap.x;
        this.posy = onmap.y;
    }
}
//
MovingCharacter.prototype.doUse = function()
{
    this.changeState("idle");
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
}
MovingCharacter.prototype.faceTarget = function(target)
{
    if(this.x<target.x)
        this.scale.x = 1;
    else
        this.scale.x = -1;
}
//
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.notcreated)
        return;
    
    if(this.currentTile==null)
    {
        this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
        //console.log(this.x, this.y, this);
        this.setLocationByTile(this.currentTile);
    }
    if(this.oldTile==null)
        this.finalSetup();

    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //need to test if next spot is now not walkable
            this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
            //console.log(this.oldTile, this.currentTile);
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
                if(this.limit>0 && !this.IsPlayer)
                {
                    this.limit--;
                    //console.log("step",this.limit);
                }
                //
                if(this.pathlocation>=this.path.length || this.limit==0)// at last tile, now walk to the center
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.x+this.map.hexHandler.halfHex;
                    var testy = this.currentTile.y+this.map.hexHandler.halfHexHeight;
                    
                    var range = 3;
                    if(testx-range<this.x && testx+range>this.x && testy-range<this.y && testy+range>this.y)
                    {
                        this.x = testx;
                        this.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile(this);
                        this.changeState("idle");
                        //
                        if(this.objectmovingto!=null && this.currentTile!=null){
                            if(this.objectmovingto.areWeNeighbours(this.currentTile)){
                                this.atTargetTile();
                            }
                        }
                        else
                        {
                            this.atTargetTile();
                        }
                    }
                    this.setDirection();
                }
                else//find next tile
                {
                    this.nextTile = this.path[this.pathlocation]; 
                    //console.log(this.nextTile);
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
    //this should be changed?
    if(this.dir.x<0)
        this.scale.x = -1;
    else if(this.dir.x>0)
        this.scale.x = 1;
}

    //this.changeState("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.changeState('idle', 30, true);
    }, this);*/