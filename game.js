function createBoard(cellsAcross, cellsDown) {
  return {
    mines: createMines(cellsAcross, cellsDown),
    cellsAcross: cellsAcross,
    cellsDown: cellsDown
  };
};

function draw(screen, board) {
  drawCells(screen, board);
};

function cellDimensions(canvas, board) {
  return {
    w: canvas.width / board.cellsAcross,
    h: canvas.height / board.cellsDown
  };
};

function cellPosition(canvas, board, cell) {
  var d = cellDimensions(canvas, board);
  d.x = cell.refX * d.w;
  d.y = cell.refY * d.h;
  return d;
};

function drawCells(screen, board) {
  boardToCells(board).forEach(function(cell) {
    drawCell(screen, board, cell);
  });
};

function drawCell(screen, board, cell) {
  var p = cellPosition(screen.canvas, board, cell);
  screen.strokeRect(p.x, p.y, p.w, p.h);
  if (cell.contents === "m") {
    drawMine(screen, p);
  }
};

function eventCoordinates(e) {
  return { x: e.pageX, y: e.pageY };
};

function drawMine(screen, d) {
  var blackColor = 'rgba(0, 0, 0, 1)';
  var color2 = 'rgba(0, 0, 0, 1)';
  var color3 = 'rgba(255, 255, 255, 1)';

  oval(screen, d.x, d.y, d.w, d.h);
  screen.fillStyle = color2;
  screen.fill();
  screen.strokeStyle = blackColor;
  screen.lineWidth = 1;
  screen.stroke();

  oval(screen, d.x + 2, d.y + 2, 4, 4);
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
        c.contents = "m";
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

function neighborReferences(board, cellReference) {
  function inBounds(r) {
    return r.refX >= 0 && r.refX < board.cellsAcross &&
      r.refY >= 0 && r.refY < board.cellsDown;
  };

  function same(r1, r2) {
    return r1.refX === r2.refX &&
      r1.refY === r2.refY;
  };

  var neighbors = [];
  for (var y = -1; y < 2; y++) {
    for (var x = -1; x < 2; x++) {
      var neighborReference = {
        refX: cellReference.refX + x,
        refY: cellReference.refY + y
      };

      if (inBounds(neighborReference) &&
          !same(neighborReference, cellReference)) {
        neighbors.push(neighborReference);
      }
    }
  }

  return neighbors;
};

function emitCellClickedEvent(cellReference, board) {
  log(neighborReferences(board, cellReference));
  if (cellKey(cellReference) in board.mines) {
    console.log("boom")
  }
};

function setupEvents(canvas, board) {
  var d = cellDimensions(canvas, board);
  canvas.addEventListener("mouseup", function(e) {
    var c = eventCoordinates(e);
    var refX = ~~(c.x / d.w);
    var refY = ~~(c.y / d.h);
    emitCellClickedEvent({ refX: refX, refY: refY }, board);
  });
};

var MINE_CHANCE = 0.1;
window.addEventListener("load", function() {
  var screen = document.getElementById("screen").getContext("2d");
  var board = createBoard(20, 20);
  setupEvents(screen.canvas, board);
  draw(screen, board);
});
