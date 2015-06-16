// This file defines the Controller component of the Tetris MVC framework,
// which drives the local game by interpreting keystrokes.

var rtc = new TetRTC();
var tscreen = new Screen();
var board = new Board(tscreen);
var peer = new Board(tscreen);

// Register our RTC timers
rtc.discover_iid = setInterval(function() { rtc.discover(); }, 1000);
rtc.offer_iid = setInterval(function() { rtc.make_offer(); }, 4260);

// Handle incoming messages from our peer
peer.alt = true;
rtc.recv_obj(incoming_peer_state);

// Start our game
board.game = setInterval(function() { board.tick(); update_peer(); }, 20);
document.addEventListener("keydown", key_down);

// Read key-strokes (as long as the game is in progress)
function key_down(k) {
  if (!board.game)
    return false;

  if (k.keyCode == 40) {           // down arrow
    board.drop_piece();
    board.draw_board();

  } else if (k.keyCode == 38) {    // up arrow
    board.piece_rotate();

  } else if (k.keyCode == 39) {    // right arrow
    board.piece_right();

  } else if (k.keyCode == 37) {    // left arrow
    board.piece_left();

  } else if (k.keyCode == 32) {    // [SPACE]
    do {
      board.drop_piece();
    } while (board.py);
    board.draw_board();

  } else if (k.keyCode == 107) {   // [PLUS]
    if (board.level < 16) {
      board.level++;
      board.show_scores();
    }
  }
  update_peer();
}

// Check to see if any piece/board updates need to be sent to our peer (and if
// so, send them).
function update_peer() {
  var update = board.board_update();
  if (update)
    rtc.send_obj(update)
  update = board.piece_update();
if (update) { console.log("sending: " + JSON.stringify(update)); }
  if (update)
    rtc.send_obj(update)
}

function incoming_peer_state(obj) {
  peer.peer_update(obj);
}
