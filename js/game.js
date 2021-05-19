'use-strict';

var MINE = '💣';

var boardSize = 4;

var gBoard = [];

function init() {
  gBoard = buildBoard(boardSize);
  renderBoard(gBoard);
  console.log('gBoard:', gBoard);
}

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = createCell();
    }
  }
  //place mines
  board[0][0].isMine = board[2][2].isMine = true;
  //update mineNegCount in every cell
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var count = minesNegsCount(i, j, board);
      board[i][j].minesAroundCount = count;
    }
  }
  return board;
}

//renders board with hidden cells
function renderBoard(board) {
  var strHTML = '';
  var len = board.length;
  for (var i = 0; i < len; i++) {
    strHTML += '<tr>\t\t';
    for (var j = 0; j < len; j++) {
      var tdId = `cell-${i}-${j}`;
      var cellValue = board[i][j].isMine ? MINE : board[i][j].minesAroundCount;
      strHTML += `<td id="${tdId}" onclick="cellClicked(this)"><span>${cellValue}</span></td>`;
    }
  }
  strHTML += '</tr>';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function createCell(i, j) {
  var cell = {
    isMine: false,
    isMarked: false,
    minesAroundCount: 0,
    isShown: true,
  };
  return cell;
}
//reveals the cell innerText
// TODO : redundant ? replace with showCell
function cellClicked(elCell) {
  showCell(elCell);
}

//gets elCell, reveals the cell innerText
function showCell(elCell) {
  var coords = getCellCoords(elCell);
  var cell = gBoard[coords.i][coords.j];
  // modal
  cell.isShown = true;
  // dom
  elCell.innerHTML = getCellHTML(cell);
  console.log('shown');
}

//gets elCell, returns an object with the cell's coords
function getCellCoords(elCell) {
  var strCellId = elCell.id;
  var parts = strCellId.split('-');
  var cellCoords = { i: +parts[1], j: +parts[2] };
  return cellCoords;
}

//gets cell, returns an HTML string which shows the cell's contents
function getCellHTML(cell) {
  var cellValue = cell.isMine ? MINE : cell.minesAroundCount;
  return `<span style="font-size: 16px;">${cellValue}</span>`;
}
