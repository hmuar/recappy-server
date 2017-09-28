import { getEntryStateForNoteType } from '~/core/session_state';
import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';

function advanceToNextDatedConcept(appState) {
  const curDate = new Date();
  const expireDate = appState.expireDate || curDate;
  const { subjectID, session, publishDate, userID, } = appState;
  const targetGlobalIndex = appState.session.nextGlobalIndex;

  return getNextNotes(
    userID,
    subjectID,
    targetGlobalIndex,
    TARGET_NUM_NOTES_IN_SESSION,
    curDate,
    expireDate,
    publishDate
  ).then(notesInfo => {
    // return getNewMaterial(
    //   subjectID,
    //   1,
    //   targetGlobalIndex,
    //   [],
    //   expireDate,
    //   publishDate
    // ).then(notesInfo => {
    const nextNotes = notesInfo.notes;
    const { numNewNotes, } = notesInfo;
    if (nextNotes && nextNotes.length > 0) {
      // MUTATE session's noteQueue by inserting new notes into location
      // of current queueIndex so that if user were to continue session,
      // queueIndex now points to the new notes that have been spliced in
      // at that location.
      // noteQueue.splice(session.queueIndex, 0, ...nextNotes);
      return {
        ...appState,
        // postEvalState: null,
        newConceptFound: numNewNotes > 0,
        session: {
          ...session,
          noteQueue: nextNotes,
          queueIndex: 0,
          globalIndex: notesInfo.globalIndex,
          nextGlobalIndex: notesInfo.nextGlobalIndex,
          baseQueueLength: numNewNotes,
          state: getEntryStateForNoteType(nextNotes[0].type),
          startSessionTime: new Date(),
        },
      };
    }
    // if (nextNotes && nextNotes.length > 0) {
    //   // MUTATE session's noteQueue by inserting new notes into location
    //   // of current queueIndex so that if user were to continue session,
    //   // queueIndex now points to the new notes that have been spliced in
    //   // at that location.
    //   noteQueue.splice(session.queueIndex, 0, ...nextNotes);
    //   return {
    //     ...appState,
    //     // postEvalState: null,
    //     newConceptFound: true,
    //     session: {
    //       ...session,
    //       // noteQueue: newQueue,
    //       // queueIndex: 0,
    //       globalIndex: notesInfo.globalIndex,
    //       nextGlobalIndex: notesInfo.nextGlobalIndex,
    //       baseQueueLength: noteQueue.length,
    //       state: getEntryStateForNoteType(noteQueue[session.queueIndex].type),
    //       startSessionTime: new Date(),
    //     },
    //   };
    // }
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
    return {
      ...appState,
      newConceptFound: false,
    };
  });
}

export default function pipe(appState) {
  const nextAppState = advanceToNextDatedConcept(appState);
  return nextAppState;
}
