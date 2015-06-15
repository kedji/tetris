// This file defines the Screen prototype, which implements a portion of the
// View component of this Tetris MVC framework.

function Screen () {
  var canvas_area = document.getElementById("board")
  var canvas = canvas_area.getContext("2d");
  var block_size = 30;
  canvas_area.width = 200 + block_size * 10;
  canvas_area.height = block_size * 20;

  // Body and border colors for each square
  var colors = [ "#FFFFFF", "#FF0000", "#00CC00", "#0000FF",
                 "#007F7F", "#7F007F", "#7F7F00", "#999999" ];
  var strokes = [ "#eFeFeF", "#7F0000", "#006C00", "#00007F",
                  "#003F3F", "#3F003F", "#3F3F00", "#444444" ];

  // Show the scorecard text
  this.draw_scores = function(level, score, lines) {
    var titles = { "Level": level, "Score": score, "Lines": lines };
    var row = 16;

    // First clear the score and next_piece areas
    canvas.beginPath();
    canvas.strokeStyle = strokes[0];
    canvas.fillStyle = colors[0];
    canvas.rect(0, 0, 195, 250);
    canvas.fill();
    canvas.stroke();

    // Now draw all our text elements
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
      row += 40;
    }
    canvas.stroke();
  }

  // Draw (or erase) a single square on our board
  this.draw_square = function(x, y, color) {
    canvas.beginPath();
    canvas.lineWidth = 2;
    canvas.strokeStyle = strokes[color];
    canvas.fillStyle = colors[color];
    canvas.rect(x * block_size + 2 + 200, y * block_size + 2,
                block_size - 4, block_size - 4);
    canvas.fill();
    canvas.stroke();
  }

  // Draw a miniature version of the next piece
  this.draw_next_square = function(x, y, color) {
    canvas.beginPath();
    canvas.lineWidth = 2;
    canvas.strokeStyle = strokes[color];
    canvas.fillStyle = colors[color];
    canvas.rect(x * 16 + 41, y * 16 + 177, 13, 13);
    canvas.fill();
    canvas.stroke();
  }
}
