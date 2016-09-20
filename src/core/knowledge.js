function limitWeight(weight) {
  return Math.max(Math.min(weight, 1.0), 0);
}

export default function calcWeight(prevWeight, weightDelta) {
  if (!prevWeight && weightDelta) {
    return limitWeight(weightDelta);
  }
  if (!weightDelta && prevWeight) {
    return limitWeight(prevWeight);
  }
  return limitWeight(prevWeight + weightDelta);
}

export function calcWeightDelta(level, responseQuality) {
  let weightFactor = 0;
  let weightDelta = 0;
  if (responseQuality < 4) {
    weightFactor = (1.1 - level) * (1.1 - level);
    weightDelta = (responseQuality - 5) / 5;
  } else {
    weightFactor = level * level;
    weightDelta = responseQuality / 5;
  }
  const finalWeightDelta = weightFactor * weightDelta * 0.2;
  return finalWeightDelta;
}

export const DEFAULT_WEIGHT = 0;
