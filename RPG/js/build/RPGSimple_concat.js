//"use strict";
var BasicGame = {
};
var gameInit = {
    //
    init: function(lang, container, assetslocation)
    {
        if(container==undefined)
            container = "gameContainer";
        var game = new Phaser.Game(900, 600, Phaser.AUTO, container);

        game.state.add('Boot', BasicGame.Boot);
        game.state.add('Preloader', BasicGame.Preloader);
        game.state.add('MainMenu', BasicGame.MainMenu);
        game.state.add('Game', BasicGame.Game);
        game.state.add('Instructions', BasicGame.Instructions);
        game.state.add('MapSelect', BasicGame.MapSelect);
        game.state.add('LoadMap', BasicGame.LoadMap);

        game.state.start('Boot');
        

        game.global = new Global();
        
        if(lang!=undefined && lang!="en")
        {
            game.global.language = lang;
        }
    }
};

/*
public interface IState
{
    public virtual void Update(float elapsedTime);
    public virtual void Render();
    public virtual void OnEnter();
    public virtual void OnExit();
}
*/

var EmptyState = function (game) {

}
EmptyState.prototype.update = function(elapsedTime) 
{

}
EmptyState.prototype.render = function() 
{

}
EmptyState.prototype.onEnter = function(params) 
{

}
EmptyState.prototype.onExit = function() 
{

}
    

var AIDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    this.isDone = true;
    //
    this.maxActions = 2;
    
    this.enemyfocus = null;
}
AIDecide.prototype.Update = function(elapse)
{
}
AIDecide.prototype.execute = function()
{
    // this.state.removeTopAction();
        
    if(this.combater.isAlive() && this.maxActions>0)
    {
        this.selectThis();
        //move to random location -
        // eventuall move towards Player
        
        var action = null;
        var weapon = this.combater.weapons[0]
        if( weapon )
        {
        }
        //if(Math.random()>0.5)
        //    action = this.randomMove();
        //else
        //    action = this.doAttack();
        
        //lineOfSite
        var hasLineOfSite = true;
        var withinRange = true;
        if(weapon.range>1)
        {
            hasLineOfSite = this.gameref.map.hexHandler.lineOfSite(this.combater.currentTile, this.gameref.map.playerCharacter.currentTile)
        }
            
        if(hasLineOfSite)
        {
            var distanceTo = this.gameref.map.hexHandler.testRange(this.combater.currentTile, this.gameref.map.playerCharacter.currentTile, false)
            if(distanceTo > weapon.range * 60)
            {
                withinRange = false;
            }
        }
        
        var r = Math.random();
        if(r < 0.1)//10% of the time just randomly walk around
        {
            action = this.randomMove();
        }
        else if(hasLineOfSite && withinRange)
        {
            action = this.doAttack();
        }
        else
        {
            /*this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
            this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx, moveIndex.posy] );
            this.maingame.pathfinder.calculatePath();*/
            action = this.moveToPlayer();
        }
        this.testEndOfTurn();
        this.state.addToActionsFront(action);
    }
    else
    {
        this.state.removeAction(this);
        this.state.moveOn();
        this.gameref.toggleCombat();//I don't like this
        //this.state.leaveThisState();//test if no more enemies
    }
}
AIDecide.prototype.selectPlayerToAttack = function()
{
    //get players from other team
    //get alive players
    //
}
AIDecide.prototype.selectThis = function()
{
    console.log("AI decide select.",this.combater);
    this.state.placeAtFront(this);    
}
AIDecide.prototype.testEndOfTurn = function()
{
    this.maxActions--;
    //this.state.removeTopAction();
    //if player has no more action remove from list
    console.log("AI actions: ", this.maxActions);
    if(this.maxActions<=0)
        this.state.removeAction(this);
}
/*AIDecide.prototype.movercallback = function(path){
    path = path || [];
    console.log(path);
    //path = this.map.hexHandler.pathCoordsToTiles(path);
}*/
AIDecide.prototype.cleanup = function()
{
}
AIDecide.prototype.moveToPlayer = function()
{
//    return this.randomMove();
    var action;
    action = new CombatAction(this.game, this.gameref, this.combater, this.gameref.map.playerCharacter, "move", this.state);
    return action;
}
AIDecide.prototype.randomMove = function()
{
    var action;
    var location = this.combater.findWalkableFromCurrent();
    var spot;
    if(location!=null)
    {
        var x = Math.floor(Math.random()*location.length);
        spot = location[x][Math.floor(Math.random()*location[x].length)];
    }
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    return action;
}
AIDecide.prototype.doAttack = function()
{
    var action;
    var weapon;
    if(this.combater.weapons.length>0)
    {
        weapon = this.combater.weapons[0];
        //use weapon
        //against player
    }
    if(weapon!=null)
        action = new CombatAction(this.game, this.gameref, this.combater, this.gameref.map.playerCharacter, "shoot", this.state,[weapon]);
    return action;
}

var CombatAction = function (game, gameref, combater, target, action, state, params)
{
    console.log("combataction  ",game, gameref, combater, target, action, state, params);
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.action = action;
    this.state = state;
    this.params = params;
    this.isReady = true;  
    
    this.target = target;
}
CombatAction.prototype.execute = function()
{
    this.state.inputHandler.pauseInput = true;
    console.log("Combat Action execute ",this.action);
    //
    if(this.action=="move")
    {
        this.combater.moveToSpotCombat(this.target,[{func:this.doFinish, para:[], removeself:false, callee:this, con:null, walkto:false}], this.combater.movementspeed);
    }
    else if(this.action=="shoot")//shoot
    {
        this.combater.shootGun(this.target, this.params[0], {func:this.doFinish, callee:this}, this, this.state);
    }
    else if(this.action=="useitem")//use item
    {
        console.log(this.targe, this.params);
        this.combater.douse();
    }   
    else if(this.action=="bullet")//use item
    {
        var weapon = this.params[0];
        var acc = this.params[1];
        var hit = this.params[2];
        //this.game, this.gameref, this, clickedObject, "bullet", this.state,[weapon, acc]
        //imagename, action, onhitaction, start, target
        console.log('fire state',this.state)
        this.gameref.bulletHandler.fireBullet("combat_actionpoints0001.png", this, this.combater, this.target, {func:this.doFinish, callee:this}, {weapon:weapon, acc:acc, hit:hit, state:this.state});
    } 
    else
        this.doFinish();
}
CombatAction.prototype.cleanup = function()
{
    
}
CombatAction.prototype.Update = function(elapse)
{
}
CombatAction.prototype.addActionToState = function(nextAction)
{
    this.state.placeAtFront(nextAction);
}
CombatAction.prototype.doFinish = function(nextState)
{
    console.log("combat action: doFinish",nextState,this.state)
    if(this.state!=null)
    {
        if(nextState!=null)
            this.state.placeAtFront(nextState);
        this.state.removeAction(this);//this should be just a pop
        this.state.NextTick();
    }
}

var PlayerDecide = function (game, gameref, combater, speed, state)
{
    this.game = game;
    this.gameref = gameref;
    this.combater = combater;
    this.state = state;
    
    this.isReady = true;
    this.isDone = false;
    
    this.maxActions = 2;
    //
}
PlayerDecide.prototype.Update = function(elapse)
{
}
PlayerDecide.prototype.onEnter = function(params)
{
    console.log('Playerdecide onEnter')
}
PlayerDecide.prototype.onExit = function(params)
{
    console.log('Playerdecide onExit')
}


PlayerDecide.prototype.execute = function()
{
    console.log("Player decide execute.", this.maxActions);
    if(this.maxActions<1)
    {
        this.state.removeAction(this);
        return;
    }
    this.state.inputHandler.pauseInput = false;
    this.state.statemachine.inputHandler.highlightplayer(this.combater);
    this.selectThis();
}
PlayerDecide.prototype.selectThis = function()
{
    console.log("Player decide select.",this.combater);
    this.state.placeAtFront(this);    
}
PlayerDecide.prototype.cleanup = function()
{
    
}
PlayerDecide.prototype.domove = function(spot)
{
    action = new CombatAction(this.game, this.gameref, this.combater, spot, "move", this.state);
    this.testEndOfTurn();
    this.state.addToActionsFront(action);
   // this.isDone = true;
}
PlayerDecide.prototype.dotouched = function(clickedObject)
{
    if(clickedObject.hostile)
    {
        var action;
        var weapon;
        //console.log(this.combater.currentSelectedWeapon);
        if(this.combater.currentSelectedWeapon)
        {
            weapon = this.combater.currentSelectedWeapon;
        }
        /*else if(this.combater.weapons.length>0)
        {
            weapon = this.combater.weapons[0];
        }*/
        console.log("weapon ",weapon)
        if(weapon!=null)
        {
            action = new CombatAction(this.game, this.gameref, this.combater, clickedObject, "shoot", this.state,[weapon]);
            this.testEndOfTurn();
            this.state.addToActionsFront(action);
        }
    }
}
PlayerDecide.prototype.testEndOfTurn = function()
{
    this.maxActions--;
    //this.state.removeTopAction();
    //if player has no more action remove from list
    console.log("actions: ", this.maxActions);
    if(this.maxActions<=0)
        this.state.removeAction(this);
}
PlayerDecide.prototype.endTurn = function()
{
    action = new CombatAction(this.game, this.gameref, this.combater, this.combater, "nothing", this.state,[]);
    this.state.addToActionsFront(action);
}
PlayerDecide.prototype.usePower = function(spot)
{
    if(this.combater.currentSelectedWeapon)
    {
        weapon = this.combater.currentSelectedWeapon;
    }
    if(weapon!=null)
    {
        action = new CombatAction(this.game, this.gameref, this.combater, this.combater, "useitem", this.state,[weapon]);
        this.testEndOfTurn();
        this.state.addToActionsFront(action);
    }
}


var Item = function(action)
{
    this.inventoryImg = action.movementspeed;
    this.buttonImg = action.shieldhp;
}
//
var Weapon = function (action)
{
    Item.call(this, action);
    
    this.weaponname = action.weaponname;
    this.dmg = action.dmg;
    this.range = action.range;
    this.acc = action.acc;
    
    this.clipsize = action.clipsize;
    
    this.AIPower = action.AIPower;//weight for AI attack, not in yet
    
    this.attackType = action.attackType;
    this.powerType = action.powerType;
    this.type = action.type;
    this.cost = action.cost;//points cost to use
    this.cooldown = action.cooldown;
    this.description = action.description;
    
    this.onCooldown = false;
    this.cooldownTimer = 0;
};
Weapon.prototype = Object.create(Item.prototype);
Weapon.constructor = Weapon;

Weapon.prototype.step = function(elapseTime)
{
    if(this.onCooldown)
    {
        this.cooldownTimer -= elapseTime;
        if(this.cooldownTimer<=0)
        {
            this.onCooldown = false;
            //throw done event... event dispatchre?
        }
    }
}
//different weapon types...
// cooldown, use energy, clipsize/multiple uses per cooldown
//
Weapon.prototype.use = function()
{
    if(this.onCooldown)
    {
        return false;
    }
    this.onCooldown = true;
    this.cooldownTimer = this.cooldown;
    return true;
}
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
    if(this.object.IsPlayer)
        return true;
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
    /*else
    {
        for(var x=0;x<GlobalEvents.actionMap.length;x++)
        {
             if(GlobalEvents.currentAction == GlobalEvents.actionMap[x].action && this.actionArray[GlobalEvents.actionMap[x].array])
                 return true;
        }
    }*/
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
GlobalEvents.MAGIC = 5;
GlobalEvents.COMBATSELECT = 6;  
        
GlobalEvents.actionMap = [
    {action:GlobalEvents.WALK, array:"OnTouch", condition:[]},
    {action:GlobalEvents.LOOK, array:"OnLook", condition:[]},
    {action:GlobalEvents.TALK, array:"OnTalk", condition:[]},
    {action:GlobalEvents.ITEM, array:"OnUseItem", condition:[]}
]
GlobalEvents.lastAction = GlobalEvents.DISABLE;
GlobalEvents._currentAction = GlobalEvents.WALK;

GlobalEvents.selectedItem = null;

