// This file defines the Screen prototype, which implements a portion of the
// View component of this Tetris MVC framework.

// Body and border colors for each square
var p_colors = [ "#FFFFFF", "#FF0000", "#00CC00", "#0000FF",
                 "#007F7F", "#7F007F", "#7F7F00", "#999999" ];
var p_strokes = [ "#eFeFeF", "#7F0000", "#006C00", "#00007F",
                  "#003F3F", "#3F003F", "#3F3F00", "#444444" ];

// The primary (local) game board and score section
function MainScreen() {
  var canvas_area = document.getElementById("board")
  var canvas = canvas_area.getContext("2d");
  var block_size = 30;
  canvas_area.width = 208 + block_size * 10;
  canvas_area.height = block_size * 20 + 8;

  // Show the scorecard text
  this.draw_scores = function(level, score, lines) {
    var titles = { "Level": level, "Score": score, "Lines": lines };
    var row = 8;

    // First clear the score and next_piece areas
    canvas.beginPath();
    canvas.strokeStyle = "black";
    canvas.fillStyle = p_colors[0];
    canvas.rect(0, 0, 195, 180);
    canvas.fill();
    canvas.stroke();

    // Now draw all our text elements
    canvas.beginPath();
    canvas.textBaseline = "top";
    canvas.textAlign = "left";
    canvas.font = "bold 22px sans-serif";
    canvas.strokeStyle = "black";
    canvas.fillStyle = "black";
    for (var title in titles) {
      canvas.textAlign = "left";
      canvas.fillText(title, 10, row);
      canvas.textAlign = "right";
      canvas.fillText(titles[title], 185, row);
      row += 32;
    }
    canvas.stroke();
  }

  // Clear the drawing area of the board
  this.clear_board = function() {
    canvas.beginPath();
    canvas.strokeStyle = "black";
    canvas.fillStyle = p_colors[0];
    canvas.rect(200, 0, block_size * 10 + 6, block_size * 20 + 6),
    canvas.fill();
    canvas.stroke();
  }

  // Draw (or erase) a single square on our board
  this.draw_square = function(x, y, color) {
    canvas.beginPath();
    canvas.lineWidth = 2;
    canvas.strokeStyle = p_strokes[color];
    canvas.fillStyle = p_colors[color];
    canvas.rect(x * block_size + 2 + 203, y * block_size + 5,
                block_size - 4, block_size - 4);
    canvas.fill();
    canvas.stroke();
  }

  // Draw a miniature version of the next piece
  this.draw_next_square = function(x, y, color) {
    canvas.beginPath();
    canvas.lineWidth = 2;
    canvas.strokeStyle = p_strokes[color];
    canvas.fillStyle = p_colors[color];
    canvas.rect(x * 16 + 41, y * 16 + 110, 13, 13);
    canvas.fill();
    canvas.stroke();
  }
}

// The secondary (peer) game board and score section
function MiniScreen() {
  var canvas_area = document.getElementById("board")
  var canvas = canvas_area.getContext("2d");
  var top_edge = 190;

  // Show the scorecard text
  this.draw_scores = function(level, score, lines) {
    var titles = { "Level": level, "Score": score, "Lines": lines };
    var row = top_edge + 352;

    // First clear the score area
    canvas.beginPath();
    canvas.strokeStyle = p_strokes[0];
    canvas.fillStyle = p_colors[0];
    canvas.rect(0, row - 6, 195, 70);
    canvas.fill();
    canvas.stroke();

    // Now draw all our text elements
    canvas.textBaseline = "top";
    canvas.textAlign = "left";
    canvas.font = "bold 16px sans-serif";
    canvas.strokeStyle = "black";
    canvas.fillStyle = "black";
    for (var title in titles) {
      canvas.textAlign = "left";
      canvas.fillText(title, 10, row);
      canvas.textAlign = "right";
      canvas.fillText(titles[title], 185, row);
      row += 20;
    }
    canvas.stroke();
  }

  // Draw a miniature version of a board square
  this.draw_square = function(x, y, color) {
    canvas.beginPath();
    canvas.lineWidth = 2;
    canvas.strokeStyle = p_strokes[color];
    canvas.fillStyle = p_colors[color];
    canvas.rect(x * 16 + 15, y * 16 + top_edge + 7, 13, 13);
    canvas.fill();
    canvas.stroke();
  }

  // Clear the drawing area of the mini board
  this.clear_board = function() {
    canvas.beginPath();
    canvas.strokeStyle = p_colors[0];
    canvas.fillStyle = p_colors[0];
    canvas.rect(12, top_edge + 4, 164, 324);
    canvas.fill();
    canvas.stroke();
  }

  // No next piece for the mini-board
  this.draw_next_square = function(x, y, color) { }
}
