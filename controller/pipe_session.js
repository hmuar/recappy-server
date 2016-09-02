import DBAssist from '../db/note_assistant';
import SessionAssist from '../db/session_assistant';
import { getStartingNotes,
         TARGET_NUM_NOTES_IN_SESSION } from '../core/scheduler.js';

function addNewSession(mState) {
  // get new notes
  let subjectID = mState.get('subjectID');
  let userID = mState.get('userID');

  return getStartingNotes(subjectID,
                                    TARGET_NUM_NOTES_IN_SESSION)
  .then(noteQueue => {
    let startNoteIndex = 0;
    let startGlobalIndex = 0;
    return SessionAssist.createSession(userID,
                                      subjectID,
                                      startNoteIndex,
                                      noteQueue,
                                      startGlobalIndex)
  }).then(session => {
    return mState.set('session', session);
  })
}

// find existing user session for given subject and set `session` key
// to session object. If no session exists, create new session first.
// `mState` is Immut.Map
// return Immut.Map
function pipe(mState) {
  // if(!mState.get('text') && ! mState.get('action')) {
  //   return Promise.reject("No text or action included in message");
  // }
  return SessionAssist.getSessionForUserAndSubject(
                          mState.get('userID'),
                          mState.get('subjectID'))
  .then(session => {
    if(!session) {
      return addNewSession(mState);
    }
    else {
      return mState.set('session', session);
    }
  });
}

let PipeSession = {
  pipe
}

export default PipeSession;
