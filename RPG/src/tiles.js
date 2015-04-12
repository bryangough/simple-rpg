var BaseTile = function(game, tileName, spritesheet, posx, posy, x, y, maingame)
{
   // console.log(spritesheet,tileName);
    Phaser.Sprite.call(this, game, x,y, spritesheet,tileName);
    this.game = game;
    this.maingame = maingame;
}
BaseTile.prototype = Object.create(Phaser.Sprite.prototype);
BaseTile.constructor = WalkableTile;

BaseTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
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

WalkableTile.prototype.enterTile = function()
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter");
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
    this.wavemax = -40;
    this.maxoffsetmax = 12;
    this.maxoffsetmin = 0;
    this.speed = 0.006;
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
 /*this.neighborLights = [];
        for(var i=0;i<40;i++)
        {
            var light = this.add.group();
            var high = this.game.add.sprite(0,0, "tiles","tileWater_tile.png");
            this.neighborLights.push(light);
            light.add(high);
            this.hexagonGroup.add(light);
            
            var hexagonText = this.add.text(25,25,i+"");
            hexagonText.font = "arial";
            hexagonText.fontSize = 12;
            light.add(hexagonText);
            light.x = -1000;
        }
            drawFridges:function(fridges){
        var tempArray = [];
        for(var i=0;i<fridges.length;i++)
        {
            for(var j=0;j<fridges[i].length;j++)
            {
                tempArray.push(fridges[i][j]);
            }
        }
        for(var i=0;i<tempArray.length;i++)
        {
            this.highlightpath(i,tempArray[i]);
        }
    },
        */
/*
    showPath:function()
    {
        if(this.game.global.pause)
        {
            return;
        }
        if(this.playerCharacter.isMoving)
            return;
        //
        var moveIndex =  this.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);
        if(moveIndex!=null)
        {
            
            if(moveIndex.walkable)
            {
                var playertile = this.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
                if(playertile)
                {
                    pathfinder.setCallbackFunction(this.showPathCallback, this);
                    pathfinder.preparePathCalculation( [playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy] );
                    pathfinder.calculatePath();
                }
            }
            else
            {
                
                console.log("not walkable");
            }
        }
    },
    showPathCallback:function(path)
    {
        if(this.playerCharacter.isMoving)
            return;
    },
    drawLine:function()
    {
        var playertile = this.hexHandler.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);
        if(moveIndex&&playertile)
        {
            this.hexHandler.dolines(playertile,moveIndex,false);
        }
    },
    moveHex:function()
    {
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);
        if(moveIndex==null)
            return;
        //console.log(moveIndex.posy);
        
        if(moveIndex.posx % 2 == 1)
        {
            this.highlightNeighbor(0, 0,    -1, moveIndex);
            this.highlightNeighbor(1, -1,   0, moveIndex);
            this.highlightNeighbor(2, 0,    +1, moveIndex);
            this.highlightNeighbor(3, +1,   +1, moveIndex);
            this.highlightNeighbor(4, +1,   0, moveIndex);
            this.highlightNeighbor(5, -1,   1, moveIndex);
        }
        else
        {
            this.highlightNeighbor(0, -1,   -1, moveIndex);
            this.highlightNeighbor(1, -1,   0, moveIndex);
            this.highlightNeighbor(2, 0,    +1, moveIndex);
            this.highlightNeighbor(3, +1,   0, moveIndex);
            this.highlightNeighbor(4, 0,    -1, moveIndex);
            this.highlightNeighbor(5, 1,   -1, moveIndex);
        }
    },
    highlightNeighbor:function(i,x,y,currenttile)
    {
        var thetile = this.getTileByCords(currenttile.posx+x,currenttile.posy+y);
        if(thetile!=null)
        {
            this.neighborLights[i].x = thetile.x;
            this.neighborLights[i].y = thetile.y;
        }
        else
        {
            this.neighborLights[i].x = -1000;
            this.neighborLights[i].y = 0;
        }
    },
    highlightpath:function(i,currenttile)
    {
        if(this.neighborLights[i]==null)
            return;
        if(currenttile!=null)
        {
            this.neighborLights[i].x = currenttile.x;
            this.neighborLights[i].y = currenttile.y;
        }
        else
        {
            this.neighborLights[i].x = -1000;
            this.neighborLights[i].y = 0;
        }
    },


*/