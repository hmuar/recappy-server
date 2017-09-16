import { getEntryStateForNoteType } from '~/core/session_state';
import { getNewMaterial } from '~/core/scheduler';

function advanceToNextDatedConcept(appState) {
  const expireDate = appState.expireDate || new Date();
  const { subjectID, session, } = appState;
  const { noteQueue, } = session;
  const targetGlobalIndex = appState.session.nextGlobalIndex;

  return getNewMaterial(subjectID, 1, targetGlobalIndex, [], expireDate).then(notesInfo => {
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
        newConceptFound: true,
        session: {
          ...session,
          noteQueue: nextNotes,
          queueIndex: 0,
          globalIndex: notesInfo.globalIndex,
          nextGlobalIndex: notesInfo.nextGlobalIndex,
          baseQueueLength: noteQueue.length,
          state: getEntryStateForNoteType(noteQueue[session.queueIndex].type),
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
