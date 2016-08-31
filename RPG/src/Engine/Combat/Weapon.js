var Item = function(action)
{
    this.inventoryImg = action.movementspeed;
    this.buttonImg = action.shieldhp;
}
//
var Weapon = function (action)
{
    Item.call(this, action);
    
    this.weaponname = action.weaponname;
    this.dmg = action.dmg;
    this.range = action.range;
    this.acc = action.acc;
    this.clipsize = action.clipsize;
    
    this.AIPower = action.AIPower;//weight for AI attack, not in yet
    
    this.attackType = action.attackType;
    this.powerType = action.powerType;
    this.type = action.type;
    this.cost = action.cost;//points cost to use
    this.cooldown = action.cooldown;
    this.description = action.description;
};
Weapon.prototype = Object.create(Item.prototype);
Weapon.constructor = Weapon;