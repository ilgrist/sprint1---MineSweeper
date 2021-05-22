'use-strict';

function createCell() {
  var cell = {
    isMine: false,
    isMarked: false,
    minesAroundCount: 0,
    isShown: false,
  };
  return cell;
}

function clickedCell(i, j, ev) {
  var coords = { i, j };
  if (!gGame.isOn) return;
  if (gGame.isFirstClick) onFirstClick(coords);
  if (gGame.isHintModeOn) revealHint(coords);
  var cell = gBoard[coords.i][coords.j];

  if (ev.button === 2) {
    if (cell.isShown) return;
    disableChromeRClick();
    toggleMark(coords);
  }

  if (ev.button === 0) {
    if (cell.isMarked) return;
    if (cell.isMine) {
      if (gGame.lives > 1) {
        clickedMine(coords);
        return;
      } else {
        // debugger;
        gameOver();
        return;
      }
    }
    showCells(coords);
  }
  checkIfVictory();
}

function clickedMine(coords) {
  renderSmiley(SMILEY_EXPLODE);
  var elCell = getElCell(coords.i, coords.j);
  elCell.classList.add('clickedMine');
  setTimeout(function () {
    renderSmiley(SMILEY_NORMAL);
    elCell.classList.remove('clickedMine');
  }, 1000);
  updateRenderLives(-1);
}

function onFirstClick(coords) {
  gGame.isFirstClick = false;
  placeUpdateMines(coords);
  renderBoard();
  startTimer();
}

// checks if isShown toggles isMarked, makes cell unresponsive to left-click
function toggleMark(coords) {
  if (!gGame.isOn) return;
  var elCell = getElCell(coords.i, coords.j);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isShown) return;
  if (!cell.isMarked && !gGame.flags) return;
  // modal
  cell.isMarked = cell.isMarked ? false : true;
  if (cell.isMarked && cell.isMine) gGame.unmarkedMines--;
  if (!cell.isMarked && cell.isMine) gGame.unmarkedMines++;
  // dom
  cell.isMarked ? renderUpdateFlags(-1) : renderUpdateFlags(1);
  var cellValue = cell.isMarked ? MARK : '';
  elCell.innerHTML = getCellHTML(cellValue);
}

// show all empty cells around the given elCell, excluding mines
function showCells(coords) {
  var cell = gBoard[coords.i][coords.j];
  showCell(coords);
  if (!cell.minesAroundCount) {
    for (var i = coords.i - 1; i <= coords.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = coords.j - 1; j <= coords.j + 1; j++) {
        if (i === coords.i && j === coords.j) continue;
        if (j < 0 || j >= gBoard[i].length) continue;
        currCell = gBoard[i][j];
        currCoords = { i, j };
        if (currCell.isMine) continue;
        if (currCell.isShown) continue;
        showCells(currCoords);
      }
    }
  }
}

function setNegs(coords, funcName) {
  for (var i = coords.i - 1; i <= coords.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = coords.j - 1; j <= coords.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var currCoords = { i, j };
      funcName(currCoords);
    }
  }
}

//checks is isMarked reveals the cell innerText
function showCell(coords) {
  var elCell = getElCell(coords.i, coords.j);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isMarked) return;
  // modal
  cell.isShown = true;
  gGame.hiddenCellsCount--;
  // dom
  var cellValue = cell.isMine ? MINE : cell.minesAroundCount;
  elCell.innerHTML = getCellHTML(cellValue);
}

function peekCell(coords) {
  var elCell = getElCell(coords.i, coords.j);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isMarked) return;
  // dom
  var cellValue = cell.isMine ? MINE : cell.minesAroundCount;
  elCell.innerHTML = getCellHTML(cellValue);
}

function unPeekCell(coords) {
  var elCell = getElCell(coords.i, coords.j);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isMarked) return;
  if (!cell.isShown) elCell.innerHTML = getCellHTML('');
}

//gets elCell, returns an object with the cell's coords
function getCellCoords(elCell) {
  var strCellId = elCell.id;
  var parts = strCellId.split('-');
  var cellCoords = { i: +parts[1], j: +parts[2] };
  return cellCoords;
}

//gets cell, returns an HTML string which shows the cell's contents
function getCellHTML(cellValue) {
  // var cellValue = cell.isMarked ? MARK : cell.isMine ? MINE : cell.minesAroundCount;
  return `<span style="font-size: 16px;">${cellValue}</span>`;
}

// gets cell coords, returns elCell
function getElCell(i, j) {
  var cellId = `cell-${i}-${j}`;
  var elCell = document.querySelector(`#${cellId}`);
  return elCell;
}
