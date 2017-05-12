import { checkInputAgainstAnswer } from '~/core/eval/textProcess';
import { AffirmitiveInputs, NegativeInputs } from '~/core/input';

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

export function isValidEval(evalCtx) {
  if (!evalCtx) {
    return false;
  }
  return evalCtx.status !== EvalStatus.INVALID;
}

export function isFailResponse(responseQuality) {
  return responseQuality < halfMaxResponseQuality;
}

export function evalNoteWithRawInput(input, note) {
  const match = checkInputAgainstAnswer(input, note.answer);
  return match;
}

// look for a yes or no answer
export function evalWithYesNo(input) {
  const affirmMatch = checkInputAgainstAnswer(input, AffirmitiveInputs);
  if (affirmMatch) {
    return true;
  }
  const negativeMatch = checkInputAgainstAnswer(input, NegativeInputs);
  if (negativeMatch) {
    return false;
  }
  return null;
}
