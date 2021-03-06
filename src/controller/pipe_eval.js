import { SessionState, getCurrentNote } from '~/core/session_state';
import Input from '~/core/input';
import Answer from '~/core/answer';
import { EvalStatus, evalNoteWithRawInput, evalWithYesNo, hasWaitedMinHours } from '~/core/eval';
import { minSessionWaitHours } from '~/core/hyperparam';
import { isProduction } from '~/core/production';
import { isPromptNote } from '~/core/note';

// Evaluate user input in the context of user's current session state.
// Add a `evalCtx` object to message data.
export function invalidEval(correctAnswer = null) {
  return {
    answerQuality: null,
    correctAnswer,
    status: EvalStatus.INVALID,
  };
}

export function successEval(answerQuality, correctAnswer = null) {
  return {
    answerQuality,
    correctAnswer,
    status: EvalStatus.SUCCESS,
  };
}

export function insertEval(state, evalCtx) {
  return {
    ...state,
    evalCtx,
  };
}

// properly format compound answers, e.g. those that contain
// multiple acceptable answers
function formatAnswer(answer) {
  // strip out quotation marks
  const answers = answer.split('||').map(text => text.replace(/"/g, ''));
  if (!answers || answer.length === 0) {
    throw new Error('Could not format note answer.');
  }
  return answers[0].trim();
}

// Ignore input and advance state
function InitContext(appState) {
  if (!appState.input) {
    return appState;
  }
  return insertEval(appState, successEval(Answer.ok));
}

// Look for ACCEPT input type and then advance state
// Otherwise return original state.
function InfoContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }

  const note = getCurrentNote(appState.session);
  // response was for an explore path
  if (input.type === Input.Type.PATH && !isNaN(input.payload)) {
    const dataAsNum = parseInt(input.payload, 10);
    const validPayload = dataAsNum != null && note.paths && dataAsNum < note.paths.length;
    if (validPayload) {
      return insertEval(appState, successEval(Answer.max, note.paths[dataAsNum]));
    }
    return insertEval(appState, invalidEval());
  }

  if (isPromptNote(note) && input.type === Input.Type.CUSTOM) {
    return insertEval(appState, invalidEval());
  }

  return insertEval(
    appState,
    input.type !== Input.Type.REJECT ? successEval(Answer.ok) : successEval(Answer.min)
  );
}

// Look for ACCEPT or REJECT input type and then advance state
// Otherwise return original state.
function RecallContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }

  return insertEval(
    appState,
    input.type !== Input.Type.REJECT ? successEval(Answer.ok) : invalidEval()
  );
}

function RecallResponseContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }

  switch (input.type) {
    case Input.Type.ACCEPT:
      return insertEval(appState, successEval(Answer.max));
    case Input.Type.REJECT:
      return insertEval(appState, successEval(Answer.min));
    case Input.Type.CUSTOM: {
      // look for yes/no answer
      // true means user input yes
      // false means user input no
      // null means user input some unknown message
      const yesNoEval = evalWithYesNo(input.payload);
      if (yesNoEval === null) {
        return insertEval(appState, invalidEval());
      } else if (yesNoEval === true) {
        return insertEval(appState, successEval(Answer.max));
      } else if (yesNoEval === false) {
        return insertEval(appState, successEval(Answer.min));
      }
      return insertEval(appState, invalidEval());
    }
    default:
      return insertEval(appState, invalidEval());
  }
}

function InputContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }
  const session = appState.session;
  const note = getCurrentNote(session);
  if (input.type === Input.Type.CUSTOM) {
    const correctAnswer = evalNoteWithRawInput(input.payload, note);
    return insertEval(
      appState,
      successEval(correctAnswer ? Answer.max : Answer.min, formatAnswer(note.answer))
    );
  }
  return insertEval(appState, invalidEval(note.answer));
}

function MultChoiceContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }
  const session = appState.session;
  const note = getCurrentNote(session);
  const choiceAnswerKey = `choice${note.answer}`;
  const ansFormatted = `(${note.answer}) ${note[choiceAnswerKey]}`;
  // use isNaN to accept both numerical and number as text inputs
  if (input.type === Input.Type.CUSTOM && !isNaN(input.payload)) {
    const dataAsNum = parseInt(input.payload, 10);
    // Note should be type "choice"
    const correctAnswer = dataAsNum === note.answer;
    // XXX: Hardcoded convention for how mult_choice notes store answer
    return insertEval(appState, successEval(correctAnswer ? Answer.max : Answer.min, ansFormatted));
  }

  return insertEval(appState, invalidEval(ansFormatted));
}

function WaitContext(appState) {
  return appState;
}

function ShowPathsContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }
  // input is just an accept response, which in this context means continue
  // without choosing any extra paths
  if (input.type === Input.Type.ACCEPT) {
    return insertEval(appState, successEval(Answer.ok));
  }
  if (input.type === Input.Type.PATH && !isNaN(input.payload)) {
    const note = getCurrentNote(appState.session);
    const dataAsNum = parseInt(input.payload, 10);
    const validPayload = dataAsNum != null && note.paths && dataAsNum < note.paths.length;
    if (validPayload) {
      return insertEval(appState, successEval(Answer.max, note.paths[dataAsNum]));
    }
    return insertEval(appState, invalidEval());
  }
  return insertEval(appState, invalidEval());
}

function DoneContext(appState) {
  const input = appState.input;
  if (!input) {
    return appState;
  }

  // XXX Dev loophole to allow date control
  // Check if user input was a number. If so, treat it as an offset
  // for number of days from current Date, and then use that date
  // as cutoff date when getting next note queue from scheduler.
  const cutoffDate = new Date();
  if (input.type === Input.Type.CUSTOM && !isProduction()) {
    const tryInt = parseInt(input.payload, 10);
    if (!isNaN(tryInt)) {
      cutoffDate.setDate(cutoffDate.getDate() + tryInt);
      // set correct answer value to the cutoffDate
      return insertEval(appState, successEval(Answer.ok, { cutoffDate, remainingWaitHours: 0, }));
    }
  }

  const { startSessionTime, } = appState.session;
  // if user doesn't have a startsession time store, just continue to next concept
  // this represents an edge case for older users that may not have new startSessionTime property
  if (!startSessionTime) {
    return insertEval(appState, successEval(Answer.ok, { cutoffDate, remainingWaitHours: 0, }));
  }

  const { success: sessionWaitTimeReached, waitedHours, } = hasWaitedMinHours(startSessionTime);
  if (!sessionWaitTimeReached) {
    return insertEval(
      appState,
      successEval(Answer.min, {
        cutoffDate: null,
        remainingWaitHours: minSessionWaitHours - waitedHours,
      })
    );
  }

  return insertEval(appState, successEval(Answer.ok, { cutoffDate, remainingWaitHours: 0, }));
}

function UnknownContext(appState) {
  return appState;
}

function getEvalContext(state) {
  switch (state) {
    case SessionState.INTRO:
    case SessionState.INIT:
      return InitContext;
    case SessionState.INFO:
      return InfoContext;
    case SessionState.RECALL:
      return RecallContext;
    case SessionState.RECALL_RESPONSE:
      return RecallResponseContext;
    case SessionState.INPUT:
      return InputContext;
    case SessionState.MULT_CHOICE:
      return MultChoiceContext;
    case SessionState.WAIT_NEXT_IN_QUEUE:
      return WaitContext;
    case SessionState.SHOW_PATHS:
      return ShowPathsContext;
    case SessionState.DONE_QUEUE:
      return DoneContext;
    default:
      return UnknownContext;
  }
}

export default function pipe(appState) {
  if (!{}.hasOwnProperty.call(appState, 'session')) {
    return appState;
  }

  const sState = appState.session.state;
  return getEvalContext(sState)(appState);
}
