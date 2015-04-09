//ontype change, for all dispatchers, test if shouldbe active, tell connected

//this should be moved into normal class
var GlobalEvents = function ()
{    
}
GlobalEvents.allEventDispatchers = [];

GlobalEvents.WALK = 0;
GlobalEvents.LOOK = 1;
GlobalEvents.TOUCH = 2;
GlobalEvents.TALK = 3;
GlobalEvents._currentacion = GlobalEvents.WALK;

Object.defineProperty(GlobalEvents, "currentacion", {
    get: function() {return GlobalEvents._currentacion },
    set: function(v) { GlobalEvents._currentacion = v; GlobalEvents.refreshEvents(); }//throw on change
});

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
}