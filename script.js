const DEFAULT_GRAVITY = 'high';

var player;
var cheeses;
var cats;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var gravity = 500;

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 1080,
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
        create: createLevel1,
        update: update
    }
};

var game = new Phaser.Game(config);

// Level selection dropdown
document.getElementById('level-select').addEventListener('change', (event) => {
    switchLevel(event.target.value);
})

// Respawn button
document.getElementById('respawn').addEventListener('click', (event) => {
    gameOver = false;
    let currentLevel = document.getElementById('level-select').value;
    switchLevel(currentLevel);
    initializePlayerAttributes(player)
});

// Code editor inputs
document.getElementById('velocity-x').addEventListener('change', (event) => {
    player.velocityX = event.target.value;
});
document.getElementById('velocity-y').addEventListener('change', (event) => {
    player.velocityY = event.target.value;
});
document.getElementById('setgravity').addEventListener('click', (event) => {
    changeGravity(event.target.value);
});

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
}

function changeGravity(gravityvalue) {
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


function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('cheese', 'assets/cheese.png');
    this.load.spritesheet('mouse', 'assets/mouse.png', { frameWidth: 41.5, frameHeight: 24 });
    this.load.image('particle', 'assets/cheese_crumb.png');
    this.load.spritesheet('cat', 'assets/cat.png', { frameWidth: 47.9, frameHeight: 39 });
}

function createSky(realThis, width) {
    //  A simple background for our game
    sky = realThis.add.image(0, 0, 'sky').setOrigin(0, 0);
    sky.displayWidth = width;
    sky.displayHeight = game.config.height;
}

function initializePlayerAttributes(player) {
    player.velocityX = 180;
    player.velocityY = 430;
    changeGravity(DEFAULT_GRAVITY);

    document.getElementById('velocity-x').value = player.velocityX;
    document.getElementById('velocity-y').value = player.velocityY;
    document.getElementById('setgravity').value = DEFAULT_GRAVITY;
}

function createAnimations(realThis) {

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
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

    //  Input Events
    cursors = realThis.input.keyboard.createCursorKeys();
}

function createScoreAndCollisions(realThis) {
    scoreText = realThis.add.text(16, 16, 'Cheese: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setScrollFactor(0);

    realThis.physics.add.collider(player, platforms);
    realThis.physics.add.collider(cheeses, platforms);
    realThis.physics.add.collider(cats, platforms, patrolPlatform, null, realThis);
    realThis.physics.add.overlap(player, cheeses, collectCheese, null, realThis);
    realThis.physics.add.collider(player, cats, hitCat, null, realThis);
}

function createLevel1() {
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
    // The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);
    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)

    //  Now let's create some ledges
    platforms.create(1000, 450, 'ground');
    platforms.create(50, 200, 'ground');
    platforms.create(750, 620, 'ground');
    platforms.create(175, 500, 'ground');
    platforms.create(450, 350, 'ground');
    platforms.create(1250, 300, 'ground');

    //The player and its settings
    player = this.physics.add.sprite(100, 450, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
        setXY: { x: 40, y: 0, stepX: 120 }
    });
    cheeses.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    let xCoord = [0, 300, 800, 1000, 1280, 1250];
    let yCoord = [160, 300, 550, 400, 250, 660];
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5,

    });
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

function createLevel2() {
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");

    // The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)


    // TODO - PUT PLATFORMS HERE

    //The player and its settings
    player = this.physics.add.sprite(100, 450, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
        setXY: { x: 40, y: 0, stepX: 120 }
    });
    cheeses.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    let xCoord = [0, 300, 800, 1000, 1280, 1250];
    let yCoord = [160, 300, 550, 400, 250, 660];
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5,

    });
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

function createLevel3() {
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");

    // The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)

    // TODO - PUT PLATFORMS HERE

    //The player and its settings
    player = this.physics.add.sprite(100, 450, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
        setXY: { x: 40, y: 0, stepX: 120 }
    });
    cheeses.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    let xCoord = [0, 300, 800, 1000, 1280, 1250];
    let yCoord = [160, 300, 550, 400, 250, 660];
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5,

    });
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

function createLevel4() {
    createSky(this, 1280);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight, true, true, true, true);
    ground = this.add.tileSprite(0, 700, 4000, 50, "ground");

    // The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    platforms.add(ground);

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)

    // TODO - PUT PLATFORMS HERE

    //The player and its settings
    player = this.physics.add.sprite(100, 450, 'mouse').setSize(20, 18);
    initializePlayerAttributes(player);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
    createAnimations(this);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 10,
        setXY: { x: 40, y: 0, stepX: 120 }
    });
    cheeses.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    let xCoord = [0, 300, 800, 1000, 1280, 1250];
    let yCoord = [160, 300, 550, 400, 250, 660];
    cats = this.physics.add.group({
        key: 'cat',
        repeat: 5,

    });
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

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-1 * player.velocityX);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(1 * player.velocityX);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-1 * player.velocityY);
    }
    else if (cursors.down.isDown && player.body.touching.up) {
        player.setVelocityY(1 * player.velocityY);
    }
}

function collectCheese(player, cheese) {
    cheese.disableBody(true, true);

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
    if (cheeses.countActive(true) === 0) {
        // new pieces of cheese to collect
        cheeses.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        var x = (player.x < 640) ? Phaser.Math.Between(640, 1280) : Phaser.Math.Between(0, 640);
    }
}

function hitCat(player, cat) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

function patrolPlatform(cat, platform) {
    cat.setVelocityY(0);

    if (cat.body.velocity.x < 0 && cat.x < platform.x - (platform.width / 2) || cat.body.velocity.x > 0 && cat.x > platform.x + (platform.width / 2)) {
        cat.body.velocity.x *= -1;
    }

    if (cat.body.velocity.x > 0) {
        cat.anims.play('catRight', true);
    } else if (cat.body.velocity.x < 0) {
        cat.anims.play('catLeft', true);
    } else {
        cat.anims.play('catTurn');
    }
}
