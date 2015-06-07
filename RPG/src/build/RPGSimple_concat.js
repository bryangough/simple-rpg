//***** ActionButtons ********
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    //
    this.currentActive;
    //
    this.walk = {up:null,active:null};
    this.setButton(0,0,"walkBtn0001.png","walkBtn0002.png",this.walk,this.dowalk);
    
    this.use = {up:null,active:null};
    this.setButton(71,0,"useBtn0001.png","useBtn0002.png",this.use,this.douse);
    
    this.look = {up:null,active:null};
    this.setButton(142,0,"lookBtn0001.png","lookBtn0002.png",this.look,this.dolook);
    
    this.talk = {up:null,active:null};
    this.setButton(212,0,"talkBtn0001.png","talkBtn0002.png",this.talk,this.dotalk);
    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent){
    ref.up = this.game.make.sprite(x,y,"dialogui",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"dialogui",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
}
//these also should do something
ActionButtons.prototype.dowalk = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.WALK;
    this.currentActive = this.walk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.douse = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.TOUCH;
    this.currentActive = this.use;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dolook = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.LOOK;
    this.currentActive = this.look;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.dotalk = function(){
    this.disableButton(this.currentActive);
    GlobalEvents.currentacion = GlobalEvents.TALK;
    this.currentActive = this.talk;
    this.enableButton(this.currentActive);
}
ActionButtons.prototype.disableAll = function(){
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
ActionButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.disableAll();
}
//
ActionButtons.prototype.enableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = false;
    ref.active.visible = true;
}
ActionButtons.prototype.disableButton = function(ref){
    if(ref==null)
        return;
    ref.up.visible = true;
    ref.active.visible = false;    
}
//***** BasicObjectPool ********
// simple object pool to handle barks and other little things
BasicObjectPool = function(handler)//pooleditems
{
    this.openArray = [];// || pooleditems;
    this.allObjectsArray = [];// || pooleditems;   
    this.handler = handler || null;
}
BasicObjectPool.prototype.getObject = function(){
    if(this.openArray.length>0)
        return this.openArray.pop();
    else{
        var newObject = this.handler.createItem();
        this.openArray.push(newObject);
        this.allObjectsArray.push(newObject);
        return newObject;
    }
    return null;
}
BasicObjectPool.prototype.addObject = function(returnedobject){
    this.openArray.push(returnedobject);
    this.allObjectsArray.push(returnedobject);
}
BasicObjectPool.prototype.returnObject = function(returnedobject){
    returnedobject.reset();
    this.openArray.push(returnedobject);
}
BasicObjectPool.prototype.destroyself = function(returnedobject){
    this.allObjectsArray = [];
    this.openArray = [];
}
//*****  ********
//will alpha any maskable object that is in bounds that that point.
//This is the simpler method.
var CheapMasker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;
    this.maskableobjects = maskableobjects;
}
CheapMasker.prototype.updateMasks = function(locx,locy,tilex,tiley) {
    if(this.maskableobjects)
    {
        var object;
        var flag = false;
        for(var i=0;i<this.maskableobjects.length;i++)
        {
            object = this.maskableobjects[i];
            if(object!=null)
            {
                //should test 3 points
                if(object.left <= locx && locx < object.right && object.top <= locy && locy < object.bottom)
                {
                    flag = true;
                    
                    if(object.posy==tiley){
                        if(object.posx<tilex){
                            flag = true;
                        }
                        else if(object.posx>tilex){
                            flag = false;
                        }
                    }
                    else if(object.posy>tiley){
                        flag = true;
                    }
                    else if(object.posy<tiley){
                        flag = false;
                    }   
                }
                //if object is infront of test
                if(flag)
                {
                    object.alpha = 0.5;
                }
                else
                {
                    if(object.alpha!=1.0)
                        object.alpha = 1.0;
                }
            }
            flag = false;
        } 
    }
}
//***** DialogHandler ********
//handle conditions? should be passed in global handler
var DialogHandler = function(game, maingame, conversations, actors){
    this.game = game;
    this.maingame = maingame;
    this.conversations = conversations;
    this.actors = actors;
    
    this.currentConvo;
    this.playerActor = this.maingame.globalHandler.getPlayerActor();
    
    this.eventDispatcher = new EventDispatcher(game,maingame,null);
}
DialogHandler.prototype.startConvo = function(id){
    this.currentConvo = this.getConversationsByID(id);
    
    if(this.currentConvo!=null)
    {
        //get other speaker?
        
        var currentDiagData = this.buildDialogByID(0);
        
        if(currentDiagData!=null)
        {
            //if(currentDiagData.current.MenuText==""&&currentDiagData.current.DialogueText=="")
            //    currentDiagData = this.buildDialogWithDiag(currentDiagData.links[0]);
            return currentDiagData;
        }
    }
    return null;
}
//do actions for this diaglog
DialogHandler.prototype.doActions = function(currentDialog){
    if(currentDialog.actions && currentDialog.actions.length>0)
    {
        var eventActions = [];
        this.eventDispatcher.helpSetActions(eventActions, currentDialog.actions, false, null);
        if(eventActions.length>0)
            this.eventDispatcher.completeAction(eventActions);
    }
}
//for every other types (displaying the npcs text, players text as options, then going straight to next npc text)
//passing in selected link returns next npc
//passing in current displayed return next npc or pc
DialogHandler.prototype.getNextDialog = function(currentDialog){
    if(currentDialog==null)
        return null;
    this.doActions(currentDialog);    
    //if(currentDialog.links.length<=0||currentDialog.links[0]==null)
    //    return null;
    //return this.buildDialogByID(currentDialog);//.links[0].DestID);
    return this.buildDialogWithDiag(currentDialog);
}
//

//this might change but it seems like a good idea to just pass back in the diag when the link is selected
DialogHandler.prototype.buildDialogWithDiag = function(currentDiag){
    if(currentDiag==null)
        return null;
    var links = [];
    var l = currentDiag.links.length;
    var tempLink
    for(var i=0;i<l;i++)
    {
        //only handle single conversations for now
        var tempLink = this.getDialogByID(currentDiag.links[i].DestID); 
        if(tempLink!=null)
        {
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, tempLink.conditions);
            if(this.eventDispatcher.testConditions(con))
                links.push(tempLink);
        }
    }
    var thisactor = this.maingame.globalHandler.getActorByID(currentDiag.Actor);//optimize this, save it somewhere
    var diagPackage = {current:currentDiag, links:links, actor:thisactor};    
    return diagPackage;
};

DialogHandler.prototype.buildDialogByID = function(id){
    var currentDiag = this.getDialogByID(id);
    if(currentDiag==null)
        return null;
    return this.buildDialogWithDiag(currentDiag);
}
//these both need to be better sorted
DialogHandler.prototype.getDialogByID = function(id){
    var l = this.currentConvo.DialogueEntries.length;
    for(var i=0;i<l;i++)
    {
        if(this.currentConvo.DialogueEntries[i].ID==id)
            return this.currentConvo.DialogueEntries[i];
    }
    return null;
};
DialogHandler.prototype.getConversationsByID = function(id){
    var l = this.conversations.length;
    for(var i=0;i<l;i++)
    {
        if(this.conversations[i].id==id)
            return this.conversations[i];
    }
    return null;
};

//
var EventDispatcher = function (game, maingame, object)
{
    this.game = game;
    this.maingame = maingame;
    this.object = object;
    
    if(object!=null)
        GlobalEvents.allEventDispatchers.push(this);
}
EventDispatcher.prototype.receiveData = function(triggers) 
{
    //
    //this.onTouchSignal = new Phaser.Signal();
    this.onTouchAction;
    this.onLookAction;
    this.onTalkAction;
    this.onItemAction;
    //this.onEnterSignal = new Phaser.Signal();
    this.onEnterAction;//done
    this.onStartAction;//not done
    this.onActivateAction//not done
    //
    this.init(triggers);
};
EventDispatcher.prototype.testAction = function() 
{
    if(this.object)
    {
        this.object.inputEnabled = this.shouldBeActive();
    }
}
EventDispatcher.prototype.shouldBeActive = function() 
{
    if(GlobalEvents.currentacion == GlobalEvents.WALK)
        return false;
    else if(GlobalEvents.currentacion == GlobalEvents.TOUCH && this.onTouchAction)
        return true;
    else if(GlobalEvents.currentacion == GlobalEvents.LOOK && this.onLookAction)
        return true;
    else if(GlobalEvents.currentacion == GlobalEvents.TALK && this.onTalkAction)
        return true;
    else if(GlobalEvents.currentacion == GlobalEvents.ITEM && this.onItemAction)
    {
        return true;
    }
    return false;
}//if all action is null. clear out array?
//this.onEnterSignal.dispatch([this])
EventDispatcher.prototype.init = function(triggers)    
{
    var trigger;
    var action;
    var conditions;
    var condition;
    var activation;
    var eventAction;
    var con;
    for(var i=0;i<triggers.length;i++)
    {
        trigger = triggers[i];
        activation = trigger.trigger;
        con = null;
        if(trigger.conditions)
        {
            con = {logic:"Any",list:[]};
            if(activation=="OnUseItem")
            {
                con.list.push({special:true, func:GlobalEvents.checkSelectItem, para:[trigger.itemid], callee:this});
            }
            if(trigger.conditions.conditions)
                this.applyConditions(con, trigger.conditions);
        }            
        if(trigger.actions)
        {            
            for(var j=0;j<trigger.actions.length;j++)
            {
                action = trigger.actions[j];
                eventAction = this.getEventType(activation);
                this.setActions(eventAction, action, trigger.once, con, trigger.walkto||false);
            }
        }
       /* else if(trigger.type=="actiontext")
        {//need touch and talk actives
            var con = null;
            if(trigger.conditions)
            {
                //var con = this.applyConditions(trigger.conditions);
            } 
            if(trigger.lookatactive)
            {
                this.getEventType("OnLook").push({func:this.maingame.showJustText, para:[trigger.lookat], removeself:false, callee:this.maingame, con:con});
            }
        }*/
    }
};

//eventAction - array to contain them
//action - 
//
EventDispatcher.prototype.helpSetActions = function(eventAction, actions, once, con)
{
    if(actions!=null){            
        for(var j=0;j<actions.length;j++){
            if(actions[j]!=null)
                this.setActions(eventAction, actions[j], once, con, false);
        }
    }
}
EventDispatcher.prototype.setActions = function(eventAction,action, once, con, walkto)
{
    if(action.type=="ChangeMap")
        {
            eventAction.push({func:this.maingame.userExit, para:[action], removeself:once, callee:this.maingame, con:con, walkto:walkto});
        }
        //
        else if(action.type=="CONVERSATION")
        {
            eventAction.push({func:this.maingame.showDialog, para:[action.id], removeself:once, callee:this.maingame, con:con, walkto:walkto});
        }
        else if(action.type=="SIMPLE")
        {
            eventAction.push({func:this.maingame.showJustText, para:[action.text], removeself:once, callee:this.maingame, con:con, walkto:walkto});
        }
        else if(action.type=="BARK")
        {
            eventAction.push({func:this.maingame.showBark, para:[this.object, action.text], removeself:once, callee:this.maingame, con:con, walkto:walkto});
        }
        //
        else if(action.type=="THIS")//call function on this
        {
            eventAction.push({func:this.object.callFunction, para:[action.function, action.parameters], removeself:false, callee:this.object, con:con, walkto:walkto});
        }
        else if(action.type=="Item")
        {
            eventAction.push({func:this.maingame.globalHandler.updateItem, para:[action.name,action.mode, action.variable,action.value],  removeself:false, callee:this.maingame.globalHandler, con:con, walkto:walkto});

        }
        else if(action.type=="Actor")
        {
            eventAction.push({func:this.maingame.globalHandler.updateActor, para:[action.name,action.mode, action.variable,action.value],  removeself:false, callee:this.maingame.globalHandler, con:con, walkto:walkto});
        }
        else if(action.type=="Variable")
        {
            eventAction.push({func:this.maingame.globalHandler.updateVariableByID, para:[action.name,action.mode, action.value],  removeself:false, callee:this.maingame.globalHandler, con:con, walkto:walkto});
        }
        else if(action.type=="Quest")
        {
        }
}
//

con = {logic:"Any",list:[]};


EventDispatcher.prototype.applyConditions = function(con, conditions) 
{
    var conditionlist = conditions.conditions;
    var logic = conditions.logic;//All - &&  Any - ||
    var savedConditions = con.list;
    
    for(var j=0;j<conditionlist.length;j++)
    {
        condition = conditionlist[j];

        if(condition.type=="Item")
        {
            savedConditions.push({func:this.maingame.globalHandler.compareItemValue, para:[condition.name, condition.variable, condition.compare, condition.value], callee:this.maingame.globalHandler});
        }
        else if(condition.type=="Actor")
        {
            savedConditions.push({func:this.maingame.globalHandler.compareActorValue, para:[condition.name, condition.variable, condition.compare, condition.value], callee:this.maingame.globalHandler});
        }
        else if(condition.type=="Variable")
        {
            savedConditions.push({func:this.maingame.globalHandler.compareVariableValue, para:[condition.name, condition.compare, condition.value], callee:this.maingame.globalHandler});
        }
        else if(condition.type=="Quest")
        {
            savedConditions.push({func:this.maingame.globalHandler.compareQuestValue, para:[condition.name, condition.compare, condition.value], callee:this.maingame.globalHandler});
        }
        else if(condition.type=="THIS")
        {
            savedConditions.push({func:this.object.testTHISValues, para:[condition.variable, condition.compare, condition.value], callee:this.object})
        }
        else
        {
            console("Apply conditions unknown",condition.type,condition);
        }
    }
    con.logic = logic;
    con.list = savedConditions;
    return con;
}

