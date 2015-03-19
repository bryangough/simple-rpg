BasicGame.GameWave = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it.
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
    
    this.playerCharacter;
    this.halfHex = hexagonWidth/2;
};



    var hexagonWidth = 64;
	var hexagonHeight = 65;

	var gridSizeX = 30;
	var gridSizeY = 15;
	var columns = [Math.ceil(gridSizeX/2),Math.floor(gridSizeX/2)];
    var moveIndex;
    var sectorWidth = hexagonWidth;
    var sectorHeight = hexagonHeight/4*3;
    var gradient = (hexagonHeight/4)/(hexagonWidth/2);
    
    var hexagonGroup;
    var characterGroup;
    var hexagonArray = [];
    var waterTilesArray = [];
//
    var tiles = ["tileGrass.png", "tileAutumn.png", "tileDirt.png", "tileMagic.png", "tileRock.png", "tileSand.png", "tileSnow.png", "tileStone.png"];

    var target;
	var replacement;
    var startTile;
//
    var waveHandler;
    var map;
    var startpos;
    var mapData;

    var pathfinder;

// ----

BasicGame.GameWave.prototype = {
    preload: function(){
        this.load.text('map', 'assets/desertIsland.json');
    },
    create: function () {
        //emanueleferonato
        hexagonArray = [];
        waterTilesArray = [];
        pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        //
        this.mapData = JSON.parse(this.game.cache.getText('map'));
        startpos = this.mapData.startPos.split("_");
        var currentmap = this.mapData.maps[startpos[0]];
        this.createMapTiles(currentmap);
        //
        //tiles clickable
        moveIndex = this.input.onDown.add(this.clickedHex, this);
        
        //this.startTile = hexagonArray[0][0].frameName;
        waveHandler = new WaveHandler();
        /*var newWave = waveHandler.getWave();
        newWave.launch(0,100,0.5,0.5);
        
        newWave = waveHandler.getWave();
        newWave.launch(0,150,0.5,0.5);
        
        newWave = waveHandler.getWave();
        newWave.launch(0,200,0.5,0.5);
        */
    },
    getTile: function(name, tilesetid){
        //console.log(this.mapData.tileSets[tilesetid][name]);
        //console.log(this.mapData.tileSets);
        return {tile:this.mapData.tileSets[tilesetid][name],spritesheet:this.mapData.tileSets[tilesetid].tileset};
    },
    createMapTiles: function(passedMap){
        hexagonArray = [];
        walkableArray = [];
        hexagonGroup = this.add.group();
        characterGroup = this.add.group();
        //
        var layer1 = passedMap[0];
        //
        gridSizeY = layer1.height;
        gridSizeX = layer1.width;
        var tiles = layer1.data;
        var tilesetid = layer1.tilesetid;
        var objectName;
        var tilereference;
        var walkableArray = [];
        //
        for(var i = 0; i < gridSizeY; i ++){
	     	hexagonArray[i] = [];
            walkableArray[i] = [];
			for(var j = 0; j < gridSizeX; j ++)
            {
                objectName = tiles[i*gridSizeX+j];
                tilereference = this.getTile(objectName,tilesetid);
                var hexagonX = hexagonWidth*j;
                if(gridSizeY%2)
                    hexagonX += hexagonWidth/2*(i%2);
                else
                    hexagonX -= hexagonWidth/2*(i%2);
                
                var hexagonY = (hexagonHeight/4*3)*i;
                var hexagon = this.add.sprite(hexagonX,hexagonY, tilereference.spritesheet, tilereference.tile+".png"); 
                hexagonGroup.add(hexagon);

                if(tilereference.tile=="tileWater")
                {
                    var temptile = new WaterTile(this, hexagon,i,j);
                    waterTilesArray.push(temptile);
                    hexagonArray[i][j]=temptile;
                }
                else
                {
                    var temptile = new WalkableTile(this,hexagon,i,j);
                    hexagonArray[i][j]=temptile;
                }
                walkableArray[i][j] = layer1.walkable[i*gridSizeX+j];
                var hexagonText = this.add.text(hexagonX+hexagonWidth/3+5,hexagonY+15,i+","+j);
                hexagonText.font = "arial";
                hexagonText.fontSize = 12;
                hexagonGroup.add(hexagonText);
			}
		}
        console.log(walkableArray);
        pathfinder.setGrid(walkableArray, [1]);
        //return;
        //handle objects
        var objects = layer1.objects;
        var spotx,spoty;
        for(var i = 0; i < objects.length; i ++)
        {
            var objectrefernce = this.getTile(objects[i].name,objects[i].tilesetid);
            spotx = objects[i].x;
            spoty = gridSizeY-objects[i].y-1;//gridSizeY-objects[i].y-1;
            var tileobject = this.game.make.sprite(objects[i].offsetx*hexagonWidth,objects[i].offsety*hexagonHeight, objectrefernce.spritesheet, objectrefernce.tile+".png");
            hexagonArray[spoty][spotx].tileImage.addChild(tileobject);
            tileobject.anchor.x = 0.5;
            tileobject.anchor.y = 1.0;
            //characterGroup.add(tileobject);
        }
        var connected = layer1.connected;
        for(var i = 0; i < connected.length; i ++)
        {
            var selectedtile = hexagonArray[gridSizeY-connected[i].fy-1][connected[i].fx];
            selectedtile.actionEnter = this.userSteppedOnExit;
            selectedtile.actionEnterData = connected[i];
            var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
            selectedtile.tileImage.addChild(doorImage);
        }
        //
        hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
		hexagonGroup.y = (600/2-hexagonHeight*Math.ceil(gridSizeY/2))/2;
          if(gridSizeY%2==0){
               hexagonGroup.y-=hexagonHeight/4;
          }
        hexagonGroup.x = (900-Math.ceil(gridSizeX)*hexagonWidth)/2;
          if(gridSizeX%2==0){
               hexagonGroup.x-=hexagonWidth/8;
          }
        
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new MovingCharacter(this, "player");
            this.game.add.existing(this.playerCharacter.sprite);
            this.playerCharacter.setLocationByTile(hexagonArray[gridSizeY-startpos[2]-1][startpos[1]]);
        }
        characterGroup.add(this.playerCharacter.sprite);
        characterGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        characterGroup.x = hexagonGroup.x;
        characterGroup.y = hexagonGroup.y;
    },
    userSteppedOnExit:function(data){
        //console.log(this.game,this);
        this.game.userExit(data);
    },
    userExit:function(data) {
        //console.log("should be main game: ",this);
        //console.log("user exit",data);
        startpos[0] = data.tmap;
        startpos[1] = data.tx;
        startpos[2] = data.ty;
        //
        this.flushEntireMap();
        //
        var currentmap = this.mapData.maps[startpos[0]];
        console.log(startpos[0]);
        this.createMapTiles(currentmap);        
    },
    flushEntireMap: function(){
        console.log("flush map");
       /* for(var i = 0; i < gridSizeY; i ++){
			for(var j = 0; j < gridSizeX; j ++)
            {
                hexagonArray[i][j].tileImage.destroy();
                hexagonArray[i][j] = null;
            }
        }*/
        hexagonGroup.destroy();
        characterGroup.destroy();
        hexagonArray = [];
        waterTilesArray = [];
        walkableArray = [];
        this.playerCharacter = null;
    },
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        //
        var currentWave;
        var touchedWave;
        /*for(var i=0;i<waveHandler.allWaves.length;i++)
        {
            currentWave = waveHandler.allWaves[i];
            if(currentWave.isActive)
            {
                currentWave.step(elapsedTime);
                touchedWave = this.checkHex(currentWave.x,currentWave.y);
                if(touchedWave != null)
                {
                    //console.log(touchedWave);
                    touchedWave.hitByWave(currentWave.strength);
                }
            }
        }*/
        //
        if(waterTilesArray)
        {
            var length = waterTilesArray.length;
            for(var i = 0; i < length; i ++)
            {
                waterTilesArray[i].step(elapsedTime);
            }
        }
        this.playerCharacter.step(elapsedTime);
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    //emanueleferonato
    clickedHex:function()
    {
        moveIndex =  this.checkHex(this.input.worldX-hexagonGroup.x,this.input.worldY-hexagonGroup.y);
        //console.log(moveIndex.posx,moveIndex.posy);
        if(moveIndex!=null)
        {
            if(moveIndex.walkable)
            {
                var playertile = this.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
                //console.log([playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy]);   
                //pathfinder.setCallbackFunction(this.playercallback);
                pathfinder.setCallbackFunction(this.playercallback,this);
                pathfinder.preparePathCalculation([playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy]);
                pathfinder.calculatePath();
            }
            else
            {
                console.log("not walkable");
            }
        }
    },
    playercallback:function(path){
        path = path || [];
        this.playerCharacter.setPath(path);
        /*for(var i = 0, ilen = path.length; i < ilen; i++) {
            //map.putTile(46, path[i].x, path[i].y);
            console.log("callback ",path[i].x, path[i].y);
        } */    
    },
    checkHex:function(checkx, checky){
        if(!hexagonArray)
            return;
        
        var deltaX = (checkx)%sectorWidth;
        var deltaY = (checky)%sectorHeight; 
        
        var candidateX = Math.floor((checkx)/sectorWidth);
        var candidateY = Math.floor((checky)/sectorHeight);
                
          if(candidateY%2==0){
               if(deltaY<((hexagonHeight/4)-deltaX*gradient)){
                    candidateX--;
                    candidateY--;
               }
               if(deltaY<((-hexagonHeight/4)+deltaX*gradient)){
                    candidateY--;
               }
          }    
          else{
               if(deltaX>=hexagonWidth/2){
                    if(deltaY<(hexagonHeight/2-deltaX*gradient)){
                         candidateY--;
                    }
               }
               else{
                    if(deltaY<deltaX*gradient){
                         candidateY--;
                    }
                    else{
                         candidateX--;
                    }
               }
          }

        if(candidateX<0 || candidateY<0 || candidateY>=gridSizeY || candidateX>columns[candidateY%2]-1){
            return;
		}
        //console.log(candidateY,candidateX);
        //var markerX = candidateX*2+candidateY%2;
        //var markerY = Math.floor(candidateY/2);
        return hexagonArray[candidateY][candidateX]
     },
    getTileByCords:function(x,y)
    {
        return hexagonArray[x][y];
    },
    //ati,atj - position in array
    //locx,locy - position in world
    addHex:function (ati,atj,tileName,locx,locy){
        var hexagon = this.add.sprite(locx,locy, "tiles", tileName); 
        hexagonGroup.add(hexagon);
        hexagonArray[ati][atj]=hexagon;
    }
};
//
//
//
//water tile
var WalkableTile = function(game,tileImage,posx,posy)
{
    this.game = game;
    this.walkable = true;  
    this.tileImage = tileImage;
    this.posx = posx;
    this.posy = posy;
    
    this.actionEnter = null;
    this.actionEnterData = null;
};
Object.defineProperty(WalkableTile, "x", {
    get: function () {
        return tileImage.x;
    }
});
Object.defineProperty(WalkableTile, "y", {
    get: function () {
        return tileImage.y;
    }
});
WalkableTile.prototype.clicked = function() 
{
};
WalkableTile.prototype.enterTile = function()
{
    if(this.actionEnter)
    {
        this.actionEnter(this.actionEnterData);
    }
};
//
var WaterTile = function (game, tileImage,posx,posy) 
{
    this.posx = posx;
    this.posy = posy;

    this.walkable = false;  
    this.game = game;
    this.tileImage = tileImage;
    this.starty = tileImage.y;
    this.wavemax = -40;
    this.maxoffsetmax = 12;
    this.maxoffsetmin = 0;
    this.speed = 0.006;
    this.direction = 1;
    this.waveSpeed = 0;
    //random initial
    tileImage.y += this.game.rnd.integerInRange(this.maxoffsetmin, this.maxoffsetmax);
    if(this.game.rnd.frac()<0.5)
    {
        this.direction = -1;
    }
    //
    this.level();
};
WaterTile.prototype.level = function() 
{
    var y = this.tileImage.y;
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
    //if(this.waveSpeed<=0)
    if(this.tileImage.y<this.starty+this.wavemax)
    {
        this.tileImage.y += this.direction * this.speed * elapseTime;
        //
       // this.tileImage.y += this.direction * this.speed * elapseTime * 10;
    }
    else
    {
        this.tileImage.y += this.direction * this.speed * elapseTime;
        //this.tileImage.y += this.direction * this.waveSpeed * elapseTime;
    }
    if(this.game.rnd.frac()<0.01)
    {
        this.direction*=-1;
    }
    this.level();
};
WaterTile.prototype.hitByWave = function(power) 
{
    //this.tileImage.y += this.power;
    //this.direction = -1;
    //this.waveSpeed += power;
    //if(this.waveSpeed>0.04)
    //    this.waveSpeed = 0.04;
    
    this.tileImage.y += power;
    if(this.starty+this.wavemax>this.tileImage)
        this.tileImage.y = this.starty+this.wavemax;
    //this.tileImage.y = this.starty+this.wavemax;
    this.level();
};
//
var MovingWave = function(handler)
{
    this.handler = handler;
    this.isActive = false;
    this.strength = 1;
    this.strengthDecay = 0;
    this.speed = 3;
}
MovingWave.prototype.launch = function(x,y,dirx,diry) 
{
    this.isActive = true;
    this.x = x;
    this.y = y;
    this.velx = dirx*this.speed;
    this.vely = diry*this.speed;
}
MovingWave.prototype.step = function(elapseTime) 
{
    this.x += this.velx;
    this.y += this.vely;
    //console.log(this.x,this.y);
    if(this.x<0||this.x>900||this.y<0||this.y>600)
    {//or if it hits land (this might cause it to just turn around and lower strength
        //console.log("done",this.handler,this);
        //this.handler.returnWave(this);
        //this.isActive = false;
        this.velx*=-1;
        this.vely*=-1;
    }
};
//
var WaveHandler = function()
{
    this.openWaves = [];
    this.allWaves = [];
}
WaveHandler.prototype.getWave = function()
{
    var wave;
    if(this.openWaves.length>0)
    {
        wave = this.openWaves.pop();
    }
    else
    {
        wave = new MovingWave(this);
    }
    this.allWaves.push(wave);
    wave.isActive = true;
    return wave;
}
WaveHandler.prototype.returnWave = function(wave)
{
    //this.closeWaves.splice(this.closeWaves.indexOf(wave),1);
    this.openWaves.push(wave);
}

