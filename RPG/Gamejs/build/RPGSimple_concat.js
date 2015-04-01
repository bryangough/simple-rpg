var BasicGame = {};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

    init: function () {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        }
        else
        {
            //  Same goes for mobile settings.
            //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
        }

    },

    preload: function () {
        this.load.atlasJSONHash('loadingScreen', 'assets/loading.png', 'assets/loading.json');
        
        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        //this.load.image('preloaderBackground', 'images/preloader_background.jpg');
        //this.load.image('preloaderBar', 'images/preloadr_bar.png');

    },

    create: function () {
        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.state.start('Preloader');
    }

};


BasicGame.Instructions = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.Instructions.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'instructions');

		this.playButton = this.add.button(177, 529, 'ui', this.returnToMain, this, 'OK Button0001.png', 'OK Button0002.png', 'OK Button0002.png','OK Button0001.png');
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	returnToMain: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('MainMenu');

	}
};

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



BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'mainmenu');

		this.playButton = this.add.button(376, 425, 'ui', this.startGame, this, 'Play Button0001.png', 'Play Button0002.png', 'Play Button0002.png','Play Button0001.png');
        
        this.playButton = this.add.button(376, 487, 'ui', this.gotoInstructions, this, 'Instructions Button0001.png', 'Instructions Button0002.png', 'Instructions Button0002.png','Instructions Button0001.png');

        
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	},
    gotoInstructions: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Instructions');

	}

};


BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
		this.preloadBar = this.add.sprite(0, 278, 'loadingScreen', 'loading_barfront.png');
        
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
        
        this.load.atlasJSONHash('ui', 'assets/simpleui.png', 'assets/simpleui.json');
        this.load.atlasJSONHash('tiles', 'assets/tiles.png', 'assets/tiles.json');
        this.load.atlasJSONHash('actors', 'assets/actors.png', 'assets/actors.json');
        this.load.atlasJSONHash('dialogui', 'assets/dialogui.png', 'assets/dialogui.json');
		this.load.image('loading', 'assets/loading.png');
        this.load.image('mainmenu', 'assets/mainmenu.png');
        this.load.image('mapselect', 'assets/mapselect.png');
        this.load.image('winscreen', 'assets/winscreen.png');
        this.load.image('instructions', 'assets/instructions.png');
        this.load.bitmapFont("badabb", "assets/fonts/badabb.png", "assets/fonts/badabb.fnt")
        
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
	   //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        
         this.state.start('Game');
       // this.state.start('MainMenu');
	},

	/*update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.ready == false)//this.cache.isSoundDecoded('titleMusic') && 
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}*/

};

var DialogHandler = function(game, conversations, actors){
    this.game = game;
    this.conversations = conversations;
    this.actors = actors;
    
    this.currentConvo;
    this.playerActor = this.getPlayerActor();
}
DialogHandler.prototype.startConvo = function(id){
    this.currentConvo = this.getConversationsByID(id);
    
    if(this.currentConvo!=null)
    {
        var currentDiagData = this.buildDialogByID(0);
        
        if(currentDiagData!=null)
        {
            if(currentDiagData.current.MenuText==""&&currentDiagData.current.DialogueText=="")
                currentDiagData = this.buildDialogWithDiag(currentDiagData.links[0]);
            return currentDiagData;
        }
    }
    return null;
}
//for every other types (displaying the npcs text, players text as options, then going straight to next npc text)
//passing in selected link returns next npc
//passing in current displayed return next npc or pc
DialogHandler.prototype.getNextDialog = function(currentDialog){
    if(currentDialog.links.length<=0||currentDialog.links[0]==null)
        return null;
    return this.buildDialogByID(currentDialog.links[0].DestID);
}
//
DialogHandler.prototype.buildDialogByID = function(id){
    var currentDiag = this.getDialogByID(id);

    if(currentDiag==null)
        return null;
    return this.buildDialogWithDiag(currentDiag);
}
//this might change but it seems like a good idea to just pass back in the diag when the link is selected
DialogHandler.prototype.buildDialogWithDiag = function(currentDiag){
    if(currentDiag==null)
        return null;
    var links = [];
    var l = currentDiag.links.length;
    var tempLink
    for(var i=0;i<l;i++)
    {
        //only handle single conversations for now

        var tempLink = this.getDialogByID(currentDiag.links[i].DestID); 
        
        if(tempLink!=null)
        {
            links.push(tempLink);
        }
    }
    var thisactor = this.getActorByID(currentDiag.Actor);//optimize this, save it somewhere
    var diagPackage = {current:currentDiag,links:links, actor:thisactor};    
    return diagPackage;
};
DialogHandler.prototype.getDialogByID = function(id){
    var l = this.currentConvo.DialogueEntries.length;
    for(var i=0;i<l;i++)
    {
        if(this.currentConvo.DialogueEntries[i].ID==id)
            return this.currentConvo.DialogueEntries[i];
    }
    return null;
};

