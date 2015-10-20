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
    //this.inputHandler = null;
    this.textUIHandler = null;
    this.dialoghandler;
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        
    },
    create: function () {
        this.game.time.advancedTiming = true;
        this.stage.backgroundColor = "#444444"
        
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
       
        this.uiGroup = this.add.group();
        this.textUIHandler = new TextUIHandler(this.game, 0, 0, this, null);
        //
        this.gameData = this.game.cache.getJSON('gameData');
        this.gameDataPlayer = this.game.cache.getJSON('playergamedata');
        //this.playerData = this.game.cache.getJSON('player');
        //
        this.mapData = this.game.cache.getJSON('map');
        //
        
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        //
        //restrictions on states. Can't enter talk state while in combat.
        //
        this.dialoghandler = new DialogHandler(this.game, this, this.mapData.data.Conversations, this.mapData.data.Actors);
        
        this.textUIHandler.setup(this.mapData, this.uiGroup, this.dialoghandler);
        //
        if(this.map==null)
            this.map = new Map(this.game, this);
        this.map.initialMap(this.mapData, this.gameData, this.game.cache.getJSON('player'), this.gameDataPlayer);
        //
        this.gGameMode = new StateMachine();
        this.gGameMode.add("normal", new NormalState(this.gGameMode, this.game, this));
        this.gGameMode.add("combat", new BattleState(this.gGameMode, this.game, this));
        this.gGameMode.add("dialog", new DiaglogState(this.gGameMode, this.game, this, this.dialoghandler, this.uiGroup));
        this.gGameMode.add("playerDead", new DeathState(this.gGameMode, this.game, this));
        
        /**/
        var inCombat = this.map.getCombatCharacters();
        inCombat.unshift(this.map.playerCharacter);
        
        //this.gGameMode.change("combat", {entities:inCombat});
        this.gGameMode.change("normal");

        //
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        //
        this.inventory = new InventoryGraphics(this.game,this.gameref,this.globalHandler);
        this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        //this.inventory.x = 0;
        this.inventory.y = 490;
        this.inventory.visible = false;

        this.normalUI = new NormalUI(this.game, this, this.globalHandler, this.uiGroup);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        

        
        this.updatewalkable = true;
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
    getGameData:function(type,name,forcePlayer){
        //console.log(type,name);
        //console.log(this.gameData[type][name],type,name);
        
        if(this.gameData[type])// && !forcePlayer)
        {
            if(this.gameData[type][name])
            {
                return this.gameData[type][name];
            }
        }
        if(this.gameDataPlayer[type])// && forcePlayer)
        {
            if(this.gameDataPlayer[type][name])
            {
                return this.gameDataPlayer[type][name];
            }
        }
        return null;
    },
    zoomIn:function(button, pointer){
        //console.log(button,pointer);
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
    toggleCombat:function()
    {   
        if(this.gGameMode.currentState == "combat" && this.gGameMode.mCurrentState.leaveThisState())
        {
            //test if enemies still in aggo list?
            this.gGameMode.change("normal");
        }
        else if(this.gGameMode.currentState == "normal")
        {
            var inCombat = this.map.getCombatCharacters();
            inCombat.push(this.map.playerCharacter);
            this.gGameMode.change("combat", {entities:inCombat});
        }
        else
        {
            //console.log("toggleCombat no");
            //error beep
        }
    },
    showDialog:function(convid){
        if(this.gGameMode.currentState != "combat")//for now don't let dialog work in combat
        {
            this.gGameMode.change("dialog");
            this.gGameMode.mCurrentState.startDialog(convid);
            //this should be needed
            GlobalEvents.tempDisableEvents();
        }
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
    render: function()
    {
        //this.game.debug.text(this.game.time.fps || '--', 2, 40, "#00ff00");   
        //this.game.debug.text(this.gGameMode.currentState, 2, 10, "#00ff00");
        //this.game.debug.text("currentAction "+GlobalEvents.currentAction, 2, 25, "#00ff00");
        //this.game.debug.text("currentAction "+GlobalEvents.currentAction, 2, 50, "#00ff00");
        //this.game.debug.text(this.game.time.fps || '--', 2, 40, "#00ff00");  
        //game.debug.text("Tween running: " + !this.idleBallTween.pendingDelete, 2, 110);
        
        //this.game.debug.inputInfo(16, 16);
    },
    shutdown: function () {
        //console.log("flush");
        this.map.flushEntireMap();
        
    },
    callFunction: function(fnstring,fnparams) 
    {
        var fn = this[fnstring];
        fnparams = fnparams.split(',');
        if (typeof fn === "function") {
            //console.log(fn,this);
            fn.apply(this, fnparams);
        }
    }
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};