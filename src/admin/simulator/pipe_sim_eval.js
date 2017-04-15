import { SessionState, getCurrentNote } from '~/core/session_state';
import Answer from '~/core/answer';
import { successEval, insertEval } from '~/controller/pipe_eval';

function generateSuccess(probability) {
  return Math.random() < probability;
}

function countInfluence(count) {
  if (count < 3) {
    return 0;
  }
  return (count - 2) * 0.1;
  // return 0;
}

// use previous note records to modify base success prob
function calcSuccess(appState, currentNote) {
  const { successBaseProb, } = appState.simulatorInput;
  let prob = successBaseProb;

  const noteRecordsMap = appState.session.simulator.noteRecordsMap;
  // console.log(noteRecordsMap);
  // console.log(appState);
  if (noteRecordsMap) {
    const count = noteRecordsMap[currentNote._id.toString()];
    if (count != null) {
      const countInf = countInfluence(count);
      prob = Math.min(1.0, prob + countInf);
      // console.log(`Count: ${count} ---> Prob: ${prob}`);
      return generateSuccess(prob);
    }
  }

  return generateSuccess(prob);
}

export default function pipe(appState) {
  // if (!{}.hasOwnProperty.call(appState, 'simulatorInput')) {
  //   return appState;
  // }
  //
  let success = false;

  const currentNote = getCurrentNote(appState.session);
  if (!currentNote) {
    if (appState.session.state === SessionState.DONE_QUEUE) {
      success = true;
    } else {
      console.log('No current note, aborting eval');
      return appState;
    }
  } else if (
    appState.session.state === SessionState.INIT ||
    appState.session.state === SessionState.DONE_QUEUE
  ) {
    success = true;
  } else if (currentNote.type === 'info') {
    success = true;
  } else {
    success = calcSuccess(appState, currentNote);
  }

  if (currentNote) {
    console.log(`Note type: ${currentNote.type}`);
  }
  console.log(`Note success: ${success}`);

  return insertEval(appState, success ? successEval(Answer.max) : successEval(Answer.min));
}
