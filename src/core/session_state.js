export const SessionState = {
  INIT: 'init',
  RECALL: 'recall',
  RECALL_RESPONSE: 'recall-response',
  EVAL_RESPONSE: 'eval-response',
  INPUT: 'input',
  MULT_CHOICE: 'mult-choice',
  INFO: 'info',
  WAIT_NEXT_IN_QUEUE: 'wait-next-note',
  START_QUEUE: 'start-queue',
  DONE_QUEUE: 'done-queue',
  UNKNOWN: 'unknown',
};

export function getEntryStateForNoteType(ntype) {
  if (ntype === 'info') {
    return SessionState.INFO;
  } else if (ntype === 'recall') {
    return SessionState.RECALL;
  } else if (ntype === 'choice') {
    return SessionState.MULT_CHOICE;
  } else if (ntype === 'input') {
    return SessionState.INPUT;
  }

  return SessionState.UNKNOWN;
}

export function getStartState() {
  return SessionState.INIT;
}
