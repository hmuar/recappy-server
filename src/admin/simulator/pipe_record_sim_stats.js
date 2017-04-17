import { Simulation, NoteRecord } from '~/db/collection';
import { SessionState } from '~/core/session_state';

function getAllDueMaterial(userID, subjectID, cutoffDate) {
  // dont query info notes
  return NoteRecord.find({
    userID,
    subjectParent: subjectID,
    due: { $lte: cutoffDate, },
    noteType: { $ne: 'info', },
  });
}

export function getBacklogCount(appState) {
  const { userID, subjectID, session, } = appState;
  // need to increment dayOffset here to anticipate the advance in state
  // that will happen later in pipeAdvanceSimState
  const dayOffset = session.simulator.dayOffset + 1;
  let cutoffDate;
  if (appState.timestamp) {
    cutoffDate = new Date(appState.timestamp);
  } else {
    cutoffDate = new Date();
  }
  cutoffDate.setDate(cutoffDate.getDate() + dayOffset);
  return getAllDueMaterial(userID, subjectID, cutoffDate).then(notes => notes ? notes.length : 0);
}

function createNewSimRecord(appState) {
  // update seenNotes count
  const { session, } = appState;
  const { simulator, } = session;
  // const newNotes = noteQueue.slice(0, baseQueueLength).filter(n => n.queueStatus === 'new');
  // const oldNotesSeen = simulator.notesSeen ? simulator.notesSeen : 0;
  // const notesSeen = oldNotesSeen + newNotes.length;

  return getBacklogCount(appState)
    .then(backlogCount => {
      // we do not want to store simRecords as part of session in db,
      // this is only an in-memory data ref
      const { simRecords, ...keepSession } = appState.session;
      const newRecord = {
        userID: appState.userID,
        createdAt: appState.timestamp,
        backlogCount,
        step: simulator.step,
        appState: {
          ...appState,
          session: {
            ...keepSession,
          },
        },
      };
      // return Simulation.create(newRecord);
      return newRecord;
    })
    .then(record => {
      const simRecs = session.simRecords ? session.simRecords : {};
      return {
        // pass notesSeen value from newRecord
        ...appState,
        // simRecordID: record._id,
        session: {
          ...appState.session,
          simulator: {
            ...appState.session.simulator,
          },
          simRecords: {
            ...simRecs,
            [simulator.step]: record,
          },
        },
      };
    });
}

export default function pipe(appState, force = false) {
  if (
    !force &&
    appState.session.state !== SessionState.DONE_QUEUE &&
    appState.session.state !== SessionState.INIT
  ) {
    return appState;
  }
  return createNewSimRecord(appState);
}
