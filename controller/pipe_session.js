const DBAssist = require('../db/db_assistant');
const StudySession = require('../study/session');
const Scheduler = require('../core/scheduler.js')

function addNewSession(mState) {
  // get new notes
  let subjectID = mState.get('subjectID');
  let userID = mState.get('userID');

  return Scheduler.getStartingNotes(subjectID,
                                    Scheduler.TARGET_NUM_NOTES_IN_SESSION)
  .then(noteQueue => {
    let startNoteIndex = 0;
    let startGlobalIndex = 0;
    return StudySession.createSession(userID,
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
  return StudySession.getSessionForUserAndSubject(
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
  pipe: pipe
}

module.exports = PipeSession;
