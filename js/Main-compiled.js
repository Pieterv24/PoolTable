"use strict";

//1 unit = 1cm

$(document).ready(function () {
    init();
});

var container;

var camera, scene, renderer, loader, textureManager;

var keyboardControl;

var clock;

var poolTable, ballArray, playBallStart, eightballstart;
var startPosArray;
var collisionArray = [];

var windowHalfX, windowHalfY;

function init() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    container = document.createElement("div");
    document.body.appendChild(container);

    keyboardControl = new Control();
    textureManager = new THREE.LoadingManager();
    loader = new THREE.TextureLoader(textureManager);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0000FF);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = -200;
    camera.position.y = 100;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    var amLight = new THREE.AmbientLight(0x777777);
    amLight.position.y = 15;

    var light = new THREE.PointLight(0xffffff, 1.5, 500);
    light.position.y = 50;
    light.castShadow = true;

    poolTable = new PoolTable();

    ballArray = [new PlayBall(0), new PoolBall(1, 1), new PoolBall(2, 1), new PoolBall(3, 1), new PoolBall(4, 1), new PoolBall(5, 1), new PoolBall(6, 1), new PoolBall(7, 1), new PoolBall(8, 8), new PoolBall(9, 2), new PoolBall(10, 2), new PoolBall(11, 2), new PoolBall(12, 2), new PoolBall(13, 2), new PoolBall(14, 2), new PoolBall(15, 2)];

    playBallStart = new THREE.Vector2(0, 75);
    eightballstart = new THREE.Vector2(0, -87);

    startPosArray = [
    /*[0, 0],*/
    [0, -75], [-3, -81], [3, -81], [-6, -87], /*[0, 0],*/[6, -87], [-9, -93], [3, -93], [-3, -93], [9, -93], [-12, -99], [-6, -99], [0, -99], [6, -99], [12, -99]];

    setBallPositions();

    for (var i = 0; i < ballArray.length; i++) {
        //Add Textures
        if (i >= 1 && i <= 15) ballArray[i].Material.map = loader.load("assets/textures/Ball" + i + ".png");

        //Populate collision array
        var tempArray = [];
        for (var j = 0 + i; j < ballArray.length; j++) {
            tempArray[j] = false;
        }
        collisionArray[i] = tempArray;
    }

    scene.add(amLight);
    scene.add(light);

    scene.add(poolTable.mesh);

    scene.add(ballArray[0].mesh);
    scene.add(ballArray[0].ceuMesh);
    for (var _i = 1; _i < ballArray.length; _i++) {
        scene.add(ballArray[_i].mesh);
    }

    window.addEventListener('resize', onWindowResize, false);

    textureManager.onLoad = function () {
        animate();
    };
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    var clockDelta = clock.getDelta();

    for (var i = 0; i < ballArray.length; i++) {
        ballArray[i].CalcMovement(clockDelta, poolTable.children);
    }

    for (var _i2 = 0; _i2 < ballArray.length; _i2++) {
        for (var j = _i2 + 1; j < ballArray.length; j++) {
            if (collisionArray[_i2][j] == false) {
                ballArray[_i2].BallCollision(ballArray[j]);
            }
            collisionArray[_i2][j] = ballArray[_i2].CheckBallCollision(ballArray[j]);
        }
    }

    checkKeys();
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);
}

function checkKeys() {
    var center = new THREE.Vector3(0, 0, 0);
    if (keyboardControl.GetKey("left") == true) {
        var newRot = calcNewRot(camera.position.x, camera.position.z, 0.05, center);
        camera.position.set(newRot.x, camera.position.y, newRot.y);
    }
    if (keyboardControl.GetKey("right") == true) {
        var newRot = calcNewRot(camera.position.x, camera.position.z, -0.05, center);
        camera.position.set(newRot.x, camera.position.y, newRot.y);
    }
    if (keyboardControl.GetKey("up")) {
        if (camera.position.y < 200) camera.position.y += 5;
    }
    if (keyboardControl.GetKey("down")) {
        if (camera.position.y > 20) camera.position.y += -5;
    }

    if (keyboardControl.GetKey("space")) {
        onClick();
    }
}

function calcNewRot(x, y, rotation, center) {
    var center = new THREE.Vector2(center.x, center.y);
    var vector = new THREE.Vector2(x, y);
    vector.rotateAround(center, rotation);
    return vector;
}

function setBallPositions() {
    var fullCornerSet = false;
    var halfCornerSet = false;
    var indexArray = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12];
    var ballIndexArray = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];

    ballArray[0].SetPosition(playBallStart.x, playBallStart.y);
    ballArray[1].SetPosition(startPosArray[0][0], startPosArray[0][1]);
    ballArray[8].SetPosition(eightballstart.x, eightballstart.y);

    while (indexArray.length > 0 && ballIndexArray.length > 0) {
        //Select random ball
        var ranBallIndex = Math.floor(Math.random() * ballIndexArray.length);
        var ballIndex = ballIndexArray[ranBallIndex];
        console.log(ballIndexArray);
        console.log("RandBall: " + ranBallIndex);
        console.log("Ball: " + ballIndex);
        if (ballArray[ballIndex].type == 1 && !fullCornerSet) {
            ballArray[ballIndex].SetPosition(startPosArray[9][0], startPosArray[9][1]);
            fullCornerSet = true;
        } else if (ballArray[ballIndex].type == 2 && !halfCornerSet) {
            ballArray[ballIndex].SetPosition(startPosArray[13][0], startPosArray[13][1]);
            halfCornerSet = true;
        } else {
            var ranPosIndex = Math.floor(Math.random() * indexArray.length);
            var posIndex = indexArray[ranPosIndex];
            indexArray.splice(ranPosIndex, 1);
            console.log(indexArray);
            console.log("RandIndex: " + ranPosIndex);
            console.log("Position: " + posIndex);

            ballArray[ballIndex].SetPosition(startPosArray[posIndex][0], startPosArray[posIndex][1]);
        }
        ballIndexArray.splice(ranBallIndex, 1);
    }
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick() {
    ballArray[0].SetDirection(0, -1);
    ballArray[0].SetSpeed(200);
}

//# sourceMappingURL=Main-compiled.js.map