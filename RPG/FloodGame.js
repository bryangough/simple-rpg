BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    
    
    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};



    var hexagonWidth = 64;
	var hexagonHeight = 65;
	var gridSizeX = 22;
	var gridSizeY = 6;
	var columns = [Math.ceil(gridSizeX/2),Math.floor(gridSizeX/2)];
     var moveIndex;
     var sectorWidth = hexagonWidth;
     var sectorHeight = hexagonHeight/4*3;
     var gradient = (hexagonHeight/4)/(hexagonWidth/2);
     var marker;
    var hexagonGroup;
    var hexagonArray = [];
//
    var tiles = ["tileGrass.png", "tileAutumn.png", "tileDirt.png", "tileMagic.png", "tileRock.png", "tileSand.png", "tileSnow.png", "tileStone.png"];

    var floodFillStepCount = 0;
    var tempStepCount = 0;
    var floodQueue = [];
    var target;
	var replacement;
    var startTile;


//grass - ["bushGrass.png","flowerGreen.png","hillGrass.png","pineGreen_low.png", "treeGreen_mid.png","treeBlue_mid.png","pineGreen_high.png","pineGreen_low.png","flowerYellow.png","flowerRed.png"]
//autumn - ["bushAutumn.png","pineAutumn_high.png","pineAutumn_low.png","pineAutumn_mid.png", "hillAutumn.png","treeAutumn_high.png","treeAutumn_low.png","treeAutumn_mid.png"]
//dirt - ["bushDirt.png","hillDirt.png","flowerRed.png","rockDirt.png", "rockDirt_moss1.png","rockDirt_moss2.png","rockDirt_moss3.png"]
//magic - ["bushMagic.png","hillMagic.png"]
//rock - ["rockStone.png","rockStone_moss1.png","rockStone_moss2.png","smallRockStone.png","rockStone_moss3.png"]
//sand -["bushSand.png","hillSand.png", "treeCactus_1.png","treeCactus_2.png","treeCactus_3.png","flowerYellow.png","flowerWhite.png"]
//snow - ["bushSnow.png","flowerBlue.png","hillSnow.png","rockSnow_1.png","rockSnow_2.png","rockSnow_3.png"]
//stone - ["rockStone.png","rockStone_moss1.png","rockStone_moss2.png","smallRockStone.png"]

