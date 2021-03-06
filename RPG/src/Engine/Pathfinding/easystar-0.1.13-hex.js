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