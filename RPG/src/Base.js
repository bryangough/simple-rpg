var BasicGame = {
};
gameInit = {
    //
    init: function(lang, container)
    {
        if(container==undefined)
            container = "gameContainer";
        var game = new Phaser.Game(900, 600, Phaser.AUTO, container);

        game.state.add('Boot', BasicGame.Boot);
        game.state.add('Preloader', BasicGame.Preloader);
        game.state.add('MainMenu', BasicGame.MainMenu);
        game.state.add('Game', BasicGame.Game);
        game.state.add('Instructions', BasicGame.Instructions);
        game.state.add('MapSelect', BasicGame.MapSelect);
        game.state.add('LoadMap', BasicGame.LoadMap);

        game.state.start('Boot');
        

        game.global = {
            mute: false,
            pause: false,
            //movetotouch:true,
            showmovetile:false,
            loadMap:1,
            language: "en"
        };
        if(lang!=undefined && lang!="en")
        {
            game.global.language = lang;
        }
    }
};