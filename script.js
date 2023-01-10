var player;
var cheeses;
var cats;
var platforms;
var wall;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var victoryText;
var ground;
var sky;
var gravity = 500;
const MAX_LEVEL = 4;

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 960, //game window dimensions
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: createLevel1, // Starts game at level 1
        update: update
    }
};

var game = new Phaser.Game(config);

// Level selection dropdown
document.getElementById('level-select').addEventListener('change', (event) => {
    switchLevel(event.target.value);
});
// Respawn button
document.getElementById('respawn').addEventListener('click', (event) => {
    let currentLevel = document.getElementById('level-select').value;
    switchLevel(currentLevel);
});

document.getElementById('nextLevel').addEventListener('click', (event) => {
    let currentLevel = document.getElementById('level-select').value;
    currentLevel = parseInt(currentLevel);
    switchLevel('' + (currentLevel + 1));
});
//user inputed speed, jump, and gravity values from text box
document.getElementById('velocity-x').addEventListener('input', (event) => {
    player.velocityX = event.target.value;
});

document.getElementById('velocity-x').oninput  = function(){
    if (this.value > 800) {
        this.value = 800;
    }
    if (this.value < 0){
        this.value = 1;
    }
}

document.getElementById('velocity-y').addEventListener('input', (event) => {
    player.velocityY = event.target.value;
});
 
document.getElementById('velocity-y').oninput  = function(){
    if (this.value > 4000) {
        this.value = 4000;
    }
    if (this.value < 0){
        this.value = 1;
    }
}

document.getElementById('setgravity').addEventListener('input', (event) => {
    changeGravity(event.target.value);
});
// Selects and calls the createLevel functions based on drop down selection
function switchLevel(level) {
    game.destroy(true);
    switch (level) {
        case '1':
            config.scene.create = createLevel1;
            game = new Phaser.Game(config);
            break;
        case '2':
            config.scene.create = createLevel2;
            game = new Phaser.Game(config);
            break;
        case '3':
            config.scene.create = createLevel3;
            game = new Phaser.Game(config);
            break;
        case '4':
            config.scene.create = createLevel4;
            game = new Phaser.Game(config);
            break;
    }
    document.getElementById('nextLevel').disabled = true;
    score = 0;
    gameOver = false;
}

//Uses gravity drop down to change gravity level
function changeGravity(gravityvalue){
    switch (gravityvalue) {
        case 'high':
            player.setGravityY(0)
            break;
        case 'low':
            player.setGravityY(-200)
            break;
        case 'flipped':
            player.setGravityY(-1000)
            break;
    }
}

//loads in visuals
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('cheese', 'assets/cheese.png');
    this.load.image('wall', 'assets/cheese.png');
    this.load.spritesheet('mouse', 'assets/mouse.png', { frameWidth: 41.5, frameHeight: 24 });
    this.load.image('particle', 'assets/cheese_crumb.png');
    this.load.spritesheet('cat', 'assets/cat.png', { frameWidth: 47.9, frameHeight: 39 });
}

function createSky(realThis, width) {
    // A simple background for our game
    sky = realThis.add.image(0, 0, 'sky').setOrigin(0, 0);
    sky.displayWidth = width;
    sky.displayHeight = game.config.height;
}

// sets default speed, jump, gravity
function initializePlayerAttributes(player) {
    player.velocityX = 180;
    player.velocityY = 430;
    changeGravity('high');

    document.getElementById('velocity-x').value = player.velocityX;
    document.getElementById('velocity-y').value = player.velocityY;
    document.getElementById('setgravity').value = 'high';
}