//
EventDispatcher.prototype.testConditions = function(conditions) 
{
    if(!conditions.list)
        return true;
    if(conditions.list.length<=0)
        return true;
    var conditionlist = conditions.list;
    var logic = conditions.logic;//All - &&  Any - ||
    var returned = false;
    var eachreturn;
    for(var j=0;j<conditionlist.length;j++){
        eachreturn = conditionlist[j].func.apply(conditionlist[j].callee, conditionlist[j].para);
        if(conditionlist[j].special && eachreturn==false)
            return false;
        if(logic=="All"){
            if(eachreturn==false)
                return false;
            returned = true;
        }
        else{//any
            if(eachreturn==true)
                return true;
        }
    }
    return returned;
}
//
EventDispatcher.prototype.doAction = function(activation) 
{
    var actionEvent = this.getEventType(activation); 
    this.completeAction(actionEvent,false);
}
//
EventDispatcher.prototype.completeAction = function(actionEvent, atPoint)
{
    var lastcon;
    var lastconreturn = false;
    var actionstoactivate = [];
    var walktoactions = [];
    if(actionEvent.length>0)
    {
        //test all conditions
        for(var i=0;i<actionEvent.length;i++)
        {
            if(actionEvent[i]!=null)
            {
                if(actionEvent[i].con)//check condition. If false skip. If con is null then just go.
                {
                    //if similar cons just use same value
                    if(actionEvent[i].con!=lastcon)
                    {
                        lastconreturn = this.testConditions(actionEvent[i].con);
                        lastcon = actionEvent[i].con;
                    }
                    if(!lastconreturn)
                        continue;
                }
                //push activated events into array and fire them later
                if(actionEvent[i].walkto)
                {
                    //this should be called only once
                    var neighbours = this.maingame.hexHandler.areTilesNeighbors(this.object.currentTile, this.maingame.playerCharacter.currentTile);
                    if(!neighbours || !atPoint)
                    {
                        walktoactions.push(actionEvent[i]);
                        continue;
                    }
                }
                actionstoactivate.push(actionEvent[i]);
            }
        }
        //
        if(walktoactions.length>0)
        {
            this.maingame.moveToAction(this.object, this.object.currentTile, walktoactions);
        }
        //all actions now happens after all conditions are tested
        this.dogivenactions(actionstoactivate);
    }
};
EventDispatcher.prototype.dogivenactions = function(actionstoactivate) 
{
    for(var i=0;i<actionstoactivate.length;i++)
        {
            if(actionstoactivate[i])
                actionstoactivate[i].func.apply(actionstoactivate[i].callee, actionstoactivate[i].para);
            if(actionstoactivate[i].removeself)
            {
                actionstoactivate[i] = null;//splice too? yes? what about the json part
            }       
        }
}
//
EventDispatcher.prototype.getEventType = function(activation) 
{
    if(activation=="OnEnter")
    {
        this.onEnterAction = this.onEnterAction || [];
        return this.onEnterAction;
    }
    else if(activation=="OnStart")
    {
        this.onStartAction = this.onStartAction || [];
        return this.onStartAction;
    }
    else if(activation=="OnTouch")
    {
        this.onTouchAction = this.onTouchAction || [];
        return this.onTouchAction;
    }
    else if(activation=="OnTalk")
    {
        this.onTalkAction = this.onTalkAction || [];
        return this.onTalkAction;
    }
    else if(activation=="OnLook")
    {
        this.onLookAction = this.onLookAction || [];
        return this.onLookAction;
    }
    else if(activation=="OnActivate")
    {
        this.onActivateAction = this.onActivateAction || [];
        return this.onActivateAction;
    }
    else if(activation=="OnUseItem")
    {
        this.onItemAction = this.onItemAction || [];
        return this.onItemAction;
    }
};
EventDispatcher.prototype.destroy = function() 
{
    this.onTouchAction = null;
    this.onLookAction = null;
    this.onTalkAction = null;
    this.onItemAction = null;
    this.onEnterAction = null;
    this.onStartAction = null;
    this.onActivateAction = null;
}

/*
//inputEnabled 

register list of active objects for each event: touch, talk, look, (invectory item?)

turn on inputEnabled for current
turn off inputEnabled for last (if not current also)

- walk shuts all off





*/
/*

"triggers": [
        {
            "trigger": "OnEnter",
            "actions": [
                {
                    "type": "ChangeMap",
                    "tmap": "Map1 - Beach",
                    "tx": 4,
                    "ty": 1
                }
            ],
            "conditions": "[]"
        }
    ]
}


*/


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
/* 
Actors/enemies animations
- move x6
- attaks? x6 (per attack type)
- hurt x6
- die
- knockdown
- use/action x6
- idle x6


for normal objects (called automatically)
- idle
- destroy
- use


OTHER ACTIONS
done - load special animations - (array) - animationid, animationname, #frames
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


//Variable - special case
{
    "Variable": {
        "name": "FireLit",
        "value": "true",
    }
}
//
{
    "actionSpots": [
        {
            "x": 2,
            "y": 3,
            "triggers": [
                {
                    "trigger": "OnEnter",
                    "once": false,
                    "actions": [
                        {
                            "type": "ChangeMap",
                            "tmap": "Map2",
                            "tx": 0,
                            "ty": 2
                        }
                    ],
                    "conditions": []
                }
            ]
        }
    ]
}

//
//Item - Action
{
    "trigger": "onTouch",
    "once": false,
    "actions": [
        {
            "type": "Item",
            "name": "BabyCrab",
            "set": "Inventory",
            "value": "true"
        },
        {
            "type": "Item",
            "name": "BabyCrab",
            "function": "pickup",
            "parameters": []
        },
        {
            "type": "this",
            "name": "",
            "function": "destroySelf",
            "parameters": []
        }
    ]
}

//All - Condition
//any vs all
{
    "conditions": {
        "testrequire": "All",
        "tests": [
            {
                "type": "Item",
                "name": "BabyCrab",
                "var": "Inventory",
                "condition": "==",
                "value": "true"
            }
        ]
    }
}

//Quest

//player, gameworld

//call knows it's a function call, not just a set?


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
//***** GlobalHandler ********
var GlobalHandler = function (game, maingame, actors, variables, quests, items)
{
    //only create objects when they are needed?
    //how do I do much larger games?
    this.game = game;
    this.maingame = maingame;
    //
    this.actors = [];
    this.playerActor;
    for(var i=0;i<actors.length;i++)
    {
        this.actors[actors[i].id.toString()] = new ActorObject(actors[i]);
        if(actors[i].Name=="Player")
            this.playerActor = this.actors[actors[i].id.toString()];
    }
    
    //
    this.variables = [];
    for(var i=0;i<variables.length;i++)
    {
        this.variables[variables[i].id.toString()] = new VariableObject(variables[i]);
    }
    //
    this.items = [];
    this.quests = [];
    for(var i=0;i<items.length;i++)
    {
        if(items[i]["Is Item"])
        {
            this.items[items[i].id.toString()] = new ItemObject(items[i]);
        }
        else
        {
            this.quests[items[i].id.toString()] = new QuestObject(items[i]);
        }
    }
    //
    this.maps = [];
}
//
function saveState(state) { 
    window.localStorage.setItem("gameState", JSON.stringify(state)); 
} 
 
function restoreState() { 
    var state = window.localStorage.getItem("gameState"); 
    if (state) { 
        return JSON.parse(state); 
    } else { 
        return null; 
    } 
}
//
GlobalHandler.prototype.SaveGame = function()
{
}
//Quest
GlobalHandler.prototype.compareQuestValue = function(id,compare,value)
{
    if(!this.quests[id])
        return false;
    return this.doCompare(compare,this.quests[id].State, value);
}
GlobalHandler.prototype.updateQuestByID = function(id,mode,value)
{
    if(!this.quests[id])
        return false;
    if(mode=="Add")
        this.quests[id].value += parseFloat(value);
    else
        this.quests[id].value = value;
    return true;
}
//Variable
GlobalHandler.prototype.compareVariableValue = function(id,compare,value)
{
    if(!this.variables[id])
        return false;
    return this.doCompare(compare,this.variables[id].value, value);
}
GlobalHandler.prototype.getVariableValue = function(id)
{
    if(!this.variables[id])
        return null;
    return this.variables[id].value;
}
GlobalHandler.prototype.updateVariableByID = function(id,mode,value)
{
    if(!this.variables[id])
        return false;
    if(mode=="Add")
        this.variables[id].value += parseFloat(value);
    else
        this.variables[id].value = value;
    
    return true;
}
//
GlobalHandler.prototype.doCompare = function(compare,variable, value)
{
    if(compare=="Is")
        return (variable == value);
    if(compare=="IsNot")
        return (variable != value);
    if(compare=="Less")
        return (variable < value);
    if(compare=="Greater")
        return (variable > value);
    if(compare=="LessEqual")
        return (variable <= value);
    if(compare=="GreaterEqual")
        return (variable >= value);
}
//Item
GlobalHandler.prototype.compareItemValue = function(id,variable,compare,value)
{
    if(!this.items[id])
        return false;
    if(this.items[id].json[variable]==null)
        return false;
    return this.doCompare(compare,this.items[id].json[variable], value);
}
//
GlobalHandler.prototype.getItemValue = function(id,variable)
{
    if(!this.items[id])
        return null;
    return this.items[id].json[variable];
}
GlobalHandler.prototype.getItemByID = function(id)
{
    if(!this.items[id])
        return null;
    return this.items[id];
}
GlobalHandler.prototype.updateItem = function(id,mode,variable,value)
{
    
    var item = this.getItemByID(id);
    if(item)
    {
        if(mode=="Add")
        {
            item.addValue(variable,value);
        }
        else 
            item.updateValue(variable,value);
    }
    else
        console.log(id,"not found");
}
//
GlobalHandler.prototype.compareActorValue = function(id,variable,compare,value)
{
    if(!this.actors[id])
        return false;
    if(!this.actors[id].json[variable])
        return false;
    return this.doCompare(compare,this.actors[id].json[variable], value);
}
GlobalHandler.prototype.getActorValue = function(id,variable)
{
    if(!this.actors[id])
        return null;
    return this.actors[id].json[variable];
}
GlobalHandler.prototype.getPlayerActor = function()
{
    return this.playerActor;
}
GlobalHandler.prototype.getActorByID = function(id)
{
    if(!this.actors[id])
        return null;
    return this.actors[id];
}
GlobalHandler.prototype.updateActor = function(id,mode,variable,value)
{
    var actor = this.getActorByID(id);
    if(actor)
    {
        if(mode=="Add")
            actor.addValue(variable,value);
        else 
            actor.updateValue(variable,value);
    }
    else
        console.log(id,"not found");
}
//
GlobalHandler.prototype.setActor = function(id,object)
{
    if(this.actors[id])
    {
        this.actors[i].bind.push(object);
    }
}
//
//this.OnChangeSignal.dispatch([this])
//**
var BaseObject = function (json){
    this.OnChangeSignal = new Phaser.Signal();
    this.json = json;
    this.id = json.id;
};
//should do value type
BaseObject.prototype.updateValue = function(variable,value){
    //console.log("updateValue",variable,value,this);
    //if(this.json[variable]!=null){
    this.json[variable] = value;
    //console.log(this,this.json[variable],value);
    //}
    this.OnChangeSignal.dispatch([this]); 
}
BaseObject.prototype.addValue = function(variable,value){
    if(this.json[variable]!=null){
        this.json[variable] += value;
    }
    this.OnChangeSignal.dispatch([this]); 
}
BaseObject.prototype.getValue = function(variable)
{
    if(this.json!=null && this.json[variable]!=null)
        return this.json[variable];
    return null;
}
//**
var ItemObject = function (json)
{
    BaseObject.call(this,json);
    this.id = json.id;
    
}
ItemObject.prototype = Object.create(BaseObject.prototype);
ItemObject.constructor = ItemObject;

//**
var ActorObject = function (json)
{
    BaseObject.call(this,json);
    this.bind = [];
}
ActorObject.prototype = Object.create(BaseObject.prototype);
ActorObject.constructor = ActorObject;
//**
var QuestObject = function (json)
{
    BaseObject.call(this,json);
}
QuestObject.prototype = Object.create(BaseObject.prototype);
QuestObject.constructor = QuestObject;

Object.defineProperty(QuestObject, "value", {
    get: function() {return this._value },
    set: function(v) { this._value = v; this.OnChangeSignal.dispatch([this]); }//throw on change
});

//**
var VariableObject = function (json)
{
    BaseObject.call(this,json);    
    this.id = json.id;
    this.name = json.Name;
    this._value = json["Initial Value"];
    this.description = json.Description;
};

//
VariableObject.prototype = Object.create(BaseObject.prototype);
VariableObject.constructor = VariableObject;

Object.defineProperty(VariableObject, "value", {
    get: function() {return this._value },
    set: function(v) { this._value = v; this.OnChangeSignal.dispatch([this]); }//throw on change
});

/*
    this.OnChangeEvent;
};
BaseObject.prototype.registerOnChange = function(id,func,callee,params)
{
    this.OnChangeEvent = this.OnChangeEvent || [];
    this.OnChangeEvent.push({func:func, para:params, callee:callee});
};
//async this?
BaseObject.prototype.doOnChangeEvent = function()
{
    if(this.OnChangeEvent.length>0)
    {
        for(var i=0;i<this.OnChangeEvent.length;i++)
        {
            if(this.OnChangeEvent[i])
            {
               this.OnChangeEvent[i].func.apply(this.OnChangeEvent[i].callee,[this.OnChangeEvent[i].para]);
            }
        }
    }
}*/
//actors and items on map with actor set will register with this class
//invetory? ui?
//quests ui will pull from this
//
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
//
var HexHandler = function (maingame, game, hexagonWidth, hexagonHeight) 
{
    this.maingame = maingame;
    this.game = game;
    this.debug = true;
    
    //for flood fill
    this.visited = [];
    this.fringes = [];
    
    this.hexagonArray = [];
    //this.columns = [Math.ceil(this.gridSizeX/2),Math.floor(this.gridSizeX/2)];//needed?
    
    this.waterTilesArray = [];//should be moved out into tile graphics handler
    
    this.hexagonWidth = hexagonWidth || 32;
    this.hexagonHeight = hexagonHeight || 16;

    this.sectorWidth = this.hexagonWidth;
    this.sectorHeight = this.hexagonHeight/4*3;
    
    this.halfHex = this.hexagonWidth/2;
    this.halfHexHeight = this.hexagonHeight/2;
    this.gradient = (this.hexagonHeight/4)/(this.hexagonWidth/2);

    var sprite = new Phaser.Image(game,0,0,"tiles2","hextiletouchmap.png");
    this.touchmap = new Phaser.BitmapData (game,"touchmap",56, 16);
	this.touchmap.draw(sprite, 0, 0);
	this.touchmap.update();
};
HexHandler.prototype.update=function(elapsedTime)
{
    if(this.waterTilesArray)
    {
        var length = this.waterTilesArray.length;
        for(var i = 0; i < length; i ++)
        {
            this.waterTilesArray[i].step(elapsedTime);
        }
    }
}

HexHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;

    var deltaX = (checkx)%this.sectorWidth;
    var deltaY = (checky)%this.sectorHeight; 

    var candidateX = Math.floor((checkx)/this.sectorWidth);
    var candidateY = Math.floor((checky)/this.sectorHeight);
    
    if(candidateY%2==0){
        if(deltaY<((this.hexagonHeight/4)-deltaX*this.gradient)){
            candidateX--;
            candidateY--;
        }
        if(deltaY<((-this.hexagonHeight/4)+deltaX*this.gradient)){
            candidateY--;
        }
    }    
    else{
        if(deltaX>=this.hexagonWidth/2){
            if(deltaY<(this.hexagonHeight/2-deltaX*this.gradient)){
                candidateY--;
            }
        }
        else{
            if(deltaY<deltaX*this.gradient){
                candidateY--;
            }
            else{
                candidateX--;
            }
        }
    }
    if(this.maingame.gridSizeY%2==0 && candidateY%2==1)
    {
       //candidateX++;
        if(candidateX<0)
            candidateX = 0;
    }
    if(candidateX<0 || candidateY<0 || candidateY>=this.maingame.gridSizeY || candidateX>=this.maingame.gridSizeX)
    {
        return;
    }
    return this.hexagonArray[candidateX][candidateY]
 }
HexHandler.prototype.getTileByCords = function(x,y)
{
    if(this.hexagonArray[x])
        if(this.hexagonArray[x][y])
            return this.hexagonArray[x][y];
    return null;
}
        