Object.defineProperty(GlobalEvents, "currentAction", {
    get: function() {return GlobalEvents._currentAction },
    set: function(v) { 
        //if disabled, set any changes to what it will be set at when undisabled
        //don't do double disabled
        if(GlobalEvents._currentAction==GlobalEvents.DISABLE && v!=GlobalEvents.DISABLE)
        {
            GlobalEvents.lastAction = v;
            //console.log("s",GlobalEvents._currentAction,GlobalEvents.lastAction);
        }
        else
        {   
            GlobalEvents.lastAction = GlobalEvents._currentAction;
            GlobalEvents._currentAction = v; 
            GlobalEvents.refreshEvents(); 
            //console.log("d",GlobalEvents._currentAction,GlobalEvents.lastAction);
        }
    }//throw on change
});
GlobalEvents.gotoLastAction = function()
{
    GlobalEvents.currentAction = GlobalEvents.lastAction;
}
GlobalEvents.tempDisableEvents = function()
{
    //console.log("tempDisableEvents");
    GlobalEvents.currentAction = GlobalEvents.DISABLE;
    
    //GlobalEvents.lastAction = GlobalEvents._currentAction;
    //GlobalEvents._currentAction = GlobalEvents.DISABLE;
    //GlobalEvents.refreshEvents(); 
}
GlobalEvents.reEnableEvents = function()
{
    if(GlobalEvents._currentAction==GlobalEvents.DISABLE)
    {
        //console.log("reenable",GlobalEvents._currentAction,GlobalEvents.lastAction);
        GlobalEvents._currentAction = GlobalEvents.lastAction;
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
"use strict";
/*
this.jsondata.destroyed - object has been destroy

//move?, state?
//seperate the graphics from the data

//need to remember where they are and what state they are in for scene changes

extra states
state
destroyed - if destroyed don't recreate on enter


*/
var InteractiveObject = function (maingame, jsondata, map) 
{
    this.gameref = this.maingame = maingame;
    this.game = maingame.game;
    this.map = map;
    
    this.jsondata = jsondata;

    //this.jsondata.state = "idle";    
    this.posx;//sprite locations
    this.posy;
    this.currentTile=null;//moveable location
    this.hasstates = false;
    this.isCreated = false;
    this.eventDispatcher = new EventDispatcher(this.game,this.maingame,this);
    this.otherAnimations = [];
    
    this.sightRange = 4;
    
    this.baseImage;
    this.iso = null;
    this.notcreated = false;
    if(!this.IsPlayer)
        this.adjustVisible(1);
    this.lastpointer = null;
}
InteractiveObject.prototype = Object.create(Phaser.Group.prototype);
//InteractiveObject.prototype = Object.create(Phaser.Sprite.prototype);
InteractiveObject.constructor = InteractiveObject;

InteractiveObject.prototype.allowInputNow = function(val) 
{
    if(this.baseImage==null)
        return;
    this.baseImage.inputEnabled = val;
    if(this.baseImage.input!=null)
        this.baseImage.input.priorityID = 100;
}
InteractiveObject.prototype.dosetup = function() 
{
    //console.log(this.jsondata);
    this.setupArt(this.jsondata);
    this.footprint;//
    //this.events.onInputDown.add(this.handleClick, this);    
    
    //
    var actions = this.jsondata.triggers;
    this.applyInteractActions(actions);
    
    if(this.actor && this.actor.getValue("state")!=""){
        this.changeState(this.actor.getValue("state"));
    }
    else{
        if(this.jsondata.state1="")
            this.changeState(this.jsondata.state);
        else
            this.changeState("idle");
    }
    //
    //
    //this will move
    this.allowInputNow(true);
    this.setupReactToAction();
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnActivate", null);
    //
    //if(!this.notcreated)
    //    this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
    
    this.updateIso();
    this.finalSetup();
    //
}
InteractiveObject.prototype.updateIso = function()
{
    if(this.currentTile)
    {
        //console.log(this.currentTile.posx,)
        this.iso = this.map.spritegrid.projectGrid(this.currentTile.posx,this.currentTile.posy);
    }
}
InteractiveObject.prototype.finalSetup = function()     
{
    if(this.IsPlayer==true)
        this.changeState("idle");
}
InteractiveObject.prototype.applyInteractActions = function(actions)
{
    this.eventDispatcher.init(actions);
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="actorset")
        {
            this.actor = this.maingame.globalHandler.getActorByID(actions[i].id);
            //maingame.globalHandler.getActorByID
        }
        else if(actions[i].type=="walkTiles")
        {
            this.footprint = [];
            for(var j=0;j<actions[i].tiles.length;j++)
            {
                this.footprint.push(this.map.hexHandler.getTileByCords( actions[i].tiles[j].posx, actions[i].tiles[j].posy) );
            }
        }
        else if(actions[i].type=="CharacterSpawn")
        {   
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, actions[i].conditions);
            if( this.eventDispatcher.testConditions(con) )
            {
                var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
                if(enemy!=null && enemy.triggers!=null)
                {
                    this.applyInteractActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
            }
        }
        else if(actions[i].type=="animations")
        {
            this.applyAnimations(actions[i]);
        }
    }
}
InteractiveObject.prototype.applyAnimations = function(actions)
{
    var animations = actions.animations;
    var tempanimation;
    var complete;
    this.hasstates = true;
    //console.log("created",this.isCreated, this);
    if(!this.isCreated)
    {
        actions.spriteSheet = actions.spriteSheet || "actors2";
        this.createTempArt(actions.spriteSheet,"body1_human_idle_0001");
    }
    //
    for(var j=0;j<animations.length;j++)
    {
        if(animations[j].start==0 && animations[j].stop==0){
            tempanimation = this.baseImage.animations.add(animations[j].id, [animations[j].name+".png"], 1, animations[j].loop, false);
        }
        else{
            tempanimation =  this.baseImage.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(animations[j].name+"_", animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
        }
        if(animations[j].onComplete)
        {
            tempanimation.onComplete.add(function () {
                //console.log("onComplete");
                this.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
            }, {stateNum:j,caller:this});
        }
    } 
    //console.log(this.baseImage.animations);
    if(actions.otherName != null)
    {
        var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
        head.anchor.x = 0.5;
        head.anchor.y = 1.0;
        this.addChild(head);
        this.otherAnimations.push(head);
        
        this.addOtherAnimation(animations, head, false, actions.otherName);
    }  
    if(actions.weapon != null)
    {
        var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
        head.anchor.x = 0.5;
        head.anchor.y = 1.0;
        this.addChild(head);
        this.otherAnimations.push(head);
        this.setChildIndex(head,0);
        this.addOtherAnimation(animations, head, false, actions.weapon);
    }  
    this.savedAnimations = animations;
}
InteractiveObject.prototype.addOtherAnimation = function(animations, addTo, doOnComplete, otherName)
{
    var tempanimation;
    for(var j=0;j<animations.length;j++)
    {
        if(animations[j].start==0 && animations[j].stop==0){
            tempanimation = addTo.animations.add(animations[j].id, [otherName + animations[j].justName+".png"], 1, animations[j].loop, false);
        }
        else{
            tempanimation =  addTo.animations.add(animations[j].id, Phaser.Animation.generateFrameNames(otherName + animations[j].justName+"_", animations[j].start, animations[j].stop, ".png", 4), 12, animations[j].loop, false);
        }
        if(animations[j].onComplete && doOnComplete)
        {
            tempanimation.onComplete.add(function () {
                addTo.caller.callFunction(animations[this.stateNum].onComplete, animations[this.stateNum].onCompleteParams);
            }, {stateNum:j,caller:this});
        }
    }  
}
InteractiveObject.prototype.createTempArt = function(spritesheet,image) //character art or guy not yet spawned
{
    //console.log("createTempArt ", spritesheet,image);
    Phaser.Group.call(this, this.game, null);
    this.baseImage = this.game.make.sprite(
                        0,
                        0,
                       spritesheet, image+".png");
    //console.log("CREATE TEMP",spritesheet, image+".png");
    this.addChild(this.baseImage);
    this.map.objectGroup.add(this);
    this.baseImage.anchor.x = 0.5;
    this.baseImage.anchor.y = 1.0;
    this.isCreated = true;
    this.otherAnimations.push(this.baseImage);
    
    //console.log(this.posx, this.posy);
    if(this.posx != undefined && this.posy != undefined)
        this.setLocationByTile(this.map.hexHandler.getTileByCords(this.posx, this.posy));
}
InteractiveObject.prototype.setupArt = function(json) 
{
    if(json.name!=undefined && json.tilesetid!=undefined && json.name!=-1 && json.tilesetid!=-1)
    {
        //console.log("setupart", this, json.name);
        this.isCreated = true;
        console.log(json.name, json.tilesetid);
        var objectreference = this.map.getTile(json.name,json.tilesetid);
        //console.log(objectreference.spritesheet, objectreference.tile);
        var spotx = json.x || 0;
        var spoty = json.y || 0;

        this.posx = json.posx || 0;
        this.posy = json.posy || 0;
        var tile = this.map.hexHandler.getTileByCords(spotx,spoty);

        Phaser.Group.call(this, this.game, null);
        
        /*Phaser.Sprite.call(this, this.game, 
                           spotx + this.map.objectoffset.x,
                            spoty*-1 + this.map.objectoffset.y,
                           objectreference.spritesheet, objectreference.tile+".png");
        */
        
        console.log("setupArt", this, objectreference, objectreference.spritesheet, objectreference.tile);
        
        this.baseImage = this.game.make.sprite(spotx + this.map.objectoffset.x,
                            spoty*-1 + this.map.objectoffset.y,
                           objectreference.spritesheet, objectreference.tile+".png");
        this.addChild(this.baseImage);
        this.baseImage.anchor.x = 0.5;
        this.baseImage.anchor.y = 1.0;
        this.otherAnimations.push(this.baseImage);
        this.map.objectGroup.add(this);
    }
}
//
//  
InteractiveObject.prototype.changeState = function(newstate) 
{
    //need to test if state exists
    //console.log("caller is " + arguments.callee.caller.toString(), newstate);
    if(this.hasstates)
    {
        if(this.baseImage)
        {
            var nextAnimation = this.baseImage.animations.getAnimation(newstate);   
            //console.log(this,nextAnimation,this.baseImage.animations);
            
            if(nextAnimation)
            {
                //console.log("",this,this.baseImage, newstate);
                this.baseImage.play(newstate);

                for(var i=0;i<this.otherAnimations.length;i++)
                {
                    if(this.otherAnimations[i] != undefined && this.otherAnimations[i].animations.getAnimation(newstate) != undefined)
                       this.otherAnimations[i].animations.play(newstate);
                }

                if(this.actor)
                    this.actor.updateValue("state",newstate);
                this.jsondata.state = newstate;
                //console.log(this.jsondata, newstate);
            }
            else
            {
                console.log(this,newstate,"state doesn't exist.");
            }
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
//no events
//can't see
//no interactions
InteractiveObject.prototype.hideSelf = function() 
{
    this.baseImage.visible = false;  
}
InteractiveObject.prototype.showSelf = function() 
{
    this.baseImage.visible = true;
}
InteractiveObject.prototype.deSpawn = function() 
{
    this.destroySelf();
}
InteractiveObject.prototype.moveto = function(tox,toy) 
{
    if(tox!=null)
        var tile = this.map.hexHandler.getTileByCords(tox,toy);
    if(tile)
    {
        var currenttile = this.map.hexHandler.checkHex(this.x,this.y);
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
            if(this.map.hexHandler.areTilesNeighbors(this.footprint[i],fromtile))
                return true;
        }
    }
    if(fromtile==this.currentTile)
        return true;
    if(this.map.hexHandler.areTilesNeighbors(this.currentTile,fromtile))
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
    
    //Handles showing shadows
    if(Global.doShadows)
    {
        if(this.IsPlayer)
            this.map.doSight(tile, this.sightRange);
    }
}
 
InteractiveObject.prototype.destroySelf = function(elapseTime) 
{
    this.jsondata.destroyed = true;
    this.flushAll();
}
InteractiveObject.prototype.flushAll = function() 
{
    if(this.animations!=null)
    {
        this.animations.stop();
        this.animations.destroy();
    }
    this.eventDispatcher.destroy();
    if(this.baseImage)
    {
        this.baseImage.events.onInputUp.remove(this.handleClick, this);  
        this.baseImage.events.onInputOver.remove(this.handleOver, this);//for rollover
        this.baseImage.events.onInputOut.remove(this.handleOut, this);
    }
    this.destroy();
   // console.log(this,"- destroy -");
}
InteractiveObject.prototype.handleOver = function() 
{
    this.baseImage.tint = 0x00ffff;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = 0x00ffff;
    }
    
    if(this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this.jsondata.displayName, this.x, this.y);
    }
}
InteractiveObject.prototype.handleOut = function() 
{
    this.baseImage.tint = 0xffffff;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = 0xffffff;
    }
    
    if(this.maingame.textUIHandler)
    {
        this.maingame.textUIHandler.hideRollover();
    }
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
    if(this.baseImage==null)
        return;
    this.baseImage.events.onInputUp.add(this.handleClick, this);
    this.baseImage.events.onInputOver.add(this.handleOver, this);//for rollover
    this.baseImage.events.onInputOut.add(this.handleOut, this);
}
InteractiveObject.prototype.handleClick = function(touchedSprite, pointer) 
{
    console.log('handleClick ',this,touchedSprite, pointer, GlobalEvents.currentAction);
    if(pointer==this.lastpointer && pointer!=null)
    {
        console.log('** handleClick ** Ignore this touch.')
        return;
    }
    this.lastpointer = pointer;
    this.eventDispatcher.doAction("Any", this.map.playerCharacter);
    if(GlobalEvents.currentAction == GlobalEvents.WALK)
        return;
    else if(GlobalEvents.currentAction == GlobalEvents.TOUCH)
        this.eventDispatcher.doAction("OnTouch", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.LOOK)
        this.eventDispatcher.doAction("OnLook", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.TALK)
        this.eventDispatcher.doAction("OnTalk", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.ITEM)
        this.eventDispatcher.doAction("OnUseItem", this.map.playerCharacter);
    else if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
    {
        
        if(this.attackable && !this.dead)
        {
            console.log(this.maingame.gGameMode.mCurrentState.inputHandler)
            this.maingame.gGameMode.mCurrentState.inputHandler.clickedObject(this);
        }
    }
    if(pointer!=null)
        pointer.active = false;
    this.handleOut();
}
InteractiveObject.prototype.adjustVisible = function(newVisible)
{
    this.tint = 0xffffff * newVisible;
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
"use strict";
//characters that will be moving around the map using the patherfinder
//
//
var MovingCharacter = function (maingame, jsondata, map)
{
    InteractiveObject.call(this, maingame, jsondata, map);
    //
    this.oldTile=null;
    
    //
    this.path=null;
    this.pathlocation = 0;
    this.nextTile;
    
    this.moveState = "none";
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
    this.movementState = new StateMachine();
    this.movementState.add("idle", new IdleState(this.movementState, maingame.game, maingame, this));
    this.movementState.add("wander", new WanderState(this.movementState, maingame.game, maingame, this));
    this.movementState.add("path", new PathState(this.movementState, maingame.game, maingame, this));
    this.movementState.change("idle");
    //
    //if(!this.IsPlayer)
    //    console.log("not player")
    //    this.movementState.change("wander");
    //this.gGameMode.add("path", new NormalState(this.gGameMode, this.game, this));
    //
    this.applyMoverActions(actions);
    this.movetoCenterEvery = true;
    this.douse = true;
    //
    //this.inventory = [];
    this.limit = -1;
    //
    this.moveStraight = false;
    this.ignoreWalls = false;
};
MovingCharacter.prototype = Object.create(InteractiveObject.prototype);
MovingCharacter.constructor = MovingCharacter;
//
MovingCharacter.prototype.applyMoverActions = function(actions)
{
    for(var i=0;i<actions.length;i++)
    {
        if(actions[i].type=="mover")
        {
            //console.log(this);
            this.walkspeed = actions[i].walkSpeed;
        }
        else if(actions[i].type=="CharacterSpawn")
        {   
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, actions[i].conditions);
            if( this.eventDispatcher.testConditions(con) )
            {
                var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
                if(enemy!=null && enemy.triggers!=null)
                {
                    this.applyMoverActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
            }
        }
        else if(actions[i].type=="AnimatedBody")
        {
            var body = this.maingame.getGameData("AnimatedBodies",actions[i].body);
            if(body!=null && body.triggers!=null)
            {
                this.applyMoverActions(body.triggers);
                this.applyInteractActions(body.triggers);
                if(this.savedAnimations != undefined && actions[i].playerHead != "")
                {
                     var head = this.game.make.sprite(0, 0, "actors2", "head1_human_idle_0000.png");
                    head.anchor.x = 0.5;
                    head.anchor.y = 1.0;
                    this.addChild(head);
                    this.otherAnimations.push(head);

                    this.addOtherAnimation(this.savedAnimations, head, false, actions[i].playerHead);
                }  
            }
        }
    }
}

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
MovingCharacter.prototype.finalSetup = function()     
{
    //this.currentTile = null;
    //console.log('final setup')
    this.setLocationByTile(this.currentTile);
    this.currentTile.enterTile(this);
}
MovingCharacter.prototype.resetMoving = function()
{
    this.path = null;
    this.nextTile = null;
    this.dir.x = 0;
    this.dir.y = 0;
}
MovingCharacter.prototype.setLocation = function(inx,iny) 
{
    this.x = inx;
    this.y = iny;
}
MovingCharacter.prototype.setLocationByTile = function(tile) 
{
    if(tile==null)
        tile  = this.map.hexHandler.getTileByCords(this.posx, this.posy);
    this.x = tile.x+this.map.hexHandler.halfHex;
    this.y = tile.y+this.map.hexHandler.halfHexHeight;//-this.map.hexHandler.bottomOffset
    this.oldTile = tile;
    this.currentTile = tile;
    //
    this.updateLocation(tile);
    
    this.findtile();
    this.resetMoving();
    this.currentTile.changeWalkable(false, this);
    this.updateIso();
}
//this is only avaliable to players - for when we have multiple players moving around
MovingCharacter.prototype.gotoAnotherMap = function(map, tile) 
{
}
//
MovingCharacter.prototype.setDirection = function() 
{ 
    //console.log(this.nextTile.x,this.map.hexHandler.halfHex,this.nextTile.x+this.map.hexHandler.halfHex, this.nextTile.x-this.map.hexHandler.halfHex);
    //if(this.nextTile==null || this.map==null)
    //console.log("setDirection",this.nextTile.x,this.map.hexHandler.halfHex,this.x);
    //console.log("setDirection",this.nextTile.y,this.map.hexHandler.halfHexHeight,this.y);
    if(this.nextTile!=null)
    {
        this.dir.x =  this.nextTile.x+this.map.hexHandler.halfHex-this.x;//
        this.dir.y =  this.nextTile.y+this.map.hexHandler.halfHexHeight-this.y;//
        //this.dir.x =  this.nextTile.x-this.x;
        //this.dir.y =  this.nextTile.y+this.map.hexHandler.bottomOffset+this.map.hexHandler.halfHexHeight-this.y;
        this.dir.normalize();
    }
    else
    {
        this.dir.x = 0;
        this.dir.y = 0;
    }
}
MovingCharacter.prototype.setPath = function(path) 
{
    if(!path)
        return;
    if(path.length<=0)
        return;
    if(this.objectmovingto!=null && this.objectmovingto.footprint!=null)
    {
        this.movingtotile = this.map.hexHandler.findClosesInPath( this.objectmovingto.currentTile, this.objectmovingto.footprint, path);
    }
    
    this.path = path;
    this.pathlocation = 0;
    this.nextTile = path[this.pathlocation];//this.map.hexHandler.getTileByCords( path[this.pathlocation].x, path[this.pathlocation].y);
    this.setDirection();
    this.changeState("walk");
}
MovingCharacter.prototype.moveToObject = function(object, tile, actions)
{
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    //
    this.moveto(tile);
    //find closes hex
    this.actionsaftermove = actions;
    this.objectmovingto = object;
    this.douse = true;
}
MovingCharacter.prototype.moveToSpotByCoords = function(x, y, actions)
{
    var tile = this.maingame.map.hexHandler.getTileByCords(x, y);
    if(tile!=null)
        this.moveToSpot(tile, actions);
    this.limit = -1;
}
MovingCharacter.prototype.moveToSpot = function(tile, actions)
{
    this.actionsaftermove = actions;
    this.moveto(tile);
    this.actionsaftermove = actions;
    this.douse = false;
    this.limit = -1;
}

MovingCharacter.prototype.moveToSpotCombat = function(tile, actions, limit)
{
    //console.log("moveToSpotCombat",tile,actions,limit);
    this.actionsaftermove = actions;
    this.moveto(tile);
    this.actionsaftermove = actions;
    this.douse = false;
    this.limit = limit;
}
MovingCharacter.prototype.jumpTo = function(jumpToTile)
{
    /*var testx = jumpToTile.x+this.map.hexHandler.halfHex;
    var testy = jumpToTile.y+this.map.hexHandler.halfHexHeight;
    this.finishMove();
    this.setDirection();*/
    
    //old tile
    this.currentTile.changeWalkable(true);
    this.setLocationByTile(jumpToTile);
    this.finishMove(true);
}
MovingCharacter.prototype.moveto = function(moveIndex, selectedPosition)
{
    //selectedPosition used for moveStraight
    //console.log("moving character moveto ", moveIndex, this.currentTile);
    if(moveIndex!=null)
    {
        if(this.currentTile==null)
        {
            this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
            this.setLocationByTile(this.currentTile);
            this.updateIso();
        }
        if(this.objectmovingto!=null && this.objectmovingto.areWeNeighbours(this.currentTile))
        {
            //console.log("We are neighbours");
            this.atTargetTile();
        }
        else
        {
            //
            //straight line movement
            //var path = this.hexHandler.getlinepath(playertile,moveIndex);
            //this.playerCharacter.setPath(path);
            //
            if(this.moveStraight)
            {
                //console.log(this.currentTile.posx, this.currentTile.posy, moveIndex.posx, moveIndex.posy);
                
                this.path = this.map.hexHandler.getlinepath(this.currentTile, moveIndex);
                //console.log(this.path.length, this.path)
                if(this.path!=null && this.path.length > 0)
                {
                    this.pathlocation = this.path.length - 1;
                    this.nextTile = this.path[this.pathlocation];
                    //console.log("next tile ", this.nextTile.posx, this.nextTile.posy, this.nextTile.x, this.nextTile.y);
                    
                    this.movingtotile = moveIndex;
                
                    this.setDirection();
                    //console.log(this.dir)
                    this.changeState("walk");

                }
                this.clearTargetTile();
            }
            else if(this.currentTile.posx == moveIndex.posx && this.currentTile.posy == moveIndex.posy)
            {
                //console.log("same tile?")
                this.path = this.map.hexHandler.checkHex(moveIndex.posx,moveIndex.posy);
            }
            else
            {
                this.currentTile.changeWalkable(true);
                this.maingame.pathfinder.setCallbackFunction(this.movercallback, this);
                this.maingame.pathfinder.preparePathCalculation( [this.currentTile.posx,this.currentTile.posy], [moveIndex.posx, moveIndex.posy] );
                this.maingame.pathfinder.calculatePath();

                this.clearTargetTile();
                this.movingtotile = moveIndex;
            }
        }
    }
}
MovingCharacter.prototype.movercallback = function(path){
    //console.log("mover callback. "+path)
    path = path || [];
    path = this.map.hexHandler.pathCoordsToTiles(path);
    //console.log("mover callback. "+path.length)
    this.setPath(path);
    this.maingame.map.highlightHex.showPathCallback(path);
}
MovingCharacter.prototype.atTargetTile = function()
{
    if(this.actionsaftermove)
    {
        //should pass what type of action it is
        if(this.objectmovingto!=null)
        {
            //face object
        }
        if(this.douse)
        {
            this.changeState("use");
        }   
        else
        {
            this.changeState("idle");
            this.eventDispatcher.completeAction(this.actionsaftermove, true);
            this.clearTargetTile();
        }
    }  
    this.movementState.mCurrentState.atTargetTile();
}
MovingCharacter.prototype.clearTargetTile = function()
{
    this.actionsaftermove = null;
    this.movingtotile = null;
    this.objectmovingto = null;
}
MovingCharacter.prototype.findtile = function()
{
    var onmap = this.map.spritegrid.PosToMap(this.x,this.y);
   // onmap = this.map.spritegrid.GetMapCoords(onmap.x,onmap.y);
    if(onmap.x!=-1)
    {
        this.posx = onmap.x;
        this.posy = onmap.y;
    }
    //console.log(this.posx, this.posy);
}
//None, Wander, Path?
//should this be done with states?
MovingCharacter.prototype.changeMoveState = function(newstate, b, c, d) 
{
    //do this better
    var params = [];
    if(b)
        params.push(b);
    if(c)
        params.push(c);
    if(d)
        params.push(d);
    //
    if(newstate=="idle" || newstate=="wander" || newstate == "path")
    {
        this.moveState = newstate;
        this.movementState.change(newstate, params);        
    }
}
//
MovingCharacter.prototype.doUse = function()
{
    this.changeState("idle");
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
}
MovingCharacter.prototype.faceTarget = function(target)
{
    if(this.x<target.x)
        this.scale.x = 1;
    else
        this.scale.x = -1;
}
MovingCharacter.prototype.moveToCenter = function() 
{
    this.path = [this.currentTile];
    this.pathlocation = 0;
    this.nextTile = this.currentTile;
    this.setDirection();
}
MovingCharacter.prototype.finishMove = function(successful)
{
    //console.log("finish move")
    this.path = null;
    this.dir.x = 0;
    this.dir.y = 0;
    this.currentTile.enterTile(this);
    this.changeState("idle");
    
    //
    if(successful && this.objectmovingto!=null && this.currentTile!=null){
        if(this.objectmovingto.areWeNeighbours(this.currentTile)){
            this.atTargetTile();
        }
    }
    else
    {
        this.atTargetTile();
    }
    this.updateIso();
}
//
MovingCharacter.prototype.step = function(elapseTime) 
{
    if(this.notcreated)
        return;
    //
    if(this.currentTile==null)
    {
        this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
        this.setLocationByTile(this.currentTile);
    }
    if(this.oldTile==null)
        this.finalSetup();
    //
    if(this.movementState!=null)
    {
        this.movementState.update(elapseTime);
        this.movementState.render();
    }
    // if next tile is not walkable stop (move to middle?)   
    // handling if the map changes while walking?
    if(this.path!=null)
    {
        if(this.path.length>0)
        {
            //need to test if next spot is now not walkable
            //am I getting the wrong hex?
            this.currentTile = this.map.hexHandler.checkHex(this.x,this.y);
            this.updateIso();
            //console.log(this.oldTile, this.currentTile);
            if(this.currentTile==null)
            {
                //center old then try again
                return;
            }
            if(this.oldTile != this.currentTile)
            {
                this.oldTile.changeWalkable(true);
                this.oldTile = this.currentTile;
                this.currentTile.changeWalkable(false, this);
            }
            if(this.currentTile.posx==this.nextTile.posx && this.currentTile.posy==this.nextTile.posy)
            {
                this.pathlocation++;
                if(this.limit>0 && !this.IsPlayer)
                {
                    this.limit--;
                    console.log("step",this.limit);
                }
                //
                if(this.pathlocation>=this.path.length || this.limit==0)// at last tile, now walk to the center
                {
                    this.pathlocation=this.path.length;
                    var testx = this.currentTile.x+this.map.hexHandler.halfHex;
                    var testy = this.currentTile.y+this.map.hexHandler.halfHexHeight;
                    
                    var range = 3;
                    if(testx-range<this.x && testx+range>this.x && testy-range<this.y && testy+range>this.y)
                    {
                        this.x = testx;
                        this.y = testy;
                        this.finishMove(true);//testx,testy);
                    }
                    this.setDirection();
                }
                else//find next tile
                {
                    this.nextTile = this.path[this.pathlocation]; 
                    //console.log(this.nextTile);
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
    
    //this should be changed?
    if(this.dir.x<0)
        this.scale.x = -1;
    else if(this.dir.x>0)
        this.scale.x = 1;
    
    
}

    //this.changeState("idle");
    
    /*this.animations.currentAnim.onComplete.add(function () {
       this.changeState('idle', 30, true);
    }, this);*/
IdleState = function (statemachine, game, gameref, mover) {
    //this.mover = mover;
    //this.statemachine = statemachine;
    //this.game = game;
    //this.gameref = gameref;
}
IdleState.prototype = Object.create(EmptyState.prototype);
IdleState.constructor = IdleState;

/*IdleState.prototype.init = function(map) 
{
    
}
IdleState.prototype.update = function(elapsedTime) 
{
    
}
IdleState.prototype.render = function() 
{
    
}
IdleState.prototype.onEnter = function(params) 
{
    
}
IdleState.prototype.onExit = function() 
{
    
}*/
IdleState.prototype.atTargetTile = function()
{    
}
WanderState = function (statemachine, game, gameref, mover) {
    this.mover = mover;
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.goalTile = null;
}
WanderState.prototype = Object.create(EmptyState.prototype);
WanderState.constructor = WanderState;

WanderState.prototype.init = function(map) 
{
    console.log("init")
}
WanderState.prototype.update = function(elapsedTime) 
{
    if(this.goalTile==null)
    {
        this.atTargetTile();
    }
}
WanderState.prototype.render = function() 
{
    
}
WanderState.prototype.onEnter = function(params) 
{
    console.log("onEnter")
    this.goalTile = null;
    //find random location
    //goto location
    //find another location
    //
    //this.atTargetTile();
}
WanderState.prototype.onExit = function() 
{
    this.goalTile = null;
    this.mover.moveToCenter();
}
WanderState.prototype.atTargetTile = function()
{
    var randomlist = this.gameref.map.hexHandler.doFloodFill(this.mover.currentTile, 5, true);
    
    var choicex = Phaser.ArrayUtils.getRandomItem(randomlist);    
    this.goalTile = Phaser.ArrayUtils.getRandomItem(choicex);    
    this.mover.moveToSpot(this.goalTile);
}
PathState = function (statemachine, game, gameref, mover) {
    this.mover = mover;
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.path = null;
    this.startOfPath = null;
    this.currentPoint = null;
    this.onEnterDo = null;
    this.delay = 0;
}
PathState.prototype = Object.create(EmptyState.prototype);
PathState.constructor = WanderState;

PathState.prototype.init = function(map) 
{
}
PathState.prototype.update = function(elapsedTime) 
{
 
/*    if(this.onEnterDo)
    {
        console.log(" ", this.onEnterDo)
        
        if(this.onEnterDo.eventDispatcher)
            this.onEnterDo.eventDispatcher.doAction("OnEnter", this.mover);
        this.onEnterDo = null;
    }*/
    /*if(this.goalTile==null)
    {
        this.atTargetTile();
    }*/
    if(this.delay>0)
    {
        this.delay -= elapsedTime;
        if(this.delay<=0)
        {
            this.delay = 0;
            this.doTileState();
        }
    }
}
PathState.prototype.render = function() 
{
    
}
PathState.prototype.onEnter = function(params) 
{
    if(params.length<2)
        return;
    
    this.path = params[0];
    this.pathData = this.gameref.map.getPath(this.path);
    if(this.pathData==null)
        return;
    this.startOfPath = this.pathData.getPointByName(params[1]);
    this.currentPoint = this.startOfPath;
    var target = this.gameref.map.hexHandler.getTileByCords(this.currentPoint.posx, this.currentPoint.posy);
    if(params[2])
    {
        this.mover.jumpTo(target);
    }
    else
    {
        this.mover.moveToSpot(target);
    }
}
PathState.prototype.onExit = function() 
{
    this.path = null;
    this.startOfPath = null;
    this.currentPoint = null;
    this.mover.moveToCenter();
}
PathState.prototype.setPath = function(path, pathStart)
{
    
}
PathState.prototype.atTargetTile = function()
{
    this.onEnterDo = this.currentPoint;

    if(this.pathData==null)
        return;
    
    if(this.currentPoint.delay>0)
    {
        this.delay = this.currentPoint.delay;
    }
    else
    {
       this.doTileState(); 
    }
}
PathState.prototype.doTileState = function()
{
    this.currentPoint = this.pathData.getNextPoint(this.currentPoint);
    if(this.currentPoint==null)
    {
        //end path state
        this.mover.changeMoveState("idle");
    }
    else
    {
        //goto next path
        var target = this.gameref.map.hexHandler.getTileByCords(this.currentPoint.posx, this.currentPoint.posy);
        this.mover.moveToSpot(target);
    }
    
    //may move this later
    if(this.onEnterDo.eventDispatcher)
            this.onEnterDo.eventDispatcher.doAction("OnEnter", this.mover);
    this.onEnterDo = null;
}
"use strict";
var CombatCharacter = function (maingame, jsondata, map)
{
    MovingCharacter.call(this, maingame, jsondata, map);
    
    var actions = this.jsondata.triggers;
    this.weapons = [];
    this.weaponCatagories = [];
    this.numberOfActions = 2;
    this.isCombatCharacter = true;
    
    this.currentSelectedWeapon = null;
    this.hostile = false;
    this.displayNameText = "";
    this.dead = false;
    
    this.faction = [];
    
    this.applyCombatActions(actions);
};

CombatCharacter.prototype = Object.create(MovingCharacter.prototype);
CombatCharacter.constructor = CombatCharacter;

CombatCharacter.prototype.applyCombatActions = function(actions)
{
    //this.eventDispatcher.init(actions);
    
    for(var i=0;i<actions.length;i++)
    {
        var action = actions[i];
        if(action.type=="combatAttributes")
        {
            this.movementspeed = action.movementspeed;
            this.shieldhpmax = this.shieldhp = action.shieldhp;
            this.selfhpmax = this.selfhp = action.selfhp;
            this.attackable = action.attackable;
            this.hostile = action.hostile;
        }
        else if(action.type=="weaponsInventory")
        {
            var category = null;
            if(action.name!=null)
            {
                if(this.weaponCatagories[action.name]==null)
                    this.weaponCatagories[action.name] = [];
                category = this.weaponCatagories[action.name];
            }
            //
            for(var j=0;j<action.weapons.length;j++)
            {
                var weaponData = this.maingame.getGameData("Weapons",action.weapons[j]);
                if(weaponData!=null && weaponData.triggers!=null)
                {
                    var weapon = new Weapon(weaponData.triggers[0]);
                    this.weapons.push(weapon);
                    if(category!=null)
                    {
                        category.push(weapon);
                    }
                }
            }
        }  
        else if(action.type=="weapon")
        {
            var weapon = new Weapon(action);
            this.weapons.push(weapon);
        }
        /*else if(action.type=="CharacterSpawn")
        {
            this.displayNameText = actions[i].EnemyType;
            
            //console.log(this, this.displayNameText);
            var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);//this should be saved with here somehow
            if(enemy!=null && enemy.triggers!=null)
                this.applyCombatActions(enemy.triggers)
        }*/
        else if(actions[i].type=="CharacterSpawn")
        {   
            this.displayNameText = actions[i].EnemyType;
            this.name = actions[i].EnemyType;
            //
            var con = {logic:"Any",list:[]};
            this.eventDispatcher.applyConditions(con, actions[i].conditions);
            if( this.eventDispatcher.testConditions(con))
            {
                var enemy = this.maingame.getGameData("Enemy",actions[i].EnemyType);
                if(enemy!=null && enemy.triggers!=null)
                {
                    this.applyCombatActions(enemy.triggers);
                }
            }
            else
            {
                this.notcreated = true;
                //this.flushAll();   
                //flush all or keep away in case looking for data (flag?)    
            }
        }
        else if(action.type=="powerBoosts")
        {
            //attacks / actions
            /*
            - move
            - use item
            - own attacks (with stats)
            - hit
            */
            
            //boost and bonuses
            /*
            - bad eyesight -  50% chance to miss
            
            
            */
            /*
            
            - possible drops?
            - 
            
            */
        }   
    }
}
CombatCharacter.prototype.finalSetup = function()     
{
    if(this.currentTile!=null)
        this.setLocationByTile(this.currentTile);
    if(!this.notcreated)
    {
        
        this.setupHealthBar();
    }    
}

//
CombatCharacter.prototype.setupHealthBar = function()
{
    this.healthuigroup = this.game.add.group();
    this.shieldbar = [];
    this.healthbar = [];
    
    this.addChild(this.healthuigroup);
    
    var hpbar;
    var rowcount = 0;
    var count = 0;
    this.shieldhp = 0; //bg
    for(var i=0;i<this.shieldhp;i++)
    {
        hpbar = this.game.make.image(0,0,'gameplayinterface',"combat_actionpoints0001.png");

        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        hpbar.tint = 0xffffff;
        this.shieldbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    for(var i=0;i<this.selfhp;i++)
    {
        hpbar = this.game.make.image(0,0,'gameplayinterface',"combat_actionpoints0001.png");
        hpbar.tint = 0x0000ff;
        if(i%8==0)
        {
            rowcount++;
            count = 0;
        }
        hpbar.x = 15 * count;
        hpbar.y = 15 * rowcount;
        count++;
        hpbar.tint = 0xffffff;
        this.healthbar.push(hpbar);
        this.healthuigroup.add(hpbar);
    }
    
    //console.log(this.maingame.map.scaledto);
    this.healthuigroup.x = -this.width/2;
    this.healthuigroup.y = -this.height;//*this.maingame.map.scaledto;//-this.healthuigroup.height;
    this.healthuigroup.visible = false;
    
        //realtime combat
    this.startCombat()

}
CombatCharacter.prototype.boostShield = function(heal)
{
    this.shieldhp += heal;
    if(this.shieldhp>this.shieldhpmax)
        this.shieldhp = this.shieldhpmax;
    this.updateBars();
}
CombatCharacter.prototype.takeDmg = function(dmg)
{
    if(this.dead)//don't hurt dead characters
        return;
    this.shieldhp -= dmg;
    if(this.shieldhp<0)
    {
        this.selfhp += this.shieldhp;
        this.shieldhp = 0;
    }
    if(this.selfhp<=0)
    {
        //console.log(this,"die");
        this.changeState("die");
        this.eventDispatcher.testAction();
        this.dead = true;
        this.jsondata.destroyed = true;
        this.jsondata.dead = true;
        this.attackable = false;
        
        //make tile walkable after death. No need to litter the battlefield.
        this.currentTile.changeWalkable(true);
    }
    else
    {
        this.changeState("hurt");
    }
    this.updateBars();
}

CombatCharacter.prototype.doDead = function()
{
    this.currentTile.changeWalkable(true);
    
    this.eventDispatcher.doAction("OnDeath",this);
}
CombatCharacter.prototype.isAlive = function()
{
    if(this.selfhp<=0)
        return false;
    return true;
}
CombatCharacter.prototype.updateBars = function()
{
    for(var i=0;i<this.shieldbar.length;i++)
    {
        if(i>=this.shieldhp)
        {
            this.shieldbar[i].tint = 0x0000f0;
        }
        else
        {
            this.shieldbar[i].tint = 0xffffff;
        }
    }
    for(var i=0;i<this.healthbar.length;i++)
    {
        if(i>=this.selfhp)
        {
            this.healthbar[i].tint = 0x0000f0;
        }
        else
        {
            this.healthbar[i].tint = 0xffffff;
        }
    }
}
CombatCharacter.prototype.startCombat = function()
{
    //show health bar
    this.moveToCenter();
    this.healthuigroup.visible = true;

    // stop movement when in combat
    if(!this.dead)
        this.changeMoveState("idle");
}
CombatCharacter.prototype.endCombat = function()
{
    
    this.healthuigroup.visible = false;
    //hide health bar
    //give back control?
}
//this.overtint
//this.removetint
CombatCharacter.prototype.tintRed = function()
{
    this.doTint(0xff0000);   
}
CombatCharacter.prototype.tintYellow = function()
{
    this.doTint(0xff0000);
}
CombatCharacter.prototype.tintGreen = function()
{
    this.doTint(0x00ff00);
}
CombatCharacter.prototype.doRemoveTint = function()
{
    this.doTint(0xffffff);
}
CombatCharacter.prototype.doTint = function(myTint)
{
    this.baseImage.tint = myTint;
    
    for(var i=0;i<this.otherAnimations.length;i++)
    {
        if(this.otherAnimations[i] != undefined)
            this.otherAnimations[i].tint = myTint;
    }
}
//
//
//roller tints different if hostile
CombatCharacter.prototype.handleOver = function() 
{
    
    if(this.hostile)
    {
        this.tintRed();
    }
    else
    {
        this.tintGreen();
    }
    /*
    if selected weapon
    
    - determin range
    - determin acc
    - show acc
    
    if()
    {
    this.combater.currentSelectedWeapon
    
    
        //
        
    }*/
    
    //console.log(this.jsondata,this.parent.jsondata);
    if(this.maingame.gGameMode.currentState=="combat" && !this.dead)
    {
        this.maingame.gGameMode.mCurrentState.handleOver(this);
    }
       //if(this.maingame.gGameMode.mCurrentState.inputHandler.clickedObject(this);
    if(this.jsondata.displayName && this.jsondata.displayName!="")
    {
        this.maingame.textUIHandler.showRollover(this.jsondata.displayName,this.x,this.y);
    }
    //console.log(this,this.parent,this.displayNameText);
    
    if(this.displayNameText!="")
        this.maingame.textUIHandler.showRollover(this.displayNameText,this.x,this.y);
}
CombatCharacter.prototype.handleOut = function() 
{
    this.doRemoveTint();
    if(this.maingame.textUIHandler)
    {
        this.maingame.textUIHandler.hideRollover();
    }
    if(this.maingame.gGameMode.currentState=="combat")
    {
        this.maingame.gGameMode.mCurrentState.handleOut();
    }
}
//get movement range
CombatCharacter.prototype.findWalkable = function(moveIndex) 
{
    return this.map.hexHandler.doFloodFill(moveIndex, this.movementspeed, true);
}
CombatCharacter.prototype.findWalkableFromCurrent = function() 
{
    return this.map.hexHandler.doFloodFill(this.currentTile, this.movementspeed, true);
}
CombatCharacter.prototype.removeCurrentTile = function(path)
{
    for(var k=0;k<path.length;k++)
    {
        for(var i=0;i<path[k].length;i++)
        {
            if(path[k][i] == this.currentTile)
            {
                //remove it
            }
        }
    }
}
CombatCharacter.prototype.Speed = function()     
{
    return 1;
}
CombatCharacter.prototype.shootGun = function(target, weapon, afterAction, action, state)
{
    this.faceTarget(target);
    
    //do critical fail calcs
    
    this.changeState("shoot");
    this.actionsaftermove = [{func:this.afterShoot, para:[{weapon:weapon, target:target, afterAction:afterAction, action:action, state:state}], removeself:false, callee:this, con:null, walkto:false}];
}
CombatCharacter.prototype.doShoot = function()
{
    //animate shot
    
    this.changeState("idle");
    if(this.actionsaftermove)
    {
        this.eventDispatcher.completeAction(this.actionsaftermove, true);
    }
    this.clearTargetTile();
    this.actionsaftermove = null;
}
CombatCharacter.prototype.afterShoot = function(params)
{
    //console.log(params);
    var target = params.target;
    var weapon = params.weapon;
    var afterAction = params.afterAction;
    var action = params.action;
    var state = params.state;
    
    var distanceTo = this.maingame.map.hexHandler.testRange(target.currentTile, this.currentTile, false)
    var range = weapon.range;
    
    var acc = weapon.acc - (distanceTo/(range * 60))/5;
    //
    if(distanceTo > range * 60)
    {
        acc = 0;
    }
    var hit = true;
    if(Math.random()<acc)
    {
        hit = true;
        //target.takeDmg(weapon.dmg);
    }
    
    var action = new CombatAction(this.game, this.gameref, this, target, "bullet", state, [weapon, acc, hit]);
    //create bullet action
    //
    //
    //pass target, weapon, acc back to combat action to 
    // create a bullet
    /**/
        
    afterAction.func.apply(afterAction.callee,[action]);
}
//


"use strict";
var MonsterCharacter = function (maingame, jsondata, map) 
{
    CombatCharacter.call(this, maingame, jsondata, map);
    this.jsondata.state = "idle";
    this.IsPlayer = false;
    //this.movementState.change("wander");
    //this.walkspeed = 0.04;
};
MonsterCharacter.prototype = Object.create(CombatCharacter.prototype);
MonsterCharacter.constructor = MonsterCharacter;

MonsterCharacter.prototype.doDead = function()
{
}

"use strict";
// extra json - map

var PlayerCharacter = function (maingame, jsondata, map) 
{
    //MovingCharacter.call(this, maingame, jsondata, map);
    CombatCharacter.call(this, maingame, jsondata, map);
    this.jsondata.state = "idle";
    this.IsPlayer = true;
    this.movementState.change("idle");
    
    this.moveStraight = false;
    this.baseImage.events.onInputUp.add(this.handleSelect, this);//this is for select player if there are multiple selectable players
};
//PlayerCharacter.prototype = Object.create(MovingCharacter.prototype);
PlayerCharacter.prototype = Object.create(CombatCharacter.prototype);
PlayerCharacter.constructor = PlayerCharacter;

PlayerCharacter.prototype.doDead = function()
{
    this.currentTile.changeWalkable(true, this);
    this.eventDispatcher.doAction("OnDeath",this);
    
    this.jsondata.destroyed = false;
    this.jsondata.dead = false;
    this.jsondata.state = "idle";
    //activate death state
    //this.maingame.gGameMode.change("playerDead");
}
PlayerCharacter.prototype.handleSelect = function()
{
    //stop old character?
    console.log('****** select player')
    if(this.maingame.map.playerCharacter!=this)
        this.maingame.map.playerCharacter = this;
    
}

//*********** BulletHandler
/*
- choose shoot
- character shoots
- create bullet
- bullet moves
- do explosion
- do character reactions (at same time?)

simple:
- shoot
- end of shoot
- bullet create
- bullet moves
- target hurt or target dies


- how to handle explosions as well


//start shoot
//create bullet on frame + location
//


//handle flame thrower or just simply animation
// sprite instead of image
//play animation (that plays at the same times as character animation)

*/
BulletHandler = function(game, gameref, bulletGroup, spritesheet, defaultImageName){
    Phaser.Group.call(this, game);
    this.pool = new BasicObjectPool(this);
    this.game = game;
    this.gameref = gameref;
    this.bulletGroup = bulletGroup;
    
    this.spritesheet = spritesheet;
    this.defaultImageName = defaultImageName;
}
BulletHandler.prototype = Object.create(Phaser.Group.prototype);
BulletHandler.constructor = BulletHandler;
//
BulletHandler.prototype.createItem = function(){
    var bullet = new Bullet(this.game, this.gameref, -1000, 0, this.spritesheet, this.defaultImageName, this);
    console.log(bullet);
    //this.add(bullet);
    this.bulletGroup.add(bullet);
    return bullet;
}

BulletHandler.prototype.returnBullet = function(bullet){
    this.pool.returnObject(bullet);
}
//map change
BulletHandler.prototype.cleanupAllBullets = function(){
    var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        allbullets[i].killSelf();
    }
}
BulletHandler.prototype.fireBullet = function(imagename, action, start, target, afterAction, weaponParams){
    /*var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].over==object && allbullets[i].over!=null)
            allbullets[i].killSelf();
    }*/
    if(imagename==null)//|| speed = -1 : instant
    {
        
    }
    else
    {
        var bullet = this.pool.getObject();
        bullet.getReady(imagename, action, start, target, weaponParams, afterAction);
    }
}
BulletHandler.prototype.step = function(elapseTime){
    var allbullets = this.pool.allObjectsArray;
    for(var i=0;i<allbullets.length;i++){
        if(allbullets[i].inUse)
            allbullets[i].step(elapseTime);
    }
}
//*********** Bullet
var Bullet = function (game, gameref, x, y, spritesheet, imagename, handler) 
{
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.game = game;
    this.gameref = gameref;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    this.target = null;
    /*this.iso = new Vec3(objectPassed.x, objectPassed.y, objectPassed.z);
    this.isoorder = objectPassed.order;
    this.y += this.iso.y * -50;*/
    this.time;//
    this.inUse = false;
    this.handler = handler;
    this.dir = new Phaser.Point();
    this.weaponParams;
    this.iso = null;
    this.speed = 0.1875*2;
    
    this.tint = 0xff0055;
}
Bullet.prototype = Object.create(Phaser.Image.prototype);
Bullet.constructor = Bullet;
//
Bullet.prototype.step = function(elapseTime)
{
    var nextx = this.x + this.dir.x * this.speed * elapseTime;
    var nexty = this.y + this.dir.y * this.speed * elapseTime;
    if(this.prevx != nextx || this.prevy != nexty)
    {
        
        this.x = nextx;
        this.y = nexty;
        this.findtile();
        
        this.prevx = this.x;
        this.prevy = this.y;
        
        //this.setDirection();
        this.updateIso();
    }
    if(this.iso.x==this.target.iso.x&&this.iso.z==this.target.iso.z)
    {
        //stop();    
        this.killSelf();
        this.afterAction.func.apply(this.afterAction.callee,[]);
        this.target.takeDmg(this.weaponParams.weapon.dmg);
    }
    //console.log(this.posx,this.posy, this.target.posx, this.target.posy);
    //console.log(this.iso, this.target.iso);
}
Bullet.prototype.killSelf = function(){
    this.handler.returnBullet(this);
    this.visible = false;
    this.inUse = false;
}
Bullet.prototype.getReady = function(imagename, action, start, target, weaponParams, afterAction)
{
    this.inUse = true;
    this.visible = true;
    //
    //if(this.frameName!=imagename)
        //this.frameName = imagename;
    //
    this.start = start;
    this.target = target;
    this.afterAction = afterAction;
    this.weaponParams = weaponParams;
    //if miss pick random location
    //
    //action
    this.x = start.x;
    this.y = start.y;
    this.target = target;
    console.log(this.target);
    this.setDirection();
    
    this.posx = -1;
    this.posy = -1;
    this.prevx = -1;
    this.prevy = -1;
    this.findtile();
    this.updateIso();
}
Bullet.prototype.reset = function(){
    this.time = -1;
    this.over = null;
    this.inUse = false;
    this.visible = false;
}
Bullet.prototype.setDirection = function() 
{ 
    if(this.target!=null)
    {
        this.dir.x =  this.target.x-this.x;//+this.gameref.map.hexHandler.halfHex
        this.dir.y =  this.target.y-this.y;//+this.gameref.map.hexHandler.halfHexHeight
        this.dir.normalize();
    }
    else
    {
        this.dir.x = 0;
        this.dir.y = 0;
    }
}
Bullet.prototype.findtile = function()
{
    //console.log(this.x,this.y);
    var onmap = this.gameref.map.spritegrid.PosToMap(this.x,this.y);
    if(onmap.x!=-1)
    {
        this.posx = onmap.x;
        this.posy = onmap.y;
    }
    //this.currentTile = this.gameref.hexHandler.checkHex(this.x,this.y);
}
Bullet.prototype.updateIso = function()
{
    if(this.currentTile)
    {
        //console.log(this.currentTile.posx,)
        this.iso = this.gameref.map.spritegrid.projectGrid(this.currentTile.posx,this.currentTile.posy);
    }
}
Bullet.prototype.updateIso = function()
{
    this.iso = this.gameref.map.spritegrid.projectGrid(this.posx,this.posy);
    //this.iso.y += 50;
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
    this.displayPlayerText = false; //true will show the player text as a true text for audio. False just skips the player.
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

    if(currentDialog.Actor == this.playerActor.id && !this.displayPlayerText)
    {
        if(currentDialog.links.length>0)
            return this.getNextDialog(this.getDialogByID(currentDialog.links[0].DestID));
        else 
            return null;
    }
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
//HexHandler - Normal flat hex
//DiamondHexHandler - Squished hex. Width x2 Height.
//IsoHandler - Flat iso. Width x2 Height.
//Square - Width = Height Squares (may not need seperate)
//FlatSquare - Width x2 Height

/*
    Hex = 1,//
	Iso = 2,//
	HexIsoFallout = 4,//
	HexIsoFalloutStaggard = 8,//
	HexIso = 16,//?
	Square = 32
*/

// fix flood fills! Iso is right.


var HexHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    this.maingame = maingame;
    this.game = game;
    this.debug = true;
    this.tiletype = tiletype;
    
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
    this.bottomOffset = 0;//18;
    
    this.halfWithOffset = this.halfHexHeight+this.bottomOffset;
    
    this.gradient = (this.hexagonHeight/4)/(this.hexagonWidth/2);

    //var sprite = new Phaser.Image(game,0,0,"standardimages","hextiletouchmap");
    if(this.tiletype=="HexIso")
        this.sprite = new Phaser.Image(game,0,0,"standardimages","hexmousemap1");//mousemap
    else
        this.sprite = new Phaser.Image(game,0,0,"standardimages","mousemapiso");
    
    this.touchmap = new Phaser.BitmapData (game,"touchmap", 100, 50);//180, 90);//,
	this.touchmap.draw(this.sprite, 0, 0);
	this.touchmap.update();
    console.log("tester size: ",this.sprite.width,this.sprite.height)
    //this.maingame.map.highlightGroup.add(this.sprite);
    //this.sprite.anchor.x = 0.5;
    //this.sprite.anchor.y = 1.0;
    //console.log(this.sprite.anchor);
    this.tempcolour = {r:0,g:0,b:0}
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
    N = Math.ceil(N/this.cut,0)+1;
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
HexHandler.prototype.testRange = function(tilestart, tileend, ignoreWalkable)
{
    var p0 = new Point(tilestart.x+this.halfHex,
                       tilestart.y+this.halfHexHeight);
    var p1 = new Point(tileend.x+this.halfHex, 
                       tileend.y+this.halfHexHeight);

    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    /*var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    N = Math.ceil(N/cut);
    
    /*
    this.maingame.graphics.clear();
    this.maingame.graphics.lineStyle(10, 0xffd900, 1);
    this.maingame.graphics.moveTo(tilestart.x+ this.maingame.map.mapGroup.x+ this.halfHex, tilestart.y+ this.maingame.map.mapGroup.y+ this.halfHexHeight);
    this.maingame.graphics.lineTo(tileend.x+ this.maingame.map.mapGroup.x+ this.halfHex, tileend.y+ this.maingame.map.mapGroup.y+ this.halfHexHeight);
    
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }*/
    
    return N;
    
}
HexHandler.prototype.lineOfSite = function(tilestart, tileend)
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
    N = Math.ceil(N/cut)+1;
    
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    //console.log("start");
    for(var i=0;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x,points[i].y);
        if(overtile!=null)
        {
            //console.log("step ",overtile);
            if(overtile==tileend)
            {
                return true;
            }
            if(!overtile.walkable && overtile!=tilestart)
            {
                return false;
            }
            
        }
    }
    return true;
};
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

        this.maingame.graphics.moveTo(p0.x * this.maingame.map.mapGroup.scale.x + this.maingame.map.mapGroup.x, p0.y * this.maingame.map.mapGroup.scale.y + this.maingame.map.mapGroup.y);
        
        this.maingame.graphics.lineTo(p1.x * this.maingame.map.mapGroup.scale.x + this.maingame.map.mapGroup.x, p1.y * this.maingame.map.mapGroup.scale.y + this.maingame.map.mapGroup.y);
    }
    //
    var N = this.game.math.distance(p0.x,p0.y,p1.x,p1.y);
    var cut = this.hexagonWidth;
    if(this.hexagonWidth>this.hexagonHeight)
        cut = this.hexagonHeight;
    //cut = cut/2;
    N = Math.ceil(N/cut)+1;
    
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
        var overtile = this.checkHex(points[i].x, points[i].y);
        if(this.debug)
        {
            this.maingame.graphics.drawCircle(points[i].x * this.maingame.map.mapGroup.scale.x +this.maingame.map.mapGroup.x, points[i].y * this.maingame.map.mapGroup.scale.y+this.maingame.map.mapGroup.y, 10);
        }
        if(overtile!=null)
        {
            if(!overtile.walkable && !ignoreWalkable && overtile!=tilestart && overtile!=tileend)
            {
                break;
            }
            tiles.push(overtile);
            if(highlight)
                highlight.highlighttilebytile(i, overtile);//debug
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
    
    N = Math.ceil(N/cut)+1;
    var points = [];
    for (var step = 0; step <= N; step++) {
            var t = N == 0? 0.0 : step / N;
            points.push(this.lerp_point(p0, p1, t));
    }
    var tiles = [];
    var pasttile = null
    for(var i=1;i<points.length;i++)
    {
        var overtile = this.checkHex(points[i].x, points[i].y);
        if(overtile!=null)
        {
            //console.log(points[i].x, points[i].y, overtile.posx, overtile.posy, overtile.walkable)
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
HexHandler.prototype.doFloodFill = function(tile,range,ignorefirst)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    //if(!ignorefirst)
        this.fringes.push([tile]);
    //else
    //    this.fringes.push([]);

    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            if(n.posx % 2 == 1)
            {
                this.addNeighbor(n, 0,    -1, k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1, k);
                this.addNeighbor(n, +1,   +1, k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, -1,   1, k);
            }
            else
            {
                this.addNeighbor(n, -1,   -1, k);
                this.addNeighbor(n, -1,   0, k);
                this.addNeighbor(n, 0,    +1, k);
                this.addNeighbor(n, +1,   0, k);
                this.addNeighbor(n, 0,    -1, k);
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
    //console.log("HexHandler.pathCoordsToTiles")
    newpath = [];
    for(var i=0;i<path.length;i++)
    {
        var overtile = this.getTileByCords(path[i].x,path[i].y);
        //console.log(overtile.posx, overtile.posy, overtile.walkable);
        if(overtile!=null && overtile.walkable)
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

var InputHandler = function (game, gameref)
{
    
    this.game = game;
    this.gameref = gameref;
    
    this.dragScreen = false;
    this.didDrag = false;
    this.dragPoint = new Point(0,0);
    this.overGuy = null;
};
//
InputHandler.prototype.turnOn = function()
{
    this.gameref.input.addMoveCallback(this.onMove, this); 
    this.gameref.input.onDown.add(this.doDragScreen, this);
    this.gameref.input.onUp.add(this.clickedHex, this);
    this.gameref.input.priorityID = 0;
    //
    this.dragScreen = false;
    this.didDrag = false;
}
InputHandler.prototype.turnOff = function()
{
    console.log("inputhandler turnoff")
    this.gameref.input.deleteMoveCallback(this.onMove, this); 
    this.gameref.input.onDown.remove(this.doDragScreen, this);
    this.gameref.input.onUp.remove(this.clickedHex, this);
}

//
InputHandler.prototype.onMove = function(pointer, x, y)
{
    //console.log("move ",pointer.active);
    //if(!pointer.active)
    //    return;
    this.doDragScreenMove(x,y)
    
    if(GlobalEvents.currentAction != GlobalEvents.WALK)
    {
        //return;
    }
    if(this.game.global.pause)
    {
        return;
    }
    //these number have to be adjuested 94, 60?
    //85, 51
    //var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x+ this.gameref.map.hexHandler.halfHex/2) / this.gameref.map.scaledto;
    //var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y+ this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight) / this.gameref.map.scaledto;
    
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x) / this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y) / this.gameref.map.scaledto;

    //pointerx -= this.gameref.map.hexHandler.halfHex;
    //pointery += this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight;
    //console.log(this.gameref.input.worldX, this.gameref.input.worldY, this.gameref.map.mapGroup.scale, this.gameref.map.scaledto)
    //console.log(this.gameref.map.x, this.gameref.map.mapGroup.x)
    //console.log((this.gameref.input.worldX-this.gameref.map.mapGroup.x), (this.gameref.input.worldY-this.gameref.map.mapGroup.y))
    //console.log(pointerx,pointery)
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);
    
    /*var playertile = this.gameref.map.hexHandler.checkHex(
        this.gameref.map.playerCharacter.x + this.gameref.map.hexHandler.halfHex/2, this.gameref.map.playerCharacter.y + this.gameref.map.hexHandler.bottomOffset + this.gameref.map.hexHandler.halfHexHeight);*/
    //console.log(moveIndex.posx,moveIndex.posy);
    //var playertile = this.gameref.map.hexHandler.checkHex( this.gameref.map.playerCharacter.x, this.gameref.map.playerCharacter.y);
    //console.log("width "+moveIndex.width,moveIndex.height);
    //console.log(playertile,this.gameref.map.playerCharacter.x, this.gameref.map.playerCharacter.y);
    if(moveIndex)
    {
        //this.gameref.map.hexHandler.sprite.x = moveIndex.x;
        //this.gameref.map.hexHandler.sprite.y = moveIndex.y;// - this.gameref.map.hexHandler.bottomOffset;
        //this.tiletest.y = moveIndex.y;
    }
    //console.log(playertile);
    //console.log(playertile.posx,playertile.posy,this.playerCharacter.x,this.playerCharacter.y);
    //if(moveIndex)
    //    console.log(moveIndex.posx,moveIndex.posy);

    //console.log(this.input.worldX,this.gameref.map.mapGroup.x,this.input.worldX-this.gameref.map.mapGroup.x);
    if(GlobalEvents.currentAction == GlobalEvents.WALK)
    {
        //this.gameref.map.highlightHex.doShowPath(this.gameref.pathfinder,playertile,moveIndex);
        //this.gameref.map.hexHandler.dolines(playertile, moveIndex, false, //this.gameref.map.highlightHex);
        //var fridges = this.gameref.map.hexHandler.doFloodFill(moveIndex,3,false,true);
        //this.gameref.map.highlightHex.drawFringes(fridges);
        this.gameref.map.highlightHex.moveCursor(moveIndex);
    }
    else
    {
        this.gameref.map.highlightHex.cleanuptiles();
    }
    //console.log('mover on tile: ',moveIndex.moverontile);
    //this.gameref.map.highlightHex.highilightneighbors(playertile);
},
InputHandler.prototype.doDragScreen = function(pointer)
{
    //console.log("drag",pointer.active);
    if(!pointer.active)
        return;
    
    this.dragScreen = true;
    this.dragPoint.x = pointer.x;
    this.dragPoint.y = pointer.y;
}
InputHandler.prototype.doDragScreenMove = function(x,y)
{
    if(this.dragScreen)
    {
        var diffx = this.dragPoint.x-x;
        var diffy = this.dragPoint.y-y;

        this.dragPoint.x = x;
        this.dragPoint.y = y;

        if(diffx!=0||diffy!=0)
            this.didDrag = true;
        this.gameref.camera.adjustPosition(-diffx, -diffy);
        return;
    }
}
InputHandler.prototype.clickedObject = function(clickedObject)
{
}
InputHandler.prototype.clickedHex = function(pointer,eventt)
{
    if (!pointer.withinGame) { return; }
    //this needs to be blocked if clicking ui
    this.dragScreen = false;
    if(this.didDrag)//test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(!pointer.active)
        return;
    //
    if(GlobalEvents.currentAction != GlobalEvents.WALK)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    //
    this.handleCharMove();
} 
InputHandler.prototype.handleCharMove = function()
{
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx,pointery);
    
    
    if(moveIndex!=null)
    {
        if(moveIndex!=undefined)
        {
           
            if(moveIndex.moverontile!=null)
            {
                //this.gameref.map.highlightHex.moveCursor(moveIndex);
                moveIndex.moverontile.handleOver();
                this.overGuy = moveIndex.moverontile;
            }
        }
        //if moveIndex contains another player don't move
        if(this.game.currentAction==this.game.WALK && !(this.overGuy!=null && !this.overGuy.IsPlayer))
        {
            this.gameref.map.playerCharacter.moveto(moveIndex, {x:pointerx, y:pointery});
        }
    }
    else
    {
        this.overGuy = null;
    }
}
var InputHandlerBattle = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
    
    this.playerDecide = null;
    this.frindges = null;
    
    this.overEnemy = null;
    this.battleState = null;
    
    this.pauseInput = false;
};
InputHandlerBattle.prototype = Object.create(InputHandler.prototype);
InputHandlerBattle.constructor = InputHandlerBattle;

//
InputHandlerBattle.prototype.onMove = function(pointer, x, y)
{
    //console.log("move2 ",pointer.active);
    //if(!pointer.active)
    //    return;
    
    this.doDragScreenMove(x,y);
    
    if(this.overEnemy!=null)
    {
        this.overEnemy.handleOut();
        this.overEnemy = null;
    }
    //console.log("this.playerDecide ",this.playerDecide)
    if(this.playerDecide==null)
        return;
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        //return;
    if(!pointer.active)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;

    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);

    if(this.withinFringes(moveIndex))
        this.gameref.map.highlightHex.moveCursor(moveIndex);
    else 
        this.gameref.map.highlightHex.hideCursor();
    //attempting to make the tile select the player
    //select works, unselect doesn't
    if(moveIndex!=undefined)
    {
       //console.log(moveIndex.moverontile);
        if(moveIndex.moverontile!=null)
        {
            this.gameref.map.highlightHex.moveCursor(moveIndex);
            moveIndex.moverontile.handleOver();
            this.overEnemy = moveIndex.moverontile;
        }
    }
   else
    {
        
    }
},
InputHandlerBattle.prototype.withinFringes = function(moveIndex) 
{
    for(var i=0;i<this.frindges.length;i++)
    {
        for(var j=0;j<this.frindges[i].length;j++)
        {
            if(moveIndex==this.frindges[i][j])
                return true;
        }
    }
    return false;
}
InputHandlerBattle.prototype.hideInputAreas = function(combater) 
{
    this.gameref.map.highlightHex.cleanuptiles();
}

InputHandlerBattle.prototype.showAreaForMove = function(combater) 
{
    console.log('showareaformove **')
    this.frindges = combater.findWalkableFromCurrent();
    this.gameref.map.highlightHex.drawFringes(this.frindges);
}
InputHandlerBattle.prototype.clickedHex = function(pointer,eventt)
{
    //console.log("click",pointer,pointer.active,this.gameref.input.priorityID);
    //console.log('handleClick ',pointer);
    this.dragScreen = false;
    if(this.didDrag)        //test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(this.pauseInput)
        return;
    if(!pointer.active)
        return;
    if(this.playerDecide==null)
        return;
    
    
    if(this.overEnemy)
    {
        this.overEnemy.handleClick(pointer);
        if(this.overEnemy.IsPlayer)
        {
            this.clickedPlayer(this.overEnemy,pointer);
        }
    }
    
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x) /this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y) /this.gameref.map.scaledto;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx,pointery);

    if(moveIndex!=null)
    {
        if(this.game.currentAction==this.game.WALK)
        {
            if(this.withinFringes(moveIndex))
            {
                this.playerDecide.domove(moveIndex);
                this.gameref.map.highlightHex.cleanuptiles();
            }
        }
    }
} 
InputHandlerBattle.prototype.clickedObject = function(clickedObject)
{
    if(this.pauseInput)
        return;
    console.log('**** clickedObject ',clickedObject,this.playerDecide);
    if(this.playerDecide==null || !this.playerDecide.dotouched)
        return;
    this.playerDecide.dotouched(clickedObject);
}
InputHandlerBattle.prototype.clickedPlayer = function(actor)
{
    if(this.pauseInput)
        return;
    this.cleanUpPlayer();
    var playerChoice = this.battleState.mBattleStates.mCurrentState.findDecideByActor(actor);
    if(playerChoice)
        playerChoice.execute();
    else
        console.log("no player");
}
InputHandlerBattle.prototype.highlightplayer = function(actor, clicked)
{
    this.playerDecide = this.battleState.mBattleStates.mCurrentState.findDecideByActor(actor);
    this.showAreaForMove(actor);
}
InputHandlerBattle.prototype.cleanUpPlayer = function()
{
    this.playerDecide = null;
    this.hideInputAreas();
}
//if recieve both use the touched

