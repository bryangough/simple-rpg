//
//***** BarkTextHandler ********
BarkTextHandler = function(game,maingame){
    Phaser.Group.call(this, game);
    this.pool = new BasicObjectPool(this);
    this.game = game;
    this.maingame=maingame;
}
BarkTextHandler.prototype = Object.create(Phaser.Group.prototype);
BarkTextHandler.constructor = BarkTextHandler;

BarkTextHandler.prototype.barkOverTile = function(tile,text){
}
BarkTextHandler.prototype.createItem = function(){
    var bark = new BarkText(this.game, this);
    this.add(bark);
    return bark;
}
BarkTextHandler.prototype.barkOverObject = function(object,text){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        if(allbarks[i].over==object && allbarks[i].over!=null)
            allbarks[i].killSelf();
    }
    
    var bark = this.pool.getObject();
    bark.getReady(object,text);
    
    bark.x = object.x;
    bark.y = object.y;
    bark.over = object;
    bark.visible = true;
   /* if(bark.y<0){//if display is off the screen
        bark.y = object.y + object.height;
    }*/
    
}
BarkTextHandler.prototype.returnBarkToPool = function(bark){
    this.pool.returnObject(bark);
}
//map change
BarkTextHandler.prototype.cleanupAllBarks = function(){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        allbarks[i].killSelf();
    }
}
BarkTextHandler.prototype.step = function(elapseTime){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        if(allbarks[i].inUse)
            allbarks[i].step(elapseTime);
    }
}
//***** BarkText ********
//
BarkText = function(game, handler){
    Phaser.BitmapText.call(this, game, 0, 0, "simplefont", "Text goes here.", 25);
    this.time;//
    this.over;//object over
    this.inUse = false;
    this.handler = handler;
    this.anchor.x = 0.5;
}
BarkText.prototype = Object.create(Phaser.BitmapText.prototype);
BarkText.constructor = BarkText;

BarkText.prototype.step = function(elapseTime){
    this.time -= elapseTime;
    if(this.time<=0)
        this.killSelf();
    //follow
}
BarkText.prototype.killSelf = function(){
    this.handler.returnBarkToPool(this);
}
BarkText.prototype.getReady = function(over,text){
    this.text = text; //(center?)
    this.time = 3000;
    this.over = over;
    this.inUse = true;
    this.visible = true;
}
BarkText.prototype.reset = function(){
    this.time = -1;
    this.over = null;
    this.inUse = false;
    this.visible = false;
}