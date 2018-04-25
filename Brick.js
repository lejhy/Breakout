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
function Brick(rect, colour) {

    function getRect() {
        return rect;
    }

    function getColour() {
        return colour
    }

    return {
        getRect : getRect,
        getColour : getColour
    }
}