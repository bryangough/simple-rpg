var Masker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;

    this.maskedobjects = [];
    this.maskDistance = 2000;//distance*distance
    
    this.maskableobjects = maskableobjects;
    
}
//Masker.prototype = Object.create(Phaser.Group.prototype);
//Masker.constructor = Masker;

Masker.prototype.createCircleMask = function(radius) {
        var mask = this.game.add.graphics(0, 0);
        mask.beginFill(0xffffffff);
        mask.drawCircle(0, 0, radius);
        this.maingame.objectGroup.add(mask);
        return mask;
}
Masker.prototype.createRectMask = function(x,y,w,h) {
        var mask = this.game.add.graphics(0, 0);
        mask.beginFill(0x00000000);
        mask.drawRect(x,y,w/2,h);
       // mask.beginFill(0xffffffff);
        //mask.drawCircle(0, 0, 100);

        this.maingame.objectGroup.add(mask);
        return mask;
}
//get list of maskedobjects
//if already has mask, then move it, else create a new one

Masker.prototype.updateMasks = function(locx,locy) {
   /* if(this.maskableobjects)
    {
        var object;
        for(var i=0;i<this.maskableobjects.length;i++)
        {
            object = this.maskableobjects[i];
            if(object!=null)
            {
                if(object.left <= locx && locx < object.right && object.top <= locy && locy < object.bottom)
                {
                    if(object.mask==null)
                    {
                       object.mask = this.createRectMask(object.left,object.top,object.width,object.height);
                    }
                    //object.mask.x = locx;
                    //object.mask.y = locy;                    
                }
                else
                {
                    if(object.mask)
                    {
                        object.mask.x = -2000;
                        object.mask.visibile = false;
                        object.mask = null;
                    }
                }
            }
        } 
    }*/
}

Masker.prototype.fasterDistance = function(x1,y1,x2,y2){
    var a = x1 - x2
    var b = y1 - y2
    //var c = Math.sqrt( a*a + b*b );
    return (a*a + b*b);
}
//
var MaskedObject = function ()
{
    this.circle;
    this.rect;
    this.object;
}