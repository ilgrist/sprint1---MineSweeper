'use-strict';

var MINE = '💣';
var MARK = '🚩';
var LIFE = '💖';
var HINT = '💡';
var HINT_USED = '📙';
var SMILEY_NORMAL = '😀';
var SMILEY_EXPLODE = '🤯';
var SMILEY_WIN = '😎';
var victorySound = new Audio('sounds/victory.mp3');
var gameOverSound = new Audio('sounds/game-over.mp3');

var gBoard = [];
var gDiffOpts = [
  { id: 1, name: 'Easy', boardSize: 4, minesNum: 2 },
  { id: 2, name: 'Medium', boardSize: 8, minesNum: 12 },
  { id: 3, name: 'Expert', boardSize: 12, minesNum: 30 },
];

var gGame = {
  isOn: false,
  diffIdx: 0,
  boardSize: 4,
  mines: 2,
  unmarkedMines: 0,
  hiddenCellsCount: 0,
  isFirstClick: true,
  isHintModeOn: false,
  hints: 3,
  lives: 0,
  flags: 2,
};

function init() {
  gGame.isOn = true;
  resetStats();
  stopSaveTime();
  gBoard = buildBoard(gGame.boardSize);
  updateRenderLives(0);
  buildRenderHints();
  renderBoard(gBoard);
  renderDiffOps();
  toggleModal();
  soundsStop();
  renderSmiley(SMILEY_NORMAL);
  renderUpdateFlags(0);
}

function resetStats() {
  gGame.hiddenCellsCount = Math.pow(gGame.boardSize, 2) - gGame.mines;
  gGame.unmarkedMines = gGame.mines;
  gGame.lives = 3;
  gGame.hints = 3;
  gGame.flags = gGame.mines;
  gGame.isFirstClick = true;
  gGame.isHintModeOn = false;
}

// function clickedHint(elCell) {
//   // get elCell from cellClicked (when in Hint mode)
//   // reveals the neghboring cells for one second
// }

// builds a board with empty cells
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

//place mines randomly on the board (skipping the cell in the coords)
//updates the mine count in each cell
function placeUpdateMines(coords) {
  var mineCoords = getRandCoordsExc(gBoard, gGame.mines, coords);
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

function renderBoard() {
  var strHTML = '';
  var len = gBoard.length;
  for (var i = 0; i < len; i++) {
    strHTML += '<tr>\t\t';
    for (var j = 0; j < len; j++) {
      var tdId = `cell-${i}-${j}`;
      var cellValue = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
      strHTML += `<td id="${tdId}" onmousedown="clickedCell(${i}, ${j}, event)"><span>${cellValue}</span></td>`;
    }
  }
  strHTML += '</tr>';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function renderDiffOps() {
  var strHTML = '';
  for (var i = 0; i < gDiffOpts.length; i++) {
    var currOp = gDiffOpts[i];
    var checkedOp = i === gGame.diffIdx ? 'checked="checked"' : '';
    strHTML += `<input type="radio" ${checkedOp} id="${i + 1}" name="diff" value="${currOp.name}" onclick="getDiffSelected(${i})">
    <label for="${currOp.name}">${currOp.name}</label>`;
  }
  var elDiffOps = document.querySelector('.diffOps');
  elDiffOps.innerHTML = strHTML;
}

// get the input from the radio buttons, restarts the game with the new difficulty
function getDiffSelected(idx) {
  gGame.diffIdx = idx;
  gGame.boardSize = gDiffOpts[idx].boardSize;
  gGame.unmarkedMines = gGame.mines = gGame.flags = gDiffOpts[idx].minesNum;
  init();
}

function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        var coords = { i, j };
        showCell(coords);
      }
    }
  }
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

function checkIfVictory() {
  if (gGame.unmarkedMines === 0 && gGame.hiddenCellsCount === 0) {
    stopSaveTime();
    gGame.isOn = false;
    document.querySelector('.modal span').innerText = 'You won!';
    toggleModal();
    victorySound.play();
    renderSmiley(SMILEY_WIN);
  }
}

function gameOver() {
  console.log('game over');
  stopSaveTime();
  updateRenderLives(-1);
  revealAllMines();
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

function updateRenderLives(diff) {
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

function renderSmiley(SMILEY_TYPE) {
  var strHTML = `<span onclick="init()">${SMILEY_TYPE}</span>`;
  var elSmiley = document.querySelector('.smiley');
  elSmiley.innerHTML = strHTML;
}

function renderUpdateFlags(diff) {
  var elFlags = document.querySelector('.flags');
  // modal
  gGame.flags += diff;
  // dom
  var strHTML = MARK + ': ' + gGame.flags;
  elFlags.innerHTML = strHTML;
}

// HINTS section
function buildRenderHints() {
  // modal
  gGame.hints = 3;
  // dom
  var strHTML = '';
  for (var i = 0; i < gGame.hints; i++) {
    strHTML += `<span id="hint-${i + 1}" onclick="clickedHint(this)">${HINT}</span>`;
  }
  var elHints = document.querySelector('.hints');
  elHints.innerHTML = strHTML;
}

function clickedHint(elHint) {
  if (!gGame.isOn) return;
  elHint.innerHTML = HINT_USED;
  gGame.isHintModeOn = true;
  gGame.isOn = false;
}

function revealHint(coords) {
  // LATER support unclicking a hint
  setNegs(coords, peekCell);
  setTimeout(function () {
    setNegs(coords, unPeekCell);
    gGame.isHintModeOn = false;
    gGame.isOn = true;
  }, 1000);
}
