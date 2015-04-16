//
//***** BarkTextHandler ********
BarkTextHandler = function(game,maingame){
    this.pool = new BasicObjectPool();
    this.game = game;
    this.maingame=maingame;
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.barkOverActor = function(over,json){
}
BarkTextHandler.prototype.returnBarkToPool = function(over){
}
//map change
BarkTextHandler.prototype.cleanupAllBarks = function(){
}

//***** BarkText ********
//
BarkText = function(){
    this.textfield;//
    this.timer;//
    this.over;
    this.inUse = false;
}
BarkText.prototype.step = function(elapseTime){
}
BarkText.prototype.reset = function(elapseTime){
}