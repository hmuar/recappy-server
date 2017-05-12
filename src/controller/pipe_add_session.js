import { createSession, getSessionForUserAndSubject } from '~/db/session_assistant';
import { getStartingNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler.js';
import { logErr } from '~/logger';

function addNewSession(appState) {
  // get new notes
  const subjectID = appState.subjectID;
  const userID = appState.userID;

  if (!subjectID || !userID) {
    return appState;
  }

  return getStartingNotes(subjectID, TARGET_NUM_NOTES_IN_SESSION)
    .then(notesInfo => {
      const noteQueue = notesInfo.notes;
      const startNoteIndex = 0;
      return createSession(
        userID,
        subjectID,
        startNoteIndex,
        noteQueue,
        notesInfo.globalIndex,
        notesInfo.nextGlobalIndex,
        noteQueue.length
      );
    })
    .then(session => ({
      ...appState,
      session,
    }));
}

// find existing user session for given subject and set `session` key
// to session object. If no session exists, create new session first.
export default function pipe(appState) {
  if (!appState.userID || !appState.subjectID) {
    return Promise.resolve(appState);
  }
  return getSessionForUserAndSubject(appState.userID, appState.subjectID)
    .then(session => {
      if (!session) {
        return addNewSession(appState);
      }
      return {
        ...appState,
        session,
      };
    })
    .catch(err => {
      logErr(`Error finding session for user ${appState.userID}`);
      logErr(err);
      return Promise.resolve(appState);
    });
}
