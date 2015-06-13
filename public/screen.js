// This file defines the Screen prototype, which implements a portion of the
// View component of this Tetris MVC framework.

var Screen = function() {
  var canvas_container = document.getElementById("board");
  this.canvas = canvas_container.getContext("2d");
  this.status = "much better";

  // Body and border colors for each square
  this.colors = [ "#FFFFFF", "#FF0000", "#00CC00", "#0000FF",
                  "#007F7F", "#7F007F", "#7F7F00", "#999999" ];
  this.strokes = [ "#eFeFeF", "#7F0000", "#006C00", "#00007F",
                   "#003F3F", "#3F003F", "#3F3F00", "#444444" ];
}

// Show the scorecard text
Screen.prototype.draw_scores = function(level, score, lines) {
  var titles = { "Level": level, "Score": score, "Lines": lines };
  var row = 20;

  // First clear the score and next_piece areas
  this.canvas.beginPath();
  this.canvas.strokeStyle = this.strokes[0];
  this.canvas.fillStyle = this.colors[0];
  this.canvas.rect(0, 0, 195, 250);
  this.canvas.fill();
  this.canvas.stroke();

  // Now draw all our text elements
  this.canvas.textBaseline = "top";
  this.canvas.textAlign = "left";
  this.canvas.font = "bold 22px sans-serif";
  this.canvas.strokeStyle = "black";
  this.canvas.fillStyle = "black";
  for (var title in titles) {
    this.canvas.textAlign = "left";
    this.canvas.fillText(title, 10, row);
    this.canvas.textAlign = "right";
    this.canvas.fillText(titles[title], 185, row);
    row += 40;
  }
  this.canvas.stroke();
}

// Draw (or erase) a single square on our board
Screen.prototype.draw_square = function(x, y, color) {
  this.canvas.beginPath();
  this.canvas.lineWidth = 2;
  this.canvas.strokeStyle = this.strokes[color];
  this.canvas.fillStyle = this.colors[color];
  this.canvas.rect(x * 40 + 2 + 200, y * 40 + 2, 36, 36);
  this.canvas.fill();
  this.canvas.stroke();
}

// Draw a miniature version of the next piece
Screen.prototype.draw_next_square = function(x, y, color) {
  this.canvas.beginPath();
  this.canvas.lineWidth = 2;
  this.canvas.strokeStyle = this.strokes[color];
  this.canvas.fillStyle = this.colors[color];
  this.canvas.rect(x * 16 + 41, y * 16 + 177, 13, 13);
  this.canvas.fill();
  this.canvas.stroke();
}
