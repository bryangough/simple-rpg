//HexHandler - Normal flat hex
//DiamondHexHandler - Squished hex. Width x2 Height.
//IsoHandler - Flat iso. Width x2 Height.
//Square - Width = Height Squares (may not need seperate)
//FlatSquare - Width x2 Height

/*
    Hex = 1,//
	Iso = 2,//
	HexIsoFallout = 4,//
	HexIsoFalloutStaggard = 8,//
	HexIso = 16,//?
	Square = 32
*/

// fix flood fills! Iso is right.


var HexHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    this.maingame = maingame;
    this.game = game;
    this.debug = true;
    this.tiletype = tiletype;
    
    //for flood fill
    this.visited = [];
    this.fringes = [];
    
    this.hexagonArray = [];
    //this.columns = [Math.ceil(this.gridSizeX/2),Math.floor(this.gridSizeX/2)];//needed?
    
    this.waterTilesArray = [];//should be moved out into tile graphics handler
    
    this.hexagonWidth = hexagonWidth || 32;
    this.hexagonHeight = hexagonHeight || 16;

    this.sectorWidth = this.hexagonWidth;
    this.sectorHeight = this.hexagonHeight/4*3;
    
    this.halfHex = this.hexagonWidth/2;
    this.halfHexHeight = this.hexagonHeight/2;
    
    this.gradient = (this.hexagonHeight/4)/(this.hexagonWidth/2);

    //var sprite = new Phaser.Image(game,0,0,"standardimages","hextiletouchmap");
    if(this.tiletype=="HexIso")
        this.sprite = new Phaser.Image(game,0,0,"standardimages","hexmousemap1");//mousemap
    else
        this.sprite = new Phaser.Image(game,0,0,"standardimages","mousemapiso");
    
    this.touchmap = new Phaser.BitmapData (game,"touchmap",100, 50);
	this.touchmap.draw(this.sprite, 0, 0);
	this.touchmap.update();
    //this.maingame.highlightGroup.add(this.sprite);
    this.tempcolour = {r:0,g:0,b:0}
};
HexHandler.prototype.update=function(elapsedTime)
{
    if(this.waterTilesArray)
    {
        var length = this.waterTilesArray.length;
        for(var i = 0; i < length; i ++)
        {
            this.waterTilesArray[i].step(elapsedTime);
        }
    }
}

HexHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;

    var deltaX = (checkx)%this.sectorWidth;
    var deltaY = (checky)%this.sectorHeight; 

    
    var candidateX = Math.floor((checkx)/this.sectorWidth);
    var candidateY = Math.floor((checky)/this.sectorHeight);
    
    if(candidateY%2==0){
        if(deltaY<((this.hexagonHeight/4)-deltaX*this.gradient)){
            candidateX--;
            candidateY--;
        }
        if(deltaY<((-this.hexagonHeight/4)+deltaX*this.gradient)){
            candidateY--;
        }
    }    
    else{
        if(deltaX>=this.hexagonWidth/2){
            if(deltaY<(this.hexagonHeight/2-deltaX*this.gradient)){
                candidateY--;
            }
        }
        else{
            if(deltaY<deltaX*this.gradient){
                candidateY--;
            }
            else{
                candidateX--;
            }
        }
    }
    if(this.maingame.gridSizeY%2==0 && candidateY%2==1)
    {
       //candidateX++;
        if(candidateX<0)
            candidateX = 0;
    }
    if(candidateX<0 || candidateY<0 || candidateY>=this.maingame.gridSizeY || candidateX>=this.maingame.gridSizeX)
    {
        return;
    }
    return this.hexagonArray[candidateX][candidateY]
 }
HexHandler.prototype.getTileByCords = function(x,y)
{
    if(this.hexagonArray[x])
        if(this.hexagonArray[x][y])
            return this.hexagonArray[x][y];
    return null;
}
        
