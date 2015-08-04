BasicGame.Game = function (game) {
    
    this.playerCharacter;//Controlled Character
    this.playerHex;//current hex under player
    
    this.diagpanel;//Dialog UI;
    this.justTextPopup;//Single text display
    this.barkHandler;
    this.activeButtons;//Action Buttons ui
    
    this.neighborLights = [];

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
    
    this.movementgrid;
    this.spritegrid;
    
    this.rollovertext;
    this.highlightArray;
    
    this.dragScreen = false;
    this.didDrag = false;
    this.dragPoint = new Point(0,0);
    
    this.objectoffset = new Point(0,0);
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        this.load.json('map', 'assets/maps/forestmap.json');
    },
    create: function () {
        
        
        
        this.stage.backgroundColor = "#444444"
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
        this.diagpanel.setup();
        
        this.justTextPopup = new JustTextPopup(this.game,this,this.dialoghandler);
        this.game.add.existing(this.justTextPopup);
        this.uiGroup.add(this.justTextPopup);
        
        this.barkHandler = new BarkTextHandler(this.game,this);
        this.game.add.existing(this.barkHandler);
        this.uiGroup.add(this.barkHandler);
        
        this.rollovertext = this.game.make.bitmapText(0, 0, "badabb", "Text goes here.", 25);
        this.rollovertext.visible = false;
        this.game.add.existing(this.rollovertext);
        this.uiGroup.add(this.rollovertext);
        
        
        this.inventory = new InventoryGraphics(this.game,this,this.globalHandler);
	    this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        this.inventory.x = 600;
        this.inventory.y = 490;
        //this.input.addMoveCallback(this.drawLine, this); 
        //this.input.onDown.add(this.drawLine, this); 
        //MOVE
        //this.input.onOver.add(this.onOn, this);
        this.input.addMoveCallback(this.onMove, this); 
        this.input.onDown.add(this.doDragScreen, this);
        this.input.onUp.add(this.clickedHex, this);
        
        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.x = 20;
        this.activeButtons.y = 490;
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
        this.interactiveObjects = [];
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
        var mapscounter;
        for(mapscounter=0;mapscounter<passedMap.length;mapscounter++)
        {
            var layer1 = passedMap[mapscounter];
            if(layer1.handleMovement)
            { 
                var hexagonWidth = layer1.hexWidth;
                var hexagonHeight = layer1.hexHeight;
                this.objectoffset.x = hexagonWidth/2;
                this.objectoffset.y = hexagonHeight;
            }
        }
        for(mapscounter=0;mapscounter<passedMap.length;mapscounter++)
        //if(true)
        {
            //var layer1 = passedMap[1];
            var layer1 = passedMap[mapscounter];
            if(layer1.handleMovement)
            {
                if(layer1.tiletype=="Iso")
                {
                    this.hexHandler = new IsoHandler(this, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
                }                                
                else if(layer1.tiletype=="HexIso")
                {
                    this.hexHandler = new DiamondHexHandler(this,this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
                }
                else
                {
                    this.hexHandler = new HexHandler(this, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
                }
                //Iso
                //
                //this.hexHandler = new DiamondHexHandler(this,this.game, layer1.hexWidth,layer1.hexHeight);
            }
            
            var hexagonWidth = layer1.hexWidth;
            var hexagonHeight = layer1.hexHeight;

            var gridSizeY = layer1.height;
            var gridSizeX = layer1.width;
            var tiles = layer1.data;
            var tilesetid = layer1.tilesetid;
            var offsetx = layer1.offsetx || 0;
            var offsety = layer1.offsety || 0;
            var tiletype = layer1.tiletype;
            
            if(layer1.handleMovement)
            {
                this.movementgrid = new Grid(this, layer1);
            }
            if(layer1.handleSprite)
            {
                this.spritegrid = new Grid(this, layer1);
            }
            
            var objectName;
            var tilereference;
            var temptile;            
            var tempPoint = new Point(0,0);
            var offset = 0;
            
            //
            if(layer1.handleSprite)
            {
                for(var i = 0; i < gridSizeX; i ++)
                {
                    
                    if(layer1.handleMovement)
                        hexagonArray[i] = [];
                    for(var j = 0; j < gridSizeY; j ++)
                    {
                        objectName = tiles[j*gridSizeX+i];
                        tilereference = this.getTile(objectName,tilesetid);
                        tempPoint = this.spritegrid.GetMapCoords(i,j);
                        
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
                        this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                    }
                }
            }
            //
            highlightArray = [];
            if(layer1.handleMovement)
            { 
               // this.objectoffset.x = hexagonWidth/2;
                //this.objectoffset.y = hexagonHeight;
                //console.log(this.objectoffset);
                for(var i = 0; i < gridSizeX; i ++)
                {
                    if(!layer1.handleSprite)
                    {
                        hexagonArray[i] = [];
                        highlightArray[i] = [];
                    }
                    this.walkableArray[i] = [];
                    for(var j = 0; j < gridSizeY; j ++)
                    {
                        this.walkableArray[i][j] = layer1.walkable[j*gridSizeX+i];
                        //this.walkableArray[i][j] = 1;
                        if(!layer1.handleSprite)//no sprite - need to something to select (this might not need to be destroyed)
                        {
                            tempPoint = this.movementgrid.GetMapCoords(i,j);
                            hexagonArray[i][j] = new SimpleTile(this,i,j,tempPoint.x,tempPoint.y);
                            
                            //this needs to be switched out
                            if(this.game.global.showmovetile)
                            {
                                //var tile = new GraphicTile(this, "tile_highlight0002.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                                var tile = null;
                                if(tiletype=="HexIso")
                                    tile = new GraphicTile(this, "tile_highlight0001.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                                else
                                    tile = new GraphicTile(this, "halfiso/halfiso_highlight.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                                if(this.walkableArray[i][j]==0)
                                    tile.tint = 0xff0000;
                                    
                                highlightArray[i][j] = tile;
                                this.highlightGroup.add(tile);
                                this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                            }
                            //
                        }
                        if(this.walkableArray[i][j] == 0)
                        {                    
                            hexagonArray[i][j].walkable = false;
                        }
                    }
                }
            }
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
                            var isMoveSpecial = false;
                            for(var j=0;j<objects[i].triggers.length;j++)
                            {
                                if(objects[i].triggers[j].type=="mover" || objects[i].triggers[j].type=="combatAttributes")
                                {
                                    isMoveSpecial = true;
                                    break;
                                }
                            }
                            var interactiveobject;
                            if(isMoveSpecial)
                            {
                                interactiveobject = new MovingCharacter(this, objects[i]);
                            }
                            else
                            {
                                interactiveobject = new InteractiveObject(this, objects[i]);
                            }
                            this.interactiveObjects.push(interactiveobject);

                            interactiveobject.posx = objects[i].posx;
                            interactiveobject.posy = objects[i].posy;
                        }
                    }
                    else//this might not be complete true? //without any triggers the object is just a picture
                    {
                        //
                        var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                        spotx = objects[i].x;
                        spoty = objects[i].y * -1;
                        var tileobject = new SimpleObject(this.game,
                                                                spotx + this.objectoffset.x,
                                                                spoty + this.objectoffset.y,
                                                                objectreference.spritesheet, objectreference.tile+".png");
                        tileobject.posx = objects[i].posx;
                        tileobject.posy = objects[i].posy;
                        this.objectGroup.add(tileobject);
                        //
                        
                        //
                        if(objects[i].maskable){//maskable objects to check when player/mouse move
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
		this.mapGroup.y = (440-hexagonHeight*Math.ceil(gridSizeY/2))/2;
      
        //if(gridSizeY%2==0){
        //    this.mapGroup.y-=hexagonHeight/4;
        //}
        this.mapGroup.x = 0;//(900-Math.ceil(gridSizeX)*hexagonWidth)/2;
        //if(gridSizeX%2==0){
        //    this.mapGroup.x-=hexagonWidth/8;
        //}
        //
        this.highlightHex = new HighlightHex(this.game, this, this.hexHandler);
        //this.game.add.existing(this.highlightHex);
        this.highlightHex.setup();
        this.highlightGroup.add(this.highlightHex);
                
        //
        //console.log(this.game);
        for(var i=0;i<this.interactiveObjects.length;i++)
        {
            if(this.interactiveObjects[i])
                this.interactiveObjects[i].dosetup();
        }
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new PlayerCharacter(this, this.mapData.Player);
            this.game.add.existing(this.playerCharacter);
            this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y]);
        }
        this.objectGroup.add(this.playerCharacter);
       
        
        this.pathfinder.setGrid(this.walkableArray, [1]);
        this.masker = new CheapMasker(this.game, this, this.maskableobjects);
        //
        this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        //

    },
    customSortHexOffsetIso:function(a,b){
        //console.log(a,b);
        
        if(b.IsPlayer||a.IsPlayer)
        {
        //    console.log(a.posx, a.posy, b.posx, b.posy,a.y,b.y);
        }
        if(a.posy==b.posy)
        {
            if(a.posx<b.posx)
            {
                return 1;
            }
            else if(a.posx>b.posx)
            {
                return -1;
            }
            else
            {
                if(a.y<b.y)
                {
                    return -1;
                }
                if(a.y>b.y)
                {
                    return 1;
                }
            }
        }
        else if(a.posy<b.posy)
        {
            return -1;
        }
        else if(a.posy>b.posy)
        {
            return 1;
        }
        return 0;
        //-1 if a > b, 1 if a < b or 0 if a === b
        //test tile
        //if same tile test y
        //test level?
    },
    addLocationTextToTile:function(x,y,width,height,i,j){
        var hexagonText = this.add.text(x+width/2-5,y+height/2+3,i+","+j);
        //var hexagonText = this.add.text(x+5,y+3,i+","+j);
        hexagonText.font = "arial";
        hexagonText.fontSize = 8;
        //hexagonText.font = 0xffffff;
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
        this.interactiveObjects = [];
        
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
        //
        if(!this.game.global.pause)
        {
            this.playerCharacter.step(elapsedTime);
        }
        this.objectGroup.customSort (this.customSortHexOffsetIso);
        //
        if(this.updatewalkable)
        {
            this.pathfinder.setGrid(this.walkableArray, [1]);
            this.updatewalkable = false;
            if(this.game.global.showmovetile)
                this.refreshWalkablView();
        }
        this.barkHandler.step(elapsedTime);
        //this.spritegrid.PosToMap(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        this.masker.updateMasks(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        //this.masker.updateMasks(this.playerCharacter.x, this.playerCharacter.y, this.playerCharacter.posx, this.playerCharacter.posy);
        //fps.text = this.game.time.fps;
    },
    //
    showDialog:function(convid){
        //console.log("showDialog",convid);
        this.diagpanel.startDialog(convid);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },
    //this needs to be controlled by a queue?
    //if 2 are show at once, they are displayed 1 after the other
    showJustText:function(textDisplay)
    {
        //console.log("showJustText");
        this.justTextPopup.showText(textDisplay);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },
    showBark:function(object,text)
    {
        this.barkHandler.barkOverObject(object,text);
    },
    /*showJustTextDialog:function(convid)
    {
        //console.log("showJustTextDialog");
        this.justTextPopup.showTextFromHandler(convid);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },*/
    showRollover:function(object)
    {
        if(!this.rollovertext)
            return;
        this.rollovertext.text = object.jsondata.displayName;
        this.rollovertext.anchor.x = 0.5;
        this.rollovertext.x = object.x + this.mapGroup.x;
        this.rollovertext.y = object.y + this.mapGroup.y - object.height/2;
        this.rollovertext.visible = true;
        
        //if display is off the screen
        if(this.rollovertext.y<0){
            this.rollovertext.y = object.y + this.mapGroup.y;// + object.height;// + object.height;
        }
        this.rollovertext.tint = 0x9999ff;
    },
    moveToAction:function(object,tile,actions)
    {
        this.playerCharacter.moveToObject(object,tile,actions);
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
            
            GlobalEvents.reEnableEvents();
        }
    },
    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },
    //
    onMove:function(pointer, x, y)
    {
        if(this.dragScreen)
        {
            var diffx = this.dragPoint.x-x;
            var diffy = this.dragPoint.y-y;
            
            this.dragPoint.x = x;
            this.dragPoint.y = y;

            if(diffx!=0||diffy!=0)
                this.didDrag = true;
            this.mapGroup.x -= diffx;
            this.mapGroup.y -= diffy;
            
            //console.log(diffx,diffy);
            //move around
            return;
        }
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
        
        //this.highlightHex.doShowPath(this.pathfinder,this.playerCharacter.currentTile,moveIndex);
        //this.hexHandler.dolines(playertile,moveIndex,true,this.highlightHex);
        //var fridges = this.hexHandler.doFloodFill(moveIndex,6);
        //this.highlightHex.drawFringes(fridges);
        
        this.highlightHex.highlighttilebytile(0,moveIndex);
        //this.highlightHex.highilightneighbors(moveIndex);
    },
    doDragScreen:function(pointer)
    {
        this.dragScreen = true;
        this.dragPoint.x = pointer.x;
        this.dragPoint.y = pointer.y;
    },
    clickedHex:function(pointer)
    {
        this.dragScreen = false;
        if(this.didDrag)        //test distance did it actually drag. or do I make a drag screen button?
        {
            this.didDrag = false;
            return;
        }
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
                this.playerCharacter.moveto(moveIndex);
            }
        }
    },   
    getTile: function(name, tilesetid){
       // console.log(tilesetid,name);
        return {tile:this.mapData.tileSets[tilesetid][name], spritesheet:this.mapData.tileSets[tilesetid].tileset};
    },
    refreshWalkablView:function(){
        
        for(var i = 0; i < this.movementgrid.gridSizeX; i ++)
        { 
            for(var j = 0; j < this.movementgrid.gridSizeY; j ++)
            {
                var tile = highlightArray[i][j];
                if(this.walkableArray[i][j]==0)
                    tile.tint = 0xff00ff;
                else
                    tile.tint = 0xffffff;
            }
        }
    }
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};