DialogHandler.prototype.getConversationsByID = function(id){
    var l = this.conversations.length;
    for(var i=0;i<l;i++)
    {
        if(this.conversations[i].id==id)
            return this.conversations[i];
    }
    return null;
};
DialogHandler.prototype.getActorByID = function(actorid){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].id==actorid)
            return this.actors[i];
    }
    return null;
};
DialogHandler.prototype.getPlayerActor = function(){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].IsPlayer)
            return this.actors[i];
    }
    return null;
};
/*
- 

*/
var DialogPanel = function(game, maingame, dialogEngine, parent){
	Phaser.Group.call(this, game, parent);

    this.overTint = 0xff5500;
    this.maingame = maingame;
    this.dialogEngine = dialogEngine;

    var bg = this.game.make.sprite(0,0,"dialogui","dialog_main.png");
    this.add(bg);
    this.btnPlay1 = this.game.make.button(36.95, -22.4, 'dialogui', this.play1, this,'dialog_10002.png', 'dialog_10001.png', 'dialog_10001.png','dialog_10002.png');
    this.btnPlay2 = this.game.make.button(37.4, 25.25, 'dialogui', this.play2, this,'dialog_20002.png', 'dialog_20001.png', 'dialog_20001.png','dialog_20002.png');    
    this.btnPlay3 = this.game.make.button(35.95, 45.8, 'dialogui', this.play3, this,'dialog_30002.png', 'dialog_30001.png', 'dialog_30001.png','dialog_30002.png');
    //
    this.add(this.btnPlay1);
    this.add(this.btnPlay3);
    this.add(this.btnPlay2);
    
    this.btnPlay1.events.onInputOver.add(this.buttonOver, this);
    this.btnPlay2.events.onInputOver.add(this.buttonOver, this);
    this.btnPlay3.events.onInputOver.add(this.buttonOver, this);
    
    //this.btnPlay1.input.pixelPerfectOver = true;
    this.btnPlay1.input.useHandCursor = true;
    //this.btnPlay2.input.pixelPerfectOver = true;
    this.btnPlay2.input.useHandCursor = true;
    //this.btnPlay3.input.pixelPerfectOver = true;
    this.btnPlay3.input.useHandCursor = true;

    this.btnPlay1.events.onInputOut.add(this.buttonOut, this);
    this.btnPlay2.events.onInputOut.add(this.buttonOut, this);
    this.btnPlay3.events.onInputOut.add(this.buttonOut, this);

     
    this.text1 = this.game.make.bitmapText(95, -10, "badabb", "1. Check", 25);
    this.text2 = this.game.make.bitmapText(95, 35, "badabb", "2. Match", 25);
    this.text3 = this.game.make.bitmapText(95, 82, "badabb", "3. Mate", 25);

    this.btnPlay1.textRef = this.text1;
    this.btnPlay2.textRef = this.text2;
    this.btnPlay3.textRef = this.text3;
    
    this.textMain = this.game.make.bitmapText(0, -60, "badabb", "Text goes here.", 25);
    
    this.add(this.textMain);
    this.add(this.text1);
    this.add(this.text2);
    this.add(this.text3);

	// Place it out of bounds
	this.x = 300;
	//this.y = 250;
    this.y = -1000;
};

