//*********** BulletHandler
/*
- choose shoot
- character shoots
- create bullet
- bullet moves
- do explosion
- do character reactions (at same time?)

simple:
- shoot
- end of shoot
- bullet create
- bullet moves
- target hurt or target dies


- how to handle explosions as well


//handle flame thrower or just simply animation
// sprite instead of image
//play animation (that plays at the same times as character animation)

*/
BulletHandler = function(game, gameref, bulletGroup, spritesheet, defaultImageName){
    Phaser.Group.call(this, game);
    this.pool = new BasicObjectPool(this);
    this.game = game;
    this.gameref = gameref;
    this.bulletGroup = bulletGroup;
    
    this.spritesheet = spritesheet;
    this.defaultImageName = defaultImageName;
}
BulletHandler.prototype = Object.create(Phaser.Group.prototype);
BulletHandler.constructor = BulletHandler;
//
BulletHandler.prototype.createItem = function(){
    var bullet = new Bullet(this.game, this.gameref, -1000, 0, this.spritesheet, this.defaultImageName, this);
    console.log(bullet);
    //this.add(bullet);
    this.bulletGroup.add(bullet);
    return bullet;
}

BulletHandler.prototype.returnBullet = function(bullet){
    this.pool.returnObject(bullet);
}
//map change
BulletHandler.prototype.cleanupAllBullets = function(){
    var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        allbullets[i].killSelf();
    }
}
BulletHandler.prototype.fireBullet = function(imagename, action, start, target, afterAction, weaponParams){
    /*var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].over==object && allbullets[i].over!=null)
            allbullets[i].killSelf();
    }*/
    
    
    if(imagename==null)//|| speed = -1 : instant
    {
        
    }
    else
    {
        var bullet = this.pool.getObject();
        bullet.getReady(imagename, action, start, target, weaponParams);
    }
}
BulletHandler.prototype.step = function(elapseTime){
    var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].inUse)
            allbullets[i].step(elapseTime);
    }
}
//*********** Bullet
var Bullet = function (game, gameref, x, y, spritesheet, imagename, handler) 
{
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.game = game;
    this.gameref = gameref;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    this.target = null;
    /*this.iso = new Vec3(objectPassed.x, objectPassed.y, objectPassed.z);
    this.isoorder = objectPassed.order;
    this.y += this.iso.y * -50;*/
    this.time;//
    this.inUse = false;
    this.handler = handler;
    this.dir = new Phaser.Point();
    this.weaponParams;
    this.iso = null;
    this.speed = 0.1875;
    
    this.tint = 0xff0055;
}
Bullet.prototype = Object.create(Phaser.Image.prototype);
Bullet.constructor = Bullet;
//
Bullet.prototype.step = function(elapseTime)
{
    var nextx = this.x + this.dir.x * this.speed * elapseTime;
    var nexty = this.y + this.dir.y * this.speed * elapseTime;
    if(this.prevx != nextx || this.prevy != nexty)
    {
        
        this.x = nextx;
        this.y = nexty;
        this.findtile();
        
        this.prevx = this.x;
        this.prevy = this.y;
        
        //this.setDirection();
        this.updateIso();
    }
    console.log(this.x,this.y, this.target.x, this.target.y);
}
Bullet.prototype.killSelf = function(){
    this.handler.returnbulletToPool(this);
}
Bullet.prototype.getReady = function(imagename, action, start, target, weaponParams)
{
    this.inUse = true;
    this.visible = true;
    //
    //if(this.frameName!=imagename)
        //this.frameName = imagename;
    //
    this.start = start;
    this.target = target;
    
    this.weaponParams = weaponParams;
    //if miss pick random location
    //
    //action
    this.x = start.x;
    this.y = start.y;
    this.target = target;
    console.log(this.target);
    this.setDirection();
    
    this.posx = -1;
    this.posy = -1;
    this.prevx = -1;
    this.prevy = -1;
    this.findtile();
    this.updateIso();
}
Bullet.prototype.reset = function(){
    this.time = -1;
    this.over = null;
    this.inUse = false;
    this.visible = false;
}
Bullet.prototype.setDirection = function() 
{ 
    if(this.target!=null)
    {
        this.dir.x =  this.target.x-this.x;//+this.gameref.map.hexHandler.halfHex
        this.dir.y =  this.target.y-this.y;//+this.gameref.map.hexHandler.halfHexHeight
        this.dir.normalize();
    }
    else
    {
        this.dir.x = 0;
        this.dir.y = 0;
    }
}
Bullet.prototype.findtile = function()
{
    //console.log(this.x,this.y);
    var onmap = this.gameref.map.spritegrid.PosToMap(this.x,this.y);
    if(onmap.x!=-1)
    {
        this.posx = onmap.x;
        this.posy = onmap.y;
    }
    //this.currentTile = this.gameref.hexHandler.checkHex(this.x,this.y);
}
Bullet.prototype.updateIso = function()
{
    if(this.currentTile)
    {
        //console.log(this.currentTile.posx,)
        this.iso = this.gameref.map.spritegrid.projectGrid(this.currentTile.posx,this.currentTile.posy);
    }
}
Bullet.prototype.updateIso = function()
{
    this.iso = this.gameref.map.spritegrid.projectGrid(this.posx,this.posy);
    this.iso.y += 50;
}