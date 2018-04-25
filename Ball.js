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
function Ball (circ, vel) {

    function move(dTime) {
        circ.o = circ.o.add(vel.mult(dTime));
        return new Vector2()
    }

    function flipHorizontally() {
        vel = vel.flip("x");
    }

    function flipVertically() {
        vel = vel.flip("y");
    }

    function getRect() {
        var vMin = new Vector2(circ.o.x - circ.r, circ.o.y - circ.r);
        var vMax = new Vector2(circ.o.x + circ.r, circ.o.y + circ.r);
        return new Rectangle(vMin, vMax);
    }

    function getCirc() {
        return circ;
    }

    function getVelocity() {
        return vel;
    }

    return {
        move : move,
        flipHorizontally : flipHorizontally,
        flipVertically : flipVertically,
        getRect : getRect,
        getCirc : getCirc,
        getVelocity : getVelocity
    }
}