var InputHandlerRealTimeBattle = function (game, gameref)
{
    InputHandler.call(this, game, gameref);
    
    
    this.playerDecide = null;
    this.frindges = null;
    
    this.overEnemy = null;
    this.battleState = null;
    
    //this.pauseInput = false;
};
InputHandlerRealTimeBattle.prototype = Object.create(InputHandler.prototype);
InputHandlerRealTimeBattle.constructor = InputHandlerRealTimeBattle;

InputHandlerRealTimeBattle.prototype.onMove = function(pointer, x, y)
{
    //console.log("move2 ",pointer.active);
    //if(!pointer.active)
    //    return;
    
    this.doDragScreenMove(x,y);
    
    if(this.overEnemy!=null)
    {
        this.overEnemy.handleOut();
        this.overEnemy = null;
    }
    //console.log("this.playerDecide ",this.playerDecide)
    //if(this.playerDecide==null)
    //    return;
    //if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        //return;
    if(!pointer.active)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    var pointerx = (this.gameref.input.worldX-this.gameref.map.mapGroup.x)/this.gameref.map.scaledto;
    var pointery = (this.gameref.input.worldY-this.gameref.map.mapGroup.y)/this.gameref.map.scaledto;
    var moveIndex =  this.gameref.map.hexHandler.checkHex(pointerx, pointery);

    //this.handleCharMove();
    if(moveIndex!=undefined)
    {
       //console.log(moveIndex.moverontile);
        if(moveIndex.moverontile!=null)
        {   
            moveIndex.moverontile.handleOver();
            this.overEnemy = moveIndex.moverontile;
        }
        
    }
    this.gameref.map.highlightHex.moveCursor(moveIndex);
}
InputHandlerRealTimeBattle.prototype.clickedHex = function(pointer,eventt)
{
    if (!pointer.withinGame) { return; }
    //this needs to be blocked if clicking ui
    this.dragScreen = false;
    if(this.didDrag)//test distance did it actually drag. or do I make a drag screen button?
    {
        this.didDrag = false;
        return;
    }
    //pointers will be false by other input ui methods so the character isn't randomly walking around
    if(!pointer.active)
        return;
    
    if(this.overEnemy)
    {
        this.overEnemy.handleClick(pointer);
        if(this.overEnemy.IsPlayer)
        {
            //this.clickedPlayer(this.overEnemy,pointer);
        }
    }
    //
    if(GlobalEvents.currentAction != GlobalEvents.WALK && GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        return;
    if(this.game.global.pause)
    {
        return;
    }
    //
    this.handleCharMove();
} 
InputHandlerRealTimeBattle.prototype.clickedObject = function(clickedObject)
{
    //if(this.pauseInput)
    //    return;
    console.log('**** clickedObject ',clickedObject,this.playerDecide);
    if(this.playerDecide==null || !this.playerDecide.dotouched)
        return;
    this.playerDecide.dotouched(clickedObject);
}
// 
var DiamondHexHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    HexHandler.call(this, maingame, game, hexagonWidth, hexagonHeight, tiletype);
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
    //checkx = Math.round(checkx);
    //checky = Math.round(checky);
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

    if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
    var tile = this.hexagonArray[i][j];
    //
    //var isInside = this.isInsideTriangle(new Point(tile.x,tile.y),new Point(tile.x+24,tile.y+16),new Point(tile.x,tile.y+16),new Point(checkx,checky));
    //console.log(isInside);
    if(tile==null)
        return;
    this.touchmap.update();
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
DiamondHexHandler.prototype.doFloodFill = function(tile,range,ignorefirst)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    //if(!ignorefirst)
        this.fringes.push([tile]);
    //else
    //    this.fringes.push([]);
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
//
var IsoHandler = function (maingame, game, hexagonWidth, hexagonHeight, tiletype) 
{
    HexHandler.call(this, maingame, game, hexagonWidth, hexagonHeight, tiletype);
}
IsoHandler.prototype = Object.create(HexHandler.prototype);
IsoHandler.constructor = IsoHandler;
//
IsoHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    //this is for top left
    //move to middle,bottem
    //+ width/2, + height 
    //180, 90
    var w = this.hexagonWidth;
    var h = this.hexagonHeight;
    
    var wc = (w);//w-2
    var hc = (h);//h-1
    
    var i = Math.floor(checkx / wc);//
    var j = Math.floor(checky / hc) * 2;// 

    var xQuadrant = Math.floor(checkx % wc);
    var yQuadrant = Math.floor(checky % hc);
    //console.log(checkx,checky,i,j,xQuadrant, yQuadrant, w, h);
    //
    //this.touchmap.x = checkx;
    //this.touchmap.y = checky;
    this.touchmap.update();
    this.touchmap.getPixelRGB (xQuadrant, yQuadrant, this.tempcolour);
    
    //console.log(checkx,checky,i,j,xQuadrant, yQuadrant, w, h, this.tempcolour);
    //
    if(this.tempcolour.r==0xFF && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0xFF0000: // red top left        
        i--;
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0xFF && this.tempcolour.b==0x00)
    {
        //case 0x00FF00: // green top right
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0x000000: // black bottom left
        i--;
        j++;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0xFF)
    {
        //case 0x0000FF: // blue bottom right
        j++;
    }
    //
    if(i==-1)
    {
        i=0;
        j++;
    }
    if(j==-1)
    {
        j=0;
        i++;
    }
    if(i==this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
        j--;
    }
    if(j==this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
        i--;
    }
    //
    if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
        
    tile = this.hexagonArray[i][j]; 
    return tile;
}
IsoHandler.prototype.areTilesNeighbors=function(starttile,testtile)
{
    if(starttile==null||testtile==null)
        return false;
    
    
    var posx = starttile.posx-testtile.posx;
    var posy = starttile.posy-testtile.posy;
    
    //console.log(posx,posy);
    //
    //console.log("IsoHandler",posx,posy);
    //
    if(starttile==testtile)
        return true;
    //console.log(starttile, starttile.y);
    if(starttile.y % 2 == 1)
    {
        if(posx==1&&posy==-1)return true;
        if(posx==1&&posy==1 )return true;
        if(posx==0&&posy==1)return true;
        if(posx==0&&posy==-1)return true;
    }
    else
    {        
        if(posx==0&&posy==-1)return true;
        if(posx==0&&posy==1)return true;
        if(posx==-1&&posy==1)return true;
        if(posx==-1&&posy==-1)return true;
    }
    return false;
}
IsoHandler.prototype.doFloodFill = function(tile,range,ignorefirst,testWalkbable)
{
    if(tile==null)
        return;
    this.visited = [];
    this.visited.push(tile);
    this.fringes = [];
    if(!ignorefirst)
    {
        this.fringes.push([tile]);
    }
    else
    {
        this.fringes.push([]);
        this.findNieghbors(tile,0,testWalkbable);
    }

    for(var k=1;k<=range;k++)
    {
        this.fringes.push([]);
        for(var i=0;i<this.fringes[k-1].length;i++)
        { 
            var n = this.fringes[k-1][i];
            this.findNieghbors(n,k,testWalkbable);
        }
    }
    return this.fringes;
};
IsoHandler.prototype.findNieghbors = function(n, k, testWalkbable)
{
    if(testWalkbable)
    {
        this.findNieghborsIfWalkable(n,k);
        return;
    }
    if(n.posy % 2 == 1)
    {
        this.addNeighbor(n, 1,    -1,k);
        this.addNeighbor(n, 1,     1,k);
        this.addNeighbor(n, 0,    1,k);
        this.addNeighbor(n, 0,   -1,k);
    }
    else
    {
        this.addNeighbor(n, 0,   -1,k);
        this.addNeighbor(n, 0,   1, k);
        this.addNeighbor(n, -1,    +1,k);
        this.addNeighbor(n, -1,   -1, k);
    }
}
IsoHandler.prototype.findNieghborsIfWalkable = function(n, k)
{
    if(n.posy % 2 == 1)
    {
        this.addNeighborTestWalkable(n, 1,    -1,k);
        this.addNeighborTestWalkable(n, 1,     1,k);
        this.addNeighborTestWalkable(n, 0,    1,k);
        this.addNeighborTestWalkable(n, 0,   -1,k);
    }
    else
    {
        this.addNeighborTestWalkable(n, 0,   -1,k);
        this.addNeighborTestWalkable(n, 0,   1, k);
        this.addNeighborTestWalkable(n, -1,    +1,k);
        this.addNeighborTestWalkable(n, -1,   -1, k);
    }
}
IsoHandler.prototype.addNeighborTestWalkable=function(fromtile,changex,changey,k)
{
    var x = fromtile.posx+changex;
    var y = fromtile.posy+changey;
    var tile = this.getTileByCords(x,y);
    if(tile!=null)
    {
        if(tile.walkHandler.isWalkable(fromtile.posx, fromtile.posy, changex, changey) && this.visited.indexOf(tile)==-1)
        {
            this.fringes[k].push(tile);
        }
        this.visited.push(tile);
    }
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
IsoHandler.prototype.checkHex=function(checkx, checky){
    if(!this.hexagonArray)
        return;
    //this is for top left
    //move to middle,bottem
    //+ width/2, + height 
    
    var i = Math.floor(checkx / (this.hexagonWidth - 2));
    var j = Math.floor(checky / (this.hexagonHeight - 1)) * 2;

    var xQuadrant = Math.floor(checkx % (this.hexagonWidth - 2));
    var yQuadrant = Math.floor(checky % (this.hexagonHeight - 1));

    /*if(i<0)
    {
        i = 0;
    }
    if(j<0)
    {
        j = 0;
    }
    if(i>=this.maingame.map.movementgrid.gridSizeX)
    {
       i = this.maingame.map.movementgrid.gridSizeX;
    }
    if(j>=this.maingame.map.movementgrid.gridSizeY)
    {
       j = this.maingame.map.movementgrid.gridSizeY;
    }
    */
    /*tile = this.hexagonArray[i][j]; 
    if(tile!=null)
    {
        //this.sprite.x = tile.x;
        //this.sprite.y = tile.y;
    }*/
    //
   /* this.touchmap.update();
    this.touchmap.getPixelRGB (xQuadrant, yQuadrant, this.tempcolour);
    
    //console.log(this.tempcolour,xQuadrant, yQuadrant,this.touchmap);
    //
    //console.log(this.tempcolour,xQuadrant, yQuadrant);
    if(this.tempcolour.r==0xFF && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0xFF0000: // red top left        
        i--;
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0xFF && this.tempcolour.b==0x00)
    {
        //case 0x00FF00: // green top right
        j--;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0x00)
    {
        //case 0x000000: // black bottom left
        i--;
        j++;
    }
    if(this.tempcolour.r==0x00 && this.tempcolour.g==0x00 && this.tempcolour.b==0xFF)
    {
        //case 0x0000FF: // blue bottom right
        j++;
    }
    //
    //console.log(j, this.maingame.map.movementgrid.gridSizeY);
    if(i==-1)
    {
        i=0;
        j++;
    }
    if(j==-1)
    {
        j=0;
        i++;
    }
    if(i==this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
        j--;
    }
    if(j==this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
        i--;
    }
    //re max
    /*if(i<0)
    {
        i=0;
    }
    if(j<0)
    {
        j=0;
    }
    if(i>=this.maingame.map.movementgrid.gridSizeX)
    {
        i=this.maingame.map.movementgrid.gridSizeX-1;
    }
    if(j>=this.maingame.map.movementgrid.gridSizeY)
    {
        j=this.maingame.map.movementgrid.gridSizeY-1;
    }*/
       
   /*if(i<0 || j<0 || j>=this.maingame.map.movementgrid.gridSizeY || i>=this.maingame.map.movementgrid.gridSizeX)
    {
        return;
    }
        
    tile = this.hexagonArray[i][j]; 
    return tile;
}
*/
var HighlightHex = function (game, maingame, hexhandler)
{
    Phaser.Group.call(this, game, null);
    this.game = game;
    this.maingame = maingame;
    
    this.hexhandler = hexhandler;
    this.showNumbers = false;
    
    this.neighborLights = [];
    
    this.showPath = true;//set this false to cancel any callbacks being shown
    
    this.type = "Iso";
    
    this.cursor;
}
HighlightHex.prototype = Object.create(Phaser.Group.prototype);
HighlightHex.constructor = HighlightHex;

HighlightHex.prototype.setup = function() 
{
    this.neighborLights = [];
    for(var i=0;i<210;i++)
    {
        var light = this.add(new Phaser.Group(this.game,null));
        var high;
        //console.log(this.hexhandler.tiletype);
        //
        if(this.hexhandler.tiletype=="HexIso")
            high = this.add(new Phaser.Sprite(this.game, 0,0, "standardimages", "tile_highlight0002"));
        else
            high = this.add(new Phaser.Sprite(this.game, 0,0, "standardimages", "halfiso_highlight"));
        //
        //high.anchor.x = 0.5;
        //high.anchor.y = 1.0;
        this.neighborLights.push(light);
        light.add(high);
        this.add(light);
        
        if(this.showNumbers)
        {
            var hexagonText = new Phaser.Text(this.game, 0, -this.hexhandler.halfHexHeight, i+"",{});
            hexagonText.font = "arial";
            hexagonText.fontSize = 12;
            //console.log(hexagonText)
            light.add(hexagonText);
            light.x = -1000;
        }
        light.x = -1000;
        light.visible = false;
        
    }
    
    //setup cursor
    var high;
    this.cursor = this.add(new Phaser.Group(this.game,null));
    if(this.hexhandler.tiletype=="HexIso")
        high = this.add(new Phaser.Sprite(this.game, 0,0, "standardimages", "tile_highlight0002"));
    else
        high = this.add(new Phaser.Sprite(this.game, 0,0, "standardimages", "halfiso_highlight"));
    //high.anchor.x = 0.5;
    //high.anchor.y = 1.0;
    //
    
    this.cursor.add(high);
    this.cursor.x = -1000;
    this.add(this.cursor);
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
    if(path==null||path.length==0)
        return;
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
}//this really should be asking hexhandler got get neighbours
HighlightHex.prototype.highilightneighbors = function(thistile) 
{
    if(thistile==null)
        return;
    if(this.type=="Iso")
    {
        if(thistile.posy % 2 == 1)
        {
            this.highlighttileoffset(0, 1,    -1, thistile);
            this.highlighttileoffset(1, 1,   1, thistile);
            this.highlighttileoffset(2, 0,    1, thistile);
            this.highlighttileoffset(3, 0,   -1, thistile);
        }
        else
        {
            this.highlighttileoffset(0,  0,  -1, thistile);
            this.highlighttileoffset(1,  0,   1, thistile);
            this.highlighttileoffset(2, -1,   1, thistile);
            this.highlighttileoffset(3, -1,  -1, thistile);
        }
    }
    if(this.type=="HexIsoFallout")
    {
        if(thistile.posx % 2 == 1)
        {
            this.highlighttileoffset(0, 0,    -1, thistile);
            this.highlighttileoffset(1, -1,   0, thistile);
            this.highlighttileoffset(2, 0,    +1, thistile);
            this.highlighttileoffset(3, +1,   +1, thistile);
            this.highlighttileoffset(4, +1,   0, thistile);
            this.highlighttileoffset(5, -1,   1, thistile);
        }
        else
        {
            this.highlighttileoffset(0, -1,   -1, thistile);
            this.highlighttileoffset(1, -1,   0, thistile);
            this.highlighttileoffset(2, 0,    +1, thistile);
            this.highlighttileoffset(3, +1,   0, thistile);
            this.highlighttileoffset(4, 0,    -1, thistile);
            this.highlighttileoffset(5, 1,   -1, thistile);
        }
    }
}
//
HighlightHex.prototype.highlighttileoffset = function(i,x,y,currenttile)
{
    
    var thetile = this.hexhandler.getTileByCords(currenttile.posx+x,currenttile.posy+y);
    if(thetile!=null)
    {
        //console.log(this.hexhandler);//,this.hexhandle.bottomOffset)
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = thetile.x;
        this.neighborLights[i].y = thetile.y - this.hexhandler.bottomOffset;
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
//
HighlightHex.prototype.moveCursor = function(currenttile)
{
   if(this.cursor==null)
        return;
    if(currenttile!=null)
    {
        this.cursor.visible = true;
        this.cursor.x = currenttile.x;
        this.cursor.y = currenttile.y - this.hexhandler.bottomOffset;
    }
    else
    {
        this.cursor.x = -1000;
        this.cursor.y = 0;
    } 
}
HighlightHex.prototype.hideCursor = function(i,currenttile)
{
    this.cursor.visible = false;
}
//
HighlightHex.prototype.highlighttilebytile = function(i,currenttile)
{
    if(this.neighborLights[i]==null)
        return;
    if(currenttile!=null)
    {
        //console.log(i,currenttile);
        this.neighborLights[i].visible = true;
        this.neighborLights[i].x = currenttile.x;
        this.neighborLights[i].y = currenttile.y - this.hexhandler.bottomOffset;
    }
    else
    {
        this.neighborLights[i].x = -1000;
        this.neighborLights[i].y = 0;
    }
}
"use strict";
var Map = function (game, gameRef) 
{
    this.gameRef = gameRef;
    this.game = game;
    
    this.playerCharacter;
    this.playerCharacters = [];
    
    this.highlightHex;
    this.hexHandler;
    this.startpos;

    
    this.interactiveObjects = [];
    this.staticObjects = [];
    this.paths = [];
    this.maskableobjects;
    this.spritegrid;
    this.movementgrid;
    this.objectoffset = new Point(0,0);
    this.highlightArray;
    
    this.mapGroup;
    this.scaledto = 1;
    
    this.redoMap = false;
}
Map.prototype.initialMap = function(mapData, gameData, playerData){
    
    this.mapData = mapData;
    this.gameData = gameData;
    this.playerData = playerData;
    //console.log(mapData, gameData, playerData);
    this.startpos = this.mapData.startPos;//.split("_");
    var currentmap = this.mapData.maps[this.startpos.map];
    //
    this.objectGroup = this.gameRef.add.group();
    this.highlightGroup = this.gameRef.add.group();
    this.hexagonGroup = this.gameRef.add.group();
    //
    this.mapGroup = this.gameRef.add.group();
    this.mapGroup.add(this.hexagonGroup);
    this.mapGroup.add(this.highlightGroup);
    this.mapGroup.add(this.objectGroup);
    //
    this.clonedCurrent = JSON.parse(JSON.stringify(currentmap));
    this.createMapTiles(currentmap);
}
Map.prototype.createMapTiles = function(passedMap){
    var hexagonArray = [];
    var waterTilesArray = [];
    //
    this.interactiveObjects = [];
    this.staticObjects = [];
    //

    //
    
    this.maskableobjects = [];
    this.walkableArray = [];
    //
    var mapscounter;
    for(mapscounter=0;mapscounter<passedMap.length;mapscounter++)
    {
        var layer1 = passedMap[mapscounter];
        if(layer1.handleMovement)
        { 
            var hexagonWidth = layer1.hexWidth;
            var hexagonHeight = layer1.hexHeight;
            this.objectoffset.x = hexagonWidth/2;
            this.objectoffset.y = hexagonHeight;
            console.log("height width ",hexagonWidth, hexagonHeight);
            //this.objectoffset.x = 0;//hexagonWidth + hexagonWidth/2;
            //this.objectoffset.y = 0;//hexagonHeight*2 + hexagonHeight/2;
            //console.log(this.objectoffset);
        }
    }
    for(mapscounter=0;mapscounter<passedMap.length;mapscounter++)
    //if(true)
    {
        //var layer1 = passedMap[1];
        var layer1 = passedMap[mapscounter];
        if(layer1.handleMovement)
        {
            if(layer1.tiletype=="Iso")
            {
                this.hexHandler = new IsoHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }                                
            else if(layer1.tiletype=="HexIso")
            {
                this.hexHandler = new DiamondHexHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }
            else
            {
                this.hexHandler = new HexHandler(this.gameRef, this.game, layer1.hexWidth, layer1.hexHeight, layer1.tiletype);
            }
            //Iso
            //
            //this.hexHandler = new DiamondHexHandler(this.gameRef,this.game, layer1.hexWidth,layer1.hexHeight);
        }

        var hexagonWidth = layer1.hexWidth;
        var hexagonHeight = layer1.hexHeight;

        this.gridSizeY = layer1.height;
        this.gridSizeX = layer1.width;
        var tiles = layer1.data;
        var tilesetid = layer1.tilesetid;
        var offsetx = layer1.offsetx || 0;
        var offsety = layer1.offsety || 0;
        var tiletype = layer1.tiletype;

        if(layer1.handleMovement)
        {
            this.movementgrid = new Grid(this, layer1);
        }
        if(layer1.handleSprite)
        {
            this.spritegrid = new Grid(this, layer1);
        }

        var objectName;
        var tilereference;
        var temptile;            
        var tempPoint = new Point(0,0);
        var offset = 0;

        //
        if(layer1.handleSprite)
        {
            for(var i = 0; i < this.gridSizeX; i ++)
            {

                if(layer1.handleMovement)
                    hexagonArray[i] = [];
                for(var j = 0; j < this.gridSizeY; j ++)
                {
                    objectName = tiles[j*this.gridSizeX+i];
                    //console.log(i,j);
                    //if(tilesetid==-1)
                    //    continue;
                    //if(
                    tilereference = this.getTile(objectName,tilesetid);
                    
                    tempPoint = this.spritegrid.GetMapCoords(i,j);
                    //this.x = tile.x;//+this.map.hexHandler.halfHex;
                    //this.y = tile.y;//-this.map.hexHandler.bottomOffset-this.map.hexHandler.halfHexHeight;
                    //console.log(this.objectoffset)
                    //tempPoint.x += -this.hexHandler.halfHex;
                    //tempPoint.y += +this.hexHandler.bottomOffset + this.hexHandler.halfHexHeight;
                    
                    //tempPoint.x += this.objectoffset.x;
                    //tempPoint.y += this.objectoffset.y;
                    if(layer1.handleMovement)//make tile
                    {
                        //var ret = this.spritegrid.projectGrid(tempPoint.x/(hexagonWidth/2), tempPoint.y/hexagonHeight);
                        var ret = this.spritegrid.projectGrid(i,j);
                        //console.log("*projectGrid*",ret);
                        //console.log("**projectIso**",this.spritegrid.projectIso(ret.x,0,ret.z),i,j);
                        
                        
                        temptile = new WalkableTile(this.game, tilereference.tile, tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this.gameRef);

                        hexagonArray[i][j]=temptile;//only if same
                    }
                    else
                    {
                        temptile = new GraphicTile(this.game, tilereference.tile, tilereference.spritesheet, i, j, tempPoint.x, tempPoint.y, this.gameRef);
                    }
                    this.hexagonGroup.add(temptile);
                    //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                }
            }
        }
        //
        this.highlightArray = [];
        if(layer1.handleMovement)
        { 
            for(var i = 0; i < this.gridSizeX; i ++)
            {
                if(!layer1.handleSprite)
                {
                    hexagonArray[i] = [];
                    this.highlightArray[i] = [];
                }
                this.walkableArray[i] = [];
                for(var j = 0; j < this.gridSizeY; j ++)
                {
                    this.walkableArray[i][j] = new Walkable(layer1.walkable[j*this.gridSizeX+i]);
                    //this.walkableArray[i][j] = 1;
                    if(!layer1.handleSprite)//no sprite - need to something to select (this might not need to be destroyed)
                    {
                        tempPoint = this.movementgrid.GetMapCoords(i,j);
                        hexagonArray[i][j] = new SimpleTile(this.gameRef,i,j,tempPoint.x,tempPoint.y);

                        //this needs to be switched out
                        /*if(this.game.global.showmovetile)
                        {
                            //var tile = new GraphicTile(this, "tile_highlight0002", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            var tile = null;
                            if(tiletype=="HexIso")
                                tile = new GraphicTile(this.game, "tile_highlight0001", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            else
                                tile = new GraphicTile(this.game, "halfiso_highlight", "standardimages", i, j, tempPoint.x, tempPoint.y, this);
                            if(this.walkableArray[i][j]==0)
                                tile.tint = 0xff0000;

                            this.highlightArray[i][j] = tile;
                            this.highlightGroup.add(tile);
                            //this.addLocationTextToTile(tempPoint.x,tempPoint.y,hexagonWidth,hexagonHeight,i,j);
                        }*/
                        //
                    }
                    //if(this.walkableArray[i][j] == 0)
                    //{                    
                        //hexagonArray[i][j].walkable = false;
                    hexagonArray[i][j].walkHandler = this.walkableArray[i][j];
                    //}
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
                        var isMoveSpecial = false;
                        var isCombatSpecial = false;
                        for(var j=0;j<objects[i].triggers.length;j++)
                        {
                            //console.log(objects[i].triggers[j].type);
                            //if(objects[i].triggers[j].type==null)
                            //    console.log(this,"");
                            
                            if(objects[i].triggers[j].type=="combatAttributes" || objects[i].triggers[j].type=="CharacterSpawn")
                            {
                                isCombatSpecial = true;
                                break;
                            }
                            if(objects[i].triggers[j].type=="mover")
                            {
                                isMoveSpecial = true;
                                break;
                            }
                        }
                        var interactiveobject;
                        
                        if(isCombatSpecial)
                        {
                            interactiveobject = new MonsterCharacter(this.gameRef, objects[i], this);
                            //interactiveobject = new CombatCharacter(this.gameRef, objects[i], this);
                        }
                        else if(isMoveSpecial)
                        {
                            interactiveobject = new MovingCharacter(this.gameRef, objects[i], this);
                        }
                        else
                        {
                            interactiveobject = new InteractiveObject(this.gameRef, objects[i], this);
                        }
                        this.interactiveObjects.push(interactiveobject);

                        interactiveobject.posx = objects[i].posx;
                        interactiveobject.posy = objects[i].posy;
                    }
                }
                else//this might not be complete true? //without any triggers the object is just a picture
                {
                    var objectreference = this.getTile(objects[i].name,objects[i].tilesetid);
                    if(objectreference!=null)
                    {
                        //var newtile = this.hexHandler.getTileByCords(objects[i].posx,objects[i].posy);
                        tempPoint = this.spritegrid.GetMapCoords(objects[i].posx,objects[i].posy);
                        //console.log(tempPoint, this.objectoffset, layer1.hexWidth, layer1.hexHeight);
                        //tempPoint.x -= this.hexHandler.halfHex;
                        //tempPoint.y += this.hexHandler.halfHexHeight;

                        //spotx = objects[i].x;
                        //spoty = objects[i].y * -1;
                        //tempPoint.y -= objects[i].y * 90;
                        var tileobject = new SimpleObject(this.game,
                                                                tempPoint.x+this.objectoffset.x,
                                                                tempPoint.y+this.objectoffset.y,
                                                                objectreference.spritesheet, objectreference.tile+"", objects[i]);
                        tileobject.posx = objects[i].posx;
                        tileobject.posy = objects[i].posy;
                        this.objectGroup.add(tileobject);
                        this.staticObjects.push(tileobject);
                        //
                        if(objects[i].maskable){//maskable objects to check when player/mouse move
                            this.maskableobjects.push(tileobject);
                        }
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
                        selectedtile.eventDispatcher = new EventDispatcher(this.game,this.gameRef,selectedtile);
                    }
                    selectedtile.eventDispatcher.receiveData(actionSpots[i].triggers);
                }
            }
        }
        if(layer1.paths)//how to deal with collisions of path names?
        {
            var paths = layer1.paths;
            var spotx,spoty;
            for(var i = 0; i < paths.length; i ++)
            {
                var path = new Path(this.game, this.gameRef, paths[i]);
                this.paths[path.name] = path;
            }
        }
    }
    //
    this.hexHandler.hexagonArray = hexagonArray;
    //this.hexHandler.waterTilesArray = waterTilesArray;
    //these should be screen width and height
    //this.mapGroup.y = (440-hexagonHeight*Math.ceil(this.gridSizeY/2))/2;

    //if(this.gridSizeY%2==0){
    //    this.mapGroup.y-=hexagonHeight/4;
    //}
    //this.mapGroup.x = 0;//(900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
    //this.mapGroup.x = (900-Math.ceil(this.gridSizeX)*hexagonWidth)/2;
    //if(this.gridSizeX%2==0){
    //    this.mapGroup.x-=hexagonWidth/8;
    //}
    //
    //console.log(this.mapGroup.x, this.mapGroup.y);
    this.highlightHex = new HighlightHex(this.game, this.gameRef, this.hexHandler);
    //this.game.add.existing(this.highlightHex);
    this.highlightHex.setup();
    this.highlightGroup.add(this.highlightHex);
    //this.highlightGroup.x -= this.objectoffset.x;
    //this.highlightGroup.y -= this.objectoffset.y;
    //
    //console.log(this.game);
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i])
            this.interactiveObjects[i].dosetup();
    }
    for(var i=0;i<this.staticObjects.length;i++)
    {
        if(this.staticObjects[i])
            this.staticObjects[i].dosetup(this.hexHandler);
    }
    
    //create player
    //console.log("play: ",this.playerCharacter);
    if(!this.playerCharacter)
    {
        //console.log("Create Character.");
        for(var x=0;x<1;x++)
        {
            this.playerCharacter = new PlayerCharacter(this.gameRef, this.playerData.Player, this);
            this.playerCharacter.dosetup();   
            this.playerCharacters.push(this.playerCharacter);
        } 
    }    
    for(var x=0;x<this.playerCharacters.length;x++)
    {
        this.playerCharacter = this.playerCharacters[x];
        this.playerCharacter.setLocationByTile(hexagonArray[this.startpos.x][this.startpos.y+x]);
        this.game.add.existing(this.playerCharacter);
        this.objectGroup.add(this.playerCharacter);
        this.playerCharacter.resetMoving();
    }
    //
    //console.log(this.walkableArray);
    //
    this.gameRef.pathfinder.setGrid(this.walkableArray, [1]);
    this.masker = new CheapMasker(this.game, this.gameRef, this.maskableobjects);
    //
    this.doZoom(this.scaledto);
    //start centered
     //console.log(this.mapGroup.x,this.mapGroup.y,hexagonWidth,Math.ceil(this.gridSizeX),this.mapGroup.scale.x);
    this.hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);

    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i].eventDispatcher)
            this.interactiveObjects[i].eventDispatcher.doAction("OnStart", null);
    }
    //this.gameRef.camera.setFollowObject(this.playerCharacter, true);
    //console.log("create new map");
    this.redoMap = false;
};
Map.prototype.doZoom = function(newscaledto)
{
    var oldsaledto = this.scaledto;
    var oldwidth = this.mapGroup.width;
    var oldheight = this.mapGroup.height;
    this.scaledto = newscaledto;
    this.mapGroup.scale.setTo(this.scaledto,this.scaledto);
    
    /*var diffwidth = this.mapGroup.width - oldwidth;
    var diffheight = this.mapGroup.height - oldheight;
    
    console.log(diffwidth,diffheight);
    this.mapGroup.x -= diffwidth * 0.05;*/
    //this.mapGroup.y += diffheight/2;
    
    //this.mapGroup.scale.setto()
    //console.log(this.mapGroup.scale, this.scaledto)
    //this.game.add.tween(this.mapGroup.scale).to( { x:this.scaledto, y:this.scaledto }, 2000, Phaser.Easing.Bounce.Out, false);
}
Map.prototype.update = function(elapsedTime)
{
    if(this.redoMap)
    {
        return;
    }
    this.hexHandler.update(elapsedTime);
    //
    if(!this.game.global.pause)
    {
        for(var x=0;x<this.playerCharacters.length;x++)
            this.playerCharacters[x].step(elapsedTime);
    }
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        this.interactiveObjects[i].step(elapsedTime);
    }
    //this.objectGroup.customSort (Utilties.customSortHexOffsetIso);
    this.objectGroup.customSort (Utilties.customSortIso);
}
Map.prototype.getCombatCharacters = function()
{
    var returnArray = [];
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if( (this.interactiveObjects[i].attackable || this.interactiveObjects[i].hostile || this.interactiveObjects[i].IsPlayer) && this.interactiveObjects[i].isAlive() )
        {
            returnArray.push(this.interactiveObjects[i]);
        }
    }
    return returnArray;
}
Map.prototype.addLocationTextToTile = function(x,y,width,height,i,j){
    var hexagonText = this.gameRef.add.text(x+width/2-5,y+height/2+3,i+","+j);
    //var hexagonText = this.gameRef.add.text(x,y,i+","+j);//- this.hexHandler.bottomOffset -this.hexHandler.halfHexHeight
    //var hexagonText = this.add.text(x+5,y+3,i+","+j);
    hexagonText.font = "arial";
    hexagonText.fontSize = 10;
    //hexagonText.font = 0xffffff;
    this.highlightGroup.add(hexagonText);
};

