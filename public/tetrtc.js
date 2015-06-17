function TetRTC() {

  // private "class" variables (I think?)
  var pc = null;
  var offer_type = "offer";
  var comm = null;
  var recv_callback = null;
  var __rtc = this;


  // ===============
  // Private Methods
  // ===============

  function pc_reset() {
    pc = window.pc = new RTCPeerConnection(null, null);

    // if our peer sets up a data channel, set our receive channel to that channel
    pc.ondatachannel = enable_send;

    // add a callback for when ice candidates are created by the peer connection
    pc.onicecandidate = function(ice_event) {
      log('Received new ice candidate');
      if (!ice_event.candidate) {
        log('Description sent to peer: ' + JSON.stringify(pc.localDescription));
        advertise({ type: offer_type, sdp: pc.localDescription.sdp });
      }
    };
  }

  // Logging helpers
  function log(text) {
    console.log(text.replace(/^\s+|\s+$/g, ''));
  }
  function error(err) {
    log('Encountered an error: ' + err);
    pc.close();
  }

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
  function post_json(url, data) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(JSON.stringify(data));
  }

  function recv_msg(ev) {
    if (recv_callback)
      recv_callback(JSON.parse(ev.data));
  }

  function enable_send(evt) {
    comm = (evt.channel || evt.target);

    log('Created a receive data channel - may now receive data from peer.');
    comm.onmessage = recv_msg;

    // stop polling for signaling messages
    clearInterval(__rtc.discover_iid);
    clearInterval(__rtc.offer_iid);
  }

  function advertise(data) {
    post_json("/advertise", { msg: data } );
  }


  // ==========
  // Public API
  // ==========

  this.discover = function() {
    get_json("/discover", function(offer) {
      switch(offer.type) {
        case "offer":
          log('Received an offer: ' + offer.sdp);
          offer_type = "answer";
          pc_reset();
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
          break;
      }
    });
  }

  this.make_offer = function() {
    var pending;
    pc_reset();
    pending = pc.createDataChannel('sendDataChannel', { reliable: true });
    pending.onopen = enable_send;
    pc.createOffer(function(offer) {
      pc.setLocalDescription(new RTCSessionDescription(offer),
                             function() {},
                             function() { error('createOffer - setLocalDescription'); });
    }, function() { error('createOffer'); });
  }

  this.send_obj = function(obj) {
    if (comm) {
      comm.send(JSON.stringify(obj));
    }
  }

  this.recv_obj = function(callback) {
    recv_callback = callback;
  }

}
