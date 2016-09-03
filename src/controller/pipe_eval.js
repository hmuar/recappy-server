import { SessionState } from '../core/session_state';
import Input from '../core/input';
import Answer from '../core/answer';

// Evaluate user input in the context of user's current session state.
// Add a `evalCtx` object to message data.
// Each evaluation context has knowledge about how to transition among
// local state. For example, the RecallContext knows how to transition
// to RecallResponse state when appropriate. When local transition has
// reached end, `doneNote` on `mSTate.evalCtx` will be set to true.

// progress state by advancing note queue
// function deferToGlobalStateChange(mState) {
//   let session = mState.get('session');
//   let newQueueIndex = session.queueIndex + 1;
//   if(newQueueIndex >= session.noteQueue.length) {
//     session.state = SessionState.DONE_SESSION;
//   }
//   else {
//     session.queueIndex = newQueueIndex;
//     let nextNote = session.noteQueue[newQueueIndex];
//     session.state = Session.getEntryStateForNoteType(nextNote.type);
//   }
//   return mState.set('session', session);
// }

// Ignore input and advance state
// `mState` is Immut.Map
function InitContext(mState) {
  // let session = mState.get('session');
  // let firstNote = session.noteQueue[0];
  // // advance session state based on first note in queue
  // session.state = Session.getEntryStateForNoteType(firstNote.type);
  // // reset queueIndex to beginning of queue
  // session.queueIndex = 0;
  const evalCtx = {
    answerQuality: Answer.ok,
    doneNote: false,
  };

  return mState.set('evalCtx', evalCtx);
}

// Look for ACCEPT input type and then advance state
// Otherwise return original state.
// `mState` is Immut.Map
function InfoContext(mState) {
  const input = mState.get('input');

  const evalCtx = {
    answerQuality: null,
    doneNote: false,
  };

  if (input.type === Input.Type.ACCEPT) {
    evalCtx.answerQuality = Answer.ok;
    evalCtx.doneNote = true;
  }

  return mState.set('evalCtx', evalCtx);
}

// Look for ACCEPT or REJECT input type and then advance state
// Otherwise return original state.
function RecallContext(mState) {
  const session = mState.get('session');
  const input = mState.get('input');
  const evalCtx = {
    answerQuality: null,
    doneNote: false,
  };
  let newState = mState;
  if (input.type === Input.Type.ACCEPT) {
    evalCtx.answerQuality = Answer.ok;
    session.state = SessionState.RECALL_RESPONSE;
    newState = mState.set('session', session);
  }
  return newState.set('evalCtx', evalCtx);
}

function RecallResponseContext(mState) {
  const input = mState.get('input');
  const evalCtx = {
    answerQuality: null,
    doneNote: false,
  };
  if (input.type === Input.Type.ACCEPT) {
    evalCtx.answerQuality = Answer.max;
    evalCtx.doneNote = true;
  } else if (input.type === Input.Type.REJECT) {
    evalCtx.answerQuality = Answer.min;
    evalCtx.doneNote = true;
  }
  return mState.set('evalCtx', evalCtx);
}


function InputContext(mState) {
  const session = mState.get('session');
  const input = mState.get('input');
  const evalCtx = {
    answerQuality: null,
    doneNote: false,
  };
  // use isNaN to accept both numerical and number as text inputs
  if (input.type === Input.Type.CUSTOM) {
    // Note should be type "choice"
    const note = session.noteQueue[session.queueIndex];
    const correctAnswer = input.data === note.answer;
    evalCtx.answerQuality = correctAnswer ? Answer.max : Answer.min;
    evalCtx.doneNote = true;
  }

  // didn't find proper input type so return as is without advancing state
  return mState.set('evalCtx', evalCtx);
}

function MultChoiceContext(mState) {
  const session = mState.get('session');
  const input = mState.get('input');
  const evalCtx = {
    answerQuality: null,
    doneNote: false,
  };
  // use isNaN to accept both numerical and number as text inputs
  if (input.type === Input.Type.CUSTOM && !isNaN(input.data)) {
    const dataAsNum = parseInt(input.data, 10);
    // Note should be type "choice"
    const note = session.noteQueue[session.queueIndex];
    const correctAnswer = dataAsNum === note.answer;
    evalCtx.answerQuality = correctAnswer ? Answer.max : Answer.min;
    evalCtx.doneNote = true;
  }

  // didn't find proper input type so return as is without advancing state
  return mState.set('evalCtx', evalCtx);
}

function WaitContext(mState) {
  return mState;
}

function DoneContext(mState) {
  return mState;
}

function UnknownContext(mState) {
  return mState;
}

function getEvalContext(state) {
  switch (state) {
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
    case SessionState.WAIT_NEXT_NOTE:
      // TODO: implement WaitContext
      return WaitContext;
    case SessionState.DONE_SESSION:
      // TODO: implement DoneContext
      return DoneContext;
    default:
      return UnknownContext;
  }
}

function pipe(mState) {
  if (!mState.has('session')) {
    return mState;
  }

  const sState = mState.get('session').state;
  return getEvalContext(sState)(mState);
}

const PipeEval = {
  pipe,
};

export default PipeEval;
