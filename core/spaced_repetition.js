'use strict';
const Eval = require('./eval');

// Calculate factor used to calculate spaced interval
// 'previousFactor' From 1.3 (hardest) to 2.5 (easiest)
// 'responseQuality' From 0 (worst) to 5 (best)
function calcFactor(previousFactor, responseQuality) {
  // EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
  // User shouldn't update factor if answer is low quality
  var q = responseQuality;
  var q = Math.min(responseQuality, 5);
  q = Math.max(q, 0);
  var newFactor = previousFactor + (0.1 - (5-q) * (0.08+(5-q)*0.02) );
  newFactor = Math.max(newFactor, 1.3);
	return newFactor;
}

//  Interval used for spaced repetition
//  `prevInterval` - Interval in days
//  `count` - Number of times content has been viewed
//  return new interval in days
function calcIntervalCore(prevInterval, factor, count) {
    if(count == 0) {
    	return 0;
    } else if(count == 1) {
    	return 1;
    } else if(count == 2) {
    	return 2;
    } else {
    	return Math.floor(prevInterval * factor);
    }
}

function calcInterval(prevInterval, factor, count, responseQuality) {
  if(isBadResponse(responseQuality)) {
    if(count < 1) {
      return calcIntervalCore(prevInterval, factor, count);
    }
    else {
      // treat interval calculation as if this is first time, with count = 1
      // since response quality is bad
      return calcIntervalCore(prevInterval, factor, 1);
    }
  }
  else {
    return calcIntervalCore(prevInterval, factor, count);
  }
}

function intervalInMinutes(interval) {
  return interval * intervalToMinutesFactor;
}

function isBadResponse(responseQuality) {
  return responseQuality < Eval.maxResponseQuality / 2.0;
}

let SRCore = {
  defaultFactor: 2.5,
  defaultInterval: 1.0,
  intervalToMinutesFactor: 1,

  calcFactor: calcFactor,
  calcInterval: calcInterval,
  intervalInMinutes: intervalInMinutes,
  isBadResponse: isBadResponse
}

module.exports = SRCore;
