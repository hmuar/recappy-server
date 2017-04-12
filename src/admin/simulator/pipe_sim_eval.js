import { SessionState, getCurrentNote } from '~/core/session_state';
import Answer from '~/core/answer';
import { successEval, insertEval } from '~/controller/pipe_eval';

export default function pipe(appState) {
  if (!{}.hasOwnProperty.call(appState, 'simulatorInput')) {
    return appState;
  }

  let success = appState.simulatorInput.success;

  const currentNote = getCurrentNote(appState.session);
  if (!currentNote) {
    if (appState.session.state === SessionState.DONE_QUEUE) {
      success = true;
    } else {
      console.log('No current note, aborting eval');
      return appState;
    }
  } else if (currentNote.type === 'info') {
    success = true;
  }

  // if (!success) {
  //   if(currentNote) {
  //     console.log(`Note type: ${currentNote.type}, state: ${appState.session.state}`);
  //     console.log(currentNote.displayRaw.slice(0, 50));
  //   }
  // }

  return insertEval(appState, success ? successEval(Answer.max) : successEval(Answer.min));
}
