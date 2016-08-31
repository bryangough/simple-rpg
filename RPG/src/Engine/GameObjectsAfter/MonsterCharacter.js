var MonsterCharacter = function (maingame, jsondata, map) 
{
    CombatCharacter.call(this, maingame, jsondata, map);
    this.jsondata.state = "idle";
    this.IsPlayer = false;
    //this.movementState.change("wander");
    //this.walkspeed = 0.04;
};
MonsterCharacter.prototype = Object.create(CombatCharacter.prototype);
MonsterCharacter.constructor = MonsterCharacter;

MonsterCharacter.prototype.doDead = function()
{
}
