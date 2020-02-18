/* jshint -W097 */
"use strict";
/*
* Code for University of Strathclyde Mobile App Development.
* Developed by Filip Lejhanec 2017.
*
* Code confidential to developer and course examiners.
*
* Description of file
*/

function Controller(model, mpModel, view) {

    // Declare states
    var states = {
        MENU : {
            onEnter : function() {
                model.newGame();
                isMp = false;
                renderGame();
                view.addParagraph("MENU", "title");
                view.addButton("Multiplayer", transition, states.MP_MENU);
                view.addButton("Singleplayer", transition, states.SP_RUNNING);
                view.addButton("Attributions", transition, states.ATTRIBUTIONS);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        MP_MENU : {
            onEnter : function() {
                mpModel.newGame();
                isMp = true;
                renderGame();
                view.addParagraph("Multiplayer", "subtitle");
                view.addButton("Create Game", transition, states.MP_CREATE);
                view.addButton("Join a Game", transition, states.MP_JOIN);
                view.addButton("Back", transition, states.MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        MP_CREATE : {
            onEnter : function() {
                mpModel.newGame(false);
                var code = Math.random().toString(36).substring(2,6)
                view.addParagraph("Waiting", "subtitle");
                view.addParagraph("Give your friend the", "text");
                view.addParagraph("following code to join you", "text");
                view.addParagraph("in the Breakout battle", "text");
                view.addParagraph(code, "title");
                rtc = new WebRTCOffer(connectionEstablished);
                rtc.connect(code);
                view.addButton("Back", transition, states.MP_MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        MP_JOIN : {
            onEnter : function() {
                mpModel.newGame(true);
                view.addParagraph("Joining", "subtitle");
                view.addParagraph("Input a 4-letter code of a", "text");
                view.addParagraph("game you want to join in", "text");
                view.addInput(4);
                rtc = new WebRTCAnswer(connectionEstablished);
                view.addButton("Join", function(){rtc.connect(view.getInput())}, undefined);
                view.addButton("Back", transition, states.MP_MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        MP_RUNNING : {
            onEnter : function() {
                startMpLoop();
            },
            onUpdate : function(args) {
                if (args === "GAME_OVER") {
                    rtc.sendMessage(args+mpModel.getState());
                    transition(states.GAME_OVER);
                } else {
                    renderGame();
                }
            },
            onLeave : function() {
                stopLoop();
            }
        },
        SP_RUNNING : {
            onEnter : function() {
                startSpLoop();
            },
            onUpdate : function(args) {
                if (args === "GAME_OVER") {
                    transition(states.GAME_OVER);
                } else if (args === "GAME_WON") {
                    transition(states.GAME_WON);
                } else {
                    renderGame();
                }
            },
            onLeave : function() {
                stopLoop();
            }
        },
        GAME_OVER : {
            onEnter : function() {
                view.addParagraph("GAME OVER", "title");
                view.addButton("Back", transition, states.MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        GAME_WON : {
            onEnter : function() {
                view.addParagraph("GAME WON", "title");
                view.addButton("Back", transition, states.MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        },
        ATTRIBUTIONS : {
            onEnter : function() {
                view.addParagraph("ATTRIBUTIONS", "subtitle");
                var levels = model.getLevels();
                for (var i = 0; i < levels.length; i++) {
                    view.addParagraph("Level "+i+": "+levels[i][1], "text");
                    view.addParagraph("by "+levels[i][2], "text");
                    view.addParagraph("from <a href='"+levels[i][4]+"'>"+levels[i][3]+"</a>", "text");
                    view.addParagraph("under "+levels[i][5], "text");
                    view.addParagraph("~~~~~~~~~~~~~", "text")
                }
                view.addButton("Back", transition, states.MENU);
            },
            onUpdate : function(args) {
                renderGame();
            },
            onLeave : function() {
                view.eraseMenu();
            }
        }
    };

    // Transition table must be implemented after states declaration
    states.MENU.transitions = [
        states.MP_MENU, states.SP_RUNNING, states.ATTRIBUTIONS
    ];
    states.MP_MENU.transitions = [
        states.MP_CREATE, states.MP_JOIN, states.MENU
    ];
    states.MP_CREATE.transitions = [
        states.MP_RUNNING, states.MP_MENU
    ];
    states.MP_JOIN.transitions = [
        states.MP_RUNNING, states.MP_MENU
    ];
    states.MP_RUNNING.transitions = [
        states.GAME_OVER, states.GAME_WON
    ];
    states.SP_RUNNING.transitions = [
        states.GAME_OVER, states.GAME_WON
    ];
    states.GAME_OVER.transitions = [
        states.MENU
    ];
    states.GAME_WON.transitions = [
        states.MENU
    ];
    states.ATTRIBUTIONS.transitions = [
        states.MENU
    ];

    // Initial state
    var state = states.MENU;

    var intervalID;
    var dTime = 1000/60;
    var isMp = false;
    var rtc;
    var lastMessage = 0.0;
    var lastTilt = 0.0;

    function init() {
        model.addObserver(this);
        mpModel.addObserver(this);
        view.addObserver(this);
        state.onEnter();
        renderGame();
    }

    function transition(nextState) {
        // Check that the transition is valid
        if (state.transitions.indexOf(nextState) < 0) {
            throw "Illegal state exception";
        }
        state.onLeave();
        state = nextState;
        state.onEnter();
    }

    function update(args) {
        state.onUpdate(args);
    }

    function newMessage(message) {
        var tokens = message.data.split(";");
        if (tokens[0] === "GAME_OVER") {
            transition(states.GAME_WON);
            mpModel.setState(tokens);
        } else {
            lastMessage = message.data;
        }
    }

    function connectionEstablished() {
        rtc.setOnMessage(newMessage);
        transition(states.MP_RUNNING);
    }

    function mpTick() {
        var tilt = view.getTilt();
        rtc.sendMessage(tilt);
        mpModel.tick(dTime, lastTilt, -lastMessage);
        lastTilt = tilt;
    }

    function startMpLoop() {
        intervalID = setInterval(mpTick, dTime);
    }

    function spTick() {
        model.tick(dTime, view.getTilt());
    }

    function startSpLoop() {
        intervalID = setInterval(spTick, dTime);
    }

    function stopLoop() {
        clearInterval(intervalID);
    }

    function renderGame() {
        var currentModel = isMp ? mpModel : model;
        view.drawBackground();
        view.drawPaddle(currentModel.getPaddle().getRect());
        if (isMp) view.drawPaddle(currentModel.getEnemyPaddle().getRect());
        currentModel.getBalls().forEach(function(ball) {
            view.drawBall(ball.getCirc());
        });
        currentModel.getWalls().forEach(function(wall) {
            view.drawWall(wall.getRect(), wall.getColour());
        });
        currentModel.getBricks().forEach(function(brick) {
            view.drawBrick(brick.getRect(), brick.getColour());
        });
        view.swapBuffers();
    }

    return {
        init : init,
        update : update
    }
}
