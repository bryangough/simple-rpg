var SimpleObject = function (game, x,y, spritesheet, imagename, objectPassed) 
{
    //console.log(x,y,imagename);
    if(imagename=="undefined.png")
        imagename = "bushSand.png";
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.posx;
    this.posy;
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
    //
    this.isox = objectPassed.x;
    this.isoy = objectPassed.y;
    this.isoz = objectPassed.z;
    this.isoorder = objectPassed.order;
}
SimpleObject.prototype = Object.create(Phaser.Image.prototype);
SimpleObject.constructor = SimpleObject;
//
var Grid = function(maingame, layer1)
{
    this.maingame = maingame;
    this.width = layer1.hexWidth;
    this.height = layer1.hexHeight;

    this.gridSizeY = layer1.height;
    this.gridSizeX = layer1.width;
    this.offsetx = layer1.offsetx || 0;
    this.offsety = layer1.offsety || 0;
    this.type = layer1.tiletype;
    
    this.coords = new Point(0,0);
}
Grid.prototype.GetMapCoords = function(i,j)
{
    //flip y over unity
    if(this.type=="Hex")
    {
        this.coords.x = this.width*i;
        this.coords.x += this.width/2*(j%2);
        
        this.coords.y = (this.height/4*3)*j;
    }
    else if(this.type=="HexIso")
    {
        var offset = Math.floor(i/2);
        this.coords.x = this.width*i + this.width/2*j;
        this.coords.y = (this.height/4*3)*j; 

        this.coords.x -= this.width/2 * offset;
        this.coords.y -= (this.height/4*3) * offset;
    }
    else if(this.type=="Iso")
    {
        //this.coords.x = i * (this.width - 2) + ((j % 2) * ((this.width / 2) - 1));          
    //   this.coords.y = j * ((this.height - 1) / 2);
        
       
        this.coords.x = i * (this.width) + ((j % 2) * ((this.width / 2)));          
        this.coords.y = j * ((this.height) / 2);
        //this.coords.x += 16;
        //this.coords.y -= 10;
    }
    else if(this.type=="HexIsoFallout")
    {
        this.coords.x = 48 * i + 32 * j;
        this.coords.y = -24 * j + 12 * i;
        this.coords.y *= -1;
        //offset
        this.coords.x += 16;
        this.coords.y -= 4;
    }
    else
    {
        this.coords.x = 0;
        this.coords.y = 0;
    }
    return this.coords;
}
Grid.prototype.PosToMap = function(x,y)
{
    if(this.coords==undefined)
        this.coords = new Point();
    if(this.type=="HexIsoFallout")
    {
        x -= 16;//offset
        y += 4;

        x -= 40;//center
        y -= 16;
        
        y*= -1;
       // y -= 132;
        
        i = (3 * x + 4 * y )/192;
        j = (x - 4 * y)/128;
        //j = (12 * i - y)/24
        //i = (x - 32 * j )/48;
        this.coords.x = Math.round(i);
        this.coords.y = Math.round(j);
       // console.log(x,y,i,j,this.coords.x,this.coords.y);
    }
    else if(this.type=="Iso")
    {
        
        var tile = this.maingame.hexHandler.checkHex(x,y);
        //console.log(tile);
        if(tile!=undefined)
        {
            this.coords.x = tile.posx;
            this.coords.y = tile.posy;
        }
        else
        {
            this.coords.x = -1;
            this.coords.y = -1;  
        }
        //this.coords.x = x * (this.width) + ((y % 2) * ((this.width / 2)));          
        //this.coords.y = y * ((this.height) / 2);
    }
    else
    {
        this.coords.x = -1;
        this.coords.y = -1;
    }
    return this.coords;
}


//Simple tile for non-graphic grid. Used to movement.
var SimpleTile = function(maingame, posx, posy, x, y)
{
    this.maingame = maingame;
    this.walkable = true;  
    this.openair = true;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
    this.moverontile = null;
}
SimpleTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
SimpleTile.prototype.changeWalkable = function(walkableto) 
{
    console.log("updatewalkable",this.maingame.updatewalkable);
    
    if(walkableto==true||walkableto=="true")
        this.maingame.walkableArray[this.posx][this.posy] = 1;
    else
        this.maingame.walkableArray[this.posx][this.posy] = 0;

    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
}
SimpleTile.prototype.enterTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter",enterer);
    this.moverontile = enterer;
};
SimpleTile.prototype.leaveTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnLeave",enterer);
    this.moverontile = null;
};

