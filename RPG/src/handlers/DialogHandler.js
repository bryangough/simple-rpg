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
