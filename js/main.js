var game = new Phaser.Game("100", "100", Phaser.CANVAS, '', { preload: preload,
  create: create, update: update });
var platforms, player, cursors, firstaid, weapon, gameIsOver, fireButton;
var text, loseText, restartText, harpoonText, scoreText, finalScoreText;
var shark;
var playerHeight = 48;
var oxygen = 800;
var score = 0;
var numberOfPlatform = 20;
var offset = 900;
var YRange = [100, 130];
var XRange = [900, 1500];
var actualX = XRange[0];

var ennemies = [
  {
    image: "shark",
    scale:.38,
    direction: "left",
    quantity: 1,
    velocity: {
      x: -100,
      y: 0,
    },
    position: {
      x: function () {
        return 500;
      },
      y: function () {
        return game.world.height - 150;
      }
    },
  }
];


function preload() {
  // Afficher en plein écran
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // Chargement des images en mémoire
  game.load.image('water', 'assets/sky.png');
  game.load.image('ground', 'assets/platform2.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('diver', 'assets/diver.png', 256, 256, 10);
  game.load.image('firstaid', 'assets/bulle.png');
  game.load.image('harpoon', 'assets/harpoon.png');
  game.load.image('shark', 'assets/shark.svg');
  var harpoon = game.add.sprite(0, 0, "harpoon");
}

function create() {
  // Choix du moteur de jeu
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  // Arrière plan
  var bg = game.add.tileSprite(0, -300, 1920, 600, 'water');
  // On "scale" plus pour avoir un arrière plan plus large
  bg.scale.setTo(game.world.width / 400, game.world.height / 400);
  game.world.setBounds(0, 0, 9000, game.world.height);

  platforms = game.add.group();
  platforms.enableBody = true;

  platformGenerator().forEach(function (ledgePlatform) {
    var ledge = platforms.create(ledgePlatform.x, game.world.height - ledgePlatform.y, 'ground');
    if (ledgePlatform.immovable) ledge.body.immovable = true;
  });

  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;

  // Logique du joueur
  player = game.add.sprite(32, game.world.height - 150, 'diver');
  player.anchor.setTo(0.5, 0.5);
  player.scale.setTo(0.3, 0.3);
  game.physics.arcade.enable(player);
  game.camera.follow(player);
  player.body.bounce.y = .2;
  player.body.gravity.y = 70;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2 , 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  ennemies.forEach(function (ennemy) {
    for (var i = 0; i < ennemy.quantity; i++) {
      ennemySprite = game.add.sprite(ennemy.position.x(), ennemy.position.y(), ennemy.image);
      game.physics.arcade.enable(ennemySprite);
      ennemySprite.body.velocity.x = ennemy.velocity.x;
      ennemySprite.scale.setTo(ennemy.scale, ennemy.scale)
      ennemy.sprite = ennemySprite;
    }
  });

  // Police
  var inventoryStyle = { font: "30px OCR A Std", fill: "white" };
  var loseStyle = { font: "100px OCR A Std", fill: "white" };
  var restartStyle = { font: "32px OCR A Std", fill: "yellow"};
  var scoreStyle = { font: "35px OCR A Std", fill: "white"};
  var finalScoreStyle = { font: "45px OCR A Std", fill: "white"};

  cursors = game.input.keyboard.createCursorKeys();

  // Score
  scoreText = game.add.text (100, 100, " ", scoreStyle);
  scoreText.visible = true;
  scoreText.fixedToCamera = true;
  scoreText.cameraOffset.setTo(600, 30);

  // Compteur d'oxygène
  text = game.add.text (50, 50, " ", inventoryStyle);
  text.visible = true;
  text.fixedToCamera = true;
  text.cameraOffset.setTo(40,30);

  // Compteur de harpons
  // harpoonText = game.add.text (500, 500, " ", inventoryStyle);
  // harpoonText.visible = true;
  // harpoonText.fixedToCamera = true;
  // harpoonText.cameraOffset.setTo(40,60);

  // Texte de défaite
  loseText = game.add.text(800, 350,  " ", loseStyle);
  loseText.anchor.setTo(0.5, 0.5);
  loseText.visible = false;
  loseText.fixedToCamera = true;
  loseText.cameraOffset.setTo(300,200);

  // Score final
  finalScoreText = game.add.text(100, 100, " ", finalScoreStyle);
  finalScoreText.anchor.setTo(0.5, 0.5);
  finalScoreText.visible = false;
  finalScoreText.fixedToCamera = true;
  finalScoreText.cameraOffset.setTo(300,310);

  // Texte pour recommencer
  restartText = game.add.text(400, 150, " ", restartStyle);
  restartText.anchor.setTo(0.5,0.5);
  restartText.visible = false;
  restartText.fixedToCamera = true;
  restartText.cameraOffset.setTo(300, 360);

  // Premier soin
  firstaid = game.add.sprite(100, game.world.height -100, 'firstaid');
  game.physics.arcade.enable(firstaid);
  firstaid.scale.setTo (0.015, 0.015);

  // Harpon
  harpoon = game.add.weapon(5, 'harpoon');
  harpoon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
  harpoon.bulletAngleOffset = 135;
  harpoon.bulletSpeed = 400;
  harpoon.fireAngle = 360;
  harpoon.trackSprite(player, 50, 0, false);
  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
  harpoon.visible = true;
  harpoon.fireLimit = 5;
  harpoon.fireRate = 800;
}

function restart (){
  location.reload();
    /*oxygen = 250;
     score = 0;

     player = game.add.sprite(32, game.world.height - 150, 'diver');
     player.anchor.setTo(0.5, 0.5);
     player.scale.setTo(0.3, 0.3);
     harpoon.trackSprite(player, 80, 0, true);
     game.physics.arcade.enable(player);
     game.camera.follow(player);
     player.body.bounce.y = .2;
     player.body.gravity.y = 100;

     player.animations.add('left', [0, 1, 2 , 3], 10, true);
     player.animations.add('right', [5, 6, 7, 8], 10, true);

     firstaid = game.add.sprite(100, game.world.height -100, 'firstaid');
     game.physics.arcade.enable(firstaid);
     firstaid.scale.setTo (0.015, 0.015);

     loseText.visible = false;
     restartText.visible = false;
     finalScoreText.visible = false;
     text.visible = true;
     scoreText.visible = true;*/
}

function update() {
  text.setText(oxygen);
  scoreText.setText(score);

  game.physics.arcade.collide(player, firstaid, collisionHandler);
  game.physics.arcade.overlap(harpoon.bullets, ennemySprite, bulletEnnemy, null, this);

  function bulletEnnemy (ennemySprite, harpoon) {
    ennemySprite.kill();
    score = score + 100;
    console.log("Hit")
  }

  var hitPlatform = game.physics.arcade.collide(player, platforms);

  ennemies.forEach(function (ennemy) {
    game.physics.arcade.collide(player, ennemy.sprite, function () {
      if (ennemy.sprite.body.touching[ennemy.direction]) {
        ennemy.sprite.body.velocity.x = -100;
        endTheGame("Mangé.");
      }
    });
    game.physics.arcade.collide(platforms, ennemy.sprite);
  });

  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;

  if (cursors.left.isDown)
  {
    player.body.velocity.x = -150;
    player.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
    player.body.velocity.x = 150;
    player.animations.play('right');
  }
  else
  {
    player.animations.stop();
    player.frame = 4;
  }

  if (cursors.up.isDown && player.body.touching.down && hitPlatform)
  {
    player.body.velocity.y = -150;
  }

  if(cursors.left.isDown){
    player.scale.x = -0.3;
  }
  else if (cursors.right.isDown)
  {
    player.scale.x = 0.3  ;
  }


  if (cursors.left.isDown||cursors.right.isDown)
  {
    oxygen = oxygen-1;
  }

  if (fireButton.isDown)
  {
    harpoon.fire();
    harpoon.visible = true;
    //  if (harpoon.fire()||fireButton.isDown)
    //{
    //weapon = weapon-1;
    //}
  }

  if (weapon==-1)
  {
    harpoon = false;
    harpoon.kill();
  }

  if (cursors.right.isDown && !gameIsOver)
  {
    score = score+1;
  }

  text.setText("Oxygène : " + oxygen);
  scoreText.setText("Score : " + score);

  //  harpoonText.setText("harpoon : " + weapon);

  if (oxygen <= 0) {
    endTheGame("Mort asphyxié.");
  }

  if (player.position.y>=game.world.height + playerHeight) {
    endTheGame("Mort dans les abysses.");
  }

  // Regagner de la vie
  function collisionHandler (player, firstaid) {
    firstaid.kill();
    oxygen = oxygen + 200;
  }

}

function platformGenerator() {
  var platforms = [];
  for (var i = 0; i < numberOfPlatform; i++) {
    var y = croppedRandom(YRange[0], YRange[1]);
    var immovable = Math.random() < .5;
    if (!immovable) y += 100;
    platforms.push({
      x: actualX,
      y: y,
      immovable: immovable,
    });
    actualX += offset;

  }

  return platforms;
}

function croppedRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function endTheGame(message) {
  var defaultMessage = "PERDU";
  gameIsOver = true;
  player.kill();
  firstaid.kill();
  text.visible = false;
  scoreText.visible = false;
  loseText.text = message || defaultMessage;
  loseText.visible = true;
  finalScoreText.text = "Votre score : " + score;
  finalScoreText.visible = true;
  restartText.text = "Cliquez pour recommencer";
  restartText.visible = true;
  game.input.onTap.addOnce(restart,this);
}