//Returns tile that hits. 
HexHandler.prototype.lineTest = function(tilestart, tileend)
{
    var p0 = new Point(tilestart.x+this.halfHex, tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, tileend.y+this.halfHexHeight);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = this.game.math.ceil(N/this.cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    for(var i=0;i<points.length;i++){
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null){
            if(!overtile.walkable)
                return overtile;
        }
        else
            return null;
    }
    return tileend;
};
//
HexHandler.prototype.dolines = function(tilestart, tileend, ignoreWalkable, highlight)
{
    if(tilestart==null||tileend==null)
        return;
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);
    //
    if(this.debug)
    {
        this.maingame.graphics.clear();
        this.maingame.graphics.lineStyle(10, 0xffd900, 1);
       // this.maingame.graphics.moveTo(tilestart.x+ this.maingame.mapGroup.x+ this.halfHex, tilestart.y+ this.maingame.mapGroup.y+ this.halfHexHeight);
       // this.maingame.graphics.lineTo(tileend.x+ this.maingame.mapGroup.x+ this.halfHex, tileend.y+ this.maingame.mapGroup.y+ this.halfHexHeight);
    }
    //
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = this.game.math.ceil(N/cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    if(this.debug)
    {
        this.maingame.graphics.lineStyle(0);
        this.maingame.graphics.beginFill(0x00FF0B, 0.5);
    }
    var pasttile = null
    if(highlight)
        highlight.cleanuptiles();
    //points.reverse();
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(this.debug)
        {
            this.maingame.graphics.drawCircle(points[i].x+this.maingame.mapGroup.x,points[i].y+this.maingame.mapGroup.y, 10);
        }
        if(overtile!=null)
        {
            if(!overtile.walkable&&!ignoreWalkable)
            {
                break;
            }
            tiles.push(overtile);
            if(highlight)
                highlight.highlighttilebytile(i,overtile);//debug
        }
    }
    if(this.debug)
        this.maingame.graphics.endFill();
    //  
    return tiles;
};
HexHandler.prototype.getlinepath = function(tilestart, tileend, ignoreWalkable)
{
    if(tilestart==null||tileend==null)
        return;
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = this.game.math.ceil(N/cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    var pasttile = null
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null)
        {
            if(!overtile.walkable&&!ignoreWalkable)
            {
                break;
            }
            tiles.push(overtile);
        }
    }
    //  
    return tiles;
};
HexHandler.prototype.round_point = function(p) {
    return new Point(Math.round(p.x), Math.round(p.y));
};
HexHandler.prototype.lerp = function(start, end, t) {
    return start + t * (end-start);
};
HexHandler.prototype.lerp_point = function(p0, p1, t) {
    return new Point(this.lerp(p0.x, p1.x, t),
                     this.lerp(p0.y, p1.y, t));
};     
//
HexHandler.prototype.doFloodFill = function(tile,range)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    this.fringes.push([tile]);
    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            if(n.posx % 2 == 1)
            {
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, -1,   0 ,k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1,k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, 1,   -1, k);
            }
        }
    }
    return this.fringes;
};
HexHandler.prototype.addNeighbor=function(fromtile,x,y,k)
{
    x = fromtile.posx+x;
    y = fromtile.posy+y;
    var tile = this.getTileByCords(x,y);
    if(tile!=null)
    {
        //console.log(tile,tile.walkable);
        if(tile.walkable&&this.visited.indexOf(tile)==-1)
        {
            this.visited.push(tile);
            this.fringes[k].push(tile);
        }
    }
};
HexHandler.prototype.getFrigesAsArray=function()
{
    var tempArray = [];
    for(var i=0;i<fridges.length;i++)
    {
        for(var j=0;j<fridges[i].length;j++)
        {
            tempArray.push(fridges[i][j]);
        }
    }
    return tempArray;
};
//
HexHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    var posx = starttile.x-testtile.x;
    var posy = starttile.y-testtile.y;
    //
    //console.log("HexHandler",posx,posy);
    //
    if(starttile.x % 2 == 1)
    {
        if(posx==0&&posy==-1)return true;
        if(posx==-1&&posy==0 )return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==-1&&posy==1)return true;
    }
    else
    {
        if(posx==-1&&posy==-1)return true;
        if(posx==-1&&posy==0)return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==0&&posy==-1)return true;
        if(posx==1&&posy==-1)return true;
    }
    return false;
}
//currenttile should be last, if any tiles exist in path then that becomes the whole path
HexHandler.prototype.findClosesInPath = function(currenttile, tiles, path)
{
    var lowestj = -1;
    var lowesti = -1;
    for(var i=path.length;i>0;i--){
        for(var j = 0; j<tiles.length; j++){
            if(path[i]===tiles[j]){
                lowesti = i;
                lowestj = j;
            }
        }
    }
    if(lowesti!=-1){
        path = path.splice(lowesti,path.length-lowesti);
        return tiles[j];
    }
    else{
        return currenttile;
    }
}
HexHandler.prototype.pathCoordsToTiles = function(path)
{
    newpath = [];
    for(var i=0;i<path.length;i++)
    {
        var overtile = this.getTileByCords(path[i].x,path[i].y);
        if(overtile!=null)
        {
            newpath.push(overtile);
        }
    }
    return newpath;
}
HexHandler.prototype.flush=function()
{
    this.hexagonArray = [];
    this.waterTilesArray = [];
    //this.walkableArray = [];
}
/*
    Hex = 1,//
	Iso = 2,//
	HexIsoFallout = 4,//
	HexIsoFalloutStaggard = 8,//
	HexIso = 16,//?
	Square = 32
*/
/*HexHandler.GetMapCoords = function(type,coords,width,height,i,j)
{
    //flip y over unity
    if(type=="Hex")
    {
        coords.x = width*i;
        coords.x += width/2*(j%2);
        
        coords.y = (height/4*3)*j;
    }
    else if(type=="HexIso")
    {
        var offset = Math.floor(i/2);
        coords.x = width*i + width/2*j;
        coords.y = (height/4*3)*j; 

        coords.x -= width/2 * offset;
        coords.y -= (height/4*3) * offset;
    }
    else if(type=="HexIsoFallout")
    {
        coords.x = 48 * i + 32 * j;
        coords.y = -24 * j + 12 * i;
        coords.y *= -1;
        //offset
        coords.x += 16;
        coords.y -= 4;
    }
}*/
// 
var DiamondHexHandler = function (maingame, game, hexagonWidth, hexagonHeight) 
{
    HexHandler.call(this, maingame, game, hexagonWidth, hexagonHeight);
}
DiamondHexHandler.prototype = Object.create(HexHandler.prototype);
DiamondHexHandler.constructor = DiamondHexHandler;
//inside triangle test
//http://www.emanueleferonato.com/2012/06/18/algorithm-to-determine-if-a-point-is-inside-a-triangle-with-mathematics-no-hit-test-involved/
DiamondHexHandler.prototype.isInsideTriangle=function(A,B,C,P){
    var planeAB = (A.x-P.x)*(B.y-P.y)-(B.x-P.x)*(A.y-P.y);
    var planeBC = (B.x-P.x)*(C.y-P.y)-(C.x - P.x)*(B.y-P.y);
    var planeCA = (C.x-P.x)*(A.y-P.y)-(A.x - P.x)*(C.y-P.y);
    return this.sign(planeAB)==this.sign(planeBC) && this.sign(planeBC)==this.sign(planeCA);
}
DiamondHexHandler.prototype.sign = function(n){
			return Math.abs(n)/n;
}
//
DiamondHexHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    //
    var width = this.hexagonWidth;
    var height = this.hexagonHeight/4*3;
    
    var i = checkx/width - checky/(2*height);
    var j = checky/height + Math.floor(i/2);

    //console.log(checkx,checky,i,j);
    
    i = Math.floor(i);
    j = Math.floor(j);

    if(i<0 || j<0 || j>=this.maingame.movementgrid.gridSizeY || i>=this.maingame.movementgrid.gridSizeX)
    {
        return;
    }
    var tile = this.hexagonArray[i][j];
    //
    //var isInside = this.isInsideTriangle(new Point(tile.x,tile.y),new Point(tile.x+24,tile.y+16),new Point(tile.x,tile.y+16),new Point(checkx,checky));
    //console.log(isInside);
    if(tile==null)
        return;
    
    var hex = this.touchmap.getPixel32(checkx-tile.x, checky-tile.y);
    var r = ( hex       ) & 0xFF; // get the r
    var g = ( hex >>  8 ) & 0xFF; // get the g
    var b = ( hex >> 16 ) & 0xFF; // get the b
    
    if(r>0&&g>0&&b>0||r==0&&g==0&&b==0)//end because on white or nothing (nothing?)
        return tile;
    
    if(r==0&&g>0&&b>0)//go right
    {
        //console.log("r");
        if(i%2==0){
            i++;
        }
        else{
            i++;
            j++;
        }
    }
    else if(r>0&&g==0&&b==0)//up left
    {
        //console.log("1");
        j--;
    }
    else if(r>0&&g>0&&b==0)//up right
    {
        //console.log("2");
        if(i%2==0){
            i++;
            j--;
        }
        else{
            i++;
        }
    }
    else if(r==0&&g>0&&b==0)//down left
    {
        //console.log("3");
        if(i%2==0){
            i--;
        }
        else{
            i--;
            j--;
        }
    }
    else if(r==0&&g==0&&b>0)//down right
    {
        //console.log("4");
        j++;
    }
    else
    {
        //console.log(r,g,b);
    }
    if(i<0 || j<0 || j>=this.maingame.movementgrid.gridSizeY || i>=this.maingame.movementgrid.gridSizeX)
    {
        return;
    }
    //console.log(i,j,this.maingame.movementgrid.gridSizeY,this.maingame.movementgrid.gridSizeX);
    tile = this.hexagonArray[i][j]; 
    return tile;
 }
DiamondHexHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    if(starttile==null||testtile==null)
        return false;
    var posx = starttile.posx-testtile.posx;
    var posy = starttile.posy-testtile.posy;
    //
    //console.log("DiamondHexHandler",posx,posy);
    //
    if(starttile==testtile)
        return true;
    if(starttile.x % 2 == 1)
    {
        if(posx==0&&posy==-1)return true;
        if(posx==-1&&posy==0 )return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==-1&&posy==1)return true;
    }
    else
    {
        if(posx==-1&&posy==-1)return true;
        if(posx==-1&&posy==0)return true;
        if(posx==0&&posy==1)return true;
        if(posx==1&&posy==0)return true;
        if(posx==0&&posy==-1)return true;
        if(posx==1&&posy==-1)return true;
    }
    return false;
}
DiamondHexHandler.prototype.doFloodFill = function(tile,range)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    this.fringes.push([tile]);
    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            if(n.posx % 2 == 1)
            {
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, -1,   0 ,k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1,k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1,k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1,k);
                this.addNeighbor(n, 1,   -1, k);
            }
        }
    }
    return this.fringes;
};
/*
for grid:
http://fifengine.net/fifesvnrepo/tags/2007.1/src/engine/map/gridgeometry.cpp
for hex:
http://fifengine.net/websvn/filedetails.php?repname=fife&path=/trunk/core/src/engine/map/hexgeometry.cpp&rev=870&peg=875&template=BlueGrey
Point HexGeometry::toScreen(const Point& pos) const {
        int32_t w  = m_basesize.x;
        int32_t h  = m_basesize.y;
        int32_t dx  = m_transform.x;
        int32_t dy  = m_transform.y;
        return Point(m_offset.x - (pos.x*w - (pos.x/2)*dx - pos.y * h),
                 m_offset.y + (pos.x/2)*dy + pos.y*dy);
}

Point HexGeometry::fromScreen(const Point& pos) const {
        int32_t dx  = m_transform.x;
        int32_t dy  = m_transform.y;

        Point p2((pos.x - m_offset.x)/(-dx), (pos.y - m_offset.y)/dy);
        p2.x = (p2.x + p2.y)/2;
        p2.y = p2.y - p2.x/2;
        return p2;
}

*/
var HighlightHex = function (game, maingame, hexhandler)
{
    Phaser.Group.call(this, game, null);
    this.game = game;
    this.maingame = maingame;
    
    this.hexhandler = hexhandler;
    this.showNumbers = true;
    
    this.neighborLights = [];
    
    this.showPath = true;//set this false to cancel any callbacks being shown
}
HighlightHex.prototype = Object.create(Phaser.Group.prototype);
HighlightHex.constructor = HighlightHex;

HighlightHex.prototype.setup = function() 
{
    this.neighborLights = [];
    for(var i=0;i<40;i++)
    {
        var light = this.add(new Phaser.Group(this.game,null));
        var high = this.add(new Phaser.Sprite(this.game, 0,0, "tiles2", "tile_highlight0005.png"));
        this.neighborLights.push(light);
        light.add(high);
        this.add(light);
        
        if(this.showNumbers)
        {
         /*   var hexagonText = new Text(this.game, 25,25, i+"",{});
            hexagonText.font = "arial";
            hexagonText.fontSize = 12;
            light.add(hexagonText);
            light.x = -1000;*/
        }
        light.x = -1000;
        light.visible = false;
    }
}
//
HighlightHex.prototype.drawFringes = function(fringes) 
{
    if(fringes==null)
        return;
    //console.log(fringes);
    this.cleanuptiles();
    var tempArray = [];
    for(var i=0;i<fringes.length;i++)
    {
        for(var j=0;j<fringes[i].length;j++)
        {
            tempArray.push(fringes[i][j]);
        }
    }
    for(var i=0;i<tempArray.length;i++)
    {
        this.highlighttilebytile(i,tempArray[i]);
    }
}
//
HighlightHex.prototype.doShowPath = function(pathfinder, fromtile, totile) 
{
    if(totile!=null)
    {
        if(fromtile)
        {
            this.showPath = true;
            pathfinder.setCallbackFunction(this.showPathCallback, this);
            pathfinder.preparePathCalculation( [fromtile.posx,fromtile.posy], [totile.posx,totile.posy] );
            pathfinder.calculatePath();
        }
    }
}
//
HighlightHex.prototype.showPathCallback = function(path) 
{
    if(!this.showPath)
        return;
    this.cleanuptiles();
    for(var i=0;i<path.length;i++)
    {
        var overtile = this.hexhandler.getTileByCords(path[i].x,path[i].y);
        if(overtile!=null)
        {
            //if(!overtile.walkable);//&&!ignoreWalkable)
            //    break;
            //tiles.push(overtile);
            this.highlighttilebytile(i,overtile);
        }
    }
}
HighlightHex.prototype.hidePath = function() 
{
    this.showPath = false;
}
//debug calls
HighlightHex.prototype.drawDebugLine = function(fromtile, totile) 
{
    if(moveIndex&&totile)
    {
        this.hexHandler.dolines(fromtile,totile,false, this);
    }
}
HighlightHex.prototype.highilightneighbors = function(thistile) 
{
    /*if(this.game.global.pause)
    {
        return;
    }
    var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.hexagonGroup.x,this.input.worldY-this.hexagonGroup.y);*/
    if(thistile==null)
        return;
    //if(thistile.posy % 2 == 1)
    //if(false)
    if(thistile.posx % 2 == 1)
    {
        this.highlighttileoffset(0, 0,    -1, thistile);
        this.highlighttileoffset(1, -1,   0, thistile);
        this.highlighttileoffset(2, 0,    +1, thistile);
        this.highlighttileoffset(3, +1,   +1, thistile);
        this.highlighttileoffset(4, +1,   0, thistile);
        this.highlighttileoffset(5, -1,   1, thistile);
        //this.highlighttileoffset(5, 1,   -1, thistile);
    }
    else
    {
        this.highlighttileoffset(0, -1,   -1, thistile);
        this.highlighttileoffset(1, -1,   0, thistile);
        this.highlighttileoffset(2, 0,    +1, thistile);
        this.highlighttileoffset(3, +1,   0, thistile);
        this.highlighttileoffset(4, 0,    -1, thistile);
        this.highlighttileoffset(5, 1,   -1, thistile);
        //this.highlighttileoffset(5, -1,   1, thistile);
    }
}
//
HighlightHex.prototype.highlighttileoffset = function(i,x,y,currenttile)
{
    
    var thetile = this.hexhandler.getTileByCords(currenttile.posx+x,currenttile.posy+y);
    if(thetile!=null)
    {
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = thetile.x;
        this.neighborLights[i].y = thetile.y;
    }
}
HighlightHex.prototype.cleanuptiles = function()
{
    for(var i=0;i<this.neighborLights.length;i++)
    {
        this.neighborLights[i].x = -1000;
        this.neighborLights[i].visible = false;
    }
}
HighlightHex.prototype.highlighttilebytile = function(i,currenttile)
{
    if(this.neighborLights[i]==null)
        return;
    if(currenttile!=null)
    {
        //console.log(i,currenttile);
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = currenttile.x;
        this.neighborLights[i].y = currenttile.y;
    }
    else
    {
        this.neighborLights[i].x = -1000;
        this.neighborLights[i].y = 0;
    }
}
/*
this.jsondata.destroyed - object has been destroy

//move?, state?
//seperate the graphics from the data

//need to remember where they are and what state they are in for scene changes

extra states
state
destroyed - if destroyed don't recreate on enter


*/
var InteractiveObject = function (maingame, jsondata) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    
    this.jsondata = jsondata;

    //this.jsondata.state = "idle";    
    this.posx;//sprite locations
    this.posy;
    this.currentTile;//moveable location
    this.hasstates = false;
    this.eventDispatcher = new EventDispatcher(this.game,this.maingame,this);
}
InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = InteractiveObject;

