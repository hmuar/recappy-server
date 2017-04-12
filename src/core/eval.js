const minResponseQuality = 1.0;
const maxResponseQuality = 5.0;
const halfMaxResponseQuality = maxResponseQuality / 2.0;

export default {
  minResponseQuality,
  maxResponseQuality,
};

export const EvalStatus = {
  INVALID: 'invalid',
  SUCCESS: 'success',
};

export function isFailResponse(responseQuality) {
  return responseQuality < halfMaxResponseQuality;
}
