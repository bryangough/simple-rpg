// extra json - map

var PlayerCharacter = function (maingame, jsondata, map) 
{
    //MovingCharacter.call(this, maingame, jsondata, map);
    CombatCharacter.call(this, maingame, jsondata, map);
    this.jsondata.state = "idle";
    this.IsPlayer = true;
    this.movementState.change("idle");
};
//PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.prototype = Object.create(CombatCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;

PlayerCharacter.prototype.doDead = function()
{
    this.currentTile.changeWalkable(true);
    this.eventDispatcher.doAction("OnDeath",this);
    
    this.jsondata.destroyed = false;
    this.jsondata.dead = false;
    this.jsondata.state = "idle";
    //activate death state
    this.maingame.gGameMode.change("playerDead");
}
