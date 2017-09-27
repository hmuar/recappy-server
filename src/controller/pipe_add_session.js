import { createSession, getSessionForUserAndSubject } from '~/db/session_assistant';
import { getStartingNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler.js';
import { logErr } from '~/logger';

function addNewSession(appState, startNotes = null) {
  // get new notes
  const subjectID = appState.subjectID;
  const userID = appState.userID;

  if (!subjectID || !userID) {
    return appState;
  }

  // use specific start notes given instead of trying to determine
  // starting note queue dynamically
  if (startNotes !== null) {
    const startNoteIndex = 0;
    const startGlobalIndex = 0;
    const nextGlobalIndex = startGlobalIndex;
    return createSession(
      userID,
      subjectID,
      startNoteIndex,
      startNotes,
      startGlobalIndex,
      nextGlobalIndex,
      startNotes.length
    ).then(session => ({
      ...appState,
      session,
    }));
  }

  // find notes dynamically to determine initial note queue
  return getStartingNotes(
    subjectID,
    TARGET_NUM_NOTES_IN_SESSION,
    appState.expireDate,
    appState.publishDate
  )
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
export default function pipe(appState, startNotes = null) {
  if (!appState.userID || !appState.subjectID) {
    return Promise.resolve(appState);
  }
  return getSessionForUserAndSubject(appState.userID, appState.subjectID)
    .then(session => {
      if (!session) {
        return addNewSession(appState, startNotes);
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
