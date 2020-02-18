/* jshint -W097 */
"use strict";
/*
* Code for University of Strathclyde Mobile App Development.
* Developed by Filip Lejhanec 2017.
*
* Code confidential to developer and course examiners.
*
* Description of this file
*/
function Model() {

    var observers = [];

    var levels = [
        ["piq_70010.png", "Sumo Wrestler", "IvoryMalinov", "piq.codeus.net", "http://piq.codeus.net/picture/70010/sumo_wrestler", "Creative Commons"],
        ["piq_306960.png", "Game bug", "mrskittens2003", "piq.codeus.net", "http://piq.codeus.net/picture/306960/game_bug", "Creative Commons"],
        ["piq_307048.png", "Mario Mushroom", "mrskittens2003", "piq.codeus.net", "http://piq.codeus.net/picture/307048/mario_mushroom", "Creative Commons"]
    ];

    var currentLevel;
    var aR = 9/16; // aspectRatio, how many times is normalized x smaller that normalized y
    var paddle;
    var balls;
    var walls;
    var bricks;
    var physics = new Physics();
    const substeps = 10;

    function restart() {
        paddle = new Paddle(new Rectangle(new Vector2(0.35*aR, 0.95), new Vector2(0.7*aR, 0.97)), 0, aR);
        createWalls();
        loadLevel();
        balls = [new Ball(new Circle(new Vector2(0.5*aR, 0.5), 0.02), new Vector2(-0.0002, -0.0002))];
        notify();
    }

    function createWalls() {
        var bottomWall = new Wall(new Rectangle(new Vector2(-aR, 1), new Vector2(2*aR, 2)), "black");
        var leftWall = new Wall(new Rectangle(new Vector2(-aR, -1), new Vector2(0, 2)), "black");
        var topWall = new Wall(new Rectangle(new Vector2(-aR, -1), new Vector2(2*aR, 0)), "black");
        var rightWall = new Wall(new Rectangle(new Vector2(aR, -1), new Vector2(2*aR, 2)), "black");
        walls = [bottomWall, leftWall, topWall, rightWall];
    }

    function loadLevel() {
        bricks = [];
        var img = new Image();
        img.src = levels[currentLevel][0];
        var level = document.createElement("canvas");
        var levelCtx = level.getContext("2d");
        img.onload = function() {
            var width = img.width;
            var height = img.height;
            level.width = width;
            level.height = height;
            levelCtx.drawImage(img, 0, 0);
            var data = levelCtx.getImageData(0, 0, width, height).data;
            for (var row = 0; row < height; row++) {
                for (var pixel = 0; pixel < width; pixel++) {
                    var index = row*width*4 + pixel*4;
                    if (data[index+3] > 0) {
                        var vMin = new Vector2(pixel / width * aR, row / height * aR);
                        var vMax = new Vector2((pixel+1) / width * aR, (row+1) / height * aR);
                        var position = new Rectangle(vMin, vMax);
                        var colour = "rgba("+data[index]+","+data[index+1]+","+data[index+2]+","+data[index+3]/255+")";
                        var brick = new Brick(position, colour);
                        bricks.push(brick);
                    }
                }
            }
            notify();
        };
    }

    function newGame() {
        currentLevel = 0;
        restart();
    }

    function nextLevel() {
        currentLevel++;
        if (currentLevel === levels.length) {
            notify("GAME_WON");
        } else {
            restart();
        }
    }

    function gameOver() {
        currentLevel = 0;
        notify("GAME_OVER");
    }

    function getLevels() {
        return levels;
    }

    function tick(dTime, input) {
        for (var i = 1; i <= substeps; i++) {
            var subDTime = dTime/substeps;
            var scaledInput = input*subDTime;
            scaledInput *= 0.0004;
            paddle.move(scaledInput);
            var collisions = physics.resolve(subDTime, balls, getObstacles());
            resolveCollisions(collisions);
        }
        notify();
    }

    function resolveCollisions(collisions) {
        for (var i =  0; i < collisions.length; i++) {
            var target = collisions[i].getTarget();
            // Check for bottom wall collision and game over
            if (target === walls[0]) {
                gameOver();
                return;
            }
            var index = bricks.indexOf(target);
            if (index >= 0) {
                bricks.splice(index, 1);
                if (bricks.length === 0) {
                    nextLevel();
                    return;
                }
            }
        }
    }

    function getObstacles() {
        var obstacles = [paddle];
        walls.forEach(function(wall) {
            obstacles.push(wall);
        });
        bricks.forEach(function(brick) {
            obstacles.push(brick);
        });
        return obstacles;
    }

    function getPaddle() {
        return paddle;
    }

    function getBalls() {
        return balls;
    }

    function getWalls() {
        return walls;
    }

    function getBricks() {
        return bricks;
    }

    function addObserver(observer) {
        observers.push(observer);
    }

    function removeObserver(observer) {
        var index = observers.indexOf(observer);
        observers.splice(index, 1);
    }

    function notify(args) {
        observers.forEach(function(observer) {
            observer.update(args);
        });
    }

    return {
        newGame : newGame,
        tick : tick,
        getLevels : getLevels,
        getPaddle : getPaddle,
        getBalls : getBalls,
        getWalls : getWalls,
        getBricks : getBricks,
        addObserver: addObserver,
        removeObserver: removeObserver
    }
}
