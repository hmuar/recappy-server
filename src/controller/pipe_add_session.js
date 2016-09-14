import { createSession,
         getSessionForUserAndSubject } from '~/db/session_assistant';
import { getStartingNotes,
         TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler.js';
import { logErr } from '~/logger';

function addNewSession(appState) {
  // get new notes
  const subjectID = appState.subjectID;
  const userID = appState.userID;

  return getStartingNotes(subjectID, TARGET_NUM_NOTES_IN_SESSION)
  .then(noteQueue => {
    const startNoteIndex = 0;
    const startGlobalIndex = 0;
    return createSession(userID,
                        subjectID,
                        startNoteIndex,
                        noteQueue,
                        startGlobalIndex);
  }).then(session => (
    {
      ...appState,
      session,
    }
  ));
}

// find existing user session for given subject and set `session` key
// to session object. If no session exists, create new session first.
export default function pipe(appState) {
  return getSessionForUserAndSubject(
                          appState.userID,
                          appState.subjectID)
  .then(session => {
    if (!session) {
      return addNewSession(appState);
    }
    return {
      ...appState,
      session,
    };
  })
  .catch((err) => {
    logErr(`Error finding session for user ${appState.userID}`);
    logErr(err);
    return appState;
  });
}