//none moveable ground tiles will use new Image(game, x, y, key, frame)
//walls? walls at different layers
// this might not be needed
var GraphicTile = function(game, tileName, spritesheet, posx, posy, x, y, maingame)
{
    Phaser.Image.call(this, game, x,y, spritesheet, tileName);
    this.game = game;
    this.maingame = maingame;
    //this.posx = posx;
    //this.posy = posy;
}
GraphicTile.prototype = Object.create(Phaser.Image.prototype);
GraphicTile.constructor = GraphicTile;


/*
Tiles below are for graphic tiles that are also used for walkable

*/
var BaseTile = function(game, tileName, spritesheet, posx, posy, x, y, maingame)
{
   // console.log(spritesheet,tileName);
    Phaser.Sprite.call(this, game, x,y, spritesheet, tileName);
    this.game = game;
    this.maingame = maingame;
    //this.posx = posx;
    //this.posy = posy;
}
BaseTile.prototype = Object.create(Phaser.Sprite.prototype);
BaseTile.constructor = BaseTile;

BaseTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
BaseTile.prototype.changeWalkable = function(walkableto) 
{
    //console.log("asdf",this.maingame);
    
    if(walkableto)
        this.maingame.map.walkableArray[this.posx][this.posy] = 1;
    else
        this.maingame.map.walkableArray[this.posx][this.posy] = 0;
    //
    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
}
//
//WalkableTile
//
//
var WalkableTile = function(game,tileName,spritesheet, posx,posy,x,y, maingame)
{
    //Phaser.Sprite.call(this, game, x,y, spritesheet,tileName);
    BaseTile.call(this, game,tileName,spritesheet, posx,posy,x,y, maingame)
    this.walkable = true;  
    this.openair = true;

    this.posx = posx;
    this.posy = posy;
    
    this.eventDispatcher;
};
WalkableTile.prototype = Object.create(BaseTile.prototype);
WalkableTile.constructor = WalkableTile;
//move this test to moving character
WalkableTile.prototype.enterTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter",enterer);
    this.moverontile = enterer;
};
WalkableTile.prototype.leaveTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnLeave",enterer);
    this.moverontile = null;
};
//
//WaterTile
//
//
var WaterTile = function (game,tileName,spritesheet, posx,posy,x,y)
{
    Phaser.Sprite.call(this, game, x,y, spritesheet,tileName);
    this.game = game;
    //
    this.posx = posx;
    this.posy = posy;
    //
    this.walkable = false;  
    this.openair = true;
    //
    this.starty = y;
    this.wavemax = -5;
    this.maxoffsetmax = 5;
    this.maxoffsetmin = 0;
    this.speed = 0.003;
    this.direction = 1;
    this.waveSpeed = 0;
    //random initial
    this.y += this.game.rnd.integerInRange(this.maxoffsetmin, this.maxoffsetmax);
    if(this.game.rnd.frac()<0.5)
    {
        this.direction = -1;
    }
    //
    this.level();
};
WaterTile.prototype = Object.create(Phaser.Sprite.prototype);
WaterTile.constructor = WaterTile;

WaterTile.prototype.level = function() 
{
    var y = this.y;
    if(y<this.starty+this.maxoffsetmin)
    {
        this.direction = 1;
    }
    if(y>this.starty+this.maxoffsetmax)
    {
        this.direction = -1;
        this.waveSpeed = 0;
    }
};
WaterTile.prototype.step = function(elapseTime) 
{
    if(this.y<this.starty+this.wavemax)
    {
        this.y += this.direction * this.speed * elapseTime;
    }
    else
    {
        this.y += this.direction * this.speed * elapseTime;
    }
    if(this.game.rnd.frac()<0.01)
    {
        this.direction*=-1;
    }
    this.level();
};
WaterTile.prototype.hitByWave = function(power) 
{
    //this.y += this.power;
    //this.direction = -1;
    //this.waveSpeed += power;
    //if(this.waveSpeed>0.04)
    //    this.waveSpeed = 0.04;
    
    this.y += power;
    if(this.starty+this.wavemax>this.tileImage)
        this.y = this.starty+this.wavemax;
    //this.y = this.starty+this.wavemax;
    this.level();
};