InteractiveObject.prototype.dosetup = function() 
{
    this.eventDispatcher.init(this.jsondata.triggers);
   
    this.setupArt(this.jsondata);
    this.footprint;//
    //this.events.onInputDown.add(this.handleClick, this);    
    this.setupReactToAction();
    this.inputEnabled = true;
    //
    var actions = this.jsondata.triggers;
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actorset")
        {
            this.actor = this.maingame.globalHandler.getActorByID(actions[i].id);
            //maingame.globalHandler.getActorByID
        }
        if(actions[i].type=="walkTiles")
        {
            this.footprint = [];
            for(var j=0;j<actions[i].tiles.length;j++)
            {
                this.footprint.push(this.maingame.hexHandler.getTileByCords(actions[i].tiles[j].posx,actions[i].tiles[j].posy));
            }
        }
        if(actions[i].type=="animations")
        {
            var animations = actions[i].animations;
            var tempanimation;
            var complete;
            this.hasstates = true;
            for(var j=0;j<animations.length;j++)
            {
                if(animations[j].start==0&&animations[j].stop==0){
                    tempanimation = this.animations.add(animations[j].id,[animations[j].name+".png"], 1, animations[j].loop, false);
                }
                else{
                    tempanimation =  this.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(animations[j].name, animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
                }
                if(animations[j].onComplete)
                {
                    tempanimation.onComplete.add(function () {
                        this.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
                    }, {stateNum:j,caller:this});
                }
            }
        }
    }
    if(this.actor&&this.actor.getValue("state")!=""){
        this.changeState(this.actor.getValue("state"));
    }
    else{
        this.changeState(this.jsondata.state);
    }
    //
    //
    //this will move
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnActivate");
    //
    this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
    //get tile? these tiles don't exists
    //this.finalSetup();
}
InteractiveObject.prototype.finalSetup = function()     
{
}
//
//  
InteractiveObject.prototype.changeState = function(newstate) 
{
    //need to test if state exists
    
    if(this.hasstates)
    {
        var nextAnimation = this.animations.getAnimation(newstate);
        if(nextAnimation)
        {
            this.animations.play(newstate);
            if(this.actor)
                this.actor.updateValue("state",newstate);
            this.jsondata.state = newstate;
        }
        else
        {
            console.log(this,newstate,"state doesn't exist.");
        }
    }
    else
    {
        this.jsondata.state = newstate;
    }
}
InteractiveObject.prototype.testTHISValues = function(variablein,compare,value)
{
    var variable = this[variablein];
    if(variable==null||variable==undefined)
    {
        variable = this.jsondata[variablein];
    }
    if(compare=="Is")
        return (variable == value);
    if(compare=="IsNot")
        return (variable != value);
    if(compare=="Less")
        return (variable < value);
    if(compare=="Greater")
        return (variable > value);
    if(compare=="LessEqual")
        return (variable <= value);
    if(compare=="GreaterEqual")
        return (variable >= value);
    return false;
}
InteractiveObject.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = this[fnstring];
    fnparams = fnparams.split(',');
    if (typeof fn === "function") {
        fn.apply(this, fnparams);
    }
}
InteractiveObject.prototype.moveto = function(tox,toy) 
{
    if(tox!=null)
        var tile = this.maingame.hexHandler.getTileByCords(tox,toy);
    if(tile)
    {
        var currenttile = this.maingame.hexHandler.checkHex(this.x,this.y);
        currenttile.changeWalkable(true);
        this.x = tile.x;
        this.y = tile.y;
        tile.changeWalkable(false);
        this.updateLocation(tile);
    }
    //
    this.handleOut();
}
InteractiveObject.prototype.areWeNeighbours = function(fromtile)
{
    if(this.footprint){
        for(var i=0;i<this.footprint.length;i++){
            if(fromtile==this.footprint[i])
                return true;
            if(this.maingame.hexHandler.areTilesNeighbors(this.footprint[i],fromtile))
                return true;
        }
    }
    if(fromtile==this.currentTile)
        return true;
    if(this.maingame.hexHandler.areTilesNeighbors(this.currentTile,fromtile))
        return true;
    return false;
}
InteractiveObject.prototype.updateLocation = function(tile)
{
    this.jsondata.x = tile.posx;
    this.jsondata.y = tile.posy;
    
    //moving characters should always be in middle
    //this.jsondata.posx = tile.x;
    //this.jsondata.posy = tile.y;
}
 
