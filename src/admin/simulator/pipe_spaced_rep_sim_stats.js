/**

 Depends on a simRecordID field being set by pipe_record_sim_stats

**/

import { Simulation, NoteRecord } from '~/db/collection';

function getAllNoteRecords(userID, subjectID) {
  // dont query info notes
  return NoteRecord.find({
    userID,
    subjectParent: subjectID,
    noteType: { $ne: 'info', },
  });
}

function updateSimRecord(appState) {
  const { userID, subjectID, simRecordID, } = appState;
  return getAllNoteRecords(userID, subjectID).then(recs =>
    Simulation.findByIdAndUpdate(simRecordID, {
      $set: { noteRecords: recs, },
    }));
}

export default function pipe(appState) {
  if (appState.simRecordID) {
    console.log('simRecordID found - updating records ');
    return updateSimRecord(appState).then(() => appState);
  }
  return appState;
}
