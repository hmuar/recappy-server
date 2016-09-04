import SessionAssist from '../db/session_assistant';
import { getStartingNotes,
         TARGET_NUM_NOTES_IN_SESSION } from '../core/scheduler.js';

function addNewSession(mState) {
  // get new notes
  const subjectID = mState.subjectID;
  const userID = mState.userID;

  return getStartingNotes(subjectID,
                                    TARGET_NUM_NOTES_IN_SESSION)
  .then(noteQueue => {
    const startNoteIndex = 0;
    const startGlobalIndex = 0;
    return SessionAssist.createSession(userID,
                                      subjectID,
                                      startNoteIndex,
                                      noteQueue,
                                      startGlobalIndex);
  }).then(session => (
    {
      ...mState,
      session,
    }
  ));
}

// find existing user session for given subject and set `session` key
// to session object. If no session exists, create new session first.
function pipe(mState) {
  return SessionAssist.getSessionForUserAndSubject(
                          mState.userID,
                          mState.subjectID)
  .then(session => {
    if (!session) {
      return addNewSession(mState);
    }
    return {
      ...mState,
      session,
    };
  });
}

const PipeSession = {
  pipe,
};

export default PipeSession;