InteractiveObject.prototype.destroySelf = function(elapseTime) 
{
    this.jsondata.destroyed = true;
    this.eventDispatcher.destroy();
    this.events.onInputUp.remove(this.handleClick, this);  
    this.events.onInputOver.remove(this.handleOver, this);//for rollover
    this.events.onInputOut.remove(this.handleOut, this);
    this.destroy();
}
InteractiveObject.prototype.handleOver = function() 
{
    this.tint = 0x00ffff;
    if(this.jsondata.displayName!="")
    {
        this.maingame.showRollover(this);
    }
}
InteractiveObject.prototype.handleOut = function() 
{
    this.tint = 0xffffff;
    if(this.maingame.rollovertext)
        this.maingame.rollovertext.visible = false;
}
//
InteractiveObject.prototype.setWalkable = function(walkableto) 
{
    
    if(this.footprint)
    {
        for(var i=0;i<this.footprint.length;i++)
        {
            
            this.footprint[i].changeWalkable(walkableto);
        }
    }
    else
    {
        this.currentTile.changeWalkable(walkableto);
    }
}
//
InteractiveObject.prototype.step = function(elapseTime) 
{
}
InteractiveObject.prototype.setupReactToAction = function() 
{
    this.events.onInputUp.add(this.handleClick, this);
    this.events.onInputOver.add(this.handleOver, this);//for rollover
    this.events.onInputOut.add(this.handleOut, this);
}
InteractiveObject.prototype.handleClick = function() 
{
    if(GlobalEvents.currentacion == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentacion == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch");
    else if(GlobalEvents.currentacion == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook");
    else if(GlobalEvents.currentacion == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk");
    else if(GlobalEvents.currentacion == GlobalEvents.ITEM)
        this.eventDispatcher.doAction("OnUseItem");
    
    this.handleOut();
}
InteractiveObject.prototype.setupArt = function(json) 
{
    var objectreference = this.maingame.getTile(this.jsondata.name,this.jsondata.tilesetid);
    var spotx = this.jsondata.x || 0;
    var spoty = this.jsondata.y || 0;
    var offsetx = this.jsondata.offsetx || 0.5;
    var offsety = this.jsondata.offsetx || 0.5;
    var tile = this.maingame.hexHandler.getTileByCords(spotx,spoty);
    
      //  objects[i].x + 16, 
    //    objects[i].y*-1 + 16
    

    Phaser.Sprite.call(this, this.game, 
                       spotx + 16, 
                        spoty*-1 + 16,
                       //offsetx*this.maingame.hexHandler.hexagonWidth + this.maingame.mapGroup.x,// + tile.x,
                       //offsety*this.maingame.hexHandler.hexagonHeight + this.maingame.mapGroup.y,// + tile.y, 
                       objectreference.spritesheet, objectreference.tile+".png");
    this.maingame.objectGroup.add(this);
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
}
/*

function playWhenFinished(name) {
  // is this sprite currently animating?
  if (sprite.isPlaying) {
    // yes, so play the next animation when this one has finished
    sprite.animations.onComplete.addOnce(function() {
      sprite.animations.play(name, 30, false);
    }, this);
  }
  else {
    // no, so play the next animation now
    sprite.animations.play(name, 30, false);  
  }
}
 
 */
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
    var bg = this.game.make.sprite(0,0,"dialogui","inventory_bg.png");
    this.add(bg);    
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
}
InventoryGraphics.prototype = Object.create(Phaser.Group.prototype);
InventoryGraphics.constructor = InventoryGraphics;
//
InventoryGraphics.prototype.makeReturn = function(value) {
    return function () {
        this.itemChanged(value);
    };
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
    var newitem = new InventoryObject(this.game, "dialogui", item.getValue("InventoryGraphicName")+".png", item);
    this.add(newitem);
    this.currentitems.push(newitem);
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
var InventoryObject = function(game, spritesheet, sprite, item)
{
    Phaser.Image.call(this, game, 0,0, spritesheet,sprite);   
    this.item = item;
    this.events.onInputDown.add(this.handleClick, this);
    this.inputEnabled = true;
}
InventoryObject.prototype = Object.create(Phaser.Image.prototype);
InventoryObject.constructor = InventoryObject;

InventoryObject.prototype.handleClick = function(){
    GlobalEvents.currentacion = GlobalEvents.ITEM;
    GlobalEvents.selectedItem = this.item;
}


BasicGame.Game = function (game) {
    
    this.playerCharacter;//Controlled Character
    this.playerHex;//current hex under player
    
    this.diagpanel;//Dialog UI;
    this.justTextPopup;//Single text display
    this.barkHandler;
    this.activeButtons;//Action Buttons ui
    
    this.neighborLights = [];

    this.hexHandler;//hex helper functions
    this.highlightHex;
    this.pathfinder;//a* searcher
    
    this.graphics;//drawable
    
    //groups
    this.mapGroup;
    
    this.uiGroup;
    this.objectGroup;
    this.highlightGroup;
    this.hexagonGroup;
    

    this.interactiveObjects = [];
    this.startpos;

    this.mapData;
    this.globalHandler;
    this.inventory;
    
    this.walkableArray;
    this.maskableobjects;
    this.updatewalkable = false;
    
    this.fps;
    
    this.tiletest;
    this.masker;
    
    this.movementgrid;
    this.spritegrid;
    
    this.rollovertext;
    this.highlightArray;
    
    this.dragScreen = false;
    this.dragPoint = new Point(0,0);
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        this.load.json('map', 'assets/forestmap.json');
    },
    create: function () {
        
        
        
        this.stage.backgroundColor = "#444444"
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
       
        this.interactiveObjects = [];
        this.uiGroup = this.add.group();
        //
        this.mapData = this.game.cache.getJSON('map');
        //
        
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        
        this.startpos = this.mapData.startPos;//.split("_");
        var currentmap = this.mapData.maps[this.startpos.map];
        this.createMapTiles(currentmap);
        //
        this.dialoghandler = new DialogHandler(this.game, this, this.mapData.data.Conversations, this.mapData.data.Actors);
        //
        this.diagpanel = new DialogPanel(this.game,this,this.dialoghandler);
	    this.game.add.existing(this.diagpanel);
        this.uiGroup.add(this.diagpanel);
        this.diagpanel.setup();
        
        this.justTextPopup = new JustTextPopup(this.game,this,this.dialoghandler);
        this.game.add.existing(this.justTextPopup);
        this.uiGroup.add(this.justTextPopup);
        
        this.barkHandler = new BarkTextHandler(this.game,this);
        this.game.add.existing(this.barkHandler);
        this.uiGroup.add(this.barkHandler);
        
        this.rollovertext = this.game.make.bitmapText(0, 0, "badabb", "Text goes here.", 25);
        this.rollovertext.visible = false;
        this.game.add.existing(this.rollovertext);
        this.uiGroup.add(this.rollovertext);
        
        
        this.inventory = new InventoryGraphics(this.game,this,this.globalHandler);
	    this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        this.inventory.x = 350;
        this.inventory.y = 400;
        //this.input.addMoveCallback(this.drawLine, this); 
        //this.input.onDown.add(this.drawLine, this); 
        //MOVE
        //this.input.onOver.add(this.onOn, this);
        this.input.addMoveCallback(this.onMove, this); 
        this.input.onDown.add(this.doDragScreen, this);
        this.input.onUp.add(this.clickedHex, this);
        
        this.activeButtons = new ActionButtons(this.game, this);
        this.activeButtons.y = 400;
        this.game.add.existing(this.activeButtons);
        this.uiGroup.add(this.activeButtons);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        
        
        //this.game.time.advancedTiming = true;
        //fps = this.game.make.bitmapText(20, 0, "badabb", "---", 25);
        //this.uiGroup.add(fps);        
    },
    createMapTiles: function(passedMap){
        var hexagonArray = [];
        var waterTilesArray = [];
        //
        this.interactiveObjects = [];
        //
        this.objectGroup = this.add.group();
        this.highlightGroup = this.add.group();
        this.hexagonGroup = this.add.group();
        //
        this.mapGroup = this.add.group();
        this.mapGroup.add(this.hexagonGroup);
        this.mapGroup.add(this.highlightGroup);
        this.mapGroup.add(this.objectGroup);
        //
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        this.maskableobjects = [];
        this.walkableArray = [];
        //
        for(var mapscounter=0;mapscounter<passedMap.length;mapscounter++)
        //if(true)
        {
            //var layer1 = passedMap[1];
            var layer1 = passedMap[mapscounter];
            if(layer1.handleMovement)
                this.hexHandler = new DiamondHexHandler(this,this.game, layer1.hexWidth,layer1.hexHeight);
            
            var hexagonWidth = layer1.hexWidth;
            var hexagonHeight = layer1.hexHeight;

            var gridSizeY = layer1.height;
            var gridSizeX = layer1.width;
            var tiles = layer1.data;
            var tilesetid = layer1.tilesetid;
            var offsetx = layer1.offsetx || 0;
            var offsety = layer1.offsety || 0;
            
            if(layer1.handleMovement)
            {
                this.movementgrid = new Grid(layer1);
            }
            if(layer1.handleSprite)
            {
                this.spritegrid = new Grid(layer1);
            }
            
            var objectName;
            var tilereference;
            var temptile;            
            var tempPoint = new Point(0,0);
            var offset = 0;
            
            //
            if(layer1.handleSprite)
            {
                for(var i = 0; i < gridSizeX; i ++)
                {
                    
                    if(layer1.handleMovement)
                        hexagonArray[i] = [];
                    for(var j = 0; j < gridSizeY; j ++)
                    {
                        objectName = tiles[j*gridSizeX+i];
                        tilereference = this.getTile(objectName,tilesetid);
                        tempPoint = this.spritegrid.GetMapCoords(i,j);
                        
                        if(layer1.handleMovement)//make tile
                        {
                            temptile = new WalkableTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this);
                            hexagonArray[i][j]=temptile;//only if same
                        }
                        else
                        {
                            temptile = new GraphicTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this);
                        }
                        this.hexagonGroup.add(temptile);
                        //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                    }
                }
            }
            //
            highlightArray = [];
            if(layer1.handleMovement)
            { 
                for(var i = 0; i < gridSizeX; i ++)
                {
                    if(!layer1.handleSprite)
                    {
                        hexagonArray[i] = [];
                        highlightArray[i] = [];
                    }
                    this.walkableArray[i] = [];
                    for(var j = 0; j < gridSizeY; j ++)
                    {
                        this.walkableArray[i][j] = layer1.walkable[j*gridSizeX+i];
                        if(!layer1.handleSprite)//no sprite - need to something to select (this might not need to be destroyed)
                        {
                            tempPoint = this.movementgrid.GetMapCoords(i,j);
                            hexagonArray[i][j] = new SimpleTile(this,i,j,tempPoint.x,tempPoint.y);
                            
                            //this needs to be switched out
                            if(this.game.global.showmovetile)
                            {
                                var tile = new GraphicTile(this, "tile_highlight0002.png", "tiles2", i, j, tempPoint.x, tempPoint.y, this);
                                if(this.walkableArray[i][j]==0)
                                    tile.tint = 0xff0000;
                                    
                                highlightArray[i][j] = tile;
                                this.highlightGroup.add(tile);
                                this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                            }
                            //
                        }
                        if(this.walkableArray[i][j] == 0)
                        {                    
                            hexagonArray[i][j].walkable = false;
                        }
                    }
                }
            }
            if(layer1.objects)
            {
                var objects = layer1.objects;
                var spotx,spoty;
                for(var i = 0; i < objects.length; i ++)
                {
                    if(objects[i].triggers)//if have actions then is an interactive object
                    {
                        if(!objects[i].destroyed)//object has been destroyed
                        {
                            var interactiveobject = new InteractiveObject(this, objects[i]);
                            this.interactiveObjects.push(interactiveobject);
                            
                            interactiveobject.posx = objects[i].posx;
                            interactiveobject.posy = objects[i].posy;
                        }
                    }
                    else
                    {
                        var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                        spotx = objects[i].x;
                        spoty = objects[i].y;
                        //
                        var tileobject = new SimpleObject(this.game,objects[i].x + 16, 
                                                               objects[i].y*-1 + 16, 
                                                               objectreference.spritesheet, objectreference.tile+".png");
                        tileobject.posx = objects[i].posx;
                        tileobject.posy = objects[i].posy;
                        //
                        this.objectGroup.add(tileobject);
                        tileobject.anchor.x = 0.5;
                        tileobject.anchor.y = 1.0; 
                        
                        if(objects[i].maskable){//maskable objects to check when player/mouse move
                            this.maskableobjects.push(tileobject);
                            //console.log(this.maskableobjects);
                        }
                    }
                }
            }
            var actionSpots = layer1.actionSpots;
            if(actionSpots)
            {
                for(var i = 0; i < actionSpots.length; i ++)
                {
                    var selectedtile = hexagonArray[actionSpots[i].x][actionSpots[i].y];
                    if(selectedtile)
                    {
                        if(!selectedtile.eventDispatcher)
                        {
                            selectedtile.eventDispatcher = new EventDispatcher(this.game,this,selectedtile);
                        }
                        selectedtile.eventDispatcher.receiveData(actionSpots[i].triggers);
                    }
                }
            }
        }
        //
        this.hexHandler.hexagonArray = hexagonArray;
        this.hexHandler.waterTilesArray = waterTilesArray;
        //these should be screen width and height
		this.mapGroup.y = (440-hexagonHeight*Math.ceil(gridSizeY/2))/2;
      
        //if(gridSizeY%2==0){
        //    this.mapGroup.y-=hexagonHeight/4;
        //}
        this.mapGroup.x = 0;//(900-Math.ceil(gridSizeX)*hexagonWidth)/2;
        //if(gridSizeX%2==0){
        //    this.mapGroup.x-=hexagonWidth/8;
        //}
        //
        this.highlightHex = new HighlightHex(this.game, this, this.hexHandler);
        //this.game.add.existing(this.highlightHex);
        this.highlightHex.setup();
        this.highlightGroup.add(this.highlightHex);
                
        //
        //console.log(this.game);
        for(var i=0;i<this.interactiveObjects.length;i++)
        {
            if(this.interactiveObjects[i])
                this.interactiveObjects[i].dosetup();
        }
        //create player
        if(!this.playerCharacter)
        {
            this.playerCharacter = new PlayerCharacter(this, this.mapData.Player);
            this.game.add.existing(this.playerCharacter);
            this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y]);
        }
        this.objectGroup.add(this.playerCharacter);
       
        
        this.pathfinder.setGrid(this.walkableArray, [1]);
        this.masker = new CheapMasker(this.game, this, this.maskableobjects);
        //
        this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        //

    },
    customSortHexOffsetIso:function(a,b){
        //console.log(a,b);
        
        if(b.IsPlayer||a.IsPlayer)
        {
            //console.log(a.posy,b.posy,a.y,b.y);
        }
        if(a.posy==b.posy)
        {
            if(a.posx<b.posx)
            {
                return 1;
            }
            else if(a.posx>b.posx)
            {
                return -1;
            }
            else
            {
                if(a.y<b.y)
                {
                    return -1;
                }
                if(a.y>b.y)
                {
                    return 1;
                }
            }
        }
        else if(a.posy<b.posy)
        {
            return -1;
        }
        else if(a.posy>b.posy)
        {
            return 1;
        }
        return 0;
        //-1 if a > b, 1 if a < b or 0 if a === b
        //test tile
        //if same tile test y
        //test level?
    },
    addLocationTextToTile:function(x,y,width,height,i,j){
        var hexagonText = this.add.text(x+width/4,y+3,i+","+j);
        hexagonText.font = "arial";
        hexagonText.fontSize = 8;
        this.highlightGroup.add(hexagonText);
    },
    setChangeMapTile:function(selectedtile){
        var doorImage = this.game.make.sprite(0,0, "tiles","mapexit.png");
        selectedtile.addChild(doorImage);
    },
    userExit:function(data) {
        //
        this.startpos.map = data.tmap;
        this.startpos.x = data.tx;
        this.startpos.y = data.ty;
        //
        this.flushEntireMap();
        //
        var currentmap = this.mapData.maps[this.startpos.map];
        //
        GlobalEvents.flushEvents();
        this.createMapTiles(currentmap);        
    },
    flushEntireMap: function(){
        this.interactiveObjects = [];
        
        this.hexagonGroup.removeAll(true);
        this.highlightGroup.removeAll(true);
        this.objectGroup.removeAll(true);
        //
        this.playerCharacter = null;
        this.hexHandler.flush();
    },
    //
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        this.hexHandler.update(elapsedTime);
        //
        if(!this.game.global.pause)
        {
            this.playerCharacter.step(elapsedTime);
        }
        this.objectGroup.customSort (this.customSortHexOffsetIso);
        //
        if(this.updatewalkable)
        {
            this.pathfinder.setGrid(this.walkableArray, [1]);
            this.updatewalkable = false;
            if(this.game.global.showmovetile)
                this.refreshWalkablView();
        }
        this.barkHandler.step(elapsedTime);
        //this.spritegrid.PosToMap(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        this.masker.updateMasks(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        //this.masker.updateMasks(this.playerCharacter.x, this.playerCharacter.y, this.playerCharacter.posx, this.playerCharacter.posy);
        //fps.text = this.game.time.fps;
    },
    //
    showDialog:function(convid){
        //console.log("showDialog",convid);
        this.diagpanel.startDialog(convid);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },
    //this needs to be controlled by a queue?
    //if 2 are show at once, they are displayed 1 after the other
    showJustText:function(textDisplay)
    {
        //console.log("showJustText");
        this.justTextPopup.showText(textDisplay);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },
    showBark:function(object,text)
    {
        this.barkHandler.barkOverObject(object,text);
    },
    /*showJustTextDialog:function(convid)
    {
        //console.log("showJustTextDialog");
        this.justTextPopup.showTextFromHandler(convid);
        GlobalEvents.tempDisableEvents();
        this.pauseGame();
    },*/
    showRollover:function(object)
    {
        if(!this.rollovertext)
            return;
        this.rollovertext.text = object.jsondata.displayName;
        this.rollovertext.anchor.x = 0.5;
        this.rollovertext.x = object.x;
        this.rollovertext.y = object.y;
        this.rollovertext.visible = true;
        
        //if display is off the screen
    //    if(this.rollovertext.y<0){
            this.rollovertext.y = object.y + object.height;
    //    }
        this.rollovertext.tint = 0x9999ff;
    },
    moveToAction:function(object,tile,actions)
    {
        this.playerCharacter.moveToObject(object,tile,actions);
    },
    //
    pauseGame:function(){
        if(!this.game.global.pause)
        {
            this.game.global.pause = true;
            //pause everything
        }
    },
    unpauseGame:function(){
        if(this.game.global.pause)
        {
            this.game.global.pause = false;
            //unpause everything
            
            GlobalEvents.reEnableEvents();
        }
    },
    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },
    //
    onMove:function(pointer, x, y)
    {
        if(this.dragScreen)
        {
            var diffx = this.dragPoint.x-x;
            var diffy = this.dragPoint.y-y;
            
            this.dragPoint.x = x;
            this.dragPoint.y = y;

            this.mapGroup.x -= diffx;
            this.mapGroup.y -= diffy;
            
            //console.log(diffx,diffy);
            //move around
            return;
        }
        if(GlobalEvents.currentacion != GlobalEvents.WALK)
        {
            return;
        }
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.mapGroup.x,this.input.worldY-this.mapGroup.y);
        //var playertile = this.hexHandler.checkHex(this.playerCharacter.x,this.playerCharacter.y);
        if(moveIndex)
        {
            //this.tiletest.x = moveIndex.x;
            //this.tiletest.y = moveIndex.y;
        }
        //console.log(playertile);
        //console.log(playertile.posx,playertile.posy,this.playerCharacter.x,this.playerCharacter.y);
       // if(moveIndex)
        //    console.log(moveIndex.posx,moveIndex.posy);
        
        //console.log(this.input.worldX,this.mapGroup.x,this.input.worldX-this.mapGroup.x);
        
        //this.highlightHex.doShowPath(this.pathfinder,this.playerCharacter.currentTile,moveIndex);
        //this.hexHandler.dolines(playertile,moveIndex,false,this.highlightHex);
        //var fridges = this.hexHandler.doFloodFill(moveIndex,4);
        //this.highlightHex.drawFringes(fridges);
        
        this.highlightHex.highlighttilebytile(0,moveIndex);
        //this.highlightHex.highilightneighbors(moveIndex);
    },
    doDragScreen:function(pointer)
    {
        this.dragScreen = true;
        this.dragPoint.x = pointer.x;
        this.dragPoint.y = pointer.y;
    },
    clickedHex:function(pointer)
    {
        this.dragScreen = false;
        var diffx = this.dragPoint.x-pointer.x;
        var diffy = this.dragPoint.y-pointer.y;
        if(diffx!=0||diffy!=0)        //test distance did it actually drag. or do I make a drag screen button?
        {
            return;
        }
        if(GlobalEvents.currentacion != GlobalEvents.WALK)
            return;
        if(this.game.global.pause)
        {
            return;
        }
        var moveIndex =  this.hexHandler.checkHex(this.input.worldX-this.mapGroup.x, this.input.worldY-this.mapGroup.y);
        if(moveIndex!=null)
        {
            if(this.game.currentacion==this.game.WALK)
            {
                this.playerCharacter.moveto(moveIndex);
                
            }
        }
    },   
    getTile: function(name, tilesetid){
       // console.log(tilesetid,name);
        return {tile:this.mapData.tileSets[tilesetid][name], spritesheet:this.mapData.tileSets[tilesetid].tileset};
    },
    refreshWalkablView:function(){
        
        for(var i = 0; i < this.movementgrid.gridSizeX; i ++)
        { 
            for(var j = 0; j < this.movementgrid.gridSizeY; j ++)
            {
                var tile = highlightArray[i][j];
                if(this.walkableArray[i][j]==0)
                    tile.tint = 0xff00ff;
                else
                    tile.tint = 0xffffff;
            }
        }
    }
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};

/*
 if(false)//tilereference.tile=="tileWater"){
                    temptile = new WaterTile(this, tilereference.tile+".png", tilereference.spritesheet, i, j, hexagonX, hexagonY);
                    waterTilesArray.push(temptile);
                }
                else{
                */

/*
graph for touching grids
        var cords;
        var graph = this.game.add.graphics(0, 0);
        this.hexagonGroup.add(graph);
        //graph.y += this.mapGroup.y;
        cords = this.spritegrid.PosToMap(0,0);
        graph.lineStyle(10, 0xFF0000, 1.0);
        graph.beginFill(0x000000, 0.0);
        var xstart = 350;
        var ystart = 100;
/*
        for(var i=ystart;i<250;i+=25)
        {
            this.spritegrid.PosToMap(xstart,i);
            graph.lineStyle(0);
            graph.beginFill(0xFFFF0B, 0.5);
            graph.drawCircle(xstart+16,i,10);
            console.log(cords.x,cords.y);
            graph.endFill();
        }*/
        /*
        for(var i=xstart;i<xstart+250;i+=25)
        {
            //this.spritegrid.PosToMap(i-40,ystart-16);
            this.spritegrid.PosToMap(i,ystart);
            graph.lineStyle(0);
            graph.beginFill(0xFFFF0B, 0.5);
            graph.drawCircle(i,ystart,10);
            console.log(cords.x,cords.y);
            graph.endFill();
        }*/
var Map = function (maingame) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    //
    this.walkableArray = [];
    this.interactiveObjectDatas = [];
};
var Masker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;

    this.maskedobjects = [];
    this.maskDistance = 2000;//distance*distance
    
    this.maskableobjects = maskableobjects;
    
    this.mask = new Phaser.Image(game, 0, 0, "tiles2", "box/seethrough.png")
    //this.maingame.objectGroup.add(this.mask);
    //this.maingame.objectGroup.add(mask);
}
//Masker.prototype = Object.create(Phaser.Group.prototype);
//Masker.constructor = Masker;

Masker.prototype.createCircleMask = function(radius) {
        var mask = this.game.add.graphics(0, 0);
        mask.beginFill(0xffffff11);
        mask.drawCircle(0, 0, radius);
        this.maingame.objectGroup.add(mask);
        return mask;
}
Masker.prototype.createRectMask = function(x,y,w,h) {
        var mask = this.game.add.graphics(0, 0);
        mask.beginFill(0x00000000);
        mask.drawRect(x,y,w/2,h);
        this.maingame.objectGroup.add(mask);
        return mask;
}
//get list of maskedobjects
//if already has mask, then move it, else create a new one
Masker.prototype.cleanUp = function() 
{
}
Masker.prototype.updateMasks = function(locx,locy) {
    if(this.maskableobjects)
    {
        var object;
        for(var i=0;i<this.maskableobjects.length;i++)
        {
            object = this.maskableobjects[i];
            if(object!=null)
            {
                if(object.left <= locx && locx < object.right && object.top <= locy && locy < object.bottom)
                {
                    if(this.maskedobjects[i] == null)
                    {
                        var maskedObject = new MaskedObject();
                        var bmd = this.game.make.bitmapData(object.width, object.height);
                        var mask = this.game.make.bitmapData(object.width, object.height);
                        
                        mask.ctx.beginPath();
                        mask.ctx.rect(0,0,object.width, object.height);
                        mask.ctx.fillStyle = '#ffff00';
                        mask.ctx.fill();
                        
                        mask.draw(this.mask);
                        
                        var x = object.x;
                        var y = object.y;
                        
                        object.x = 0;
                        object.y = 0;
                        object.anchor.x = 0.0;
                        object.anchor.y = 0.0; 
                        
                        bmd.alphaMask(object, mask);
                        //bmd.alphaMask(bmd, object);
                        //bmd.draw(object, -object.width/2, -object.height, object.width,  object.height);
                       // bmd.draw(object);
                        object.anchor.x = 0.5;
                        object.anchor.y = 1.0; 
                        
                        //
                        maskedObject.thebitmapdata = bmd;
                        maskedObject.object = object;
                        //
                        maskedObject.image = new Phaser.Image(this.game, x, y, bmd);          
                        this.game.add.existing(maskedObject.image);
                        //console.log(maskedObject.image.width, bmd);
                        //this.game.add.image(x, y, bmd);
                        maskedObject.image.anchor.x = 0.5;
                        maskedObject.image.anchor.y = 1.0;                        
                        this.maingame.objectGroup.add(maskedObject.image);

                        this.maskedobjects[i] = maskedObject;
                        
                        object.visible  = false;
                        object.x  = object.x;
                        object.y  = object.y;
                    }
                    else
                    {
                        //this.maskedobjects[i]
                    }
                   /* if(object.mask==null)
                    {
                       object.mask =  this.createCircleMask(100);
                    }
                    object.mask.x = locx;
                    object.mask.y = locy;                    */
                }
                else
                {
                    if(this.maskedobjects[i] != null)
                    {
                     //   object.visible = true; 
                    //    this.maskedobjects[i].cleanup();
                    //    this.maskedobjects[i] = null;
                    }
                }
            }
        } 
    }
}

