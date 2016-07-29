var kCore = {};

kCore.defaultWeight = 0;

kCore.calcWeight = function(prevWeight, level, responseQuality) {
	if(responseQuality < 4) {
		var weightFactor = (1.1 - level) * (1.1 - level)
 		var weightDelta = (responseQuality - 5) / 5
	} else {
		var weightFactor = level * level
 		var weightDelta = responseQuality / 5
	}
	var finalWeight = prevWeight + weightFactor * weightDelta * 0.2

	finalWeight = Math.min(finalWeight, 1.0);
	finalWeight = Math.max(finalWeight, 0.0);

	return finalWeight;
}

module.exports = kCore;
