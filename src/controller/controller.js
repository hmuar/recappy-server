import { gifSuccessProb } from '~/core/hyperparam';
import DBAssist from '~/db/category_assistant';
import Input from '~/core/input';
import { updateFacebookUserDetails } from '~/account';
import { log, logErr, logState } from '~/logger';
// import { shouldHandleMsg } from '~/db/message_queue_assistant';
import pipeAddSession from './pipe_add_session';
import pipeRecord from './pipe_record';
import pipeEval from './pipe_eval';
import pipeAdvanceState from './pipe_advance_state';
import pipeSaveSession from './pipe_save_session';
import pipeStudentModel from './pipe_student_model';
import pipeAdjustQueue from './pipe_adjust_queue';
import pipeAddPaths from './pipe_add_paths';

import { sendText } from '~/adapter/fbmessenger/fbmessenger_request';

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
    return this.adapter
      .senderToUser(appState)
      .then(newState => {
        // create a new user if user could not be found
        if (!newState.userID) {
          return this.adapter.createUser(newState).then(state => ({
            ...state,
            newUser: true,
          }));
        }
        return newState;
      })
      .then(state => {
        // check if initializing user. if so, grab user details
        if (state.newUser) {
          this.adapter
            .getUserDetails(appState.senderID)
            // XXX: this code needs to be factored out into adapter specific
            .then(userDetails => updateFacebookUserDetails(appState.senderID, userDetails));
        }
        return state;
      });
  }

  transformInput(appState) {
    // if (this.adapter.transformInput) {
    //   return this.adapter.transformInput(appState);
    // }
    return appState;
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
    // return state;
    return this.adapter.sendResponse(state);
  }

  sendFeedbackResponse(state) {
    const withSuccessMedia = Math.random() < gifSuccessProb;
    return this.adapter.sendFeedbackResponse(state, withSuccessMedia);
  }

  logCurrentState(state) {
    return logState(state);
  }

  // main entry method called by external adapters
  registerMsg(msg) {
    // If input is just a request to change setting, don't go through
    // normal controller flow.

    return this.pipeUser(msg).then(state =>
      sendText(
        state,
        "Hi! I'm no longer providing current events for now. I'm a big break contemplating my existence as a little green bot that likes news. I may or may not be back :("
      )
    );

    if (msg.input && msg.input.type === Input.Type.SETTING) {
      const appState = msg;
      return this.adapter.changeSetting(appState).then(state => this.sendResponse(state));
    }

    return DBAssist.getCategoryByName('subject', msg.subjectName)
      .then(subject => {
        if (!subject) {
          throw new Error(`Could not find subject ${msg.subjectName}`);
        } else {
          const appState = {
            ...msg,
            subjectID: subject._id,
            // TODO: find different way to merge in an expire date
            publishDate: msg.subjectName === 'news' ? new Date() : null,
            expireDate: msg.subjectName === 'news' ? new Date() : null,
          };
          // convert adapter specific sender id into app user
          return (
            this.pipeUser(appState)
              // at this point should have app user information
              // .then(state => {
              //   // If previous msg is still pending, do NOT handle this message
              //   // It means multiple messages were sent at once
              //   const { userID, subjectID, timestamp, } = state;
              //   return shouldHandleMsg(userID, subjectID, timestamp).then(shouldHandle => {
              //     if (shouldHandle) {
              //       return state;
              //     }
              //     return Promise.reject(
              //       'Previous pending message not finished sending, ignoring current user message.'
              //     );
              //   });
              // })
              .then(state => pipeAddSession(state))
              // at this point should have session information
              .then(state => this.transformInput(state))
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
              // .then(state => this.logCurrentState(state))
              .then(state => {
                // don't include this in return chain because this final update
                // can happen asynchronously
                pipeStudentModel(state);
                return this.sendResponse(state);
              })
              .catch(err => {
                logErr(err);
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
