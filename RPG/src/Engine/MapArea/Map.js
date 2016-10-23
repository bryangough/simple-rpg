var Map = function (game, gameRef) 
{
    this.gameRef = gameRef;
    this.game = game;
    
    this.playerCharacter;
    this.playerCharacters = [];
    
    this.highlightHex;
    this.hexHandler;
    this.startpos;

    
    this.interactiveObjects = [];
    this.staticObjects = [];
    this.paths = [];
    this.maskableobjects;
    this.spritegrid;
    this.movementgrid;
    this.objectoffset = new Point(0,0);
    this.highlightArray;
    
    this.mapGroup;
    this.scaledto = 0.8;
    
    this.redoMap = false;
}
Map.prototype.initialMap = function(mapData, gameData, playerData){
    
    this.mapData = mapData;
    this.gameData = gameData;
    this.playerData = playerData;
    //console.log(mapData, gameData, playerData);
    this.startpos = this.mapData.startPos;//.split("_");
    var currentmap = this.mapData.maps[this.startpos.map];
    //
    this.objectGroup = this.gameRef.add.group();
    this.highlightGroup = this.gameRef.add.group();
    this.hexagonGroup = this.gameRef.add.group();
    //
    this.mapGroup = this.gameRef.add.group();
    this.mapGroup.add(this.hexagonGroup);
    this.mapGroup.add(this.highlightGroup);
    this.mapGroup.add(this.objectGroup);
    //
    this.clonedCurrent = JSON.parse(JSON.stringify(currentmap));
    this.createMapTiles(currentmap);
}
Map.prototype.createMapTiles = function(passedMap){
    var hexagonArray = [];
    var waterTilesArray = [];
    //
    this.interactiveObjects = [];
    this.staticObjects = [];
    //

    //
    
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
            console.log("height width ",hexagonWidth, hexagonHeight);
            //this.objectoffset.x = 0;//hexagonWidth + hexagonWidth/2;
            //this.objectoffset.y = 0;//hexagonHeight*2 + hexagonHeight/2;
            //console.log(this.objectoffset);
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
                this.hexHandler = new IsoHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }                                
            else if(layer1.tiletype=="HexIso")
            {
                this.hexHandler = new DiamondHexHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }
            else
            {
                this.hexHandler = new HexHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }
            //Iso
            //
            //this.hexHandler = new DiamondHexHandler(this.gameRef,this.game, layer1.hexWidth,layer1.hexHeight);
        }

        var hexagonWidth = layer1.hexWidth;
        var hexagonHeight = layer1.hexHeight;

        this.gridSizeY = layer1.height;
        this.gridSizeX = layer1.width;
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
            for(var i = 0; i < this.gridSizeX; i ++)
            {

                if(layer1.handleMovement)
                    hexagonArray[i] = [];
                for(var j = 0; j < this.gridSizeY; j ++)
                {
                    objectName = tiles[j*this.gridSizeX+i];
                    //console.log(i,j);
                    //if(tilesetid==-1)
                    //    continue;
                    //if(
                    tilereference = this.getTile(objectName,tilesetid);
                    
                    tempPoint = this.spritegrid.GetMapCoords(i,j);
                    //this.x = tile.x;//+this.map.hexHandler.halfHex;
                    //this.y = tile.y;//-this.map.hexHandler.bottomOffset-this.map.hexHandler.halfHexHeight;
                    //console.log(this.objectoffset)
                    //tempPoint.x += -this.hexHandler.halfHex;
                    //tempPoint.y += +this.hexHandler.bottomOffset + this.hexHandler.halfHexHeight;
                    
                    //tempPoint.x += this.objectoffset.x;
                    //tempPoint.y += this.objectoffset.y;
                    if(layer1.handleMovement)//make tile
                    {
                        //var ret = this.spritegrid.projectGrid(tempPoint.x/(hexagonWidth/2), tempPoint.y/hexagonHeight);
                        var ret = this.spritegrid.projectGrid(i,j);
                        //console.log("*projectGrid*",ret);
                        //console.log("**projectIso**",this.spritegrid.projectIso(ret.x,0,ret.z),i,j);
                        
                        
                        temptile = new WalkableTile(this.game, tilereference.tile, tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this.gameRef);

                        hexagonArray[i][j]=temptile;//only if same
                    }
                    else
                    {
                        temptile = new GraphicTile(this.game, tilereference.tile, tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this.gameRef);
                    }
                    this.hexagonGroup.add(temptile);
                    //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                }
            }
        }
        //
        this.highlightArray = [];
        if(layer1.handleMovement)
        { 
            for(var i = 0; i < this.gridSizeX; i ++)
            {
                if(!layer1.handleSprite)
                {
                    hexagonArray[i] = [];
                    this.highlightArray[i] = [];
                }
                this.walkableArray[i] = [];
                for(var j = 0; j < this.gridSizeY; j ++)
                {
                    this.walkableArray[i][j] = new Walkable(layer1.walkable[j*this.gridSizeX+i]);
                    //this.walkableArray[i][j] = 1;
                    if(!layer1.handleSprite)//no sprite - need to something to select (this might not need to be destroyed)
                    {
                        tempPoint = this.movementgrid.GetMapCoords(i,j);
                        hexagonArray[i][j] = new SimpleTile(this.gameRef,i,j,tempPoint.x,tempPoint.y);

                        //this needs to be switched out
                        /*if(this.game.global.showmovetile)
                        {
                            //var tile = new GraphicTile(this, "tile_highlight0002", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            var tile = null;
                            if(tiletype=="HexIso")
                                tile = new GraphicTile(this.game, "tile_highlight0001", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            else
                                tile = new GraphicTile(this.game, "halfiso_highlight", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            if(this.walkableArray[i][j]==0)
                                tile.tint = 0xff0000;

                            this.highlightArray[i][j] = tile;
                            this.highlightGroup.add(tile);
                            //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                        }*/
                        //
                    }
                    //if(this.walkableArray[i][j] == 0)
                    //{                    
                        //hexagonArray[i][j].walkable = false;
                    hexagonArray[i][j].walkHandler = this.walkableArray[i][j];
                    //}
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
                        var isCombatSpecial = false;
                        for(var j=0;j<objects[i].triggers.length;j++)
                        {
                            //console.log(objects[i].triggers[j].type);
                            //if(objects[i].triggers[j].type==null)
                            //    console.log(this,"");
                            
                            if(objects[i].triggers[j].type=="combatAttributes" || objects[i].triggers[j].type=="CharacterSpawn")
                            {
                                isCombatSpecial = true;
                                break;
                            }
                            if(objects[i].triggers[j].type=="mover")
                            {
                                isMoveSpecial = true;
                                break;
                            }
                        }
                        var interactiveobject;
                        
                        if(isCombatSpecial)
                        {
                            interactiveobject = new MonsterCharacter(this.gameRef, objects[i], this);
                            //interactiveobject = new CombatCharacter(this.gameRef, objects[i], this);
                        }
                        else if(isMoveSpecial)
                        {
                            interactiveobject = new MovingCharacter(this.gameRef, objects[i], this);
                        }
                        else
                        {
                            interactiveobject = new InteractiveObject(this.gameRef, objects[i], this);
                        }
                        this.interactiveObjects.push(interactiveobject);

                        interactiveobject.posx = objects[i].posx;
                        interactiveobject.posy = objects[i].posy;
                    }
                }
                else//this might not be complete true? //without any triggers the object is just a picture
                {
                    var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                    if(objectreference!=null)
                    {
                        //var newtile = this.hexHandler.getTileByCords(objects[i].posx,objects[i].posy);
                        tempPoint = this.spritegrid.GetMapCoords(objects[i].posx,objects[i].posy);
                        //console.log(tempPoint, this.objectoffset, layer1.hexWidth, layer1.hexHeight);
                        //tempPoint.x -= this.hexHandler.halfHex;
                        //tempPoint.y += this.hexHandler.halfHexHeight;

                        //spotx = objects[i].x;
                        //spoty = objects[i].y * -1;
                        //tempPoint.y -= objects[i].y * 90;
                        var tileobject = new SimpleObject(this.game,
                                                                tempPoint.x+this.objectoffset.x,
                                                                tempPoint.y+this.objectoffset.y,
                                                                objectreference.spritesheet, objectreference.tile+"", objects[i]);
                        tileobject.posx = objects[i].posx;
                        tileobject.posy = objects[i].posy;
                        this.objectGroup.add(tileobject);
                        this.staticObjects.push(tileobject);
                        //
                        if(objects[i].maskable){//maskable objects to check when player/mouse move
                            this.maskableobjects.push(tileobject);
                        }
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
                        selectedtile.eventDispatcher = new EventDispatcher(this.game,this.gameRef,selectedtile);
                    }
                    selectedtile.eventDispatcher.receiveData(actionSpots[i].triggers);
                }
            }
        }
        if(layer1.paths)//how to deal with collisions of path names?
        {
            var paths = layer1.paths;
            var spotx,spoty;
            for(var i = 0; i < paths.length; i ++)
            {
                var path = new Path(this.game, this.gameRef, paths[i]);
                this.paths[path.name] = path;
            }
        }
    }
    //
    this.hexHandler.hexagonArray = hexagonArray;
    //this.hexHandler.waterTilesArray = waterTilesArray;
    //these should be screen width and height
    //this.mapGroup.y = (440-hexagonHeight*Math.ceil(this.gridSizeY/2))/2;

    //if(this.gridSizeY%2==0){
    //    this.mapGroup.y-=hexagonHeight/4;
    //}
    //this.mapGroup.x = 0;//(900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
    //this.mapGroup.x = (900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
    //if(this.gridSizeX%2==0){
    //    this.mapGroup.x-=hexagonWidth/8;
    //}
    //
    //console.log(this.mapGroup.x, this.mapGroup.y);
    this.highlightHex = new HighlightHex(this.game, this.gameRef, this.hexHandler);
    //this.game.add.existing(this.highlightHex);
    this.highlightHex.setup();
    this.highlightGroup.add(this.highlightHex);
    //this.highlightGroup.x -= this.objectoffset.x;
    //this.highlightGroup.y -= this.objectoffset.y;
    //
    //console.log(this.game);
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i])
            this.interactiveObjects[i].dosetup();
    }
    for(var i=0;i<this.staticObjects.length;i++)
    {
        if(this.staticObjects[i])
            this.staticObjects[i].dosetup(this.hexHandler);
    }
    
    //create player
    //console.log("play: ",this.playerCharacter);
    if(!this.playerCharacter)
    {
        //console.log("Create Character.");
        for(var x=0;x<3;x++)
        {
            this.playerCharacter = new PlayerCharacter(this.gameRef, this.playerData.Player, this);
            this.playerCharacter.dosetup();   
            this.playerCharacters.push(this.playerCharacter);
        } 
    }    
    for(var x=0;x<this.playerCharacters.length;x++)
    {
        this.playerCharacter = this.playerCharacters[x];
        this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y+x]);
        this.game.add.existing(this.playerCharacter);
        this.objectGroup.add(this.playerCharacter);
        this.playerCharacter.resetMoving();
    }
    //
    //console.log(this.walkableArray);
    //
    this.gameRef.pathfinder.setGrid(this.walkableArray, [1]);
    this.masker = new CheapMasker(this.game, this.gameRef, this.maskableobjects);
    //
    this.doZoom();
    //start centered
     //console.log(this.mapGroup.x,this.mapGroup.y,hexagonWidth,Math.ceil(this.gridSizeX),this.mapGroup.scale.x);
    this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);

    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i].eventDispatcher)
            this.interactiveObjects[i].eventDispatcher.doAction("OnStart", null);
    }
    //this.gameRef.camera.setFollowObject(this.playerCharacter, true);
    //console.log("create new map");
    this.redoMap = false;
};
Map.prototype.doZoom = function()
{
    this.mapGroup.scale.setTo(this.scaledto,this.scaledto);
}
Map.prototype.update = function(elapsedTime)
{
    if(this.redoMap)
    {
        return;
    }
    this.hexHandler.update(elapsedTime);
    //
    if(!this.game.global.pause)
    {
        for(var x=0;x<this.playerCharacters.length;x++)
            this.playerCharacters[x].step(elapsedTime);
    }
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        this.interactiveObjects[i].step(elapsedTime);
    }
    //this.objectGroup.customSort (Utilties.customSortHexOffsetIso);
    this.objectGroup.customSort (Utilties.customSortIso);

}
Map.prototype.getCombatCharacters = function()
{
    var returnArray = [];
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if( (this.interactiveObjects[i].attackable || this.interactiveObjects[i].hostile || this.interactiveObjects[i].IsPlayer) && this.interactiveObjects[i].isAlive() )
        {
            returnArray.push(this.interactiveObjects[i]);
        }
    }
    return returnArray;
}
Map.prototype.addLocationTextToTile = function(x,y,width,height,i,j){
    var hexagonText = this.gameRef.add.text(x+width/2-5,y+height/2+3,i+","+j);
    //var hexagonText = this.gameRef.add.text(x,y,i+","+j);//- this.hexHandler.bottomOffset -this.hexHandler.halfHexHeight
    //var hexagonText = this.add.text(x+5,y+3,i+","+j);
    hexagonText.font = "arial";
    hexagonText.fontSize = 10;
    //hexagonText.font = 0xffffff;
    this.highlightGroup.add(hexagonText);
};

