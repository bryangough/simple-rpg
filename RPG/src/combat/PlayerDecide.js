var PlayerDecide = function (game, gameref, combater, speed)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;

    this.isReady = true;
    //
}
PlayerDecide.prototype.Update = function(elapse)
{
}
PlayerDecide.prototype.execute = function()
{
    console.log("Player decide execute.");
    //activate player can control
}