Masker.prototype.fasterDistance = function(x1,y1,x2,y2){
    var a = x1 - x2
    var b = y1 - y2
    //var c = Math.sqrt( a*a + b*b );
    return (a*a + b*b);
}
//
var MaskedObject = function ()
{
    this.thebitmapdata;
    this.object;
    this.image;
}
MaskedObject.prototype.cleanup = function()
{
    if(this.image)
    {
        this.image.destroy();
        this.thebitmapdata = null;
        this.object = null;
        this.image = null;
    }
}
//characters that will be moving around the map using the patherfinder
//
//
var MovingCharacter = function (maingame, jsondata) 
{
    InteractiveObject.call(this, maingame, jsondata);
    //
    this.oldTile=null;
    
    //
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    //
    this.prevx;
    this.prevy;
    //
    this.dir = new Phaser.Point();
    
    this.walkspeed = 0.1875;
    var actions = this.jsondata.triggers;
    //
    this.actionsaftermove;
    this.objectmovingto;
    this.movingtotile=null;
    //
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="mover")
            this.walkspeed = actions[i].walkSpeed;
    }
    
    //
    //this.inventory = [];
    
};
MovingCharacter.prototype = Object.create(InteractiveObject.prototype);
MovingCharacter.constructor = MovingCharacter;
//
MovingCharacter.prototype.isMoving = function() 
{
   if(this.dir.x == 0 && this.dir.y == 0)
       return false;
    return true;
}
/*MovingCharacter.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}*/
//
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.x = inx;
    this.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    this.x = tile.x+this.maingame.hexHandler.halfHex;
    this.y = tile.y+this.maingame.hexHandler.halfHexHeight;
    this.oldTile = tile;
    this.currentTile = tile;
    //
    this.updateLocation(tile);
    
    this.findtile();
    
    this.currentTile.changeWalkable(false);
}
//this is only avaliable to players - for when we have multiple players moving around
MovingCharacter.prototype.gotoAnotherMap = function(map, tile) 
{
}
//
MovingCharacter.prototype.setDirection = function() 
{
    //console.log(this.nextTile.x,this.maingame.hexHandler.halfHex,this.nextTile.x+this.maingame.hexHandler.halfHex, this.nextTile.x-this.maingame.hexHandler.halfHex);
    this.dir.x =  this.nextTile.x+this.maingame.hexHandler.halfHex-this.x;
    this.dir.y =  this.nextTile.y+this.maingame.hexHandler.halfHexHeight-this.y;
    this.dir.normalize();
    //console.log(this.nextTile);
}
MovingCharacter.prototype.setPath = function(path) 
{
    if(!path)
        return;
    if(path.length<=0)
        return;
    if(this.objectmovingto!=null && this.objectmovingto.footprint!=null)
    {
        this.movingtotile = this.maingame.hexHandler.findClosesInPath(this.objectmovingto.currentTile, this.objectmovingto.footprint, path);
    }
    
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = path[this.pathlocation];//this.maingame.hexHandler.getTileByCords( path[this.pathlocation].x, path[this.pathlocation].y);
    this.setDirection();
    this.animations.play("walk");
}
MovingCharacter.prototype.moveToObject = function(object,tile,actions)
{
    this.objectmovingto = object;
    //
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    //
    this.moveto(tile);
    //find closes hex
    this.actionsaftermove = actions;
    this.objectmovingto = object;
}
MovingCharacter.prototype.moveto = function(moveIndex){
    if(moveIndex!=null)
    {
        if(this.objectmovingto!=null && this.objectmovingto.areWeNeighbours(this.currentTile)){
            this.atTargetTile();
        }
        else
        {
            //straight line movement
            //var path = this.hexHandler.getlinepath(playertile,moveIndex);
            //this.playerCharacter.setPath(path);
            //
            this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
            this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx,moveIndex.posy] );
            this.maingame.pathfinder.calculatePath();

            this.clearTargetTile();
            this.movingtotile = moveIndex;
        }
    }
}
MovingCharacter.prototype.movercallback = function(path){
    path = path || [];
    path = this.maingame.hexHandler.pathCoordsToTiles(path);
    this.setPath(path);
}
MovingCharacter.prototype.atTargetTile = function()
{
    if(this.actionsaftermove)
    {
        //should pass what type of action it is
        this.changeState("use");
    }   
}
MovingCharacter.prototype.clearTargetTile = function()
{
    this.actionsaftermove = null;
    this.movingtotile = null;
    this.objectmovingto = null;
}
MovingCharacter.prototype.findtile = function()
{
    var onmap = this.maingame.spritegrid.PosToMap(this.x,this.y);
    //console.log("--",onmap.x,onmap.y);
   // onmap = this.maingame.spritegrid.GetMapCoords(onmap.x,onmap.y);
    this.posx = onmap.x;
    this.posy = onmap.y;
  //  console.log("find tile",this.posx,this.posy);
}
//
MovingCharacter.prototype.doUse = function()
{
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
    this.changeState("idle");
}
//
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.currentTile==null)
        this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
    if(this.oldTile==null)
        this.finalSetup();
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //need to test if next spot is now not walkable
            this.currentTile = this.maingame.hexHandler.checkHex(this.x,this.y);
            if(this.oldTile != this.currentTile)
            {
                this.oldTile.changeWalkable(true);
                this.oldTile = this.currentTile;
                this.currentTile.changeWalkable(false);
            }

            if(this.currentTile==null)
            {
                //center old then try again
            }
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.pathlocation>=this.path.length)// at last tile, now walk to the center
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.x+this.maingame.hexHandler.halfHex;
                    var testy = this.currentTile.y+this.maingame.hexHandler.halfHexHeight;
                    
                    var range = 3;
                    if(testx-range<this.x && testx+range>this.x && testy-range<this.y && testy+range>this.y)
                    {
                        this.x = testx;
                        this.y = testy;
                        this.path = null;//for now
                        this.dir.x = 0;
                        this.dir.y = 0;
                        this.currentTile.enterTile();
                        this.animations.play("idle");
                        //
                        if(this.objectmovingto!=null && this.currentTile!=null){
                            //console.log(this.objectmovingto,this.currentTile,this.objectmovingto.areWeNeighbours(this.currentTile));
                            if(this.objectmovingto.areWeNeighbours(this.currentTile)){
                                this.atTargetTile();
                            }
                        }
                    }
                    this.setDirection();
                }
                else//find next tile
                {
                    this.nextTile = this.path[this.pathlocation]; 
                    this.setDirection();
                }
                this.updateLocation(this.currentTile);
                //activate currenttile as onenter
            }
        }
    }
    var nextx = this.x + this.dir.x * this.walkspeed * elapseTime;
    var nexty = this.y + this.dir.y * this.walkspeed * elapseTime;
    
    //test if next coords are both walkable and moveable, else
    //may not need prevx, can just use x
    if(this.prevx != nextx || this.prevy != nexty)
    {
        this.x = nextx;
        this.y = nexty;
        this.findtile();
        
        this.prevx = this.x;
        this.prevy = this.y;
    }
    //
    if(this.dir.x<0)
        this.scale.x = -1;
    else if(this.dir.x>0)
        this.scale.x = 1;
    
}

    //this.animations.play("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.animations.play('idle', 30, true);
    }, this);*/
// extra json - map

var PlayerCharacter = function (maingame, jsondata) 
{
    MovingCharacter.call(this, maingame, jsondata);
    this.IsPlayer = true;
    //this.inventory = [];    
    this.dosetup();
};
PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;

var BasicGame = {};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

    init: function () {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    },

    preload: function () {
        this.load.atlasJSONHash('loadingScreen', 'assets/loading.png', 'assets/loading.json');
        
        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        //this.load.image('preloaderBackground', 'images/preloader_background.jpg');
        //this.load.image('preloaderBar', 'images/preloadr_bar.png');

    },

    create: function () {
        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.state.start('Preloader');
    }

};


BasicGame.Instructions = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.Instructions.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'instructions');

		this.playButton = this.add.button(177, 529, 'ui', this.returnToMain, this, 'OK Button0001.png', 'OK Button0002.png', 'OK Button0002.png','OK Button0001.png');
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	returnToMain: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('MainMenu');

	}
};


BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'mainmenu');

		this.playButton = this.add.button(376, 425, 'ui', this.startGame, this, 'Play Button0001.png', 'Play Button0002.png', 'Play Button0002.png','Play Button0001.png');
        
        this.playButton = this.add.button(376, 487, 'ui', this.gotoInstructions, this, 'Instructions Button0001.png', 'Instructions Button0002.png', 'Instructions Button0002.png','Instructions Button0001.png');

        
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	},
    gotoInstructions: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Instructions');

	}

};


BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
		this.preloadBar = this.add.sprite(0, 278, 'loadingScreen', 'loading_barfront.png');
        
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
        
        this.load.atlasJSONHash('ui', 'assets/simpleui.png', 'assets/simpleui.json');
        this.load.atlasJSONHash('tiles2', 'assets/tiles2.png', 'assets/tiles2.json');
        this.load.atlasJSONHash('actors', 'assets/actors.png', 'assets/actors.json');
        this.load.atlasJSONHash('dialogui', 'assets/dialogui.png', 'assets/dialogui.json');
		this.load.image('loading', 'assets/loading.png');
        this.load.image('mainmenu', 'assets/mainmenu.png');
        this.load.image('mapselect', 'assets/mapselect.png');
        this.load.image('winscreen', 'assets/winscreen.png');
        this.load.image('instructions', 'assets/instructions.png');
        this.load.bitmapFont("badabb", "assets/fonts/badabb.png", "assets/fonts/badabb.fnt")
        
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
	   //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        
        this.state.start('Game');
        //this.state.start('MainMenu');
	},

	/*update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.ready == false)//this.cache.isSoundDecoded('titleMusic') && 
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}*/

};

//
//***** BarkTextHandler ********
BarkTextHandler = function(game,maingame){
    Phaser.Group.call(this, game);
    this.pool = new BasicObjectPool(this);
    this.game = game;
    this.maingame=maingame;
}
BarkTextHandler.prototype = Object.create(Phaser.Group.prototype);
BarkTextHandler.constructor = BarkTextHandler;

BarkTextHandler.prototype.barkOverTile = function(tile,text){
}
BarkTextHandler.prototype.createItem = function(){
    var bark = new BarkText(this.game, this);
    this.add(bark);
    return bark;
}
BarkTextHandler.prototype.barkOverObject = function(object,text){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        if(allbarks[i].over==object && allbarks[i].over!=null)
            allbarks[i].killSelf();
    }
    
    var bark = this.pool.getObject();
    bark.getReady(object,text);
    
    bark.x = object.x;
    bark.y = object.y;
    bark.over = object;
    bark.visible = true;
   /* if(bark.y<0){//if display is off the screen
        bark.y = object.y + object.height;
    }*/
    
}
BarkTextHandler.prototype.returnBarkToPool = function(bark){
    this.pool.returnObject(bark);
}
//map change
BarkTextHandler.prototype.cleanupAllBarks = function(){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        allbarks[i].killSelf();
    }
}
BarkTextHandler.prototype.step = function(elapseTime){
    var allbarks = this.pool.allObjectsArray;
    for(var i=0;i<allbarks.length;i++){
        if(allbarks[i].inUse)
            allbarks[i].step(elapseTime);
    }
}
//***** BarkText ********
//
BarkText = function(game, handler){
    Phaser.BitmapText.call(this, game, 0, 0, "badabb", "Text goes here.", 25);
    this.time;//
    this.over;//object over
    this.inUse = false;
    this.handler = handler;
    this.anchor.x = 0.5;
}
BarkText.prototype = Object.create(Phaser.BitmapText.prototype);
BarkText.constructor = BarkText;

BarkText.prototype.step = function(elapseTime){
    this.time -= elapseTime;
    if(this.time<=0)
        this.killSelf();
    //follow
}
BarkText.prototype.killSelf = function(){
    this.handler.returnBarkToPool(this);
}
BarkText.prototype.getReady = function(over,text){
    this.text = text; //(center?)
    this.time = 3000;
    this.over = over;
    this.inUse = true;
    this.visible = true;
}
BarkText.prototype.reset = function(){
    this.time = -1;
    this.over = null;
    this.inUse = false;
    this.visible = false;
}
//bg
//button1,button2,button3
//text font

//***** DialogPanel ********
var DialogPanel = function(game, maingame, dialogEngine, parent){
	Phaser.Group.call(this, game, parent);

    this.overTint = 0xff5500;
    this.maingame = maingame;
    this.dialogEngine = dialogEngine;
}
DialogPanel.prototype = Object.create(Phaser.Group.prototype);
DialogPanel.constructor = DialogPanel;


//
DialogPanel.prototype.setup = function(button){   
    
    //
    this.setupBG("dialogui","dialog_main.png");
    //
    this.btnPlay1 = this.setupButton(36.95, -22.4, 'dialogui', this.play1,'dialog_10002.png', 'dialog_10001.png', 'dialog_10001.png','dialog_10002.png');
    this.btnPlay2 = this.setupButton(37.4, 25.25, 'dialogui', this.play2,'dialog_20002.png', 'dialog_20001.png', 'dialog_20001.png','dialog_20002.png');    
    this.btnPlay3 = this.setupButton(35.95, 45.8, 'dialogui', this.play3,'dialog_30002.png', 'dialog_30001.png', 'dialog_30001.png','dialog_30002.png');
    //
    this.textMain = this.setupText(0, -60, "badabb", "Text goes here.", 25); 
    this.btnPlay1.textRef = this.setupText(95, -10, "badabb", "1. ", 25);
    this.btnPlay2.textRef = this.setupText(95, 35, "badabb", "2. ", 25);
    this.btnPlay3.textRef = this.setupText(95, 82, "badabb", "3. ", 25);
    
    this.portrait1 = null;
    this.portrait2 = null;
	// Place it out of bounds (?)
	this.x = 300;
    this.y = -1000;
};
//
DialogPanel.prototype.setupPortrait = function(x,y,spritesheet,sprite)
{    
    var portrait = this.game.make.sprite(0,0,spritesheet,sprite);
    this.add(portrait);
    return portrait;
}
//
DialogPanel.prototype.setupBG = function(spritesheet,sprite)
{    
    var bg = this.game.make.image(0,0,spritesheet,sprite);
    this.add(bg);
}
//
DialogPanel.prototype.setupButton = function(x,y,spritesheet,callback,overFrame, outFrame, downFrame, upFrame)
{    
    var newBtn = this.game.make.button(x,y,spritesheet,callback, this,overFrame, outFrame, downFrame, upFrame);
    this.add(newBtn);
    //
    newBtn.events.onInputOver.add(this.buttonOver, this);
    newBtn.events.onInputOut.add(this.buttonOut, this);
    //
    //this.btnPlay2.input.pixelPerfectOver = true;
    newBtn.input.useHandCursor = true;
    return newBtn;
}
//
DialogPanel.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.make.bitmapText(x, y, font, text, size); 
    this.add(newtext);
    return newtext;
}

