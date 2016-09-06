import DBAssist from '../db/category_assistant';
import pipeAddSession from './pipe_add_session';
import pipeRecord from './pipe_record';
import pipeEval from './pipe_eval';
import pipeAdvanceState from './pipe_advance_state';
import pipeSaveSession from './pipe_save_session';

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
    return this.adapter.senderToUser(mState);
  }

  debugDBAssist(msg) {
    DBAssist.getCategoryByName('subject', msg.subjectName)
    .then((subject) => {
      console.log(subject);
    })
    .catch((err) => {
      console.log('error finding category by name');
      console.log(err);
    });
  }

  // main entry method called by external adapters
  registerMsg(msg) {
    console.log('controller registerMsg');
    return DBAssist.getCategoryByName('subject', msg.subjectName)
    .then(subject => {
      console.log('found subject');
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
        .then(state => {
          console.log('added session');
          console.log(state);
          return state;
        })
        // at this point should have session information
        // need to evaluate msg in context of current state
        .then(state => pipeEval(state))
        .then(state => {
          console.log('added eval');
          console.log(state);
          return state;
        })
        // persist results of msg evaluation
        .then(state => pipeRecord(state))
        .then(state => {
          console.log('added record');
          console.log(state);
          return state;
        })
        // advance session state
        .then(state => pipeAdvanceState(state))
        .then(state => {
          console.log('added advance state');
          console.log(state);
          return state;
        })
        // record new session state
        .then(state => pipeSaveSession(state))
        .then(state => {
          console.log('added save session');
          console.log(state);
          return state;
        });
      }
    })
    .catch((err) => {
      console.log('error registering message in controller');
      console.log(err);
    });
  }

  sendMessage(senderID, msg) {
    this.adapter.sendMessage(senderID, msg);
  }

}
