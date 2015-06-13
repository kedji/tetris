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
  this.next_piece();

  // Real-time gameplay
  this.drop_ticks = 0;       // intervals before next auto-drop
  this.rot = 0;              // current piece rotation
  this.game = false;         // doubles as setInterval identifier
}

// Pick an upcoming random piece, reset the current piece stats
Board.prototype.next_piece = function() {
  this.shape = this.next_shape;
  this.next_shape = Math.floor(Math.random() * 7);
  this.px = 4;
  this.py = 0;
  this.rot = 0;

  // Update the view of the scores and the next piece
  this.tscreen.show_scores(this.level, Math.floor(this.score), this.lines);
  var pos;
  for (var sq = 0; sq < 4; sq++) {
    pos = this.shapes[this.next_shape][0][sq];
    tscreen.draw_next_square(pos[0], pos[1], this.next_shape + 1);
  }
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
    this.clear_lines();
    this.next_piece();

    // Check for game over
    if (this.collides(this.px, this.py, this.rot)) {
      clearInterval(this.game);
      this.game = false;
    }
  } else {
    this.py++;
  }

  // If the piece was dropped manually and early enough, reward the player with
  // a few extra points.
  if (this.drop_ticks > 2)
    this.score += Math.pow(this.level, 0.5) / 8;

  // Give 12% less time before next auto-drop for each level
  this.drop_ticks = Math.floor(Math.pow(0.88, this.level) * 50);
  if (this.drop_ticks < 5)
    this.drop_ticks = 5;
}

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
}

Board.prototype.draw_board = function() {
  var col, row, sq, p;

  // Temporarily super-impose current piece onto the board
  for (sq = 0; sq < 4; sq++) {
    p = this.shapes[this.shape][this.rot][sq];
    this.board[this.px + p[0]][this.py + p[1]] = this.shape + 1;
  }

  // Draw every square on the board, even empty squares
  for (col = 0; col < 10; col++) {
    for (row = 0; row < 20; row++)
      tscreen.draw_square(col, row, this.board[col][row]);
  }

  // Revert our super-imposed current piece
  for (sq = 0; sq < 4; sq++) {
    p = this.shapes[this.shape][this.rot][sq];
    this.board[this.px + p[0]][this.py + p[1]] = 0;
  }
}

Board.prototype.tick = function() {
  this.drop_ticks--;
  if (this.drop_ticks < 1) {
    this.drop_piece();
    this.draw_board();
  }
}
