//***** GlobalHandler ********
var GlobalHandler = function (game, maingame, actors, variables, quests, items)
{
    this.game = game;
    this.maingame = maingame;
    //
    this.actors = [];
    for(var i=0;i<actors.length;i++)
    {
        this.actors[actors[i].id.toString()] = new ActorObject(actors[i]);
    }
    //
    this.variables = [];
    for(var i=0;i<variables.length;i++)
    {
        this.variables[variables[i].id.toString()] = new VariableObject(variables[i]);
    }
    //
    this.quests = quests;
    this.items = items;
}
//
GlobalHandler.prototype.updateVariableByID = function(id,value)
{
    if(!this.variables[id])
        return false;
    this.variables[id].value = value;
    return true;
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
//
var BaseObject = function ()
{
    this.OnChangeSignal = new Phaser.Signal();
};
//
var ItemObject = function (json)
{
    BaseObject.call(this);
    this.json = json;
}
ItemObject.prototype = Object.create(BaseObject.prototype);
ItemObject.constructor = ItemObject;
//
var ActorObject = function (json)
{
    BaseObject.call(this);
    this.bind = [];
    this.json = json;
}
ActorObject.prototype = Object.create(BaseObject.prototype);
ActorObject.constructor = ActorObject;
//
var VariableObject = function (json)
{
    BaseObject.call(this);
    this.json = json;
    this.id = json.id;
    this.name = json.Name;
    this._value = json["Initial Value"];
    this.description = json.Description;
};

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