function createAnimations(realThis) {
    // Player phsyics
    player.setCollideWorldBounds(true);

    // Player animations
    realThis.anims.create({
        key: 'left',
        frames: realThis.anims.generateFrameNumbers('mouse', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    realThis.anims.create({
        key: 'turn',
        frames: [{ key: 'mouse', frame: 4 }],
        frameRate: 20
    });

    realThis.anims.create({
        key: 'right',
        frames: realThis.anims.generateFrameNumbers('mouse', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    realThis.anims.create({
        key: 'catLeft',
        frames: realThis.anims.generateFrameNumbers('cat', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    realThis.anims.create({
        key: 'catTurn',
        frames: [{ key: 'cat', frame: 4 }],
        frameRate: 20
    });

    realThis.anims.create({
        key: 'catRight',
        frames: realThis.anims.generateFrameNumbers('cat', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Arrow key inputs
    cursors = realThis.input.keyboard.createCursorKeys();
}

function createScoreAndCollisions(realThis) {
    scoreText = realThis.add.text(16, 16, 'Cheese: 0', { fontSize: '32px', fill: '#FFF' });
    scoreText.setScrollFactor(0);

    // Player and cheese both collide with platforms
    realThis.physics.add.collider(player, platforms);
    realThis.physics.add.collider(cheeses, platforms);
    

    // Cats collide with platforms and the Fplayer
    realThis.physics.add.collider(cats, platforms, patrolPlatform, null, realThis);
    realThis.physics.add.collider(player, cats, hitCat, null, realThis);
    //realThis.physics.add.collider(cats, wall, patrolPlatform, null, realThis);

    // Player collects cheese
    realThis.physics.add.overlap(player, cheeses, collectCheese, null, realThis);
}

function createLevel1() { //puts in all platforms and sprites for level 1
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);

    // Platforms
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    //  Now let's create some ledges
    platforms.create(1000, 450, 'ground'); //these are all 6 platforms
    platforms.create(50, 200, 'ground');
    platforms.create(750, 620, 'ground');
    platforms.create(175, 500, 'ground');
    platforms.create(450, 350, 'ground');
    platforms.create(1250, 300, 'ground');
    // Set top of world platform 
    platforms.create(600, -63, 'ground').setScale(4).refreshBody();

    wall.create(400, 400, 'wall');

    //The player and its settings
    player = this.physics.add.sprite(100, 450, 'mouse').setSize(20, 18); //puts the mouse in the game
    initializePlayerAttributes(player);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);
  
    //  Some cheese to collect, all spaced out throughout the map
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
    });
    //cheese locations
    let cheeseX = [40, 140, 240, 340, 440, 550, 660, 750, 850, 950];
    let cheeseY = [160, 300, 300, 550, 550, 400, 300, 250, 660, 660];
    let j = 0;
    cheeses.children.iterate(function (child) {
        //  Give each cheese a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.allowGravity = false;
        child.setCollideWorldBounds(true);
        child.setPosition(cheeseX[j], cheeseY[j]);
        j++;
    });
  
    // Cats and properties
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5,
    });
    let xCoord = [0, 300, 800, 1000, 1280, 1250];
    let yCoord = [160, 300, 550, 400, 250, 660];
    var i = 0;
    cats.children.iterate(function (child) {
        child.setBounce(1);
        child.setCollideWorldBounds(true);
        var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
        child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
        child.allowGravity = false;
        child.anims.play('catTurn');
        child.setSize(0, 31);
        child.setPosition(xCoord[i], yCoord[i]);
        i++;
    });

    createScoreAndCollisions(this);
}

function createLevel2() { //puts in all platforms and sprites for level 2
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);

    // Platforms
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    // These are platforms for level 2
    platforms.create(600, 600, 'ground').setScale(.5, 7).refreshBody(); //middle block
    platforms.create(950, 350, 'ground').setScale(.60, 1).refreshBody(); //Sky platform
    platforms.create(125, 700, 'ground').setScale(.05, 5).refreshBody(); //Left wall
    platforms.create(1200, 650, 'ground').setScale(.5, 6).refreshBody(); //Right block
    // Set top of world platform 
    platforms.create(600, -63, 'ground').setScale(4).refreshBody();

    // Player and properties
    var playerX = 150;
    var playerY = 250;
    player = this.physics.add.sprite(50, 650, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player, playerX, playerY);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    //  Some cheese to collect, all spaced out throughout the map
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
    }); 
    //  Cheese locations
    let cheeseX = [40, 140, 240, 340, 440, 550, 660, 750, 850, 950];
    let cheeseY = [160, 300, 300, 550, 550, 400, 300, 250, 660, 660];
    let j = 0;
    //spawns in cheese
    cheeses.children.iterate(function (child) {
        //  Give each cheese a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.allowGravity = false;
        child.setCollideWorldBounds(true);
        child.setPosition(cheeseX[j], cheeseY[j]);
        j++;
    });

    // Cats and properties
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5, 
    });
    let xCoord = [200, 600, 800, 1000, 900, 1200];
    let yCoord = [650, 450, 650, 650, 300, 500];
    let i = 0;
    //spawns in cats
    cats.children.iterate(function (child) {
        child.setBounce(1);
        child.setCollideWorldBounds(true);
        var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
        child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
        child.allowGravity = false;
        child.anims.play('catTurn');
        child.setSize(0, 31);
        child.setPosition(xCoord[i], yCoord[i]);
        i++;
    });

    createScoreAndCollisions(this);
}

function createLevel3() { //puts in all platforms and sprites for level 3
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);

    // Platforms
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    //These are platforms for level 3
    platforms.create(200, 700, 'ground').setScale(.3, 5).refreshBody(); //Left wall
    platforms.create(800, 700, 'ground').setScale(.3, 5).refreshBody(); //Right wall
    platforms.create(400, 300, 'ground').setScale(.4, 3).refreshBody(); //sky block
    platforms.create(330, 150, 'ground').setScale(.05, 11).refreshBody(); //sky block hang thing
    platforms.create(900, 200, 'ground').setScale(.4, 3).refreshBody(); //sky block
    platforms.create(830, 100, 'ground').setScale(.05, 8).refreshBody(); //sky block right hang thing
    // Set top of world platform 
    platforms.create(600, -63, 'ground').setScale(4).refreshBody();

    // The player and its settings
    var playerX = 200;
    var playerY = 300;
    player = this.physics.add.sprite(50, 650, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player, playerX, playerY);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);


    //  Some cheese to collect, all spaced out throughout the map
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
    });

    //cheese locations
    let cheeseX = [40, 140, 240, 340, 440, 550, 660, 750, 850, 950];
    let cheeseY = [160, 300, 300, 550, 550, 400, 300, 250, 660, 660];
    let j = 0;
    cheeses.children.iterate(function (child) {
        //  Give each cheese a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.allowGravity = false;
        child.setCollideWorldBounds(true);
        child.setPosition(cheeseX[j], cheeseY[j]);
        j++;
    });

    // Cats and properties
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 4, // something fishy going on here, 5 pairs of coordinates but repeat set to 4?
    });
    let xCoord = [200, 800, 900, 1280, 400];
    let yCoord = [600, 550, 100, 650, 200];
    var i = 0;
    cats.children.iterate(function (child) {
        child.setBounce(1);
        child.setCollideWorldBounds(true);
        var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
        child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
        child.allowGravity = false;
        child.anims.play('catTurn');
        child.setSize(0, 31);
        child.setPosition(xCoord[i], yCoord[i]);
        i++;
    });

    createScoreAndCollisions(this);
}

