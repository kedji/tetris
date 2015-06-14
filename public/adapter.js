// Copyright (c) 2014, The WebRTC project authors. All rights reserved.
// Original source:  https://github.com/webrtc/adapter.js

var RTCPeerConnection = getUserMedia = null;
var attachMediaStream = reattachMediaStream = null;
var webrtcDetectedBrowser = webrtcDetectedVersion = null;

if (navigator.mozGetUserMedia) {
  console.log("Browser appears to be Firefox");

  webrtcDetectedBrowser = "firefox";
  webrtcDetectedVersion = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);
  RTCPeerConnection = mozRTCPeerConnection;
  RTCSessionDescription = mozRTCSessionDescription;
  RTCIceCandidate = mozRTCIceCandidate;
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function() { return []; };
  MediaStream.prototype.getAudioTracks = function() { return []; };

} else if (navigator.webkitGetUserMedia) {
  console.log("Browser appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion = parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
  RTCPeerConnection = webkitRTCPeerConnection;
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') { element.srcObject = stream; }
    else if (typeof element.mozSrcObject !== 'undefined') { element.mozSrcObject = stream; }
    else if (typeof element.src !== 'undefined') { element.src = URL.createObjectURL(stream); }
    else { console.log('Error attaching stream to element.'); }
  };

  reattachMediaStream = function(to, from) { to.src = from.src; };

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function() { return this.videoTracks; };
    webkitMediaStream.prototype.getAudioTracks = function() { return this.audioTracks; };
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function() { return this.localStreams; };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function() { return this.remoteStreams; };
  }

} else {
  console.log("Browser does not appear to be WebRTC-capable");
}