Map.prototype.flushEntireMap = function(){
    //this.playerCharacter.flushAll();
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        if(this.interactiveObjects[i])
            this.interactiveObjects[i].flushAll();
    }
    this.interactiveObjects = [];
    //
    for(var x=0;x<this.playerCharacters.length;x++)
        this.objectGroup.remove(this.playerCharacters[x]);
    //
    this.hexagonGroup.removeAll(true);
    this.highlightGroup.removeAll(true);
    this.objectGroup.removeAll(true);
    this.paths = [];
    //this.mapGroup.removeAll(true);

    
    //this.playerCharacter = null;
    this.hexHandler.flush();
}
Map.prototype.getTile = function(name, tilesetid){
    //console.log(tilesetid,name);
    
    if(tilesetid<0 || name == undefined || tilesetid == undefined || name == -1)
        return null;
    return {tile:this.mapData.tileSets[tilesetid][name], spritesheet:this.mapData.tileSets[tilesetid].tileset};
}
Map.prototype.userExit = function(object, data) {
    
    //object
    this.gameRef.gGameMode.change("normal");
    //object is only the tile
    //on do this if player
    //if(this.playerCharacter.currentTile
    this.redoMap = true;
    this.startpos.map = data.tmap;
    this.startpos.x = data.tx;
    this.startpos.y = data.ty;
    //
    GlobalEvents.flushEvents();
    this.flushEntireMap();
    //
    var currentmap = this.mapData.maps[this.startpos.map];
    //    
    //this.clonedCurrent = JSON.parse(JSON.stringify(currentmap));
    //JSON.stringify(currentmap) to save in database
    //
    console.log("build new-- ");
    this.createMapTiles(currentmap);        
}
//for use after death
Map.prototype.tryMapAgain = function() {
    this.redoMap = true;
    this.mapData.maps[this.startpos.map] = this.clonedCurrent;
    GlobalEvents.flushEvents();
    this.flushEntireMap();
    this.createMapTiles(this.clonedCurrent);
}
Map.prototype.refreshWalkablView = function(){
    for(var i = 0; i < this.gridSizeX; i ++)
    { 
        for(var j = 0; j < this.gridSizeY; j ++)
        {
            var tile = this.hexHandler.hexagonArray[i][j];
            tile.tint = "0x"+this.walkableArray[i][j].hex+this.walkableArray[i][j].hex+this.walkableArray[i][j].hex+this.walkableArray[i][j].hex+this.walkableArray[i][j].hex+this.walkableArray[i][j].hex;
            /*if(this.walkableArray[i][j].isWalkable==0)
            {
                console.log("not walk");
                tile.tint = 0xff00ff;
            }
            else
                tile.tint = 0xffffff;*/
        }
    }
}
Map.prototype.doSight = function(fromTile, distance)
{
    var fringes = this.hexHandler.doFloodFill(fromTile, distance, false, false);
    for(var i=0;i<fringes.length;i++)
    {
        for(var j=0;j<fringes[i].length;j++)
        {
            if(i==fringes.length-1)
                fringes[i][j].adjustVisible(0.3);
            else
                fringes[i][j].adjustVisible(1);
        }
    }
}
Map.prototype.getPath = function(pathName)
{
    return this.paths[pathName];
}




