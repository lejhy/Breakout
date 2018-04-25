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
function Collision(ball, rectangle) {

    function getTarget() {
        return rectangle;
    }

    function getSource() {
        return ball;
    }

    return {
        getTarget : getTarget,
        getSource : getSource
    }
}