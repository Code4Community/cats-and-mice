var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var cheeses;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('cheese', 'assets/cheese.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('mouse', 'assets/mouse.png', { frameWidth: 41.5, frameHeight: 24 });
    this.load.image('particle', 'assets/cheese_crumb.png');
}
function create ()
{
    //  A simple background for our game
    this.add.image(640, 360, 'sky').setScale(1.75);
    // The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(600, 760, 'ground').setScale(4).refreshBody();

    //  Now let's create some ledges
    platforms.create(1000, 450, 'ground');
    platforms.create(50, 200, 'ground');
    platforms.create(750, 620, 'ground');
    platforms.create(175, 500, 'ground');
    platforms.create(450, 350, 'ground');
    platforms.create(1250, 300, 'ground');
   
    //The player and its settings
    player = this.physics.add.sprite(100, 650, 'mouse');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('mouse', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'mouse', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('mouse', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    cheeses = this.physics.add.group({
        key: 'cheese',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    cheeses.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'Cheese: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(cheeses, platforms);
    // this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.collider(bombs, platforms, patrolPlatform, null, this);

    this.physics.add.overlap(player, cheeses, collectCheese, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function update ()
{
    if (gameOver)
    {   
        alert("GAME OVER");
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-430);
    }

    
}


// function update1 (){
//     while(!gameOver){
//     if (cursors.left.isDown)
//     {
//         player.setVelocityX(-160);

//         player.anims.play('left', true);
//     }
//     else if (cursors.right.isDown)
//     {
//         player.setVelocityX(160);

//         player.anims.play('right', true);
//     }
//     else
//     {
//         player.setVelocityX(0);

//         player.anims.play('turn');
//     }
    
//     if (cursors.up.isDown && player.body.touching.down)
//         {
           
//             player.setVelocityY(-330);
//         }
//     }
//     alert("GAME OVER");
// }

function collectCheese (player, cheese)
{
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
            this.time.delayedCall(1000, () => {particle.removeEmitter(emitter)})
        }
    })
    if (cheeses.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        cheeses.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(400, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function patrolPlatform(bomb, platform)
{
    bomb.setVelocityY(0);

    if (bomb.body.velocity.x < 0 && bomb.x < platform.x - (platform.width/2) || bomb.body.velocity.x > 0 && bomb.x > platform.x + (platform.width/2))
    {
        bomb.body.velocity.x *= -1;
    }
}