function createLevel4() { //puts in all platforms and sprites for level 4
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);

    // Platforms
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    // row 1 platforms
    platforms.create(0, 100, 'ground');
    platforms.create(400, 130, 'ground');
    platforms.create(800, 160, 'ground');

    // row 2 platforms 
    platforms.create(1280, 280, 'ground');
    platforms.create(880, 310, 'ground');
    platforms.create(480, 340, 'ground');

    // row 3 platforms
    platforms.create(0, 460, 'ground');
    platforms.create(400, 490, 'ground');
    platforms.create(800, 520, 'ground');
  
    // top platforms
    platforms.create(1280, 675, 'ground').setScale(1,3).refreshBody();
    platforms.create(880, 685, 'ground').setScale(1,2).refreshBody();
  
    //The player and its settings
    player = this.physics.add.sprite(100, 650, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player);

    // Player and properties
    var playerX = 200;
    var playerY = 180;
    player = this.physics.add.sprite(50, 650, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player, playerX, playerY);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    // Cheeses and properties
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 18,
    });
    let cheeseX = [300, 500, 750, 900, 950, 1200, 100, 300, 500, 750, 950, 400, 550, 800, 900, 700, 500, 300, 50];
    let cheeseY = [600, 600, 600, 370, 600, 600, 370, 370, 370, 370, 200, 200, 200, 200, 50, 50, 50, 50, 50];
    let j = 0;
    cheeses.children.iterate(function (child) {
        // Give each cheese a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.allowGravity = false;
        child.setCollideWorldBounds(true);
        child.setPosition(cheeseX[j], cheeseY[j]);
        j++;
    });


    // Cats and properties
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 9,
    });
    let xCoord = [50, 350, 700, 800, 1200, 1200, 500, 100, 400, 800];
    let yCoord = [50, 75, 100, 450, 200, 600, 400, 350, 250, 250];
    var i = 0;
    cats.children.iterate(function (child) {
        child.setBounce(1);
        child.setCollideWorldBounds(true);
        var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
        child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
        child.allowGravity = false;
        child.anims.play('catTurn');
        child.setSize(0, 31);
        child.setPosition(xCoord[i], yCoord[i]);
        i++
    });

    createScoreAndCollisions(this);
}

