//ontype change, for all dispatchers, test if shouldbe active, tell connected

//this should be moved into normal class
var GlobalEvents = function ()
{    
}
GlobalEvents.allEventDispatchers = [];
GlobalEvents.SendRefresh = new Phaser.Signal();

GlobalEvents.DISABLE = -1;
GlobalEvents.WALK = 0;
GlobalEvents.LOOK = 1;
GlobalEvents.TOUCH = 2;
GlobalEvents.TALK = 3;
GlobalEvents.ITEM = 4;
GlobalEvents.COMBATSELECT = 5;

GlobalEvents.lastAction = GlobalEvents.DISABLE;
GlobalEvents._currentacion = GlobalEvents.WALK;

GlobalEvents.selectedItem = null;

Object.defineProperty(GlobalEvents, "currentacion", {
    get: function() {return GlobalEvents._currentacion },
    set: function(v) { 
        //if disabled, set any changes to what it will be set at when undisabled
        //don't do double disabled
        if(GlobalEvents._currentacion==GlobalEvents.DISABLE && v!=GlobalEvents.DISABLE)
        {
            GlobalEvents.lastAction = v;
            //console.log("s",GlobalEvents._currentacion,GlobalEvents.lastAction);
        }
        else
        {   
            GlobalEvents.lastAction = GlobalEvents._currentacion;
            GlobalEvents._currentacion = v; 
            GlobalEvents.refreshEvents(); 
            //console.log("d",GlobalEvents._currentacion,GlobalEvents.lastAction);
        }
    }//throw on change
});
GlobalEvents.tempDisableEvents = function()
{
    //console.log("tempDisableEvents");
    GlobalEvents.currentacion = GlobalEvents.DISABLE;
    
    //GlobalEvents.lastAction = GlobalEvents._currentacion;
    //GlobalEvents._currentacion = GlobalEvents.DISABLE;
    //GlobalEvents.refreshEvents(); 
}
GlobalEvents.reEnableEvents = function()
{
    if(GlobalEvents._currentacion==GlobalEvents.DISABLE)
    {
        //console.log("reenable",GlobalEvents._currentacion,GlobalEvents.lastAction);
        GlobalEvents._currentacion = GlobalEvents.lastAction;
        GlobalEvents.refreshEvents();
    }
    //else ignore
}
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