//***** GlobalHandler ********
var GlobalHandler = function (game, maingame, actors, variables, quests, items)
{
    this.game = game;
    this.maingame = maingame;
    this.actors = actors;
    this.variables = variables
    this.quests = quests;
    this.items = items;
}
GlobalHandler.prototype.setActor = function(name,object)
{
    for(var i=0;i<this.actors.length;i++)
    {
        if(this.actors[i].Name==name)
        {
            this.actors[i].bind = this.actors[i].bind || [];
            this.actors[i].bind.push(object);//multiple binds per actor?
            //object.bind = this.actionsp=[i];
        }
    } 
}

//actors and items on map with actorset will register with this class
//invetory? ui?
//quests ui will pull from this


//***** EventConv ********
var EventConv = function (game, maingame, destroyfunc, json) 
{
    //this.convid = json.convid;
    //this.once = json.once;
    //if json.once destroy self on use
}
EventConv.prototype.removeSelf = function() 
{
    
}
EventConv.prototype.activateEvent = function() 
{
    this.maingame.showDialog(this.convid);
    if(this.once){
        //call destroy func
    }
}
//
var EventnText = function (json) 
{
}
//items
//variables
/*
 {
    "type": "actionconvtrigger",
    "trigger": "OnTalk",
    "convid": 1,
    "once": false,
    "skipIfNoValidEntries": false
},
{
    "type": "actorset",
    "ActorName": "Crab"
},
{
    "type": "actiontext",
    "lookatactive": true,
    "lookat": "A baby crab trying to get your attention."
}
interacttrigger
*/
/*
Actors/enemies animations
- move x6
- attaks? x6
- hurt x6
- die
- knockdown
- use/action x6



OTHER ACTIONS
- load special animations - (array) - animationid, animationname, #frames
- activate other interactive object (ie go alive to dead)
- create named object? 

- destroy graphic(self)
- hide graphic, show graphic 
- change graphic/play animation
- set tile walkable, unwalkable

actor
- move to tile
- combat editor(later)
- start combat if enter range

- ondie?

- display message



//what - id - function or var - parameters as array


Item[\"BabyCrab\"].Inventory = true
Item[\"BabyCrab\"].pickup();
- destroy graphic
- set walkable?




this.interactiveobject = destroy (remove graphic), no longer interactive(graphic stays, no longer touchable)
//click once for pickup, click again says you can't? or just can't
//does visual state change?
//ininventory means it starts there when you enter the game


Variable
- onchange - allow objects to register waiting for changes?


Quest
state
Entry_#_state //# is 1,2,3


Convo
- branching
- single in row
- bark


- on range?

//move to tile(x,y), map 1
Actor[\"Player\"].moveTo(1,2,1);

*/