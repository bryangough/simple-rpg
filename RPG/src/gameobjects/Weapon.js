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
    this.clipsize = action.clipsize;
};
Weapon.prototype = Object.create(Item.prototype);
Weapon.constructor = Weapon;
