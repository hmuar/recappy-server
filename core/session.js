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

var Session = {
  SessionState: SessionState
}

module.exports = Session;
