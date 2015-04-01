//
var HexHandler = function (maingame, game) 
{
    this.maingame = maingame;
    this.game = game;
    this.debug = true;
    
    //for flood fill
    this.visited = [];
    this.fringes = [];
};
//Returns tile that hits. 
HexHandler.prototype.lineTest = function(tilestart, tileend)
{
    var p0 = new Point(tilestart.tileImage.x+this.maingame.halfHex, tilestart.tileImage.y+this.maingame.halfHex);
    var p1 = new Point(tileend.tileImage.x+this.maingame.halfHex, tileend.tileImage.y+this.maingame.halfHex);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    N = this.game.math.ceil(N/this.maingame.hexagonWidth)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    for(var i=0;i<points.length;i++){
        var overtile = this.maingame.checkHex(points[i].x,points[i].y);
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
    var p0 = new Point(tilestart.tileImage.x+this.maingame.halfHex,
                       tilestart.tileImage.y+this.maingame.halfHex);
    var p1 = new Point(tileend.tileImage.x+this.maingame.halfHex, 
                       tileend.tileImage.y+this.maingame.halfHex);
    //
    if(this.debug)
    {
        this.maingame.graphics.clear();
        this.maingame.graphics.lineStyle(10, 0xffd900, 1);
        this.maingame.graphics.moveTo(tilestart.tileImage.x+hexagonGroup.x+this.maingame.halfHex, tilestart.tileImage.y+hexagonGroup.y+this.maingame.halfHex);
        this.maingame.graphics.lineTo(tileend.tileImage.x+hexagonGroup.x+this.maingame.halfHex, tileend.tileImage.y+hexagonGroup.y+this.maingame.halfHex);
    }
    //
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    N = this.game.math.ceil(N/this.maingame.hexagonWidth)+1;
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