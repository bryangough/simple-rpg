DiaglogState = function (statemachine, game, gameref, dialogHandler, uigroup) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.dialogHandler = dialogHandler;
    this.uiGroup = uigroup;
    //this.inputHandler = new BatttleInputHandler(this.game, this.gameref);
    //
    this.diagpanel = new DialogPanel(this.game, this.gameref, dialogHandler, null, this);
    this.game.add.existing(this.diagpanel);
    this.uiGroup.add(this.diagpanel);
    this.diagpanel.setup();
    //
}

DiaglogState.prototype = Object.create(EmptyState.prototype);
DiaglogState.constructor = DiaglogState;

DiaglogState.prototype.init = function(map) 
{
}

DiaglogState.prototype.update = function(elapsedTime) 
{
}
DiaglogState.prototype.render = function() 
{
}
DiaglogState.prototype.onEnter = function(params) 
{

}
DiaglogState.prototype.onExit = function() 
{
}
DiaglogState.prototype.startDialog = function(dialogid)
{
    console.log(this,this.diagpanel);
    this.diagpanel.startDialog(dialogid);
}
DiaglogState.prototype.exitDialog = function()
{
    GlobalEvents.reEnableEvents();
    this.gameref.gGameMode.change("normal");
}