/*var Cell = function (game, gameRef) 

Cell.prototype.update = function(elapsedTime)
{
    if(this.redoMap)
    {
        return;
    }
    //this.hexHandler.update(elapsedTime);
    //
    if(!this.game.global.pause)
    {
        for(var x=0;x<this.playerCharacters.length;x++)
            this.playerCharacters[x].step(elapsedTime);
    }
    for(var i=0;i<this.interactiveObjects.length;i++)
    {
        this.interactiveObjects[i].step(elapsedTime);
    }
    //this.objectGroup.customSort (Utilties.customSortHexOffsetIso);
    this.objectGroup.customSort (Utilties.customSortIso);
}*/
var OtherMap = function (maingame) 
{
    this.maingame = maingame;
    this.game = maingame.game;
    //
    this.walkableArray = [];
    this.interactiveObjectDatas = [];
};
var Path = function(game, gameref, pathData)
{
    this.game = game;
    this.gameref = gameref;
    this.name = pathData.name;
    this.pathData = pathData.path;
    //find tile? for each path
    //prept actions for tiles - mostly just onenter
    
    this.pathPoints = [];
    for(var x = 0; x<this.pathData.length; x++)
    {
        this.pathPoints[this.pathData[x].name] = this.pathData[x];
        if(this.pathData[x].triggers)
        {
            if(!this.pathData[x].eventDispatcher)
            {
                this.pathData[x].eventDispatcher = new EventDispatcher(this.game, this.gameRef, this.pathData[x]);
            }
            this.pathData[x].eventDispatcher.receiveData(this.pathData[x].triggers);
        }
    }
}
Path.prototype.initialPath = function()
{
    
}
Path.prototype.getNextPoint = function(currentPoint)
{
    if(currentPoint.next==null)
        return null;
    return this.pathPoints[currentPoint.next];
}
Path.prototype.getPointByName = function(pointName)
{
    return this.pathPoints[pointName];
}
/*

 {
"name": "PathTest1_9",
"x": -6,
"y": -122,
"posx": 0,
"posy": 6,
"delay": 0,
"triggers": [{
    "type": "interacttrigger",
    "trigger": "OnEnter",
    "once": false,
    "walkto": false,
    "actions": [{
        "type": "THIS",
        "function": "changeMoveState",
        "parameters": "path,PathTest1,PathTest1_0,true"
    }],
    "conditions": {
        "logic": "All",
        "conditions": []
    }
                        
                        
                        

        "name": "PathTest1",
				"path": [{
					"name": "PathTest1_0",
					"x": 452,
					"y": 6,
					"posx": 4,
					"posy": 1,
					"delay": 0,
					"next": "PathTest1_1"
				}, {
					"name": "PathTest1_1",
					"x": 701,
					"y": -177,
					"posx": 7,
					"posy": 8,
					"delay": 2000,
					"next": "PathTest1_2"
				}
                
*/
var PlayerCamera = function (game, gameref)
{
    
    this.game = game;
    this.gameref = gameref;
    
    this.following = null;
    
    this.movespeed = 1;
    
    this.followMapBoundaries = false;
};

PlayerCamera.prototype.moveTo = function(x, y)
{
    
}
PlayerCamera.prototype.jumpTo = function(x, y)
{
    this.gameref.map.mapGroup.x = x;
    this.gameref.map.mapGroup.y = y;
}
PlayerCamera.prototype.setFollowObject = function(objectToFollow, jumpNow)
{
    this.following = objectToFollow;
    //if(jumpNow)
    //    this.jumpTo(this.following.x, this.following.y);
}
PlayerCamera.prototype.stopFollow = function()
{
    this.following = null;
}
PlayerCamera.prototype.adjustPosition = function(x, y)
{
    this.gameref.map.mapGroup.x += x;
    this.gameref.map.mapGroup.y += y;
    //console.log(this.gameref.map.mapGroup.x,this.gameref.map.mapGroup.y);
}
PlayerCamera.prototype.step = function(elapsedTime)
{
    if(this.following!=null)
    {
        var newx = (this.game.world.width/2)-(this.following.x * this.gameref.map.scaledto);
        var newy = (this.game.world.height/2)-(this.following.y * this.gameref.map.scaledto);
        
        this.jumpTo(newx, newy);
    }
}
PlayerCamera.prototype.setinit = function()
{
    var mapgroup = this.gameref.map.mapGroup;
    var map = this.gameref.map;

    mapgroup.x = (this.game.world.width/2 - map.objectoffset.x * map.gridSizeX * mapgroup.scale.x);
    mapgroup.y = (this.game.world.height/2 - map.objectoffset.y/2 * map.gridSizeY/2 * mapgroup.scale.y);
        
    /*mapgroup.x = (900 - map.objectoffset.x * 2 * (Math.ceil(map.gridSizeX)+0.7) * mapgroup.scale.x);
    mapgroup.y = (440 - map.objectoffset.y * (Math.ceil(map.gridSizeY/2)-0.3) * mapgroup.scale.y);*/
}
   
"use strict";
//SimpleObject
//Walkable
//Grid
//SimpleTile
//GraphicTile
//BaseTile
//WalkableTile
//WaterTile


var SimpleObject = function (game, x,y, spritesheet, imagename, objectPassed) 
{
    //console.log(x,y,imagename);
    if(imagename=="undefined.png")
        imagename = "bushSand.png";
    Phaser.Image.call(this, game, x, y, spritesheet, imagename);
    this.gameref = game;
    this.posx;
    this.posy;
    this.anchor.x = 0.5;
    this.anchor.y = 1.0;
    //
    //if(objectPassed.x!=n)
    this.iso = new Vec3(objectPassed.x, objectPassed.y, objectPassed.z);
    this.isoorder = objectPassed.order;
    //for now. This might be changed.
    this.y += this.iso.y * -50;
    if(Global.doShadows)
        this.adjustVisible(0);
    
    //this.staticobjects
}
SimpleObject.prototype = Object.create(Phaser.Image.prototype);
SimpleObject.constructor = SimpleObject;
//
SimpleObject.prototype.adjustVisible = function(newVisible)
{
    this.tint = 0xffffff * newVisible;
}
SimpleObject.prototype.dosetup = function(hexHandler)
{
    //find tile based on posx, posy
    var tile = hexHandler.getTileByCords(this.posx,this.posy);
    //console.log(tile);
    if( tile != null)
    {
        tile.staticobjects.push(this);
    }
}
//
var Walkable = function(valueIn)
{
    var binaryNumber = Number(valueIn).toString(2);
    //if(binaryNumber!=1111)
    //    console.log(binaryNumber,this)
    if(binaryNumber & 1000)
        this.l = 1
    else
        this.l = 0
    if(binaryNumber & 100)
        this.u = 1
    else
        this.u = 0
    if(binaryNumber & 10)
        this.r = 1
    else
        this.r = 0
    if(binaryNumber & 1)
        this.d = 1
    else
        this.d = 0
    this.hex = parseInt(valueIn, 10).toString(16)
    //console.log(this.hex);
    //if(this.d==0 && binaryNumber!=0000)
    //    console.log(arrayIn, binaryNumber, this)
    //if(binaryNumber==0000)
    //    console.log(arrayIn, this)
    this.walkable = true;
    
    if(this.l==0 && this.u==0 && this.r==0 && this.d==0)
    {
        this.walkable = false;
    }    
}
Walkable.prototype.isWalkable = function(atx, aty, dirx, diry)
{
    //console.log("walkable set to: ",this.walkable);
    if(!this.walkable)//if not walkable can't enter.
        return 0;
    //use location and direction to determine cost.
    
    if(aty % 2 == 1)
    {
        if(dirx == 1 && diry == -1)
            return this.u;
        if(dirx == 1 && diry == 1)
            return this.r;
        if(dirx == 0 && diry == 1)
            return this.d;
        if(dirx == 0 && diry == -1)
            return this.l;
    }
    else
    {
        if(dirx == 0 && diry == -1)
            return this.u;
        if(dirx == 0 && diry == 1)
            return this.r;
        if(dirx == -1 && diry == 1)
            return this.l;
        if(dirx == -1 && diry == -1)
            return this.d;
    }
    return 1;
}
//
var Grid = function(maingame, layer1)
{
    this.maingame = maingame;
    this.width = layer1.hexWidth;
    this.height = layer1.hexHeight;

    this.gridSizeY = layer1.height;
    this.gridSizeX = layer1.width;
    this.offsetx = layer1.offsetx || 0;
    this.offsety = layer1.offsety || 0;
    this.type = layer1.tiletype;
    
    this.coords = new Point(0,0);
}
Grid.prototype.projectIso = function(x, y, z) 
{
    return {
        x: Math.floor((x - z)/2),
        y: Math.abs(x+z)
    };
}
Grid.prototype.projectGrid = function(x, y) 
{
    //ignore y since all grids?
    var x0 = Math.floor(y/2 - x);
    var z0 =  y - x0;
    x0 = -1 * x0;
    z0 = -1 * Math.abs(z0);
    return new Vec3(x0, 0, z0);
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
    else if(this.type=="Iso")
    {
        //this.coords.x = i * (this.width - 2) + ((j % 2) * ((this.width / 2) - 1));          
    //   this.coords.y = j * ((this.height - 1) / 2);
        
       
        this.coords.x = i * (this.width) + ((j % 2) * ((this.width / 2)));          
        this.coords.y = j * ((this.height) / 2);
        //this.coords.x += 16;
        //this.coords.y -= 10;
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
    if(this.coords==undefined)
        this.coords = new Point();
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
    else if(this.type=="Iso")
    {
        
        var tile = this.maingame.hexHandler.checkHex(x,y);
        //console.log(tile);
        if(tile!=undefined)
        {
            this.coords.x = tile.posx;
            this.coords.y = tile.posy;
        }
        else
        {
            this.coords.x = -1;
            this.coords.y = -1;  
        }
        //this.coords.x = x * (this.width) + ((y % 2) * ((this.width / 2)));          
        //this.coords.y = y * ((this.height) / 2);
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
    this.walkHandler;  
    this.openair = true;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
    this.moverontile = null;
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
}
SimpleTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
SimpleTile.prototype.changeWalkable = function(walkableto, mover) 
{
    console.log("updatewalkable",this.maingame.updatewalkable);
    
    if(walkableto==true||walkableto=="true")
        //this.maingame.walkableArray[this.posx][this.posy] = 1;
        walkHandler.walkable = 1;
    else
        walkHandler.walkable = 0;
        //this.maingame.walkableArray[this.posx][this.posy] = 0;
    if(mover!=null)
        this.moverontile = mover;
    else 
        this.moverontile = null;
    this.walkable = walkHandler.walkable;
    this.maingame.updatewalkable = true;
}
/*SimpleTile.prototype.setWalkArray = function(newarray) 
{
    this.walkarray = newarray;
    if(!walkarray[0] && !walkarray[1] && !walkarray[2] && !walkarray[3])//is never walkable
        this.walkable = false;
    this.walkable = true;
}*/
SimpleTile.prototype.fillTile = function(fillingObject) 
{
    console.log("updatewalkable fillTile",this.maingame.updatewalkable);
    
    /*if(walkableto==true||walkableto=="true")
        //this.maingame.walkableArray[this.posx][this.posy] = 1;
        walkHandler.walkable = 1;
    else
        walkHandler.walkable = 0;
        //this.maingame.walkableArray[this.posx][this.posy] = 0;

    this.walkable = walkHandler.walkable;
    this.maingame.updatewalkable = true;*/
}
SimpleTile.prototype.enterTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter",enterer);
    this.moverontile = enterer;
};
SimpleTile.prototype.leaveTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnLeave",enterer);
    this.moverontile = null;
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
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
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
    //this.anchor.x = 0.5;
    //this.anchor.y = 1.0;
    
    this.iso = null;//new Vec3(-1,-1,-1);
    this.isoorder = -1;
    //console.log(tileName, this.width, this.height)
    this.staticobjects = [];
}
BaseTile.prototype = Object.create(Phaser.Sprite.prototype);
BaseTile.constructor = BaseTile;

BaseTile.prototype.callFunction = function(fnstring,fnparams) 
{
    var fn = window[fnstring];
    if (typeof fn === "function") fn.apply(null, fnparams);
}
BaseTile.prototype.changeWalkable = function(walkableto, mover) 
{
    //console.log("asdf",this.maingame);
    
    if(walkableto)
        this.maingame.map.walkableArray[this.posx][this.posy].walkable = true;
    else
        this.maingame.map.walkableArray[this.posx][this.posy].walkable = false;
    //
    this.walkable = walkableto;
    this.maingame.updatewalkable = true;
    if(mover!=null)
        this.moverontile = mover;
    else 
        this.moverontile = null;
}
BaseTile.prototype.adjustVisible = function(newVisible)
{
    this.tint = 0xffffff * newVisible;
    //console.log(this.staticobjects);
    if(this.staticobjects.length>0)
    {
        for(var i=0;i<this.staticobjects.length;i++)
        {
            if(this.staticobjects[i])
            {
                this.staticobjects[i].adjustVisible(newVisible);
            }
        }
    }
}
//
//WalkableTile
//
//
var WalkableTile = function(game,tileName,spritesheet, posx,posy,x,y, maingame)
{
    //system.
    BaseTile.call(this, game,tileName,spritesheet, posx,posy,x,y, maingame)
    this.walkable = true;  
    this.openair = true;

    this.posx = posx;
    this.posy = posy;
    
    this.eventDispatcher;
    if(Global.doShadows)
        this.adjustVisible(0.2);
};
WalkableTile.prototype = Object.create(BaseTile.prototype);
WalkableTile.constructor = WalkableTile;
//move this test to moving character
WalkableTile.prototype.enterTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnEnter",enterer);
    this.moverontile = enterer;
};
WalkableTile.prototype.leaveTile = function(enterer)
{
    if(this.eventDispatcher)
        this.eventDispatcher.doAction("OnLeave",enterer);
    this.moverontile = null;
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
/**
*   EasyStar.js
*   github.com/prettymuchbryce/EasyStarJS
*   Licensed under the MIT license.
*
*   Implementation By Bryce Neal (@prettymuchbryce)
**/

//Bryan Gough, March 18/2015 - removed diag, changed to calculate to do 6 neighbors instead of 4 for hex pathfinding
//https://github.com/prettymuchbryce/easystarjs
//
//NameSpace
var EasyStarHex = EasyStarHex || {};

//For require.js
if (typeof define === "function" && define.amd) {
	define("easystar", [], function() {
		return EasyStarHex;
	});
}

//For browserify and node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = EasyStarHex;
}
/**
* A simple Node that represents a single tile on the grid.
* @param {Object} parent The parent node.
* @param {Number} x The x position on the grid.
* @param {Number} y The y position on the grid.
* @param {Number} costSoFar How far this node is in moves*cost from the start.
* @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
**/
EasyStarHex.Node = function(parent, x, y, costSoFar, simpleDistanceToTarget) {
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
EasyStarHex.Node.OPEN_LIST = 0;
EasyStarHex.Node.CLOSED_LIST = 1;
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
EasyStarHex.PriorityQueue = function(criteria,heapType) {
	this.length = 0; //The current length of heap.
	var queue = [];
	var isMax = false;

	//Constructor
	if (heapType==EasyStarHex.PriorityQueue.MAX_HEAP) {
		isMax = true;
	} else if (heapType==EasyStarHex.PriorityQueue.MIN_HEAP) {
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
EasyStarHex.PriorityQueue.MAX_HEAP = 0;
EasyStarHex.PriorityQueue.MIN_HEAP = 1;

/**
 * Represents a single instance of EasyStarHex.
 * A path that is in the queue to eventually be found.
 */
EasyStarHex.instance = function() {
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
*	EasyStarHex.js
*	github.com/prettymuchbryce/EasyStarHexJS
*	Licensed under the MIT license.
* 
*	Implementation By Bryce Neal (@prettymuchbryce)
**/
EasyStarHex.js = function() {
	var STRAIGHT_COST = 10;
	var pointsToAvoid = {};
	var collisionGrid;
	var costMap = {};
	var iterationsSoFar;
	var instances = [];
	var iterationsPerCalculation = Number.MAX_VALUE;
	var acceptableTiles;
	/**
	* Sets the collision grid that EasyStarHex uses.
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
	* Sets the collision grid that EasyStarHex uses.
	* 
	* @param {Array} grid The collision grid that this EasyStarHex instance will read from. 
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
			throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStarHex.");
		}
		//No grid was set
		if (collisionGrid === undefined) {
			throw new Error("You can't set a path without first calling setGrid() on EasyStarHex.");
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
		var instance = new EasyStarHex.instance();
		instance.openList = new EasyStarHex.PriorityQueue("bestGuessDistance",EasyStarHex.PriorityQueue.MIN_HEAP);
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
			searchNode.list = EasyStarHex.Node.CLOSED_LIST;
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
						node.list = EasyStarHex.Node.OPEN_LIST;
						instance.openList.insert(node);
					} else if (node.list === EasyStarHex.Node.OPEN_LIST) {
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
		var node = new EasyStarHex.Node(parent,x,y,costSoFar,simpleDistanceToTarget);
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

    if (typeof EasyStarHex !== 'object') {
        throw new Error("Easystar is not defined!");
    }

    this.parent = parent;
    this._easyStarHex = new EasyStarHex.js();
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

    this._easyStarHex.setGrid(this._grid);
    this._easyStarHex.setAcceptableTiles(this._walkables);

    // initiate all walkable tiles with cost 1 so they will be walkable even if they are not on the grid map, jet.
    for (i = 0; i < walkables.length; i++)
    {
        this.setTileCost(walkables[i], 1);
    }

    if (iterationsPerCount !== null) {
        this._easyStarHex.setIterationsPerCalculation(iterationsPerCount);
    }
};

/**
 * Sets the tile cost for a particular tile type.
 *
 * @param tileType {Number} The tile type to set the cost for.
 * @param cost {Number} The multiplicative cost associated with the given tile.
 */
Phaser.Plugin.PathFinderPlugin.prototype.setTileCost = function (tileType, cost) {
    this._easyStarHex.setTileCost(tileType, cost);
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

    this._easyStarHex.findPath(startX, startY, destinationX, destinationY, this._callback, this._callbackObj);
    this._prepared = true;
};

/**
 * Start path calculation.
 */
Phaser.Plugin.PathFinderPlugin.prototype.calculatePath = function () {
    if (this._prepared === null) {
        throw new Error("no Calculation prepared!");
    }

    this._easyStarHex.calculate();
};
/**
*   EasyStar.js
*   github.com/prettymuchbryce/EasyStarJS
*   Licensed under the MIT license.
*
*   Implementation By Bryce Neal (@prettymuchbryce)
**/

//4 point test. Changed to also handle weighted edges.
//
//https://github.com/prettymuchbryce/easystarjs
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
	var DIAGONAL_COST = 12;
	var syncEnabled = false;
	var pointsToAvoid = {};
	var collisionGrid;
	var costMap = {};
	var pointsToCost = {};
	var allowCornerCutting = true;
	var iterationsSoFar;
	var instances = [];
	var iterationsPerCalculation = Number.MAX_VALUE;
	var acceptableTiles;
	var diagonalsEnabled = true;

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
	* Enables sync mode for this EasyStar instance..
	* if you're into that sort of thing.
	**/
	this.enableSync = function() {
		syncEnabled = true;
	};

	/**
	* Disables sync mode for this EasyStar instance.
	**/
	this.disableSync = function() {
		syncEnabled = false;
	};

	/**
	 * Enable diagonal pathfinding.
	 */
	this.enableDiagonals = function() {
		diagonalsEnabled = true;
	}

	/**
	 * Disable diagonal pathfinding.
	 */
	this.disableDiagonals = function() {
		diagonalsEnabled = false;
	}

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
	* Sets the an additional cost for a particular point.
	* Overrides the cost from setTileCost.
	*
	* @param {Number} x The x value of the point to cost.
	* @param {Number} y The y value of the point to cost.
	* @param {Number} The multiplicative cost associated with the given point.
	**/
	this.setAdditionalPointCost = function(x, y, cost) {
		pointsToCost[x + '_' + y] = cost;
	};

	/**
	* Remove the additional cost for a particular point.
	*
	* @param {Number} x The x value of the point to stop costing.
	* @param {Number} y The y value of the point to stop costing.
	**/
	this.removeAdditionalPointCost = function(x, y) {
		delete pointsToCost[x + '_' + y];
	}

	/**
	* Remove all additional point costs.
	**/
	this.removeAllAdditionalPointCosts = function() {
		pointsToCost = {};
	}

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
	* Enables corner cutting in diagonal movement.
	**/
	this.enableCornerCutting = function() {
		allowCornerCutting = true;
	};

	/**
	* Disables corner cutting in diagonal movement.
	**/
	this.disableCornerCutting = function() {
		allowCornerCutting = false;
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
	this.findPath = function(startX, startY, endX, endY, callback, callbackObj) {
		//Wraps the callback for sync vs async logic
        if(this.debug)
            console.log('findPath ',startX, startY, endX, endY);
		var callbackWrapper = function(result) {
			if (syncEnabled) {
				//callback(result);
                callback.apply(callbackObj,[result]);
			} else {
				setTimeout(function() {
					//callback(result);
                    callback.apply(callbackObj,[result]);
				});
			}
		}

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
			callbackWrapper([]);
			return;
		}

		//End point is not an acceptable tile.
		/*
		var isAcceptable = false;
		for (var i = 0; i < acceptableTiles.length; i++) {
            
			if (endTile === acceptableTiles[i]) {
				isAcceptable = true;
				break;
			}
		}*/

        //console.log(endTile, isAcceptable);
        var isAcceptable = false;
        var endTile = collisionGrid[endX][endY];
        //console.log(endTile.walkable);
		if (endTile.walkable === true) {
            isAcceptable = true;
		}

		//Create the instance
		var instance = new EasyStar.instance();
		instance.openList = new EasyStar.PriorityQueue("bestGuessDistance",EasyStar.PriorityQueue.MIN_HEAP);
		instance.isDoneCalculating = false;
		instance.nodeHash = {};
		instance.startX = startX;
		instance.startY = startY;
		instance.endX = endX;
		instance.endY = endY;
		instance.callback = callbackWrapper;
        instance.endwalkable = isAcceptable;
		instance.openList.insert(coordinateToNode(instance, instance.startX, 
			instance.startY, null, STRAIGHT_COST));
        
        //force only 1 for now!
        instances = [];
		instances.push(instance);
	};

	/**
	* This method steps through the A* Algorithm in an attempt to
	* find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
	* You can change the number of calculations done in a call by using
	* easystar.setIteratonsPerCalculation().
	**/
	this.calculate = function() {
        if(this.debug)
            console.log('calculate ', instances[0]);
		if (instances.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
			return;
		}
		for (iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
			if (instances.length === 0) {
				return;
			}

			if (syncEnabled) {
				//If this is a sync instance, we want to make sure that it calculates synchronously. 
				iterationsSoFar = 0;
			}

			//Couldn't find a path.
			if (instances[0].openList.length === 0) {
				var ic = instances[0];
				ic.callback(null);
				instances.shift();
				continue;
			}

			var searchNode = instances[0].openList.shiftHighestPriorityElement();
			var tilesToSearch = [];
			searchNode.list = EasyStar.Node.CLOSED_LIST;
            
            if(searchNode.y % 2 == 1)
            {
                testNode(searchNode,1,-1,instances[0],tilesToSearch);
                testNode(searchNode,1,1,instances[0],tilesToSearch);
                testNode(searchNode,0,1,instances[0],tilesToSearch);
                testNode(searchNode,0,-1,instances[0],tilesToSearch);

                if (diagonalsEnabled) {
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1,0,-1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y,-1,0))) {

                        testNode(searchNode,0,-2,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1,0,1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y,1,0))) {

                        testNode(searchNode,1,0,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1,0,-1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y,1,0))) {

                        testNode(searchNode,0,2,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1,0,1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y,-1,0))) {

                        testNode(searchNode,-1,0,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                }
            }
            else
            {
                testNode(searchNode,0,-1,instances[0],tilesToSearch);
                testNode(searchNode,0,1,instances[0],tilesToSearch);
                testNode(searchNode,-1,1,instances[0],tilesToSearch);
                testNode(searchNode,-1,-1,instances[0],tilesToSearch);

                if (diagonalsEnabled) {
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y))) {

                        testNode(searchNode,-1,0,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y))) {

                        testNode(searchNode,0,2,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y))) {

                        testNode(searchNode,0,-2,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y))) {

                        testNode(searchNode,1,0,instances[0],tilesToSearch,DIAGONAL_COST);
                    }
                }
            }

			// First sort all of the potential nodes we could search by their cost.
			tilesToSearch.sort(function(a, b) {
				if (a.cost < b.cost) {
					return -1;
				} else if (a.cost === b.cost) {
					return 0;
				} else {
					return 1;
				}
			});

			var isDoneCalculating = false;

			//Search all of the surrounding nodes
			for (var i = 0; i < tilesToSearch.length; i++) {
				checkAdjacentNode(tilesToSearch[i].instance, tilesToSearch[i].searchNode, 
					tilesToSearch[i].x, tilesToSearch[i].y, tilesToSearch[i].cost);
				if (tilesToSearch[i].instance.isDoneCalculating === true) {
					isDoneCalculating = true;
					break;
				}
			}

			if (isDoneCalculating) {
				instances.shift();
				continue;
			}

		}
	};
    var testNode = function(searchNode,valx,valy,instance,tilesToSearch,cost){
        cost = cost || STRAIGHT_COST;
        
        if(searchNode.x+valx > -1 && searchNode.x+valx < collisionGrid.length &&
           searchNode.y+valy > -1 && searchNode.y+valy < collisionGrid[0].length)

            tilesToSearch.push({ instance: instance, searchNode: searchNode, 
                x: valx, y: valy, cost: cost * getTileCost(searchNode.x+valx, searchNode.y+valy)});
        
    }
	//Private methods follow
	var checkAdjacentNode = function(instance, searchNode, x, y, cost) {
		var adjacentCoordinateX = searchNode.x+x;
		var adjacentCoordinateY = searchNode.y+y;

		if (pointsToAvoid[adjacentCoordinateX + "_" + adjacentCoordinateY] === undefined) {
			if (instance.endX === adjacentCoordinateX && instance.endY === adjacentCoordinateY) {
                if(this.debug)
                    console.log('end adjacent: '+adjacentCoordinateX,adjacentCoordinateY);
				instance.isDoneCalculating = true;
				var path = [];
				var pathLen = 0;
                //if end isn't walkable? stop on adjacent
                if(this.debug)
                    console.log(" endwalkable ", instance.endwalkable, isTileWalkable(collisionGrid, null, searchNode.x, searchNode.y, x, y), searchNode.x, searchNode.y, x, y);
                
                if(instance.endwalkable && isTileWalkable(collisionGrid, null, searchNode.x, searchNode.y, x, y))
                {
				    path[pathLen] = {x: adjacentCoordinateX, y: adjacentCoordinateY};
				    pathLen++;
                }
                if(this.debug)
                    console.log("after")
				path[pathLen] = {x: searchNode.x, y:searchNode.y};
				pathLen++;
				var parent = searchNode.parent;
				while (parent!=null) {
					path[pathLen] = {x: parent.x, y:parent.y};
					pathLen++;
					parent = parent.parent;
				}
				path.reverse();
				var ic = instance;
				var ip = path;
				ic.callback(ip);
			}

			if (isTileWalkable(collisionGrid, acceptableTiles, adjacentCoordinateX, adjacentCoordinateY, x, y)) {
				var node = coordinateToNode(instance, adjacentCoordinateX, adjacentCoordinateY, searchNode, cost);

				if (node.list === undefined) {
					node.list = EasyStar.Node.OPEN_LIST;
					instance.openList.insert(node);
				} else if (node.list === EasyStar.Node.OPEN_LIST) {
					if (searchNode.costSoFar + cost < node.costSoFar) {
						node.costSoFar = searchNode.costSoFar + cost;
						node.parent = searchNode;
					}
				}
			}
		}
	};

	//Helpers
	var isTileWalkable = function(collisionGrid, acceptableTiles, x, y, changex, changey) {
        if(x < 0 || x > collisionGrid.length || y < 0 || y > collisionGrid[0].length)
                return false;
        var ret = collisionGrid[x][y].isWalkable(x,y,changex,changey)
        //console.log('ret ',ret)
        if(ret==1)
            return true;
        /*for (var i = 0; i < acceptableTiles.length; i++) {
			if (collisionGrid[x][y] === acceptableTiles[i]) {
				return true;
			}
		}*/
		return false;
	};

	var getTileCost = function(x, y) {
		return pointsToCost[x + '_' + y] || costMap[collisionGrid[x][y]]
	};

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
		return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
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
    this.debug = false;

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
                this._grid[i][j] = 0;
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
BattleExecute = function (mStateMachine) {
    this.topAction = null;
}
BattleExecute.prototype = Object.create(EmptyState.prototype);
BattleExecute.constructor = BattleExecute;

