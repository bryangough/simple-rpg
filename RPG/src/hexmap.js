//
var HexHandler = function (maingame, game) 
{
    this.maingame = maingame;
    this.game = game;
    this.debug = true;
    
    //for flood fill
    this.visited = [];
    this.fringes = [];
    
    this.hexagonArray = [];
    //this.columns = [Math.ceil(this.gridSizeX/2),Math.floor(this.gridSizeX/2)];//needed?
    
    this.waterTilesArray = [];//should be moved out into tile graphics handler
    
    this.hexagonWidth = 63;
    this.hexagonHeight = 65;

    this.sectorWidth = this.hexagonWidth;
    this.sectorHeight = this.hexagonHeight/4*3;
    
    this.halfHex = this.hexagonWidth/2;
    this.gradient = (this.hexagonHeight/4)/(this.hexagonWidth/2);

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
       candidateX++;
        if(candidateX<0)
            candidateX = 0;
    }
    if(candidateX<0 || candidateY<0 || candidateY>=this.maingame.gridSizeY)// || candidateX>columns[candidateY%2]-1)
    {
        return;
    }
    return this.hexagonArray[candidateY][candidateX]
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
    var p0 = new Point(tilestart.x+this.halfHex, tilestart.y+this.halfHex);
    var p1 = new Point(tileend.x+this.halfHex, tileend.y+this.halfHex);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    N = this.game.math.ceil(N/this.hexagonWidth)+1;
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
HexHandler.prototype.dolines = function(tilestart, tileend, ignoreWalkable)
{
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHex);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHex);
    //
    if(this.debug)
    {
        this.maingame.graphics.clear();
        this.maingame.graphics.lineStyle(10, 0xffd900, 1);
        this.maingame.graphics.moveTo(tilestart.x+hexagonGroup.x+this.halfHex, tilestart.y+hexagonGroup.y+this.halfHex);
        this.maingame.graphics.lineTo(tileend.x+hexagonGroup.x+this.halfHex, tileend.y+hexagonGroup.y+this.halfHex);
    }
    //
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    N = this.game.math.ceil(N/this.hexagonWidth)+1;
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
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.maingame.checkHex(points[i].x,points[i].y);
        if(this.debug)
            this.maingame.graphics.drawCircle(points[i].x+hexagonGroup.x,points[i].y+hexagonGroup.y, 10);
        if(overtile!=null)
        {
            if(!overtile.walkable&&!ignoreWalkable)
                break;
            tiles.push(overtile);
            if(this.debug)
                this.maingame.highlightpath(i,overtile);//debug
        }
    }
    if(this.debug)
        this.maingame.graphics.endFill();
    
    //more debug
    if(this.debug)
    {
        for(i = tiles.length;i<this.maingame.neighborLights.length;i++)
        {
            this.maingame.highlightpath(i,null);
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
HexHandler.prototype.doFloodFill = function(tile,range)
{
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    this.fringes.push([tile]);

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
    var tile = this.maingame.getTileByCords(x,y);
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
    var posx = starttile.posx-testtile.posx;
    var posy = starttile.posy-testtile.posy;
    //
    if(starttile.posx % 2 == 1)
    {
        if(posx==0&&posy==-1)return true;
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
HexHandler.prototype.flush=function()
{
    this.hexagonArray = [];
    this.waterTilesArray = [];
    this.walkableArray = [];
}
