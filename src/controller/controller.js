import DBAssist from '~/db/category_assistant';
import { log, logErr, logState } from '~/logger';
import pipeAddSession from './pipe_add_session';
import pipeRecord from './pipe_record';
import pipeEval from './pipe_eval';
import pipeAdvanceState from './pipe_advance_state';
import pipeSaveSession from './pipe_save_session';
import pipeStudentModel from './pipe_student_model';
import pipeAdjustQueue from './pipe_adjust_queue';
import pipeAddPaths from './pipe_add_paths';

// `msg` = {
//   timestamp  : ""
//   senderID   : "",
//   userID     : ObjectID,
//   text       : "",
//   action     : ""
// }

export default class Controller {
  constructor(adapter) {
    this.adapter = adapter;
  }

  // check if key property added to msg and
  // corresponding value is not undefined and not null
  pipeSuccess(appState, key) {
    return {}.hasOwnProperty.call(appState, key) && appState[key] != null;
  }

  // convert adapter specific sender id into app user id
  pipeUser(appState) {
    return this.adapter.senderToUser(appState).then(newState => {
      // create a new user if user could not be found
      if (!newState.userID) {
        return this.adapter.createUser(newState);
      }
      return newState;
    });
    // return this.adapter.senderToUser(appState);
  }

  debugDBAssist(msg) {
    DBAssist.getCategoryByName('subject', msg.subjectName)
      .then(subject => {
        log(subject);
      })
      .catch(err => {
        logErr('error finding category by name');
        logErr(err);
      });
  }

  sendResponse(state) {
    console.log('--- Controller send response ----');
    // return state;
    return this.adapter.sendResponse(state);
  }

  sendFeedbackResponse(state) {
    console.log('--- Controller sendFeedbackResponse ------');
    // return state;
    return this.adapter.sendFeedbackResponse(state);
  }

  // main entry method called by external adapters
  registerMsg(msg) {
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
              .then(state => logState(state))
              // record new session state
              .then(state => pipeSaveSession(state))
              // .then(state => logState(state))
              .then(state => {
                // don't include this in return chain because this final udpate
                // can happen asynchronously
                pipeStudentModel(state);
                console.log(state);
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
