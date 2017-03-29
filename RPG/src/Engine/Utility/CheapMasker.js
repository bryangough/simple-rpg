//will alpha any maskable object that is in bounds to that point.
//This is the simpler method then Master.
var CheapMasker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;
    this.maskableobjects = maskableobjects;
}
CheapMasker.prototype.updateMasks = function(locx,locy,tilex,tiley) {
    if(this.maskableobjects)
    {
        var object;
        var flag = false;
        for(var i=0;i<this.maskableobjects.length;i++)
        {
            object = this.maskableobjects[i];
            if(object!=null)
            {
                //should test 3 points
                if(object.left <= locx && locx < object.right && object.top <= locy && locy < object.bottom)
                {
                    flag = true;
                    
                    if(object.posy==tiley){
                        if(object.posx<tilex){
                            flag = true;
                        }
                        else if(object.posx>tilex){
                            flag = false;
                        }
                    }
                    else if(object.posy>tiley){
                        flag = true;
                    }
                    else if(object.posy<tiley){
                        flag = false;
                    }   
                }
                //if object is infront of test
                if(flag)
                {
                    object.alpha = 0.5;
                }
                else
                {
                    if(object.alpha!=1.0)
                        object.alpha = 1.0;
                }
            }
            flag = false;
        } 
    }
}