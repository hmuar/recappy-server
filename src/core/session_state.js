// SessionState represents the state of user study session
// in the context of notes. All states have something to do with
// what note user is currently on, waiting for note, waiting to start
// note queue, etc.
export const SessionState = {
  // intro is used for very beginning of app use with a new user
  INTRO: 'intro',
  // init is used for very beginning of a new subject with user
  INIT: 'init',
  // at the start of a new returning session
  START_NEW_SESSION: 'start-new-session',
  RECALL: 'recall',
  RECALL_RESPONSE: 'recall-response',
  INPUT: 'input',
  MULT_CHOICE: 'mult-choice',
  INFO: 'info',
  SHOW_PATHS: 'show-paths',
  WAIT_NEXT_IN_QUEUE: 'wait-next-in-queue',
  START_QUEUE: 'start-queue',
  DONE_QUEUE: 'done-queue',
  UNKNOWN: 'unknown',
};

export function getEntryStateForNoteType(ntype) {
  switch (ntype) {
    case 'info':
      return SessionState.INFO;
    case 'recall':
      return SessionState.RECALL;
    case 'choice':
      return SessionState.MULT_CHOICE;
    case 'input':
      return SessionState.INPUT;
    default:
      return SessionState.UNKNOWN;
  }
}

export function getCurrentNote(session) {
  if (session.queueIndex != null && session.noteQueue) {
    const { queueIndex, noteQueue, } = session;
    if (queueIndex < noteQueue.length) {
      return noteQueue[queueIndex];
    }
  }
  return null;
}

export function getPaths(session) {
  const curNote = getCurrentNote(session);
  if (curNote && curNote.paths && curNote.paths.length > 0) {
    return curNote.paths;
  }
  return null;
}
