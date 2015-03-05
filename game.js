function createBoard(cellsAcross, cellsDown) {
  return {
    mines: createMines(cellsAcross, cellsDown),
    cellsAcross: cellsAcross,
    cellsDown: cellsDown
  };
};

function draw(screen, board) {
  drawFrame(screen);
  drawCells(screen, board);
  drawMine(screen);
};

function drawFrame(screen) {
  var screenSize = {
    x: screen.canvas.width,
    y: screen.canvas.height
  };

  screen.strokeRect(0, 0, screenSize.x, screenSize.y);
};

function drawCells(screen, board) {
  var w = screen.canvas.width / board.cellsAcross;
  var h = screen.canvas.height / board.cellsDown;
  boardToCells(board).forEach(function(cell) {
    var x = cell.refX;
    var y = cell.refY;
    screen.strokeRect(x * w, y * h, w, h);
  });
};

function drawMine(screen) {
  var blackColor = 'rgba(0, 0, 0, 1)';
  var color2 = 'rgba(0, 0, 0, 1)';
  var color3 = 'rgba(255, 255, 255, 1)';

  var x = 2;
  var y = 2;
  var w = 16;
  var h = 16;


  oval(screen, x, y, w, h);
  screen.fillStyle = color2;
  screen.fill();
  screen.strokeStyle = blackColor;
  screen.lineWidth = 1;
  screen.stroke();

  oval(screen, x + 2, y + 2, 4, 4);
  screen.fillStyle = color3;
  screen.fill();
  screen.strokeStyle = blackColor;
  screen.lineWidth = 1;
  screen.stroke();
};

function oval(screen, x, y, w, h) {
  screen.save();
  screen.beginPath();
  screen.translate(x, y);
  screen.scale(w/2, h/2);
  screen.arc(1, 1, 1, 0, 2*Math.PI, false);
  screen.closePath();
  screen.restore();
};

function cellKey(cell) {
  return cell.refX + ":" + cell.refY;
};

function boardToCells(board) {
  return boardSizeToCellGridReferences(board.cellsAcross, board.cellsDown)
    .map(function(c) {
      if (cellKey(c) in board.mines) {
        c.contents = "b";
      } else {
        c.contents = " ";
      }

      return c;
    });
};

function boardSizeToCellGridReferences(cellsAcross, cellsDown) {
  var gridReferences = [];

  for (var refY = 0; refY < cellsAcross; refY++) {
    for (var refX = 0; refX < cellsDown; refX++) {
      gridReferences.push({ refX: refX, refY: refY });
    }
  }

  return gridReferences;
}

function createMines(cellsAcross, cellsDown) {
  return boardSizeToCellGridReferences(cellsAcross, cellsDown)
    .reduce(function(memo, cell) {
      if (Math.random() < MINE_CHANCE) {
        memo[cellKey(cell)] = true;
      }
      return memo;
    }, {});
};

function log(obj) {
  console.log(JSON.stringify(obj));
};

var MINE_CHANCE = 0.1;
window.addEventListener("load", function() {
  var screen = document.getElementById("screen").getContext("2d");
  var board = createBoard(20, 20);
  draw(screen, board);
});
