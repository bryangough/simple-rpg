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
    
    
    
            //this.combatButton = this.game.add.button(this.game.world.width - 58, this.game.world.centerY + 60, 'ui', this.zoomIn, this, "Close Button0001.png", "Close Button0001.png", "Close Button0001.png", "Close Button0001.png");
        
        
        //this.combatButton = this.game.add.button(this.game.world.width - 58, this.game.world.centerY - 60, 'ui', this.zoomOut, this, "button_darkblue_over.png", "button_darkblue_up.png", "button_darkblue_up.png", "button_darkblue_over.png");
        
        //
    this.combatButton = this.game.add.button(this.game.world.width - 190, this.game.world.height - 51, 'ui', this.gameref.toggleCombat, this.gameref, "button_blue_over.png", "button_blue_up.png", "button_blue_up.png", "button_blue_over.png");
}
NormalUI.prototype.hide = function() 
{
    this.activeButtons.visible = false;
    this.combatButton.visible = false;
}
NormalUI.prototype.show = function() 
{
    this.activeButtons.visible = true;
    this.combatButton.visible = true;
}
