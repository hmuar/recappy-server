import { SessionState, getEntryStateForNoteType } from '~/core/session_state';
import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { EvalStatus, isFailResponse, hasWaitedMinHours } from '~/core/eval';

// Given current info in app state, determine next study state for user.
// Only need to look at current session state to determine next state.

// set current app state as the pre eval state
function advanceToNextDatedConcept(appState, _expireDate) {
  const expireDate = _expireDate || new Date();
  const { userID, subjectID, } = appState;
  const targetGlobalIndex = appState.session.globalIndex;

  return getNextNotes(
    userID,
    subjectID,
    nextGlobalIndex,
    TARGET_NUM_NOTES_IN_SESSION,
    cutoffDate
  ).then(notesInfo => {
    const nextNotes = notesInfo.notes;
    if (nextNotes && nextNotes.length > 0) {
      return {
        ...appState,
        // postEvalState: null,
        session: {
          ...appState.session,
          noteQueue: nextNotes,
          queueIndex: 0,
          globalIndex: notesInfo.globalIndex,
          nextGlobalIndex: notesInfo.nextGlobalIndex,
          baseQueueLength: nextNotes.length,
          state: getEntryStateForNoteType(nextNotes[0].type),
          startSessionTime: new Date(),
        },
      };
    }
    // no new notes exist in entire subject, user has finished EVERYTHING.
    // TODO: add a new session state to handle this situation
    return {
      ...appState,
      // postEvalState: null,
      session: {
        ...appState.session,
        noteQueue: [],
        queueIndex: 0,
        globalIndex: notesInfo.globalIndex,
        nextGlobalIndex: notesInfo.nextGlobalIndex,
        baseQueueLength: 0,
        state: SessionState.DONE_QUEUE,
        startSessionTime: new Date(),
      },
    };
    // return appState;
  });
}

export default function pipe(appState) {
  const expireDate = new Date();
  const nextAppState = advanceToNextDatedConcept(appState, expireDate);
  return nextAppState;
}
