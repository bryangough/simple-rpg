var InventoryObject = function(game, inventory, spritesheet, sprite, item)
{
    Phaser.Image.call(this, game, 0,0, spritesheet,sprite);   
    this.inventory = inventory;
    this.item = item;
    this.events.onInputDown.add(this.handleClick, this);
    this.inputEnabled = true;
}
InventoryObject.prototype = Object.create(Phaser.Image.prototype);
InventoryObject.constructor = InventoryObject;

InventoryObject.prototype.handleClick = function(){
    GlobalEvents.currentAction = GlobalEvents.ITEM;
    GlobalEvents.selectedItem = this.item;
    this.inventory.highlight(this);
    this.inventory.invSelected.dispatch(this.item, this, this.inventory);
}