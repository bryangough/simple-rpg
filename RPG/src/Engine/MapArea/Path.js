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