DialogPanel.prototype = Object.create(Phaser.Group.prototype);
DialogPanel.constructor = DialogPanel;

//roll over
DialogPanel.prototype.buttonOver = function(button){
    button.textRef.tint = this.overTint;
};
DialogPanel.prototype.buttonOut = function(button){
    button.textRef.tint = 0xffffff;
};

//
DialogPanel.prototype.play1 = function(button){
    this.dialogData = this.dialogData.links[0];
    this.nextDialog();
};
DialogPanel.prototype.play2 = function(button){
    this.dialogData = this.dialogData.links[1];
    this.nextDialog();
};
DialogPanel.prototype.play3 = function(button){
    this.dialogData = this.dialogData.links[2];
    this.nextDialog();
};
DialogPanel.prototype.nextDialog = function(){
    this.dialogData = this.dialogEngine.getNextDialog(this.dialogData);
    if(this.dialogData==null)
        this.endDialog();
    else
       this.setupDialog(); 
}
//
DialogPanel.prototype.setupDialog = function(){    
    this.textMain.text = this.dialogData.actor.Name +": " + this.dialogData.current.DialogueText;
    for(var i=0;i<3;i++)
    {
        if(this.dialogData.current.links[i]!=null)
        {
            this["btnPlay"+(i+1)].visible = true;
            this["btnPlay"+(i+1)].textRef.visible = true;
            this["btnPlay"+(i+1)].textRef.text = (i+1)+". " + this.dialogData.links[i].MenuText;
        }
        else
        {
            this["btnPlay"+(i+1)].visible = false;
            this["btnPlay"+(i+1)].textRef.visible = false;
        }
    }
}
//
DialogPanel.prototype.startDialog = function(id){
    this.dialogData = this.dialogEngine.startConvo(id);
    if(this.dialogData){
        this.visible = true;
        this.y = 250;
        this.setupDialog();
    }
};
DialogPanel.prototype.endDialog = function(){
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.maingame.unpauseGame();
    this.visible = false;
    this.y = -1000;
};
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    //
    this.currentActive;
    //
    this.walk = {up:null,active:null};
    this.setButton(0,0,"walkBtn0001.png","walkBtn0002.png",this.walk,this.dowalk);
    
    this.use = {up:null,active:null};
    this.setButton(71,0,"useBtn0001.png","useBtn0002.png",this.use,this.douse);
    
    this.look = {up:null,active:null};
    this.setButton(142,0,"lookBtn0001.png","lookBtn0002.png",this.look,this.dolook);
    
    this.talk = {up:null,active:null};
    this.setButton(212,0,"talkBtn0001.png","talkBtn0002.png",this.talk,this.dotalk);
    
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent){
    ref.up = this.game.make.sprite(x,y,"dialogui",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"dialogui",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
}
//these also should do something
ActionButtons.prototype.dowalk = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.WALK;
    this.currentActive = this.walk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.douse = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.USE;
    this.currentActive = this.use;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dolook = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.LOOK;
    this.currentActive = this.look;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dotalk = function(){
    this.disableButton(this.currentActive);
    this.game.currentacion = this.game.TALK;
    this.currentActive = this.talk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.enableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = false;
    ref.active.visible = true;
}
ActionButtons.prototype.disableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = true;
    ref.active.visible = false;    
}
//
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
    this.dialogEngine = dialogEngine;
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(0, 0, "badabb", "Text goes here.", 25);
    this.textMain.tint = 0x00ffff;
    this.add(this.textMain);
    this.x = -1000;
    //for if dialog
    this.dialogData;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay){
    this.x = 0;
    this.textMain.text = texttodisplay;
    this.dialogData = null;
    this.game.input.onDown.add(this.nextPopup, this);
}
JustTextPopup.prototype.showTextFromHandler = function(convoid){
    this.dialogData = this.dialogEngine.startConvo(convoid);
    if(this.dialogData){
        this.visible = true;
        this.x = 0;
        this.textMain.text = this.dialogData.current.DialogueText;
        this.game.input.onDown.add(this.nextPopup, this);
    }
}
JustTextPopup.prototype.nextPopup = function(){
    if(this.dialogData)
        this.dialogData = this.dialogEngine.getNextDialog(this.dialogData.current);
    if(this.dialogData==null)
    {
        this.closePopup();
        return;
    }
    this.textMain.text = this.dialogData.current.DialogueText;
}
JustTextPopup.prototype.closePopup = function(){
    this.dialogData = null
    this.x = -1000;
    this.game.input.onDown.remove(this.nextPopup, this);
    
    this.maingame.unpauseGame();
}
//
//pool of barks, handles placing them
BarkTextHandler = function(game,maingame){
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.returnBarkToPool = function(over){
}
//map change
BarkTextHandler.prototype.cleanupAllBarks = function(){
}

//
BarkText = function(){
    this.textfield;//
    this.timer;//
    this.over;
}
BarkText.prototype = function(elapseTime){
}
//

//
var EventConv = function (game, maingame, destroyfunc, json) 
{
    //this.convid = json.convid;
    //this.once = json.once;
    //if json.once destroy self on use
}
EventConv.prototype.removeSelf = function() 
{
    
}
EventConv.prototype.activateEvent = function() 
{
    this.maingame.showDialog(this.convid);
    if(this.once){
        //call destroy func
    }
}
//
var EventnText = function (json) 
{
}
//items
//variables
/*
 {
    "type": "actionconvtrigger",
    "trigger": "OnTalk",
    "convid": 1,
    "once": false,
    "skipIfNoValidEntries": false
},
{
    "type": "actorset",
    "ActorName": "Crab"
},
{
    "type": "actiontext",
    "lookatactive": true,
    "lookat": "A baby crab trying to get your attention."
}
interacttrigger
*/
/*
Actors/enemies animations
- move x6
- attaks? x6
- hurt x6
- die
- knockdown
- use/action x6



OTHER ACTIONS
- load special animations - (array)
- destroy graphic(self)
- hide graphic, show graphic 
- change graphic/play animation
- set tile walkable, unwalkable

actor
- move to tile
- combat editor(later)
- start combat if enter range



- display message



Item[\"BabyCrab\"].Inventory = true
Item[\"BabyCrab\"].pickup();
- destroy graphic
- set walkable?




this.interactiveobject = destroy (remove graphic), no longer interactive(graphic stays, no longer touchable)
//click once for pickup, click again says you can't? or just can't
//does visual state change?
//ininventory means it starts there when you enter the game


Variable
- onchange - allow objects to register waiting for changes?


Quest
state
Entry_#_state //# is 1,2,3


Convo
- branching
- single in row
- bark


- on range?

//move to tile(x,y), map 1
Actor[\"Player\"].moveTo(1,2,1);

*/
function saveState(state) { 
    window.localStorage.setItem("gameState", JSON.stringify(state)); 
} 
 
function restoreState() { 
    var state = window.localStorage.getItem("gameState"); 
    if (state) { 
        return JSON.parse(state); 
    } else { 
        return null; 
    } 
}
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
var MovingCharacter = function (maingame, name) 
{
    
    this.maingame = maingame;
    this.name = name;
    this.sprite = this.maingame.make.sprite(0,0, "actors","movingPerson2_idle0001.png");
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
    
    //basic animations
    //next proper direction facing
    this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('movingPerson2_idle', 1, 2, '.png', 4), 1, true, false);
    this.sprite.animations.add('walk', Phaser.Animation.generateFrameNames('movingPerson2_walk', 1, 4, '.png', 4), 8, true, false);
    
    this.sprite.animations.play("idle");
    
    /*this.sprite.animations.currentAnim.onComplete.add(function () {
       this.sprite.animations.play('idle', 30, true);
    }, this);*/
    
    this.oldTile;
    this.currentTile;
    
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    this.dir = new Phaser.Point();
    this.walkspeed = 0.1875;
    
    
    this.inventory = [];
    
};
MovingCharacter.prototype.isMoving = function() 
{
   if(this.dir.x == 0 && this.dir.y == 0)
       return false;
    return true;
}
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.sprite.x = inx;
    this.sprite.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    this.sprite.x = tile.tileImage.x+this.maingame.halfHex;
    this.sprite.y = tile.tileImage.y+this.maingame.halfHex;
    this.oldTile = tile;
    this.currentTile = tile;
}
MovingCharacter.prototype.setDirection = function() 
{
    this.dir.x =  this.nextTile.tileImage.x+this.maingame.halfHex-this.sprite.x;
    this.dir.y =  this.nextTile.tileImage.y+this.maingame.halfHex-this.sprite.y;
    this.dir.normalize();
}
MovingCharacter.prototype.setPath = function(path) 
{
    //
    if(!path)
        return;
    if(path.length<=0)
        return;
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = this.maingame.getTileByCords(path[this.pathlocation].x,path[this.pathlocation].y);
    this.setDirection();
    this.sprite.animations.play("walk");
}
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            this.currentTile = this.maingame.checkHex(this.sprite.x,this.sprite.y);
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.tileImage.x+this.maingame.halfHex;
                    var testy = this.currentTile.tileImage.y+this.maingame.halfHex;
                    var range = 3;
                    if(testx-range<this.sprite.x && testx+range>this.sprite.x && testy-range<this.sprite.y && testy+range>this.sprite.y)
                    {
                        this.sprite.x = testx;
                        this.sprite.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile();
                        this.sprite.animations.play("idle");
                    }
                    this.setDirection();
                }
                else
                {
                    this.nextTile = this.maingame.getTileByCords(this.path[this.pathlocation].x,this.path[this.pathlocation].y);
                    this.setDirection();
                }
            }
        }
    }
    this.sprite.x += this.dir.x * this.walkspeed * elapseTime;
    this.sprite.y += this.dir.y * this.walkspeed * elapseTime;
    
    if(this.dir.x<0)
        this.sprite.scale.x = -1;
    else if(this.dir.x>0)
        this.sprite.scale.x = 1;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
