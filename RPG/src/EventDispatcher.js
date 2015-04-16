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
        //console.log("Use item",this.onItemAction);
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
                this.setActions(eventAction, action, trigger.once, con);
            }
        }
        else if(trigger.type=="actiontext")
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
        }
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
                this.setActions(eventAction, actions[j], once, con);
        }
    }
}
EventDispatcher.prototype.setActions = function(eventAction,action, once, con)
{
    if(action.type=="ChangeMap")
        {
            //console.log(action);
            eventAction.push({func:this.maingame.userExit, para:[action], removeself:once, callee:this.maingame, con:con});
        }
        //
        else if(action.type=="CONVERSATION")
        {
            eventAction.push({func:this.maingame.showDialog, para:[action.id], removeself:once, callee:this.maingame, con:con});
        }
        else if(action.type=="SIMPLE")
        {
            eventAction.push({func:this.maingame.showJustTextDialog, para:[action.id], removeself:once, callee:this.maingame, con:con});
        }
        else if(action.type=="BARK")
        {
        }
        //
        else if(action.type=="THIS")//call function on this
        {
            eventAction.push({func:this.object.callFunction, para:[action.function, action.parameters], removeself:false, callee:this.object, con:con});
        }
        else if(action.type=="Item")
        {
            eventAction.push({func:this.maingame.globalHandler.updateItem, para:[action.name,action.mode, action.variable,action.value],  removeself:false, callee:this.maingame.globalHandler, con:con});

        }
        else if(action.type=="Actor")
        {
            eventAction.push({func:this.maingame.globalHandler.updateActor, para:[action.name,action.mode, action.variable,action.value],  removeself:false, callee:this.maingame.globalHandler, con:con});
        }
        else if(action.type=="Variable")
        {
            eventAction.push({func:this.maingame.globalHandler.updateVariableByID, para:[action.name,action.mode, action.value],  removeself:false, callee:this.maingame.globalHandler, con:con});
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
        else
        {
            console("Apply conditions unknown",action.type,action);
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
        //console.log(eachreturn,logic, conditionlist[j]);
        
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
    //console.log(activation,actionEvent);
    this.completeAction(actionEvent);
}
EventDispatcher.prototype.completeAction = function(actionEvent)
{
    var lastcon;
    var lastconreturn = false;
    if(actionEvent.length>0)
    {
        for(var i=0;i<actionEvent.length;i++)
        {
            if(actionEvent[i]!=null)
            {
                if(actionEvent[i].con)//check condition. If false skip. If con is null then just go.
                {
                    //if similar cons just use same value
                   // console.log("completeAction ",actionEvent[i].con,lastcon);
                    if(actionEvent[i].con!=lastcon)
                    {
                        lastconreturn = this.testConditions(actionEvent[i].con);
                        lastcon = actionEvent[i].con;
                    }
                    else
                    {
                       // console.log("repeat");
                    }
                    if(!lastconreturn)
                        continue;
                }
                actionEvent[i].func.apply(actionEvent[i].callee, actionEvent[i].para);
                console.log(actionEvent[i], actionEvent[i].para);
                if(actionEvent[i].removeself)
                {
                    actionEvent[i] = null;//splice too?
                    console.log("remove event");
                }
            }
        }
    }
};
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