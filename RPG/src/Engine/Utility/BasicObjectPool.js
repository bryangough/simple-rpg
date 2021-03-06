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