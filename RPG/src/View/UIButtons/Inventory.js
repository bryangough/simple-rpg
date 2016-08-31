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
    var iwidth = 60;
    var num = 10;
    for(var j=0;j<num;j++)
    {
        var img = this.game.make.sprite(iwidth * j,0,"gameplayinterface","inventoryItem0001.png");
        img.scale.setTo(0.5,0.5);
        img.anchor.setTo(0.5,0.5);
        this.addChild(img);
    }
    this.selectedBG = this.game.make.sprite(0,-50,"gameplayinterface","inventoryItem0002.png");
    this.selectedBG.scale.setTo(0.5,0.5);
    this.selectedBG.anchor.setTo(0.5,0.5);
    this.selectedBG.visible = false;
    
    this.addChild(this.selectedBG);
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
            //    console.log(val,val.getValue("Inventory"))
                if(val.getValue("Inventory"))
                {
                    this.addInventoryGraphic(val);
                }
            }
        }
    }
    
    
    this.x = this.game.world.centerX - (iwidth * num)/2;
    
    this.changeState = new Phaser.Signal();
    this.invSelected = new Phaser.Signal();
    
    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
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
    console.log("close", GlobalEvents.currentAction);
    if(GlobalEvents.currentAction == GlobalEvents.ITEM)
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
        this.selectedBG.visible = false;
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
    var newitem = new InventoryObject(this.game, this, "inventory", item.getValue("InventoryGraphicName")+".png", item);
    console.log(item.getValue("InventoryGraphicName"))
    //newitem.scale.setTo(0.5,0.5);
    newitem.anchor.setTo(0.5,0.5);
    this.add(newitem);
    this.currentitems.push(newitem);
    this.resuffle();
}
InventoryGraphics.prototype.highlight = function(item)
{
    this.selectedBG.visible = true;
    this.selectedBG.x = item.x;
    this.selectedBG.y = item.y;
}
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
InventoryGraphics.prototype.checkRefresh = function(){
    if(GlobalEvents.currentAction != GlobalEvents.ITEM)
    {
        this.selectedBG.visible = false;
        //this.disableAll();
    }
}

//


