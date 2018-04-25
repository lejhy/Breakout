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
function Physics() {

    function resolve(dTime, balls, obstacles) {
        var collisions = [];
        balls.forEach(function(ball){
            collisions = collisions.concat(resolveBall(dTime, ball, obstacles));
        });
        return collisions;
    }

    function resolveBall(dTime, ball, obstacles) {
        // For now treat the ball as a rectangle
        var collisions = [];
        ball.move(dTime);
        obstacles.forEach(function(obstacle) {
            // Get updated ball geometry
            var ballRect = ball.getRect();
            var obstacleRect = obstacle.getRect();
            // Check for circle origin inside rectangle
            if (ballRect.vMin.x < obstacleRect.vMax.x &&
                ballRect.vMax.x > obstacleRect.vMin.x &&
                ballRect.vMin.y < obstacleRect.vMax.y &&
                ballRect.vMax.y > obstacleRect.vMin.y) {
                // collision
                var ballVelocity = ball.getVelocity();
                var delta = obstacleRect.getOrigin().sub(ballRect.getOrigin());
                var obstacleRectAspectRatio = obstacleRect.getWidth() / obstacleRect.getHeight();
                delta.y *= obstacleRectAspectRatio;
                if (Math.abs(delta.x) > Math.abs(delta.y)) {
                    // Horizontal collision
                    // Check for fly-through collisions
                    if (ballVelocity.x < 0 && delta.x < 0 || ballVelocity.x > 0 && delta.x > 0) {
                        ball.flipHorizontally();
                    }
                } else {
                    // Vertical collision
                    // Check for fly-through collisions
                    if (ballVelocity.y < 0 && delta.y < 0 || ballVelocity.y > 0 && delta.y > 0) {
                        ball.flipVertically();
                    }
                }
                collisions.push(new Collision(ball, obstacle))
            }
        });
        return collisions;
    }

    return {
        resolve : resolve
    }
}

function Vector2(xCoordinate, yCoordinate) {

    this.x = xCoordinate;
    this.y = yCoordinate;

    this.add = function(vector) {
        var x = this.x + vector.x;
        var y = this.y + vector.y;
        return new Vector2(x, y);
    }.bind(this);

    this.sub = function(vector) {
        var x = this.x - vector.x;
        var y = this.y - vector.y;
        return new Vector2(x, y);
    }.bind(this);

    this.mult = function(number) {
        var x = this.x * number;
        var y = this.y * number;
        return new Vector2(x, y);
    }.bind(this);

    this.flip = function(axis) {
        if (axis === "x") {
            return new Vector2(-this.x, this.y);
        }
        if (axis === "y") {
            return new Vector2(this.x, -this.y);
        }
        if (axis === "both") {
            return new Vector2(-this.x, -this.y);
        }
        throw "Illegal argument for 'axis'";
    }.bind(this);

}

function Rectangle(vectorMin, vectorMax) {

    if (vectorMin.x > vectorMax.x || vectorMin.y > vectorMax.y) {
        throw "One of vectorMin values is bigger that vectorMax";
    }

    this.vMin = vectorMin;
    this.vMax = vectorMax;

    this.getOrigin = function() {
        var x = (this.vMin.x + this.vMax.x) / 2;
        var y = (this.vMin.y + this.vMax.y) / 2;
        return new Vector2(x, y);
    }.bind(this);

    this.getWidth = function() {
        return this.vMax.x - this.vMin.x;
    }.bind(this);

    this.getHeight = function() {
        return this.vMax.y - this.vMin.y;
    }.bind(this);

}

function Circle(origin, radius) {

    if (radius <= 0) {
        throw "Not a circle";
    }

    this.o = origin;
    this.r = radius;
}