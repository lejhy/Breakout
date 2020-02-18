/* jshint -W097 */
"use strict";
/* globals Model, View, Controller */
/*
* Code for University of Strathclyde Mobile App Development.
* Developed by Filip Lejhanec 2018.
*
* Code confidential to developer and course examiners.
*
* Description of this file
*/

var model;
var mpModel;
var view;
var controller;

function init() {
    model = new Model();
    mpModel = new MpModel();
    view = new View();
    controller = new Controller(model, mpModel, view);
    controller.init();
}

window.addEventListener("load", init);