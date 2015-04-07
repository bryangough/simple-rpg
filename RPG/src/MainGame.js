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
};

//
// ----

BasicGame.Game.prototype = {
    preload: function(){
        this.load.text('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?
    },
    create: function () {
        this.stage.backgroundColor = "#666666"
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        
        this.interactiveObjects = [];
        this.uiGroup = this.add.group();
        //
        this.mapData = JSON.parse(this.game.cache.getText('map'));
        //
        this.hexHandler = new HexHandler(this,this.game);
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        //
        this.startpos = this.mapData.startPos.split("_");
        var currentmap = this.mapData.maps[this.startpos[0]];
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

        //this.input.addMoveCallback(this.drawLine, this); 
        //this.input.onDown.add(this.drawLine, this); 
        //MOVE
        this.input.onDown.add(this.clickedHex, this);
        
        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.y = 350;
        this.game.add.existing(this.activeButtons);
        this.uiGroup.add(this.activeButtons);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        
        
        this.showJustTextDialog(3);
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
                objectName = tiles[i*this.gridSizeX+j];
                tilereference = this.getTile(objectName,tilesetid);
                var hexagonX = hexagonWidth*j;
                if(this.gridSizeY%2)
                    hexagonX += hexagonWidth/2*(i%2);
                else
                    hexagonX -= hexagonWidth/2*(i%2);
                var hexagonY = (hexagonHeight/4*3)*i;
                
                if(tilereference.tile=="tileWater")
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
                walkableArray[i][j] = layer1.walkable[i*this.gridSizeX+j];
                if(walkableArray[i][j] == 0)
                {
                    hexagonArray[i][j].walkable = false;
                }
                //
                //var hexagonText = this.add.text(hexagonX+hexagonWidth/3+5,hexagonY+15,i+","+j);
                //hexagonText.font = "arial";
                //hexagonText.fontSize = 12;
                //this.hexagonGroup.add(hexagonText);
			}
		}
        //console.log(walkableArray);
        this.pathfinder.setGrid(walkableArray, [1]);
        this.hexHandler.hexagonArray = hexagonArray;
        this.hexHandler.waterTilesArray = waterTilesArray;
        //return;
        //handle objects
        var objects = layer1.objects;
        var spotx,spoty;
        for(var i = 0; i < objects.length; i ++)
        {
            if(objects[i].triggers)//if have actions then is an interactive object
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
                hexagonArray[spoty][spotx].addChild(tileobject);
                tileobject.anchor.x = 0.5;
                tileobject.anchor.y = 1.0;
            }
        }
        //should be handled by action system when it works
        /*var connected = layer1.connected;
        for(var i = 0; i < connected.length; i ++)
        {
            var selectedtile = hexagonArray[this.gridSizeY-connected[i].fy-1][connected[i].fx];
            selectedtile.actionEnter = this.userSteppedOnExit;
            selectedtile.actionEnterData = connected[i];
            var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
            selectedtile.addChild(doorImage);
        }*/
        //?
        var actionSpots = layer1.actionSpots;
        for(var i = 0; i < actionSpots.length; i ++)
        {
            var selectedtile = hexagonArray[this.gridSizeY-actionSpots[i].y-1][actionSpots[i].x];
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
        this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        
        
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new MovingCharacter(this,this.game, "player");
            this.game.add.existing(this.playerCharacter);
            this.playerCharacter.setLocationByTile(hexagonArray[this.gridSizeY-this.startpos[2]-1][this.startpos[1]]);
        }
        this.hexagonGroup.add(this.playerCharacter);
        //this.characterGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        //this.characterGroup.x = this.hexagonGroup.x;
        //this.characterGroup.y = this.hexagonGroup.y;
        //
    },
    setChangeMapTile:function(selectedtile){
        var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
        selectedtile.addChild(doorImage);
    },
    userExit:function(data) {
        //console.log("should be main game: ",this);
        this.startpos[0] = data.tmap;
        this.startpos[1] = data.tx;
        this.startpos[2] = data.ty;
        //
        this.flushEntireMap();
        //
        var currentmap = this.mapData.maps[this.startpos[0]];
        //console.log(this.startpos[0]);
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
    clickedHex:function()
    {
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);
        if(moveIndex!=null)
        {
            //var fridges = this.hexHandler.doFloodFill(moveIndex,3);
            //this.drawFridges(fridges);
            //
            if(this.game.currentacion==this.game.WALK)
            {
                if(moveIndex.walkable)
                {
                    var playertile = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
                    if(playertile)
                    {
                        this.pathfinder.setCallbackFunction(this.playercallback, this);
                        this.pathfinder.preparePathCalculation( [playertile.posx,playertile.posy], [moveIndex.posx,moveIndex.posy] );
                        this.pathfinder.calculatePath();
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
    playercallback:function(path){
        path = path || [];
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

