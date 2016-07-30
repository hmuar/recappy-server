'use strict';
var Eval = require('./evaluate');

var _SRSCore = {}
_SRSCore.defaultFactor = 2.5;
_SRSCore.defaultInterval = 1.0;
_SRSCore.intervalToMinutesFactor = 1;

/**
 * Calculate factor used to calculate spaced interval
 * @param {float} previousFactor - From 1.3 (hardest) to 2.5 (easiest)
 * @param {float} responseQuality - From 0 (worst) to 5 (best)
 * @return {float}
 */
_SRSCore.calcFactor = function(previousFactor, responseQuality) {
    // EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
    // User shouldn't update factor if answer is low quality
    var q = responseQuality;
    var q = Math.min(responseQuality, 5);
    q = Math.max(q, 0);
    var newFactor = previousFactor + (0.1 - (5-q) * (0.08+(5-q)*0.02) );
    newFactor = Math.max(newFactor, 1.3);
	return newFactor;
}

/**
 * Interval used for spaced repetition
 * @param {float} prevInterval - Interval in days
 * @param {float} count - Number of times content has been viewed
 * @return {float} New interval in days
 */
_SRSCore.calcIntervalCore = function(prevInterval, factor, count) {

    // if (viewCount == 0) {
    //    	return 0;
    // }
    // else if(viewCount == 1) {
    //     return 1;
    // } else if (viewCount == 2) {
    //     return 2;
    // } else {
    //     return Int(Double(previousInterval) * factor)
    // }

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

_SRSCore.calcInterval = function(prevInterval, factor, count, responseQuality) {
  if(_SRSCore.isBadResponse(responseQuality)) {
    if(count < 1) {
      return _SRSCore.calcIntervalCore(prevInterval, factor, count);
    }
    else {
      // treat interval calculation as if this is first time, with count = 1
      // since response quality is bad
      return _SRSCore.calcIntervalCore(prevInterval, factor, 1);
    }
  }
  else {
    return _SRSCore.calcIntervalCore(prevInterval, factor, count);
  }
}

_SRSCore.intervalInMinutes = function(interval) {
  return interval * _SRSCore.intervalToMinutesFactor;
}

_SRSCore.isBadResponse = function(responseQuality) {
  return responseQuality < Eval.maxResponseQuality / 2.0;
}

module.exports = _SRSCore;
