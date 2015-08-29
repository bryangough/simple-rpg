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
