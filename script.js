var player;
var cheeses;
var cats;
var platforms;
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
  parent: "game",
  width: 960, //game window dimensions
  height: 720,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: gravity },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: createLevel1, // Starts game at level 1
    update: update,
  },
};

var game = new Phaser.Game(config);

// Level selection dropdown
document.getElementById("level-select").addEventListener("change", (event) => {
  switchLevel(event.target.value);
});

// Respawn button
document.getElementById("respawn").addEventListener("click", (event) => {
  let currentLevel = document.getElementById("level-select").value;
  switchLevel(currentLevel);
});

document.getElementById("nextLevel").addEventListener("click", (event) => {
  let currentLevel = document.getElementById("level-select").value;
  currentLevel = parseInt(currentLevel);
  switchLevel("" + (currentLevel + 1));
});
//user inputed speed, jump, and gravity values from text box
document.getElementById("velocity-x").addEventListener("input", (event) => {
  player.velocityX = event.target.value;
});

document.getElementById("velocity-x").oninput = function () {
  if (this.value > 800) {
    this.value = 800;
  }
  if (this.value < 0) {
    this.value = 1;
  }
};

document.getElementById("velocity-y").addEventListener("input", (event) => {
  player.velocityY = event.target.value;
});

document.getElementById("velocity-y").oninput = function () {
  if (this.value > 4000) {
    this.value = 4000;
  }
  if (this.value < 0) {
    this.value = 1;
  }
};

document.getElementById("setgravity").addEventListener("input", (event) => {
  changeGravity(event.target.value);
});
// Selects and calls the createLevel functions based on drop down selection
function switchLevel(level) {
  game.destroy(true);
  switch (level) {
    case "1":
      config.scene.create = createLevel1;
      game = new Phaser.Game(config);
      break;
    case "2":
      config.scene.create = createLevel2;
      game = new Phaser.Game(config);
      break;
    case "3":
      config.scene.create = createLevel3;
      game = new Phaser.Game(config);
      break;
    case "4":
      config.scene.create = createLevel4;
      game = new Phaser.Game(config);
      break;
  }
  document.getElementById("nextLevel").disabled = true;
  score = 0;
  gameOver = false;
}

//Uses gravity drop down to change gravity level
function changeGravity(gravityvalue) {
  switch (gravityvalue) {
    case "high":
      player.setGravityY(0);
      break;
    case "low":
      player.setGravityY(-200);
      break;
    case "flipped":
      player.setGravityY(-1000);
      break;
  }
}

//loads in visuals
function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("cheese", "assets/cheese.png");
  this.load.spritesheet("mouse", "assets/mouse.png", {
    frameWidth: 41.5,
    frameHeight: 24,
  });
  this.load.image("particle", "assets/cheese_crumb.png");
  this.load.spritesheet("cat", "assets/cat.png", {
    frameWidth: 47.9,
    frameHeight: 39,
  });
}

function createSky(realThis, width) {
  // A simple background for our game
  sky = realThis.add.image(0, 0, "sky").setOrigin(0, 0);
  sky.displayWidth = width;
  sky.displayHeight = game.config.height;
}

// sets default speed, jump, gravity
function initializePlayerAttributes(player, xVel, yVel) {
  player.velocityX = xVel;
  player.velocityY = yVel;
  changeGravity("high");

  document.getElementById("velocity-x").value = player.velocityX;
  document.getElementById("velocity-y").value = player.velocityY;
  document.getElementById("setgravity").value = "high";
}

