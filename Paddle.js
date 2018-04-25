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
function Paddle(rect, xMin, xMax) {

    function move(xOffset) {
        rect.vMin.x += xOffset;
        rect.vMax.x += xOffset;
        if (rect.vMin.x < xMin) move(xMin - rect.vMin.x);
        if (rect.vMax.x > xMax) move(xMax - rect.vMax.x);
    }

    function getRect() {
        return rect;
    }

    return {
        move : move,
        getRect : getRect
    }
}