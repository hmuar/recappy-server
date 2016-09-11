import DBAssist from '../db/category_assistant';
import pipeAddSession from './pipe_add_session';
import pipeRecord from './pipe_record';
import pipeEval from './pipe_eval';
import pipeAdvanceState from './pipe_advance_state';
import pipeSaveSession from './pipe_save_session';
import { log, logErr, logState } from '../logger';

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
  pipeSuccess(mState, key) {
    return {}.hasOwnProperty.call(mState, key) &&
           mState[key] != null;
  }

  // convert adapter specific sender id into app user id
  pipeUser(mState) {
    return this.adapter.senderToUser(mState).then(newState => {
      // create a new user if user could not be found
      if (!newState.userID) {
        return this.adapter.createUser(newState);
      }
      return newState;
    });
    // return this.adapter.senderToUser(mState);
  }

  debugDBAssist(msg) {
    DBAssist.getCategoryByName('subject', msg.subjectName)
    .then((subject) => {
      log(subject);
    })
    .catch((err) => {
      logErr('error finding category by name');
      logErr(err);
    });
  }

  sendResponse(state) {
    this.adapter.sendResponse(state);
    return state;
  }

  sendFeedbackResponse(state) {
    this.adapter.sendFeedbackResponse(state);
    return state;
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
        return this.pipeUser(appState)
        // at this point should have app user information
        .then(state => pipeAddSession(state))
        // at this point should have session information
        // need to evaluate msg in context of current state
        .then(state => pipeEval(state))
        .then(state => this.sendFeedbackResponse(state))
        // persist results of msg evaluation
        .then(state => pipeRecord(state))
        // advance session state
        .then(state => pipeAdvanceState(state))
        // record new session state
        .then(state => pipeSaveSession(state))
        .then(state => logState(state))
        .then(state => this.sendResponse(state));
      }
    })
    .catch((err) => {
      logErr('error registering message in controller');
      logErr(err);
    });
  }

}
