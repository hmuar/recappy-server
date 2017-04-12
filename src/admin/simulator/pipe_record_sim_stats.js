import { Simulation, NoteRecord } from '~/db/collection';
import { SessionState } from '~/core/session_state';

function getAllDueMaterial(userID, subjectID, dueDate) {
  const dateCutoff = dueDate || new Date();
  // dont query info notes
  return NoteRecord.find({
    userID,
    subjectParent: subjectID,
    due: { $lte: dateCutoff, },
    noteType: { $ne: 'info', },
  });
}

function getBacklogCount(appState) {
  const { userID, subjectID, session, } = appState;
  const dayOffset = session.simulator.dayOffset;
  const cutoffDate = new Date(appState.timestamp);
  cutoffDate.setDate(cutoffDate.getDate() + dayOffset);
  return getAllDueMaterial(userID, subjectID, cutoffDate).then(notes => notes ? notes.length : 0);
}

function createNewSimRecord(appState) {
  // only record when done with current queue
  if (appState.session.state !== SessionState.DONE_QUEUE) {
    return Promise.resolve(appState);
  }

  return getBacklogCount(appState).then(backlogCount => {
    const newRecord = {
      userID: appState.userID,
      createdAt: appState.timestamp,
      backlogCount,
      appState,
    };
    return Simulation.create(newRecord);
  });
}

export default function pipe(appState) {
  return createNewSimRecord(appState).then(() => appState);
}
