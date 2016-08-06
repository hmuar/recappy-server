const SessionState = require('../study/session_state').SessionState;
const Input = require('../core/input');
const Answer = require('../core/answer');

// Each evaluation context has knowledge about how to transition among
// local state. For example, the RecallContext knows how to transition
// to RecallResponse state when appropriate. Each context also knows
// when it is time to transition out of all local states, at which
// point they defer transition to `deferToGlobalStateChange`.


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
  console.log(mState);
  // let session = mState.get('session');
  // let firstNote = session.noteQueue[0];
  // // advance session state based on first note in queue
  // session.state = Session.getEntryStateForNoteType(firstNote.type);
  // // reset queueIndex to beginning of queue
  // session.queueIndex = 0;
  let evalCtx = {
    answerQuality: Answer.ok,
    doneNote: false
  }

  return mState.set('evalCtx', evalCtx);
}

// Look for ACCEPT input type and then advance state
// Otherwise return original state.
// `mState` is Immut.Map
function InfoContext(mState) {
  let session = mState.get('session');
  let input = mState.get('input');

  let evalCtx = {
    answerQuality: null,
    doneNote: false
  }

  if(input.type === Input.Type.ACCEPT) {
      evalCtx.answerQuality = Answer.ok;
      evalCtx.doneNote = true;
  }
  // didn't find proper input type so return as is without advancing state
  return mState.set('evalCtx', evalCtx);;
}

// Look for ACCEPT or REJECT input type and then advance state
// Otherwise return original state.
function RecallContext(mState) {
  let session = mState.get('session');
  let input = mState.get('input');
  let evalCtx = {
    answerQuality: null,
    doneNote: false
  }
  if(input.type === Input.Type.ACCEPT) {
    evalCtx.answerQuality = Answer.ok;
    session.state = SessionState.RECALL_RESPONSE;
    mState = mState.set('session', session);
  }
  // didn't find proper input type so return as is without advancing state
  return mState.set('evalCtx', evalCtx);
}

function RecallResponseContext(mState) {
  let session = mState.get('session');
  let input = mState.get('input');
  let evalCtx = {
    answerQuality: null,
    doneNote: false
  }
  if(input.type === Input.Type.ACCEPT) {
    evalCtx.answerQuality = Answer.max;
    evalCtx.doneNote = true;
  }
  else if(input.type === Input.Type.REJECT){
    evalCtx.answerQuality = Answer.min;
    evalCtx.doneNote = true;
  }

  // didn't find proper input type so return as is without advancing state
  return mState.set('evalCtx', evalCtx);;
}

//
// function InputContext(mState) {
//
// }
//
// function MultChoiceContext(mState) {
//
// }

function getEvalContext(state) {
  switch(state) {
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
    return WaitContext;
  case SessionState.DONE_SESSION:
    return DoneContext;
  default:
    return UnknownContext;
  }
}

function eval(mState) {
  let sState = mState.get('session').state;
  return getEvalContext(sState)(mState);
}

let Evaluator = {
  eval: eval
}

module.exports = Evaluator;
