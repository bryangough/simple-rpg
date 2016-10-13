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
    //this is for top left
    //move to middle,bottem
    //+ width/2, + height 
    //180, 90
    var w = this.hexagonWidth;
    var h = this.hexagonHeight;
    
    var i = Math.floor(checkx / (w - 2));//
    var j = Math.floor(checky / (h - 1)) * 2;// 

    var xQuadrant = Math.floor(checkx % (w - 2));
    var yQuadrant = Math.floor(checky % (h - 1));
    //console.log(checkx,checky,i,j,xQuadrant, yQuadrant, w, h);
    //
    //this.touchmap.x = checkx;
    //this.touchmap.y = checky;
    this.touchmap.update();
    this.touchmap.getPixelRGB (xQuadrant, yQuadrant, this.tempcolour);
    //
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
    if(i==-1)
    {
        i=0;
        j++;
    }
    if(j==-1)
    {
        j=0;
        i++;
    }
    if(i==this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
        j--;
    }
    if(j==this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
        i--;
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
IsoHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    //this is for top left
    //move to middle,bottem
    //+ width/2, + height 
    
    var i = Math.floor(checkx / (this.hexagonWidth - 2));
    var j = Math.floor(checky / (this.hexagonHeight - 1)) * 2;

    var xQuadrant = Math.floor(checkx % (this.hexagonWidth - 2));
    var yQuadrant = Math.floor(checky % (this.hexagonHeight - 1));

    /*if(i<0)
    {
        i = 0;
    }
    if(j<0)
    {
        j = 0;
    }
    if(i>=this.maingame.map.movementgrid.gridSizeX)
    {
       i = this.maingame.map.movementgrid.gridSizeX;
    }
    if(j>=this.maingame.map.movementgrid.gridSizeY)
    {
       j = this.maingame.map.movementgrid.gridSizeY;
    }
    */
    /*tile = this.hexagonArray[i][j]; 
    if(tile!=null)
    {
        //this.sprite.x = tile.x;
        //this.sprite.y = tile.y;
    }*/
    //
   /* this.touchmap.update();
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
    //console.log(j, this.maingame.map.movementgrid.gridSizeY);
    if(i==-1)
    {
        i=0;
        j++;
    }
    if(j==-1)
    {
        j=0;
        i++;
    }
    if(i==this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
        j--;
    }
    if(j==this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
        i--;
    }
    //re max
    /*if(i<0)
    {
        i=0;
    }
    if(j<0)
    {
        j=0;
    }
    if(i>=this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
    }
    if(j>=this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
    }*/
       
   /*if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
        
    tile = this.hexagonArray[i][j]; 
    return tile;
}
*/