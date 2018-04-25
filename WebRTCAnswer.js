function WebRTCAnswer(callback) {
    var peerConnection;
    var dataChannel;
    var sdpConstraints;
    var config;
    var timeout;
    var code;

    function init() {
        config = {"iceServers":[{
            urls:"stun:stun.l.google.com:19302"
        }, {
            urls: "turn:numb.viagenie.ca",
            username: "filip.lejhanec.2015@uni.strath.ac.uk",
            credential: "HGVZHX24RDB"
        }]};

        peerConnection = new RTCPeerConnection(config);
        sdpConstraints = {'mandatory':
                {
                    'OfferToReceiveAudio': false,
                    'OfferToReceiveVideo': false
                }
        };

        peerConnection.ondatachannel = function (e) {
            dataChannel = e.channel;
            dataChannel.onopen = function (e) {
                console.log("Channel opened");
                callback();
            };
            dataChannel.onmessage = function (e) {
                console.log("message received");
            };
        };

        peerConnection.onicecandidate = function(e){
            if (!peerConnection || !e || !e.candidate) return;
            sendData(code, "answerCandidate", event.candidate);
        };
    }

    function setOnMessage(callback) {
        dataChannel.onmessage = callback;
    }

    function sendMessage(text) {
        dataChannel.send(text);
    }

    function processOffer(offer) {
        clearTimeout(timeout);
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peerConnection.createAnswer(sdpConstraints).then(function (answer) {
            peerConnection.setLocalDescription(answer);
            sendData(code, "answer", answer);
            console.log("Answer sent");
        });
        timeout = setInterval(function(){getData(code, "offerCandidate", processIce)}, 1000);
    }

    function processIce(iceCandidate){
        clearTimeout(timeout);
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate)).then(function() {
            console.log("Candidate added successfully")
        });
    }

    function sendData(code, type, data) {
        var ajax = new XMLHttpRequest();
        ajax.open("POST", "https://devweb2017.cis.strath.ac.uk/~emb15144/Breakout/Matchmaking.php");
        ajax.setRequestHeader('Content-Type', 'application/json');
        ajax.send(JSON.stringify({code: code, type: type, data: JSON.stringify(data)}));
    }


    function getData(code, type, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                if (ajax.responseText != "") {
                    console.log(ajax.responseText);
                    callback(JSON.parse(ajax.responseText));
                }
            }
        };
        ajax.open("POST", "https://devweb2017.cis.strath.ac.uk/~emb15144/Breakout/Matchmaking.php");
        ajax.setRequestHeader('Content-Type', 'application/json');
        ajax.send(JSON.stringify({code: code, type: type}));
    }

    function connect(newCode) {
        code = newCode;
        timeout = setInterval(function(){getData(code, "offer", processOffer)}, 1000);
    }

    init();

    return {
        connect: connect,
        sendMessage: sendMessage,
        setOnMessage: setOnMessage
    }
}