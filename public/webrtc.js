var pc = window.pc = new RTCPeerConnection(null, null);
var offer_type = "offer";
var discovery = setInterval(discover, 1000);
var offer_tid = setTimeout(make_offer, 5000);
var send_channel;

function advertise(data) { post_ajax("/advertise", { msg: data } ); }

// replacement for JQuery's $.getJSON(url, callback)
function get_json(path, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', path, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      callback(JSON.parse(request.responseText));
    }
  }
  request.send();
}

// replacement for JQuery's $.post(url, data) when data is JSON
function post_ajax(url, data) {
  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(JSON.stringify(data));
}

function discover() {
  get_json("/discover", function(offer) {
    switch(offer.type) {
      case "offer":
        log('Received an offer: ' + offer.sdp);
        offer_type = "answer";
        pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
          pc.createAnswer(function(answer) {
            pc.setLocalDescription(new RTCSessionDescription(answer),
                                   function() {},
                                   function() { error('setLocalDescription'); });
          }, function() { error('createAnswer'); });
        }, error);
        break;
      case "answer":
        log('Received an answer: ' + offer.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(offer),
                                function() {},
                                function() { error('answer - setRemoteDescription'); });
        break;
      default:
        log('Received nothing: ' + offer.sdp);
        break;
    }
  });
}

// if our peer sets up a data channel, set our receive channel to that channel
pc.ondatachannel = enable_send;

function enable_send(evt) {
  send_channel = (evt.channel || evt.target);

  log('Created a receive data channel - may now receive data from peer.');
  send_channel.onmessage = rxMessage;

  // stop polling for signaling messages
  clearInterval(discovery);
  clearTimeout(offer_tid);
}

// add a callback for when ice candidates are created by the peer connection
pc.onicecandidate = function(ice_event) {
  log('Received new ice candidate');
  if (!ice_event.candidate) {
    log('Description sent to peer: ' + JSON.stringify(pc.localDescription));
    advertise({ type: offer_type, sdp: pc.localDescription.sdp });
  }
};

function log(text) { console.log(text.replace(/^\s+|\s+$/g, '')); }
function error(err) { log('Encountered an error: ' + err); pc.close(); }

function rxMessage(ev) { alert(ev.data) }

function make_offer() {
  send_channel = pc.createDataChannel('sendDataChannel', { reliable: true });
  send_channel.onopen = enable_send;
  pc.createOffer(function(offer) {
    pc.setLocalDescription(new RTCSessionDescription(offer),
                           function() {},
                           function() { error('createOffer - setLocalDescription'); });
  }, function() { error('createOffer'); });
}

function make_noise() {
  if (send_channel) {
    send_channel.send("make some noise!");
  }
}
