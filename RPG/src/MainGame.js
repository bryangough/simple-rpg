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
    this.mapGroup;
    
    this.uiGroup;
    this.objectGroup;
    this.highlightGroup;
    this.hexagonGroup;
    

    this.interactiveObjects = [];
    this.startpos;

    this.mapData;
    this.globalHandler;
    this.inventory;
    
    this.walkableArray;
    this.maskableobjects;
    this.updatewalkable = false;
    
    this.fps;
    
    this.tiletest;
    this.masker;
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
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
        
        
        //this.game.time.advancedTiming = true;
        //fps = this.game.make.bitmapText(20, 0, "badabb", "---", 25);
        //this.uiGroup.add(fps);        
    },
    createMapTiles: function(passedMap){
        var hexagonArray = [];
        var waterTilesArray = [];
        //
        this.objectGroup = this.add.group();
        this.highlightGroup = this.add.group();
        this.hexagonGroup = this.add.group();
        //
        this.mapGroup = this.add.group();
        this.mapGroup.add(this.hexagonGroup);
        this.mapGroup.add(this.highlightGroup);
        this.mapGroup.add(this.objectGroup);
        //
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        this.maskableobjects = [];
        this.walkableArray = [];
        //
        for(var mapscounter=0;mapscounter<passedMap.length;mapscounter++)
        //if(true)
        {
            //var layer1 = passedMap[1];
            var layer1 = passedMap[mapscounter];
            if(layer1.handleMovement)
                this.hexHandler = new DiamondHexHandler(this,this.game, layer1.hexWidth,layer1.hexHeight);
            
            var hexagonWidth = layer1.hexWidth;
            var hexagonHeight = layer1.hexHeight;

            this.gridSizeY = layer1.height;
            this.gridSizeX = layer1.width;
            var tiles = layer1.data;
            var tilesetid = layer1.tilesetid;
            var objectName;
            var tilereference;
            var temptile;
            
            var offsetx = layer1.offsetx || 0;
            var offsety = layer1.offsety || 0;
            //
            
            var tempPoint = new Point(0,0);
            var offset = 0;
            
            //
            if(layer1.handleSprite)
            {
                for(var i = 0; i < this.gridSizeX; i ++)
                {
                    
                    if(layer1.handleMovement)
                        hexagonArray[i] = [];
                    for(var j = 0; j < this.gridSizeY; j ++)
                    {
                        objectName = tiles[j*this.gridSizeX+i];
                        tilereference = this.getTile(objectName,tilesetid);
                        
                        HexHandler.GetMapCoords(layer1.tiletype, tempPoint, hexagonWidth, hexagonHeight, i, j);
                        tempPoint.x += 16;
                        tempPoint.y -= 4;
                        
                        if(layer1.handleMovement)//make tile
                        {
                            temptile = new WalkableTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this);
                            hexagonArray[i][j]=temptile;//only if same
                        }
                        else
                        {
                            temptile = new GraphicTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this);
                        }
                        this.hexagonGroup.add(temptile);
                        //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                    }
                }
            }
            //
            if(layer1.handleMovement)
            {
                
                for(var i = 0; i < this.gridSizeX; i ++)
                {
                    if(!layer1.handleSprite)
                        hexagonArray[i] = [];
                    this.walkableArray[i] = [];
                    for(var j = 0; j < this.gridSizeY; j ++)
                    {
                        this.walkableArray[i][j] = layer1.walkable[j*this.gridSizeX+i];
                        if(!layer1.handleSprite)//no sprite - need to something to select (this might not need to be destroyed)
                        {
                            //this needs to be switched out
                            HexHandler.GetMapCoords(layer1.tiletype, tempPoint, hexagonWidth, hexagonHeight, i, j);
                            //
                           // console.log(i,j);
                            //console.log(tempPoint);
                            //
                            /*var tile;
                            if(this.walkableArray[i][j]==0)
                                tile = new GraphicTile(this, "tile_highlight0003.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                            else
                                tile = new GraphicTile(this, "tile_highlight0002.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                            
                            this.highlightGroup.add(tile);
                            this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);*/
                            //
                            hexagonArray[i][j] = new SimpleTile(this,i,j,tempPoint.x,tempPoint.y);
                        }
                        if(this.walkableArray[i][j] == 0)
                        {                    
                            hexagonArray[i][j].walkable = false;
                        }
                    }
                }
            }
            if(hexagonArray.length>0)
            {
                var tile1 = hexagonArray[0][0];
                var tile2 = hexagonArray[0][20];
                var tile3 = hexagonArray[20][0];
                //console.log(tile3.x,tile1.x,tile3.y,tile1.y);
            //console.log(tile2.x-tile1.x,tile2.y-tile1.y,tile3.x-tile1.x,tile3.y-tile1.y);
            }
            
            
            //this.tiletest = this.game.make.image(0,0,"tiles2","hextiletouchmap.png");
            //this.highlightGroup.add(this.tiletest);
           // continue;
            //

            
             
            if(layer1.objects)
            {
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
                            //interactive objects are never maskable
                        }
                    }
                    else
                    {
                        var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                        spotx = objects[i].x;
                        spoty = objects[i].y;
                       // console.log(objects[i].x,objects[i].y*-1);
                        //why 16?
                        var tileobject = this.game.make.image(objects[i].x + 16, 
                                                               objects[i].y*-1 + 16, 
                                                               objectreference.spritesheet, objectreference.tile+".png");
                       /* var tileobject = this.game.make.image(objects[i].offsetx * hexagonWidth + this.mapGroup.x + hexagonArray[spotx][spoty].x, 
                                                               objects[i].offsety * hexagonHeight + this.mapGroup.y + hexagonArray[spotx][spoty].y, 
                                                               objectreference.spritesheet, objectreference.tile+".png");*/
                        //hexagonArray[spotx][spoty].addChild(tileobject);
                        this.objectGroup.add(tileobject);
                        tileobject.anchor.x = 0.5;
                        tileobject.anchor.y = 1.0; 
                        
                        if(objects[i].maskable){//maskable objects to check when player move
                            this.maskableobjects.push(tileobject);
                            //console.log(this.maskableobjects);
                        }
                    }
                }
            }
            var actionSpots = layer1.actionSpots;
            if(actionSpots)
            {
                for(var i = 0; i < actionSpots.length; i ++)
                {
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
            }
        }
        //
        this.hexHandler.hexagonArray = hexagonArray;
        this.hexHandler.waterTilesArray = waterTilesArray;
        //these should be screen width and height
		this.mapGroup.y = (440-hexagonHeight*Math.ceil(this.gridSizeY/2))/2;
        //if(this.gridSizeY%2==0){
        //    this.mapGroup.y-=hexagonHeight/4;
        //}
        this.mapGroup.x = 0;//(900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
        //if(this.gridSizeX%2==0){
        //    this.mapGroup.x-=hexagonWidth/8;
        //}
        //
        this.highlightHex = new HighlightHex(this.game, this, this.hexHandler);
        //this.game.add.existing(this.highlightHex);
        this.highlightHex.setup();
        this.highlightGroup.add(this.highlightHex);
                
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new PlayerCharacter(this, this.mapData.Player);
            this.game.add.existing(this.playerCharacter);
            this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y]);
        }
        this.objectGroup.add(this.playerCharacter);
        
        this.pathfinder.setGrid(this.walkableArray, [1]);
        this.masker = new Masker(this.game, this, this.maskableobjects);
        //
        this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
    },
    addLocationTextToTile:function(x,y,width,height,i,j){
        var hexagonText = this.add.text(x+width/4,y+3,i+","+j);
        hexagonText.font = "arial";
        hexagonText.fontSize = 8;
        this.highlightGroup.add(hexagonText);
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
        this.hexagonGroup.removeAll(true);
        this.highlightGroup.removeAll(true);
        this.objectGroup.removeAll(true);
        //
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
            //this.playerHex = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
            //var this.hexHandler.doFloodFill(this.playerHex,3);
        }
        //this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        this.objectGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        //
        if(this.updatewalkable)
        {
           this.pathfinder.setGrid(this.walkableArray, [1]);
            this.updatewalkable = false;
        }
        this.masker.updateMasks(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        //fps.text = this.game.time.fps;
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
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        var playertile = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
        if(moveIndex)
        {
            //this.tiletest.x = moveIndex.x;
            //this.tiletest.y = moveIndex.y;
        }
        //console.log(playertile);
        //console.log(playertile.posx,playertile.posy,this.playerCharacter.x,this.playerCharacter.y);
       // if(moveIndex)
        //    console.log(moveIndex.posx,moveIndex.posy);
        
        //console.log(this.input.worldX,this.mapGroup.x,this.input.worldX-this.mapGroup.x);
        
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
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.mapGroup.x, this.input.worldY-this.mapGroup.y);
        if(moveIndex!=null)
        {
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

/*
 if(false)//tilereference.tile=="tileWater"){
                    temptile = new WaterTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, hexagonX, hexagonY);
                    waterTilesArray.push(temptile);
                }
                else{
                */