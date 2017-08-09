// Controller for notifications
import DBAssist from '~/db/category_assistant';
import Input from '~/core/input';
import { updateFacebookUserDetails } from '~/account';
import { log, logErr, logState } from '~/logger';
import pipeAddSession from './pipe_add_session';
import pipeRecord from './pipe_record';
import pipeEval from './pipe_eval';
import pipeAdvanceState from './pipe_advance_state';
import pipeSaveSession from './pipe_save_session';
import pipeStudentModel from './pipe_student_model';
import pipeAdjustQueue from './pipe_adjust_queue';
import pipeAddPaths from './pipe_add_paths';

export default class NotificationController {
  constructor(adapter) {
    this.adapter = adapter;
  }
  pipeUser(appState) {
    return this.adapter.senderToUser(appState);
  }
  sendMsg(msg) {
    return DBAssist.getCategoryByName('subject', msg.subjectName)
      .then(subject => {
        if (!subject) {
          throw new Error(`Could not find subject ${msg.subjectName}`);
        } else {
          const appState = {
            ...msg,
            subjectID: subject._id,
          };
          // convert adapter specific sender id into app user
          return (
            this.pipeUser(appState)
              // at this point should have app user information
              .then(state => pipeAddSession(state))
              // at this point should have session information
              // need to evaluate msg in context of current state
              .then(state => pipeEval(state))
              .then(state => this.sendFeedbackResponse(state))
              // persist results of msg evaluation
              .then(state => pipeRecord(state))
              // adjust queue based on evaluation
              .then(state => pipeAdjustQueue(state))
              // advance session state
              .then(state => pipeAdvanceState(state))
              .then(state => pipeAddPaths(state))
              // record new session state
              .then(state => pipeSaveSession(state))
              .then(state => this.logCurrentState(state))
              .then(state => {
                // don't include this in return chain because this final update
                // can happen asynchronously
                pipeStudentModel(state);
                return this.sendResponse(state);
              })
          );
        }
      })
      .catch(err => {
        logErr('error registering message in controller');
        logErr(err);
      });
  }
}