BattleExecute.prototype.update = function(elapsedTime) 
{
    if(this.topAction);
        this.topAction.Update(elapsedTime);
}
BattleExecute.prototype.render = function() 
{
}
BattleExecute.prototype.onEnter = function(topAction) 
{
    this.topAction = topAction;
    if(this.topAction)
        this.topAction.execute();
}
BattleExecute.prototype.onExit = function() 
{
    if(this.topAction)
        this.topAction.cleanup();
}
//
BattleHeroTurnState = function (statemachine, game, gameref, isPlayerTurn, inputHandler) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    
    this.mActions = [];//actions
    this.mEntities = [];//entitys
    this.actionStates = new StateMachine();
    
    this.inputHandler = inputHandler;
    this.actionStates.add("tick", new BattleTick(this.actionStates, this));
    this.actionStates.add("execute", new BattleExecute(this.actionStates));
    
    this.iteractor = -1;
    this.team = [];
    
    this.isPlayerTurn = isPlayerTurn;
    //
}
BattleHeroTurnState.prototype = Object.create(EmptyState.prototype);
BattleHeroTurnState.constructor = BattleHeroTurnState;
//
BattleHeroTurnState.prototype.init = function(map) 
{
}
//
BattleHeroTurnState.prototype.SortByTime = function(a,b)
{
    return a.TimeRemaining() > b.TimeRemaining()
}
BattleHeroTurnState.prototype.update = function(elapsedTime) 
{
    //this.game.debug.text(this.mActions.length+"", 20, 25) 
    this.game.debug.text("Pause input: "+ this.inputHandler.pauseInput, 20, 25) 
    if(this.mActions.length>0)
        this.actionStates.update(elapsedTime);    
    else
        this.statemachine.nextTeam();
}
BattleHeroTurnState.prototype.render = function() 
{
    this.actionStates.render();
}
BattleHeroTurnState.prototype.getActiveCombater = function()
{
    this.mEntities[this.iteractor];
}
BattleHeroTurnState.prototype.NextTick = function()
{
    this.actionStates.change("tick");
}
BattleHeroTurnState.prototype.onEnter = function(params) 
{
    console.log("BattleTurn")
    this.createTeam();
    if(!this.isPlayerTurn)
    {
        this.inputHandler.pauseInput = true;
        //if(this.mActions.length>0)
        //    this.mActions[this.mActions.length-1].execute();
    }
}
BattleHeroTurnState.prototype.setTeam = function(team) 
{
    this.mEntities = team;
}
BattleHeroTurnState.prototype.addTeamate = function(teammate) 
{
    this.mEntities.push(teammate);
}
BattleHeroTurnState.prototype.createTeam = function() 
{
    //every time?
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    this.NextTick();
    console.log("num: "+this.mEntities.length);
    this.createActions();
}
BattleHeroTurnState.prototype.createActions = function()
{
    //this.mActions.clear();
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        if(e.IsPlayer)
        {
            var action = new PlayerDecide(this.game, this.gameref, e,  e.Speed(), this);
            this.mActions.push(action);
        }
        else
        {
            var action = new AIDecide(this.game, this.gameref, e, e.Speed(), this);
            this.mActions.push(action);
        }
    }
}
BattleHeroTurnState.prototype.findDecideByActor = function(actor)
{
    for(var x=0;x<this.mActions.length;x++)
    {
        if(this.mActions[x].combater == actor)
        {
            return this.mActions[x];
        }
    }
    return null;
}
BattleHeroTurnState.prototype.removeAction = function(action)
{
    var i = this.mActions.indexOf(action);
    console.log("removeAction ",i,this.mActions,action);
    if (i > -1) 
    {
        this.mActions.splice(i, 1);
        return true;
    }
    return false;
}
BattleHeroTurnState.prototype.placeAtFront = function(action)
{
    var i = this.mActions.indexOf(action);
    if (i > -1) 
    {
        this.mActions.splice(i, 1);
    }
    this.mActions.push(action);
}

BattleHeroTurnState.prototype.placeAtEnd = function()
{
    var a = this.mActions.pop();
    this.mActions.unshift(val);
}
BattleHeroTurnState.prototype.removeTopAction = function()
{
    var a = this.mActions.pop();
    return a;
}
BattleHeroTurnState.prototype.addToActionsRear = function(val)
{
    this.mActions.unshift(val);
    this.NextTick();
}
BattleHeroTurnState.prototype.addToActionsFront = function(val)
{
    this.mActions.push(val);
    this.NextTick();
}
BattleHeroTurnState.prototype.moveOn = function()
{
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
    this.NextTick();
}
BattleHeroTurnState.prototype.onExit = function() 
{
    console.log('On exit.')
    this.mActions = [];
    this.inputHandler.cleanUpPlayer();
}
BattleHeroTurnState.prototype.leaveThisState = function() 
{
    //can be used to warn if player still has actions
    return true;
}
BattleHeroTurnState.prototype.getActions = function()
{
    return this.mActions;
}

// start combat
// remove normal ui

// player decides
// player action
// ai decides
// ai action
//
//
//
BattleState = function (statemachine, game, gameref) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.inputHandler = new InputHandlerBattle(this.game, this.gameref);
    this.inputHandler.battleState = this;
    this.enemyRollover = new EnemyTargetRollOver(this.game, this.gameref, this);
    
    this.mEntities = [];//entitys
    this.mBattleStates = new StateMachine();
    
    
    //player turn, enemy turn, other turn
    //plus allow everyone more turns
    this.battleOrder = ["Player","AI"];
    this.currentOrder = -1;
    
    this.mBattleStates.add("Player", new BattleHeroTurnState(this, game, gameref, true, this.inputHandler));
    this.mBattleStates.add("AI", new BattleHeroTurnState(this, game, gameref, false, this.inputHandler));
    
    this.activeButtons = new CombatButtons(this.game, this.gameref);
    this.activeButtons.x = 50;
    this.activeButtons.y = 430;
    this.game.add.existing(this.activeButtons);
    this.gameref.uiGroup.add(this.activeButtons);
    this.activeButtons.visible = false;
    //
}
BattleState.prototype = Object.create(EmptyState.prototype);
BattleState.constructor = BattleState;
//
BattleState.prototype.init = function(map) 
{
}
BattleState.prototype.nextTeam = function() 
{
    this.currentOrder++;
    if(this.currentOrder>this.battleOrder.length-1)
        this.currentOrder = 0;
    this.mBattleStates.change(this.battleOrder[this.currentOrder]);
    return this.battleOrder[this.currentOrder];
}
BattleState.prototype.endPlayerTurn = function() 
{
    console.log('Endplayer turn.')
    if(this.battleOrder[this.currentOrder]=="Player")
    {
        this.nextTeam();
    }
}

//why is this here?
BattleState.prototype.handleOver = function(combat) 
{
    if(!this.gameref.map.playerCharacter.currentSelectedWeapon)
    {
        this.handleOut();
        return;
    }
    if(combat.hostile)
    {
        //check line of site
        //do acc check
        var hasLineOfSite = this.gameref.map.hexHandler.lineOfSite(combat.currentTile, this.gameref.map.playerCharacter.currentTile)
        if(!hasLineOfSite)
        {
            this.enemyRollover.showText(combat.x, combat.y, "NO LOS");    
            return;
        }
        
        var distanceTo = this.gameref.map.hexHandler.testRange(combat.currentTile, this.gameref.map.playerCharacter.currentTile, false)
        var range = this.gameref.map.playerCharacter.currentSelectedWeapon.range;
        if(distanceTo > range * 60)
        {
            this.enemyRollover.showText(combat.x, combat.y, "Out of range");    
            return;
        }
        var acc = this.gameref.map.playerCharacter.currentSelectedWeapon.acc - (distanceTo/(range * 60))/5;
        acc *= 100;
        this.enemyRollover.showText(combat.x, combat.y, "Chance to hit: " + acc.toFixed(0) + "%");    
    }
    else
    {
        this.enemyRollover.showText(combat.x, combat.y, "Civilian.");
    }
    
}
BattleState.prototype.handleOut = function() 
{
    this.enemyRollover.visible = false;
}
//
BattleState.prototype.update = function(elapsedTime) 
{
    this.mBattleStates.update(elapsedTime);    
}
BattleState.prototype.render = function() 
{
    this.mBattleStates.render();
}
BattleState.prototype.onEnter = function(params) 
{
    this.activeButtons.visible = true;
    this.inputHandler.turnOn();
 
    this.mEntities = params.entities;
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    //this.NextTick();
 
    this.mEntities = params.entities;
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        if(e.IsPlayer)
        {
            var playerTurn = this.mBattleStates.getByName("Player");
            playerTurn.addTeamate(e);
            
            //pass to player state
        }
        else
        {
            var playerTurn = this.mBattleStates.getByName("AI");
            playerTurn.addTeamate(e);
            //pass to enemy state
        }
    }
    this.nextTeam();
    //
    //Sort(this.mActions, this.SortByTime);
    //
}
BattleState.prototype.onExit = function() 
{
    console.log("BattleState **  onExit")
    this.mActions = [];//flush actions
    
    this.activeButtons.visible = false;
    this.inputHandler.turnOff();
    
    this.inputHandler.hideInputAreas();
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].endCombat();
    }
    
    if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
    {
        GlobalEvents.currentAction = GlobalEvents.WALK;
    }
}
BattleState.prototype.leaveThisState = function() 
{
    for(var i=0;i<this.mEntities.length;i++)
    {
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            return false;
        }
    }
    return true;
}
BattleState.prototype.getActions = function()
{
    return this.mActions;
}

BattleTick = function (mStateMachine, state) {
    this.mStateMachine = mStateMachine;
    this.state = state;
   // this.mActions = mActions;
}
BattleTick.prototype = Object.create(EmptyState.prototype);
BattleTick.constructor = BattleTick;

BattleTick.prototype.update = function(elapsedTime) 
{
    
    var mActions = this.state.getActions();
    //console.log(mActions);
    
    if(mActions.length<=0)
    {
        //this should never happen
        console.log("BattleTick no actions");
        return;
    }
    for(var i=0;i<mActions.length;i++)
    {
        var a = mActions[i];
        if(a!=null)
        {
            a.Update(elapsedTime);
        }
        else{
            console.log(mActions);
         //   console.log(this,a);
        }
    }
    if(mActions[mActions.length-1].isReady)// && mActions[mActions.length-1].isDone)
    {
        var top = mActions[mActions.length-1];//mActions.pop();
        this.mStateMachine.change("execute", top);
    }
}
BattleTick.prototype.render = function() 
{

}
BattleTick.prototype.onEnter = function(params) 
{

}
BattleTick.prototype.onExit = function() 
{

}
DeathState = function (statemachine, game, gameref, uigroup) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.uiGroup = uigroup;
    
    
}
DeathState.prototype = Object.create(EmptyState.prototype);
DeathState.constructor = DeathState;

DeathState.prototype.init = function(map) 
{
}
DeathState.prototype.update = function(elapsedTime) 
{
}
DeathState.prototype.render = function() 
{
}
DeathState.prototype.onEnter = function(params) 
{
    this.deathGroup = new DeathScreen(this.tryAgain, this. returnToMenu, this.gameref);
}
DeathState.prototype.tryAgain = function() 
{
    //load screen like you just walked in
    console.log('try again');
    
    this.gameref.gGameMode.change("normal");
    this.gameref.map.tryMapAgain();
}
DeathState.prototype.returnToMenu = function() 
{
    this.game.state.start('MainMenu');
}
DeathState.prototype.onExit = function() 
{
    this.gameref.normalUI.show();
    this.deathGroup.destroy(true);
}


 
DeathScreen = function (tryAgain, returnToMenu, gameref) 
{
    gameref.normalUI.hide();
    gameref.textUIHandler.showDeadText("Your mortal shell was destroyed.");
    
    var btn = this.game.add.button(200, 400, 'ui', tryAgain, this, 'button_blue_up.png', 'button_blue_over.png', 'button_blue_over.png','button_blue_up.png');
    var newtext = this.game.add.bitmapText(230, 410, "simplefont", "Turn Back Time", 20); 
    
    this.addChild(btn);
    this.addChild(newtext);
        
    var btn = this.game.add.button(500, 400, 'ui', returnToMenu, this, 'button_blue_up.png', 'button_blue_over.png', 'button_blue_over.png','button_blue_up.png');
    var newtext = this.game.add.bitmapText(530, 410, "simplefont", "Return To Menu", 20); 
    
    this.addChild(btn);
    this.addChild(newtext);
}
DeathScreen.prototype = Object.create(Phaser.Group.prototype);
DeathScreen.constructor = DeathScreen;

DiaglogState = function (statemachine, game, gameref, dialogHandler, uigroup) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.dialogHandler = dialogHandler;
    this.uiGroup = uigroup;
    //this.inputHandler = new InputHandlerBattle(this.game, this.gameref);
    //
    this.diagpanel = new DialogPanel(this.game, this.gameref, dialogHandler, null, this);
    this.game.add.existing(this.diagpanel);
    this.uiGroup.add(this.diagpanel);
    this.diagpanel.setup();
    //
}

DiaglogState.prototype = Object.create(EmptyState.prototype);
DiaglogState.constructor = DiaglogState;

DiaglogState.prototype.init = function(map) 
{
}

DiaglogState.prototype.update = function(elapsedTime) 
{
}
DiaglogState.prototype.render = function() 
{
}
DiaglogState.prototype.onEnter = function(params) 
{
    this.gameref.normalUI.hide();

}
DiaglogState.prototype.onExit = function() 
{
    this.gameref.normalUI.show();
}
DiaglogState.prototype.startDialog = function(dialogid)
{
    console.log(this,this.diagpanel);
    this.diagpanel.startDialog(dialogid);
}
DiaglogState.prototype.exitDialog = function()
{
    GlobalEvents.reEnableEvents();
    this.gameref.gGameMode.change("normal");
}



NormalState = function (statemachine, game, gameref) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.inputHandler = new InputHandler(this.game, this.gameref);
}
NormalState.prototype = Object.create(EmptyState.prototype);
NormalState.constructor = NormalState;

NormalState.prototype.init = function(map) 
{
    
}
NormalState.prototype.update = function(elapsedTime) 
{
    
}
NormalState.prototype.render = function() 
{
    
}
NormalState.prototype.onEnter = function(params) 
{
    this.inputHandler.turnOn();
}
NormalState.prototype.onExit = function() 
{
    this.inputHandler.turnOff();
}
// start combat
// remove normal ui

// player decides
// player action
// ai decides
// ai action
//
//
//
RealTimeCombatState = function (statemachine, game, gameref) {
    this.statemachine = statemachine;
    this.game = game;
    this.gameref = gameref;
    this.inputHandler = new InputHandlerRealTimeBattle(this.game, this.gameref);
    this.inputHandler.battleState = this;
    this.enemyRollover = new EnemyTargetRollOver(this.game, this.gameref, this);
    
    this.mEntities = [];//entitys
    this.mRealTimeCombatStates = new StateMachine();
    
    //player turn, enemy turn, other turn
    //plus allow everyone more turns
    this.battleOrder = ["Player"];
    this.currentOrder = -1;
    
    this.mRealTimeCombatStates.add("Player", new BattleHeroTurnState(this, game, gameref, true, this.inputHandler));

    this.activeButtons = new CombatButtons(this.game, this.gameref);
    this.activeButtons.x = 50;
    this.activeButtons.y = 430;
    this.game.add.existing(this.activeButtons);
    this.gameref.uiGroup.add(this.activeButtons);
    this.activeButtons.visible = false;
    //
}
RealTimeCombatState.prototype = Object.create(EmptyState.prototype);
RealTimeCombatState.constructor = RealTimeCombatState;
//
RealTimeCombatState.prototype.init = function(map) 
{
}
/*RealTimeCombatState.prototype.nextTeam = function() 
{
    this.currentOrder++;
    if(this.currentOrder>this.battleOrder.length-1)
        this.currentOrder = 0;
    this.mRealTimeCombatStates.change(this.battleOrder[this.currentOrder]);
    return this.battleOrder[this.currentOrder];
}*/
RealTimeCombatState.prototype.endPlayerTurn = function() 
{
    console.log('Endplayer turn.')
    if(this.battleOrder[this.currentOrder]=="Player")
    {
        this.nextTeam();
    }
}

//why is this here?
RealTimeCombatState.prototype.handleOver = function(combat) 
{
    if(!this.gameref.map.playerCharacter.currentSelectedWeapon)
    {
        this.handleOut();
        return;
    }
    if(combat.hostile)
    {
        //check line of site
        //do acc check
        var hasLineOfSite = this.gameref.map.hexHandler.lineOfSite(combat.currentTile, this.gameref.map.playerCharacter.currentTile)
        if(!hasLineOfSite)
        {
            this.enemyRollover.showText(combat.x, combat.y, "NO LOS");    
            return;
        }
        
        var distanceTo = this.gameref.map.hexHandler.testRange(combat.currentTile, this.gameref.map.playerCharacter.currentTile, false)
        var range = this.gameref.map.playerCharacter.currentSelectedWeapon.range;
        if(distanceTo > range * 60)
        {
            this.enemyRollover.showText(combat.x, combat.y, "Out of range");    
            return;
        }
        var acc = this.gameref.map.playerCharacter.currentSelectedWeapon.acc - (distanceTo/(range * 60))/5;
        acc *= 100;
        this.enemyRollover.showText(combat.x, combat.y, "Chance to hit: " + acc.toFixed(0) + "%");    
    }
    else
    {
        this.enemyRollover.showText(combat.x, combat.y, "Civilian.");
    }
    
}
RealTimeCombatState.prototype.handleOut = function() 
{
    this.enemyRollover.visible = false;
}
//
RealTimeCombatState.prototype.update = function(elapsedTime) 
{
    this.mRealTimeCombatStates.update(elapsedTime); 
}
RealTimeCombatState.prototype.render = function() 
{
    this.mRealTimeCombatStates.render();
}
RealTimeCombatState.prototype.onEnter = function(params) 
{
    this.activeButtons.visible = true;
    this.inputHandler.turnOn();
 
    //this.mEntities = params.entities;
    
    /*for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].startCombat();
    }
    //
    //this.NextTick();
 
    this.mEntities = params.entities;
    for(var i=0;i<this.mEntities.length;i++)
    {
        var e = this.mEntities[i];
        if(e.IsPlayer)
        {
            var playerTurn = this.mRealTimeCombatStates.getByName("Player");
            playerTurn.addTeamate(e);
            
            //pass to player state
        }
        else
        {
            var playerTurn = this.mRealTimeCombatStates.getByName("AI");
            playerTurn.addTeamate(e);
            //pass to enemy state
        }
    }
    this.nextTeam();*/
    //
    //Sort(this.mActions, this.SortByTime);
    //
}
RealTimeCombatState.prototype.onExit = function() 
{
    console.log("RealTimeCombatState **  onExit")
    this.mActions = [];//flush actions
    /*
    this.activeButtons.visible = false;
    this.inputHandler.turnOff();
    
    this.inputHandler.hideInputAreas();
    
    for(var i=0;i<this.mEntities.length;i++)
    {
        this.mEntities[i].endCombat();
    }
    
    if(GlobalEvents.currentAction == GlobalEvents.COMBATSELECT)
    {
        GlobalEvents.currentAction = GlobalEvents.WALK;
    }*/
}
RealTimeCombatState.prototype.leaveThisState = function() 
{
    for(var i=0;i<this.mEntities.length;i++)
    {
        if(this.mEntities[i].isAlive() && this.mEntities[i].hostile && !this.mEntities[i].IsPlayer)
        {
            return false;
        }
    }
    return true;
}
RealTimeCombatState.prototype.getActions = function()
{
    return this.mActions;
}

//I need to find where I got this from so I can properly link to it.
StateMachine = function (game) {
    this.mStates = [];//associative
    this.mCurrentState = null;
    this.currentState = null;
    this.changeState = new Phaser.Signal();
}
StateMachine.prototype.update = function(elapsedTime) 
{
    if(this.mCurrentState!=undefined)
        this.mCurrentState.update(elapsedTime);
}
StateMachine.prototype.render = function() 
{
    if(this.mCurrentState!=undefined)
        this.mCurrentState.render();
}
StateMachine.prototype.change = function(stateName, params) 
{
    //console.log("change state: ",stateName);
    var newState = this.mStates[stateName];
    if(newState==null)
        return;
    
    if(this.mCurrentState!=undefined)
        this.mCurrentState.onExit();
    
    this.mCurrentState = newState;
    this.mCurrentState.onEnter(params);
    this.currentState = stateName;
    
    this.changeState.dispatch(this, this.currentState, this.mCurrentState)
}
StateMachine.prototype.add = function(name, state) 
{
    this.mStates[name] = state;
}
StateMachine.prototype.getByName = function(name) 
{
    return this.mStates[name];
}

