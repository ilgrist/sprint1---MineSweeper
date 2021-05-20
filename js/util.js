'use-strict';
// returns a random exclusive array (num size) of coord objects from an obj 2D mat
// skips a target cell
function getRandCoordsExc(mat, num, skipCoords) {
  var cells = [];
  var coordsArr = [];
  //build a flat array from the matrix >> splice a nums of random items, push into cells
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      var currCoords = { i, j };
      if (currCoords.i === skipCoords.i && currCoords.j === skipCoords.j) continue;
      coordsArr.push(currCoords);
    }
  }
  //throws the item in the randIdx to the end and pops it into a new array
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

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

// removes right click menu, as we need it for the game
function removeRightClickMenu() {
  document.addEventListener(
    'contextmenu',
    function (e) {
      e.preventDefault();
    },
    false
  );
}

//switches places between two elements in an array
function switchVals(arr, idxA, idxB) {
  var temp = arr[idxA];
  arr[idxA] = arr[idxB];
  arr[idxB] = temp;
}

// stopwatch
function timeToString(time) {}
