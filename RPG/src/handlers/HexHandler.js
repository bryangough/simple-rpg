//HexHandler - Normal flat hex
//DiamondHexHandler - Squished hex. Width x2 Height.
//IsoHandler - Flat iso. Width x2 Height.
//



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

    //var sprite = new Phaser.Image(game,0,0,"tiles2","hextiletouchmap.png");
    if(this.tiletype=="HexIso")
        this.sprite = new Phaser.Image(game,0,0,"tiles2","hexmousemap1.png");//mousemap
    else
        this.sprite = new Phaser.Image(game,0,0,"tiles2","mousemapiso.png");
    
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
    N = this.game.math.ceil(N/this.cut)+1;
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
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(this.debug)
        {
            this.maingame.graphics.drawCircle(points[i].x+this.maingame.map.mapGroup.x, points[i].y+this.maingame.map.mapGroup.y, 10);
        }
        if(overtile!=null)
        {
            if(!overtile.walkable && !ignoreWalkable && overtile!=tilestart && overtile!=tileend)
            {
                break;
            }
            tiles.push(overtile);
            if(highlight)
                highlight.highlighttilebytile(i,overtile);//debug
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
    N = this.game.math.ceil(N/cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    var pasttile = null
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null)
        {
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
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, -1,   0 ,k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1,k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1,k);
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
        if(overtile!=null)
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
/*
    Hex = 1,//
	Iso = 2,//
	HexIsoFallout = 4,//
	HexIsoFalloutStaggard = 8,//
	HexIso = 16,//?
	Square = 32
*/
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
// 
var DiamondHexHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    HexHandler.call(this, maingame, game, hexagonWidth, hexagonHeight, tiletype);
}
DiamondHexHandler.prototype = Object.create(HexHandler.prototype);
DiamondHexHandler.constructor = DiamondHexHandler;
//inside triangle test
//http://www.emanueleferonato.com/2012/06/18/algorithm-to-determine-if-a-point-is-inside-a-triangle-with-mathematics-no-hit-test-involved/
DiamondHexHandler.prototype.isInsideTriangle=function(A,B,C,P){
    var planeAB = (A.x-P.x)*(B.y-P.y)-(B.x-P.x)*(A.y-P.y);
    var planeBC = (B.x-P.x)*(C.y-P.y)-(C.x - P.x)*(B.y-P.y);
    var planeCA = (C.x-P.x)*(A.y-P.y)-(A.x - P.x)*(C.y-P.y);
    return this.sign(planeAB)==this.sign(planeBC) && this.sign(planeBC)==this.sign(planeCA);
}
DiamondHexHandler.prototype.sign = function(n){
			return Math.abs(n)/n;
}
//
DiamondHexHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    //
    var width = this.hexagonWidth;
    var height = this.hexagonHeight/4*3;
    
    var i = checkx/width - checky/(2*height);
    var j = checky/height + Math.floor(i/2);

    //console.log(checkx,checky,i,j);
    
    i = Math.floor(i);
    j = Math.floor(j);

    if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
    var tile = this.hexagonArray[i][j];
    //
    //var isInside = this.isInsideTriangle(new Point(tile.x,tile.y),new Point(tile.x+24,tile.y+16),new Point(tile.x,tile.y+16),new Point(checkx,checky));
    //console.log(isInside);
    if(tile==null)
        return;
    this.touchmap.update();
    var hex = this.touchmap.getPixel32(checkx-tile.x, checky-tile.y);
    var r = ( hex       ) & 0xFF; // get the r
    var g = ( hex >>  8 ) & 0xFF; // get the g
    var b = ( hex >> 16 ) & 0xFF; // get the b
    
    if(r>0&&g>0&&b>0||r==0&&g==0&&b==0)//end because on white or nothing (nothing?)
        return tile;
    
    if(r==0&&g>0&&b>0)//go right
    {
        //console.log("r");
        if(i%2==0){
            i++;
        }
        else{
            i++;
            j++;
        }
    }
    else if(r>0&&g==0&&b==0)//up left
    {
        //console.log("1");
        j--;
    }
    else if(r>0&&g>0&&b==0)//up right
    {
        //console.log("2");
        if(i%2==0){
            i++;
            j--;
        }
        else{
            i++;
        }
    }
    else if(r==0&&g>0&&b==0)//down left
    {
        //console.log("3");
        if(i%2==0){
            i--;
        }
        else{
            i--;
            j--;
        }
    }
    else if(r==0&&g==0&&b>0)//down right
    {
        //console.log("4");
        j++;
    }
    else
    {
        //console.log(r,g,b);
    }
    if(i<0 || j<0 || j>=this.maingame.movementgrid.gridSizeY || i>=this.maingame.movementgrid.gridSizeX)
    {
        return;
    }
    //console.log(i,j,this.maingame.movementgrid.gridSizeY,this.maingame.movementgrid.gridSizeX);
    tile = this.hexagonArray[i][j]; 
    return tile;
 }
DiamondHexHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    if(starttile==null||testtile==null)
        return false;
    var posx = starttile.posx-testtile.posx;
    var posy = starttile.posy-testtile.posy;
    //
    //console.log("DiamondHexHandler",posx,posy);
    //
    if(starttile==testtile)
        return true;
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
DiamondHexHandler.prototype.doFloodFill = function(tile,range,ignorefirst)
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
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, -1,   0 ,k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1,k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, 1,   -1, k);
            }
        }
    }
    return this.fringes;
};
//
var IsoHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    HexHandler.call(this, maingame, game, hexagonWidth, hexagonHeight, tiletype);
}
IsoHandler.prototype = Object.create(HexHandler.prototype);
IsoHandler.constructor = IsoHandler;
//
IsoHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    
    var i = Math.floor(checkx / (this.hexagonWidth - 2));
    var j = Math.floor(checky / (this.hexagonHeight - 1)) * 2;

    var xQuadrant = Math.floor(checkx % (this.hexagonWidth - 2));
    var yQuadrant = Math.floor( checky % (this.hexagonHeight - 1));

    
    if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
    tile = this.hexagonArray[i][j]; 
    if(tile!=null)
    {
        //this.sprite.x = tile.x;
        //this.sprite.y = tile.y;
    }
    //
    this.touchmap.update();
    this.touchmap.getPixelRGB (xQuadrant, yQuadrant, this.tempcolour);
    
    //console.log(this.tempcolour,xQuadrant, yQuadrant,this.touchmap);
    //
    //console.log(this.tempcolour,xQuadrant, yQuadrant);
    if(this.tempcolour.r==0xFF && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0xFF0000: // red top left        
        i--;
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0xFF && this.tempcolour.b==0x00)
    {
        //case 0x00FF00: // green top right
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0x000000: // black bottom left
        i--;
        j++;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0xFF)
    {
        //case 0x0000FF: // blue bottom right
        j++;
    }
    //  
    if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
    tile = this.hexagonArray[i][j]; 
    return tile;
 }
IsoHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    if(starttile==null||testtile==null)
        return false;
    
    
    var posx = starttile.posx-testtile.posx;
    var posy = starttile.posy-testtile.posy;
    
    //console.log(posx,posy);
    //
    //console.log("IsoHandler",posx,posy);
    //
    if(starttile==testtile)
        return true;
    //console.log(starttile, starttile.y);
    if(starttile.y % 2 == 1)
    {
        if(posx==1&&posy==-1)return true;
        if(posx==1&&posy==1 )return true;
        if(posx==0&&posy==1)return true;
        if(posx==0&&posy==-1)return true;
    }
    else
    {        
        if(posx==0&&posy==-1)return true;
        if(posx==0&&posy==1)return true;
        if(posx==-1&&posy==1)return true;
        if(posx==-1&&posy==-1)return true;
    }
    return false;
}
IsoHandler.prototype.doFloodFill = function(tile,range,ignorefirst)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    if(!ignorefirst)
    {
        this.fringes.push([tile]);
    }
    else
    {
        this.fringes.push([]);
        this.findNieghbors(tile,0);
    }

    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            this.findNieghbors(n,k);
        }
    }
    return this.fringes;
};
IsoHandler.prototype.findNieghbors = function(n, k)
{
    if(n.posy % 2 == 1)
    {
        this.addNeighbor(n, 1,    -1,k);
        this.addNeighbor(n, 1,     1,k);
        this.addNeighbor(n, 0,    1,k);
        this.addNeighbor(n, 0,   -1,k);
    }
    else
    {
        this.addNeighbor(n, 0,   -1,k);
        this.addNeighbor(n, 0,   1, k);
        this.addNeighbor(n, -1,    +1,k);
        this.addNeighbor(n, -1,   -1, k);
    }
}
/*
for grid:
http://fifengine.net/fifesvnrepo/tags/2007.1/src/engine/map/gridgeometry.cpp
for hex:
http://fifengine.net/websvn/filedetails.php?repname=fife&path=/trunk/core/src/engine/map/hexgeometry.cpp&rev=870&peg=875&template=BlueGrey
Point HexGeometry::toScreen(const Point& pos) const {
        int32_t w  = m_basesize.x;
        int32_t h  = m_basesize.y;
        int32_t dx  = m_transform.x;
        int32_t dy  = m_transform.y;
        return Point(m_offset.x - (pos.x*w - (pos.x/2)*dx - pos.y * h),
                 m_offset.y + (pos.x/2)*dy + pos.y*dy);
}

Point HexGeometry::fromScreen(const Point& pos) const {
        int32_t dx  = m_transform.x;
        int32_t dy  = m_transform.y;

        Point p2((pos.x - m_offset.x)/(-dx), (pos.y - m_offset.y)/dy);
        p2.x = (p2.x + p2.y)/2;
        p2.y = p2.y - p2.x/2;
        return p2;
}

*/