var PlayerCamera = function (game, gameref)
{
    
    this.game = game;
    this.gameref = gameref;
    
    this.following = null;
    
    this.movespeed = 1;
    
    this.followMapBoundaries = false;
};

PlayerCamera.prototype.moveTo = function(x, y)
{
    
}
PlayerCamera.prototype.jumpTo = function(x, y)
{
    this.gameref.map.mapGroup.x = x;
    this.gameref.map.mapGroup.y = y;
}
PlayerCamera.prototype.setFollowObject = function(objectToFollow, jumpNow)
{
    this.following = objectToFollow;
    //if(jumpNow)
    //    this.jumpTo(this.following.x, this.following.y);
}
PlayerCamera.prototype.stopFollow = function()
{
    this.following = null;
}
PlayerCamera.prototype.adjustPosition = function(x, y)
{
    this.gameref.map.mapGroup.x += x;
    this.gameref.map.mapGroup.y += y;
    //console.log(this.gameref.map.mapGroup.x,this.gameref.map.mapGroup.y);
}
PlayerCamera.prototype.step = function(elapsedTime)
{
    if(this.following!=null)
    {
        var newx = (900/2)-(this.following.x * this.gameref.map.scaledto);
        var newy = (640/2)-(this.following.y * this.gameref.map.scaledto);
        this.jumpTo(newx, newy);
    }
}