// This file defines the Board prototype, which implements the Model component
// of this Tetris MVC framework.

var Board = function(tscreen) {
  this.tscreen = tscreen;

  // X and Y coordinates of the 4 squares of each of the 7 tetrominos
  // Index by: shapes[shape 0-6][rotation 0-4][square 0-4][axis 0-1]
  this.shapes =
      [ [ [ [ 1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 2, 1 ] ],      //
          [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 1 ] ],      //    #
          [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 1, 2 ] ],      //   ###
          [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 1 ] ] ],    //
        [ [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ],      //
          [ [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 2 ] ],      //   ##
          [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ],      //    ##
          [ [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 2 ] ] ],    //
        [ [ [ 1, 0 ], [ 2, 0 ], [ 0, 1 ], [ 1, 1 ] ],      //
          [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 2 ] ],      //    ##
          [ [ 1, 0 ], [ 2, 0 ], [ 0, 1 ], [ 1, 1 ] ],      //   ##
          [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 2 ] ] ],    //
        [ [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],      //
          [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],      //   ##
          [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],      //   ##
          [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ] ],    //
        [ [ [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ] ],      //    #
          [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 3, 2 ] ],      //    #
          [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ 1, 3 ] ],      //   ##
          [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 2, 2 ] ] ],    //
        [ [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 2 ] ],      //   #
          [ [ 1, 2 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ],      //   #
          [ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 2, 3 ] ],      //   ##
          [ [ 0, 2 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ] ],    //
        [ [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ] ],      //    #
          [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ],      //    #
          [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ] ],      //    #
          [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ] ] ];  //    #

  // Squares semi-permanently locked into the board
  this.board = [];
  for (var col = 0; col < 10; col++) {
    this.board[col] = [];
    for (var row = 0; row < 20; row++)
      this.board[col][row] = 0;
  }

  // Stats
  this.level = 1;
  this.score = 0;
  this.lines = 0;

  // The current and upcoming tetromino shapes and positions
  this.shape = 0;
  this.next_shape = Math.floor(Math.random() * 7);
  this.px = 4;   // left-most position of the current piece on the board
  this.py = 0;   // top-most position of the current piece
  this.rot = 0;  // current piece rotation
  this.next_piece();

  // Real-time gameplay
  this.drop_ticks = 0;         // intervals before next auto-drop
  this.game = false;           // doubles as setInterval identifier

  // State change indicators for multiplayer mode
  this.piece_obj = null;       // gets updated every time a piece moves
  this.board_obj = null;       // gets updated every time a line is cleared
}

// Pick an upcoming random piece, reset the current piece stats
Board.prototype.next_piece = function() {
  this.shape = this.next_shape;
  this.next_shape = Math.floor(Math.random() * 7);
  this.px = 4;
  this.py = 0;
  this.rot = 0;

  // Update the view of the scores and the next piece
  this.show_scores();
  var pos;
  for (var sq = 0; sq < 4; sq++) {
    pos = this.shapes[this.next_shape][0][sq];
    this.tscreen.draw_next_square(pos[0], pos[1], this.next_shape + 1);
  }
  this.board_share();
}

// Check for a piece collision assuming the given top-left x and y positions
// and the given rotation.
Board.prototype.collides = function(x, y, r) {
  var xx, yy;
  for (var sq = 0; sq < 4; sq++) {
    xx = x + this.shapes[this.shape][r][sq][0];
    yy = y + this.shapes[this.shape][r][sq][1];
    if (yy >= 0 && (xx < 0 || xx > 9 || yy > 19 || this.board[xx][yy]))
      return 1;
  }
  return 0;
}

// Drop a piece down one row; lock the piece in place and scan for completed
// lines if a drop would cause a collision.
Board.prototype.drop_piece = function() {
  var xx, yy, sq;
  if (this.collides(this.px, this.py + 1, this.rot)) {
    for (sq = 0; sq < 4; sq++) {
      xx = this.px + this.shapes[this.shape][this.rot][sq][0];
      yy = this.py + this.shapes[this.shape][this.rot][sq][1];
      this.board[xx][yy] = this.shape + 1;
    }
    yy = this.clear_lines();
    this.next_piece();
    if (yy > 2)
      this.board_obj.attack = yy - 2;

    // Check for game over
    if (this.collides(this.px, this.py, this.rot)) {
      clearInterval(this.game);
      this.game = false;
    }
  } else {
    this.py++;
  }
  this.piece_share();

  // If the piece was dropped manually and early enough, reward the player with
  // a few extra points.
  if (this.drop_ticks > 2)
    this.score += Math.pow(this.level, 0.5) / 8;

  // Give 12% less time before next auto-drop for each level
  this.drop_ticks = Math.floor(Math.pow(0.88, this.level) * 50);
  if (this.drop_ticks < 5)
    this.drop_ticks = 5;
}

