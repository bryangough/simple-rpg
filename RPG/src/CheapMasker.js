//will alpha any maskable object that is in bounds that that point.
//This is the simpler method.
var CheapMasker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;
    this.maskableobjects = maskableobjects;
}
CheapMasker.prototype.updateMasks = function(locx,locy) {
    if(this.maskableobjects)
    {
        var object;
        for(var i=0;i<this.maskableobjects.length;i++)
        {
            object = this.maskableobjects[i];
            if(object!=null)
            {
                if(object.left <= locx && locx < object.right && object.top <= locy && locy < object.bottom)
                {
                    object.alpha = 0.5;
                }
                else
                {
                    if(object.alpha!=1.0)
                        object.alpha = 1.0;
                }
            }
        } 
    }
}