/*
Button events
*/
DialogPanel.prototype.buttonOver = function(button){
    button.textRef.tint = this.overTint;
};
DialogPanel.prototype.buttonOut = function(button){
    button.textRef.tint = 0xffffff;
};

//how to handle just next
DialogPanel.prototype.play1 = function(button){
    this.dialogData = this.dialogData.links[0];
    this.nextDialog();
};
DialogPanel.prototype.play2 = function(button){
    this.dialogData = this.dialogData.links[1];
    this.nextDialog();
};
DialogPanel.prototype.play3 = function(button){
    this.dialogData = this.dialogData.links[2];
    this.nextDialog();
};
DialogPanel.prototype.justDoNext = function(){
    if(this.dialogData==null)
        this.endDialog();
    else if(this.dialogData.links.length==0){
        this.dialogData = null;
        this.endDialog();
    }
    else{
        this.dialogData = this.dialogData.links[0];
        this.nextDialog();
    }
};

//
DialogPanel.prototype.nextDialog = function(){
    this.dialogData = this.dialogEngine.getNextDialog(this.dialogData);
    if(this.dialogData==null)
        this.endDialog();
    else
       this.setupDialog(); 
}
//
DialogPanel.prototype.setupDialog = function(){    
    if(this.dialogData==null)
    {
        console.log("dialog data not set");
        return;
    }
    this.textMain.text = this.dialogData.actor.json.Name +": " + this.dialogData.current.DialogueText;
    
    if(this.portrait1==null)
        this.portrait1 = this.setupPortrait(0,0,"actors",this.dialogData.actor.json.Pictures+".png");
    else if(this.portrait1.frameName != this.dialogData.actor.json.Pictures)
        this.portrait1.frameName = this.dialogData.actor.json.Pictures+".png";
    
    //if links are players do normal
    //else can click anywhere?
    if(this.dialogData.links.length>1 && this.dialogData.links[0].Actor==this.dialogEngine.playerActor.id)
    {
        for(var i=0;i<3;i++)
        {
            if(this.dialogData.links[i]!=null && this.dialogData.links[i].Actor==this.dialogEngine.playerActor.id)
            {
                this["btnPlay"+(i+1)].visible = true;
                this["btnPlay"+(i+1)].textRef.visible = true;
                this["btnPlay"+(i+1)].textRef.text = (i+1)+". " + this.dialogData.links[i].DialogueText;
                this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
            }
            else
            {
                this["btnPlay"+(i+1)].visible = false;
                this["btnPlay"+(i+1)].textRef.visible = false;
                this["btnPlay"+(i+1)].textRef.text = "";
                this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
            }
        }
        this.game.input.onDown.remove(this.justDoNext, this); 
    }
    else
    {
        this.hideButtons();
        this.game.input.onDown.add(this.justDoNext, this); 
    }
}
//
DialogPanel.prototype.hideButtons = function(){
    for(var i=0;i<3;i++){
        this["btnPlay"+(i+1)].visible = false;
        this["btnPlay"+(i+1)].textRef.visible = false;
        this["btnPlay"+(i+1)].textRef.text = "";
        this["btnPlay"+(i+1)].textRef.tint = 0xffffff;
    }
}
//
DialogPanel.prototype.startDialog = function(id){
    this.dialogData = this.dialogEngine.startConvo(id);
    console.log("start Dialog",id);
    if(this.dialogData){
        this.visible = true;
        this.y = 250;
        this.setupDialog();
    }
};
DialogPanel.prototype.endDialog = function(){
    //this.btnPlay1.changeStateFrame.apply(this.btnPlay1,['Up']);
    //this.btnPlay2.frame = 0;
    //this.btnPlay3.frame = 0;
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.maingame.unpauseGame();
    this.visible = false;
    this.y = -1000;
};



//***** JustTextPopup ********
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
//
    this.bg = this.game.make.image(0,0,"actors","textBox.png");
    this.add(this.bg);
//
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(10, 10, "badabb", "Text goes here.", 25);
    this.textMain.tint = 0x00ffff;
    this.textMain.wordWrap = true;
    this.textMain.wordWrapWidth = 300;
    this.add(this.textMain);
//
    this.visible = false;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay){
    
    this.x = this.game.width/2-this.width/2;
    this.y = this.game.height/2-this.height/2;

    
    this.textMain.text = texttodisplay;
    //this.dialogData = null;
    this.visible = true;
    this.game.input.onDown.add(this.closePopup, this);
}
/*JustTextPopup.prototype.showTextFromHandler = function(convoid){
    this.dialogData = this.dialogEngine.startConvo(convoid);
    if(this.dialogData){
        this.visible = true;
        this.x = 0;
        this.textMain.text = this.dialogData.current.DialogueText;
        this.game.input.onDown.add(this.nextPopup, this);
    }
}
JustTextPopup.prototype.nextPopup = function(){
    if(this.dialogData)
        this.dialogData = this.dialogEngine.getNextDialog(this.dialogData.current);
    if(this.dialogData==null)
    {
        this.closePopup();
        return;
    }
    this.textMain.text = this.dialogData.current.DialogueText;
}*/
JustTextPopup.prototype.closePopup = function(){
    //this.dialogData = null
    //this.x = -1000;
    this.visible = false;
    this.game.input.onDown.remove(this.closePopup, this);
    
    this.maingame.unpauseGame();
}
//Bryan Gough, March 18/2015 - removed diag, changed this.calculate to do 6 neighbors instead of 4
//
//NameSpace
var EasyStar = EasyStar || {};

//For require.js
if (typeof define === "function" && define.amd) {
	define("easystar", [], function() {
		return EasyStar;
	});
}

//For browserify and node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = EasyStar;
}
/**
* A simple Node that represents a single tile on the grid.
* @param {Object} parent The parent node.
* @param {Number} x The x position on the grid.
* @param {Number} y The y position on the grid.
* @param {Number} costSoFar How far this node is in moves*cost from the start.
* @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
**/
EasyStar.Node = function(parent, x, y, costSoFar, simpleDistanceToTarget) {
	this.parent = parent;
	this.x = x;
	this.y = y;
	this.costSoFar = costSoFar;
	this.simpleDistanceToTarget = simpleDistanceToTarget;

	/**
	* @return {Number} Best guess distance of a cost using this node.
	**/
	this.bestGuessDistance = function() {
		return this.costSoFar + this.simpleDistanceToTarget;
	}
};

//Constants
EasyStar.Node.OPEN_LIST = 0;
EasyStar.Node.CLOSED_LIST = 1;
/**
* This is an improved Priority Queue data type implementation that can be used to sort any object type.
* It uses a technique called a binary heap.
* 
* For more on binary heaps see: http://en.wikipedia.org/wiki/Binary_heap
* 
* @param {String} criteria The criteria by which to sort the objects. 
* This should be a property of the objects you're sorting.
* 
* @param {Number} heapType either PriorityQueue.MAX_HEAP or PriorityQueue.MIN_HEAP.
**/
EasyStar.PriorityQueue = function(criteria,heapType) {
	this.length = 0; //The current length of heap.
	var queue = [];
	var isMax = false;

	//Constructor
	if (heapType==EasyStar.PriorityQueue.MAX_HEAP) {
		isMax = true;
	} else if (heapType==EasyStar.PriorityQueue.MIN_HEAP) {
		isMax = false;
	} else {
		throw heapType + " not supported.";
	}

	/**
	* Inserts the value into the heap and sorts it.
	* 
	* @param value The object to insert into the heap.
	**/
	this.insert = function(value) {
		if (!value.hasOwnProperty(criteria)) {
			throw "Cannot insert " + value + " because it does not have a property by the name of " + criteria + ".";
		}
		queue.push(value);
		this.length++;
		bubbleUp(this.length-1);
	}

	/**
	* Peeks at the highest priority element.
	*
	* @return the highest priority element
	**/
	this.getHighestPriorityElement = function() {
		return queue[0];
	}

	/**
	* Removes and returns the highest priority element from the queue.
	*
	* @return the highest priority element
	**/
	this.shiftHighestPriorityElement = function() {
		if (this.length === 0) {
			throw ("There are no more elements in your priority queue.");
		} else if (this.length === 1) {
			var onlyValue = queue[0];
			queue = [];
                        this.length = 0;
			return onlyValue;
		}
		var oldRoot = queue[0];
		var newRoot = queue.pop();
		this.length--;
		queue[0] = newRoot;
		swapUntilQueueIsCorrect(0);
		return oldRoot;
	}

	var bubbleUp = function(index) {
		if (index===0) {
			return;
		}
		var parent = getParentOf(index);
		if (evaluate(index,parent)) {
			swap(index,parent);
			bubbleUp(parent);
		} else {
			return;
		}
	}

	var swapUntilQueueIsCorrect = function(value) {
		var left = getLeftOf(value);
		var right = getRightOf(value);
		if (evaluate(left,value)) {
			swap(value,left);
			swapUntilQueueIsCorrect(left);
		} else if (evaluate(right,value)) {
			swap(value,right);
			swapUntilQueueIsCorrect(right);
		} else if (value==0) {
			return;
		} else {
			swapUntilQueueIsCorrect(0);
		}
	}

	var swap = function(self,target) {
		var placeHolder = queue[self];
		queue[self] = queue[target];
		queue[target] = placeHolder;
	}

	var evaluate = function(self,target) {
		if (queue[target]===undefined||queue[self]===undefined) {
			return false;
		}
		
		var selfValue;
		var targetValue;
		
		//Check if the criteria should be the result of a function call.
		if (typeof queue[self][criteria] === 'function') {
			selfValue = queue[self][criteria]();
			targetValue = queue[target][criteria]();
		} else {
			selfValue = queue[self][criteria];
			targetValue = queue[target][criteria];
		}

		if (isMax) {
			if (selfValue > targetValue) {
				return true;
			} else {
				return false;
			}
		} else {
			if (selfValue < targetValue) {
				return true;
			} else {
				return false;
			}
		}
	}

	var getParentOf = function(index) {
		return Math.floor(index/2)-1;
	}

	var getLeftOf = function(index) {
		return index*2 + 1;
	}

	var getRightOf = function(index) {
		return index*2 + 2;
	}
};

//Constants
EasyStar.PriorityQueue.MAX_HEAP = 0;
EasyStar.PriorityQueue.MIN_HEAP = 1;

/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
 */
