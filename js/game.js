var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function WorldScene ()
    {
        Phaser.Scene.call(this, { key: 'WorldScene' });

        //____________Variables for map__________
        var map;
        var floorsAndWallsTiles;
        var furnitureState1Tiles;
        var furnitureState2Tiles;
        var smallItemsTiles;
        var enemyWayTiles;
       
       /// Layer
        var ground;
        var furniture1;
        var furniture11;
        var furniture2;
        var smallItems;
        var enemyWay;
        //____________________

        var enemy;
        var enemyWayTilesCollection; 
        var theEnemyWayLayerDataArray ;
        var posX;
        var posY; 
        var lastSelectedXY;
        var lifes;
        var hearts;
        var target;
        var objectsToCollect;
        var gotNoteSceneAlreadyStarted;
        //____Keys__________
        var keyA;
        var keyS;
        var keyD;
        var keyW;
    },


    preload: function ()
    {
  
        this.preloadAllTilesAndMap();
   
        this.load.spritesheet('player', 'assets/CHARACTER.png', { frameWidth: 16, frameHeight: 16 });
        
        this.load.image('objectsToCollect', 'assets/PAPER.png');

        this.load.image('heart', 'assets/herz.png');

        this.load.spritesheet('enemy', 'assets/CHARACTER.png', { frameWidth: 16, frameHeight: 16 });
    },

    create: function ()
    {
        this.initializeMap();
        this.initializePlayerCharacter();
        this.initializeCameraMovement();
        this.initializeObjectsToCollect();
        this.initializeEnemy();
        this.initializeHearts();
        this.initializeKeys();
        this.cursors = this.input.keyboard.createCursorKeys();
        gotNoteSceneAlreadyStarted = false;
    },

    update: function (time, delta)
    {            
            this.updatePlayerCharacter();
            this.updateEnemy();
    },


    preloadAllTilesAndMap: function(){
        this.load.image('smallItemsTiles', 'assets/map/TopDownHouse_SmallItems.png');
        this.load.image('furnitureState2Tiles', 'assets/map/TopDownHouse_FurnitureState2.png');
        this.load.image('furnitureState1Tiles', 'assets/map/TopDownHouse_FurnitureState1.png');
        this.load.image('floorsAndWallsTiles', 'assets/map/TopDownHouse_FloorsAndWalls.png');
        this.load.image('doorsAndWindowsTiles', 'assets/map/TopDownHouse_DoorsAndWindows.png');    
        this.load.tilemapTiledJSON('map', 'assets/map/libaryMap.json');
    },

    initializeMap: function(){
         // create the map
        map = this.make.tilemap({ key: 'map' });
      
         //mapTileset --> name in json file
         //tiles image key from preload
        floorsAndWallsTiles = map.addTilesetImage('TopDownHouse_FloorsAndWalls', 'floorsAndWallsTiles',16,16);
        furnitureState1Tiles = map.addTilesetImage('TopDownHouse_FurnitureState1', 'furnitureState1Tiles',16,16);
        furnitureState2Tiles = map.addTilesetImage('TopDownHouse_FurnitureState2', 'furnitureState2Tiles',16,16);
        smallItemsTiles = map.addTilesetImage('TopDownHouse_SmallItems','smallItemsTiles');
        enemyWayTiles = map.addTilesetImage('TopDownHouse_DoorsAndWindows','doorsAndWindowsTiles',16,16);
         
         /// creating the layers       
        ground = map.createStaticLayer('FloorAndWalls', floorsAndWallsTiles, 0, 0);
        furniture1 = map.createStaticLayer('Furniture1', furnitureState1Tiles, 0,0);
        furniture11 = map.createStaticLayer('Furniture1.1', furnitureState1Tiles, 0,0);
        furniture2 = map.createStaticLayer('Furniture2', furnitureState2Tiles, 0,0);
        smallItems = map.createStaticLayer('Smallitems', smallItemsTiles, 0,0);
        enemyWay = map.createStaticLayer('TilesForEnemy',enemyWayTiles,0,0);
  
        furniture1.setCollisionByExclusion([-1]);
        furniture11.setCollisionByExclusion([-1]);
        furniture2.setCollisionByExclusion([-1]);

        furniture1.setDepth(1);
        furniture2.setDepth(1);
        furniture11.setDepth(1);
        smallItems.setDepth(1);
    },

    initializeAnimationsForPlayer: function(){
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {frames: [2, 8, 2, 9]}),
            frameRate: 10,
            repeat: -1
       });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {frames: [2, 8, 2, 9]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 6, 1,7]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [0,4,0,5 ] }),
            frameRate: 10,
            repeat: -1
        });
    },

    initializePlayerCharacter: function(){
        this.player = this.physics.add.sprite(500, 500, 'player', 6);
        this.player.setScale(2);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, furniture1);
        this.physics.add.collider(this.player, furniture2);
        this.player.setDepth(1);
        this.initializeAnimationsForPlayer();
    },

    initializeCameraMovement: function(){
        this.cameras.main.setBounds(0,0,map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; 
    },

    initializeObjectsToCollect: function(){
         //__________ObjectsToCollect___________

         objectsToCollect = this.physics.add.group({
            key: 'objectsToCollect', 
            repeat: 9,
        });
        objectsToCollect.children.entries.forEach(eachObjectToCollect => {
            var positionOfObjectsTOCollect = this.getRandomPositionWithoutCollidingWithTile();
            eachObjectToCollect.setPosition(positionOfObjectsTOCollect[0], positionOfObjectsTOCollect[1]);
            eachObjectToCollect.setOrigin(0,0);
        }); 

       this.physics.add.overlap(this.player, objectsToCollect, collectObject, null, this);
       
       function collectObject(player, overlappingObjectsToCollect){
            overlappingObjectsToCollect.disableBody(true, true);
            if(!gotNoteSceneAlreadyStarted){
                //fixes freezing when simultaniously collecting to notes, but last note has no scene
                this.scene.launch('GotNoteScene');
            }
            gotNoteSceneAlreadyStarted = true;
            this.scene.pause();
        }
    },

    getRandomPositionWithoutCollidingWithTile: function(){
        
        do{ 
         var x = parseInt(Math.random() * 120);
         var y = parseInt(Math.random() * 120);
        }
        while(furniture1.getTileAt(x,y)!= null 
             || furniture1.getTileAt(x-1,y)!= null 
             || furniture1.getTileAt(x+1,y)!= null 
             || furniture1.getTileAt(x,y+1)!= null 
             || furniture1.getTileAt(x,y-1)!= null 
             || furniture1.getTileAt(x+1,y+1)!= null
             || furniture1.getTileAt(x-1,y-1)!= null
             || furniture2.getTileAt(x,y)!= null 
             || furniture2.getTileAt(x-1,y)!= null 
             || furniture2.getTileAt(x+1,y)!= null 
             || furniture2.getTileAt(x,y+1)!= null 
             || furniture2.getTileAt(x,y-1)!= null 
             || furniture2.getTileAt(x+1,y+1)!= null
             || furniture2.getTileAt(x-1,y-1)!= null
             || furniture11.getTileAt(x,y)!= null 
             || furniture11.getTileAt(x-1,y)!= null 
             || furniture11.getTileAt(x+1,y)!= null 
             || furniture11.getTileAt(x,y+1)!= null 
             || furniture11.getTileAt(x,y-1)!= null 
             || furniture11.getTileAt(x+1,y+1)!= null
             || furniture11.getTileAt(x-1,y-1)!= null )
        x*=16;
        y*=16;
        return [x,y];
    },

    initializeEnemy: function(){
        //___________________ENEMY__________________
       enemyWayTilesCollection = [];
       enemyWay.layer.data.forEach(eachRow => {
           eachRow.forEach(eachTile => {
               if(eachTile.index == 61){
                   enemyWayTilesCollection.push(eachTile);
               }
           })
       });
       posX = enemyWayTilesCollection[0].x;
       posY = enemyWayTilesCollection[0].y;
       enemy = this.physics.add.sprite(enemyWayTilesCollection[0].x*16, enemyWayTilesCollection[0].y*16, 'enemy', 6);
       enemy.setScale(2);
       enemy.setDepth(1);
       this.physics.add.overlap(this.player, enemy, enemyGotYou, null, this);

       theEnemyWayLayerDataArray =  enemyWay.layer.data;
   
       lastSelectedXY = [-1,-1];
       var playerIsImmune = false;
       function enemyGotYou(player, enemy){
           if(!playerIsImmune){
               this.player.setTint(0xf54e42);

               console.log(lifes[lifes.length -1]);
               lifes[lifes.length -1].destroy();
               lifes.pop();
               if(lifes.length == 0){
                   this.scene.launch('GameOverScene');
                   this.scene.pause();
               }
               playerIsImmune = true;
               this.time.delayedCall(500, function(player) {
                   playerIsImmune = false;
                   player.setTint(0xffffff);
               }, [this.player]);
           }                
       }
       this.initializeAnimationsForEnemy();
    },

    initializeAnimationsForEnemy: function(){
        this.anims.create({
            key: 'leftEnemy',
            frames: this.anims.generateFrameNumbers('enemy', {frames: [12, 18, 12, 19]}),
            frameRate: 10,
            repeat: -1
       });

        // animation with key 'right'
        this.anims.create({
            key: 'rightEnemy',
            frames: this.anims.generateFrameNumbers('enemy', {frames: [12, 18, 12, 19]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'upEnemy',
            frames: this.anims.generateFrameNumbers('enemy', { frames: [11, 16, 11,17]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'downEnemy',
            frames: this.anims.generateFrameNumbers('enemy', { frames: [10,14,10,15 ] }),
            frameRate: 10,
            repeat: -1
        });
    },

    initializeHearts: function(){
        lifes = []
        for(i=0; i<3; i++){
            let eachHeart = this.add.image(i*40, 0, 'heart');
            eachHeart.setDepth(1);
            eachHeart.setOrigin(0,0);
            eachHeart.setScrollFactor(0,0);
            eachHeart.setScale(2);
            lifes.push(eachHeart);
        }
    },

    initializeKeys: function(){
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    },

    updatePlayerCharacter: function(){
        this.player.body.setVelocity(0);
            
        // Horizontal movement
        if (this.cursors.left.isDown || keyA.isDown)
        {
            this.player.body.setVelocityX(-160);
        }
        else if (this.cursors.right.isDown || keyD.isDown)
        {
            this.player.body.setVelocityX(160);
        }
        // Vertical movement
        if (this.cursors.up.isDown ||keyW.isDown)
        {
            this.player.body.setVelocityY(-160);
        }
        else if (this.cursors.down.isDown || keyS.isDown)
        {
            this.player.body.setVelocityY(160);
        }        

        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown || keyA.isDown)
        {
            this.player.anims.play('left', true);
            this.player.flipX = true;
        }
        else if (this.cursors.right.isDown || keyD.isDown)
        {
            this.player.anims.play('right', true);
            this.player.flipX = false;
        }
        else if (this.cursors.up.isDown || keyW.isDown)
        {
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown || keyS.isDown)
        {
            this.player.anims.play('down', true);
        }
        else
        {
            this.player.anims.stop();
        }
    },

    updateEnemy: function(){
        if(Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)<= 80){
            this.physics.moveToObject(enemy, this.player, 100);
        }
        else{
            this.enemyMovement(enemy);           
        }
    },

    enemyMovement: function(enemy){               
                target  = new Phaser.Math.Vector2();
                target.x= posX*16;
                target.y= posY*16;
                
                if(posX*16 <=Math.round(enemy.x) &&Math.round(enemy.x) <= posX*16+32  &&Math.round(enemy.y) >= posY*16 &&Math.round(enemy.y) <= posY*16+32){
                    if( theEnemyWayLayerDataArray[posY].length -1 > posX + 1  && theEnemyWayLayerDataArray[posY][posX+1].index == 61 && !(lastSelectedXY[1] == posY && lastSelectedXY[0] == posX +1 )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('rightEnemy',true);
                        enemy.flipX = false;
                        posX +=1;
                    }
                    else if(theEnemyWayLayerDataArray.length -1 > posY + 1  && theEnemyWayLayerDataArray[posY+1][posX].index == 61 && !(lastSelectedXY[1] == posY +1 && lastSelectedXY[0] == posX )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('downEnemy',true);
                        posY +=1;
                    }
                    else if(0 <= posX - 1  && theEnemyWayLayerDataArray[posY][posX-1].index == 61 && !(lastSelectedXY[1] == posY  && lastSelectedXY[0] == posX -1)){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('leftEnemy',true);
                        enemy.flipX = true;
                        posX -=1;
                    }
                    else if(0 <= posY - 1  && theEnemyWayLayerDataArray[posY-1][posX].index == 61 && !(lastSelectedXY[1] == posY -1 && lastSelectedXY[0] == posX )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('upEnemy',true);
                        posY -=1;
                    }
                    if (enemy.body.speed > 0 && Phaser.Math.Distance.Between(enemy.x, enemy.y, posX*16, posY*16) < 10)
                    {    
                        enemy.body.reset(target.x, target.y);
                    }
                }
                this.physics.moveToObject(enemy, target, 100);               
    }
});


var GotNoteScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GotNoteScene ()
    {
        Phaser.Scene.call(this, { key: 'GotNoteScene' });
    },

    preload: function ()
    {
     this.load.image('collectedObjectsImage', 'assets/POPUP BACKGROUND.png');
     this.load.image('schnippselImage', 'assets/Plakatschnippsel/Plakatschnipsel_18.jpg')
    },

    create: function ()
    {      
        this.cursors = this.input.keyboard.createCursorKeys();
    
        var canvasWidth = this.sys.game.config.width;
        var canvasHeight = this.sys.game.config.height;

       
        var image = this.add.image(canvasWidth / 2, canvasHeight / 2, 'collectedObjectsImage');

        this.add.text(canvasWidth / 2, canvasHeight / 2.5, 'Du hast eine Notiz gefunden!', {fontSize: '32px', fill: '#ffffff'}).setOrigin(0.5,0.5);
        

       // Add a button below the text
        var showNoteButton = this.add.text(canvasWidth / 2, canvasHeight / 2 + 50, 'Notiz anzeigen', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00ff00', // You can set the button background color
            padding: {
                x: 20, // Increase the horizontal padding
                y: 15  // Increase the vertical padding
            }
        }).setOrigin(0.5, 0.5);

        // Make the button interactive
        showNoteButton.setInteractive();

        // Set up a callback for the button click event
        showNoteButton.on('pointerup', function () {
            this.add.image(canvasWidth / 2, canvasHeight / 2, 'schnippselImage');
        }, this);


        var exitButton = this.add.text(canvasWidth - 20, 20, 'Exit', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00ff00', // Set the button background color
            padding: {
                x: 20, // Increase the horizontal padding
                y: 15  // Increase the vertical padding
            }
        }).setOrigin(1, 0); // Set origin to top right
        
        // Make the exit button interactive
        exitButton.setInteractive();
        
        // Set up a callback for the exit button click event
        exitButton.on('pointerup', function () {
            gotNoteSceneAlreadyStarted = false;
            this.scene.stop();
            this.scene.resume('WorldScene');
            if(objectsToCollect.countActive(true) === 0){
                this.scene.launch('YouWonScene');
                this.scene.pause();
            }

        }, this);


    },
    
    update: function (time, delta)
    {
    }
});


var YouWonScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function YouWonScene ()
    {
        Phaser.Scene.call(this, { key: 'YouWonScene' });
    },

    preload: function ()
    {
     this.load.image('winImage', 'assets/POPUP WIN.png')   
    },

    create: function ()
    {      
        this.cursors = this.input.keyboard.createCursorKeys();
        var canvasWidth = this.sys.game.config.width;
        var canvasHeight = this.sys.game.config.height;
        var image = this.add.image(canvasWidth / 2, canvasHeight / 2, 'winImage');       
    },

    
    update: function (time, delta)
    {
    }
});


var GameOverScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameOverScene ()
    {
        Phaser.Scene.call(this, { key: 'GameOverScene' });
    },

    preload: function ()
    {
     this.load.image('loseImage', 'assets/POPUP GAME OVER.png')   
    },

    create: function ()
    {      
        this.cursors = this.input.keyboard.createCursorKeys();
        var canvasWidth = this.sys.game.config.width;
        var canvasHeight = this.sys.game.config.height;
        var image = this.add.image(canvasWidth / 2, canvasHeight / 2, 'loseImage');     
    },

    
    update: function (time, delta)
    {
    }
});

var OptionsScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function OptionsScene ()
    {
        Phaser.Scene.call(this, { key: 'OptionsScene' });
    },

    preload: function ()
    {
     this.load.image('collectedObjectsImage', 'assets/POPUP BACKGROUND.png')   
    },

    create: function ()
    {      
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.image(0,0, 'collectedObjectsImage')         
    },

    
    update: function (time, delta)
    {
        if(this.cursors.down.isDown){
            this.scene.resume('WorldScene');
            this.scene.stop();
        }
    }
});
var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var gameDimensions = {width: 0, height: 0};
gameDimensions.width = 600;
gameDimensions.height = 500;

if(windowWidth < gameDimensions.width){
    gameDimensions.width = windowWidth;
}
if(windowHeight < gameDimensions.height){
    gameDimensions.height = windowHeight;
}

console.log(gameDimensions)

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: windowWidth,
    height: windowHeight,
    zoom: 1,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false 
        }
    },
    scene: [
        WorldScene,
        GameOverScene,
        GotNoteScene,
        YouWonScene,
        OptionsScene
    ]
};

var game = new Phaser.Game(config);