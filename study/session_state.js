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

function getStartState() {
  return SessionState.INIT;
}

let Session = {
  SessionState: SessionState,
  getStartState: getStartState
}

module.exports = Session;
