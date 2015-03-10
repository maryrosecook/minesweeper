function createBoard(cellsAcross, cellsDown) {
  return {
    cells: generateCells(cellsAcross, cellsDown),
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
  var cells = board.cells;
  Object.keys(cells).forEach(function(cellKey) {
    var p = cellPosition(screen.canvas, board, cellKeyToReference(cellKey));
    screen.strokeRect(p.x, p.y, p.w, p.h);
    var cellContents = cells[cellKey];
    if (cellContents === "m") {
      drawMine(screen, p);
    } else {
      screen.strokeText(cellContents,
                        p.x + p.w / 2,
                        p.y + p.h / 2);
    }
  });
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

function cellKeyToReference(cellKey) {
  var refs = cellKey.split(":");
  return { refX: parseInt(refs[0], 10), refY: parseInt(refs[1], 10) };
};

function generateCells(cellsAcross, cellsDown) {
  var mineKeys = [];
  for (var i = 0; i < cellsAcross * cellsDown; i++) {
    if (Math.random() < MINE_CHANCE) {
      mineKeys.push(cellKey({ refX: i % cellsDown, refY: ~~(i / cellsAcross) }));
    }
  }

  return mineKeys.reduce(function(memo, mineKey) {
    memo[mineKey] = "m";
    neighborReferences(cellsAcross, cellsDown, mineKey)
      .forEach(function(neighborReference) {
        var neighborKey = cellKey(neighborReference);
        if (memo[neighborKey] !== "m") {
          memo[neighborKey] = memo[neighborKey] || 0;
          memo[neighborKey] += 1;
        }
      });

    return memo;
  }, {});
};

function boardSizeToCells(cellsAcross, cellsDown) {
  var cells = [];

  for (var refY = 0; refY < cellsAcross; refY++) {
    for (var refX = 0; refX < cellsDown; refX++) {
      cells.push({ refX: refX, refY: refY });
    }
  }

  return cells;
};

function possiblyGenerateMine(cell) {
  if (Math.random() < MINE_CHANCE) {
    cell.contents = "m";
  }
};

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

function neighborReferences(cellsAcross, cellsDown, cellKey) {
  function inBounds(r) {
    return r.refX >= 0 && r.refX < cellsAcross &&
      r.refY >= 0 && r.refY < cellsDown;
  };

  function same(r1, r2) {
    return r1.refX === r2.refX &&
      r1.refY === r2.refY;
  };

  var cellReference = cellKeyToReference(cellKey);
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
