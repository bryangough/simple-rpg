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
    //checkx = Math.round(checkx);
    //checky = Math.round(checky);
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