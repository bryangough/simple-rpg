BasicGame.Game = function (game) {

    
    this.neighborLights = [];

    this.pathfinder;//a* searcher
    
    this.graphics;//drawable
    
    this.uiGroup;

    this.mapData;
    this.globalHandler;
    this.inventory;
    
    this.updatewalkable = false;
    
    this.fps;
    
    this.gGameMode = null;
    
    this.map = null;
    this.inputHandler = null;
    this.textUIHandler = null;
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        this.load.json('map', 'assets/maps/forestmap.json');
    },
    create: function () {
        this.game.time.advancedTiming = true;
        this.stage.backgroundColor = "#444444"
        
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
       
        this.uiGroup = this.add.group();
        this.textUIHandler = new TextUIHandler(this.game, 0, 0, this, null);
        //
        this.mapData = this.game.cache.getJSON('map');
        //
        
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        //
        this.gGameMode = new StateMachine();
        this.gGameMode.add("battle", new BattleState(this.gGameMode));
        //
        if(this.map==null)
            this.map = new Map(this.game, this);
        this.map.initialMap(this.mapData);
        //
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        //
        this.textUIHandler.setup(this.mapData, this.uiGroup);
        
        this.inventory = new InventoryGraphics(this.game,this,this.globalHandler);
	    this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        this.inventory.x = 220;
        this.inventory.y = 400;
        this.inventory.visible = false;

        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.x = 20;
        this.activeButtons.y = 490;
        this.game.add.existing(this.activeButtons);
        this.uiGroup.add(this.activeButtons);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        
        this.combatButton = this.game.add.button(this.game.world.width - 58, this.game.world.centerY + 60, 'ui', this.zoomIn, this, "Close Button0001.png", "Close Button0001.png", "Close Button0001.png", "Close Button0001.png");
        
        
        this.combatButton = this.game.add.button(this.game.world.width - 58, this.game.world.centerY - 60, 'ui', this.zoomOut, this, "button_darkblue_over.png", "button_darkblue_up.png", "button_darkblue_up.png", "button_darkblue_over.png");
        
        //
        this.combatButton = this.game.add.button(this.game.world.width - 190, this.game.world.height - 51, 'ui', this.toggleCombat, this, "button_blue_over.png", "button_blue_up.png", "button_blue_up.png", "button_blue_over.png");
        
        this.inputHandler = new InputHandler(this.game, this, this.map);
    },
    //
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        //
        this.map.update(elapsedTime);
        //
        if(this.updatewalkable)
        {
            this.pathfinder.setGrid(this.map.walkableArray, [1]);
            this.updatewalkable = false;
            if(this.game.global.showmovetile)
                this.map.refreshWalkablView();
        }
        this.gGameMode.update(elapsedTime);
        this.gGameMode.render();
        
        this.textUIHandler.update(elapsedTime);
        //this.spritegrid.PosToMap(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        this.map.masker.updateMasks(this.input.worldX-this.map.mapGroup.x,this.input.worldY-this.map.mapGroup.y);
        //this.masker.updateMasks(this.playerCharacter.x, this.playerCharacter.y, this.playerCharacter.posx, this.playerCharacter.posy);
        //fps.text = this.game.time.fps;
    },
    zoomIn:function(button, pointer){
        console.log(button,pointer);
        pointer.active = false;
        this.map.scaledto -= 0.05;
        if(this.map.scaledto<0)
            this.map.scaledto = 0.01;
        this.map.doZoom();
    },
    zoomOut:function(button, pointer){
        pointer.active = false;
        this.map.scaledto += 0.05;
        this.map.doZoom();
    },
    toggleCombat:function(){
    },
    tryToEndCombat:function(){
        //if in combat state
        //ask combat state to end combat
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
    }
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};