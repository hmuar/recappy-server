import { SessionState, getEntryStateForNoteType } from '~/core/session_state';
import { getNewMaterialWithExpireDate, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { EvalStatus, isFailResponse, hasWaitedMinHours } from '~/core/eval';

function advanceToNextDatedConcept(appState, _expireDate) {
  const expireDate = _expireDate || new Date();
  const { userID, subjectID, session, } = appState;
  const { noteQueue, } = session;
  const targetGlobalIndex = appState.session.nextGlobalIndex;

  return getNewMaterialWithExpireDate(
    // userID,
    subjectID,
    expireDate,
    targetGlobalIndex
  ).then(notesInfo => {
    const nextNotes = notesInfo.notes;
    if (nextNotes && nextNotes.length > 0) {
      // MUTATE session's noteQueue by inserting new notes into location
      // of current queueIndex so that if user were to continue session,
      // queueIndex now points to the new notes that have been spliced in
      // at that location.
      noteQueue.splice(session.queueIndex, 0, ...nextNotes);
      return {
        ...appState,
        // postEvalState: null,
        session: {
          ...session,
          // noteQueue: newQueue,
          // queueIndex: 0,
          globalIndex: notesInfo.globalIndex,
          nextGlobalIndex: notesInfo.nextGlobalIndex,
          baseQueueLength: noteQueue.length,
          state: getEntryStateForNoteType(noteQueue[session.queueIndex].type),
          startSessionTime: new Date(),
        },
      };
    }
    // return {
    //   ...appState,
    //   // postEvalState: null,
    //   session: {
    //     ...appState.session,
    //     noteQueue: [],
    //     queueIndex: 0,
    //     globalIndex: notesInfo.globalIndex,
    //     nextGlobalIndex: notesInfo.nextGlobalIndex,
    //     baseQueueLength: 0,
    //     state: SessionState.DONE_QUEUE,
    //     startSessionTime: new Date(),
    //   },
    // };
    return appState;
  });
}

export default function pipe(appState, _expireDate) {
  const expireDate = _expireDate || appState.expireDate || new Date();
  const nextAppState = advanceToNextDatedConcept(appState, expireDate);
  return nextAppState;
}
