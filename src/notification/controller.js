// Controller for notifications
import pipeAddSession from '~/controller/pipe_add_session';
import pipeAdvanceStateDated from '~/controller/pipe_advance_state_dated';
import pipeSaveSession from '~/controller/pipe_save_session';
import pipeAddPaths from '~/controller/pipe_add_paths';

export default class NotificationController {
  constructor(adapter) {
    this.adapter = adapter;
  }

  sendResponse(state) {
    // return state;
    return this.adapter.sendResponse(state);
  }

  /*
  1. get next scheduled hook for given user
  - look for next concept with globalIndex greater than current index AND
    expireDate less than current date
  2. send hook to user

  sendInfo {
    subjectID
    senderID
    userID
  }
  */
  send(sendInfo) {
    const appState = sendInfo;
    return (
      pipeAddSession(appState)
        // at this point should have session information
        // advance session state
        .then(state => pipeAdvanceStateDated(state))
        .then(state => pipeAddPaths(state))
        // record new session state
        .then(state => pipeSaveSession(state))
        // .then(state => this.logCurrentState(state))
        .then(state => this.sendResponse(state))
      // don't include this in return chain because this final update
      // can happen asynchronously
      // pipeStudentModel(state);
      // state
    );
  }
}
