'use strict';

const SessionState = {
  INIT: 'init',
  RECALL: 'recall',
  RECALL_RESPONSE: 'recall-response',
  EVAL_RESPONSE: 'eval-response',
  INPUT: 'input',
  MULT_CHOICE: 'mult-choice',
  INFO: 'info',
  WAIT_NEXT_NOTE: 'wait-next-note',
  DONE_SESSION: 'done-session',
  UNKNOWN: 'unknown'
}

function getEntryStateForNoteType(ntype) {
  if(ntype === 'info') {
    return SessionState.INFO;
  }
  else if(ntype === 'recall') {
    return SessionState.RECALL;
  }
  else if(ntype === 'choice') {
    return SessionState.MULT_CHOICE;
  }
  else if(ntype === 'input') {
    return SessionState.INPUT;
  }
  else {
    return SessionState.UNKNOWN;
  }
};

function getStartState() {
  return SessionState.INIT;
}

let Session = {
  SessionState: SessionState,
  getStartState: getStartState,
  getEntryStateForNoteType: getEntryStateForNoteType
}

module.exports = Session;
