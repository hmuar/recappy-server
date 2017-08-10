// Controller for notifications
import DBAssist from '~/db/category_assistant';
import { log, logErr, logState } from '~/logger';
import pipeAddSession from '~/controller/pipe_add_session';
import pipeRecord from '~/controller/pipe_record';
import pipeEval from '~/controller/pipe_eval';
import pipeAdvanceState from '~/controller/pipe_advance_state';
import pipeSaveSession from '~/controller/pipe_save_session';
import pipeStudentModel from '~/controller/pipe_student_model';
import pipeAdjustQueue from '~/controller/pipe_adjust_queue';
import pipeAddPaths from '~/controller/pipe_add_paths';

export default class NotificationController {
  constructor(adapter) {
    this.adapter = adapter;
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
    return pipeAddSession(appState).then(state => {
      console.log(state);
      return state;
    });
    // at this point should have session information
    // // advance session state
    // .then(state => pipeAdvanceState(state))
    // .then(state => pipeAddPaths(state))
    // // record new session state
    // .then(state => pipeSaveSession(state))
    // .then(state => this.logCurrentState(state))
    // .then(state => {
    //   // don't include this in return chain because this final update
    //   // can happen asynchronously
    //   pipeStudentModel(state);
    //   return this.sendResponse(state);
    // })
  }
}
