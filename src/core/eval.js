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

function fuzzyEval(input, answer) {
  // lowercase response
  let inputClean = input.toLowerCase().trim();
  let answerClean = answer.toLowerCase().trim();
  if (inputClean !== answerClean) {
    if (inputClean.length === answerClean.length) {
      return false;
    }
    if (inputClean.length > answerClean.length) {
      inputClean = inputClean.replace(/s\s*$/, '');
    } else {
      answerClean = answerClean.replace(/s\s*$/, '');
    }
    return inputClean === answerClean;
  }
  return true;
}

function inputSetMatchWithAnswer(inputSet, answerSet) {
  if (inputSet.size === 0 || answerSet.size === 0) {
    return false;
  }
  // if (inputSet.size !== answerSet.size) return false;
  for (const input of inputSet) {
    // iterate through answer set to check for equivalence
    let match = false;
    for (const answer of answerSet) {
      // iterate through each element after splitting it based on custom
      // OR delimiter we use to denote multiple answers, each ONE of which
      // by itself is enough for entire answer to be correct
      if (fuzzyEval(input, answer)) {
        match = true;
        break;
      }
    }
    if (!match) {
      return false;
    }
  }
  return true;
}
function separateUserInput(input) {
  return input.trim().split(/\s*and\s*|\s*,\s*|\s+/).map(s => s.trim());
}

function separateNoteAnswer(input) {
  const comp = input.trim().split(/\s*and\s*|\s*,\s*/).map(s => s.trim());
  return comp.reduce(
    (acc, val) => {
      const orComponents = val.split('||').map(s => s.trim());
      return [...acc, ...orComponents];
    },
    []
  );
}

function asSet(stringArray) {
  return new Set(stringArray);
}

function _setAsString(set) {
  let finalString = '';
  for (let s of set) {
    finalString = `${finalString + s} `;
  }
  return finalString;
}

export function evalNoteWithRawInput(input, note) {
  // look for multiple answers by splitting on 'and' or ','

  const inputSet = asSet(separateUserInput(input));
  const answerSet = asSet(separateNoteAnswer(note.answer));

  const match = inputSetMatchWithAnswer(inputSet, answerSet);

  return match;

  // const answers = note.answer.split('||').map(s => s.trim());
  // for (let i = 0; i < answers.length; i++) {
  //   if (fuzzyEval(input, answers[i])) {
  //     return true;
  //   }
  // }
  // return false;
}
