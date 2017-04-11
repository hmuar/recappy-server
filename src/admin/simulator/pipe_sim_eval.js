import { getCurrentNote } from '~/core/session_state';
import Answer from '~/core/answer';
import { successEval, insertEval } from '~/controller/pipe_eval';

export default function pipe(appState) {
  if (!{}.hasOwnProperty.call(appState, 'simulator')) {
    return appState;
  }

  let success = appState.simulator.success;

  const currentNote = getCurrentNote(appState.session);
  if (!currentNote) {
    console.log('No current note, aborting eval');
    return appState;
  }
  if (currentNote.type === 'info') {
    success = true;
  }

  console.log(`Note type: ${currentNote.type}, state: ${appState.session.state}`);

  return insertEval(appState, success ? successEval(Answer.max) : successEval(Answer.min));
}
