//
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
- load special animations - (array)
- destroy graphic(self)
- hide graphic, show graphic 
- change graphic/play animation
- set tile walkable, unwalkable

actor
- move to tile
- combat editor(later)
- start combat if enter range



- display message



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