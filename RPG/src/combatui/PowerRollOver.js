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
    this.x = x;
    this.y = y - 140;
    this.name.text = power.weaponname;
    this.dmg.text = "Damage: " + power.dmg;
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
	Phaser.Group.call(this, game, parent);
}
EnemyTargetRollOver.prototype = Object.create(Phaser.Group.prototype);
EnemyTargetRollOver.constructor = EnemyTargetRollOver;
EnemyTargetRollOver.prototype.setButton = function(){
}
    
    