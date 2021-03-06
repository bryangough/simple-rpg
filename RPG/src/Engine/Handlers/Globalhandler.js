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
    return this.doCompare(compare,this.variables[id].getValue(), value);
}
GlobalHandler.prototype.getVariableValue = function(id)
{
    if(!this.variables[id])
        return null;
    return this.variables[id].getValue();
}
GlobalHandler.prototype.updateVariableByID = function(id,mode,value)
{
    console.log(this.variables[id],mode,value)
    if(!this.variables[id])
        return false;
    if(mode=="Add")
        this.variables[id].updateValue(null, this.variables[id].getValue() + parseFloat(value));
    else
        this.variables[id].updateValue(null,value);
    
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

VariableObject.prototype.updateValue = function(notneeded, value){
    this._value = value;
    this.json["Initial Value"] = value;
    this.OnChangeSignal.dispatch([this]); 
}
VariableObject.prototype.getValue = function()
{
    return this._value;
}

/*Object.defineProperty(VariableObject, "value", {
    get: function() {return console.log("variable",this,this._value); this._value },
    set: function(v) { this._value = v; this.OnChangeSignal.dispatch([this]); }//throw on change
});*/

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