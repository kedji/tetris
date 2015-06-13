// This file defines the Controller component of the Tetris MVC framework,
// which drives the local game by interpreting keystrokes.

var tscreen = new Screen();
var board = new Board(tscreen);

// Start our game
board.game = setInterval(function() { board.tick(); }, 20);
document.addEventListener("keydown", key_down);

// Read key-strokes (as long as the game is in progress)
function key_down(k) {
  if (!board.game)
    return false;

  if (k.keyCode == 40) {           // down arrow
    board.drop_piece();
    board.draw_board();

  } else if (k.keyCode == 38) {    // up arrow
    if (!board.collides(board.px, board.py, (board.rot + 1) % 4)) {
      board.rot = (board.rot + 1) % 4;
      board.draw_board();
    }

  } else if (k.keyCode == 39) {    // right arrow
    if (!board.collides(board.px + 1, board.py, board.rot)) {
      board.px++;
      board.draw_board();
    }

  } else if (k.keyCode == 37) {    // left arrow
    if (!board.collides(board.px - 1, board.py, board.rot)) {
      board.px--;
      board.draw_board();
    }

  } else if (k.keyCode == 32) {    // [SPACE]
    do {
      board.drop_piece();
    } while (board.py);
    board.draw_board();

  } else if (k.keyCode == 107) {   // [PLUS]
    if (board.level < 16) {
      board.level++;
      tscreen.show_scores(board.level, Math.floor(board.score), board.lines);
    }
  }
}
