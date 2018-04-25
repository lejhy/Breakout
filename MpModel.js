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
function MpModel() {

    var observers = [];

    var colours = ["yellow", "green", "blue", "red"];

    var aR = 9/16; // aspectRatio, how many times is normalized x smaller that normalized y
    var paddle;
    var enemyPaddle;
    var balls;
    var walls;
    var bricks;
    var physics = new Physics();
    const substeps = 10;

    function restart(flip) {
        paddle = new Paddle(new Rectangle(new Vector2(0.35*aR, 0.95), new Vector2(0.7*aR, 0.97)), 0, aR);
        enemyPaddle = new Paddle(new Rectangle(new Vector2(0.35*aR, 0.03), new Vector2(0.7*aR, 0.05)), 0, aR);
        createWalls();
        loadLevel(flip);
        if (flip) {
            balls = [new Ball(new Circle(new Vector2(0.5*aR, 0.3), 0.02), new Vector2(0.0001, 0.0001)), new Ball(new Circle(new Vector2(0.5*aR, 0.7), 0.02), new Vector2(-0.0001, -0.0001))];
        } else {
            balls = [new Ball(new Circle(new Vector2(0.5*aR, 0.7), 0.02), new Vector2(-0.0001, -0.0001)), new Ball(new Circle(new Vector2(0.5*aR, 0.3), 0.02), new Vector2(0.0001, 0.0001))];
        }
        notify();
    }

    function createWalls() {
        var bottomWall = new Wall(new Rectangle(new Vector2(-aR, 1), new Vector2(2*aR, 2)), "black");
        var leftWall = new Wall(new Rectangle(new Vector2(-aR, -1), new Vector2(0, 2)), "black");
        var topWall = new Wall(new Rectangle(new Vector2(-aR, -1), new Vector2(2*aR, 0.05)), "transparent");
        var rightWall = new Wall(new Rectangle(new Vector2(aR, -1), new Vector2(2*aR, 2)), "black");
        walls = [bottomWall, leftWall, topWall, rightWall];
    }

    function loadLevel(flip) {
        bricks = [];
        var a = 1/32;
        if(flip) {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 18; j++) {
                    bricks.push(new Brick(new Rectangle(new Vector2(j*a, (17-i)*a), new Vector2((j+1)*a, (17-i+1)*a)), colours[i]));
                }
            }
        } else {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 18; j++) {
                    bricks.push(new Brick(new Rectangle(new Vector2(j*a, (14+i)*a), new Vector2((j+1)*a, (14+i+1)*a)), colours[i]));
                }
            }
        }
    }

    function getState() {
        var message = ";";
        message += paddle.getRect().vMin.x;
        message += ";";
        message += paddle.getRect().vMax.x;
        message += ";";
        message += balls[0].getCirc().o.x;
        message += ";";
        message += balls[0].getCirc().o.y;
        message += ";";
        message += balls[1].getCirc().o.x;
        message += ";";
        message += balls[1].getCirc().o.y;
        return message
    }

    function setState(tokens) {
        enemyPaddle.getRect().vMax.x = aR - tokens[1];
        enemyPaddle.getRect().vMin.x = aR - tokens[2];
        balls[0].getCirc().o.x = aR - tokens[3];
        balls[0].getCirc().o.y = 1 - tokens[4];
        balls[1].getCirc().o.x = aR - tokens[5];
        balls[1].getCirc().o.y = 1 - tokens[6];
        notify();
    }

    function newGame(flip) {
        restart(flip);
    }

    function gameOver() {
        notify("GAME_OVER");
    }

    function tick(dTime, input, enemyInput) {
        for (var i = 1; i <= substeps; i++) {
            var subDTime = dTime/substeps;
            var scaledInput = input*subDTime;
            scaledInput *= 0.0002;
            paddle.move(scaledInput);
            var scaledEnemyInput = enemyInput*subDTime;
            scaledEnemyInput *= 0.0002;
            enemyPaddle.move(scaledEnemyInput);
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
            }
        }
    }

    function getObstacles() {
        var obstacles = [paddle, enemyPaddle];
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

    function getEnemyPaddle() {
        return enemyPaddle;
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
        getPaddle : getPaddle,
        getEnemyPaddle: getEnemyPaddle,
        getBalls : getBalls,
        getWalls : getWalls,
        getBricks : getBricks,
        getState : getState,
        setState : setState,
        addObserver: addObserver,
        removeObserver: removeObserver,
    }
}
