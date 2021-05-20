'use-strict';

var MINE = '💣';
var MARK = '🚩';
var VICTORY = '';
var LIFE = '❤';
var NORMAL = '😀';
var EXPLODE = '🤯';
var WIN = '😎';
var victorySound = new Audio('sounds/victory.mp3');
var gameOverSound = new Audio('sounds/game-over.mp3');

var gBoard = [];
var gDiffOpts = [
  { id: 1, boardSize: 4, minesNum: 2 },
  { id: 2, boardSize: 8, minesNum: 12 },
  { id: 3, boardSize: 12, minesNum: 30 },
];

var gGame = {
  isOn: false,
  boardSize: 4,
  minesNum: 2,
  isFirstClick: true,
  lives: 0,
};

function init() {
  gGame.isOn = true;
  gGame.isFirstClick = true;
  gGame.lives = 3;
  updateLives(0);
  gBoard = buildBoard(gGame.boardSize);
  renderBoard(gBoard);
  toggleModal();
  soundsStop();
  updateSmiley(NORMAL);
}

function updateSmiley(smiley) {
  var elSmiley = document.querySelector('.smiley');
  elSmiley.innerHTML = smiley;
}

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = createCell();
    }
  }

  return board;
}

//place mines, except on the clicked cell, updates the mine count in each cell
function placeMines(skipCoords) {
  var mineCoords = getRandCoordsExc(gBoard, gGame.minesNum, skipCoords);
  for (var i = 0; i < mineCoords.length; i++) {
    var idxRow = mineCoords[i].i;
    var idxCol = mineCoords[i].j;
    gBoard[idxRow][idxCol].isMine = true;
  }

  //update mineNegCount in every cell
  for (var i = 0; i < gGame.boardSize; i++) {
    for (var j = 0; j < gGame.boardSize; j++) {
      var count = minesNegsCount(i, j, gBoard);
      gBoard[i][j].minesAroundCount = count;
    }
  }
}

//renders board with hidden cells
function renderBoard() {
  removeRightClickMenu();
  var strHTML = '';
  var len = gBoard.length;
  for (var i = 0; i < len; i++) {
    strHTML += '<tr>\t\t';
    for (var j = 0; j < len; j++) {
      var tdId = `cell-${i}-${j}`;
      var cellValue = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
      strHTML += `<td id="${tdId}" onmousedown="cellClicked(this, event)"><span>${cellValue}</span></td>`;
    }
  }
  strHTML += '</tr>';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function diffSelected(diffIdx) {
  var selectedDiff = gDiffOpts[diffIdx];
  gGame.boardSize = selectedDiff.boardSize;
  gGame.minesNum = selectedDiff.minesNum;
  init();
}

function createCell(i, j) {
  var cell = {
    isMine: false,
    isMarked: false,
    minesAroundCount: 0,
    isShown: false,
  };
  return cell;
}

function cellClicked(elCell, ev) {
  if (!gGame.isOn) return;
  var coords = getCellCoords(elCell);
  var cell = gBoard[coords.i][coords.j];
  // TODO - fix the timing here, there's no need to get the elCurrCell again after this 'if'
  if (gGame.isFirstClick) {
    gGame.isFirstClick = false;
    placeMines(coords);
    renderBoard();
    startTimer();
  }
  var elCurrCell = getElCell(coords.i, coords.j);

  if (ev.button === 2) {
    toggleMark(elCurrCell);
    return;
  }

  if (ev.button === 0) {
    if (cell.isMine) {
      if (gGame.lives > 1) {
        updateSmiley(EXPLODE);
        setTimeout(function () {
          updateSmiley(NORMAL);
        }, 2000);
        alert('You stepped on a mine!');
        updateLives(-1);
        return;
      } else {
        updateLives(-1);
        revealAllMines();
        gameOver();
        return;
      }
    }
    showCell(elCurrCell);
    if (!cell.minesAroundCount) showCells(elCurrCell);
  }
  isVictory();
}

//checks is isMarked reveals the cell innerText
function showCell(elCell) {
  var coords = getCellCoords(elCell);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isMarked) return;
  // modal
  cell.isShown = true;
  // dom
  var cellValue = cell.isMine ? MINE : cell.minesAroundCount;
  elCell.innerHTML = getCellHTML(cellValue);
  console.log(gBoard);
}

// checks if isShown toggles isMarked, makes cell unresponsive to left-click
function toggleMark(elCell) {
  var coords = getCellCoords(elCell);
  var cell = gBoard[coords.i][coords.j];
  if (cell.isShown) return;
  // modal
  cell.isMarked = cell.isMarked ? false : true;
  // dom
  var cellValue = cell.isMarked ? MARK : '';
  console.log('elCell.innerHTML BEFORE', elCell.innerHTML);
  elCell.innerHTML = getCellHTML(cellValue);
  console.log('elCell.innerHTML AFTER', elCell.innerHTML);
}

// show all empty cells around the given elCell
function showCells(elCell) {
  var coords = getCellCoords(elCell);
  var cell = gBoard[coords.i][coords.j];
  for (var i = coords.i - 1; i <= coords.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = coords.j - 1; j <= coords.j + 1; j++) {
      if (i === coords.i && j === coords.j) continue;
      if (j < 0 || j >= gBoard[i].length) continue;
      if (cell.isMine) continue;
      var elCell = getElCell(i, j);
      showCell(elCell);
    }
  }
}

function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        var elCurrCell = getElCell(i, j);
        showCell(elCurrCell, currCell);
      }
    }
  }
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
function getElCell(cellI, cellJ) {
  var cellId = `cell-${cellI}-${cellJ}`;
  var elCell = document.querySelector(`#${cellId}`);
  return elCell;
}

function minesNegsCount(cellI, cellJ, board) {
  var count = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= board[i].length) continue;
      if (board[i][j].isMine) count++;
    }
  }
  return count;
}

function isVictory() {
  var unMarkedMines = gGame.minesNum;
  var unShownCells = Math.pow(gGame.boardSize, 2) - gGame.minesNum;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine && currCell.isMarked) unMarkedMines--;
      if (currCell.isShown) unShownCells--;
    }
  }
  if ((unMarkedMines = unShownCells === 0)) victory();
}

function victory() {
  stopSaveTime();
  gGame.isOn = false;
  document.querySelector('.modal span').innerText = 'You won!';
  toggleModal();
  victorySound.play();
  updateSmiley(WIN);
}

function gameOver() {
  stopSaveTime();
  gGame.isOn = false;
  document.querySelector('.modal span').innerText = 'Game over!';
  toggleModal();
  gameOverSound.play();
}

function toggleModal() {
  var elModal = document.querySelector('.modal');
  if (gGame.isOn) {
    elModal.style.display = 'none';
  } else {
    elModal.style.display = 'block';
  }
}

function soundsStop() {
  gameOverSound.pause();
  gameOverSound.currentTime = 0;
  victorySound.pause();
  victorySound.currentTime = 0;
}

function updateLives(diff) {
  // modal
  gGame.lives += diff;
  // dom

  var strHTML = gGame.lives ? '' : 'No more lives!';
  for (var i = 0; i < gGame.lives; i++) {
    strHTML += LIFE;
  }
  var elLives = document.querySelector('.lives');
  elLives.innerHTML = strHTML;
}