StateStack = function (game) {
    this.mStates = []; //associative 
    this.mStack = []; //stack
}
StateStack.prototype.update = function(elapsedTime) 
{
    var top = this.mStack[this.mStack.length-1];
    top.update(elapsedTime);
}
StateStack.prototype.render = function() 
{
    var top = this.mStack[mStack.length-1];
    top.render();
}
StateStack.prototype.push = function(name) 
{
    var state = this.mStates[name];
    this.mStack.Push(state);
}
StateStack.prototype.pop = function() 
{
    return this.mStack.Pop();
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
//will alpha any maskable object that is in bounds to that point.
//This is the simpler method then Master.
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
//https://www.reddit.com/r/gamedev/comments/5ba5cs/someone_got_any_cool_portfolios_from_ui/
var Optimized = 
{
    easeLinear      : function(p) { return p;              }, // p^1 Note: In = Out = InOut
    easeInQuad      : function(p) { return p*p;            }, // p^2 = Math.pow(p,2)
    easeInCubic     : function(p) { return p*p*p;          }, // p^3 = Math.pow(p,3)
    easeInQuart     : function(p) { return p*p*p*p;        }, // p^4 = Math.pow(p,4)
    easeInQuint     : function(p) { return p*p*p*p*p;      }, // p^5 = Math.pow(p,5)
    easeInSextic    : function(p) { return p*p*p*p*p*p;    }, // p^6 = Math.pow(p,6)
    easeInSeptic    : function(p) { return p*p*p*p*p*p*p;  }, // p^7 = Math.pow(p,7)
    easeInOctic     : function(p) { return p*p*p*p*p*p*p*p;}, // p^8 = Math.pow(p,8)

    easeOutQuad     : function(p) { var m=p-1; return 1-m*m;             },
    easeOutCubic    : function(p) { var m=p-1; return 1+m*m*m;           },
    easeOutQuart    : function(p) { var m=p-1; return 1-m*m*m*m;         },
    easeOutQuint    : function(p) { var m=p-1; return 1+m*m*m*m*m;       },
    easeOutSextic   : function(p) { var m=p-1; return 1-m*m*m*m*m*m;     },
    easeOutSeptic   : function(p) { var m=p-1; return 1+m*m*m*m*m*m*m;   },
    easeOutOctic    : function(p) { var m=p-1; return 1-m*m*m*m*m*m*m*m; },

    easeInOutQuad   : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t;             return 1-m*m            *  2; },
    easeInOutCubic  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t;           return 1+m*m*m          *  4; },
    easeInOutQuart  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t;         return 1-m*m*m*m        *  8; },
    easeInOutQuint  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t;       return 1+m*m*m*m*m      * 16; },
    easeInOutSextic : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t;     return 1-m*m*m*m*m*m    * 32; },
    easeInOutSeptic : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t*t;   return 1+m*m*m*m*m*m*m  * 64; },
    easeInOutOctic  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t*t*t; return 1-m*m*m*m*m*m*m*m*128; },

    easeInBack      : function(p) { var              k = 1.70158        ;              return p*p*(p*(k+1) - k);                                        },
    easeInOutBack   : function(p) { var m=p-1,t=p*2, k = 1.70158 * 1.525; if (p < 0.5) return p*t*(t*(k+1) - k); else return 1 + 2*m*m*(2*m*(k+1) + k); },
    easeOutBack     : function(p) { var m=p-1,       k = 1.70158        ;                                             return 1 +   m*m*(  m*(k+1) + k); },

    easeInBounce    : function( p ) {
        return 1 - this.easeOutBounce( 1-p );
    },
    easeInOutBounce : function( p ) {
        var t = p*2;
        if (t < 1) return 0.5 - 0.5*this.easeOutBounce( 1 - t ); // 0.5*EaseInBounce( t ) -> 0.5*(1-Out(1-p))
        return            0.5 + 0.5*this.easeOutBounce( t - 1 );
    },
    easeOutBounce   : function( p ) {
        var r  = 1  / 2.75; // reciprocal
        var k1 = 1     * r; // 36.36%
        var k2 = 2     * r; // 72.72%
        var k3 = 1.5   * r; // 54.54%
        var k4 = 2.5   * r; // 90.90%
        var k5 = 2.25  * r; // 81.81%
        var k6 = 2.625 * r; // 95.45%
        var k0 = 7.5625, t;

        /**/ if (p < k1) {             return k0 * p*p;            }
        else if (p < k2) { t = p - k3; return k0 * t*t + 0.75;     } // 48/64
        else if (p < k4) { t = p - k5; return k0 * t*t + 0.9375;   } // 60/64
        else             { t = p - k6; return k0 * t*t + 0.984375; } // 63/64
    },

    easeInCirc   : function(p){                             return  1-Math.sqrt( 1 - p*p );                                                      },
    easeInOutCirc: function(p){ var m=p-1,t=p*2; if (t < 1) return (1-Math.sqrt( 1 - t*t ))*0.5; else return (Math.sqrt( 1 - 4*m*m ) + 1) * 0.5; },
    easeOutCirc  : function(p){ var m=p-1      ;                                                      return  Math.sqrt( 1 -   m*m );            },


    easeInElastic   : function(p) {
        var m = p-1;
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        return  - Math.pow( 2,10*m  ) * Math.sin( ( m*40 - 3) * Math.PI/6 ); // Note: 40/6 = 6.666... = 2/0.3;
    },

    easeOutElastic  : function(p) { // Alt.: return 1 - this.easeInElastic( 1-p );
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        return 1+(Math.pow( 2,10*-p ) * Math.sin( (-p*40 - 3) * Math.PI/6 ));
    },
    easeInOutElastic: function(p) {
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        var s = 2*p-1;                 // remap: [0,0.5] -> [-1,0]
        var k = (80*s-9) * Math.PI/18; // and    [0.5,1] -> [0,+1]

        if (s < 0) return -0.5*Math.pow(2, 10*s) * Math.sin( k );
        return          1 +0.5*Math.pow(2,-10*s) * Math.sin( k ); 
    },

    easeInExpo   : function(p) { if (p <= 0) return 0; return   Math.pow( 2,  10*(p-1) ); },
    easeOutExpo  : function(p) { if (p >= 1) return 1; return 1-Math.pow( 2, -10* p    ); },
    easeInOutExpo: function(p) { if (p <= 0) return 0;
                                 if (p >= 1) return 1;
                                 if (p <0.5) return             Math.pow( 2,  10*(2*p-1)-1);
                                             return           1-Math.pow( 2, -10*(2*p-1)-1);
    },

    easeInSine   : function(p) { return      1 - Math.cos( p * Math.PI*0.5 );  },
    easeInOutSine: function(p) { return 0.5*(1 - Math.cos( p * Math.PI     )); },
    easeOutSine  : function(p) { return          Math.sin( p * Math.PI*0.5 );  },
};
// This was an attempt to cut background sprites so that characters are visible behind objects.
// The masking wasn't working properly for the calculations
var Masker = function (game, maingame, maskableobjects)
{
    this.game = game;
    this.maingame = maingame;

    this.maskedobjects = [];
    this.maskDistance = 2000;//distance*distance
    
    this.maskableobjects = maskableobjects;
    //?
    //this.mask = new Phaser.Image(game, 0, 0, "standardimages", "box/seethrough.png")
    
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
Utilties = function()
{
}
Utilties.customSortIso = function(a,b){
    //return Utilties.doNormal(a,b);
    //console.log(a,b);
    if(b.IsPlayer||a.IsPlayer)
    {

    }
    if(a.iso!=null && b.iso!=null)
    {
        if(a.IsPlayer)
        {
          //  console.log(a.iso);
        }
            
        if(a.iso.x<b.iso.x)
        {
            return 1;
        }
        else if(a.iso.x>b.iso.x)
        {
            return -1;
        }
        else
        {
            if(a.iso.z<b.iso.z)
            {
                return 1;
            }
            if(a.iso.z>b.iso.z)
            {
                return -1;
            }
        }
        if(a.iso.y<b.iso.y)
        {
            return -1;
        }
        else if(a.iso.y>b.iso.y)
        {
            return 1;
        }
        //
        if(a.isoorder<b.isoorder)
        {
            return -1;
        }
        else if(a.isoorder>b.isoorder)
        {
            return 1;
        }
    }
   //console.log(a.posy,b.posy);
    //if(b.posy%2==0)
    return Utilties.doNormal(a,b);
    //else
    //    return Utilties.doReverse(a,b);
    
    //return Utilties.byPos(a,b);
    
    //-1 if a > b, 1 if a < b or 0 if a === b
    //return 0;
};
Utilties.byPos = function(a,b){
    if(a.y==b.y)
    {
        if(a.x<b.x)
        {
            return 1;
        }
        else if(a.x>b.y)
        {
            return -1;
        }
    }
    else if(a.y<b.y)
    {
        return -1;
    }
    else if(a.y>b.y)
    {
        return 1;
    }
    return 0;
}
Utilties.doNormal = function(a,b){
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
        //console.log(a.posy,b.posy);
        return 1;
    }
    else if(a.posy>b.posy)
    {
        //console.log(a.posy,b.posy);
        return -1;
    }
    return 0;
}
Utilties.doReverse = function(a,b){
    if(a.posy==b.posy)
    {
        if(a.posx>b.posx)
        {
            return 1;
        }
        else if(a.posx<b.posx)
        {
            return -1;
        }
        else
        {
            if(a.y>b.y)
            {
                return -1;
            }
            if(a.y<b.y)
            {
                return 1;
            }
        }
    }
    else if(a.posy>b.posy)
    {
        return -1;
    }
    else if(a.posy<b.posy)
    {
        return 1;
    }
    return 0;
}
Utilties.customSortHexOffsetIso = function(a,b){
    //console.log(a,b);
    if(b.IsPlayer||a.IsPlayer)
    {
    //    console.log(a.posx, a.posy, b.posx, b.posy,a.y,b.y);
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
};
var Global = function ()
{   
    this.mute = false;
    this.pause = false;
    this.fastLoad = true;
    //this.movetotouch:true,
    this.showmovetile = false;
    this.loadMap = 0;
    this.language = "en";
    this.uilocation = "assets/basicUI/";
    this.assetsLocation = "assets/simpletown/";
    this.actionspeed = 1.0;
    this.doShadows = false;
};

"use strict";
BasicGame.Game = function (game) {

    this.pathfinder;//a* searcher
    
    this.graphics;//drawable
    
    this.uiGroup;

    this.mapData;
    this.globalHandler;
    this.inventory;
    
    this.updatewalkable = false;
    
    this.fps;
    
    this.gGameMode = null;
    
    this.map = null;
    //this.inputHandler = null;
    this.textUIHandler = null;
    this.dialoghandler;
    this.bulletHandler;
    
    //this.client = Client
    //this.client.doConnect();
    //this.client.setupSockect();
};

//
// ----

BasicGame.Game.prototype = {
    preload: function () {
        //this.load.json('map', 'assets/desertIsland.json');//mission file - can I show a preloader? should I?        
        
    },
    create: function () {
        this.game.stage.disableVisibilityChange = true;
        this.game.time.advancedTiming = true;
        this.stage.backgroundColor = "#444444"
        
        this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
       
        this.uiGroup = this.add.group();
        this.textUIHandler = new TextUIHandler(this.game, 0, 0, this, null);
        //
        this.gameData = this.game.cache.getJSON('gameData');
        this.gameDataPlayer = this.game.cache.getJSON('playergamedata');
        //this.playerData = this.game.cache.getJSON('player');
        //
        this.mapData = this.game.cache.getJSON('map');
        //
        
        //actors, variables, quests, items
        this.globalHandler = new GlobalHandler(this.game, this, this.mapData.data.Actors, this.mapData.data.Variables, null, this.mapData.data.Items);
        //
        //restrictions on states. Can't enter talk state while in combat.
        //
        this.dialoghandler = new DialogHandler(this.game, this, this.mapData.data.Conversations, this.mapData.data.Actors);
        
        this.textUIHandler.setup(this.mapData, this.uiGroup, this.dialoghandler);
        //
        this.camera = new PlayerCamera(this.game, this);
        //
        if(this.map==null)
            this.map = new Map(this.game, this);
        this.map.initialMap(this.mapData, this.gameData, this.game.cache.getJSON('player'), this.gameDataPlayer);
        //this.map.initialMap(this.mapData, this.gameData, this.game.cache.getJSON('player'), this.gameDataPlayer);
        
        this.bulletHandler = new BulletHandler(this.game, this, this.map.objectGroup, 'gameplayinterface', "combat_actionpoints0002.png");
        //
        this.gGameMode = new StateMachine();
        //this.gGameMode.add("normal", new RealTimeCombatState(this.gGameMode, this.game, this));
        this.gGameMode.add("normal", new NormalState(this.gGameMode, this.game, this));
        this.gGameMode.add("combat", new BattleState(this.gGameMode, this.game, this));
        this.gGameMode.add("dialog", new DiaglogState(this.gGameMode, this.game, this, this.dialoghandler, this.uiGroup));
        this.gGameMode.add("playerDead", new DeathState(this.gGameMode, this.game, this));
        
        /**/
        //var inCombat = this.map.getCombatCharacters();
        //inCombat.unshift(this.map.playerCharacter);
        
        //this.gGameMode.change("combat", {entities:inCombat});
        this.gGameMode.change("normal");

        //
        this.uiGroup.parent.bringToTop(this.uiGroup);//keeps ui group on top layer
        //
        this.inventory = new InventoryGraphics(this.game,this.gameref,this.globalHandler);
        this.game.add.existing(this.inventory);
        this.uiGroup.add(this.inventory);
        //this.inventory.x = 0;
        this.inventory.y = this.game.world.height-110;//490;
        this.inventory.visible = false;

        this.normalUI = new NormalUI(this.game, this, this.globalHandler, this.uiGroup);
        
        this.graphics = this.game.add.graphics(0, 0);
        this.uiGroup.add(this.graphics);
        

        //console.log(this.map.mapGroup.width/2,this.map.mapGroup.height);
        this.updatewalkable = true;
        this.camera.setinit();
        //this.camera.step(elapsedTime);
        
        //this.toggleCombat();
        //Client.askNewPlayer();
    },
    //
    update: function () {
        var elapsedTime = this.game.time.elapsed;
        //
        this.map.update(elapsedTime);
        this.bulletHandler.step(elapsedTime);
        //
        if(this.updatewalkable)
        {
            this.pathfinder.setGrid(this.map.walkableArray, [1]);
            this.updatewalkable = false;
            if(this.game.global.showmovetile)
                this.map.refreshWalkablView();
        }
        this.gGameMode.update(elapsedTime);
        this.gGameMode.render();
        
        this.textUIHandler.update(elapsedTime);
        //this.map.masker.updateMasks(this.input.worldX-this.map.mapGroup.x,this.input.worldY-this.map.mapGroup.y);
        this.camera.step(elapsedTime);
        //this.masker.updateMasks(this.playerCharacter.x, this.playerCharacter.y, this.playerCharacter.posx, this.playerCharacter.posy);
        //fps.text = this.game.time.fps;
    },
    getGameData:function(type,name,forcePlayer){
        //console.log(type,name);
        //console.log(this.gameData[type][name],type,name);
        
        if(this.gameData[type])// && !forcePlayer)
        {
            if(this.gameData[type][name])
            {
                return this.gameData[type][name];
            }
        }
        if(this.gameDataPlayer[type])// && forcePlayer)
        {
            if(this.gameDataPlayer[type][name])
            {
                return this.gameDataPlayer[type][name];
            }
        }
        return null;
    },
    //
    zoomIn:function(button, pointer){
        //console.log(button,pointer,this);
        pointer.active = false;
        var scaledto = this.map.scaledto - 0.05;
        if(scaledto<0)
            scaledto = 0.01;
        this.map.doZoom(scaledto);
    },
    zoomOut:function(button, pointer){
        pointer.active = false;
        var scaledto = this.map.scaledto + 0.05;
        this.map.doZoom(scaledto);
    },
    //
    toggleCombat:function()
    {   
        if(this.gGameMode.currentState == "combat" && this.gGameMode.mCurrentState.leaveThisState())
        {
            //test if enemies still in aggo list?
            this.gGameMode.change("normal");
        }
        else if(this.gGameMode.currentState == "normal")
        {
            var inCombat = this.map.getCombatCharacters();
            for(var x=0;x<this.map.playerCharacters.length;x++)
                inCombat.push(this.map.playerCharacters[x]);
            this.gGameMode.change("combat", {entities:inCombat});
        }
        else
        {
            //console.log("toggleCombat no");
            //error beep
        }
    },
    showDialog:function(convid){
        if(this.gGameMode.currentState != "combat")//for now don't let dialog work in combat
        {
            this.gGameMode.change("dialog");
            this.gGameMode.mCurrentState.startDialog(convid);
            //this should be needed
            GlobalEvents.tempDisableEvents();
        }
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
    render: function()
    {
        this.game.debug.text(this.game.time.fps || '--', 2, 40, "#00ff00");   
        //this.game.debug.text(this.gGameMode.currentState, 2, 10, "#00ff00");
        //this.game.debug.text("currentAction "+GlobalEvents.currentAction, 2, 25, "#00ff00");
        //this.game.debug.text("currentAction "+GlobalEvents.currentAction, 2, 50, "#00ff00");
        //this.game.debug.text(this.game.time.fps || '--', 2, 40, "#00ff00");  
        //game.debug.text("Tween running: " + !this.idleBallTween.pendingDelete, 2, 110);
        
        //this.game.debug.inputInfo(16, 16);
    },
    shutdown: function () {
        //console.log("flush");
        this.map.flushEntireMap();
        
    },
    callFunction: function(fnstring,fnparams) 
    {
        var fn = this[fnstring];
        fnparams = fnparams.split(',');
        if (typeof fn === "function") {
            //console.log(fn,this);
            fn.apply(this, fnparams);
        }
    },
    addNewPlayer: function(id,x,y){
        Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    }
};

//
var Point = function(x, y) {
  this.x = x;
  this.y = y;
};
var Vec3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};
BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

    init: function () {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        this.game.canvas.oncontextmenu = function (e) { e.preventDefault();  };//destroyAnchor();
        this.game.scale.windowConstraints.bottom = "visual";//make the bottom border affect the game
        
        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(100, 30, 1024, 768);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(100, 30, 1024, 768);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            //this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    },

    preload: function () {
        this.load.atlasJSONHash('loadingScreen', this.game.global.uilocation + 'loading.png', this.game.global.uilocation + 'loading.json');
        
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

//load full map for session?
//or maybe put this in pre-load

BasicGame.LoadMap = function (game) {

};
BasicGame.LoadMap.prototype = {
    preload: function () {
        this.background = this.add.sprite(0, 0, 'loadingScreen', 'bg.png');
        this.preloadBar = this.add.sprite(0, 273, 'loadingScreen', 'loading_barfront.png');
        //
        //load set data. This will eventually be from the server
        //should test if this is already done
        
        var levels = this.game.cache.getJSON('levels').Levels;
        
        //console.log(this.game.global,this.game.global.loadMap,this.levels)
        var level = levels[this.game.global.loadMap];
        if(level!=null)
        {
            console.log("Load map: ", level.gameData, level.map)
            this.load.json('gameData', this.game.global.assetsLocation +"maps/" + level.gameData+".json");
            this.load.json('map', this.game.global.assetsLocation +"maps/" + level.map+".json");
        }
        else
        {
            //show error message
            //
            console.error("Map Not exists.")
        }
        
	},
    updateProgress:function(progress, filekey, success, totalloadedfiles, totalfiles){
        var val = progress /100;
        this.preloadBar.width = this.barwidth * val;
        //console.log(val);
    },
	create: function () {
        this.secondLoader = new Phaser.Loader(this);
        
        var tilesets = this.game.cache.getJSON('map').tileSets;
        var spritesheetstoload = [];
        for (var key in tilesets) {
            var obj = tilesets[key];
            console.log('assets/'+obj.tileset+'.png', 'assets/'+obj.tileset+'.json');
            this.secondLoader.atlasJSONHash(obj.tileset, this.game.global.assetsLocation + 'assets/'+obj.tileset+'.png', this.game.global.assetsLocation + 'assets/'+obj.tileset+'.json');
        }
        //gamedata.Items loop for InvetoryGraphicSheet 
        //or have ability to just set which other graphics to load
        
        this.secondLoader.atlasJSONHash('standardimages', this.game.global.assetsLocation + 'assets/standardimages.png', this.game.global.assetsLocation + 'assets/standardimages.json');
        //test if interface is different?
        this.secondLoader.atlasJSONHash('gameplayinterface', this.game.global.assetsLocation + 'assets/paradoxinterface.png', this.game.global.assetsLocation + 'assets/paradoxinterface.json');

        this.barwidth = this.preloadBar.width;
        this.preloadBar.width = 0;
        
        this.secondLoader.onFileComplete.add(this.updateProgress,this);
        this.secondLoader.onLoadComplete.add(this.loadComplete, this);        
        this.secondLoader.start();
	},
    testSpriteSheet:function(){
        
    },
    loadComplete:function(){
        this.secondLoader.reset(false,true);
        this.secondLoader = null;
        this.state.start('Game',true,false);
    },
	update: function () {
	},
};


BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		this.add.sprite(0, 0, 'mainmenu');

		this.playButton = this.add.button(376, 425, 'ui', this.startGame, this, 'Play Button0001.png', 'Play Button0002.png', 'Play Button0002.png','Play Button0001.png');
        
        //this.playButton = this.add.button(376, 487, 'ui', this.gotoInstructions, this, 'Instructions Button0001.png', 'Instructions Button0002.png', 'Instructions Button0002.png','Instructions Button0001.png');

        this.state.start('MapSelect');
	},

	update: function () {

		

	},

	startGame: function (pointer) {

		
		//	And start the actual game
		this.state.start('MapSelect');

	},
    gotoInstructions: function (pointer) {


		//	And start the actual game
		this.state.start('Instructions');

	}

};


BasicGame.MapSelect = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MapSelect.prototype = {

	create: function () {
		this.add.sprite(0, 0, 'mapselect');

		this.back = this.add.button(10, 530, 'ui', this.returnToMain, this, 'menu0001.png', 'menu0002.png', 'menu0002.png','menu0001.png');
        var levels = this.game.cache.getJSON('levels').Levels;
        for(var x=0;x<levels.length;x++)
        {
            this.displayLevel(levels[x].name, x);    
        }
	},
    displayLevel:function(name, level){
        
        var btn = this.add.button(120, 200+60*level, 'ui', this.clickMap, this, 'button_blue_up.png', 'button_blue_over.png', 'button_blue_over.png','button_blue_up.png');
        btn.level = level;
        
        this.setupText(140,215+60*level, "simplefont", name, 20);
    },    
    clickMap:function(clicked, pointer){
        console.log(clicked.level, pointer);
        this.game.global.loadMap = clicked.level;
        this.state.start('LoadMap');
    },
	update: function () {
	},

	returnToMain: function (pointer) {
		this.state.start('MainMenu');
	}
};

BasicGame.MapSelect.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.add.bitmapText(x, y, font, text, size); 
    return newtext;
}


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
		this.preloadBar = this.add.sprite(0, 273, 'loadingScreen', 'loading_barfront.png');
        
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
        
        this.load.atlasJSONHash('ui', this.game.global.uilocation + 'simpleui.png', this.game.global.uilocation + 'simpleui.json');
        //this.load.atlasJSONHash('gameplayinterface', this.game.global.uilocation + 'paradoxinterface.png', this.game.global.uilocation + 'paradoxinterface.json');
        
		this.load.image('loading', this.game.global.uilocation + 'loading.png');
        
        if(!this.game.global.fastLoad)
        {
            this.load.image('mainmenu', this.game.global.uilocation + 'mainmenu.png');
            this.load.image('mapselect', this.game.global.uilocation + 'mapselect.png');
            this.load.image('winscreen', this.game.global.uilocation + 'winscreen.png');
            this.load.image('instructions', this.game.global.uilocation + 'instructions.png');
        }
        this.load.bitmapFont("simplefont", this.game.global.uilocation + "fonts/badabb.png", this.game.global.uilocation + "fonts/badabb.fnt");
        
        //this.load.atlasJSONHash('dialogui', 'dialogui.png', 'dialogui.json');//dialogui
        
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
	   //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here
        this.load.json('player', this.game.global.assetsLocation + 'maps/playerdata.json');
        this.load.json('playergamedata', this.game.global.assetsLocation + 'maps/playergamedata.json');
        
        //
        this.load.json('levels', 'assets/levels.json');
        
        this.barwidth = this.preloadBar.width;
        this.preloadBar.width = 0;
        
        this.load.onFileComplete.add(this.updateProgress,this);
	},
    updateProgress:function(progress, filekey, success, totalloadedfiles, totalfiles){
        var val = progress /100;
        //console.log(this.barwidth * val)
        this.preloadBar.width = this.barwidth * val;
        //this.rocket.x = this.barwidth * val;
        //console.log(val);
    },
	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        
        if(this.game.global.fastLoad)
            this.state.start('LoadMap');
        else
            this.state.start('MainMenu');
        //this.state.start('MapSelect');
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

//***** CombatButtons ********
//Player select able buttons
//will need multiple of these for each active player?
//for now only the main player gets powers?
CombatButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
    //
    this.currentActive;
    this.activeToggle;
    this.buttons = [];
    //
    // weapon swap ( 2 choices )
    //
    // 4 based on weapon (1 group invisible)
    // 4 buff / actions
    
    //points number across top
    //end turn

    this.player = this.gameref.map.playerCharacter;
    this.players = this.gameref.map.playerCharacters;
      
    this.range = null;
    this.melee = null;
    this.buffs = null;

    
    this.powerRollerOver = new PowerRollOver(this.game, this.gameref, this);
    
    if(this.player.weaponCatagories)
    {
        this.range = this.player.weaponCatagories["Range"];
       // this.melee = this.player.weaponCatagories["Melee"];
        this.buffs = this.player.weaponCatagories["Buffs"];
        
        this.bargroups = [];
        this.bargrouppowers = [];
        //
        
        var iwidth = 60;
        
        var attacksx = 100;
        var attacksy = 50;
        
        var buffx = 300;
        
        this.bargroups["Range"] = this.game.add.group();
        this.addChild(this.bargroups["Range"]);
        this.bargrouppowers["Range"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.range[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+i*iwidth, attacksy, "gameplayinterface", "combat_power_empty.png");
                this.bargroups["Range"].addChild(s);
            }
            else
            {
                this.bargrouppowers["Range"][i] = {up:null, active:null, power:this.range[i], ui:this};
                this.setButton(attacksx+i*iwidth, attacksy, "combat_power_attack.png", "combat_power_buff.png", this.bargrouppowers["Range"][i], this.doPower, this.bargroups["Range"], this.handlePowerOver, this.handlePowerOut); 
                this.setupText(attacksx+i*iwidth+3,attacksy+15, "simplefont", this.range[i].weaponname, 10);//this should be resused
            }
        }
        
        //
       /* this.bargroups["Melee"] = this.game.add.group();
        this.addChild(this.bargroups["Melee"]);
        this.bargrouppowers["Melee"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.melee[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+i*iwidth,attacksy-100,"gameplayinterface","combat_power_empty.png");
                this.bargroups["Melee"].addChild(s);
            }
            else
            {
               this.bargrouppowers["Melee"][i] = {up:null,active:null, power:this.melee[i], ui:this};
                this.setButton(attacksx+i*iwidth,attacksy-100,"combat_power_attack.png","combat_power_attack.png", this.bargrouppowers["Melee"][i], this.doPower, this.bargroups["Melee"], this.handleOver, this.handleOut); 
                this.setupText(attacksx+i*iwidth+3,attacksy-100+15, "simplefont", this.melee[i].weaponname, 12);
            }
        }*/
        //
       /* this.bargroups["Buffs"] = this.game.add.group();
        this.addChild(this.bargroups["Buffs"]);
        this.bargrouppowers["Buffs"] = [];
        for(var i=0;i<4;i++)
        {
            if(this.buffs[i]==undefined)
            {
                var s = this.game.make.sprite(attacksx+buffx+i*iwidth,attacksy,"gameplayinterface","combat_power_empty.png");
                this.bargroups["Buffs"].addChild(s);
            }
            else
            {
                
                this.bargrouppowers["Buffs"][i] = {up:null, active:null, power:this.buffs[i], ui:this};
                this.setButton( attacksx+buffx+i*iwidth, attacksy, "combat_power_buff.png", "combat_power_buff.png", this.bargrouppowers["Buffs"][i], this.doPower, this.bargroups["Buffs"], this.handleOver, this.handleOut); 
                this.setupText(attacksx+buffx+i*iwidth+3,attacksy+15, "simplefont", this.buffs[i].weaponname, 10);
            }
        }*/
        //
    }    
   /* this.toggleMelee = {up:null,active:null};
    this.setButton(5, 24, "combat_toggle_melee.png","combat_toggle_melee.png", this.toggleMelee, this.doMelee, this);
    
    this.toggleRange = {up:null,active:null};
    this.setButton(5, 60, "combat_toggle_range.png","combat_toggle_range.png", this.toggleRange, this.doRange, this);
    */
    //this.endTurn = {up:null, active:null};
    var btn = this.game.add.button(900-iwidth*3, attacksy, 'gameplayinterface', this.endTurnPress, this, 'actionButtonSqr0001.png', 'actionButtonSqr0003.png', 'actionButtonSqr0003.png','actionButtonSqr0001.png');
    this.addChild(btn);
    this.setupText(900-iwidth*3+15, attacksy+10, "simplefont", "End Turn", 20);
}
CombatButtons.prototype = Object.create(Phaser.Group.prototype);
CombatButtons.constructor = CombatButtons;
CombatButtons.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.make.bitmapText(x, y, font, text, size); 
    this.add(newtext);
    return newtext;
}

