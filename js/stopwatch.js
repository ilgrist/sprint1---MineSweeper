'use-strict';
//stopwatch vars
var tStart;
var tUpdated;
var tDifference;
var tInterval;
var tSaved;

//gets init time, starts time runner interval
function startTimer() {
  if (!gGame.isOn) return;
  tStart = new Date().getTime();
  tInterval = setInterval(showGetTime, 1);
}

// calculates the diff between tStart and pushes it into the HTML
function showGetTime() {
  tUpdated = new Date().getTime();
  tDifference = tUpdated - tStart;
  // var hh = Math.floor((tDifference / (1000 * 60 * 60)));
  var mm = Math.floor((tDifference % (1000 * 60 * 60)) / (1000 * 60));
  var ss = Math.floor((tDifference % (1000 * 60)) / 1000);
  var mms = Math.floor(tDifference % 1000);
  // hh = hh.toString().padStart(2, '0');
  mm = mm.toString().padStart(2, '0');
  ss = ss.toString().padStart(2, '0');
  mms = mms.toString().padStart(3, '0');

  var strHTML = `${mm}:${ss}:${mms}`;
  var elStopwatch = document.querySelector('.stopwatch');
  elStopwatch.innerHTML = strHTML;
}
//stops the interval and saves the last time
function stopSaveTime() {
  clearInterval(tInterval);
  var elStopwatch = document.querySelector('.stopwatch');
  tSaved = elStopwatch.innerHTML;
  elStopwatch.innerHTML = '00:00:000';
}
