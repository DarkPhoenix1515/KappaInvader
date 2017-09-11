function spaceShooter() {
  var camera, backgroundCamera, gameScene, menuScene, deathScene, menuButton, renderer, light, pointLight, menu = true,
    dead = false;
  var jsonFile = "data/data.JSON",
    laserImg = "resources/laser2.png",
    menuBackgroundImg = "resources/FractalPhoenix.jpg",
    gameBackgroundImg = "resources/space.jpg",
    deathBackgroundImg = "resources/backgroundDeath.jpg",
    kappaImg = "resources/kappa.png",
    bibleImg = "resources/biblethump.png",
    projectileImg = "resources/projectile.png",
    projectileEnemyImg = "resources/projectileEnemy.png",
    deadImg = "resources/skullRed.png";
  var projector, mouse = {
      x: 0,
      y: 0
    },
    mouseDown = false,
    mouseSensivity = 6;
  canShoot = 0, spawnEnemies = 0, highscore = 0, score = 0, lives = 3;
  var menuBackgroundTexture, gameBackgroundTexture, deathBackgroundTexture, ship, enemyShip, corpse, projectile, laser, enemyProjectile, projectiles = [],
    lasers = [],
    enemyShips = [],
    enemyProjectiles = [],
    materials = [],
    corpses = [],
    gameObjects = [],
    lights = [];
  var loadingManager, keyboard, highscoreDiv, scoreDiv, livesDiv, laserDiv, jsonData, oldTime = performance.now();
  var screenSize = window.innerWidth / 9,
    screenOffset = window.innerWidth / 18;
  var spawnOrder = 0,
    fireLaser = false,
    canLaser = false,
    laserCooldown = 100,
    laserOn = 0,
    laserClone;

  init();

  function init() {
    highscoreDiv = document.getElementById("highscoreDiv");
    scoreDiv = document.getElementById("scoreDiv");
    livesDiv = document.getElementById("livesDiv");
    laserDiv = document.getElementById("laserDiv");
    livesDiv.style.display = 'none';
    laserDiv.style.display = 'none';

    if (localStorage.getItem("highscore") === undefined || localStorage.getItem("highscore") === null) {
      highscore = 0;
      localStorage.setItem("highscore", highscore);
    } else {
      highscore = localStorage.getItem("highscore");
    }

    $("#menu").click(function() {
      menuButtonAction();
    });

    createMenu();
  }

  function createMenu() {
    scoreDiv.style.display = 'block';
    $("#backgroundImg").attr("src", menuBackgroundImg);
    menuButton = document.getElementById("menuButton");
    menuButton.innerHTML = "Start";
    highscoreDiv.innerHTML = "Highscore: " + highscore;
    scoreDiv.innerHTML = "Previous score: " + score;
  }

  function startGame() {
    scoreDiv.style.display = 'block';
    livesDiv.style.display = 'block';
    laserDiv.style.display = 'block';
    $("#backgroundImg").attr("src", gameBackgroundImg);

    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('myCanvas'),
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    keyboard = new KeyboardState();

    loadingManager = new THREE.LoadingManager();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.rotation._y = 0;

    window.addEventListener('resize', onWindowResize, false);
    projector = new THREE.Projector();
    canShoot = 0;
    mouseDown = false;
    dead = false;
    mouse = {
      x: 0,
      y: 0
    };
    score = 0;
    lives = 5;
    projectiles = [];
    enemyProjectiles = [];
    enemyShips = [];
    lasers = [];
    spawnOrder = 0;

    loadResources();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);

    light = new THREE.AmbientLight(0xffffff, 0.8);
    lights.push(light);
    pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(-6, -5, 10);
    lights.push(pointLight);

    gameScene = new THREE.Scene();
    gameScene.add(light);
    gameScene.add(pointLight);
  }

  function loadResources() {
    var textureLoader = new THREE.TextureLoader(loadingManager);
    var shipGeometry = new THREE.BoxGeometry(10, 10, 10);
    var corpseGeometry = new THREE.BoxGeometry(10, 10, 1);
    var projectileGeometry = new THREE.BoxGeometry(5, 12, 5);
    var laserGeometry = new THREE.BoxGeometry(30, 120, 1);
    var corpseGeometryMaterial = new THREE.BoxGeometry(10, 10, 10);
    var imageArray = [];

    imageArray['bibleImg'] = bibleImg;
    imageArray['kappaImg'] = kappaImg;
    imageArray['projectileImg'] = projectileImg;
    imageArray['projectileEnemyImg'] = projectileEnemyImg;
    imageArray['laserImg'] = laserImg;
    imageArray['deadImg'] = deadImg;

    var promise = new Promise(function(resolve, reject) {
      var texArray = [];
      texArray[0] = textureLoader.load(imageArray['bibleImg']);
      texArray[1] = textureLoader.load(imageArray['kappaImg']);
      texArray[2] = textureLoader.load(imageArray['projectileImg']);
      texArray[3] = textureLoader.load(imageArray['projectileEnemyImg']);
      texArray[4] = textureLoader.load(imageArray['laserImg']);
      texArray[5] = textureLoader.load(imageArray['deadImg']);
      resolve(texArray);
    });

    promise.then(function(textures) {
      var bibleMats = [],
        kappaMats = [],
        projectileMats = [],
        projectileEnemyMats = [],
        laserMats = [],
        deadMats = [];

      for (var i = 0; i < 6; i++) {
        bibleMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[0]
        });
        kappaMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[1]
        });
        projectileMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[2]
        });
        projectileEnemyMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[3]
        });
        laserMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[4]
        });
        deadMats[i] = new THREE.MeshPhongMaterial({
          color: "white",
          map: textures[5]
        });

        bibleMats[i].alphaTest = 0.5;
        kappaMats[i].alphaTest = 0.5;
        projectileMats[i].alphaTest = 0.5;
        projectileEnemyMats[i].alphaTest = 0.5;
        laserMats[i].alphaTest = 0.5;
        deadMats[i].alphaTest = 0.5;
      }
      materials['bibleMats'] = bibleMats;
      materials['kappaMats'] = kappaMats;
      materials['projectileMats'] = projectileMats;
      materials['projectileEnemyMats'] = projectileEnemyMats;
      materials['laserMats'] = laserMats;
      materials['deadMats'] = deadMats;

      ship = new THREE.Mesh(shipGeometry, new THREE.MeshFaceMaterial(materials['bibleMats']));
      enemyShip = new THREE.Mesh(shipGeometry, new THREE.MeshFaceMaterial(materials['kappaMats']));
      projectile = new THREE.Mesh(projectileGeometry, new THREE.MeshFaceMaterial(materials['projectileMats']));
      projectileEnemy = new THREE.Mesh(projectileGeometry, new THREE.MeshFaceMaterial(materials['projectileEnemyMats']));
      laser = new THREE.Mesh(laserGeometry, new THREE.MeshFaceMaterial(materials['laserMats']));
      corpse = new THREE.Mesh(corpseGeometry, new THREE.MeshFaceMaterial(materials['deadMats']));

      gameScene.add(ship);
      gameScene.add(enemyShip);

      laser.name = "laser";
      ship.receiveShadow = true;
      objectSetUp();
    }).catch(function(e) {
      alert(e.message);
    });
  }

  function objectSetUp() {
    ship.rotSpeed = 0.01;
    ship.name = "PlayerShip";

    projectile.velocity = new THREE.Vector3(0, 2, 0);
    projectile.rotSpeed = 0.2

    projectileEnemy.velocity = new THREE.Vector3(0, -2, 0);
    projectileEnemy.rotSpeed = -0.2

    enemyShip.position.y = 80;
    enemyShip.position.z = 0;
    enemyShip.velocity = new THREE.Vector3(0, -0.5, 0);
    enemyShip.rotSpeed = -0.1;
    enemyShip.name = "EnemyShip";
  }

  function createProjectile(isAlly, position) {
    if (isAlly) {
      var p = projectile.clone();
      p.position.set(
        position.x,
        position.y + 10,
        position.z
      );
      p.velocity = projectile.velocity;
      p.rotSpeed = projectile.rotSpeed;
      return p;
    } else {
      var p = projectileEnemy.clone();
      p.position.set(
        position.x,
        position.y - 10,
        position.z
      );
      p.velocity = projectileEnemy.velocity;
      p.rotSpeed = projectileEnemy.rotSpeed;
      return p;
    }
  }

  function enemySpawner() {
    var e = enemyShip.clone();
    e.position.x = Math.floor(((Math.random() * screenSize) + 1) - screenOffset);
    e.velocity = enemyShip.velocity;
    e.rotSpeed = enemyShip.rotSpeed;
    return e;
  }

  function onDocumentMouseMove(event) {
    event.preventDefault();
    var x = (event.clientX - (window.innerWidth / 2)) / mouseSensivity;
    var y = (-event.clientY + (window.innerHeight / 2)) / mouseSensivity;
    ship.position.set(x, y, 0);
  }

  function mouseDown() {
    console.log("down");
  }

  function mouseUp() {
    if (canLaser) {
      fireLaser = true;
    } else {
      fireLaser = false;
    }
  }

  function menuButtonAction() {
    if (dead)
      dead = !dead;

    menu = !menu;

    if (menu) {
      menuButton.innerHTML = "Start";
      scoreDiv.innerHTML = "Previous score: " + score;
      livesDiv.innerHTML = "";
      laserDiv.style.display = 'none';
      $("#backgroundImg").attr("src", menuBackgroundImg);
      disposeAllGameObjects();
      document.removeEventListener('mousemove', onDocumentMouseMove, false);
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mouseup", mouseUp);
      createMenu();
    } else {
      menuButton.innerHTML = "Menu";
      startGame();
    }
  }

  function endGame() {
    dead = true;
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener("mousedown", mouseDown);
    document.removeEventListener("mouseup", mouseUp);
    disposeAllGameObjects();
    $("#backgroundImg").attr("src", deathBackgroundImg);

    if (score > highscore) {
      localStorage.setItem("highscore", score);
      highscore = score;
    }

    scoreDiv.style.display = 'none';
    livesDiv.style.display = 'none';
    laserDiv.style.display = 'none';
    menuButton = document.getElementById("menuButton");
    menuButton.innerHTML = "Menu";
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function checkShipCollision() {
    var originPoint = ship.position.clone();

    for (var vertexIndex = 0; vertexIndex < ship.geometry.vertices.length; vertexIndex++) {
      var localVertex = ship.geometry.vertices[vertexIndex].clone();
      var globalVertex = localVertex.applyMatrix4(ship.matrix);
      var directionVector = globalVertex.sub(ship.position);

      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var collisionResults = ray.intersectObjects(enemyShips);

      if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() && collisionResults[0].object !== 'undefined' && collisionResults[0].object.alive) {
        if (collisionResults[0].object.name == 'EnemyShip') {
          var smashedShip = collisionResults[0].object;
          smashedShip.alive = false;
          var index = enemyShips.findIndex(x => x.uuid == smashedShip.uuid);
          disposeObject(smashedShip);
          enemyShips.splice(index, 1);
          lives -= 1;
          break;
        }
      }
    }
  }

  function shoot() {
    var proj = createProjectile(true, ship.position);
    proj.alive = true;

    setTimeout(function() {
      proj.alive = false;
    }, 2000);
    projectiles.push(proj);
    gameScene.add(proj);
    canShoot = 8;
  }

  function disposeObject(obj) {
    gameScene.remove(obj);
    renderer.dispose(obj.geometry);
    renderer.dispose(obj.material);
    renderer.dispose(obj);
    obj = undefined;
  }

  function disposeAllGameObjects() {
    if (ship !== undefined) {
      gameScene.remove(ship);
      renderer.dispose(ship.geometry);
      renderer.dispose(ship.material);
      renderer.dispose(ship);
      ship = undefined;
    }

    for (var i = 0; i < enemyShips.length; i++) {
      if (enemyShips[i] !== undefined) {
        gameScene.remove(enemyShips[i]);
        renderer.dispose(enemyShips[i].geometry);
        renderer.dispose(enemyShips[i].material);
        renderer.dispose(enemyShips[i]);
        enemyShips[i] = undefined;
      }
    }
    enemyShips = [];

    for (var i = 0; i < projectiles.length; i++) {
      if (projectiles[i] !== undefined) {
        gameScene.remove(projectiles[i]);
        renderer.dispose(projectiles[i].geometry);
        renderer.dispose(projectiles[i].material);
        renderer.dispose(projectiles[i]);
        projectiles[i] = undefined;
      }
    }
    projectiles = [];

    for (var i = 0; i < corpses.length; i++) {
      if (projectiles[i] !== undefined) {
        gameScene.remove(corpses[i]);
        renderer.dispose(corpses[i].geometry);
        renderer.dispose(corpses[i].material);
        renderer.dispose(corpses[i]);
        corpses[i] = undefined;
      }
    }
    corpses = [];

    gameScene.children.forEach(function(object) {
      gameScene.remove(object);
    });

    for (i = gameScene.children.length; i >= 0; i--) {
      obj = gameScene.children[i];
      gameScene.remove(obj);
    }

    renderer.clear();
  }

  function updateBullets() {
    for (var i = projectiles.length - 1; i >= 0; i--) {
      if (projectiles[i] === undefined) continue;

      if (projectiles[i].alive == false) {
        disposeObject(projectiles[i])
        projectiles.splice(i, 1);
        continue;
      }

      projectiles[i].position.add(projectiles[i].velocity);
      projectiles[i].rotation.y += projectiles[i].rotSpeed * deltaTime;

      var originPoint = projectiles[i].position.clone();

      for (var vertexIndex = 0; vertexIndex < projectiles[i].geometry.vertices.length; vertexIndex++) {
        var localVertex = projectiles[i].geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(projectiles[i].matrix);
        var directionVector = globalVertex.sub(projectiles[i].position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(enemyShips);

        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() && collisionResults[0].object !== 'undefined' && collisionResults[0].object.alive) {
          if (collisionResults[0].object.name == 'EnemyShip') {
            var smashedShip = collisionResults[0].object;
            smashedShip.velocity = new THREE.Vector3(0, 0, 0);
            smashedShip.alive = false;
            projectiles[i].alive = false;
            gameScene.remove(projectiles[i]);
            gameScene.remove(smashedShip);
            var corpse = createCorpse(smashedShip.position);
            gameScene.add(corpse);
            corpses.push(corpse);
            score += 10;
            break;
          }
        }
      }
    }
  }

  function updateLaser() {
    laserOn -= 1;
    laserClone.position.set(
      ship.position.x,
      ship.position.y + 65,
      ship.position.z
    );
    var originPoint = laserClone.position.clone();
    for (var vertexIndex = 0; vertexIndex < laserClone.geometry.vertices.length; vertexIndex++) {
      var laserVertex = laserClone.geometry.vertices[vertexIndex].clone();
      var globalVertex = laserVertex.applyMatrix4(laserClone.matrix);
      var directionVector = globalVertex.sub(laserClone.position);
      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var collisionResults = ray.intersectObjects(enemyShips);

      if (collisionResults.length > 0) {
        for (var colIndex = 0; colIndex < collisionResults.length; colIndex++) {
          if (collisionResults[colIndex].object.name == 'EnemyShip' && collisionResults[colIndex].distance < directionVector.length() && collisionResults[colIndex].object !== 'undefined' && collisionResults[colIndex].object.alive) {
            var smashedShip = collisionResults[colIndex].object;
            smashedShip.velocity = new THREE.Vector3(0, 0, 0);
            smashedShip.alive = false;
            gameScene.remove(smashedShip);
            var corpse = createCorpse(smashedShip.position);
            gameScene.add(corpse);
            corpses.push(corpse);
            score += 10;
          }
        }
      }
    }
  }

  function createCorpse(pos) {
    var c = corpse.clone();
    c.position.set(
      pos.x,
      pos.y,
      pos.z
    );
    c.alive = true;
    setTimeout(function() {
      c.alive = false;
    }, 500);
    return c;
  }

  function strafe(enemy) {
    var strafeAmount = Math.floor(((Math.random() * 80) + 1) - 40) * 100;

    while (strafeAmount != 0) {
      if (strafeAmount > 0) {
        strafeAmount--;

        if (enemy.position.x > (screenSize - screenOffset)) {
          continue;
        }
        enemy.position.x += 0.01 * deltaTime;
      } else {
        strafeAmount++;

        if (enemy.position.x < (-screenOffset)) {
          continue;
        }
        enemy.position.x -= 0.01 * deltaTime;
      }
    }
  }

  function laserBeam() {
    var l = laser.clone();
    l.position.set(
      ship.position.x,
      ship.position.y + 40,
      ship.position.z
    );
    return l;
  }

  function updateGameObjects() {
    for (var i = enemyShips.length - 1; i >= 0; i--) {
      if (enemyShips[i] === undefined) continue;

      enemyShips[i].position.add(enemyShips[i].velocity) * deltaTime;
      enemyShips[i].rotation.y += enemyShips[i].rotSpeed * deltaTime * 0.07;

      if (enemyShips[i].position.y < -80 && enemyShips[i].alive) {
        enemyShips[i].alive = false;
        lives -= 1;
        score -= 100;
        var corpse = createCorpse(enemyShips[i].position);
        disposeObject(enemyShips[i]);
        gameScene.add(corpse);
        corpses.push(corpse);
        enemyShips.splice(i, 1);
      }

      if (!enemyShips[i].alive && enemyShips[i] !== undefined) {
        disposeObject(enemyShips[i]);
        enemyShips.splice(i, 1);
      }
    }

    for (var i = corpses.length - 1; i >= 0; i--) {
      if (corpses[i] === undefined) continue;

      if (!corpses[i].alive) {
        disposeObject(corpses[i]);
        corpses.splice(i, 1);
      }
    }
  }

  function update() {
    keyboard.update();

    if (keyboard.pressed("esc") && !menu) {
      menuButtonAction();
    }
    ship.rotation.y += ship.rotSpeed * deltaTime;
    checkShipCollision();
    updateBullets();
    updateGameObjects();

    if (fireLaser && (laserCooldown <= 0)) {
      laserClone = laserBeam();
      fireLaser = false;
      gameScene.add(laserClone);
      laserOn = 30;
      laserCooldown = 100;
      canLaser = false;
    }

    if (canLaser) {
      laserDiv.style.color = "Green";
      laserDiv.innerHTML = "Lazor Can Firen!";
    } else {
      laserDiv.style.color = "Red";
      laserDiv.innerHTML = "Ima Chargen Mah Lazor!";
    }

    if (laserOn > 0) {
      updateLaser();
    } else {
      if (laserClone !== undefined) {
        disposeObject(laserClone);
        laserClone = undefined;
      }
    }

    if (laserCooldown > 0) {
      laserCooldown -= 1;
    }

    if (laserCooldown > 0 || laserOn > 0) {
      canLaser = false;
    } else {
      canLaser = true;
    }

    if (canShoot <= 0) {
      shoot();
    }

    if (spawnEnemies <= 0) {
      var cnt = Math.floor((Math.random() * 5) + 1);

      for (var i = 0; i < cnt; i++) {
        var e = enemySpawner();
        e.alive = true;
        setTimeout(function() {
          strafe(e);
        }, 1000);
        enemyShips.push(e);
        gameScene.add(e);
      }
      enemyShip.velocity.add(new THREE.Vector3(0, -0.01, 0)) * deltaTime;
      spawnEnemies = 60;
    }

    if (canShoot > 0)
      canShoot -= 1;

    if (spawnEnemies > 0)
      spawnEnemies -= 1;
    console.log(camera.quaternion);
    if (ship.position.x > 0) {
      if (camera.rotation.y > -0.1) {
        camera.rotation.y -= 0.0004 * deltaTime;
      }
    } else {
      if (camera.rotation.y < 0.1) {
        camera.rotation.y += 0.0004 * deltaTime;
      }
    }
    scoreDiv.innerHTML = "Score: " + score;
    livesDiv.innerHTML = "Lives: " + lives;

    if (lives <= 0) {
      endGame();
    }
  }

  function render() {
    requestAnimationFrame(render);
    
    if (!menu && !dead) {
      deltaTime = performance.now() - oldTime;
      oldTime = performance.now();
      renderer.render(gameScene, camera);
      update();
    }
  }
  render();
}