var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function WorldScene ()
    {
        Phaser.Scene.call(this, { key: 'WorldScene' });
        var enemy;
        var enemyWayTilesCollection; 
        var theEnemyWayLayerDataArray ;
        var posX;
        var posY; 
        var lastSelectedXY;
        var playersLife;
        var lifes;
        var hearts;
        var numberOfWaitsToUpdate;
        var target;
        //var renderTexture;
        //var brush;
    },


    preload: function ()
    {
         // _________MAP___________
         //map tiles
        this.preloadAllTilesAndMap();
         // _________________________
         // _________player_____
         // load spritesheet of character
         this.load.spritesheet('player', 'assets/CHARACTER.png', { frameWidth: 16, frameHeight: 16 });
         //______________________
        //_______objectsToCollect__________
        this.load.image('objectsToCollect', 'assets/PAPER.png');

        this.load.image('heart', 'assets/herz.png');

        //_______________________Enemy________________-
        this.load.spritesheet('enemy', 'assets/CHARACTER.png', { frameWidth: 16, frameHeight: 16 });



        this.load.image('darkBackground', 'assets/darkBackground.png');
        this.load.image('brush', 'assets/brush.png');


    },

    preloadAllTilesAndMap: function(){
        this.load.image('smallItemsTiles', 'assets/map/TopDownHouse_SmallItems.png');
        this.load.image('furnitureState2Tiles', 'assets/map/TopDownHouse_FurnitureState2.png');
        this.load.image('furnitureState1Tiles', 'assets/map/TopDownHouse_FurnitureState1.png');
        this.load.image('floorsAndWallsTiles', 'assets/map/TopDownHouse_FloorsAndWalls.png');
        this.load.image('doorsAndWindowsTiles', 'assets/map/TopDownHouse_DoorsAndWindows.png');    
        // map in json format
       this.load.tilemapTiledJSON('map', 'assets/map/libaryMap.json');
    },

    create: function ()
    {
        // create the map
        var map = this.make.tilemap({ key: 'map' });
      
       //mapTileset --> name in json file
       //tiles image key from preload
        var floorsAndWallsTiles = map.addTilesetImage('TopDownHouse_FloorsAndWalls', 'floorsAndWallsTiles',16,16);
        var furnitureState1Tiles = map.addTilesetImage('TopDownHouse_FurnitureState1', 'furnitureState1Tiles',16,16);
        var furnitureState2Tiles = map.addTilesetImage('TopDownHouse_FurnitureState2', 'furnitureState2Tiles',16,16);
        var smallItemsTiles = map.addTilesetImage('TopDownHouse_SmallItems','smallItemsTiles');
        var enemyWayTiles = map.addTilesetImage('TopDownHouse_DoorsAndWindows','doorsAndWindowsTiles',16,16);
       
       /// creating the layers       
        var ground = map.createStaticLayer('FloorAndWalls', floorsAndWallsTiles, 0, 0);
        var furniture1 = map.createStaticLayer('Furniture1', furnitureState1Tiles, 0,0);
        var furniture11 = map.createStaticLayer('Furniture1.1', furnitureState1Tiles, 0,0);
        var furniture2 = map.createStaticLayer('Furniture2', furnitureState2Tiles, 0,0);
        var smallItems = map.createStaticLayer('Smallitems', smallItemsTiles, 0,0);
        var enemyWay = map.createStaticLayer('TilesForEnemy',enemyWayTiles,0,0);

        // make all tiles in obstacles collidable
        furniture1.setCollisionByExclusion([-1]);
        furniture11.setCollisionByExclusion([-1]);
        furniture2.setCollisionByExclusion([-1]);

       this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {frames: [2, 8, 2, 9]}),
            frameRate: 10,
            repeat: -1
       });

        // animation with key 'right'
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
    
        //create player sprite(x, y, key, frame number)
        this.player = this.physics.add.sprite(100, 50, 'player', 6);
        this.player.setScale(2);
        playersLife = 100;

        // don't go out of the map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        //collide with trees
        this.physics.add.collider(this.player, furniture1);
        this.physics.add.collider(this.player, furniture2);

        //camera movement
        //camera bounds
        this.cameras.main.setBounds(0,0,map.widthInPixels, map.heightInPixels);
        //follow player
        this.cameras.main.startFollow(this.player);
        // avoid tile bleed
        this.cameras.main.roundPixels = true; 


        //keyboard input 
        this.cursors = this.input.keyboard.createCursorKeys();

        //__________ObjectsToCollect___________

        var objectsToCollect = this.physics.add.group({
            key: 'objectsToCollect', 
            repeat: 9,
        });
        objectsToCollect.children.entries.forEach(eachObjectToCollect => {
            var positionOfObjectsTOCollect = getRandomPositionWithoutCollidingWithTile();
            eachObjectToCollect.setPosition(positionOfObjectsTOCollect[0], positionOfObjectsTOCollect[1]);
            eachObjectToCollect.setOrigin(0,0);
        }); 

       this.physics.add.overlap(this.player, objectsToCollect, collectObject, null, this);
       
       //object to collect under the furniture
       furniture1.setDepth(1);
       furniture2.setDepth(1);
       this.player.setDepth(1);
       
       function getRandomPositionWithoutCollidingWithTile(){
           do{ 
            var x = parseInt(Math.random() * 30);
            var y = parseInt(Math.random() * 30);
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
                || furniture2.getTileAt(x-1,y-1)!= null )
           x*=16;
           y*=16;
           return [x,y];
       }

       function collectObject(player, overlappingObjectsToCollect){
        //Parameter are objects which overlap
            overlappingObjectsToCollect.disableBody(true, true);

            if(objectsToCollect.countActive(true) === 0){
                //Game Winning Scene
                this.scene.launch('YouWonScene');
                this.scene.pause();
            }else{
                this.scene.launch('GotNoteScene');
                this.scene.pause();
            }
            
        }

       //___________________ENEMY__________________
       numberOfWaitsToUpdate = 20;

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
        //this.physics.add.overlap(this.player, enemy, enemyGotYou, null, this);

        theEnemyWayLayerDataArray =  enemyWay.layer.data;
    
        lastSelectedXY = [-1,-1];
       // lifes = 3;
        var playerIsImmune = false;
        function enemyGotYou(player, enemy){
            if(!playerIsImmune){
                enemy.body.setVelocity(0);
                //funktioniert nicht weil in update direkt wieder umestellt
                player.body.setVelocityX(160);
                this.player.setTint(0xf54e42);

                console.log(lifes[lifes.length -1]);
                lifes[lifes.length -1].destroy();
                lifes.pop();
                console.log(lifes.length);
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

       /* const brush = this.make.sprite({key:'brush', add: false}).setScale(16);

        var cover = this.add.image(0,0,'darkBackground');
        cover.setDepth(1);

        const rt = this.make.renderTexture({x: 0, y: 0, width: 2000, height: 2000, add: false}).setOrigin(0.0);
        cover.mask = new Phaser.Display.Masks.BitmapMask(this, rt);
        cover.mask.invertAlpha = true;

        this.input.on('pointermove', function (event) {
            if (event.isDown)
            {
                rt.draw(brush, event.x, event.y);
            }
        }, this);*/

       /* hearts = this.physics.add.group({
            key: 'heart', 
            repeat: 2,
            setXY: {x: 0, y:0, stepX: 16},
        });
        hearts.children.entries.forEach(eachHeart => {
            eachHeart.setDepth(1);
            eachHeart.setOrigin(0,0);
            eachHeart.setScrollFactor(0,0);
        }); */
        
        lifes = []
        for(i=0; i<3; i++){
            let eachHeart = this.add.image(i*16, 0, 'heart');
            eachHeart.setDepth(1);
            eachHeart.setOrigin(0,0);
            eachHeart.setScrollFactor(0,0);
            lifes.push(eachHeart);
        }
        
    },

    update: function (time, delta)
    {            
            this.player.body.setVelocity(0);
            
            // Horizontal movement
            if (this.cursors.left.isDown)
            {
                this.player.body.setVelocityX(-160);
            }
            else if (this.cursors.right.isDown)
            {
                this.player.body.setVelocityX(160);
            }
            // Vertical movement
            if (this.cursors.up.isDown)
            {
                this.player.body.setVelocityY(-160);
            }
            else if (this.cursors.down.isDown)
            {
                this.player.body.setVelocityY(160);
            }        

            // Update the animation last and give left/right animations precedence over up/down animations
            if (this.cursors.left.isDown)
            {
                this.player.anims.play('left', true);
                this.player.flipX = true;
            }
            else if (this.cursors.right.isDown)
            {
                this.player.anims.play('right', true);
                this.player.flipX = false;
            }
            else if (this.cursors.up.isDown)
            {
                this.player.anims.play('up', true);
            }
            else if (this.cursors.down.isDown)
            {
                this.player.anims.play('down', true);
            }
            else
            {
                this.player.anims.stop();
            }
            if(Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)<= 80){
                this.physics.moveToObject(enemy, this.player, 100);
            }
            else{
              //  enemy.body.reset(enemy.x, enemy.y);
                this.enemyMovement(enemy);           
            }
            if(playersLife <= 0){
                this.scene.launch('GameOverScene');
                this.scene.pause();
            }

    },

    enemyFollowPlayer: function(enemy){
        this.physics.moveToObject(enemy, this.player);
    },

    enemyMovement: function(enemy){
                const tolerance = 4;        
               
                target  = new Phaser.Math.Vector2();
                target.x= posX*16;
                target.y= posY*16;
                

                console.log('Enemy X: ', Math.round(enemy.x) , ' Enemy Y: ', Math.round(enemy.y));
                console.log('Pos X: ', posX , ' Pos Y: ', posY);
                console.log(posX*16 <=Math.round(enemy.x) &&Math.round(enemy.x) <= posX*16+32  &&Math.round(enemy.y) >= posY*16 &&Math.round(enemy.y) <= posY*16+32);
                console.log(theEnemyWayLayerDataArray);



                if(posX*16 <=Math.round(enemy.x) &&Math.round(enemy.x) <= posX*16+32  &&Math.round(enemy.y) >= posY*16 &&Math.round(enemy.y) <= posY*16+32){
                    if( theEnemyWayLayerDataArray[posY].length -1 > posX + 1  && theEnemyWayLayerDataArray[posY][posX+1].index == 61 && !(lastSelectedXY[1] == posY && lastSelectedXY[0] == posX +1 )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('rightEnemy',true);
                        enemy.flipX = false;
                        posX +=1;
                        console.log('right');
                    }
                    else if(theEnemyWayLayerDataArray.length -1 > posY + 1  && theEnemyWayLayerDataArray[posY+1][posX].index == 61 && !(lastSelectedXY[1] == posY +1 && lastSelectedXY[0] == posX )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('downEnemy',true);
                        posY +=1;
                        console.log('down');
                    }
                    else if(0 <= posX - 1  && theEnemyWayLayerDataArray[posY][posX-1].index == 61 && !(lastSelectedXY[1] == posY  && lastSelectedXY[0] == posX -1)){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('leftEnemy',true);
                        enemy.flipX = true;
                        posX -=1;
                        console.log('left');
                    }
                    else if(0 <= posY - 1  && theEnemyWayLayerDataArray[posY-1][posX].index == 61 && !(lastSelectedXY[1] == posY -1 && lastSelectedXY[0] == posX )){
                        lastSelectedXY = [posX, posY];
                        enemy.anims.play('upEnemy',true);
                        posY -=1;
                        console.log('up');
                    }
                    console.log('Target:', target);
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


var YouWonScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function YouWonScene ()
    {
        Phaser.Scene.call(this, { key: 'YouWonScene' });
    },

    preload: function ()
    {
     this.load.image('collectedObjectsImage', 'assets/Nico/POPUP BACKGROUND.png')   
    },

    create: function ()
    {      
        this.cursors = this.input.keyboard.createCursorKeys();
       // this.add.image(0,0, 'collectedObjectsImage')         
    },

    
    update: function (time, delta)
    {
        if(this.cursors.down.isDown){
            this.scene.resume('WorldScene');
            this.scene.stop();
        }
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
     this.load.image('collectedObjectsImage', 'assets/Nico/POPUP BACKGROUND.png')   
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

var OptionsScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function OptionsScene ()
    {
        Phaser.Scene.call(this, { key: 'OptionsScene' });
    },

    preload: function ()
    {
     this.load.image('collectedObjectsImage', 'assets/Nico/POPUP BACKGROUND.png')   
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
gameDimensions.width = 600;//windowWidth;//300;//window.screen.width;
gameDimensions.height = 500;//windowHeight; // 300;//window.screen.height;

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
    width: windowWidth,//gameDimensions.width,
    height: windowHeight,//gameDimensions.height,
    zoom: 1,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
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