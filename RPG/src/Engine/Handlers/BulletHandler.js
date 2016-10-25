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
    var bullet = new BulletText(this.game, -1000, 0, this.spritesheet, this.defaultImageName, this);
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
BulletHandler.prototype.fireBullet = function(imagename, action, onhitaction, start, target, afterAction){
    /*var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].over==object && allbullets[i].over!=null)
            allbullets[i].killSelf();
    }*/
    
    var bullet = this.pool.getObject();
    if(imagename==null)//|| speed = -1 : instant
    {
        
    }
    else
    {
        bullet.getReady(imagename, action, onhitaction, start, target);
    }
    bullet.x = start.x;
    bullet.y = start.y;
}
BulletHandler.prototype.step = function(elapseTime){
    var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].inUse)
            allbullets[i].step(elapseTime);
    }
}
//*********** Bullet
var Bullet = function (game, x, y, spritesheet, imagename, handler) 
{
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.gameref = game;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    this.target = null;
    this.velocity = null;
    
    /*this.iso = new Vec3(objectPassed.x, objectPassed.y, objectPassed.z);
    this.isoorder = objectPassed.order;
    this.y += this.iso.y * -50;*/
    this.time;//
    this.inUse = false;
    this.handler = handler;
}
Bullet.prototype = Object.create(Phaser.Image.prototype);
Bullet.constructor = Bullet;
//
Bullet.prototype.dosetup = function(hexHandler)
{
}
Bullet.prototype.killSelf = function(){
    this.handler.returnbulletToPool(this);
}
Bullet.prototype.getReady = function(imagename, action, onhitaction, start, target)
{
    this.inUse = true;
    this.visible = true;
    //
    if(this.frameName!=imagename)
        this.frameName = imagename;
    //
    this.start = start;
    this.target = target;
    //
    //action, onhitaction?
}
Bullet.prototype.reset = function(){
    this.time = -1;
    this.over = null;
    this.inUse = false;
    this.visible = false;
}
