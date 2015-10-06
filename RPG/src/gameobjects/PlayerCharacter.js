// extra json - map

var PlayerCharacter = function (maingame, jsondata, map) 
{
    //MovingCharacter.call(this, maingame, jsondata, map);
    CombatCharacter.call(this, maingame, jsondata, map);
    
    this.IsPlayer = true;
   // this.dosetup();
};
//PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.prototype = Object.create(CombatCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;
