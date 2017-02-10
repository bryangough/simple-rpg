var NormalUI = function(game,maingame,globalhandler,uiGroup)
{
    this.game = game;
    this.gameref = maingame;
    this.globalHandler = globalhandler;
    this.uiGroup = uiGroup;
    

    this.activeButtons = new ActionButtons(this.game, this.gameref);
    this.activeButtons.x = 20;
    this.activeButtons.y = this.game.world.height-70;//540;
    this.game.add.existing(this.activeButtons);
    this.uiGroup.add(this.activeButtons);
}
NormalUI.prototype.hide = function() 
{
    this.activeButtons.visible = false;
}
NormalUI.prototype.show = function() 
{
    this.activeButtons.visible = true;
}
