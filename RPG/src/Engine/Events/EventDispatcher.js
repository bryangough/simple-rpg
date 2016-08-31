var Condition = function ()
{
    this.logic = "Any";
    this.list = [];
}
//
var EventDispatcher = function (game, maingame, object)
{
    this.game = game;
    this.maingame = maingame;
    this.object = object;
    
    if(object!=null)
        GlobalEvents.allEventDispatchers.push(this);
    
    this.actionArray = [];
}
EventDispatcher.prototype.receiveData = function(triggers) 
{
    this.init(triggers);
};
EventDispatcher.prototype.testAction = function() 
{
    if(this.object)
    {
        if(this.object.allowInputNow)
        {
            this.object.allowInputNow(this.shouldBeActive());
        }
        else
        {
            this.object.allowInput = this.shouldBeActive();
        }
    }
}
EventDispatcher.prototype.shouldBeActive = function() 
{
    //if has anything 
    if(GlobalEvents.currentAction == GlobalEvents.WALK)
        return false;
    if(GlobalEvents.currentAction == GlobalEvents.TOUCH && this.actionArray["OnTouch"])
        return true;
    else if(GlobalEvents.currentAction == GlobalEvents.LOOK && this.actionArray["OnLook"])
        return true;
    else if(GlobalEvents.currentAction == GlobalEvents.TALK && this.actionArray["OnTalk"])
        return true;
    else if(GlobalEvents.currentAction == GlobalEvents.ITEM && this.actionArray["OnUseItem"])
        return true;
    else if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT && this.object.isCombatCharacter)
    {
        if(this.object.isAlive())
            return true;
    }
    return false;
}//if all action is null. clear out array?
EventDispatcher.prototype.hasAction = function(action)
{
    if(this.actionArray[action])
        return true;
    return false;
}
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
            con = new Condition();
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
EventDispatcher.prototype.setActions = function(eventAction, action, once, con, walkto)
{
    //console.log(action.type,action);
    if(action.type=="ChangeMap")
    {
        eventAction.push({func:this.maingame.map.userExit, para:[this.object, action], removeself:once, callee:this.maingame.map, con:con, walkto:walkto});
    }
    //
    else if(action.type=="CONVERSATION")
    {
        eventAction.push({func:this.maingame.showDialog, para:[action.id], removeself:once, callee:this.maingame, con:con, walkto:walkto});
    }
    else if(action.type=="SIMPLE")
    {
        eventAction.push({func:this.maingame.textUIHandler.showJustText, para:[action.text], removeself:once, callee:this.maingame.textUIHandler, con:con, walkto:walkto});
    }
    else if(action.type=="BARK")
    {
        eventAction.push({func:this.maingame.textUIHandler.showBark, para:[this.object, action.text], removeself:once, callee:this.maingame.textUIHandler, con:con, walkto:walkto});
    }
    //
    else if(action.type=="THIS")//call function on this
    {
        if(action.gototype!=undefined&&action.location)
        {
            eventAction.push({func:this.object.callFunction, para:["moveToSpotByCoords", action.location.x+","+ action.location.y], removeself:false, callee:this.object, con:con, walkto:walkto});
        }
        else
        {
            eventAction.push({func:this.object.callFunction, para:[action.function, action.parameters], removeself:false, callee:this.object, con:con, walkto:walkto});
        }
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
    else if(action.type=="GLOBAL")
    {
        eventAction.push({func:this.maingame.callFunction, para:[action.variable, ""], removeself:false, callee:this.maingame, con:con, walkto:walkto});
    }
    else if(action.type=="Activator")
    {
        eventAction.push({type:"Activator", func:null, para:[action.function, action.parameters], removeself:false, callee:null, con:con, walkto:walkto});
    }
}
//
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
//this should pass in who
EventDispatcher.prototype.doAction = function(activation, activator) 
{
    var actionEvent = this.getEventType(activation); 
    //console.log("doAction",activation, activator, actionEvent);
    this.completeAction(actionEvent, false, activator);
}
//
EventDispatcher.prototype.completeAction = function(actionEvent, atPoint, activator)
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
            //console.log(actionEvent[i]);
            if(actionEvent[i]!=null)
            {
              //  console.log(actionEvent[i].con);
                if(actionEvent[i].con)//check condition. If false skip. If con is null then just go.
                {
                    //if similar cons just use same value
                    if(actionEvent[i].con!=lastcon)
                    {
                        lastconreturn = this.testConditions(actionEvent[i].con);
                        //console.log(lastconreturn,actionEvent[i].con);
                        lastcon = actionEvent[i].con;
                    } 
                    //console.log("con ",lastconreturn);
                    if(!lastconreturn)
                        continue;
                }
                //push activated events into array and fire them later
               // console.log(actionEvent[i].walkto, activator);
                if(actionEvent[i].walkto && activator!=null)
                {
                    //this should be called only once
                    //console.log(this.object.currentTile, activator.currentTile);
                    var neighbours = this.maingame.map.hexHandler.areTilesNeighbors( this.object.currentTile, activator.currentTile);
                    //console.log(neighbours, atPoint);
                    if(!neighbours || !atPoint)
                    {
                        walktoactions.push(actionEvent[i]);
                        continue;
                    }
                }
                if(actionEvent[i].type=="Activator")
                {
                    if(activator!=null)
                    {
                        actionEvent[i].func = activator.callFunction;
                        actionEvent[i].callee = activator;
                        actionstoactivate.push(actionEvent[i]);    
                    }
                }
                else
                {
                    actionstoactivate.push(actionEvent[i]);    
                }
            }
        }
        //
        if(walktoactions.length>0)
        {
            //if in combat can't do?
            //if not walk to
            //also need to make this generic
            activator.moveToObject(this.object, this.object.currentTile, walktoactions);
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
    this.actionArray[activation] = this.actionArray[activation] || [];
    return this.actionArray[activation];
};
EventDispatcher.prototype.destroy = function() 
{
    this.actionArray = [];
}

/*
//inputEnabled 

register list of active objects for each event: touch, talk, look, (invectory item?)

turn on inputEnabled for current
turn off inputEnabled for last (if not current also)

//- walk shuts all off





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
/*var EventConv = function (game, maingame, destroyfunc, json) 
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
    this.maingame.textUIHandler.showDialog(this.convid);
    if(this.once){
        //call destroy func
    }
}
//
var EventnText = function (json) 
{
}*/
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