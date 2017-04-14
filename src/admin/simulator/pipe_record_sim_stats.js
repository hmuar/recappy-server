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
  const dayOffset = session.simulator.dayOffset;
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
  const { baseQueueLength, noteQueue, simulator, } = session;
  const newNotes = noteQueue.slice(0, baseQueueLength).filter(n => n.queueStatus === 'new');
  const oldNotesSeen = simulator.notesSeen ? simulator.notesSeen : 0;
  const notesSeen = oldNotesSeen + newNotes.length;

  return getBacklogCount(appState)
    .then(backlogCount => {
      const newRecord = {
        userID: appState.userID,
        createdAt: appState.timestamp,
        backlogCount,
        notesSeen,
        step: simulator.step,
        noteGlobalIndexes: newNotes.map(note => note.globalIndex),
        appState,
      };
      return Simulation.create(newRecord);
    })
    .then(record => ({
      // pass notesSeen value from newRecord
      ...appState,
      simRecordID: record._id,
      session: {
        ...appState.session,
        simulator: {
          ...appState.session.simulator,
          notesSeen,
        },
      },
    }));
}

export default function pipe(appState) {
  if (
    appState.preEvalState !== SessionState.DONE_QUEUE &&
    appState.postEvalState !== SessionState.START_QUEUE
  ) {
    return appState;
  }
  return createNewSimRecord(appState);
}
