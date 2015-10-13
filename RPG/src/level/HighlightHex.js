var HighlightHex = function (game, maingame, hexhandler)
{
    Phaser.Group.call(this, game, null);
    this.game = game;
    this.maingame = maingame;
    
    this.hexhandler = hexhandler;
    this.showNumbers = true;
    
    this.neighborLights = [];
    
    this.showPath = true;//set this false to cancel any callbacks being shown
    
    this.type = "Iso";
}
HighlightHex.prototype = Object.create(Phaser.Group.prototype);
HighlightHex.constructor = HighlightHex;

HighlightHex.prototype.setup = function() 
{
    this.neighborLights = [];
    for(var i=0;i<210;i++)
    {
        var light = this.add(new Phaser.Group(this.game,null));
        var high;
        //console.log(this.hexhandler.tiletype);
        //
        if(this.hexhandler.tiletype=="HexIso")
            high = this.add(new Phaser.Sprite(this.game, 0,0, "tiles2", "tile_highlight0002.png"));
        else
            high = this.add(new Phaser.Sprite(this.game, 0,0, "tiles2", "halfiso_highlight.png"));
        //
        this.neighborLights.push(light);
        light.add(high);
        this.add(light);
        
        if(this.showNumbers)
        {
         /*   var hexagonText = new Text(this.game, 25,25, i+"",{});
            hexagonText.font = "arial";
            hexagonText.fontSize = 12;
            light.add(hexagonText);
            light.x = -1000;*/
        }
        light.x = -1000;
        light.visible = false;
    }
}
//
HighlightHex.prototype.drawFringes = function(fringes) 
{
    if(fringes==null)
        return;
    //console.log(fringes);
    this.cleanuptiles();
    var tempArray = [];
    for(var i=0;i<fringes.length;i++)
    {
        for(var j=0;j<fringes[i].length;j++)
        {
            tempArray.push(fringes[i][j]);
        }
    }
    for(var i=0;i<tempArray.length;i++)
    {
        this.highlighttilebytile(i,tempArray[i]);
    }
}
//
HighlightHex.prototype.doShowPath = function(pathfinder, fromtile, totile) 
{
    if(totile!=null)
    {
        if(fromtile)
        {
            this.showPath = true;
            pathfinder.setCallbackFunction(this.showPathCallback, this);
            pathfinder.preparePathCalculation( [fromtile.posx,fromtile.posy], [totile.posx,totile.posy] );
            pathfinder.calculatePath();
        }
    }
}
//
HighlightHex.prototype.showPathCallback = function(path) 
{
    if(!this.showPath)
        return;
    this.cleanuptiles();
    if(path==null||path.length==0)
        return;
    for(var i=0;i<path.length;i++)
    {
        var overtile = this.hexhandler.getTileByCords(path[i].x,path[i].y);
        if(overtile!=null)
        {
            //if(!overtile.walkable);//&&!ignoreWalkable)
            //    break;
            //tiles.push(overtile);
            this.highlighttilebytile(i,overtile);
        }
    }
}
HighlightHex.prototype.hidePath = function() 
{
    this.showPath = false;
}
//debug calls
HighlightHex.prototype.drawDebugLine = function(fromtile, totile) 
{
    if(moveIndex&&totile)
    {
        this.hexHandler.dolines(fromtile,totile,false, this);
    }
}//this really should be asking hexhandler got get neighbours
HighlightHex.prototype.highilightneighbors = function(thistile) 
{
    if(thistile==null)
        return;
    if(this.type=="Iso")
    {
        if(thistile.posy % 2 == 1)
        {
            this.highlighttileoffset(0, 1,    -1, thistile);
            this.highlighttileoffset(1, 1,   1, thistile);
            this.highlighttileoffset(2, 0,    1, thistile);
            this.highlighttileoffset(3, 0,   -1, thistile);
        }
        else
        {
            this.highlighttileoffset(0,  0,  -1, thistile);
            this.highlighttileoffset(1,  0,   1, thistile);
            this.highlighttileoffset(2, -1,   1, thistile);
            this.highlighttileoffset(3, -1,  -1, thistile);
        }
    }
    if(this.type=="HexIsoFallout")
    {
        if(thistile.posx % 2 == 1)
        {
            this.highlighttileoffset(0, 0,    -1, thistile);
            this.highlighttileoffset(1, -1,   0, thistile);
            this.highlighttileoffset(2, 0,    +1, thistile);
            this.highlighttileoffset(3, +1,   +1, thistile);
            this.highlighttileoffset(4, +1,   0, thistile);
            this.highlighttileoffset(5, -1,   1, thistile);
        }
        else
        {
            this.highlighttileoffset(0, -1,   -1, thistile);
            this.highlighttileoffset(1, -1,   0, thistile);
            this.highlighttileoffset(2, 0,    +1, thistile);
            this.highlighttileoffset(3, +1,   0, thistile);
            this.highlighttileoffset(4, 0,    -1, thistile);
            this.highlighttileoffset(5, 1,   -1, thistile);
        }
    }
}
//
HighlightHex.prototype.highlighttileoffset = function(i,x,y,currenttile)
{
    
    var thetile = this.hexhandler.getTileByCords(currenttile.posx+x,currenttile.posy+y);
    if(thetile!=null)
    {
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = thetile.x;
        this.neighborLights[i].y = thetile.y;
    }
}
HighlightHex.prototype.cleanuptiles = function()
{
    for(var i=0;i<this.neighborLights.length;i++)
    {
        this.neighborLights[i].x = -1000;
        this.neighborLights[i].visible = false;
    }
}
HighlightHex.prototype.highlighttilebytile = function(i,currenttile)
{
    if(this.neighborLights[i]==null)
        return;
    if(currenttile!=null)
    {
        //console.log(i,currenttile);
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = currenttile.x;
        this.neighborLights[i].y = currenttile.y;
    }
    else
    {
        this.neighborLights[i].x = -1000;
        this.neighborLights[i].y = 0;
    }
}