BasicGame.Game.prototype = {

    create: function () {
        //emanueleferonato
        hexagonArray = [];
        hexagonGroup = this.add.group();
       // this.stage.backgroundColor = "#ffffff"
        for(var i = 0; i < gridSizeY/2; i ++){
	     	hexagonArray[i] = [];
			for(var j = 0; j < gridSizeX; j ++){
				if(gridSizeY%2==0 || i+1<gridSizeY/2 || j%2==0){
					var hexagonX = hexagonWidth*j/2;
					var hexagonY = hexagonHeight*i*1.5+(hexagonHeight/4*3)*(j%2);	
                    
					var hexagon = this.add.sprite(hexagonX,hexagonY, "tiles", tiles[this.game.rnd.integerInRange(0, tiles.length-1)]); 
					hexagonGroup.add(hexagon);
					hexagonArray[i][j]=hexagon;
                    
                    //var hexagonText = this.add.text(hexagonX+hexagonWidth/3+5,hexagonY+15,i+","+j);
					//hexagonText.font = "arial";
					//hexagonText.fontSize = 12;
					//hexagonGroup.add(hexagonText);
				}
			}
		}
        
        //var tile = new Tile();
        hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        
		hexagonGroup.y = 20;//(600-hexagonHeight*Math.ceil(gridSizeY/2))/2;
          if(gridSizeY%2==0){
               hexagonGroup.y-=hexagonHeight/4;
          }
        console.log(-Math.ceil(gridSizeX/2)*hexagonWidth);//-Math.floor(gridSizeX/2)*hexagonWidth/2);
		//hexagonGroup.x = (900-Math.ceil(gridSizeX/2)*hexagonWidth-Math.floor(gridSizeX/2)*hexagonWidth/2)/2;
        hexagonGroup.x = (900-Math.ceil(gridSizeX/2)*hexagonWidth)/2;
          if(gridSizeX%2==0){
               hexagonGroup.x-=hexagonWidth/8;
          }
        //moveIndex = game.input.addMoveCallback(checkHex, this);   
        
        moveIndex = this.input.onDown.add(this.checkHex, this);
        //this.startTile = hexagonArray[0][0].frameName;
        this.floodQueue = [];
    },

    update: function () {

        if (this.floodQueue.length > 0)
		{
		     // console.log(this.floodQueue,this.floodQueue.length);	
            this.floodFillStepCount ++;
			this.tempStepCount = this.floodFillStepCount/3;
			while(this.tempStepCount>0 && this.floodQueue.length > 0)
			{
				this.tempStepCount--;
				this.floodFillStep();
			}
            hexagonGroup.sort('y', Phaser.Group.SORT_ASCENDING);
			/*bool win = testIfWon();
			if(win)
			{
			}*/
		}
        
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    //emanueleferonato
    checkHex:function(){
          var candidateX = Math.floor((this.input.worldX-hexagonGroup.x)/sectorWidth);
          var candidateY = Math.floor((this.input.worldY-hexagonGroup.y)/sectorHeight);
          var deltaX = (this.input.worldX-hexagonGroup.x)%sectorWidth;
          var deltaY = (this.input.worldY-hexagonGroup.y)%sectorHeight; 
        
          if(candidateY%2==0){
               if(deltaY<((hexagonHeight/4)-deltaX*gradient)){
                    candidateX--;
                    candidateY--;
               }
               if(deltaY<((-hexagonHeight/4)+deltaX*gradient)){
                    candidateY--;
               }
          }    
          else{
               if(deltaX>=hexagonWidth/2){
                    if(deltaY<(hexagonHeight/2-deltaX*gradient)){
                         candidateY--;
                    }
               }
               else{
                    if(deltaY<deltaX*gradient){
                         candidateY--;
                    }
                    else{
                         candidateX--;
                    }
               }
          }
        if(candidateX<0 || candidateY<0 || candidateY>=gridSizeY || candidateX>columns[candidateY%2]-1){
            return;
		}
        this.clickedHex(candidateX,candidateY);
        //var hex = hexagonArray[candidateX][candidateY];
        //hexagonArray[candidateX][candidateY] = null;
        //hex.kill();
     },
    //ati,atj - position in array
    //locx,locy - position in world
    addHex:function (ati,atj,tileName,locx,locy){
        var hexagon = this.add.sprite(locx,locy, "tiles", tileName); 
        hexagonGroup.add(hexagon);
        hexagonArray[ati][atj]=hexagon;
    },
    clickedHex:function (posX,posY){
        var markerX = posX*2+posY%2;
        var markerY = Math.floor(posY/2);
        //console.log(markerY,markerX,hexagonArray[0][0].frameName,hexagonArray[markerY][markerX].frameName);
        this.startTile = hexagonArray[0][0].frameName;
        this.SetUpFloodFill(0,0,this.startTile,hexagonArray[markerY][markerX].frameName);
    },
    SetUpFloodFill:function(x, y, target, replacement)
	{
        if(target==replacement)
        {
            console.log("same");
            return;
        }
        console.log("do flood ",target,replacement);
		this.floodQueue = [];
		this.floodQueue.push(new Point(x,y));
		this.target = target;
		this.replacement = replacement;
		this.floodFillStepCount = 0;
	},
    floodFillStep:function()
	{
		while(this.floodQueue.length > 0)
		{
			var n = this.floodQueue.shift();
            //console.log(n.x,n.y,gridSizeX);
			if(hexagonArray[n.x][n.y].frameName != this.target)
			{
				continue;
			}
			//remove old hex
            var oldx =  hexagonArray[n.x][n.y].x;   
            var oldy =  hexagonArray[n.x][n.y].y;   
            hexagonArray[n.x][n.y].destroy();
            //add new hex
            this.addHex(n.x,n.y,this.replacement,oldx,oldy);
            //do hex art?
			//add neighbors to floodQueue
			// left
            //console.log("test",n.y-2,0,n.y+2,gridSizeX);
			if(n.y-2>=0){
				this.addNeighbor(n.x,n.y-2);
			}
			// right
			if(n.y+2<gridSizeX){
				this.addNeighbor(n.x,n.y+2);
			}
			// up
			if(n.x-1+n.y%2>=0){
				// left
				if(n.y-1>=0){
					this.addNeighbor(n.x-1+n.y%2,n.y-1);
				}
				// right
				if(n.y+1<gridSizeX){
					this.addNeighbor(n.x-1+n.y%2,n.y+1);
				}
			}
			// down
			if(n.x+n.y%2<gridSizeY/2 && (gridSizeY%2==0 || n.x<Math.floor(gridSizeY/2))){
				// left
				if(n.y-1>=0){
					this.addNeighbor(n.x+n.y%2,n.y-1);
				}
				// right
				if(n.y+1<gridSizeX){
					this.addNeighbor(n.x+n.y%2,n.y+1);
				}
			} 
			return;
		}
	},
    addNeighbor:function(x,y)
	{
        if(x<0 || y<0 || x>=gridSizeY || y>=gridSizeX)
            return;
		else
		{
            console.log(x,y);
			if(hexagonArray[x][y]!=null)
			{
				this.floodQueue.push(new Point(x,y));
			}
		}
	}
};
//
function Point(x, y) {
  this.x = x;
  this.y = y;
}

var Tile = function () {
    this.tileType = 0;
};
Tile.prototype.update = function() {
  
};