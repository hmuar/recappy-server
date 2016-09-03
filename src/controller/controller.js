import Immut from 'immutable';
import DBAssist from '../db/note_assistant';
import PipeSession from './pipe_session';

// `msg` = {
//   timestamp  : ""
//   senderID   : "",
//   userID     : ObjectID,
//   text       : "",
//   action     : ""
// }

class Controller {

  constructor(adapter) {
    this.adapter = adapter;
  }

  // check if key property added to msg and
  // corresponding value is not undefined and not null
  // `msg` is Immut.Map
  pipeSuccess(mState, key) {
    return mState.has(key) && mState.get(key) != null;
  }

  // convert adapter specific sender id into app user id
  pipeUser(mState) {
    return this.adapter.senderToUser(mState);
  }

  // main entry method called by external adapters
  // `msg` is Immut.Map
  registerMsg(msg) {
    return DBAssist.getCategoryByName('subject', msg.get('subjectName'))
    .then(subject => {
      if (!subject) {
        throw new Error(`Could not find subject ${msg.get('subjectName')}`);
      } else {
        let mState = Immut.Map(msg);
        mState = mState.set('subjectID', subject._id);
        // convert adapter specific sender id into app user
        return this.pipeUser(mState)
        // at this point should have app user information
        .then(state => PipeSession.pipe(state))
        // at this point should have session information
        .then(state => (
          // need to evaluate msg in context of current state
          state
        ));
      }
    });
  }

}


export default Controller;
