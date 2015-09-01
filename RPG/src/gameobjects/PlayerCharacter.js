// extra json - map

var PlayerCharacter = function (maingame, jsondata, map) 
{
    MovingCharacter.call(this, maingame, jsondata, map);
    this.IsPlayer = true;
    this.dosetup();
};
PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;
