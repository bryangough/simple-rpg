// extra json - map

var PlayerCharacter = function (maingame, jsondata) 
{
    MovingCharacter.call(this, maingame, jsondata);
    this.IsPlayer = true;
    //this.inventory = [];    
    this.dosetup();
};
PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;
