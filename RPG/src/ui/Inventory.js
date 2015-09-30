/*

*/
var InventoryGraphics = function(game,maingame,globalhandler)
{
    Phaser.Group.call(this, game, null);
    //
    this.startx = 0;
    this.starty = 0;
    this.iwidth = 250;
    this.iheight = 40;

    this.numrows = 1;
    this.numcolumns = 5;
    //
    this.game = game;
    this.maingame = maingame;
    this.globalhandler = globalhandler;
    //
    //var bg = this.game.make.sprite(0,0,"dialogui","inventory_bg.png");
    //this.add(bg);    
    //
    this.currentitems = []
    //
    var items = this.globalhandler.items;
    if(items)
    {
        //for (var val of items)
        for(var i=0;i<items.length;i++)
        {
            var val = items[i];
            if(val!=null)
            {//might be moved to inventory item
                val.OnChangeSignal.add(this.makeReturn(val), this);
                if(val.getValue("Inventory"))
                {
                    this.addInventoryGraphic(val);
                }
            }
        }
    }
    
    this.changeState = new Phaser.Signal();
    this.invSelected = new Phaser.Signal();
   // this.closeButton = this.game.add.button(bg.width, 0, 'ui', this.closeThis, this, "Close Button0002.png", "Close Button0001.png", "Close Button0001.png", "Close Button0002.png");
 //   this.addChild(this.closeButton);
}
InventoryGraphics.prototype = Object.create(Phaser.Group.prototype);
InventoryGraphics.constructor = InventoryGraphics;
//
InventoryGraphics.prototype.makeReturn = function(value) {
    return function () {
        this.itemChanged(value);
    };
}
InventoryGraphics.prototype.toggle = function(){
    if(this.visible)
    {
        this.closeThis();
    }
    else
    {
        this.visible = true;
        this.changeState.dispatch(true, this);
    }
}
InventoryGraphics.prototype.closeThis = function(){
    this.visible = false;
    this.changeState.dispatch(false, this);
    if(GlobalEvents.currentacion == GlobalEvents.ITEM)
    {
        GlobalEvents.gotoLastAction();
    }
}
InventoryGraphics.prototype.itemChanged = function(changeditem) 
{
    if(changeditem==null)
        return;
    var ininventory = changeditem.getValue("Inventory")
    var indexof = this.findItem(changeditem);
    //console.log("itemChanged",changeditem,ininventory,indexof);
    if(ininventory && indexof==-1)
    {
        this.addInventoryGraphic(changeditem);
    }
    else if(!ininventory && indexof>-1)
    {
        this.destroyGraphicItem(this.currentitems[indexof]);
        this.currentitems.splice(indexof,1);
        this.resuffle();
    }
}
InventoryGraphics.prototype.findItem = function(item)
{
    for(var i=0;i<this.currentitems.length;i++)
    {
        if(this.currentitems[i].item.id == item.id)
        {
            return i;
        }
    }
    return -1;
}
InventoryGraphics.prototype.updateSelf = function()
{
    console.log("do graphics");
    //InventoryGraphicName
}
InventoryGraphics.prototype.destroyGraphicItem = function(item)
{
    if(item!=null)
        item.destroy();
}
InventoryGraphics.prototype.addInventoryGraphic = function(item)
{
    /*var newitem = new InventoryObject(this.game, this, "dialogui", item.getValue("InventoryGraphicName")+".png", item);
    this.add(newitem);
    this.currentitems.push(newitem);*/
    this.resuffle();
}
/*
    var startx = 15;
    var starty = 15;
    var iwidth = 250;
    var iheight = 40;
    //
    var numrows = 1;
    var numcolumns = 5;
*/
InventoryGraphics.prototype.resuffle = function()
{
    var numwidth = (this.iwidth-this.startx)/this.numcolumns;
    //
    for(var i=0;i<this.currentitems.length;i++)
    {
        this.currentitems[i].x = this.startx+i*numwidth;
        this.currentitems[i].y = this.starty;
    }
}
//
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
    GlobalEvents.currentacion = GlobalEvents.ITEM;
    GlobalEvents.selectedItem = this.item;
    this.inventory.invSelected.dispatch(this.item, this, this.inventory);
}

