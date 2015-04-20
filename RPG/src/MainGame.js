BasicGame.Game = function (game) {
    
    this.playerCharacter;//Controlled Character
    this.playerHex;//current hex under player
    
    this.diagpanel;//Dialog UI;
    this.justTextPopup;//Single text display
    this.activeButtons;//Action Buttons ui
    
    this.neighborLights = [];

    this.gridSizeX = 30;//slotted for removal
	this.gridSizeY = 15;//slotted for removal

    this.hexHandler;//hex helper functions
    this.highlightHex;
    this.pathfinder;//a* searcher
    
    this.graphics;//drawable
    
    //groups
    this.uiGroup;
    this.hexagonGroup;
    this.characterGroup;

    this.interactiveObjects = [];
    this.startpos;

    this.mapData;
    this.globalHandler;
    this.inventory;
};

//
// ----

BasicGame.Game.prototype = {
    preload: function(){
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        this.load.json('map', 'assets/forestmap.json');
    },
    create: function () {
        this.stage.backgroundColor = "#666666"
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
       
        this.interactiveObjects = [];
        this.uiGroup = this.add.group();
        //
        this.mapData = this.game.cache.getJSON('map');
        //
        this.hexHandler = new HexHandler(this,this.game, this.mapData.mapData.hexWidth,this.mapData.mapData.hexHeight);
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        
        this.startpos = this.mapData.startPos;//.split("_");
        var currentmap = this.mapData.maps[this.startpos.map];
        this.createMapTiles(currentmap);
        //
        this.dialoghandler = new DialogHandler(this.game, this, this.mapData.data.Conversations, this.mapData.data.Actors);
        //
        this.diagpanel = new DialogPanel(this.game,this,this.dialoghandler);
	    this.game.add.existing(this.diagpanel);
        this.uiGroup.add(this.diagpanel);
        
        this.justTextPopup = new JustTextPopup(this.game,this,this.dialoghandler);
        this.game.add.existing(this.justTextPopup);
        this.uiGroup.add(this.justTextPopup);
        
        this.inventory = new InventoryGraphics(this.game,this,this.globalHandler);
	    this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        this.inventory.x = 350;
        this.inventory.y = 400;
        //this.input.addMoveCallback(this.drawLine, this); 
        //this.input.onDown.add(this.drawLine, this); 
        //MOVE
        //this.input.onOver.add(this.onOn, this);
        this.input.addMoveCallback(this.onMove, this); 
        this.input.onDown.add(this.clickedHex, this);
        
        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.y = 400;
        this.game.add.existing(this.activeButtons);
        this.uiGroup.add(this.activeButtons);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        
        //this.showJustTextDialog(3);
        //this.showJustText("YEP");
        //this.showDialog(1);
    },
    createMapTiles: function(passedMap){
        var hexagonArray = [];
        var waterTilesArray = [];
        var hexagonWidth = this.hexHandler.hexagonWidth;
        var hexagonHeight = this.hexHandler.hexagonHeight;
        this.hexagonGroup = this.add.group();
        this.characterGroup = this.add.group();
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
        var temptile;
        //
        for(var i = 0; i < this.gridSizeY; i ++){
	     	hexagonArray[i] = [];
            walkableArray[i] = [];
			for(var j = 0; j < this.gridSizeX; j ++)
            {
                //objectName = tiles[i*this.gridSizeX+j];
                objectName = tiles[j*this.gridSizeX+i];
                tilereference = this.getTile(objectName,tilesetid);
                var hexagonX = hexagonWidth*j;
                if(this.gridSizeY%2==1)
                    hexagonX += hexagonWidth/2*(i%2);
                else
                    hexagonX -= hexagonWidth/2*(i%2);
                var hexagonY = (hexagonHeight/4*3)*i;
                
                if(false)//tilereference.tile=="tileWater")
                {
                    temptile = new WaterTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, hexagonX, hexagonY);
                    waterTilesArray.push(temptile);
                }
                else
                {
                   temptile = new WalkableTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, hexagonX, hexagonY, this);
                }
                hexagonArray[i][j]=temptile;
                this.hexagonGroup.add(temptile);

                //
                walkableArray[i][j] = layer1.walkable[j*this.gridSizeX+i];
                if(walkableArray[i][j] == 0)
                {
                    hexagonArray[i][j].walkable = false;
                }
                //
                /*
                var hexagonText = this.add.text(hexagonX+hexagonWidth/3+5,hexagonY+15,i+","+j);
                hexagonText.font = "arial";
                hexagonText.fontSize = 8;
                this.hexagonGroup.add(hexagonText);
                */
			}
		}
        this.pathfinder.setGrid(walkableArray, [1]);
        this.hexHandler.hexagonArray = hexagonArray;
        this.hexHandler.waterTilesArray = waterTilesArray;
        var objects = layer1.objects;
        var spotx,spoty;
        for(var i = 0; i < objects.length; i ++)
        {
            if(objects[i].triggers)//if have actions then is an interactive object
            {
                if(!objects[i].destroyed)//object has been destroyed
                {
                    var interactiveobject = new InteractiveObject(this, objects[i],tileobject);
                    this.interactiveObjects.push(interactiveobject);
                }
            }
            else
            {
                var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                spotx = objects[i].x;
                spoty = objects[i].y;
                var tileobject = this.game.make.sprite(objects[i].offsetx*hexagonWidth, objects[i].offsety*hexagonHeight, objectreference.spritesheet, objectreference.tile+".png");
                hexagonArray[spotx][spoty].addChild(tileobject);
                tileobject.anchor.x = 0.5;
                tileobject.anchor.y = 1.0;
            }
        }
        var actionSpots = layer1.actionSpots;
        for(var i = 0; i < actionSpots.length; i ++)
        {
            //var selectedtile = hexagonArray[this.gridSizeY-actionSpots[i].y-1][actionSpots[i].x];
            var selectedtile = hexagonArray[actionSpots[i].x][actionSpots[i].y];
            if(selectedtile)
            {
                if(!selectedtile.eventDispatcher)
                {
                    selectedtile.eventDispatcher = new EventDispatcher(this.game,this,selectedtile);
                }
                selectedtile.eventDispatcher.receiveData(actionSpots[i].triggers);
            }
        }
        //
		this.hexagonGroup.y = (600/2-hexagonHeight*Math.ceil(this.gridSizeY/2))/2;
          if(this.gridSizeY%2==0){
               this.hexagonGroup.y-=hexagonHeight/4;
          }
        this.hexagonGroup.x = (900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
          if(this.gridSizeX%2==0){
               this.hexagonGroup.x-=hexagonWidth/8;
          }
        
        this.highlightHex = new HighlightHex(this.game, this, this.hexHandler);
        this.game.add.existing(this.highlightHex);
        this.highlightHex.setup();
        this.characterGroup.add(this.highlightHex);
        //this.hexagonGroup.add(this.highlightHex);
       // this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        
        
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new MovingCharacter(this,this.game, "player");
            this.game.add.existing(this.playerCharacter);
            this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y]);
        }
        this.hexagonGroup.add(this.playerCharacter);
        //this.characterGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        this.characterGroup.x = this.hexagonGroup.x;
        this.characterGroup.y = this.hexagonGroup.y;
        //
    },
    setChangeMapTile:function(selectedtile){
        var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
        selectedtile.addChild(doorImage);
    },
    userExit:function(data) {
        //
        this.startpos.map = data.tmap;
        this.startpos.x = data.tx;
        this.startpos.y = data.ty;
        //
        this.flushEntireMap();
        //
        var currentmap = this.mapData.maps[this.startpos.map];
        //
        GlobalEvents.flushEvents();
        this.createMapTiles(currentmap);        
    },
    flushEntireMap: function(){
        this.hexagonGroup.destroy();
        this.characterGroup.destroy();
        this.playerCharacter = null;
        this.hexHandler.flush();
    },
    //
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        this.hexHandler.update(elapsedTime);
        
        if(!this.game.global.pause)
        {
            this.playerCharacter.step(elapsedTime);
            this.playerHex = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
            //var this.hexHandler.doFloodFill(this.playerHex,3);
        }
        this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
    },
    //
    showDialog:function(convid){
        this.diagpanel.startDialog(convid);
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
    //
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
    //
    onMove:function()
    {
        if(GlobalEvents.currentacion != GlobalEvents.WALK)
        {
            return;
        }
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);
        var playertile = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
        
        
        //this.highlightHex.doShowPath(this.pathfinder,playertile,moveIndex);
        //this.hexHandler.dolines(playertile,moveIndex,false,this.highlightHex);
        //var fridges = this.hexHandler.doFloodFill(moveIndex,4);
        //this.highlightHex.drawFringes(fridges);
        this.highlightHex.highlighttilebytile(0,moveIndex);
        //this.highlightHex.highilightneighbors(moveIndex);
    },
    clickedHex:function()
    {
        if(GlobalEvents.currentacion != GlobalEvents.WALK)
            return;
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x, this.input.worldY-this.hexagonGroup.y);
        if(moveIndex!=null)
        {
            //var fridges = this.hexHandler.doFloodFill(moveIndex,3);
            //this.drawFridges(fridges);
            //
            if(this.game.currentacion==this.game.WALK)
            {
                //activate this to make it not able to walk to spot
                //if(moveIndex.walkable)
                //{
                    var playertile = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
                    if(playertile)
                    {
                        //straight line walk
                        //var path = this.hexHandler.getlinepath(playertile,moveIndex);
                        //this.playerCharacter.setPath(path);
                        //a* walk
                        this.pathfinder.setCallbackFunction(this.playercallback, this);
                        this.pathfinder.preparePathCalculation( [playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy] );
                        this.pathfinder.calculatePath();
                    }
                /*}
                else
                {
                    //console.log(moveIndex);
                    //console.log("not walkable");
                }*/
            }
        }
    },
    playercallback:function(path){
        path = path || [];
        path = this.hexHandler.pathCoordsToTiles(path);
        this.playerCharacter.setPath(path);
    },    
    getTile: function(name, tilesetid){
        return {tile:this.mapData.tileSets[tilesetid][name],spritesheet:this.mapData.tileSets[tilesetid].tileset};
    }
    
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};

