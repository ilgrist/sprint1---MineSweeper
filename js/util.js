'use-strict';
// returns a random exclusive array (num size) of cell objects from an obj mat. Mat needs to have cell values inside the obj
function getRandomCellsExc(mat, num) {
  var cells = [];
  var coordsArr = [];
  //build a flat array from the matrix >> splice a nums of random items, push into cells
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      var currCellCoords = { i, j };
      coordsArr.push(currCellCoords);
    }
  }
  for (var i = 0; i < num; i++) {
    var idx = getRandomIntInclusive(0, coordsArr.length - 1);
    switchVals(coordsArr, idx, coordsArr.length - 1);
    var currCell = coordsArr.pop();
    cells.push(currCell);
  }
  return cells;
}

function getMat(rows, cols) {
  var mat = [];
  for (var i = 0; i < rows; i++) {
    mat[i] = [];
    for (var j = 0; j < cols; j++) {
      mat[i][j] = '';
    }
  }
  return mat;
}

function minesNegsCount(cellI, cellJ, mat) {
  var count = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;
      if (mat[i][j].isMine) count++;
    }
  }
  return count;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

//switches places between two elements in an array
function switchVals(arr, idxA, idxB) {
  var temp = arr[idxA];
  arr[idxA] = arr[idxB];
  arr[idxB] = temp;
}
