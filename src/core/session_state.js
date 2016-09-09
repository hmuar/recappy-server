// SessionState represents the state of user study session
// in the context of notes. All states have something to do with
// what note user is currently on, waiting for note, waiting to start
// note queue, etc.
export const SessionState = {
  INIT: 'init',
  RECALL: 'recall',
  RECALL_RESPONSE: 'recall-response',
  INPUT: 'input',
  MULT_CHOICE: 'mult-choice',
  INFO: 'info',
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

export function getStartState() {
  return SessionState.INIT;
}