// Find completely full horizonal rows and eliminate them. Return
// the number of rows cleared at once.
Board.prototype.clear_lines = function() {
  var y, new_lines = 0, row, col;
  for (row = 0; row < 20; row++) {
    sq = 1;
    for (col = 0; col < 10; col++)
      sq *= this.board[col][row];
    if (sq) {
      for (y = row; y > 0; y--) {
        for (col = 0; col < 10; col++)
          this.board[col][y] = this.board[col][y - 1];
      }
      new_lines++;
    }
  }

  if (new_lines) {
    this.lines += new_lines;
    this.score += new_lines * new_lines * (100 + this.level * this.level);
    if (Math.floor(this.lines / 10) >= this.level)
      this.level = Math.floor(this.lines / 10) + 1;
  }
  return new_lines;
}

Board.prototype.draw_board = function() {
  var col, row, sq, p;
  var bak = [];

  // Temporarily super-impose current piece onto the board
  for (sq = 0; sq < 4; sq++) {
    p = this.shapes[this.shape][this.rot][sq];
    bak[sq] = this.board[this.px + p[0]][this.py + p[1]];
    this.board[this.px + p[0]][this.py + p[1]] = this.shape + 1;
  }

  // Draw every square on the board, even empty squares
  this.tscreen.clear_board();
  for (col = 0; col < 10; col++) {
    for (row = 0; row < 20; row++)
      this.tscreen.draw_square(col, row, this.board[col][row]);
  }

  // Revert our super-imposed current piece
  for (sq = 0; sq < 4; sq++) {
    p = this.shapes[this.shape][this.rot][sq];
    this.board[this.px + p[0]][this.py + p[1]] = bak[sq];
  }
}

Board.prototype.tick = function() {
  this.drop_ticks--;
  if (this.drop_ticks < 1) {
    this.drop_piece();
    this.draw_board();
  }
}

// Tell the view to report the level, score, and line count
Board.prototype.show_scores = function() {
  this.tscreen.draw_scores(this.level, Math.floor(this.score), this.lines);
}

// Move the piece in the given manner (if possible)
Board.prototype.piece_left = function() {
  if (!this.collides(this.px - 1, this.py, this.rot)) {
    this.px--;
    this.draw_board();
    this.piece_share();
  }
}

Board.prototype.piece_right = function() {
  if (!this.collides(this.px + 1, this.py, this.rot)) {
    this.px++;
    this.draw_board();
    this.piece_share();
  }
}

Board.prototype.piece_rotate = function() {
  if (!this.collides(this.px, this.py, (this.rot + 1) % 4)) {
    this.rot = (this.rot + 1) % 4;
    this.draw_board();
    this.piece_share();
  }
}

// Add garbage lines to the bottom of our board.
Board.prototype.add_attack_lines = function(lines) {
  var x, y;
  if (this.py > 0)
    this.py--;

  // Shift all pieces up one notch
  for (x = 0; x < 10; x++) {
    for (y = 1; y < 20; y++)
      this.board[x][y - 1] = this.board[x][y];
  }

  // Fill and then randomly gap-ify the bottom row
  for (x = 0; x < 10; x++)
    this.board[x][19] = Math.floor(Math.random() * 7) + 1;
  for (x = Math.floor(Math.random() * 7) + 2; x < 10; x++)
    this.board[Math.floor(Math.random() * 10)][19] = 0;

  // Recurse to add any additional lines
  if (lines > 1) {
    this.add_attack_lines(lines - 1);
  } else {
    this.draw_board();
    this.board_share();
  }
}

// Provide an object representing the state of the board, not including
// the current piece, but including level, lines, and score.
Board.prototype.board_share = function() {
  this.board_obj = {
    board: this.board,
    level: this.level,
    lines: this.lines,
    score: Math.floor(this.score),
  };
  return this.board_obj;
}

// Provide an object containing a small "tactical" update to the board - the
// location and rotation of the current piece and the number of lines that
// need to be added to your opponent's board.
Board.prototype.piece_share = function() {
  this.piece_obj = {
    shape: this.shape,
    rot: this.rot,
    x: this.px,
    y: this.py
  }
  return this.piece_obj;
}

// If the board has a piece-movement update, this function will return a
// descriptive object to that effect. Otherwise it will return null.
Board.prototype.piece_update = function() {
  var ret = this.piece_obj;
  this.piece_obj = null;
  return ret;
}

// If the board has a board content update, this function will return a
// descriptive object to that effect. Otherwise it will return null.
Board.prototype.board_update = function() {
  var ret = this.board_obj;
  this.board_obj = null;
  return ret;
}

// Update this board with content from our peer.
Board.prototype.peer_update = function(update) {
  if (update.lines != undefined)  this.lines = update.lines;
  if (update.score != undefined)  this.score = update.score;
  if (update.level != undefined)  this.level = update.level;
  if (update.board != undefined)  this.board = update.board;
  if (update.shape != undefined)  this.shape = update.shape;
  if (update.rot != undefined)    this.rot   = update.rot;
  if (update.x != undefined)      this.px    = update.x;
  if (update.y != undefined)      this.py    = update.y;

  // Only redraw on incoming piece messages, since otherwise we may be
  // redrawing with old piece information.
  if (update.shape != undefined)
    this.draw_board();

  // Redraw the score information if we've gotten a full update
  if (update.board != undefined)
    this.tscreen.draw_scores(this.level, this.score, this.lines);
}
