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
function View() {

    var observers = [];


    var header = document.getElementsByTagName("header")[0];
    var main = document.getElementsByTagName("main")[0];
    var menu = document.getElementById("menu");
    var breakout = document.getElementById("breakout");
    var breakoutCtx = breakout.getContext("2d");
    var buffer = document.createElement("canvas");
    var bufferCtx = buffer.getContext("2d");
    var input = document.createElement("INPUT");
    var pS; // pixelScale, scale of the canvas compared to model in pixels used to scale values coming from the model
    var aR = 9/16; // aspectRation used throughout the game

    var tilt = 0;

    updateBreakoutDimensions();
    updateBufferDimensions();

    function swapBuffers() {
        updateBreakoutDimensions();
        breakoutCtx.drawImage(buffer, 0, 0, breakout.width, breakout.height);
        updateBufferDimensions();
        bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
    }

    function updateBreakoutDimensions() {
        if (main.offsetWidth < main.offsetHeight*aR) {
            breakout.width = main.offsetWidth;
            breakout.height = main.offsetWidth/aR;
        } else {
            breakout.width = main.offsetHeight*aR;
            breakout.height = main.offsetHeight;
        }
    }

    function updateBufferDimensions() {
        buffer.width = breakout.width;
        buffer.height = breakout.height;
        pS = buffer.height;
    }

    function drawBackground() {
        var grad = bufferCtx.createLinearGradient(0,0,0,pS);
        grad.addColorStop(0,"#4087c5");
        grad.addColorStop(1,"#71abd6");
        bufferCtx.fillStyle = grad;
        bufferCtx.fillRect(0, 0, pS*aR, pS);
    }

    function drawPaddle(rect) {
        bufferCtx.fillStyle = "#810f7c";
        bufferCtx.fillRect(rect.vMin.x*pS, rect.vMin.y*pS, rect.getWidth()*pS, rect.getHeight()*pS);
    }

    function drawBall(circ) {
        bufferCtx.fillStyle = "#006344";
        bufferCtx.beginPath();
        bufferCtx.arc(circ.o.x*pS, circ.o.y*pS, circ.r*pS, 0, 2*Math.PI);
        //bufferCtx.arc(10, 20, 30, 0, 2*Math.PI);
        bufferCtx.fill();
    }

    function drawWall(rect, colour) {
        bufferCtx.fillStyle = colour;
        bufferCtx.fillRect(rect.vMin.x*pS, rect.vMin.y*pS, rect.getWidth()*pS, rect.getHeight()*pS);
    }

    function drawBrick(rect, colour) {
        bufferCtx.fillStyle = colour;
        bufferCtx.fillRect(rect.vMin.x*pS, rect.vMin.y*pS, rect.getWidth()*pS, rect.getHeight()*pS);
    }

    function getTilt() {
        return tilt;
    }

    function addParagraph(text, classList) {
        var paragraph = document.createElement("p");
        paragraph.classList = classList;
        paragraph.innerHTML = text;
        menu.appendChild(paragraph);
    }

    function addButton(text, callback, argument) {
        var button = document.createElement("button");
        button.innerHTML = text;
        button.onclick = function() {
            callback(argument);
        };
        menu.appendChild(button);
        menu.style.visibility = "visible";
    }

    function addInput(size) {
        input.size = size;
        input.maxLength = size;
        input.value = "";
        menu.appendChild(input);
    }

    function getInput() {
        return input.value;
    }

    function eraseMenu() {
        menu.innerHTML = "";
        menu.style.visibility = "hidden";
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



    // if (window.DeviceOrientationEvent) {
    //     var tiltValues = [0];
    //     window.addEventListener("deviceorientation", function(event) {
    //         // get the rotation, either gamma or beta based on phone orientation
    //         var x = 0;
    //         if (main.offsetWidth < main.offsetHeight) {
    //             x = event.gamma;
    //         } else if (main.offsetWidth > main.offsetHeight) {
    //             x = event.beta;
    //         }
    //         // normalize the value between -45 and 45 degrees
    //         x = x / 30;
    //         if (x < -1) x = -1;
    //         if (x >  1) x =  1;
    //
    //         // store the value
    //         tiltValues.unshift(x);
    //         // Limit the smoothing
    //         if (tiltValues.length > 3) tiltValues.pop();
    //         tilt = 0;
    //         tiltValues.forEach(function(element){
    //             tilt += element;
    //         });
    //         tilt = tilt/tiltValues.length;
    //     });
    // }
    if (window.DeviceMotionEvent) {
        var lastValue = 0;
        window.addEventListener("devicemotion", function(event) {
            // Functions for filtering only needed for accelerometer
            function lowPassFilter(value, alpha) {
                return alpha * value + (1 - alpha) * lastValue;
            }

            function alpha(frequency) {
                var RC = 1 / (2 * Math.PI * frequency);
                return 1 / (1 + RC);
            }

            function oneEuroFilter(beta, mincutoff, dcutoff) {
                var dx = (x - lastValue);
                var edx = lowPassFilter(dx, alpha(dcutoff));
                var cutoff = mincutoff + beta * Math.abs(edx);
                return lowPassFilter(x, alpha(cutoff));
            }

            // get the rotation, either gamma or beta based on phone orientation
            var x = 0;
            if (main.offsetWidth < main.offsetHeight) {
                x = -event.accelerationIncludingGravity.x;
            } else if (main.offsetWidth > main.offsetHeight) {
                x = event.accelerationIncludingGravity.y;
            }

            // filter the value
            x = oneEuroFilter(0.1, 0.1, 10);

            // normalize the value
            if (x < -1) x = -1;
            if (x >  1) x =  1;

            tilt = x;
        });
    }
    window.addEventListener("mousemove", function(event){
        // get mouse position in DOM
        var x = event.clientX;
        // center the position into the center of main element
        x = x - (main.offsetWidth/2);
        // normalize the values to the canvas size
        x = x / (breakout.width/2);
        if (x < -1) x = -1;
        if (x >  1) x =  1;

        // store the value
        tilt = x;
    });
    window.addEventListener("resize", function(event) {
        notify();
    });

    return {
        swapBuffers : swapBuffers,
        drawBackground : drawBackground,
        drawPaddle : drawPaddle,
        drawBall : drawBall,
        drawWall : drawWall,
        drawBrick : drawBrick,
        getTilt : getTilt,
        addParagraph : addParagraph,
        addButton : addButton,
        addInput: addInput,
        getInput: getInput,
        eraseMenu : eraseMenu,
        addObserver: addObserver,
        removeObserver: removeObserver
    }
}
