//ontype change, for all dispatchers, test if shouldbe active, tell connected

//this should be moved into normal class
var GlobalEvents = function ()
{    
}
GlobalEvents.allEventDispatchers = [];
GlobalEvents.SendRefresh = new Phaser.Signal();

GlobalEvents.WALK = 0;
GlobalEvents.LOOK = 1;
GlobalEvents.TOUCH = 2;
GlobalEvents.TALK = 3;
GlobalEvents.ITEM = 4;
GlobalEvents._currentacion = GlobalEvents.WALK;

GlobalEvents.selectedItem = null;

Object.defineProperty(GlobalEvents, "currentacion", {
    get: function() {return GlobalEvents._currentacion },
    set: function(v) { GlobalEvents._currentacion = v; GlobalEvents.refreshEvents(); }//throw on change
});
GlobalEvents.checkSelectItem = function(id)
{
    //console.log("checkSelectItem",id,GlobalEvents.selectedItem.id);
    if(GlobalEvents.selectedItem==null)
        return false;
    return (GlobalEvents.selectedItem.id == id);
}


GlobalEvents.flushEvents = function()
{
    GlobalEvents.allEventDispatchers = [];
}

GlobalEvents.refreshEvents = function()
{
    var events = GlobalEvents.allEventDispatchers;
    for(var i=0;i<events.length;i++)
    {
        events[i].testAction();
    }
    
    GlobalEvents.SendRefresh.dispatch([this])
}