CombatButtons.prototype.setButton = function(x, y, imageup, imageactive, ref, clickevent, group, over, out){
    
    ref.up = this.game.make.sprite(x,y,"gameplayinterface",imageup);
    ref.up.inputEnabled = true;
    ref.up.useHandCursor = true;
    ref.up.input.priorityID = 10; 
    //console.log(imageup, group);
    //group.inputEnabled = true;
    group.add(ref.up);
    
    ref.up.events.onInputDown.add(clickevent, ref);
    
    if(over!=undefined)
    {
        ref.up.events.onInputOver.add(over, ref);
    }
    if(out!=undefined)    
    {
        ref.up.events.onInputOut.add(out, ref);
    }
    this.buttons[ref.up.x+""] = ref;

    ref.imageup = imageup;
    ref.imageactive = imageactive;
    
    //ref.active = this.game.make.sprite(x,y,"gameplayinterface",imageactive);
    //ref.active.visible = false;
    //group.add(ref.active);
}
CombatButtons.prototype.endTurnPress = function(touchedSprite, pointer){
    //endTurn
    
    if(this.gameref.gGameMode.mCurrentState.inputHandler.playerDecide)
        this.gameref.gGameMode.mCurrentState.endPlayerTurn();
}
CombatButtons.prototype.handlePowerOver = function(touchedSprite, pointer)
{
    //console.log(this.ui.powerRollerOver, this)
    
    //console.log("handle over", this)
    this.ui.powerRollerOver.setText(touchedSprite.x, touchedSprite.y, this.power);
}
CombatButtons.prototype.handlePowerOut = function(touchedSprite, pointer)
{
    //console.log("handle out")
    this.ui.powerRollerOver.hide();
}

//Toggle
/*CombatButtons.prototype.doMelee = function(touchedSprite, pointer){
    //console.log("domelee",this.activeToggle);
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.activeToggle);
    this.activeToggle = this.buttons[touchedSprite];
    this.enableButton(this.activeToggle);
    
    this.bargroups["Range"].visible = false;
    this.bargroups["Melee"].visible = true;
}
CombatButtons.prototype.doRange = function(touchedSprite, pointer){
    //console.log("range",this.activeToggle);
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.activeToggle);
    this.activeToggle = this.buttons[touchedSprite];
    this.enableButton(this.activeToggle);
    
    this.bargroups["Range"].visible = true;
    this.bargroups["Melee"].visible = false;
}*/
/*CombatButtons.prototype.switchWeaponLoadout = function()
{
    //
}*/
//

CombatButtons.prototype.doPower = function(touchedSprite, pointer){
    //this.ui is this    
    //console.log(this, a,b,c,d);
    //touching another player with weapon does attack
    //if self buff (heal) just clicking?
    //console.log("handle press")
    console.log(this.ui)
    
    for(var x=0;x<this.ui.players.length;x++)
    {
        this.ui.players[x].currentSelectedWeapon = this.power;
    }
    //this.ui.player.currentSelectedWeapon = this.power;
    //console.log(this, this.ui.player.currentSelectedWeapon);
    this.ui.disableButton(this.ui.currentActive);
    this.ui.currentActive = this.ui.buttons[touchedSprite.x+""];
    this.ui.enableButton(this.ui.currentActive);
    
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
}
CombatButtons.prototype.dowalk = function(touchedSprite, pointer){
    if(pointer!=undefined)
        pointer.active = false;  
    this.disableButton(this.currentActive);
    this.currentActive = this.buttons[touchedSprite];
    this.enableButton(this.currentActive);
    
    GlobalEvents.currentAction = GlobalEvents.COMBATSELECT;
    //console.log("do walk");
}


//
CombatButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentAction != GlobalEvents.COMBATSELECT)
        this.disableAll();
}
CombatButtons.prototype.enableButton = function(ref){
    if(ref==null)
        return;
    ref.up.frameName = ref.imageactive;
    //imageactive
    //ref.up.visible = false;
    //ref.active.visible = true;
}
CombatButtons.prototype.disableButton = function(ref){
    if(ref==null)
        return;
    ref.up.frameName = ref.imageup;
    //ref.up.visible = true;
    //ref.active.visible = false;    
    //ref.ui.powerRollerOver.hide();
}
//roll over the power 
PowerRollOver = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    //name
    //dmg
    //acc
    var offsetx = 15;
    var iheight = 18;
    var portrait = this.game.make.sprite(0,0,"gameplayinterface","dialog_portrait1.png");
    portrait.width = 120;
    portrait.height = iheight * 6;
    this.add(portrait);
    
    this.name = this.setupText(offsetx, iheight * 0, "simplefont", "Text goes here.", 15);
    this.acc = this.setupText(offsetx, iheight * 1, "simplefont", "Text goes here.", 15);
    this.dmg = this.setupText(offsetx, iheight * 2, "simplefont", "Text goes here.", 15);
    this.range = this.setupText(offsetx, iheight * 3, "simplefont", "Text goes here.", 15);
    this.type = this.setupText(offsetx, iheight * 4, "simplefont", "Text goes here.", 15);
    this.desc = this.setupText(offsetx, iheight * 5, "simplefont", "Text goes here.", 15);
    
    this.visible = false;
}
PowerRollOver.prototype = Object.create(Phaser.Group.prototype);
PowerRollOver.constructor = PowerRollOver;
//
PowerRollOver.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.make.bitmapText(x, y, font, text, size); 
    this.add(newtext);
    return newtext;
}
PowerRollOver.prototype.setText = function(x, y, power)
{
    this.visible = true;
    this.x = x - 20;
    this.y = y - 140;
    this.name.text = power.weaponname;
    this.dmg.text = "Damage: " + power.dmg;
    this.acc.text = "ACC: " + power.acc;
    this.range.text = "Range: " + power.range;
    this.type.text = "Type: " + power.powerType;
    this.desc.text = power.description;
}
PowerRollOver.prototype.hide = function()
{
    this.visible = false;
}



EnemyTargetRollOver = function(game, maingame, parent){
    //show acc%
	Phaser.Group.call(this, game);
    var offsetx = 15;
    var iheight = 18;
    this.acc = this.setupText(offsetx, iheight * 0, "simplefont", "Text goes here.", 20);
    this.visible = false;
}
EnemyTargetRollOver.prototype = Object.create(Phaser.Group.prototype);
EnemyTargetRollOver.constructor = EnemyTargetRollOver;

EnemyTargetRollOver.prototype.showText = function(x, y, acc)
{
    this.visible = true;
    this.x = x - 20;
    this.y = y;
    this.acc.text = acc;
}
EnemyTargetRollOver.prototype.setupText = function(x, y, font, text, size)
{
    var newtext = this.game.make.bitmapText(x, y, font, text, size); 
    this.add(newtext);
    return newtext;
}
EnemyTargetRollOver.prototype.setButton = function(){
}
    
    
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
    Phaser.BitmapText.call(this, game, 0, 0, "simplefont", "Text goes here.", 25);
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
var DialogPanel = function(game, maingame, dialogEngine, parent, state){
	Phaser.Group.call(this, game);

    this.state = state;
    this.overTint = 0xff5500;
    this.maingame = maingame;
    this.dialogEngine = dialogEngine;
}
DialogPanel.prototype = Object.create(Phaser.Group.prototype);
DialogPanel.constructor = DialogPanel;


//
DialogPanel.prototype.setup = function(button){   
    
    var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    this.add(shadow);
    shadow.width = 900;
    shadow.height = 600;
    shadow.x = -200;
    shadow.y = -100;
    //
    //this.setupBG("gameplayinterface","dialog_main.png");
    //
    var height = 69.6;
    var offsetx = 50;
    var offsety = 200;
    this.btnPlay1 = this.setupButton(offsetx, offsety + height * 0, 'gameplayinterface', this.play1,'dialong_choice0002.png', 'dialong_choice0001.png', 'dialong_choice0001.png', 'dialong_choice0002.png');
    this.btnPlay2 = this.setupButton(offsetx, offsety + height * 1, 'gameplayinterface', this.play2,'dialong_choice0002.png', 'dialong_choice0001.png', 'dialong_choice0001.png', 'dialog_20002.png');    
    this.btnPlay3 = this.setupButton(offsetx, offsety + height * 2, 'gameplayinterface', this.play3, 'dialong_choice_end0002.png', 'dialong_choice_end0001.png', 'dialong_choice_end0001.png', 'dialong_choice_end0002.png');
    //
    this.textMain = this.setupText(offsetx, 0, "simplefont", "Text goes here.", 25); 
    //var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    //this.add(shadow);
    this.btnPlay1.textRef = this.setupText(10 + offsetx, offsety + height * 0, "simplefont", "1. ", 25);
    this.btnPlay2.textRef = this.setupText(10 + offsetx, offsety + height * 1, "simplefont", "2. ", 25);
    this.btnPlay3.textRef = this.setupText(10 + offsetx, offsety + height * 2, "simplefont", "3. ", 25);
    
    this.portrait1 = null;
    this.portrait2 = null;
    
    //this.btnPlay1
    //this.btnPlay1
    //this.btnPlay1
	// Place it out of bounds (?)
	//this.x = 300;
    this.y = -1000;
};
//
DialogPanel.prototype.setupPortrait = function(x,y,spritesheet,sprite)
{    
    var portrait = this.game.make.sprite(x,y,spritesheet,sprite);
    portrait.scale.setTo(2,2);
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
DialogPanel.prototype.setupButton = function(x,y,spritesheet, callback, overFrame, outFrame, downFrame, upFrame)
{    
    var newBtn = this.game.make.button(x,y,spritesheet, callback, this, overFrame, outFrame, downFrame, upFrame);
    this.add(newBtn);
    //
    newBtn.events.onInputOver.add(this.buttonOver, this);
    newBtn.events.onInputOut.add(this.buttonOut, this);
    newBtn.forceOut = true;
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
    //console.log("over");
    button.textRef.tint = this.overTint;
};
DialogPanel.prototype.buttonOut = function(button){
    //console.log("out");
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
        this.portrait1 = this.setupPortrait(-100,0,"actors2",this.dialogData.actor.json.Pictures+".png");
    else if(this.portrait1.frameName != this.dialogData.actor.json.Pictures)
        this.portrait1.frameName = this.dialogData.actor.json.Pictures+".png";
    //this.portrait2.scale.setTo(2,2);
    
    //if links are players do normal
    //else can click anywhere?
    if(this.dialogData.links.length>1 && this.dialogData.links[0].Actor == this.dialogEngine.playerActor.id)
    {
        //if no pictures?
        var thisactor = this.maingame.globalHandler.getActorByID(this.dialogData.links[0].Actor);
        if(this.portrait2==null)
            this.portrait2 = this.setupPortrait(-100,200,"actors2",thisactor.json.Pictures+".png");
        else if(this.portrait2.frameName != thisactor.json.Pictures)
        {
            this.portrait2.visible = true;
            this.portrait2.frameName = thisactor.json.Pictures+".png";
            //this.portrait2.scale.setTo(2,2);
        }
        
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
        if(this.portrait2)
            this.portrait2.visible = false;
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
        this.y = 100;
        this.x = 200;
        this.setupDialog();
    }
    else
    {
        console.log("dialog data not found");
    }
};
DialogPanel.prototype.endDialog = function(){
    //this.btnPlay1.changeStateFrame.apply(this.btnPlay1,['Up']);
    //this.btnPlay2.frame = 0;
    //this.btnPlay3.frame = 0;
    //this.game.state.getCurrentState().playGame()}
    //unpause game!
    this.state.exitDialog();
    this.visible = false;
    this.y = -1000;
};



//***** JustTextPopup ********
JustTextPopup = function(game, maingame, dialogEngine, parent){
    Phaser.Group.call(this, game, parent);
//
    var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    this.add(shadow);
    shadow.width = 900;
    shadow.height = 600;
    //shadow.x = -200;
    //shadow.y = -100;
//
    this.maingame = maingame;
    this.textMain = this.game.make.bitmapText(10, 10, "simplefont", "Text goes here.", 35);
    //this.textMain.tint = 0x00ffff;
    this.textMain.wordWrap = true;
    this.textMain.wordWrapWidth = 300;
    this.add(this.textMain);
//
    this.visible = false;
}
JustTextPopup.prototype = Object.create(Phaser.Group.prototype);
JustTextPopup.constructor = JustTextPopup;
//
JustTextPopup.prototype.showText = function(texttodisplay, tint){
    
    this.textMain.text = texttodisplay;
    
    if(tint)
        this.textMain.tint = tint;
    else
        this.textMain.tint = 0xffffff;
    
    this.textMain.x = this.game.width/2-this.textMain.width/2;
    this.textMain.y = this.game.height/2-this.textMain.height/2;

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
var TextUIHandler = function (game, x, y, gameref, parent)
{
    //Phaser.Group.call(this, game, parent);
    this.gameref = gameref;
    this.game = game;
    
    this.justTextPopup;//Single text display
    this.barkHandler;
    this.activeButtons;//Action Buttons ui

    this.rollovertext;
    
    this.mapData;
}
//TextUIHandler.prototype = Object.create(Phaser.Group.prototype);
//TextUIHandler.constructor = TextUIHandler;

TextUIHandler.prototype.setup = function(mapData, uiGroup, dialoghandler)
{
    this.mapData = mapData;
    this.uiGroup = uiGroup;
    
        //    
    this.justTextPopup = new JustTextPopup(this.game,this.gameref,this.dialoghandler);
    this.game.add.existing(this.justTextPopup);
    this.uiGroup.add(this.justTextPopup);

    this.barkHandler = new BarkTextHandler(this.game,this.gameref);
    this.game.add.existing(this.barkHandler);
    this.uiGroup.add(this.barkHandler);

    this.rollovertext = this.game.make.bitmapText(0, 0, "simplefont", "Text goes here.", 25);
    this.rollovertext.visible = false;
    this.game.add.existing(this.rollovertext);
    this.uiGroup.add(this.rollovertext);
}

//this needs to be controlled by a queue?
//if 2 are show at once, they are displayed 1 after the other
TextUIHandler.prototype.showDeadText = function(textDisplay)
{
    this.justTextPopup.showText(textDisplay,0xff0000);
},
TextUIHandler.prototype.showJustText = function(textDisplay)
{
    this.justTextPopup.showText(textDisplay);
    GlobalEvents.tempDisableEvents();
    this.gameref.pauseGame();
},
TextUIHandler.prototype.showBark = function(object,text)
{
    this.barkHandler.barkOverObject(object,text);
},
/*TextUIHandler.prototype.showJustTextDialog = function(convid)
{
    //console.log("showJustTextDialog");
    this.justTextPopup.showTextFromHandler(convid);
    GlobalEvents.tempDisableEvents();
    this.pauseGame();
},*/
TextUIHandler.prototype.showRollover = function(text, x, y)
{
    if(!this.rollovertext)
        return;
    this.rollovertext.text = text;
    this.rollovertext.anchor.x = 0.5;
    this.rollovertext.visible = true;

    //console.log(text,x,y);
    this.rollovertext.x = (x + this.gameref.map.mapGroup.x) * this.gameref.map.scaledto;
    this.rollovertext.y = (y + this.gameref.map.mapGroup.y) * this.gameref.map.scaledto;
    
    //if display is off the screen
    if(this.rollovertext.y<0){
        this.rollovertext.y = y + this.gameref.map.mapGroup.y;// + object.height;// + object.height;
    }
    this.rollovertext.tint = 0x9999ff;
}
TextUIHandler.prototype.hideRollover = function()
{
    this.rollovertext.visible = false;
}
TextUIHandler.prototype.update = function(elapsedTime)
{
    this.barkHandler.step(elapsedTime);
}
//***** ActionButtons ********
//Player select able buttons
ActionButtons = function(game, maingame, parent){
	Phaser.Group.call(this, game, parent);
    this.gameref = maingame;
    //
    this.currentActive;
    //
    
    var width = 90
    
    var shadow = this.game.make.sprite(0, 0,"gameplayinterface","dropshadow_btn.png");
    //shadow.width = 90 * 4;
    //shadow.height = 40;
    shadow.x = -20;
    shadow.y = 20;
    
    /*this.magic = {up:null,active:null};
    this.setButton(width * 4, 0,"actionButton0001.png", "actionButton0003.png", this.magic, this.domagic, "actionbuttonIcons0008.png");*/
    
    this.talk = {up:null,active:null};
    this.setButton(width * 3, 0,"actionButton0001.png", "actionButton0003.png", this.talk, this.dotalk, "actionbuttonIcons0005.png");
    
        
    this.look = {up:null,active:null};
    this.setButton(width * 2, 0,"actionButton0001.png", "actionButton0003.png", this.look, this.dolook, "actionbuttonIcons0007.png");
    
        
    this.use = {up:null,active:null};
    this.setButton(width * 1, 0,"actionButton0001.png", "actionButton0003.png", this.use, this.douse, "actionbuttonIcons0006.png");
    
    this.walk = {up:null,active:null};
    this.setButton(width * 0, 0,"actionButton0001.png", "actionButton0003.png", this.walk, this.dowalk, "actionbuttonIcons0001.png");
    
    
    var offset = 35;
    width = 94.7;
    this.zoomIn = {up:null,active:null};
    this.setButton(this.game.world.width - width * 1 - offset, -50,"actionButtonSqr_end0001.png", "actionButtonSqr_end0003.png", this.zoomIn, this.doZoomIn, undefined, false, "+");
    
    this.zoomIn = {up:null,active:null};
    this.setButton(this.game.world.width - width * 2 - offset, -50,"actionButtonSqr_end0001.png", "actionButtonSqr_end0003.png", this.zoomIn, this.doZoomOut, undefined, false, "-");
    
    this.settings = {up:null,active:null};
    this.setButton(this.game.world.width - width * 1 - offset, 0,"actionButtonSqr_end0001.png", "actionButtonSqr_end0003.png", this.settings, this.returnToMenu, "actionbuttonIcons0003.png", true);
    
    
    this.settings = {up:null,active:null};
    this.setButton(this.game.world.width - width * 1 - offset, 0,"actionButtonSqr_end0001.png", "actionButtonSqr_end0003.png", this.settings, this.returnToMenu, "actionbuttonIcons0003.png", true);
    //this.settings.up.tint = 0x00ffff
    
    this.combat = {up:null,active:null};
    this.setButton(this.game.world.width - width * 2 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.combat, this.pressedCombat, "actionbuttonIcons0002.png", true);
    this.gameref.gGameMode.changeState.add(this.checkCombat, this);
    
    /*this.log = {up:null,active:null};
    this.setButton(this.game.world.width - width * 3 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.log, this.doLog, "actionbuttonIcons0009.png", true);
    this.log.up.tint = 0x00ffff*/
    
    this.inv = {up:null,active:null};
    this.setButton(this.game.world.width - width * 3 - offset, 0,"actionButtonSqr0001.png", "actionButtonSqr0003.png", this.inv, this.doInv, "actionbuttonIcons0004.png", true);
    this.gameref.inventory.changeState.add(this.checkInv, this);
    this.gameref.inventory.invSelected.add(this.invSelected, this);
    

    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
    this.dowalk();
}
ActionButtons.prototype = Object.create(Phaser.Group.prototype);
ActionButtons.constructor = ActionButtons;
ActionButtons.prototype.returnToMenu = function() 
{
    this.game.state.start('MainMenu');
}
ActionButtons.prototype.setButton = function(x,y,imageup,imageactive,ref, clickevent, icon, toggle, text){
    
    ref.up = this.game.make.sprite(x,y,"gameplayinterface",imageup);
    this.add(ref.up);
    ref.up.inputEnabled = true;
    ref.up.input.priorityID = 10; 
    ref.up.events.onInputDown.add(clickevent, this);
    ref.active = this.game.make.sprite(x,y,"gameplayinterface",imageactive);
    ref.active.visible = false;
    this.add(ref.active);
    
    if(toggle)
    {
        ref.active.events.onInputDown.add(clickevent, this);
        ref.active.inputEnabled = true;
        ref.active.input.priorityID = 10; 
    }
    if(icon!=undefined)
    {
        var iconImage = this.game.make.sprite(x+20,y+10,"gameplayinterface",icon);
        this.add(iconImage);
    }
    if(text!=undefined)
    {
        var buttontext = this.gameref.add.text(x+40,y+10,text);
        buttontext.font = "arial";
        buttontext.fontSize = 20;
        buttontext.color = 0xffffff;
        this.add(buttontext);
    }
    
}
//these also should do something
ActionButtons.prototype.doInv = function(touchedSprite, pointer){
    pointer.active = false;
    this.gameref.inventory.toggle();
}
ActionButtons.prototype.checkInv = function(state){
    if(state)
    {
        this.enableButton(this.inv);
    }
    else
    {
        this.disableButton(this.inv);
    }
}
ActionButtons.prototype.invSelected = function(){
    this.clearActive();
}

ActionButtons.prototype.doZoomIn = function(button, pointer)
{
    this.gameref.zoomIn(button, pointer)
}
ActionButtons.prototype.doZoomOut = function(button, pointer)
{
    this.gameref.zoomOut(button, pointer)
}

//open settings state
ActionButtons.prototype.doSettings = function(touchedSprite, pointer){
    pointer.active = false;
}

ActionButtons.prototype.doCombat = function(touchedSprite, pointer){
    pointer.active = false;
    this.gameref.toggleCombat();
}
ActionButtons.prototype.checkCombat = function(stateMachine,currentState){
    if(currentState=="combat")
    {
        this.enableButton(this.combat);    
        
    }
    else
    {
        this.disableButton(this.combat);
    }
    
}

ActionButtons.prototype.pressedCombat = function()
{
    this.gameref.toggleCombat();
    //this.gameref.textUIHandler.showJustText("Your not up for a fight.\nBetter to use your wits.");
}


ActionButtons.prototype.doLog = function(touchedSprite, pointer){
    pointer.active = false;
}



ActionButtons.prototype.clearActive = function()
{
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
/*ActionButtons.prototype.domagic = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.MAGIC;
    this.currentActive = this.magic;
    this.enableButton(this.currentActive);
}*/
ActionButtons.prototype.dowalk = function(touchedSprite, pointer){
    if(pointer)
        pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.WALK;
}
ActionButtons.prototype.douse = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.TOUCH;
}
ActionButtons.prototype.dolook = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.LOOK;
}
ActionButtons.prototype.dotalk = function(touchedSprite, pointer){
    pointer.active = false;
    this.disableButton(this.currentActive);
    GlobalEvents.currentAction = GlobalEvents.TALK;    
}
ActionButtons.prototype.disableAll = function(){
    this.disableButton(this.currentActive);
    this.currentActive = null;
}
ActionButtons.prototype.checkRefresh = function(){
    if(GlobalEvents.currentAction == GlobalEvents.ITEM)
    {
        this.disableAll();
    }
    if(this.currentActive)
        this.disableButton(this.currentActive);
    if(GlobalEvents.currentAction == GlobalEvents.TALK)
    {
        this.currentActive = this.talk;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.LOOK)
    {
        this.currentActive = this.look;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.WALK)
    {
        this.currentActive = this.walk;
        this.enableButton(this.currentActive);
    }
    else if(GlobalEvents.currentAction == GlobalEvents.TOUCH)
    {
        this.currentActive = this.use;
        this.enableButton(this.currentActive);
    }
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
    //var bg = this.game.make.sprite(0,0,"dialogui","inventory_bg.png");
    //this.add(bg);    
    //
    this.currentitems = []
    //
    var iwidth = 60;
    var num = 10;
    for(var j=0;j<num;j++)
    {
        var img = this.game.make.sprite(iwidth * j,0,"gameplayinterface","inventoryItem0001.png");
        img.scale.setTo(0.5,0.5);
        img.anchor.setTo(0.5,0.5);
        this.addChild(img);
    }
    this.selectedBG = this.game.make.sprite(0,-50,"gameplayinterface","inventoryItem0002.png");
    this.selectedBG.scale.setTo(0.5,0.5);
    this.selectedBG.anchor.setTo(0.5,0.5);
    this.selectedBG.visible = false;
    
    this.addChild(this.selectedBG);
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
            //    console.log(val,val.getValue("Inventory"))
                if(val.getValue("Inventory"))
                {
                    this.addInventoryGraphic(val);
                }
            }
        }
    }
    
    
    this.x = this.game.world.centerX - (iwidth * num)/2;
    
    this.changeState = new Phaser.Signal();
    this.invSelected = new Phaser.Signal();
    
    GlobalEvents.SendRefresh.add(this.checkRefresh,this);
}
InventoryGraphics.prototype = Object.create(Phaser.Group.prototype);
InventoryGraphics.constructor = InventoryGraphics;
//
InventoryGraphics.prototype.makeReturn = function(value) {
    return function () {
        this.itemChanged(value);
    };
}
InventoryGraphics.prototype.toggle = function(){
    if(this.visible)
    {
        this.closeThis();
    }
    else
    {
        this.visible = true;
        this.changeState.dispatch(true, this);
    }
}
InventoryGraphics.prototype.closeThis = function(){
    this.visible = false;
    this.changeState.dispatch(false, this);
    console.log("close", GlobalEvents.currentAction);
    if(GlobalEvents.currentAction == GlobalEvents.ITEM)
    {
        GlobalEvents.gotoLastAction();
    }
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
        this.selectedBG.visible = false;
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
    var newitem = new InventoryObject(this.game, this, "inventory", item.getValue("InventoryGraphicName")+".png", item);
    console.log(item.getValue("InventoryGraphicName"))
    //newitem.scale.setTo(0.5,0.5);
    newitem.anchor.setTo(0.5,0.5);
    this.add(newitem);
    this.currentitems.push(newitem);
    this.resuffle();
}
InventoryGraphics.prototype.highlight = function(item)
{
    this.selectedBG.visible = true;
    this.selectedBG.x = item.x;
    this.selectedBG.y = item.y;
}
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
InventoryGraphics.prototype.checkRefresh = function(){
    if(GlobalEvents.currentAction != GlobalEvents.ITEM)
    {
        this.selectedBG.visible = false;
        //this.disableAll();
    }
}

//



var NormalUI = function(game,maingame,globalhandler,uiGroup)
{
    this.game = game;
    this.gameref = maingame;
    this.globalHandler = globalhandler;
    this.uiGroup = uiGroup;
    
    this.activeButtons = new ActionButtons(this.game, this.gameref);
    this.activeButtons.x = 20;
    this.activeButtons.y = this.game.world.height-70;//540;
    this.game.add.existing(this.activeButtons);
    this.uiGroup.add(this.activeButtons);
}
NormalUI.prototype.hide = function() 
{
    this.activeButtons.visible = false;
}
NormalUI.prototype.show = function() 
{
    this.activeButtons.visible = true;
}

var InventoryObject = function(game, inventory, spritesheet, sprite, item)
{
    Phaser.Image.call(this, game, 0,0, spritesheet,sprite);   
    this.inventory = inventory;
    this.item = item;
    this.events.onInputDown.add(this.handleClick, this);
    this.inputEnabled = true;
}
InventoryObject.prototype = Object.create(Phaser.Image.prototype);
InventoryObject.constructor = InventoryObject;

InventoryObject.prototype.handleClick = function(){
    GlobalEvents.currentAction = GlobalEvents.ITEM;
    GlobalEvents.selectedItem = this.item;
    this.inventory.highlight(this);
    this.inventory.invSelected.dispatch(this.item, this, this.inventory);
}