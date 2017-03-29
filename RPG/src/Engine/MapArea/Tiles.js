//SimpleObject
//Walkable
//Grid
//SimpleTile
//GraphicTile
//BaseTile
//WalkableTile
//WaterTile


var SimpleObject = function (game, x,y, spritesheet, imagename, objectPassed) 
{
    //console.log(x,y,imagename);
    if(imagename=="undefined.png")
        imagename = "bushSand.png";
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.gameref = game;
    this.posx;
    this.posy;
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
    //
    //if(objectPassed.x!=n)
    this.iso = new Vec3(objectPassed.x, objectPassed.y, objectPassed.z);
    this.isoorder = objectPassed.order;
    //for now. This might be changed.
    this.y += this.iso.y * -50;
    this.adjustVisible(0);
    
    //this.staticobjects
}
SimpleObject.prototype = Object.create(Phaser.Image.prototype);
SimpleObject.constructor = SimpleObject;
//
SimpleObject.prototype.adjustVisible = function(newVisible)
{
    this.tint = 0xffffff * newVisible;
}
SimpleObject.prototype.dosetup = function(hexHandler)
{
    //find tile based on posx, posy
    var tile = hexHandler.getTileByCords(this.posx,this.posy);
    //console.log(tile);
    if( tile != null)
    {
        tile.staticobjects.push(this);
    }
}
//
var Walkable = function(arrayIn)
{
    this.l = arrayIn.l;
    this.u = arrayIn.u;
    this.r = arrayIn.r;
    this.d = arrayIn.d;
    
    this.walkable = true;
    
    if(this.l==0 && this.u==0 && this.r==0 && this.d==0)
    {
        this.walkable = false;
    }    
}
Walkable.prototype.isWalkable = function(atx, aty, dirx, diry)
{
    //console.log("walkable set to: ",this.walkable);
    if(!this.walkable)//if not walkable can't enter.
        return 0;
    //use location and direction to determine cost.
    
    if(aty % 2 == 1)
    {
        if(dirx == 1 && diry == -1)
            return this.u;
        if(dirx == 1 && diry == 1)
            return this.r;
        if(dirx == 0 && diry == 1)
            return this.d;
        if(dirx == 0 && diry == -1)
            return this.l;
    }
    else
    {
        if(dirx == 0 && diry == -1)
            return this.u;
        if(dirx == 0 && diry == 1)
            return this.r;
        if(dirx == -1 && diry == 1)
            return this.l;
        if(dirx == -1 && diry == -1)
            return this.d;
    }
    return 1;
}
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
Grid.prototype.projectIso = function(x, y, z) 
{
    return {
        x: Math.floor((x - z)/2),
        y: Math.abs(x+z)
    };
}
Grid.prototype.projectGrid = function(x, y) 
{
    //ignore y since all grids?
    var x0 = Math.floor(y/2 - x);
    var z0 =  y - x0;
    x0 = -1 * x0;
    z0 = -1 * Math.abs(z0);
    return new Vec3(x0, 0, z0);
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
    this.walkHandler;  
    this.openair = true;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
    this.moverontile = null;
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
}
SimpleTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
SimpleTile.prototype.changeWalkable = function(walkableto, mover) 
{
    console.log("updatewalkable",this.maingame.updatewalkable);
    
    if(walkableto==true||walkableto=="true")
        //this.maingame.walkableArray[this.posx][this.posy] = 1;
        walkHandler.walkable = 1;
    else
        walkHandler.walkable = 0;
        //this.maingame.walkableArray[this.posx][this.posy] = 0;
    if(mover!=null)
        this.moverontile = mover;
    else 
        this.moverontile = null;
    this.walkable = walkHandler.walkable;
    this.maingame.updatewalkable = true;
}
/*SimpleTile.prototype.setWalkArray = function(newarray) 
{
    this.walkarray = newarray;
    if(!walkarray[0] && !walkarray[1] && !walkarray[2] && !walkarray[3])//is never walkable
        this.walkable = false;
    this.walkable = true;
}*/
SimpleTile.prototype.fillTile = function(fillingObject) 
{
    console.log("updatewalkable fillTile",this.maingame.updatewalkable);
    
    /*if(walkableto==true||walkableto=="true")
        //this.maingame.walkableArray[this.posx][this.posy] = 1;
        walkHandler.walkable = 1;
    else
        walkHandler.walkable = 0;
        //this.maingame.walkableArray[this.posx][this.posy] = 0;

    this.walkable = walkHandler.walkable;
    this.maingame.updatewalkable = true;*/
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
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
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
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
    
    this.iso = null;//new Vec3(-1,-1,-1);
    this.isoorder = -1;
    
    this.staticobjects = [];
}
BaseTile.prototype = Object.create(Phaser.Sprite.prototype);
BaseTile.constructor = BaseTile;

BaseTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
BaseTile.prototype.changeWalkable = function(walkableto, mover) 
{
    //console.log("asdf",this.maingame);
    
    if(walkableto)
        this.maingame.map.walkableArray[this.posx][this.posy].walkable = true;
    else
        this.maingame.map.walkableArray[this.posx][this.posy].walkable = false;
    //
    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
    if(mover!=null)
        this.moverontile = mover;
    else 
        this.moverontile = null;
}
BaseTile.prototype.adjustVisible = function(newVisible)
{
    this.tint = 0xffffff * newVisible;
    //console.log(this.staticobjects);
    if(this.staticobjects.length>0)
    {
        for(var i=0;i<this.staticobjects.length;i++)
        {
            if(this.staticobjects[i])
            {
                this.staticobjects[i].adjustVisible(newVisible);
            }
        }
    }
}
//
//WalkableTile
//
//
var WalkableTile = function(game,tileName,spritesheet, posx,posy,x,y, maingame)
{
    //system.
    BaseTile.call(this, game,tileName,spritesheet, posx,posy,x,y, maingame)
    this.walkable = true;  
    this.openair = true;

    this.posx = posx;
    this.posy = posy;
    
    this.eventDispatcher;
    this.adjustVisible(0.2);
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