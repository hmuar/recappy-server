'use strict';

function calcWeight(prevWeight, level, responseQuality) {
	let weightFactor = 0;
	let weightDelta = 0;
	if(responseQuality < 4) {
		weightFactor = (1.1 - level) * (1.1 - level)
 		weightDelta = (responseQuality - 5) / 5
	} else {
		weightFactor = level * level
 		weightDelta = responseQuality / 5
	}
	let finalWeight = prevWeight + weightFactor * weightDelta * 0.2

	finalWeight = Math.min(finalWeight, 1.0);
	finalWeight = Math.max(finalWeight, 0.0);

	return finalWeight;
}

let Know = {
	defaultWeight: 0,
	calcWeight: calcWeight
}

module.exports = Know;