//Returns tile that hits. 
HexHandler.prototype.lineTest = function(tilestart, tileend)
{
    var p0 = new Point(tilestart.x+this.halfHex, tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, tileend.y+this.halfHexHeight);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = Math.ceil(N/this.cut,0)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    for(var i=0;i<points.length;i++){
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null){
            if(!overtile.walkable)
                return overtile;
        }
        else
            return null;
    }
    return tileend;
};
//
HexHandler.prototype.testRange = function(tilestart, tileend, ignoreWalkable)
{
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);

    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    /*var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = Math.ceil(N/cut);
    
    /*
    this.maingame.graphics.clear();
    this.maingame.graphics.lineStyle(10, 0xffd900, 1);
    this.maingame.graphics.moveTo(tilestart.x+ this.maingame.map.mapGroup.x+ this.halfHex, tilestart.y+ this.maingame.map.mapGroup.y+ this.halfHexHeight);
    this.maingame.graphics.lineTo(tileend.x+ this.maingame.map.mapGroup.x+ this.halfHex, tileend.y+ this.maingame.map.mapGroup.y+ this.halfHexHeight);
    
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }*/
    
    return N;
    
}
HexHandler.prototype.lineOfSite = function(tilestart, tileend)
{
    if(tilestart==null||tileend==null)
        return;
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);
    
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = Math.ceil(N/cut)+1;
    
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    //console.log("start");
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null)
        {
            //console.log("step ",overtile);
            if(overtile==tileend)
            {
                return true;
            }
            if(!overtile.walkable && overtile!=tilestart)
            {
                return false;
            }
            
        }
    }
    return true;
};
HexHandler.prototype.dolines = function(tilestart, tileend, ignoreWalkable, highlight)
{
    if(tilestart==null||tileend==null)
        return;
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);
    //
    if(this.debug)
    {
        this.maingame.graphics.clear();
        this.maingame.graphics.lineStyle(10, 0xffd900, 1);
       // this.maingame.graphics.moveTo(tilestart.x+ this.maingame.mapGroup.x+ this.halfHex, tilestart.y+ this.maingame.mapGroup.y+ this.halfHexHeight);
       // this.maingame.graphics.lineTo(tileend.x+ this.maingame.mapGroup.x+ this.halfHex, tileend.y+ this.maingame.mapGroup.y+ this.halfHexHeight);
    }
    //
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = Math.ceil(N/cut)+1;
    
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    if(this.debug)
    {
        this.maingame.graphics.lineStyle(0);
        this.maingame.graphics.beginFill(0x00FF0B, 0.5);
    }
    var pasttile = null
    if(highlight)
        highlight.cleanuptiles();
    //points.reverse();
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x, points[i].y);
        if(this.debug)
        {
            //this.maingame.graphics.drawCircle(points[i].x+this.maingame.map.mapGroup.x, points[i].y+this.maingame.map.mapGroup.y, 10);
        }
        if(overtile!=null)
        {
            if(!overtile.walkable && !ignoreWalkable && overtile!=tilestart && overtile!=tileend)
            {
                break;
            }
            tiles.push(overtile);
            if(highlight)
                highlight.highlighttilebytile(i, overtile);//debug
        }
    }
    if(this.debug)
        this.maingame.graphics.endFill();
    //  
    return tiles;
};
HexHandler.prototype.getlinepath = function(tilestart, tileend, ignoreWalkable)
{
    if(tilestart==null||tileend==null)
        return;
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    
    N = Math.ceil(N/cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    var pasttile = null
    for(var i=1;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x, points[i].y);
        if(overtile!=null)
        {
            console.log(points[i].x, points[i].y, overtile.posx, overtile.posy, overtile.walkable)
            if(!overtile.walkable&&!ignoreWalkable)
            {
                break;
            }
            tiles.push(overtile);
        }
    }
    //  
    return tiles;
};
HexHandler.prototype.round_point = function(p) {
    return new Point(Math.round(p.x), Math.round(p.y));
};
HexHandler.prototype.lerp = function(start, end, t) {
    return start + t * (end-start);
};
HexHandler.prototype.lerp_point = function(p0, p1, t) {
    return new Point(this.lerp(p0.x, p1.x, t),
                     this.lerp(p0.y, p1.y, t));
};     
//
HexHandler.prototype.doFloodFill = function(tile,range,ignorefirst)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    //if(!ignorefirst)
        this.fringes.push([tile]);
    //else
    //    this.fringes.push([]);

    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            if(n.posx % 2 == 1)
            {
                this.addNeighbor(n, 0,    -1, k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1, k);
                this.addNeighbor(n, +1,   +1, k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1, k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1, k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1, k);
                this.addNeighbor(n, 1,   -1, k);
            }
        }
    }
    return this.fringes;
};
HexHandler.prototype.addNeighbor=function(fromtile,x,y,k)
{
    x = fromtile.posx+x;
    y = fromtile.posy+y;
    var tile = this.getTileByCords(x,y);
    if(tile!=null)
    {
        //console.log(tile,tile.walkable);
        if(tile.walkable&&this.visited.indexOf(tile)==-1)
        {
            this.visited.push(tile);
            this.fringes[k].push(tile);
        }
    }
};
HexHandler.prototype.getFrigesAsArray=function()
{
    var tempArray = [];
    for(var i=0;i<fridges.length;i++)
    {
        for(var j=0;j<fridges[i].length;j++)
        {
            tempArray.push(fridges[i][j]);
        }
    }
    return tempArray;
};
//
HexHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    var posx = starttile.x-testtile.x;
    var posy = starttile.y-testtile.y;
    //
    //console.log("HexHandler",posx,posy);
    //
    if(starttile.x % 2 == 1)
    {
        if(posx==0&&posy==-1)return true;
        if(posx==-1&&posy==0 )return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==-1&&posy==1)return true;
    }
    else
    {
        if(posx==-1&&posy==-1)return true;
        if(posx==-1&&posy==0)return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==0&&posy==-1)return true;
        if(posx==1&&posy==-1)return true;
    }
    return false;
}
//currenttile should be last, if any tiles exist in path then that becomes the whole path
HexHandler.prototype.findClosesInPath = function(currenttile, tiles, path)
{
    var lowestj = -1;
    var lowesti = -1;
    for(var i=path.length;i>0;i--){
        for(var j = 0; j<tiles.length; j++){
            if(path[i]===tiles[j]){
                lowesti = i;
                lowestj = j;
            }
        }
    }
    if(lowesti!=-1){
        path = path.splice(lowesti,path.length-lowesti);
        return tiles[j];
    }
    else{
        return currenttile;
    }
}
HexHandler.prototype.pathCoordsToTiles = function(path)
{
    newpath = [];
    for(var i=0;i<path.length;i++)
    {
        var overtile = this.getTileByCords(path[i].x,path[i].y);
        if(overtile!=null && overtile.walkable)
        {
            newpath.push(overtile);
        }
    }
    return newpath;
}
HexHandler.prototype.flush=function()
{
    this.hexagonArray = [];
    this.waterTilesArray = [];
    //this.walkableArray = [];
}

/*HexHandler.GetMapCoords = function(type,coords,width,height,i,j)
{
    //flip y over unity
    if(type=="Hex")
    {
        coords.x = width*i;
        coords.x += width/2*(j%2);
        
        coords.y = (height/4*3)*j;
    }
    else if(type=="HexIso")
    {
        var offset = Math.floor(i/2);
        coords.x = width*i + width/2*j;
        coords.y = (height/4*3)*j; 

        coords.x -= width/2 * offset;
        coords.y -= (height/4*3) * offset;
    }
    else if(type=="HexIsoFallout")
    {
        coords.x = 48 * i + 32 * j;
        coords.y = -24 * j + 12 * i;
        coords.y *= -1;
        //offset
        coords.x += 16;
        coords.y -= 4;
    }
}*/
