//***** DialogHandler ********
//handle conditions?
var DialogHandler = function(game, maingame, conversations, actors){
    this.game = game;
    this.maingame = maingame;
    this.conversations = conversations;
    this.actors = actors;
    
    this.currentConvo;
    this.playerActor = this.getPlayerActor();
    this.eventDispatcher = new EventDispatcher(game,maingame,null);
}
DialogHandler.prototype.startConvo = function(id){
    this.currentConvo = this.getConversationsByID(id);
    
    if(this.currentConvo!=null)
    {
        var currentDiagData = this.buildDialogByID(0);
        
        if(currentDiagData!=null)
        {
            if(currentDiagData.current.MenuText==""&&currentDiagData.current.DialogueText=="")
                currentDiagData = this.buildDialogWithDiag(currentDiagData.links[0]);
            return currentDiagData;
        }
    }
    return null;
}
//for every other types (displaying the npcs text, players text as options, then going straight to next npc text)
//passing in selected link returns next npc
//passing in current displayed return next npc or pc
DialogHandler.prototype.getNextDialog = function(currentDialog){
    //do actions for this diaglog
    if(currentDialog.actions && currentDialog.actions.length>0)
    {
        var eventActions = [];
        this.eventDispatcher.helpSetActions(eventActions, currentDialog.actions, false, null);
        if(eventActions.length>0)
            this.eventDispatcher.completeAction(eventActions);
    }
    if(currentDialog.links.length<=0||currentDialog.links[0]==null)
        return null;
    //activate actions? //global dialog queue?
    return this.buildDialogByID(currentDialog.links[0].DestID);
}
//
DialogHandler.prototype.buildDialogByID = function(id){
    var currentDiag = this.getDialogByID(id);

    if(currentDiag==null)
        return null;
    return this.buildDialogWithDiag(currentDiag);
}
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
    var thisactor = this.getActorByID(currentDiag.Actor);//optimize this, save it somewhere
    var diagPackage = {current:currentDiag,links:links, actor:thisactor};    
    return diagPackage;
};
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
DialogHandler.prototype.getActorByID = function(actorid){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].id==actorid)
            return this.actors[i];
    }
    return null;
};
DialogHandler.prototype.getPlayerActor = function(){
    var l = this.actors.length;
    for(var i=0;i<l;i++)
    {
        if(this.actors[i].IsPlayer)
            return this.actors[i];
    }
    return null;
};