EasyStar.instance = function() {
	this.isDoneCalculating = true;
	this.pointsToAvoid = {};
	this.startX;
	this.callback;
    this.callbackObj;
	this.startY;
	this.endX;
	this.endY;
	this.nodeHash = {};
	this.openList;
    this.endwalkable;
};
/**
*	EasyStar.js
*	github.com/prettymuchbryce/EasyStarJS
*	Licensed under the MIT license.
* 
*	Implementation By Bryce Neal (@prettymuchbryce)
**/
EasyStar.js = function() {
	var STRAIGHT_COST = 10;
	var pointsToAvoid = {};
	var collisionGrid;
	var costMap = {};
	var iterationsSoFar;
	var instances = [];
	var iterationsPerCalculation = Number.MAX_VALUE;
	var acceptableTiles;
	/**
	* Sets the collision grid that EasyStar uses.
	* 
	* @param {Array|Number} tiles An array of numbers that represent 
	* which tiles in your grid should be considered
	* acceptable, or "walkable".
	**/
	this.setAcceptableTiles = function(tiles) {
		if (tiles instanceof Array) {
			//Array
			acceptableTiles = tiles;
		} else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
			//Number
			acceptableTiles = [tiles];
		}
	};

	/**
	* Sets the collision grid that EasyStar uses.
	* 
	* @param {Array} grid The collision grid that this EasyStar instance will read from. 
	* This should be a 2D Array of Numbers.
	**/
	this.setGrid = function(grid) {
		collisionGrid = grid;
		//Setup cost map
		for (var y = 0; y < collisionGrid[0].length; y++) {
			for (var x = 0; x < collisionGrid.length; x++) {
				if (!costMap[collisionGrid[x][y]]) {
					costMap[collisionGrid[x][y]] = 1
				}
			}
		}
        //console.log("end");
	};

	/**
	* Sets the tile cost for a particular tile type.
	*
	* @param {Number} The tile type to set the cost for.
	* @param {Number} The multiplicative cost associated with the given tile.
	**/
	this.setTileCost = function(tileType, cost) {
		costMap[tileType] = cost;
	};

	/**
	* Sets the number of search iterations per calculation. 
	* A lower number provides a slower result, but more practical if you 
	* have a large tile-map and don't want to block your thread while
	* finding a path.
	* 
	* @param {Number} iterations The number of searches to prefrom per calculate() call.
	**/
	this.setIterationsPerCalculation = function(iterations) {
		iterationsPerCalculation = iterations;
	};
	
	/**
	* Avoid a particular point on the grid, 
	* regardless of whether or not it is an acceptable tile.
	*
	* @param {Number} x The x value of the point to avoid.
	* @param {Number} y The y value of the point to avoid.
	**/
	this.avoidAdditionalPoint = function(x, y) {
		pointsToAvoid[x + "_" + y] = 1;
	};

	/**
	* Stop avoiding a particular point on the grid.
	*
	* @param {Number} x The x value of the point to stop avoiding.
	* @param {Number} y The y value of the point to stop avoiding.
	**/
	this.stopAvoidingAdditionalPoint = function(x, y) {
		delete pointsToAvoid[x + "_" + y];
	};

	/**
	* Stop avoiding all additional points on the grid.
	**/
	this.stopAvoidingAllAdditionalPoints = function() {
		pointsToAvoid = {};
	};

	/**
	* Find a path.
	* 
	* @param {Number} startX The X position of the starting point.
	* @param {Number} startY The Y position of the starting point.
	* @param {Number} endX The X position of the ending point.
	* @param {Number} endY The Y position of the ending point.
	* @param {Function} callback A function that is called when your path
	* is found, or no path is found.
	* 
	**/
	this.findPath = function(startX, startY ,endX, endY, callback, callbackObj) {
		//No acceptable tiles were set
		if (acceptableTiles === undefined) {
			throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
		}
		//No grid was set
		if (collisionGrid === undefined) {
			throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
		}
		//Start or endpoint outside of scope.
		if (startX < 0 || startY < 0 || endX < 0 || endX < 0 || 
		startX > collisionGrid.length-1 || startY > collisionGrid[0].length-1 || 
		endX > collisionGrid.length-1 || endY > collisionGrid[0].length-1) {
			throw new Error("Your start or end point is outside the scope of your grid.");
		}

		//Start and end are the same tile.
		if (startX===endX && startY===endY) {
			callback.apply(callbackObj,[[]]);
			return;
		}

		//End point is not an acceptable tile.
        //- this needs to change - if this is true, end 1 before
		var endTile = collisionGrid[endX][endY];
		var isAcceptable = false;
		for (var i = 0; i < acceptableTiles.length; i++) {
			if (endTile === acceptableTiles[i]) {
				isAcceptable = true;
				break;
			}
		}
		//if (isAcceptable === false) {
			//callback.apply(callbackObj,[null]);
			//return;
		//}
		//Create the instance
		var instance = new EasyStar.instance();
		instance.openList = new EasyStar.PriorityQueue("bestGuessDistance",EasyStar.PriorityQueue.MIN_HEAP);
		instance.isDoneCalculating = false;
		instance.nodeHash = {};
		instance.startX = startX;
		instance.startY = startY;
		instance.endX = endX;
		instance.endY = endY;
		instance.callback = callback;
        instance.callbackObj = callbackObj;
		instance.endwalkable = isAcceptable;
		instance.openList.insert(coordinateToNode(instance, instance.startX, 
			instance.startY, null, STRAIGHT_COST));
		
		instances.push(instance);
	};

	/**
	* This method steps through the A* Algorithm in an attempt to
	* find your path(s). It will search 4 tiles for every calculation.
	* You can change the number of calculations done in a call by using
	* easystar.setIteratonsPerCalculation().
	**/
	this.calculate = function() {
		if (instances.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
			return;
		}
        
		for (iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
			if (instances.length === 0) {
				return;
			}
			//Couldn't find a path.
			if (instances[0].openList.length===0) {
                //console.log("can't find path");                
			    instances[0].callback.apply(instances[0].callbackObj,[[]]);
				instances.shift();
				continue;
			}

			var searchNode = instances[0].openList.shiftHighestPriorityElement();
			searchNode.list = EasyStar.Node.CLOSED_LIST;
            //
            //if(searchNode.y % 2 == 1)
            if(searchNode.x % 2 == 1)
			{
				if(testNode(searchNode, 0,    -1))continue;
				if(testNode(searchNode, -1,   0))continue;
				if(testNode(searchNode, 0,    +1))continue;
				if(testNode(searchNode, +1,   +1))continue;
				if(testNode(searchNode, +1,   0))continue;
                if(testNode(searchNode, -1,   1))continue;
				//if(testNode(searchNode, 1,   -1))continue;
			}
			else
			{
				if(testNode(searchNode, -1,   -1))continue;
				if(testNode(searchNode, -1,   0))continue;
				if(testNode(searchNode, 0,    +1))continue;
				if(testNode(searchNode, +1,   0))continue
				if(testNode(searchNode, 0,    -1))continue;
                if(testNode(searchNode, 1,   -1))continue;
                //if(testNode(searchNode, -1,   1))continue;
			}
		}
	};
    //
    var testNode = function(searchNode,valx,valy){
        if(searchNode.x+valx > -1 && searchNode.x+valx < collisionGrid.length &&
           searchNode.y+valy > -1 && searchNode.y+valy < collisionGrid[0].length)
            //
            checkAdjacentNode(instances[0], searchNode, valx, valy, STRAIGHT_COST * 
                          costMap[collisionGrid[searchNode.x+valx][searchNode.y+valy]]);
        if (instances[0].isDoneCalculating===true) {
            instances.shift();
            return true;
        }
        return false
    }
	//Private methods follow
	var checkAdjacentNode = function(instance, searchNode, x, y, cost) {
		var adjacentCoordinateX = searchNode.x+x;
		var adjacentCoordinateY = searchNode.y+y;

		if (pointsToAvoid[adjacentCoordinateX + "_" + adjacentCoordinateY] === undefined) {		
			if (instance.endX === adjacentCoordinateX && instance.endY === adjacentCoordinateY) {
				instance.isDoneCalculating = true;
				var path = [];
				var pathLen = 0;
                if(instance.endwalkable)
                {
				    path[pathLen] = {x: adjacentCoordinateX, y: adjacentCoordinateY};
				    pathLen++;    
                }
                path[pathLen] = {x: searchNode.x, y:searchNode.y};
				pathLen++;
				var parent = searchNode.parent;
				while (parent!=null) {
					path[pathLen] = {x: parent.x, y:parent.y};
					pathLen++;
					parent = parent.parent;
				}
				path.reverse();
                instance.callback.apply(instance.callbackObj,[path]);
			}

			for (var i = 0; i < acceptableTiles.length; i++) {
				if (collisionGrid[adjacentCoordinateX][adjacentCoordinateY] === acceptableTiles[i]) {
					var node = coordinateToNode(instance, adjacentCoordinateX, 
						adjacentCoordinateY, searchNode, cost);
					
					if (node.list === undefined) {
						node.list = EasyStar.Node.OPEN_LIST;
						instance.openList.insert(node);
					} else if (node.list === EasyStar.Node.OPEN_LIST) {
						if (searchNode.costSoFar + cost < node.costSoFar) {
							node.costSoFar = searchNode.costSoFar + cost;
							node.parent = searchNode;
						}
					}
					break;
				}
			}

		}
	};

	//Helpers

	var coordinateToNode = function(instance, x, y, parent, cost) {
		if (instance.nodeHash[x + "_" + y]!==undefined) {
			return instance.nodeHash[x + "_" + y];
		}
		var simpleDistanceToTarget = getDistance(x, y, instance.endX, instance.endY);
		if (parent!==null) {
			var costSoFar = parent.costSoFar + cost;
		} else {
			costSoFar = simpleDistanceToTarget;
		}
		var node = new EasyStar.Node(parent,x,y,costSoFar,simpleDistanceToTarget);
		instance.nodeHash[x + "_" + y] = node;
		return node;
	};

	var getDistance = function(x1,y1,x2,y2) {
		return Math.sqrt(Math.abs(x2-x1)*Math.abs(x2-x1) + Math.abs(y2-y1)*Math.abs(y2-y1)) * STRAIGHT_COST;
	};
}


/*
 * PathFinderPlugin License: MIT.
 * Copyright (c) 2013 appsbu-de
 * https://github.com/appsbu-de/phaser_plugin_pathfinding
 */

/**
 * Constructor.
 *
 * @param parent
 * @constructor
 */
Phaser.Plugin.PathFinderPlugin = function (parent) {

    if (typeof EasyStar !== 'object') {
        throw new Error("Easystar is not defined!");
    }

    this.parent = parent;
    this._easyStar = new EasyStar.js();
    this._grid = null;
    this._callback = null;
    this._callbackObj = null;
    this._prepared = false;
    this._walkables = [0];

};

Phaser.Plugin.PathFinderPlugin.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.PathFinderPlugin.prototype.constructor = Phaser.Plugin.PathFinderPlugin;

/**
 * Set Grid for Pathfinding.
 *
 * @param grid          Mapdata as a two dimensional array.
 * @param walkables     Tiles which are walkable. Every other tile is marked as blocked.
 * @param iterationsPerCount
 */
Phaser.Plugin.PathFinderPlugin.prototype.setGrid = function (grid, walkables, iterationsPerCount) {
    iterationsPerCount = iterationsPerCount || null;

    this._grid = [];
    for (var i = 0; i < grid.length; i++)
    {
        this._grid[i] = [];
        for (var j = 0; j < grid[i].length; j++)
        {
            if (grid[i][j])
                this._grid[i][j] = grid[i][j];
            else
                this._grid[i][j] = 0
        }
    }
    this._walkables = walkables;

    this._easyStar.setGrid(this._grid);
    this._easyStar.setAcceptableTiles(this._walkables);

    // initiate all walkable tiles with cost 1 so they will be walkable even if they are not on the grid map, jet.
    for (i = 0; i < walkables.length; i++)
    {
        this.setTileCost(walkables[i], 1);
    }

    if (iterationsPerCount !== null) {
        this._easyStar.setIterationsPerCalculation(iterationsPerCount);
    }
};

/**
 * Sets the tile cost for a particular tile type.
 *
 * @param tileType {Number} The tile type to set the cost for.
 * @param cost {Number} The multiplicative cost associated with the given tile.
 */
Phaser.Plugin.PathFinderPlugin.prototype.setTileCost = function (tileType, cost) {
    this._easyStar.setTileCost(tileType, cost);
};

/**
 * Set callback function (Uh, really?)
 * @param callback
 */
Phaser.Plugin.PathFinderPlugin.prototype.setCallbackFunction = function (callback, callbackObj) {
    this._callback = callback;
    this._callbackObj = callbackObj;
};

/**
 * Prepare pathcalculation for easystar.
 *
 * @param from  array 0: x-coords, 1: y-coords ([x,y])
 * @param to    array 0: x-coords, 1: y-coords ([x,y])
 */
Phaser.Plugin.PathFinderPlugin.prototype.preparePathCalculation = function (from, to) {
    if (this._callback === null || typeof this._callback !== "function") {
        throw new Error("No Callback set!");
    }

    var startX = from[0],
        startY = from[1],
        destinationX = to[0],
        destinationY = to[1];

    this._easyStar.findPath(startX, startY, destinationX, destinationY, this._callback, this._callbackObj);
    this._prepared = true;
};

/**
 * Start path calculation.
 */
Phaser.Plugin.PathFinderPlugin.prototype.calculatePath = function () {
    if (this._prepared === null) {
        throw new Error("no Calculation prepared!");
    }

    this._easyStar.calculate();
};
var SimpleObject = function (game, x,y, spritesheet, imagename) 
{
    Phaser.Image.call(this, game, x,y, spritesheet, imagename);
    this.posx;
    this.posy;
}
SimpleObject.prototype = Object.create(Phaser.Image.prototype);
SimpleObject.constructor = SimpleObject;
//
var Grid = function(layer1)
{
    this.width = layer1.hexWidth;
    this.height = layer1.hexHeight;

    this.gridSizeY = layer1.height;
    this.gridSizeX = layer1.width;
    this.offsetx = layer1.offsetx || 0;
    this.offsety = layer1.offsety || 0;
    this.type = layer1.tiletype;
    
    this.coords = new Point(0,0);
}
Grid.prototype.GetMapCoords = function(i,j)
{
    //flip y over unity
    if(this.type=="Hex")
    {
        this.coords.x = this.width*i;
        this.coords.x += this.width/2*(j%2);
        
        this.coords.y = (this.height/4*3)*j;
    }
    else if(this.type=="HexIso")
    {
        var offset = Math.floor(i/2);
        this.coords.x = this.width*i + this.width/2*j;
        this.coords.y = (this.height/4*3)*j; 

        this.coords.x -= this.width/2 * offset;
        this.coords.y -= (this.height/4*3) * offset;
    }
    else if(this.type=="HexIsoFallout")
    {
        this.coords.x = 48 * i + 32 * j;
        this.coords.y = -24 * j + 12 * i;
        this.coords.y *= -1;
        //offset
        this.coords.x += 16;
        this.coords.y -= 4;
    }
    else
    {
        this.coords.x = 0;
        this.coords.y = 0;
    }
    return this.coords;
}
Grid.prototype.PosToMap = function(x,y)
{
    if(this.type=="HexIsoFallout")
    {
        x -= 16;//offset
        y += 4;

        x -= 40;//center
        y -= 16;
        
        y*= -1;
       // y -= 132;
        
        i = (3 * x + 4 * y )/192;
        j = (x - 4 * y)/128;
        //j = (12 * i - y)/24
        //i = (x - 32 * j )/48;
        this.coords.x = Math.round(i);
        this.coords.y = Math.round(j);
       // console.log(x,y,i,j,this.coords.x,this.coords.y);
    }
    else
    {
        this.coords.x = -1;
        this.coords.y = -1;
    }
    return this.coords;
}


//Simple tile for non-graphic grid. Used to movement.
var SimpleTile = function(maingame, posx, posy, x, y)
{
    this.maingame = maingame;
    this.walkable = true;  
    this.openair = true;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
}
SimpleTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
SimpleTile.prototype.changeWalkable = function(walkableto) 
{
    if(walkableto==true||walkableto=="true")
        this.maingame.walkableArray[this.posx][this.posy] = 1;
    else
        this.maingame.walkableArray[this.posx][this.posy] = 0;
    //console.log("changeWalkable",walkableto,(walkableto=="true"),this.maingame.walkableArray[this.posx][this.posy]);
    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
}
SimpleTile.prototype.enterTile = function()
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter");
};

//none moveable ground tiles will use new Image(game, x, y, key, frame)
//walls? walls at different layers
// this might not be needed
var GraphicTile = function(game, tileName, spritesheet, posx, posy, x, y, maingame)
{
    Phaser.Image.call(this, game, x,y, spritesheet, tileName);
    this.game = game;
    this.maingame = maingame;
    //this.posx = posx;
    //this.posy = posy;
}
GraphicTile.prototype = Object.create(Phaser.Image.prototype);
GraphicTile.constructor = GraphicTile;


/*
Tiles below are for graphic tiles that are also used for walkable

*/
var BaseTile = function(game, tileName, spritesheet, posx, posy, x, y, maingame)
{
   // console.log(spritesheet,tileName);
    Phaser.Sprite.call(this, game, x,y, spritesheet, tileName);
    this.game = game;
    this.maingame = maingame;
    //this.posx = posx;
    //this.posy = posy;
}
BaseTile.prototype = Object.create(Phaser.Sprite.prototype);
BaseTile.constructor = BaseTile;

BaseTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
BaseTile.prototype.changeWalkable = function(walkableto) 
{
    if(walkableto)
        this.maingame.walkableArray[this.posx][this.posy] = 1;
    else
        this.maingame.walkableArray[this.posx][this.posy] = 0;
    //
    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
}
//
//WalkableTile
//
//
var WalkableTile = function(game,tileName,spritesheet, posx,posy,x,y, maingame)
{
    //Phaser.Sprite.call(this, game, x,y, spritesheet,tileName);
    BaseTile.call(this, game,tileName,spritesheet, posx,posy,x,y, maingame)
    this.walkable = true;  
    this.openair = true;

    this.posx = posx;
    this.posy = posy;
    
    this.eventDispatcher;
};
WalkableTile.prototype = Object.create(BaseTile.prototype);
WalkableTile.constructor = WalkableTile;
//move this test to moving character
WalkableTile.prototype.enterTile = function()
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter");
};

//
//WaterTile
//
//
var WaterTile = function (game,tileName,spritesheet, posx,posy,x,y)
{
    Phaser.Sprite.call(this, game, x,y, spritesheet,tileName);
    this.game = game;
    //
    this.posx = posx;
    this.posy = posy;
    //
    this.walkable = false;  
    this.openair = true;
    //
    this.starty = y;
    this.wavemax = -5;
    this.maxoffsetmax = 5;
    this.maxoffsetmin = 0;
    this.speed = 0.003;
    this.direction = 1;
    this.waveSpeed = 0;
    //random initial
    this.y += this.game.rnd.integerInRange(this.maxoffsetmin, this.maxoffsetmax);
    if(this.game.rnd.frac()<0.5)
    {
        this.direction = -1;
    }
    //
    this.level();
};
WaterTile.prototype = Object.create(Phaser.Sprite.prototype);
WaterTile.constructor = WaterTile;

WaterTile.prototype.level = function() 
{
    var y = this.y;
    if(y<this.starty+this.maxoffsetmin)
    {
        this.direction = 1;
    }
    if(y>this.starty+this.maxoffsetmax)
    {
        this.direction = -1;
        this.waveSpeed = 0;
    }
};
WaterTile.prototype.step = function(elapseTime) 
{
    if(this.y<this.starty+this.wavemax)
    {
        this.y += this.direction * this.speed * elapseTime;
    }
    else
    {
        this.y += this.direction * this.speed * elapseTime;
    }
    if(this.game.rnd.frac()<0.01)
    {
        this.direction*=-1;
    }
    this.level();
};
WaterTile.prototype.hitByWave = function(power) 
{
    //this.y += this.power;
    //this.direction = -1;
    //this.waveSpeed += power;
    //if(this.waveSpeed>0.04)
    //    this.waveSpeed = 0.04;
    
    this.y += power;
    if(this.starty+this.wavemax>this.tileImage)
        this.y = this.starty+this.wavemax;
    //this.y = this.starty+this.wavemax;
    this.level();
};