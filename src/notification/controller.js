// Controller for notifications
import pipeAddSession from '~/controller/pipe_add_session';
import pipeAdvanceStateDated from '~/controller/pipe_advance_state_dated';
import pipeSaveSession from '~/controller/pipe_save_session';
import pipeAddPaths from '~/controller/pipe_add_paths';
import { SessionState } from '~/core/session_state';

export default class NotificationController {
  constructor(adapter) {
    this.adapter = adapter;
  }

  sendResponse(state) {
    const session = state.session;
    // only send response if session has notes and is not done
    if (
      session.noteQueue &&
      session.noteQueue.length &&
      session.state !== SessionState.DONE_QUEUE
    ) {
      return this.adapter.sendNotificationResponse(state);
    }
    return state;
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
        .then(state => (state.newConceptFound ? pipeAddPaths(state) : state))
        // record new session state
        .then(state => (state.newConceptFound ? pipeSaveSession(state) : state))
        // .then(state => this.logCurrentState(state))
        .then(state => {
          if (state.newConceptFound) {
            console.log(`[Notify] user ${sendInfo.firstName} ${sendInfo.lastName}`);
            return this.sendResponse(state);
          }
          console.log(`---[SKIP] user ${sendInfo.firstName} ${sendInfo.lastName}`);
          return state;
        })
    );
  }
}