// controls for mouse using arrow keys
function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) { //left
        player.setVelocityX(-1 * player.velocityX);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) { //right
        player.setVelocityX(1 * player.velocityX);

        player.anims.play('right', true);
    }
    else { //idle
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) { //jump only on floor
        player.setVelocityY(-1 * player.velocityY);
    }
    else if (cursors.down.isDown && player.body.touching.up) { //jump while gravity reversed, should we do up button?
        player.setVelocityY(1 * player.velocityY);
    }

}

// deals with cheese collection and score
function collectCheese(player, cheese) {
    cheese.disableBody(true, true);

    //  Add and update the score
    score += 1;
    scoreText.setText('Cheese: ' + score);

    var particle = this.add.particles('particle');
    var emitter = particle.createEmitter({
        x: cheese.x,
        y: cheese.y,
        quantity: 1,
        speed: 100,
        lifespan: 150,
        rotate: { random: true, start: 0, end: 180 },
        scale: { random: true, start: 0.75, end: 0.01 },
    });
    this.tweens.addCounter({
        duration: 200,
        onComplete: () => {
            emitter.stop()
            this.time.delayedCall(1000, () => { particle.removeEmitter(emitter) })
        }
    })

    if (cheeses.countActive(true) === 0) //if no more cheeses left, you win
    {
        victoryText = this.add.text(380, 160, 'You Win!', { fontSize: '70px', fill: '#FFF', align: 'center',});
        victoryText.setScrollFactor(0);
        this.physics.pause();
        player.anims.play('turn');
        gameOver = true;
        let currentLevel = document.getElementById('level-select').value;
        currentLevel = parseInt(currentLevel);
        if (currentLevel < MAX_LEVEL) {
            document.getElementById('nextLevel').disabled = false;
        }
    }
}

function hitCat(player, cat) { // If you're bad and you hit a cat, you lose and have to start level over
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function patrolPlatform(cat, platform) { // cat patroling platform logic

    cat.setVelocityY(0);

    //if the cat sprite reaches the end of the platform, change directions
    if (cat.body.velocity.x < 0 && cat.x < platform.x - (platform.width / 2) || cat.body.velocity.x > 0 && cat.x > platform.x + (platform.width / 2)) {
        cat.body.velocity.x *= -1;
    }

    if (cat.body.velocity.x > 0) { //changes cat sprite based on direction it is moving
        cat.anims.play('catRight', true);
    } else if (cat.body.velocity.x < 0) {
        cat.anims.play('catLeft', true);
    } else {
        cat.anims.play('catTurn');
    }
}