//Student.prototype = Object.create(Person.prototype); 
//Student.prototype.constructor = Student;

var InteractiveObject = function (maingame, jsondata) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    this.jsondata = jsondata;
    this.tileobject;
    //art for the object here
    this.actions = [];
    //
    var actions = this.jsondata.actions;
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actionconvtrigger")
            this.handleActionConvTrigger(actions[i]);
        else if(actions[i].type=="actorset")
            this.handleActorSet(actions[i]);
        else if(actions[i].type=="actiontext")
            this.handleActionText(actions[i]);
    }
    //
    this.setupArt(this.jsondata);
}
InteractiveObject.prototype.handleActorSet = function(json) 
{
    
}
InteractiveObject.prototype.handleActionConvTrigger = function(json) 
{
    var action = json;
    this.actions[json.trigger] = action;
    
}
InteractiveObject.prototype.handleActionText = function(json) 
{
    //var action = json;
    //this.actions[json.trigger] = action;
    //if(json.lookatactive)
    //{
    //}
}
InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupReactToAction = function() 
{
    this.tileobject.events.onInputDown.add(handleClick, this);
    //this.tileobject.events.onInputOver.add(, this);//for rollover
    //this.tileobject.events.onInputOut.add(, this);
}
InteractiveObject.prototype.handleClick = function() 
{
    //this.game.currentacion
    //if(this.game.currentacion==this.game.WALK)
    //{
    //}
    
}
InteractiveObject.prototype.setupArt = function(json) 
{
    var objectreference = this.maingame.getTile(this.jsondata.name,this.jsondata.tilesetid);
    var spotx = this.jsondata.x;
    var spoty = this.maingame.gridSizeY-this.jsondata.y-1;
    this.tileobject = this.game.make.sprite(this.jsondata.offsetx*this.maingame.hexagonWidth, this.jsondata.offsety*this.maingame.hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");
    this.maingame.hexagonArray[spoty][spotx].tileImage.addChild(this.tileobject);
    this.tileobject.anchor.x = 0.5;
    this.tileobject.anchor.y = 1.0;
}

var InventoryEngine = function (maingame, jsondata) 
{
}
InventoryEngine.prototype.enterInventory = function() 
{
}