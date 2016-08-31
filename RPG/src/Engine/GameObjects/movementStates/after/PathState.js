PathState = function (statemachine, game, gameref, mover) {
    this.mover = mover;
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.path = null;
    this.startOfPath = null;
    this.currentPoint = null;
    this.onEnterDo = null;
    this.delay = 0;
}
PathState.prototype = Object.create(EmptyState.prototype);
PathState.constructor = WanderState;

PathState.prototype.init = function(map) 
{
}
PathState.prototype.update = function(elapsedTime) 
{
 
/*    if(this.onEnterDo)
    {
        console.log(" ", this.onEnterDo)
        
        if(this.onEnterDo.eventDispatcher)
            this.onEnterDo.eventDispatcher.doAction("OnEnter", this.mover);
        this.onEnterDo = null;
    }*/
    /*if(this.goalTile==null)
    {
        this.atTargetTile();
    }*/
    if(this.delay>0)
    {
        this.delay -= elapsedTime;
        if(this.delay<=0)
        {
            this.delay = 0;
            this.doTileState();
        }
    }
}
PathState.prototype.render = function() 
{
    
}
PathState.prototype.onEnter = function(params) 
{
    if(params.length<2)
        return;
    
    this.path = params[0];
    this.pathData = this.gameref.map.getPath(this.path);
    if(this.pathData==null)
        return;
    this.startOfPath = this.pathData.getPointByName(params[1]);
    this.currentPoint = this.startOfPath;
    var target = this.gameref.map.hexHandler.getTileByCords(this.currentPoint.posx, this.currentPoint.posy);
    if(params[2])
    {
        this.mover.jumpTo(target);
    }
    else
    {
        this.mover.moveToSpot(target);
    }
}
PathState.prototype.onExit = function() 
{
    this.path = null;
    this.startOfPath = null;
    this.currentPoint = null;
    this.mover.moveToCenter();
}
PathState.prototype.setPath = function(path, pathStart)
{
    
}
PathState.prototype.atTargetTile = function()
{
    this.onEnterDo = this.currentPoint;

    if(this.pathData==null)
        return;
    
    if(this.currentPoint.delay>0)
    {
        this.delay = this.currentPoint.delay;
    }
    else
    {
       this.doTileState(); 
    }
}
PathState.prototype.doTileState = function()
{
    this.currentPoint = this.pathData.getNextPoint(this.currentPoint);
    if(this.currentPoint==null)
    {
        //end path state
        this.mover.changeMoveState("idle");
    }
    else
    {
        //goto next path
        var target = this.gameref.map.hexHandler.getTileByCords(this.currentPoint.posx, this.currentPoint.posy);
        this.mover.moveToSpot(target);
    }
    
    //may move this later
    if(this.onEnterDo.eventDispatcher)
            this.onEnterDo.eventDispatcher.doAction("OnEnter", this.mover);
    this.onEnterDo = null;
}