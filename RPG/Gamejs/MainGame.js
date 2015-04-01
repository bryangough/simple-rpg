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
    this.playerHex;
    this.halfHex = hexagonWidth/2;
    this.diagpanel;
    this.activeButtons;
    
    this.neighborLights = [];
    //console.log(this.game);
    // = this.game.WALK;
    this.hexagonWidth = 63;
	this.hexagonHeight = 65;

    this.gridSizeX = 30;
	this.gridSizeY = 15;

    this.hexagonArray = [];
    this.hexHandler;
    this.graphics;
    this.justTextPopup;
};

    var hexagonWidth = 63;
	var hexagonHeight = 65;

	var columns = [Math.ceil(this.gridSizeX/2),Math.floor(this.gridSizeX/2)];
    var moveIndex;
    var sectorWidth = hexagonWidth;
    var sectorHeight = hexagonHeight/4*3;
    var gradient = (hexagonHeight/4)/(hexagonWidth/2);
    
    var uiGroup;
    var hexagonGroup;
    var characterGroup;
    
    var waterTilesArray = [];
    var interactiveObjects = [];
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
    
//
// ----

BasicGame.GameWave.prototype = {
    preload: function(){
        this.load.text('map', 'assets/desertIsland.json');//mission file - can I show a preloader?
    },
    create: function () {
        this.stage.backgroundColor = "#666666"
        pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        this.hexagonArray = [];
        waterTilesArray = [];
        interactiveObjects = [];
        this.uiGroup = this.add.group();
        //
        this.mapData = JSON.parse(this.game.cache.getText('map'));
        startpos = this.mapData.startPos.split("_");
        var currentmap = this.mapData.maps[startpos[0]];
        this.createMapTiles(currentmap);
        //
        this.dialoghandler = new DialogHandler(this,this.mapData.data.Conversations, this.mapData.data.Actors);
        //
        this.diagpanel = new DialogPanel(this.game,this,this.dialoghandler);
	    this.game.add.existing(this.diagpanel);
        this.uiGroup.add(this.diagpanel);
        
        this.justTextPopup = new JustTextPopup(this.game,this,this.dialoghandler);
        this.game.add.existing(this.justTextPopup);
        this.uiGroup.add(this.justTextPopup);
        //
        //
        //this.input.addMoveCallback(this.drawLine, this); 
        //this.input.onDown.add(this.drawLine, this); 
        //MOVE
        
        this.input.onDown.add(this.clickedHex, this);
        
        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.y = 350;
        this.game.add.existing(this.activeButtons);
        this.uiGroup.add(this.activeButtons);
        
        waveHandler = new WaveHandler();
        
        this.hexHandler = new HexHandler(this,this.game);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        
        
        this.showJustTextDialog(3);
        //this.showJustText("YEP");
        //this.showDialog(1);
    },
    createMapTiles: function(passedMap){
        this.hexagonArray = [];
        walkableArray = [];
        hexagonGroup = this.add.group();
        characterGroup = this.add.group();
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        //
        
        var layer1 = passedMap[0];
        //
        this.gridSizeY = layer1.height;
        this.gridSizeX = layer1.width;
        var tiles = layer1.data;
        var tilesetid = layer1.tilesetid;
        var objectName;
        var tilereference;
        var walkableArray = [];
        //
        for(var i = 0; i < this.gridSizeY; i ++){
	     	this.hexagonArray[i] = [];
            walkableArray[i] = [];
			for(var j = 0; j < this.gridSizeX; j ++)
            {
                objectName = tiles[i*this.gridSizeX+j];
                tilereference = this.getTile(objectName,tilesetid);
                var hexagonX = hexagonWidth*j;
                if(this.gridSizeY%2)
                    hexagonX += hexagonWidth/2*(i%2);
                else
                    hexagonX -= hexagonWidth/2*(i%2);
                
                var hexagonY = (hexagonHeight/4*3)*i;
                var hexagon = this.add.sprite(hexagonX,hexagonY, tilereference.spritesheet, tilereference.tile+".png"); 
               // console.log(this.add.sprite);
                hexagonGroup.add(hexagon);

                if(tilereference.tile=="tileWater")
                {
                    var temptile = new WaterTile(this, hexagon,i,j);
                    waterTilesArray.push(temptile);
                    this.hexagonArray[i][j]=temptile;
                }
                else
                {
                    var temptile = new WalkableTile(this,hexagon,i,j);
                    this.hexagonArray[i][j]=temptile;
                }
                walkableArray[i][j] = layer1.walkable[i*this.gridSizeX+j];
                if(walkableArray[i][j] == 0)
                {
                    this.hexagonArray[i][j].walkable = false;
                }
                //
                var hexagonText = this.add.text(hexagonX+hexagonWidth/3+5,hexagonY+15,i+","+j);
                hexagonText.font = "arial";
                hexagonText.fontSize = 12;
                hexagonGroup.add(hexagonText);
			}
		}
        //console.log(walkableArray);
        pathfinder.setGrid(walkableArray, [1]);
        //return;
        //handle objects
        var objects = layer1.objects;
        var spotx,spoty;
        for(var i = 0; i < objects.length; i ++)
        {
            if(objects[i].actions)//if have actions then is an interactive object
            {
                var interactiveobject = new InteractiveObject(this, objects[i],tileobject);
                //interactiveObjects.
            }
            else
            {
                var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                spotx = objects[i].x;
                spoty = this.gridSizeY-objects[i].y-1;//this.gridSizeY-objects[i].y-1;
                var tileobject = this.game.make.sprite(objects[i].offsetx*hexagonWidth,objects[i].offsety*hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");
                this.hexagonArray[spoty][spotx].tileImage.addChild(tileobject);
                tileobject.anchor.x = 0.5;
                tileobject.anchor.y = 1.0;
            }
        }
        var connected = layer1.connected;
        for(var i = 0; i < connected.length; i ++)
        {
            var selectedtile = this.hexagonArray[this.gridSizeY-connected[i].fy-1][connected[i].fx];
            selectedtile.actionEnter = this.userSteppedOnExit;
            selectedtile.actionEnterData = connected[i];
            var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
            selectedtile.tileImage.addChild(doorImage);
        }
        var actionSpots = layer1.actionSpots;
        for(var i = 0; i < actionSpots.length; i ++)
        {
            var selectedtile = this.hexagonArray[this.gridSizeY-actionSpots[i].y-1][actionSpots[i].x];
            //apply actionSpots action
        }
        //
        hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
		hexagonGroup.y = (600/2-hexagonHeight*Math.ceil(this.gridSizeY/2))/2;
          if(this.gridSizeY%2==0){
               hexagonGroup.y-=hexagonHeight/4;
          }
        hexagonGroup.x = (900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
          if(this.gridSizeX%2==0){
               hexagonGroup.x-=hexagonWidth/8;
          }
        
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new MovingCharacter(this, "player");
            this.game.add.existing(this.playerCharacter.sprite);
            this.playerCharacter.setLocationByTile(this.hexagonArray[this.gridSizeY-startpos[2]-1][startpos[1]]);
        }
        characterGroup.add(this.playerCharacter.sprite);
        characterGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        characterGroup.x = hexagonGroup.x;
        characterGroup.y = hexagonGroup.y;
        //
        this.neighborLights = [];
        for(var i=0;i<40;i++)
        {
            var light = this.add.group();
            var high = this.game.add.sprite(0,0, "tiles","tileWater_tile.png");
            this.neighborLights.push(light);
            light.add(high);
            hexagonGroup.add(light);
            
            var hexagonText = this.add.text(25,25,i+"");
            hexagonText.font = "arial";
            hexagonText.fontSize = 12;
            light.add(hexagonText);
            light.x = -1000;
        }
        
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
        //console.log(startpos[0]);
        this.createMapTiles(currentmap);        
    },
    flushEntireMap: function(){
        hexagonGroup.destroy();
        characterGroup.destroy();
        this.hexagonArray = [];
        waterTilesArray = [];
        walkableArray = [];
        this.playerCharacter = null;
    },
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        //
        if(waterTilesArray)
        {
            var length = waterTilesArray.length;
            for(var i = 0; i < length; i ++)
            {
                waterTilesArray[i].step(elapsedTime);
            }
        }
        if(!this.game.global.pause)
        {
            this.playerCharacter.step(elapsedTime);
            this.playerHex = this.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
            //var this.hexHandler.doFloodFill(this.playerHex,3);
        }
    },
    showDialog:function(dialogIn){
        this.diagpanel.startDialog(dialogIn);
        this.pauseGame();
    },
    showJustText:function(textDisplay)
    {
        this.justTextPopup.showText(textDisplay);
        this.pauseGame();
    },
    showJustTextDialog:function(convid)
    {
        this.justTextPopup.showTextFromHandler(convid);
        this.pauseGame();
    },
    pauseGame:function(){
        if(!this.game.global.pause)
        {
            this.game.global.pause = true;
            //pause everything
        }
    },
    unpauseGame:function(){
        if(this.game.global.pause)
        {
            this.game.global.pause = false;
            //unpause everything
        }
    },
    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },
    showPath:function()
    {
        if(this.game.global.pause)
        {
            return;
        }
        if(this.playerCharacter.isMoving)
            return;
        //
        moveIndex =  this.checkHex(this.input.worldX-hexagonGroup.x,this.input.worldY-hexagonGroup.y);
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
        var playertile = this.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
        var moveIndex =  this.checkHex(this.input.worldX-hexagonGroup.x,this.input.worldY-hexagonGroup.y);
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
        moveIndex =  this.checkHex(this.input.worldX-hexagonGroup.x,this.input.worldY-hexagonGroup.y);
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
            this.neighborLights[i].x = thetile.tileImage.x;
            this.neighborLights[i].y = thetile.tileImage.y;
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
            this.neighborLights[i].x = currenttile.tileImage.x;
            this.neighborLights[i].y = currenttile.tileImage.y;
        }
        else
        {
            this.neighborLights[i].x = -1000;
            this.neighborLights[i].y = 0;
        }
    },
    clickedHex:function()
    {
        if(this.game.global.pause)
        {
            return;
        }
        moveIndex =  this.checkHex(this.input.worldX-hexagonGroup.x,this.input.worldY-hexagonGroup.y);
        if(moveIndex!=null)
        {
            //var fridges = this.hexHandler.doFloodFill(moveIndex,3);
            //this.drawFridges(fridges);
            //
            if(this.game.currentacion==this.game.WALK)
            {
                if(moveIndex.walkable)
                {
                    var playertile = this.checkHex(this.playerCharacter.sprite.x,this.playerCharacter.sprite.y);
                    if(playertile)
                    {
                        pathfinder.setCallbackFunction(this.playercallback, this);
                        pathfinder.preparePathCalculation( [playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy] );
                        pathfinder.calculatePath();
                    }
                }
                else
                {
                    //console.log(moveIndex);
                    //console.log("not walkable");
                }
            }
        }
    },
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
    playercallback:function(path){
        path = path || [];
        this.playerCharacter.setPath(path);
    },
    checkHex:function(checkx, checky){
        if(!this.hexagonArray)
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
        if(this.gridSizeY%2==0 && candidateY%2==1)
        {
           candidateX++;
            if(candidateX<0)
                candidateX = 0;
        }
        if(candidateX<0 || candidateY<0 || candidateY>=this.gridSizeY || candidateX>columns[candidateY%2]-1){
            return;
		}
        return this.hexagonArray[candidateY][candidateX]
     },
    getTile: function(name, tilesetid){
        return {tile:this.mapData.tileSets[tilesetid][name],spritesheet:this.mapData.tileSets[tilesetid].tileset};
    },
    getTileByCords:function(x,y)
    {
        if(this.hexagonArray[x])
            if(this.hexagonArray[x][y])
                return this.hexagonArray[x][y];
        return null;
    },
    //ati,atj - position in array
    //locx,locy - position in world
    addHex:function (ati,atj,tileName,locx,locy){
        var hexagon = this.add.sprite(locx,locy, "tiles", tileName); 
        hexagonGroup.add(hexagon);
        this.hexagonArray[ati][atj]=hexagon;
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
    this.openair = true;
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
    //console.log("entertile");
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
    //
    this.walkable = false;  
    this.openair = true;
    //
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
};
WaveHandler.prototype.returnWave = function(wave)
{
    //this.closeWaves.splice(this.closeWaves.indexOf(wave),1);
    this.openWaves.push(wave);
};
//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};

