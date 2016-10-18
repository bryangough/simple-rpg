// extra json - map

var PlayerCharacter = function (maingame, jsondata, map) 
{
    //MovingCharacter.call(this, maingame, jsondata, map);
    CombatCharacter.call(this, maingame, jsondata, map);
    this.jsondata.state = "idle";
    this.IsPlayer = true;
    this.movementState.change("idle");
    
    this.moveStraight = false;
    this.baseImage.events.onInputUp.add(this.handleSelect, this);//this is for select player if there are multiple selectable players
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
PlayerCharacter.prototype.handleSelect = function()
{
    console.log('this');
    if(this.maingame.map.playerCharacter!=this)
        this.maingame.map.playerCharacter = this;
}
