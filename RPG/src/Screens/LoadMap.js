//load full map for session?
//or maybe put this in pre-load

BasicGame.LoadMap = function (game) {

};
BasicGame.LoadMap.prototype = {
    preload: function () {
        this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
        this.preloadBar = this.add.sprite(0, 273, 'loadingScreen', 'loading_barfront.png');
        //
        //load set data. This will eventually be from the server
        //should test if this is already done
        
        var levels = this.game.cache.getJSON('levels').Levels;
        
        //console.log(this.game.global,this.game.global.loadMap,this.levels)
        var level = levels[this.game.global.loadMap];
        if(level!=null)
        {
            console.log("Load map: ", level.gameData, level.map)
            this.load.json('gameData', this.game.global.assetsLocation +"maps/" + level.gameData+".json");
            this.load.json('map', this.game.global.assetsLocation +"maps/" + level.map+".json");
        }
        else
        {
            //show error message
            //
            console.error("Map Not exists.")
        }
        
	},
    updateProgress:function(progress, filekey, success, totalloadedfiles, totalfiles){
        var val = progress /100;
        this.preloadBar.width = this.barwidth * val;
        //console.log(val);
    },
	create: function () {
        this.secondLoader = new Phaser.Loader(this);
        
        var tilesets = this.game.cache.getJSON('map').tileSets;
        var spritesheetstoload = [];
        for (var key in tilesets) {
            var obj = tilesets[key];
            console.log('assets/'+obj.tileset+'.png', 'assets/'+obj.tileset+'.json');
            this.secondLoader.atlasJSONHash(obj.tileset, this.game.global.assetsLocation + 'assets/'+obj.tileset+'.png', this.game.global.assetsLocation + 'assets/'+obj.tileset+'.json');
        }
        //gamedata.Items loop for InvetoryGraphicSheet 
        //or have ability to just set which other graphics to load
        
        this.secondLoader.atlasJSONHash('standardimages', this.game.global.assetsLocation + 'assets/standardimages.png', this.game.global.assetsLocation + 'assets/standardimages.json');
        //test if interface is different?
        this.secondLoader.atlasJSONHash('gameplayinterface', this.game.global.assetsLocation + 'assets/paradoxinterface.png', this.game.global.assetsLocation + 'assets/paradoxinterface.json');

        this.barwidth = this.preloadBar.width;
        this.preloadBar.width = 0;
        
        this.secondLoader.onFileComplete.add(this.updateProgress,this);
        this.secondLoader.onLoadComplete.add(this.loadComplete, this);        
        this.secondLoader.start();
	},
    testSpriteSheet:function(){
        
    },
    loadComplete:function(){
        this.secondLoader.reset(false,true);
        this.secondLoader = null;
        this.state.start('Game',true,false);
    },
	update: function () {
	},
};