function createAnimations(realThis) {
  // Player phsyics
  player.setCollideWorldBounds(true);

  // Player animations
  realThis.anims.create({
    key: "left",
    frames: realThis.anims.generateFrameNumbers("mouse", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  realThis.anims.create({
    key: "turn",
    frames: [{ key: "mouse", frame: 4 }],
    frameRate: 20,
  });

  realThis.anims.create({
    key: "right",
    frames: realThis.anims.generateFrameNumbers("mouse", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  realThis.anims.create({
    key: "catLeft",
    frames: realThis.anims.generateFrameNumbers("cat", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  realThis.anims.create({
    key: "catTurn",
    frames: [{ key: "cat", frame: 4 }],
    frameRate: 20,
  });

  realThis.anims.create({
    key: "catRight",
    frames: realThis.anims.generateFrameNumbers("cat", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // Arrow key inputs
  cursors = realThis.input.keyboard.createCursorKeys();
}

function createScoreAndCollisions(realThis) {
  scoreText = realThis.add.text(16, 16, "Cheese: 0", {
    fontSize: "32px",
    fill: "#FFF",
  });
  scoreText.setScrollFactor(0);

  // Player and cheese both collide with platforms
  realThis.physics.add.collider(player, platforms);
  realThis.physics.add.collider(cheeses, platforms);

  // Cats collide with platforms and the Fplayer
  realThis.physics.add.collider(
    cats,
    platforms,
    patrolPlatform,
    null,
    realThis
  );
  realThis.physics.add.collider(player, cats, hitCat, null, realThis);

  // Player collects cheese
  realThis.physics.add.overlap(player, cheeses, collectCheese, null, realThis);
}

function createLevel1() {
  createSky(this, 1280);
  this.physics.world.setBounds(
    0,
    0,
    sky.displayWidth,
    sky.displayHeight,
    true,
    true,
    true,
    true
  );

  // Platforms
  ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
  platforms = this.physics.add.staticGroup();
  platforms.add(ground);
  platforms.create(1000, 450, "ground");
  platforms.create(50, 200, "ground");
  platforms.create(750, 620, "ground");
  platforms.create(175, 500, "ground");
  platforms.create(450, 350, "ground");
  platforms.create(1250, 300, "ground");
  // Set top of world platform
  platforms.create(600, -63, "ground").setScale(4).refreshBody();

  // Player and properties
  var playerX = 200;
  var playerY = 450;
  player = this.physics.add.sprite(100, 450, "mouse").setSize(20, 18);
  initializePlayerAttributes(player, playerX, playerY);
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
  createAnimations(this);

  // Cheeses and properties
  cheeses = this.physics.add.group({
    key: "cheese",
    repeat: 14,
  });
  let cheeseX = [
    60,
    160,
    60,
    250,
    300,
    300,
    450,
    600,
    650,
    800,
    650,
    800,
    900,
    1100,
    1150,
  ];
  let cheeseY = [
    60,
    60,
    600,
    600,
    160,
    400,
    160,
    160,
    500,
    500,
    660,
    660,
    400,
    400,
    160,
  ];
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
    key: "cat",
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
    child.anims.play("catTurn");
    child.setSize(0, 31);
    child.setPosition(xCoord[i], yCoord[i]);
    i++;
  });

  createScoreAndCollisions(this);
}

function createLevel2() {
  createSky(this, 1280);
  this.physics.world.setBounds(
    0,
    0,
    sky.displayWidth,
    sky.displayHeight,
    true,
    true,
    true,
    true
  );

  // Platforms
  ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
  platforms = this.physics.add.staticGroup();
  platforms.add(ground);

  platForm1 = this.add.tileSprite(600, 600, 360, 16, "ground"); //middle block
  platForm2 = this.add.tileSprite(950, 350, 400, 16, "ground"); //Sky platform
  platForm3 = this.add.tileSprite(1200, 600, 360, 16, "ground"); //Left wall
  //platForm4 = this.add.tileSprite(900, 700, 400, 16, "ground"); //Right block
  platforms.add(platForm1);
  platforms.add(platForm2);
  platforms.add(platForm3);
  //platforms.add(platForm4);

  // platforms.create(600, 600, 'ground').setScale(.5, 7).refreshBody(); //middle block
  // platforms.create(950, 350, 'ground').setScale(.60, 1).refreshBody(); //Sky platform
  // platforms.create(125, 700, 'ground').setScale(.05, 5).refreshBody(); //Left wall
  // platforms.create(1200, 650, 'ground').setScale(.5, 6).refreshBody(); //Right block
  // Set top of world platform
  platforms.create(600, -63, "ground").setScale(4).refreshBody();

  // Player and properties
  var playerX = 150;
  var playerY = 250;
  player = this.physics.add.sprite(50, 650, "mouse").setSize(20, 18);
  initializePlayerAttributes(player, playerX, playerY);
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
  createAnimations(this);

  // Cheese and properties
  cheeses = this.physics.add.group({
    key: "cheese",
    repeat: 10,
  });
  let cheeseX = [240, 340, 440, 550, 660, 750, 870, 1000, 870, 1000, 1200];
  let cheeseY = [550, 550, 550, 400, 400, 660, 660, 660, 200, 200, 500];
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
    key: "cat",
    repeat: 5,
  });
  let xCoord = [200, 600, 800, 1000, 900, 1200];
  let yCoord = [650, 450, 650, 650, 300, 500];
  let i = 0;
  cats.children.iterate(function (child) {
    child.setBounce(1);
    child.setCollideWorldBounds(true);
    var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
    child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
    child.allowGravity = false;
    child.anims.play("catTurn");
    child.setSize(0, 31);
    child.setPosition(xCoord[i], yCoord[i]);
    i++;
  });

  createScoreAndCollisions(this);
}

function createLevel3() {
  createSky(this, 1280);
  this.physics.world.setBounds(
    0,
    0,
    sky.displayWidth,
    sky.displayHeight,
    true,
    true,
    true,
    true
  );

  // Platforms
  platforms = this.physics.add.staticGroup();
  ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
  platforms.add(ground);

  let skyBlock1 = this.add.tileSprite(400, 300, 200, 96, "ground");
  platforms.add(skyBlock1);

  let leftWall = this.add.tileSprite(200, 600, 150, 80, "ground");
  platforms.add(leftWall);

  let rightWall = this.add.tileSprite(800, 600, 150, 80, "ground");
  platforms.add(rightWall);

  let skyBlock2 = this.add.tileSprite(900, 200, 200, 96, "ground");
  platforms.add(skyBlock2);

  platforms.create(330, 150, "ground").setScale(0.05, 11).refreshBody(); //sky block hang thing
  platforms.create(830, 100, "ground").setScale(0.05, 8).refreshBody(); //sky block right hang thing
  // Set top of world platform
  platforms.create(600, -63, "ground").setScale(4).refreshBody();

  // The player and its settings
  var playerX = 200;
  var playerY = 300;
  player = this.physics.add.sprite(50, 650, "mouse").setSize(20, 18);
  initializePlayerAttributes(player, playerX, playerY);
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
  createAnimations(this);

  // Cheeses and properties
  cheeses = this.physics.add.group({
    key: "cheese",
    repeat: 7,
  });
  let cheeseX = [200, 400, 400, 600, 800, 900, 950, 1100];
  let cheeseY = [500, 150, 500, 500, 500, 100, 660, 660];
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
    key: "cat",
    repeat: 5, // something fishy going on here, 5 pairs of coordinates but repeat set to 4?
  });
  let xCoord = [200, 800, 900, 400, 1200, 500];
  let yCoord = [500, 500, 100, 200, 200, 600];
  var i = 0;
  cats.children.iterate(function (child) {
    child.setBounce(1);
    child.setCollideWorldBounds(true);
    var multiplier = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;
    child.setVelocity(Phaser.Math.Between(50, 100) * multiplier, 20);
    child.allowGravity = false;
    child.anims.play("catTurn");
    child.setSize(0, 31);
    child.setPosition(xCoord[i], yCoord[i]);
    i++;
  });

  createScoreAndCollisions(this);
}

function createLevel4() {
  createSky(this, 1280);
  this.physics.world.setBounds(
    0,
    0,
    sky.displayWidth,
    sky.displayHeight,
    true,
    true,
    true,
    true
  );

  // Platforms
  ground = this.add.tileSprite(0, 700, 4000, 50, "ground");
  platforms = this.physics.add.staticGroup();
  platforms.add(ground);

  // row 1 platforms
  platForm11 = this.add.tileSprite(0, 100, 360, 16, "ground");
  platForm12 = this.add.tileSprite(420, 130, 400, 16, "ground");
  platForm13 = this.add.tileSprite(860, 160, 400, 16, "ground");
  // row 2 platforms
  platForm21 = this.add.tileSprite(1300, 280, 360, 16, "ground");
  platForm22 = this.add.tileSprite(880, 310, 400, 16, "ground");
  platForm23 = this.add.tileSprite(440, 340, 400, 16, "ground");
  //row 3 platforms
  platForm31 = this.add.tileSprite(0, 460, 360, 16, "ground");
  platForm32 = this.add.tileSprite(425, 500, 400, 16, "ground");
  platForm33 = this.add.tileSprite(840, 550, 400, 16, "ground");

  platforms.add(platForm11);
  platforms.add(platForm12);
  platforms.add(platForm13);
  platforms.add(platForm21);
  platforms.add(platForm22);
  platforms.add(platForm23);
  platforms.add(platForm31);
  platforms.add(platForm32);
  platforms.add(platForm33);
  // Set top of world platform
  platforms.create(600, -63, "ground").setScale(4).refreshBody();

  // Player and properties
  var playerX = 200;
  var playerY = 180;
  player = this.physics.add.sprite(50, 650, "mouse").setSize(20, 18);
  initializePlayerAttributes(player, playerX, playerY);
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);
  createAnimations(this);

  // Cheeses and properties
  cheeses = this.physics.add.group({
    key: "cheese",
    repeat: 18,
  });
  let cheeseX = [
    300,
    500,
    750,
    900,
    950,
    1200,
    100,
    300,
    500,
    750,
    950,
    400,
    550,
    800,
    900,
    700,
    500,
    300,
    50,
  ];
  let cheeseY = [
    600,
    600,
    600,
    370,
    600,
    600,
    370,
    370,
    370,
    370,
    200,
    200,
    200,
    200,
    50,
    50,
    50,
    50,
    50,
  ];
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
    key: "cat",
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
    child.anims.play("catTurn");
    child.setSize(0, 31);
    child.setPosition(xCoord[i], yCoord[i]);
    i++;
  });

  createScoreAndCollisions(this);
}

// controls for mouse using arrow keys
function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    //left
    player.setVelocityX(-1 * player.velocityX);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    //right
    player.setVelocityX(1 * player.velocityX);

    player.anims.play("right", true);
  } else {
    //idle
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    //jump only on floor
    player.setVelocityY(-1 * player.velocityY);
  } else if (cursors.down.isDown && player.body.touching.up) {
    //jump while gravity reversed, should we do up button?
    player.setVelocityY(1 * player.velocityY);
  }
}

// deals with cheese collection and score
function collectCheese(player, cheese) {
  cheese.disableBody(true, true);

  //  Add and update the score
  score += 1;
  scoreText.setText("Cheese: " + score);

  var particle = this.add.particles("particle");
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
      emitter.stop();
      this.time.delayedCall(1000, () => {
        particle.removeEmitter(emitter);
      });
    },
  });
  if (cheeses.countActive(true) === 0) {
    //if no more cheeses left, you win
    victoryText = this.add.text(330, 160, "You Win!", {
      fontSize: "70px",
      fill: "#FFF",
      align: "center",
    });
    victoryText.setScrollFactor(0);
    this.physics.pause();
    player.anims.play("turn");
    gameOver = true;
    let currentLevel = document.getElementById("level-select").value;
    currentLevel = parseInt(currentLevel);
    if (currentLevel < MAX_LEVEL) {
      document.getElementById("nextLevel").disabled = false;
    }
  }
}

function hitCat(player, cat) {
  // If you're bad and you hit a cat, you lose and have to start level over
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}

function patrolPlatform(cat, platform) {
  cat.setVelocityY(0);

  // console.log("velocity " + cat.body.velocity.x);
  // console.log("cat " + cat.x);
  // console.log("x " + platform.x);
  // console.log("width " + platform.width);

  let buffer = 110;
  //if the cat sprite reaches the end of the platform, change directions
  if (
    (cat.body.velocity.x < 0 && cat.x < platform.x - platform.width / 2) ||
    (cat.body.velocity.x > 0 && cat.x > platform.x + platform.width / 2)
  ) {
    cat.body.velocity.x *= -1;
  }

  if (cat.body.velocity.x > 0) {
    //changes cat sprite based on direction it is moving
    cat.anims.play("catRight", true);
  } else if (cat.body.velocity.x < 0) {
    cat.anims.play("catLeft", true);
  } else {
    cat.anims.play("catTurn");
  }
}
