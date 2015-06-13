    var canvas = document.getElementById("board");
    var ctx = canvas.getContext("2d");
    canvas = document.getElementById("score");
    stx = canvas.getContext("2d");
    var colors = [ "#FFFFFF", "#FF0000", "#00CC00", "#0000FF",
                   "#007F7F", "#7F007F", "#7F7F00", "#999999" ];
    var strokes = [ "#FFFFFF", "#7F0000", "#006C00", "#00007F",
                    "#003F3F", "#3F003F", "#3F3F00", "#444444" ];
    var shapes = [ [ [ [ 1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 2, 1 ] ],     //
                     [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 1 ] ],     //    #
                     [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 1, 2 ] ],     //   ###
                     [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 1 ] ] ],   //
                   [ [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ],     //
                     [ [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 2 ] ],     //   ##
                     [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ],     //    ##
                     [ [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 2 ] ] ],   //
                   [ [ [ 1, 0 ], [ 2, 0 ], [ 0, 1 ], [ 1, 1 ] ],     //
                     [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 2 ] ],     //    ##
                     [ [ 1, 0 ], [ 2, 0 ], [ 0, 1 ], [ 1, 1 ] ],     //   ##
                     [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 2 ] ] ],   //
                   [ [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],     //
                     [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],     //   ##
                     [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ],     //   ##
                     [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ] ],   //
                   [ [ [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ] ],     //    #
                     [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 3, 2 ] ],     //    #
                     [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ 1, 3 ] ],     //   ##
                     [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 2, 2 ] ] ],   //
                   [ [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 2 ] ],     //   #
                     [ [ 1, 2 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ],     //   #
                     [ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 2, 3 ] ],     //   ##
                     [ [ 0, 2 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ] ],   //
                   [ [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ] ],     //    #
                     [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ],     //    #
                     [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ] ],     //    #
                     [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ] ] ] ]  //    #
    var board = [];
    var col, row, px, py, rot;
    var shape = 0, nextShape = 0;
    var level = 1, lines = 0, score = 0;
    var dropTicks = 13 - level;
    var sq, iid;
    nextPiece();
    nextPiece(); 
    for (col = 0; col < 10; col++) {
      board[col] = [];
      for (row = 0; row < 20; row++)
        board[col][row] = 0;
    }
    function nextPiece() {
      shape = nextShape;
      nextShape = Math.floor(Math.random() * 7);
      px = 4;
      py = 0;
      rot = 0;
      if (Math.floor(lines / 10) >= level)
        level = Math.floor(lines / 10) + 1;
      showScore();
    }
    function drawSquare(x, y, color) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokes[color];
      ctx.fillStyle = colors[color];
      ctx.rect(x * 40 + 2, y * 40 + 2, 36, 36);
      ctx.fill();
      ctx.stroke();
    }
    function collides(x, y, r) {
      for (sq = 0; sq < 4; sq++) {
        xx = x + shapes[shape][r][sq][0];
        yy = y + shapes[shape][r][sq][1];
        if (yy >= 0 && (xx < 0 || xx > 9 || yy > 19 || board[xx][yy]))
          return 1;
      }
      return 0;
    }
    function dropPiece() {
      var xx;
      var yy;
      if (collides(px, py + 1, rot)) {
        for (sq = 0; sq < 4; sq++) {
          xx = px + shapes[shape][rot][sq][0];
          yy = py + shapes[shape][rot][sq][1];
          board[xx][yy] = shape + 1;
        }
        clearLines();
        nextPiece();
        if (collides(px, py, rot)) {  // Game over
          clearInterval(iid);
        }
      } else {
        py++;
      }
      if (dropTicks >= 2)
        score += Math.pow(level, 0.5) / 8;
      dropTicks = Math.floor(Math.pow(0.88, level) * 50);
      if (dropTicks < 5)
        dropTicks = 5;
    }
    function clearLines() {
      var y;
      var newLines = 0;
      for (row = 0; row < 20; row++) {
        sq = 1;
        for (col = 0; col < 10; col++)
          sq *= board[col][row];
        if (sq) {
          for (y = row; y > 0; y--) {
            for (col = 0; col < 10; col++)
              board[col][y] = board[col][y - 1];
          }
          newLines++;
        }
      }
      if (newLines) {
        lines += newLines;
        dropTicks++;
        score += newLines * newLines * (100 + level * level);
      }
    }
    function drawBoard(redraw) {
      var p;
      if (!redraw) {
        if (dropTicks < 1) {
          dropPiece();
          redraw = 1;
        } else {
          dropTicks--;
        }
      }
      if (redraw) {
        for (col = 0; col < 10; col++) {
          for (row = 0; row < 20; row++) {
            p = 0;
            for (sq = 0; sq < 4; sq++) {
              if (col == px + shapes[shape][rot][sq][0] &&
                  row == py + shapes[shape][rot][sq][1]) {
                p = 1;
              }
            }
            if (p)
              drawSquare(col, row, shape + 1);
            else
              drawSquare(col, row, board[col][row]);
          }
        }
      }
    }
    function keyDown(k) {
      var redraw = 0;
      if (k.keyCode == 40) {
        dropPiece();
        redraw = 1;
      } else if (k.keyCode == 38) {
        if (!collides(px, py, (rot + 1) % 4)) {
          rot = (rot + 1) % 4;
          redraw = 1;
        }
      } else if (k.keyCode == 39) {
        if (!collides(px + 1, py, rot)) {
          px++;
          redraw = 1;
        }
      } else if (k.keyCode == 37) {
        if (!collides(px - 1, py, rot)) {
          px--;
          redraw = 1;
        }
      } else if (k.keyCode == 32) {
        do {
          dropPiece();
        } while (py);
        redraw = 1;
      } else if (k.keyCode == 107) {
        if (level < 16)
          level++;
        showScore();
      }
      if (redraw) {
        dropTicks++;
        drawBoard(1);
      }
    }
    function showScore() {
      canvas = document.getElementById("score");
      canvas.width = canvas.width;  // resets the canvas
      stx.textBaseline = "top";
      stx.textAlign = "left";
      stx.font = "bold 22px sans-serif";
      var titles = { "Level": level,
                     "Score": Math.floor(score),
                     "Lines": lines };
      row = 20;
      for (sq in titles) {
        stx.textAlign = "left";
        stx.fillText(sq, 10, row);
        stx.textAlign = "right";
        stx.fillText(titles[sq], 185, row);
        row += 40;
      }
      for (sq = 0; sq < 4; sq++) {
        drawTinySquare(stx, shapes[nextShape][0][sq][0] + 5,
                            shapes[nextShape][0][sq][1] + 11, nextShape + 1);
      }
    }
    function drawTinySquare(context, x, y, color) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = strokes[color];
      context.fillStyle = colors[color];
      context.rect(x * 16 + 1.5, y * 16 + 1.5, 13, 13);
      context.fill();
      context.stroke();
    }
    iid = setInterval(function() { drawBoard(0); }, 20);
    document.addEventListener("keydown", keyDown);
