function WebRTCOffer(callback) {
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
        dataChannel = peerConnection.createDataChannel("chat");
        dataChannel.onopen = function(event) {
            console.log("Channel open");
            callback();
        };

        peerConnection.onicecandidate = function(e){
            if (!peerConnection || !e || !e.candidate) return;
            sendData(code, "offerCandidate", event.candidate);
        };
    }

    function setOnMessage(callback) {
        dataChannel.onmessage = callback;
    }

    function sendMessage(text) {
        dataChannel.send(text);
    }

    function processAnswer(answer){
        clearTimeout(timeout);
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        timeout = setInterval(function(){getData(code, "answerCandidate", processIce)}, 1000);
    }

    function processIce(iceCandidate){
        clearTimeout(timeout);
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate)).then(function() {
            console.log("Candidate added successfully");
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
        peerConnection.createOffer(sdpConstraints).then(function (offer) {
            peerConnection.setLocalDescription(offer);
            sendData(code, "offer", offer);
            console.log("Offer sent");
        });

        timeout = setInterval(function(){getData(code, "answer", processAnswer)}, 1000);
    }

    init();

    return {
        connect: connect,
        sendMessage: sendMessage,
        setOnMessage: setOnMessage
    }
}