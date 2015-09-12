var NormalUI = function(game,maingame,globalhandler,uiGroup)
{
    this.game = game;
    this.gameref = maingame;
    this.globalHandler = globalhandler;
    this.uiGroup = uiGroup;
    

    this.activeButtons = new ActionButtons(this.game, this.gameref);
    this.activeButtons.x = 20;
    this.activeButtons.y = 490;
    this.game.add.existing(this.activeButtons);
    this.uiGroup.add(this.activeButtons);
}