Map.prototype.flushEntireMap = function(){
    //this.playerCharacter.flushAll();
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i])
            this.interactiveObjects[i].flushAll();
    }
    this.interactiveObjects = [];
    //
    for(var x=0;x<this.playerCharacters.length;x++)
        this.objectGroup.remove(this.playerCharacters[x]);
    //
    this.hexagonGroup.removeAll(true);
    this.highlightGroup.removeAll(true);
    this.objectGroup.removeAll(true);
    this.paths = [];
    //this.mapGroup.removeAll(true);

    
    //this.playerCharacter = null;
    this.hexHandler.flush();
}
Map.prototype.getTile = function(name, tilesetid){
    //console.log(tilesetid,name);
    
    if(tilesetid<0 || name == undefined || tilesetid == undefined || name == -1)
        return null;
    return {tile:this.mapData.tileSets[tilesetid][name], spritesheet:this.mapData.tileSets[tilesetid].tileset};
}
Map.prototype.userExit = function(object, data) {
    
    //object
    this.gameRef.gGameMode.change("normal");
    //object is only the tile
    //on do this if player
    //if(this.playerCharacter.currentTile
    this.redoMap = true;
    this.startpos.map = data.tmap;
    this.startpos.x = data.tx;
    this.startpos.y = data.ty;
    //
    GlobalEvents.flushEvents();
    this.flushEntireMap();
    //
    var currentmap = this.mapData.maps[this.startpos.map];
    //    
    //this.clonedCurrent = JSON.parse(JSON.stringify(currentmap));
    //JSON.stringify(currentmap) to save in database
    //
    console.log("build new-- ");
    this.createMapTiles(currentmap);        
}
//for use after death
Map.prototype.tryMapAgain = function() {
    this.redoMap = true;
    this.mapData.maps[this.startpos.map] = this.clonedCurrent;
    GlobalEvents.flushEvents();
    this.flushEntireMap();
    this.createMapTiles(this.clonedCurrent);
}
Map.prototype.refreshWalkablView = function(){
    for(var i = 0; i < this.gridSizeX; i ++)
    { 
        for(var j = 0; j < this.gridSizeY; j ++)
        {
            //console.log(this.hex
            var tile = this.hexHandler.hexagonArray[i][j];
            if(this.walkableArray[i][j].isWalkable==0)
            {
                console.log("not walk");
                tile.tint = 0xff00ff;
            }
            else
                tile.tint = 0x33ff33;
        }
    }
}
Map.prototype.doSight = function(fromTile, distance)
{
    var fringes = this.hexHandler.doFloodFill(fromTile, distance, false, false);
    for(var i=0;i<fringes.length;i++)
    {
        for(var j=0;j<fringes[i].length;j++)
        {
            if(i==fringes.length-1)
                fringes[i][j].adjustVisible(0.3);
            else
                fringes[i][j].adjustVisible(1);
        }
    }
}
Map.prototype.getPath = function(pathName)
{
    return this.paths[pathName];
}